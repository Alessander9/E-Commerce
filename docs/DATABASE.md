# 📊 Database — Cleo Platform

> Diccionario de datos e índices de **Cleo Platform** (PostgreSQL 16+ con Prisma 6).

---

## Visión General

- **Total de tablas**: 37
- **Motor**: PostgreSQL con `Timestamptz` (timezone-aware timestamps)
- **IDs**: `BIGINT` autoincrement (excepto `Role.id` que es `INT`)
- **Serialización**: BigInt se serializa a `string` en la API (via `TransformInterceptor`)
- **Aislamiento**: Filtrado automático por `tenantId` via Prisma middleware (AsyncLocalStorage)

---

## 1. PLATAFORMA, TENANTS, USUARIOS Y ROLES

### `tenants` (Tenant)
Tabla principal de aislamiento multi-tenant.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | BIGINT | PK, autoincrement | Identificador único del tenant |
| `name` | VARCHAR(150) | NOT NULL | Nombre comercial |
| `slug` | VARCHAR(150) | UNIQUE, NOT NULL | Identificador URL-friendly (ej. `cleo`, `moda-peru`) |
| `domain` | VARCHAR(255) | UNIQUE, nullable | Dominio personalizado (ej. `tienda.pe`) |
| `subdomain` | VARCHAR(150) | UNIQUE, nullable | Subdominio (ej. `cleo.cleoplatform.com`) |
| `description` | TEXT | nullable | Descripción del tenant |
| `logo_url` | TEXT | nullable | URL del logo |
| `favicon_url` | TEXT | nullable | URL del favicon |
| `primary_color` | VARCHAR(20) | DEFAULT '#6A2CFF' | Color primario (hex) |
| `secondary_color` | VARCHAR(20) | DEFAULT '#1976FF' | Color secundario (hex) |
| `status` | VARCHAR(30) | DEFAULT 'ACTIVE' | Estado: ACTIVE, SUSPENDED, DELETED |
| `active` | BOOLEAN | DEFAULT true | Habilitado/deshabilitado |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | auto-update | Última actualización |
| `deleted_at` | TIMESTAMPTZ | nullable | Soft delete timestamp |

### `tenant_settings` (TenantSettings)
Configuración por tenant (1:1 con Tenant).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | BIGINT | PK, autoincrement | |
| `tenant_id` | BIGINT | UNIQUE, FK → tenants | |
| `currency` | VARCHAR(10) | DEFAULT 'PEN' | Moneda (PEN, USD, etc.) |
| `timezone` | VARCHAR(50) | DEFAULT 'America/Lima' | Zona horaria |
| `locale` | VARCHAR(20) | DEFAULT 'es_PE' | Localización |
| `support_email` | VARCHAR(255) | nullable | Email de soporte |
| `support_phone` | VARCHAR(30) | nullable | Teléfono de soporte |
| `address` | TEXT | nullable | Dirección del negocio |
| `business_hours` | JSON | nullable | Horarios (ej. `{lun: "9-18", mar: "9-18"}`) |
| `settings` | JSON | nullable | Configuración adicional flexible |

### `users` (User)
Usuarios globales (no tenant-scoped). Un usuario puede pertenecer a múltiples tenants.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | BIGINT | PK, autoincrement | |
| `auth_user_id` | UUID | UNIQUE, nullable | ID externo (Supabase Auth) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Correo electrónico |
| `password` | VARCHAR(255) | nullable | Hash bcrypt (null si auth externa) |
| `first_name` | VARCHAR(100) | NOT NULL | Nombres |
| `last_name` | VARCHAR(100) | NOT NULL | Apellidos |
| `phone` | VARCHAR(30) | nullable | Teléfono |
| `active` | BOOLEAN | DEFAULT true | Habilitado/deshabilitado |

### `roles` (Role)
Roles del sistema. Scope determina si es global (PLATFORM) o por tenant (TENANT).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | INT | PK, autoincrement | **Nota: INT, no BIGINT** |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL | Nombre del rol |
| `scope` | VARCHAR(30) | DEFAULT 'TENANT' | PLATFORM o TENANT |
| `description` | TEXT | nullable | Descripción |

**Roles predefinidos:**

| Rol | Scope | Descripción |
|-----|-------|-------------|
| `PLATFORM_SUPER_ADMIN` | PLATFORM | Acceso global a todo |
| `TENANT_ADMIN` | TENANT | Admin del tenant |
| `TENANT_MANAGER` | TENANT | Gestor de contenido |
| `CUSTOMER` | TENANT | Cliente final |

### `user_tenants` (UserTenant)
Relación N:M entre usuarios y tenants con rol específico.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `user_id` | BIGINT | FK → users, PK compuesto | |
| `tenant_id` | BIGINT | FK → tenants, PK compuesto | |
| `role_id` | INT | FK → roles | Rol en este tenant |
| `active` | BOOLEAN | DEFAULT true | Membresía activa |
| `joined_at` | TIMESTAMPTZ | DEFAULT now() | Fecha de ingreso |

**Índices:** `@@index([tenant_id])`

### `addresses` (Address)
Direcciones de envío de usuarios.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | BIGINT | PK, autoincrement | |
| `user_id` | BIGINT | FK → users | |
| `department` | VARCHAR(100) | NOT NULL | Departamento |
| `province` | VARCHAR(100) | NOT NULL | Provincia |
| `district` | VARCHAR(100) | NOT NULL | Distrito |
| `address_line` | TEXT | NOT NULL | Dirección completa |
| `reference` | TEXT | nullable | Referencia adicional |
| `postal_code` | VARCHAR(20) | nullable | Código postal |
| `is_default` | BOOLEAN | DEFAULT false | Dirección principal |

---

## 2. CATÁLOGO DE PRODUCTOS

### `categories` (Category)
Categorías jerárquicas (self-referencing via `parent_id`).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | BIGINT | PK, autoincrement | |
| `tenant_id` | BIGINT | FK → tenants | Tenant propietario |
| `parent_id` | BIGINT | FK → categories, nullable | Categoría padre |
| `name` | VARCHAR(150) | NOT NULL | Nombre |
| `slug` | VARCHAR(150) | NOT NULL | Slug URL-friendly |
| `description` | TEXT | nullable | Descripción |
| `image_url` | TEXT | nullable | Imagen de la categoría |
| `active` | BOOLEAN | DEFAULT true | |
| `display_order` | INT | DEFAULT 0 | Orden de visualización |

**Índices:** `@@unique([tenant_id, slug])`, `@@index([tenant_id])`

### `products` (Product)
Productos del catálogo.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | BIGINT | PK, autoincrement | |
| `tenant_id` | BIGINT | FK → tenants | Tenant propietario |
| `name` | VARCHAR(255) | NOT NULL | Nombre del producto |
| `slug` | VARCHAR(255) | NOT NULL | Slug URL-friendly |
| `base_sku` | VARCHAR(100) | nullable | SKU base |
| `description` | TEXT | nullable | Descripción completa |
| `short_description` | TEXT | nullable | Descripción corta |
| `brand` | VARCHAR(150) | nullable | Marca |
| `weight` | DECIMAL(12,3) | nullable | Peso en kg |
| `has_variants` | BOOLEAN | DEFAULT false | Tiene variantes |
| `featured` | BOOLEAN | DEFAULT false | Producto destacado |
| `active` | BOOLEAN | DEFAULT true | |

**Índices:** `@@unique([tenant_id, slug])`, `@@unique([tenant_id, base_sku])`, `@@index([tenant_id])`

### `product_variants` (ProductVariant)
Variantes de un producto (ej. 250g, 500g, 1kg).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | BIGINT | PK, autoincrement | |
| `product_id` | BIGINT | FK → products | Producto padre |
| `sku` | VARCHAR(100) | NOT NULL | SKU único por producto |
| `name` | VARCHAR(150) | nullable | Nombre de la variante |
| `weight` | DECIMAL(12,3) | nullable | Peso |
| `active` | BOOLEAN | DEFAULT true | |

**Índices:** `@@unique([product_id, sku])`, `@@index([product_id])`

### `product_options` (ProductOption)
Opciones configurables por tenant (ej. Color, Talla, Capacidad).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | BIGINT | PK, autoincrement | |
| `tenant_id` | BIGINT | FK → tenants | |
| `name` | VARCHAR(100) | NOT NULL | Nombre (Color, Talla) |
| `display_type` | VARCHAR(30) | DEFAULT 'BUTTON' | Tipo visual: BUTTON, DROPDOWN, SWATCH |
| `display_order` | INT | DEFAULT 0 | |

**Índices:** `@@unique([tenant_id, name])`

### `product_option_values` (ProductOptionValue)
Valores posibles para cada opción (ej. Rojo, Azul, S, M, L).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | BIGINT | PK, autoincrement | |
| `option_id` | BIGINT | FK → product_options | |
| `value` | VARCHAR(100) | NOT NULL | Valor interno (rojo, azul) |
| `label` | VARCHAR(100) | NOT NULL | Label visual (Rojo, Azul) |
| `color_hex` | VARCHAR(20) | nullable | Para display_type=SWATCH |
| `image_url` | TEXT | nullable | Imagen del valor |

**Índices:** `@@unique([option_id, value])`

### `product_variant_options` (ProductVariantOption)
Vincula un producto con sus opciones disponibles.

### `product_variant_values` (ProductVariantValue)
Asocia cada variante con sus valores de opción (ej. Variante "Rojo M" = Color:Rojo + Talla:M).

### `product_images` (ProductImage)
Imágenes de productos (múltiples por producto, una primaria).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | BIGINT | PK, autoincrement | |
| `product_id` | BIGINT | FK → products | |
| `url` | TEXT | NOT NULL | URL de la imagen |
| `alt_text` | VARCHAR(255) | nullable | Texto alternativo |
| `display_order` | INT | DEFAULT 0 | |
| `is_primary` | BOOLEAN | DEFAULT false | Imagen principal |

### `product_prices` (ProductPrice)
Historial de precios por variante (支持 precios con vigencia).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | BIGINT | PK, autoincrement | |
| `variant_id` | BIGINT | FK → product_variants | |
| `price` | DECIMAL(12,2) | NOT NULL | Precio actual |
| `compare_at_price` | DECIMAL(12,2) | nullable | Precio de comparación (tachado) |
| `currency` | VARCHAR(10) | DEFAULT 'PEN' | |
| `start_date` | DATE | DEFAULT now() | Inicio de vigencia |
| `end_date` | DATE | nullable | Fin de vigencia |
| `is_active` | BOOLEAN | DEFAULT true | Precio activo |

---

## 3. INVENTARIO

### `inventory` (Inventory)
Stock actual por variante (1:1 con ProductVariant).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | BIGINT | PK, autoincrement | |
| `variant_id` | BIGINT | UNIQUE, FK → product_variants | |
| `available_stock` | INT | DEFAULT 0 | Stock disponible para venta |
| `reserved_stock` | INT | DEFAULT 0 | Stock reservado por pedidos no pagados |
| `minimum_stock` | INT | DEFAULT 5 | Umbral de alerta |

**Fórmula:** `Stock Total = available_stock + reserved_stock`

### `inventory_movements` (InventoryMovement)
Historial completo de movimientos de stock.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | BIGINT | PK, autoincrement | |
| `tenant_id` | BIGINT | FK → tenants | |
| `variant_id` | BIGINT | FK → product_variants | |
| `movement_type` | VARCHAR(40) | NOT NULL | Tipo de movimiento |
| `quantity` | INT | NOT NULL | Cantidad (positiva o negativa) |
| `stock_before` | INT | NOT NULL | Stock antes del movimiento |
| `stock_after` | INT | NOT NULL | Stock después del movimiento |
| `reference_type` | VARCHAR(50) | nullable | ORDER, MANUAL, RETURN |
| `reference_id` | BIGINT | nullable | ID de referencia |
| `note` | TEXT | nullable | Nota descriptiva |
| `created_by` | BIGINT | FK → users, nullable | Quién realizó el movimiento |

**Tipos de movimiento:** `PURCHASE`, `SALE`, `RESERVATION`, `RELEASE`, `RETURN`, `ADJUSTMENT`, `MERMAS`

---

## 4. CARRITO Y WISHLIST

### `carts` (Cart)
Carrito de compras por usuario y tenant.

### `cart_items` (CartItem)
Ítems del carrito con snapshot de precio.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `unit_price_snapshot` | DECIMAL(12,2) | NOT NULL | Precio al momento de agregar |

**Índices:** `@@unique([cart_id, variant_id])`

### `wishlists` (Wishlist)
Lista de favoritos por usuario y tenant.

### `wishlist_items` (WishlistItem)
Ítems de la lista de favoritos.

---

## 5. PEDIDOS Y SNAPSHOTS

### `orders` (Order)
Pedido con snapshot inmutable de productos y dirección.

**Estados de pedido (`status`):**

| Estado | Descripción |
|--------|-------------|
| `PENDING_PAYMENT` | Esperando pago |
| `PAID` | Pago confirmado |
| `PROCESSING` | En preparación |
| `READY_TO_SHIP` | Listo para envío |
| `SHIPPED` | Despachado |
| `DELIVERED` | Entregado |
| `CANCELLED` | Cancelado |
| `REFUNDED` | Reembolsado |

**Estados de pago (`payment_status`):** PENDING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED

**Estados de fulfillment (`fulfillment_status`):** UNFULFILLED, PROCESSING, READY_TO_SHIP, SHIPPED, DELIVERED, CANCELLED

### `order_shipping_address` (OrderShippingAddress)
Snapshot inmutable de la dirección de envío al momento de crear el pedido.

### `order_items` (OrderItem)
Snapshot inmutable de cada producto: nombre, SKU, precio, cantidad.

### `order_status_history` (OrderStatusHistory)
Historial de cambios de estado del pedido.

---

## 6. PAGOS

### `payments` (Payment)
Registro de transacciones de pago.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | BIGINT | PK | |
| `order_id` | BIGINT | FK → orders | |
| `provider` | VARCHAR(50) | DEFAULT 'CULQI' | Pasarela de pago |
| `transaction_id` | VARCHAR(255) | nullable | ID de transacción del proveedor |
| `idempotency_key` | VARCHAR(255) | UNIQUE, nullable | Clave de idempotencia |
| `amount` | DECIMAL(12,2) | NOT NULL | Monto |
| `status` | VARCHAR(40) | DEFAULT 'PENDING' | PENDING, PROCESSING, PAID, FAILED |
| `payment_method` | VARCHAR(50) | nullable | CARD_VISA, CARD_MC, etc. |
| `metadata` | JSON | nullable | Datos adicionales del proveedor |

### `payment_webhooks` (PaymentWebhook)
Eventos recibidos de webhooks (Culqi).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `event_id` | VARCHAR(255) | UNIQUE, NOT NULL | ID del evento (para idempotencia) |
| `event_type` | VARCHAR(100) | NOT NULL | charge.succeeded, etc. |
| `payload` | JSON | NOT NULL | Payload completo |
| `status` | VARCHAR(30) | DEFAULT 'PENDING' | PENDING, RECEIVED, PROCESSED, FAILED |
| `processed` | BOOLEAN | DEFAULT false | Ya fue procesado |

---

## 7. ENVÍOS

### `shipping_zones` (ShippingZone)
Zonas geográficas de envío por tenant.

### `shipping_rates` (ShippingRate)
Tarifas por rango de peso dentro de cada zona.

### `shipments` (Shipment)
Envío asociado a un pedido (1:1).

**Estados:** PENDING, PROCESSING, SHIPPED, DELIVERED

### `shipment_tracking` (ShipmentTracking)
Historial de eventos de tracking del envío.

---

## 8. CUPONES

### `coupons` (Coupon)
Cupones de descuento por tenant.

**Tipos de descuento (`discount_type`):**

| Tipo | Descripción |
|------|-------------|
| `PERCENTAGE` | Porcentaje del subtotal |
| `FIXED_AMOUNT` | Monto fijo en la moneda del tenant |
| `FREE_SHIPPING` | Envío gratis |

### `coupon_redemptions` (CouponRedemption)
Historial de canjes de cupones.

---

## 9. NOTIFICACIONES Y AUDITORÍA

### `notifications` (Notification)
Notificaciones transaccionales por usuario.

**Canales:** EMAIL, WHATSAPP, PUSH, IN_APP

### `audit_logs` (AuditLog)
Registro inmutable de todas las mutaciones CRUD.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | BIGINT | PK | |
| `tenant_id` | BIGINT | FK → tenants, nullable | null para operaciones platform |
| `user_id` | BIGINT | FK → users, nullable | null para operaciones del sistema |
| `action` | VARCHAR(100) | NOT NULL | CREATE, UPDATE, DELETE, etc. |
| `entity` | VARCHAR(100) | NOT NULL | Tabla afectada |
| `entity_id` | BIGINT | nullable | ID del registro |
| `old_value` | JSON | nullable | Valores anteriores |
| `new_value` | JSON | nullable | Valores nuevos |
| `ip_address` | VARCHAR(45) | nullable | IP del cliente |
| `user_agent` | TEXT | nullable | User-Agent del navegador |

---

## Índices Resumen

| Tabla | Índices |
|-------|---------|
| `categories` | `UNIQUE(tenant_id, slug)`, `INDEX(tenant_id)` |
| `products` | `UNIQUE(tenant_id, slug)`, `UNIQUE(tenant_id, base_sku)`, `INDEX(tenant_id)` |
| `product_variants` | `UNIQUE(product_id, sku)`, `INDEX(product_id)` |
| `product_options` | `UNIQUE(tenant_id, name)`, `INDEX(tenant_id)` |
| `product_option_values` | `UNIQUE(option_id, value)`, `INDEX(option_id)` |
| `inventory_movements` | `INDEX(tenant_id)`, `INDEX(variant_id)` |
| `cart_items` | `UNIQUE(cart_id, variant_id)` |
| `orders` | `INDEX(tenant_id)`, `INDEX(user_id)`, `INDEX(status)` |
| `order_items` | `INDEX(order_id)` |
| `order_status_history` | `INDEX(order_id)` |
| `payments` | `INDEX(order_id)` |
| `payment_webhooks` | `INDEX(event_id)` UNIQUE |
| `shipment_tracking` | `INDEX(shipment_id)` |
| `coupon_redemptions` | `INDEX(coupon_id)`, `INDEX(user_id)`, `INDEX(order_id)` |
| `audit_logs` | `INDEX(tenant_id)`, `INDEX(entity, entity_id)` |
| `notifications` | `INDEX(tenant_id)`, `INDEX(user_id)` |
