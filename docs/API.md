# 📡 API Reference — Cleo Platform

> Contratos REST y convenciones de la API de **Cleo Platform**.

---

## 1. Convenciones Generales

### Base URL
```
http://localhost:3000
```

### URL Structure
```
/api/{domain}/{resource}
```

| Prefijo | Autenticación | Tenant Scope | Descripción |
|---------|--------------|--------------|-------------|
| `/api/auth/*` | Opcional | Opcional | Login, registro, recuperación |
| `/api/store/*` | Opcional | ✅ | Endpoints públicos del storefront |
| `/api/admin/*` | ✅ Requerido | ✅ | Panel de administración tenant |
| `/api/platform/*` | ✅ Requerido | ❌ | Super Admin (cross-tenant) |

### Headers

| Header | Tipo | Requerido | Descripción |
|--------|------|-----------|-------------|
| `Authorization` | `Bearer <token>` | Para rutas protegidas | JWT de acceso |
| `x-tenant-slug` | `string` | Opcional | Slug del tenant (ej. `cleo`) |
| `x-tenant-id` | `string` | Opcional | ID numérico del tenant |
| `Content-Type` | `application/json` | En POST/PUT/PATCH | Content type |

### Resolución de Tenant

Prioridad:
1. Header `x-tenant-slug` o `x-tenant-id`
2. Query param `?tenant=` o `?tenantId=`
3. Subdomain del host header
4. Fallback: `cleo` (desarrollo)

---

## 2. Response Format

### Éxito
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2026-09-04T00:00:00.000Z"
}
```

### Error
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Descripción del error",
  "errors": null,
  "timestamp": "2026-09-04T00:00:00.000Z"
}
```

### Serialización BigInt
Todos los campos `BigInt` se serializan a `string` en la respuesta:
```json
{
  "id": "1234567890123456789",
  "tenantId": "1"
}
```

---

## 3. Autenticación

### `POST /api/auth/login`
Iniciar sesión.

**Request:**
```json
{
  "email": "admin@cleo.com",
  "password": "admin123"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "email": "admin@cleo.com",
    "firstName": "Admin",
    "lastName": "Cleo",
    "currentRole": "TENANT_ADMIN",
    "currentTenant": {
      "id": "1",
      "name": "Cleo-Ecommerce",
      "slug": "cleo"
    },
    "memberships": [...]
  }
}
```

**Rate Limit:** 10 req/60s

### `POST /api/auth/register`
Registrar nuevo cliente.

**Request:**
```json
{
  "email": "cliente@email.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+51 987654321"
}
```

### `GET /api/auth/profile`
Obtener perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

### `POST /api/auth/forgot-password`
Solicitar recuperación de contraseña.

**Request:**
```json
{ "email": "admin@cleo.com" }
```

**Response 200 (siempre):**
```json
{ "message": "Si el correo está registrado, recibirás un enlace de recuperación." }
```

### `POST /api/auth/reset-password`
Restablecer contraseña con token.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "newPassword": "nuevaPassword123"
}
```

---

## 4. Storefront (Público)

### `GET /api/store/products`
Listar productos activos del tenant.

**Query Params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `category` | string | Filtrar por slug de categoría |
| `featured` | string | `"true"` para destacados |
| `search` | string | Búsqueda por nombre/descripción/marca |

### `GET /api/store/products/:slug`
Detalle de producto por slug.

### `GET /api/store/categories`
Listar categorías activas con conteo de productos.

### `GET /api/store/shipping/zones`
Zonas de envío del tenant.

### `POST /api/store/coupons/validate`
Validar cupón de descuento.

**Request:**
```json
{ "code": "BIENVENIDA10", "amount": 150.00 }
```

---

## 5. Carrito y Favoritos

### `GET /api/store/cart`
Obtener carrito del usuario.

**Response:**
```json
{
  "id": "1",
  "items": [
    {
      "id": "1",
      "quantity": 2,
      "unitPrice": 25.00,
      "lineTotal": 50.00,
      "variant": {
        "id": "1",
        "sku": "PROD-001",
        "name": "Estándar",
        "product": { "name": "Maca Premium", "slug": "maca-premium" },
        "price": 25.00,
        "inStock": true
      }
    }
  ],
  "summary": { "totalItems": 2, "subtotal": 50.00, "itemCount": 1 }
}
```

### `POST /api/store/cart/items`
Agregar item al carrito.

**Request:**
```json
{ "variantId": "1", "quantity": 2 }
```

### `PATCH /api/store/cart/items/:itemId`
Actualizar cantidad de un item.

**Request:**
```json
{ "quantity": 3 }
```

### `DELETE /api/store/cart/items/:itemId`
Eliminar item del carrito.

### `DELETE /api/store/cart`
Vaciar carrito.

### `GET /api/store/wishlist`
Obtener lista de favoritos.

### `POST /api/store/wishlist/items`
Agregar a favoritos.

**Request:**
```json
{ "variantId": "1" }
```

### `DELETE /api/store/wishlist/items/:itemId`
Eliminar de favoritos.

### `GET /api/store/wishlist/check/:variantId`
Verificar si un producto está en favoritos.

---

## 6. Pedidos

### `POST /api/store/orders`
Crear nuevo pedido (con reserva de stock).

**Request:**
```json
{
  "items": [
    { "variantId": "1", "quantity": 2 },
    { "variantId": "3", "quantity": 1 }
  ],
  "shippingAddress": {
    "department": "Lima",
    "province": "Lima",
    "district": "Miraflores",
    "addressLine": "Av. Larco 123",
    "reference": "Frente al parque"
  },
  "shippingZoneId": "1",
  "couponCode": "BIENVENIDA10"
}
```

### `GET /api/store/orders`
Listar pedidos del cliente actual.

### `GET /api/admin/orders`
Listar todos los pedidos del tenant (admin).

### `GET /api/admin/orders/:id`
Detalle completo de un pedido (admin).

### `PATCH /api/admin/orders/:id/status`
Cambiar estado de un pedido.

**Request:**
```json
{
  "status": "SHIPPED",
  "note": "Pedido despachado",
  "courier": "Olva",
  "trackingCode": "OLV-123456789"
}
```

**Transiciones válidas:**
| Desde | Hacia |
|-------|-------|
| PENDING_PAYMENT | PAID, CANCELLED |
| PAID | PROCESSING, CANCELLED |
| PROCESSING | READY_TO_SHIP, CANCELLED |
| READY_TO_SHIP | SHIPPED |
| SHIPPED | DELIVERED |

---

## 7. Pagos

### `POST /api/store/payments/process`
Procesar pago con Culqi.

**Request:**
```json
{
  "orderId": "1",
  "token": "tok_test_culqi",
  "paymentMethod": "CARD_VISA"
}
```

### `POST /api/payments/webhooks/culqi`
Webhook público de Culqi (sin autenticación).

### `POST /api/admin/orders/:orderId/refund`
Reembolsar un pedido pagado.

**Request:**
```json
{
  "orderId": "1",
  "reason": "Cliente solicitó cancelación",
  "amount": 150.00
}
```

---

## 8. Envíos

### `GET /api/admin/shipments`
Listar envíos del tenant.

**Query Params:** `status`, `search` (por N° pedido o tracking)

### `GET /api/admin/shipments/:id`
Detalle de envío con historial de tracking.

### `PATCH /api/admin/shipments/:id/assign-courier`
Asignar courier y código de tracking.

**Request:**
```json
{
  "courier": "Olva",
  "deliveryService": "Olva Express",
  "trackingCode": "OLV-987654321"
}
```

**Couriers válidos:** Olva, Shalom, 99Minutos, Platanitos, Civa, Otro

### `POST /api/admin/shipments/:id/tracking`
Agregar evento de tracking.

**Request:**
```json
{
  "status": "EN_TRANSITO",
  "location": "Lima - Centro de distribución",
  "description": "Paquete en tránsito al destino"
}
```

**Estados de tracking:** ORDEN_CREADA, PAGO_CONFIRMADO, EN_PREPARACION, CURSOR_ASIGNADO, EN_TRANSITO, EN_REPARTO, ENTREGADO, REEMBOLSADO, DEVUELTO

---

## 9. Catálogo Admin

### `GET /api/admin/products`
Listar productos (incluye variantes, precios, inventario).

### `POST /api/admin/products`
Crear producto con variante estándar.

### `PUT /api/admin/products/:id`
Actualizar producto.

### `DELETE /api/admin/products/:id`
Eliminar producto (soft delete).

### `GET /api/admin/categories`
Listar categorías con jerarquía.

### `POST /api/admin/categories`
Crear categoría (con soporte de jerarquía via `parentId`).

### `PUT /api/admin/categories/:id`
Actualizar categoría.

### `DELETE /api/admin/categories/:id`
Eliminar categoría (falla si tiene productos o subcategorías).

### `PATCH /api/admin/categories/reorder`
Reordenar categorías.

**Request:**
```json
{
  "categories": [
    { "id": "1", "displayOrder": 0 },
    { "id": "2", "displayOrder": 1 }
  ]
}
```

### `GET /api/admin/options`
Listar opciones de producto (Color, Talla, etc.).

### `POST /api/admin/options`
Crear opción con valores.

**Request:**
```json
{
  "name": "Color",
  "displayType": "SWATCH",
  "values": [
    { "value": "rojo", "label": "Rojo", "colorHex": "#EF4444" },
    { "value": "azul", "label": "Azul", "colorHex": "#3B82F6" }
  ]
}
```

### `POST /api/admin/products/:id/generate-variants`
Generar variantes desde combinaciones de opciones.

**Request:**
```json
{
  "optionIds": ["1", "2"],
  "defaultPrice": 29.90,
  "defaultStock": 50,
  "skuPrefix": "CAM"
}
```

**Response:**
```json
{
  "generatedVariants": 4,
  "variants": [
    { "sku": "CAM-ROJ-S-001", "name": "Camiseta Rojo S", "price": 29.90, "stock": 50 },
    { "sku": "CAM-ROJ-M-002", "name": "Camiseta Rojo M", "price": 29.90, "stock": 50 },
    { "sku": "CAM-AZU-S-003", "name": "Camiseta Azul S", "price": 29.90, "stock": 50 },
    { "sku": "CAM-AZU-M-004", "name": "Camiseta Azul M", "price": 29.90, "stock": 50 }
  ]
}
```

---

## 10. Inventario

### `GET /api/admin/inventory`
Overview de inventario con niveles de stock.

**Query Params:** `lowStock=true`, `search=maca`

### `GET /api/admin/inventory/movements`
Historial de movimientos.

**Query Params:** `variantId`, `movementType` (PURCHASE, RETURN, ADJUSTMENT, MERMAS), `limit`

### `POST /api/admin/inventory/movements`
Registrar movimiento manual.

**Request:**
```json
{
  "variantId": "1",
  "movementType": "PURCHASE",
  "quantity": 100,
  "note": "Ingreso de proveedor ABC"
}
```

### `PATCH /api/admin/inventory/variants/:variantId/minimum-stock`
Actualizar stock mínimo.

**Request:**
```json
{ "minimumStock": 10 }
```

---

## 11. Configuración y Reportes

### `GET /api/admin/settings`
Obtener configuración del tenant.

### `PATCH /api/admin/settings`
Actualizar configuración.

**Request:**
```json
{
  "currency": "PEN",
  "timezone": "America/Lima",
  "supportEmail": "soporte@tienda.com",
  "supportPhone": "+51 999888777",
  "businessHours": { "lun-vie": "9:00-18:00", "sab": "9:00-14:00" }
}
```

### `GET /api/admin/reports/sales/csv`
Exportar ventas a CSV.

**Query Params:** `dateFrom`, `dateTo`, `status`

**Response:** Archivo CSV con BOM UTF-8 para Excel.

### `GET /api/admin/reports/sales/trends`
Tendencias de ventas para gráficos.

**Query Params:** `period` (daily, weekly, monthly), `dateFrom`, `dateTo`

**Response:**
```json
{
  "period": "weekly",
  "trends": [
    { "period": "2026-09-01", "revenue": 1500.00, "orders": 12, "averageOrderValue": 125.00 }
  ],
  "totalRevenue": 1500.00,
  "totalOrders": 12
}
```

---

## 12. Platform Super Admin

### `GET /api/platform/dashboard/overview`
Métricas consolidadas (KPIs, tenants breakdown, órdenes recientes).

### `GET /api/platform/tenants`
Listar todos los tenants.

### `POST /api/platform/tenants`
Crear nuevo tenant.

### `PATCH /api/platform/tenants/:id`
Actualizar tenant.

### `PATCH /api/platform/tenants/:id/suspend`
Suspender tenant.

### `PATCH /api/platform/tenants/:id/reactivate`
Reactivar tenant suspendido.

### `DELETE /api/platform/tenants/:id`
Eliminar tenant (soft delete).

### `POST /api/platform/tenants/users/assign`
Asignar usuario a tenant con rol.

**Request:**
```json
{ "userId": "1", "tenantId": "2", "roleId": "3" }
```

### `DELETE /api/platform/tenants/:tenantId/users/:userId`
Remover usuario de tenant.

### `GET /api/platform/tenants/roles/all`
Listar roles disponibles.

### `GET /api/platform/users`
Listar usuarios globales.

### `PATCH /api/platform/users/:id/status`
Activar/desactivar usuario.

### `GET /api/platform/audit-logs`
Consultar logs de auditoría.

---

## 13. HTTP Status Codes

| Código | Descripción |
|--------|------------|
| `200` | OK — Operación exitosa |
| `201` | Created — Recurso creado |
| `400` | Bad Request — Datos inválidos |
| `401` | Unauthorized — Token faltante o inválido |
| `403` | Forbidden — Sin permisos para esta acción |
| `404` | Not Found — Recurso no encontrado |
| `409` | Conflict — Conflicto (ej. slug duplicado) |
| `429` | Too Many Requests — Rate limit excedido |
| `500` | Internal Server Error — Error del servidor |

---

## 14. Autenticación y Seguridad

### JWT Token
```json
{
  "sub": "1",
  "email": "user@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "roles": [
    {
      "tenantId": "1",
      "tenantSlug": "cleo",
      "role": "TENANT_ADMIN",
      "scope": "TENANT"
    }
  ],
  "iat": 1751616000,
  "exp": 1752220800
}
```

### Rate Limiting Global
| Límite | Ventana |
|--------|---------|
| 100 req/IP | 60s |
| 10 req (login) | 60s |
| 5 req (forgot/reset) | 300s |

### Security Headers (Helmet)
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security: max-age=31536000
- X-XSS-Protection: 0
