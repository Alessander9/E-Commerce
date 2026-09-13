# 📏 Business Rules — Cleo Platform

> Reglas de negocio para stock, pedidos, pagos, envíos y cupones de **Cleo Platform**.

---

## 1. Reglas de Inventario

### 1.1 Modelo de Stock

```
Stock Total = available_stock + reserved_stock
```

- **available_stock**: unidades disponibles para nuevos pedidos
- **reserved_stock**: unidades reservadas por pedidos pagos/en proceso
- **minimum_stock**: umbral de alerta (default: 5)

### 1.2 Reserva de Stock

Al crear un pedido, el stock se reserva automáticamente:

```
Reservación (al crear pedido):
  available_stock -= quantity
  reserved_stock  += quantity

Confirmación (al recibir pago):
  reserved_stock  -= quantity  (stock "muere" — ya no está disponible)

Liberación (pedido cancelado/no pagado):
  available_stock += quantity
  reserved_stock  -= quantity
```

### 1.3 Prevención de Sobreventas

El sistema verifica stock **antes** de cada reserva:

```typescript
if (variant.inventory.availableStock < requestedQuantity) {
  throw new BadRequestException('Stock insuficiente');
}
```

### 1.4 Liberación Automática de Stock

Un **Cron Job** ejecuta cada 5 minutos:

1. Busca pedidos con status `PENDING_PAYMENT` y `payment_status = PENDING`
2. Si el pedido tiene **más de 30 minutos** de antigüedad:
   - Libera el stock reservado
   - Cancela el pedido automáticamente
   - Registra movimiento `RELEASE` en inventario
   - Registra en `ORDER_STATUS_HISTORY`

### 1.5 Tipos de Movimiento de Inventario

| Tipo | Dirección | Descripción |
|------|-----------|-------------|
| `PURCHASE` | ↑ Entrada | Ingreso de proveedor |
| `SALE` | ↓ Salida | Venta confirmada (pago recibido) |
| `RESERVATION` | ↔ Reserva | Reserva temporal al crear pedido |
| `RELEASE` | ↔ Liberación | Liberación por cancelación/no pago |
| `RETURN` | ↑ Entrada | Devolución de cliente |
| `ADJUSTMENT` | ↑↓ Bidireccional | Corrección manual |
| `MERMAS` | ↓ Salida | Merma/deterioro |

### 1.6 Reglas de Movimientos Manuales

| Regla | Validación |
|-------|-----------|
| Mermas | Cantidad debe ser negativa |
| Mermas | No puede exceder `available_stock` |
| Ajustes | Resultado no puede ser negativo |
| Compras | Cantidad debe ser positiva |
| Devoluciones | Cantidad debe ser positiva |

---

## 2. Reglas de Pedidos

### 2.1 Creación de Pedido (Transacción Atómica)

Todo el proceso de creación ocurre en una **transacción Prisma** (`$transaction`):

```
1. Validar items (al menos 1)
2. Para cada item:
   a. Verificar variante existe y está activa
   b. Verificar variante pertenece al tenant
   c. Verificar precio activo existe
   d. Calcular subtotal del ítem
   e. Verificar stock disponible
   f. Reservar stock (available--, reserved++)
   g. Registrar movimiento RESERVATION
3. Calcular costo de envío (zona + tarifa)
4. Aplicar cupón de descuento (si existe)
5. Calcular total: subtotal + envío - descuento
6. Generar número de pedido: ORD-XXXXXX-YYY
7. Crear Order + OrderItems + OrderShippingAddress
8. Registrar OrderStatusHistory
9. Crear Shipment + primer TrackingEvent
10. Registrar CouponRedemption (si aplica)
```

Si **cualquier paso falla**, se ejecuta rollback automático.

### 2.2 Número de Pedido

Formato: `ORD-{timestamp6}-{random3}`
Ejemplo: `ORD-238471-852`

### 2.3 Snapshots Históricos

Los pedidos almacenan **snapshots inmutables**:

- **OrderItems**: productName, productSku, unitPrice, quantity, subtotal
- **OrderShippingAddress**: department, province, district, addressLine, reference
- **productSnapshot** (JSON): brand, weight, price al momento de compra

Esto garantiza que cambios en el catálogo **no afecten** pedidos históricos.

### 2.4 Transiciones de Estado

```
PENDING_PAYMENT ──→ PAID ──→ PROCESSING ──→ READY_TO_SHIP ──→ SHIPPED ──→ DELIVERED
       │                │           │
       ↓                ↓           ↓
   CANCELLED        CANCELLED   CANCELLED
```

| Estado Actual | Transiciones Permitidas |
|--------------|------------------------|
| `PENDING_PAYMENT` | PAID, CANCELLED |
| `PAID` | PROCESSING, CANCELLED |
| `PROCESSING` | READY_TO_SHIP, CANCELLED |
| `READY_TO_SHIP` | SHIPPED |
| `SHIPPED` | DELIVERED |
| `DELIVERED` | *(ninguna)* |
| `CANCELLED` | *(ninguna)* |

### 2.5 Cancelación

Al cancelar un pedido:
1. Liberar stock reservado (available++, reserved--)
2. Registrar movimiento `RELEASE`
3. Actualizar `cancelledAt`
4. Actualizar fulfillmentStatus a `CANCELLED`

---

## 3. Reglas de Pagos

### 3.1 Flujo de Pago

```
1. Recibir token de Culqi del frontend
2. Crear registro Payment (status: PENDING)
3. Procesar con Culqi API (simulado en desarrollo)
4. Si exitoso:
   a. Actualizar Payment (status: PAID, paidAt)
   b. Actualizar Order (status: PAID, paymentStatus: PAID)
   c. Deducir stock reservado permanently (reserved--)
   d. Registrar movimiento SALE
   e. Actualizar Shipment a PROCESSING
   f. Agregar tracking: PAGO_CONFIRMADO
5. Si falla:
   a. Actualizar Payment (status: FAILED, failedAt)
   b. Registrar en ORDER_STATUS_HISTORY
```

### 3.2 Webhook de Culqi

Endpoint: `POST /api/payments/webhooks/culqi`

1. Validar firma HMAC-SHA256 (con `CULQI_WEBHOOK_SECRET`)
2. Verificar idempotencia (event_id único)
3. Almacenar en `payment_webhooks`
4. Procesar según tipo de evento:
   - `charge.succeeded` → confirmar pago
   - `charge.failed` → registrar fallo

### 3.3 Reembolsos

```
1. Verificar pedido está en status PAID
2. Verificar monto no excede total del pedido
3. Crear registro Payment (type: REFUND, paymentMethod: REFUND)
4. Actualizar Order (status: REFUNDED, paymentStatus: REFUNDED)
5. Si reembolso total:
   a. Devolver stock (available++)
   b. Registrar movimiento RETURN
6. Agregar tracking: REEMBOLSADO
```

**Reembolso parcial:** Permite reembolsar un monto menor al total. El pedido mantiene su status pero el paymentStatus cambia a `PARTIALLY_REFUNDED`. No se devuelve stock en reembolsos parciales.

---

## 4. Reglas de Envío

### 4.1 Zonas y Tarifas

- Cada tenant configura sus **ShippingZones** (ej. "Lima", "Provincias")
- Cada zona tiene **ShippingRates** por rango de peso (min-max)
- El costo se calcula al crear el pedido según la zona seleccionada

### 4.2 Tracking

Estados de tracking:

| Estado | Descripción |
|--------|-------------|
| `ORDEN_CREADA` | Pedido registrado |
| `PAGO_CONFIRMADO` | Pago recibido |
| `EN_PREPARACION` | Almacén preparando |
| `CURSOR_ASIGNADO` | Courier asignado |
| `EN_TRANSITO` | En camino |
| `EN_REPARTO` | En reparto final |
| `ENTREGADO` | Entregado al destinatario |
| `REEMBOLSADO` | Reembolsado |
| `DEVUELTO` | Devuelto por el cliente |
| `PEDIDO_CANCELADO` | Cancelado |

### 4.3 Couriers Soportados

- Olva
- Shalom
- 99Minutos
- Platanitos
- Civa
- Otro

---

## 5. Reglas de Cupones

### 5.1 Tipos de Descuento

| Tipo | Cálculo | Ejemplo |
|------|---------|---------|
| `PERCENTAGE` | `subtotal × (discountValue / 100)` | 10% de S/100 = S/10 |
| `FIXED_AMOUNT` | `discountValue` fijo | S/15 de descuento |
| `FREE_SHIPPING` | `shippingCost` completo | Envío gratis |

### 5.2 Restricciones

- **Monto mínimo** (`min_order_amount`): El subtotal debe superar este monto
- **Usos máximos** (`max_uses`): Límite total de canjes
- **Límite por usuario** (`per_user_limit`): Cuántas veces puede usarlo cada usuario
- **Vigencia**: `start_date` ≤ fecha actual ≤ `end_date`
- **Monto máximo de descuento** (`max_discount_amount`): Tope para cupones porcentuales

### 5.3 Validación

```
1. Verificar código existe y está activo
2. Verificar fecha de vigencia
3. Verificar monto mínimo de pedido
4. Verificar límite de usos no alcanzado
5. Calcular descuento según tipo
6. Aplicar tope de descuento máximo (si aplica)
```

---

## 6. Reglas de Multi-Tenancy

### 6.1 Resolución de Tenant

Prioridad de resolución:
1. Header `x-tenant-slug` o `x-tenant-id`
2. Query param `?tenantId=` o `?tenant=`
3. Subdomain del host header
4. Fallback: `cleo` (desarrollo)

### 6.2 Filtrado Automático

El Prisma middleware inyecta `tenantId` en:
- `findMany`, `findFirst`, `count`, `aggregate`, `groupBy`
- `updateMany`, `deleteMany`

**Excepciones:** Los endpoints de Platform Super Admin usan `setBypassFilter(true)`.

### 6.3 Aislamiento de Datos

| Operación | Restricción |
|-----------|------------|
| Leer productos | Solo del tenant actual |
| Crear pedido | Solo items del tenant actual |
| Ver pedidos | Solo pedidos del tenant actual |
| Modificar inventario | Solo del tenant actual |
| Platform Admin | Acceso cross-tenant (bypass) |

---

## 7. Reglas de Autenticación

### 7.1 JWT

- **Access Token**: expira en 7 días (configurable via `JWT_EXPIRES_IN`)
- **Reset Token**: expira en 1 hora (usado `JWT_RESET_SECRET` separado)
- **Payload**: sub, email, firstName, lastName, roles[]

### 7.2 Rate Limiting

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| Global | 100 req | 60s |
| Login | 10 req | 60s |
| Forgot password | 5 req | 300s |
| Reset password | 5 req | 300s |

### 7.3 RBAC

| Rol | Puede |
|-----|-------|
| `PLATFORM_SUPER_ADMIN` | Todo (cross-tenant) |
| `TENANT_ADMIN` | Todo dentro de su tenant |
| `TENANT_MANAGER` | Productos, pedidos, inventario |
| `CUSTOMER` | Storefront, pedidos propios, carrito |
