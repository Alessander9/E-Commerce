# EcommerceBD — Diseño e Implementación de Base de Datos

**Stack:** PostgreSQL · Spring Boot · Angular · Culqi · Shalom  
**Versión:** 1.0  
**Tablas:** 30  
**Módulos:** 10

---

## Tabla de Contenidos

1. [Requisitos Previos](#1-requisitos-previos)
2. [Convenciones de Diseño](#2-convenciones-de-diseño)
3. [Módulo 1 — Seguridad y Usuarios](#3-módulo-1--seguridad-y-usuarios)
4. [Módulo 2 — Catálogo](#4-módulo-2--catálogo)
5. [Módulo 3 — Carrito de Compras](#5-módulo-3--carrito-de-compras)
6. [Módulo 4 — Pedidos](#6-módulo-4--pedidos)
7. [Módulo 5 — Pagos](#7-módulo-5--pagos)
8. [Módulo 6 — Envíos y Tracking](#8-módulo-6--envíos-y-tracking)
9. [Módulo 7 — Cupones y Promociones](#9-módulo-7--cupones-y-promociones)
10. [Módulo 8 — Wishlist](#10-módulo-8--wishlist)
11. [Módulo 9 — Notificaciones](#11-módulo-9--notificaciones)
12. [Módulo 10 — Auditoría](#12-módulo-10--auditoría)
13. [Índices](#13-índices)
14. [Orden de Ejecución](#14-orden-de-ejecución)

---

## 1. Requisitos Previos

```sql
-- Verificar versión de PostgreSQL (mínimo 14)
SELECT version();

-- Crear base de datos
CREATE DATABASE ecommerce_db
    WITH ENCODING = 'UTF8'
    LC_COLLATE = 'es_PE.UTF-8'
    LC_CTYPE   = 'es_PE.UTF-8'
    TEMPLATE   = template0;

-- Conectarse a la base de datos
\c ecommerce_db

-- Habilitar extensión para UUIDs (opcional, si prefieres UUID como PK)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar extensión para búsqueda de texto completo
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

---

## 2. Convenciones de Diseño

| Convención | Decisión |
|---|---|
| Tipo de PK | `BIGSERIAL` para tablas grandes, `SERIAL` para catálogos pequeños |
| Nombres de tablas | `snake_case` en plural |
| Nombres de columnas | `snake_case` |
| Timestamps | `TIMESTAMP WITH TIME ZONE` (zona horaria incluida) |
| Soft delete | `deleted_at TIMESTAMPTZ NULL` — registro activo si es NULL |
| Montos | `NUMERIC(12,2)` — nunca `FLOAT` para dinero |
| Textos cortos | `VARCHAR(n)` con límite explícito |
| Textos largos | `TEXT` sin límite |
| Datos JSON externos | `JSONB` (indexable, binario) |
| Enum simulado | `VARCHAR` + `CHECK IN (...)` — más flexible que ENUM |

> **Nota sobre soft delete:** Las tablas `users` y `products` usan `deleted_at` en lugar de borrado físico para preservar integridad referencial con pedidos históricos.

---

## 3. Módulo 1 — Seguridad y Usuarios

**Tablas:** `users`, `roles`, `user_roles`, `refresh_tokens`, `password_reset_tokens`, `addresses`

### Por qué este diseño

- `users` no almacena la contraseña en texto plano, solo el hash (BCrypt en Spring Security).
- `refresh_tokens` permite revocar sesiones individuales sin invalidar el JWT entero — esencial para "cerrar sesión en todos los dispositivos".
- `password_reset_tokens` con campo `used` audita todos los intentos de reseteo, incluyendo los que expiraron sin usarse.
- `deleted_at` en `users` evita romper FKs en `orders` y `audit_logs` al desactivar una cuenta.
- `addresses` es tabla separada para soportar múltiples direcciones por usuario (casa, trabajo, etc.).

---

```sql
-- ============================================================
-- MÓDULO 1: SEGURIDAD Y USUARIOS
-- ============================================================

CREATE TABLE users (
    id             BIGSERIAL PRIMARY KEY,
    email          VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    first_name     VARCHAR(100) NOT NULL,
    last_name      VARCHAR(100) NOT NULL,
    phone          VARCHAR(20),
    active         BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at     TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_email CHECK (email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE  users                IS 'Clientes y administradores del sistema';
COMMENT ON COLUMN users.password_hash  IS 'Hash BCrypt — nunca texto plano';
COMMENT ON COLUMN users.deleted_at     IS 'Soft delete: NULL = activo, NOT NULL = eliminado';


-- ------------------------------------------------------------

CREATE TABLE roles (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,

    CONSTRAINT uq_roles_name UNIQUE (name),
    CONSTRAINT chk_roles_name CHECK (name IN ('ADMIN', 'CLIENT'))
);

COMMENT ON TABLE roles IS 'Roles disponibles del sistema (RBAC)';

INSERT INTO roles (name) VALUES ('ADMIN'), ('CLIENT');


-- ------------------------------------------------------------

CREATE TABLE user_roles (
    user_id BIGINT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,

    PRIMARY KEY (user_id, role_id)
);

COMMENT ON TABLE user_roles IS 'Relación muchos-a-muchos entre usuarios y roles';


-- ------------------------------------------------------------

CREATE TABLE refresh_tokens (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(512) NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    revoked    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_refresh_tokens_token UNIQUE (token)
);

COMMENT ON TABLE  refresh_tokens         IS 'Tokens JWT de refresco para sesiones persistentes';
COMMENT ON COLUMN refresh_tokens.revoked IS 'TRUE = token invalidado manualmente (logout, cambio de password)';


-- ------------------------------------------------------------

CREATE TABLE password_reset_tokens (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(512) NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_pwd_reset_token UNIQUE (token)
);

COMMENT ON TABLE  password_reset_tokens      IS 'Tokens de un solo uso para recuperación de contraseña';
COMMENT ON COLUMN password_reset_tokens.used IS 'TRUE = token ya consumido, no reutilizable';


-- ------------------------------------------------------------

CREATE TABLE addresses (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department   VARCHAR(100) NOT NULL,
    province     VARCHAR(100) NOT NULL,
    district     VARCHAR(100) NOT NULL,
    address_line TEXT         NOT NULL,
    reference    TEXT,
    is_default   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_addresses_department CHECK (LENGTH(department) > 0),
    CONSTRAINT chk_addresses_province   CHECK (LENGTH(province)   > 0),
    CONSTRAINT chk_addresses_district   CHECK (LENGTH(district)   > 0)
);

COMMENT ON TABLE  addresses            IS 'Direcciones de entrega registradas por el usuario';
COMMENT ON COLUMN addresses.is_default IS 'Solo una dirección por usuario debe tener is_default = TRUE';
```

---

## 4. Módulo 2 — Catálogo

**Tablas:** `categories`, `products`, `product_categories`, `product_images`, `product_prices`, `inventory`

### Por qué este diseño

- `categories` tiene `parent_id` auto-referencial para jerarquía real (Electrónica → Computadoras → Laptops).
- `product_categories` rompe la limitación de "1 producto = 1 categoría". Un laptop gamer puede estar en Computadoras, Gaming y Ofertas simultáneamente.
- `products` almacena peso y dimensiones desde el inicio para la integración futura con la API de Shalom.
- `product_prices` guarda historial completo de precios. Con `is_active` se identifica el precio vigente sin cálculo de fechas. Permite auditoría de cambios de precio.
- `inventory` está separado de `products` para evitar bloqueos de fila: las consultas de catálogo y las actualizaciones de stock compiten por la misma fila si el stock está en `products`. `reserved_stock` previene la sobreventa en compras simultáneas.

---

```sql
-- ============================================================
-- MÓDULO 2: CATÁLOGO
-- ============================================================

CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    parent_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name        VARCHAR(150) NOT NULL,
    slug        VARCHAR(150) NOT NULL,
    description TEXT,
    active      BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT uq_categories_slug   UNIQUE (slug),
    CONSTRAINT chk_categories_name  CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT chk_categories_slug  CHECK (slug ~ '^[a-z0-9\-]+$'),
    CONSTRAINT chk_categories_no_self_parent CHECK (id <> parent_id)
);

COMMENT ON TABLE  categories           IS 'Categorías jerárquicas del catálogo';
COMMENT ON COLUMN categories.parent_id IS 'NULL = categoría raíz. FK self-referencial para subcategorías';
COMMENT ON COLUMN categories.slug      IS 'URL amigable: solo minúsculas, números y guiones';


-- ------------------------------------------------------------

CREATE TABLE products (
    id               BIGSERIAL PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    slug             VARCHAR(255) NOT NULL,
    description      TEXT,
    sku              VARCHAR(100) NOT NULL,
    weight           NUMERIC(8,3),
    height           NUMERIC(8,2),
    width            NUMERIC(8,2),
    length           NUMERIC(8,2),
    meta_title       VARCHAR(160),
    meta_description VARCHAR(320),
    active           BOOLEAN      NOT NULL DEFAULT TRUE,
    deleted_at       TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_products_slug UNIQUE (slug),
    CONSTRAINT uq_products_sku  UNIQUE (sku),
    CONSTRAINT chk_products_name   CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT chk_products_slug   CHECK (slug ~ '^[a-z0-9\-]+$'),
    CONSTRAINT chk_products_weight CHECK (weight IS NULL OR weight > 0),
    CONSTRAINT chk_products_dims   CHECK (
        (height IS NULL OR height > 0) AND
        (width  IS NULL OR width  > 0) AND
        (length IS NULL OR length > 0)
    )
);

COMMENT ON TABLE  products             IS 'Productos del catálogo';
COMMENT ON COLUMN products.weight      IS 'Peso en kilogramos — requerido para tarifas Shalom';
COMMENT ON COLUMN products.height      IS 'Alto en centímetros';
COMMENT ON COLUMN products.width       IS 'Ancho en centímetros';
COMMENT ON COLUMN products.length      IS 'Largo en centímetros';
COMMENT ON COLUMN products.slug        IS 'URL amigable única para SEO';
COMMENT ON COLUMN products.deleted_at  IS 'Soft delete: NULL = visible, NOT NULL = eliminado';


-- ------------------------------------------------------------

CREATE TABLE product_categories (
    product_id  BIGINT  NOT NULL REFERENCES products(id)    ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id)  ON DELETE CASCADE,

    PRIMARY KEY (product_id, category_id)
);

COMMENT ON TABLE product_categories IS 'Un producto puede pertenecer a múltiples categorías';


-- ------------------------------------------------------------

CREATE TABLE product_images (
    id            BIGSERIAL PRIMARY KEY,
    product_id    BIGINT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url           TEXT         NOT NULL,
    alt_text      VARCHAR(255),
    display_order INTEGER      NOT NULL DEFAULT 0,
    is_primary    BOOLEAN      NOT NULL DEFAULT FALSE,

    CONSTRAINT chk_product_images_url   CHECK (LENGTH(TRIM(url)) > 0),
    CONSTRAINT chk_product_images_order CHECK (display_order >= 0)
);

COMMENT ON TABLE  product_images            IS 'Galería de imágenes por producto';
COMMENT ON COLUMN product_images.is_primary IS 'Solo una imagen por producto debe tener is_primary = TRUE';
COMMENT ON COLUMN product_images.alt_text   IS 'Texto alternativo para accesibilidad y SEO';


-- ------------------------------------------------------------

CREATE TABLE product_prices (
    id         BIGSERIAL    PRIMARY KEY,
    product_id BIGINT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price      NUMERIC(12,2) NOT NULL,
    start_date DATE         NOT NULL,
    end_date   DATE,
    is_active  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_product_prices_price    CHECK (price > 0),
    CONSTRAINT chk_product_prices_dates    CHECK (end_date IS NULL OR end_date > start_date)
);

COMMENT ON TABLE  product_prices           IS 'Historial de precios del producto';
COMMENT ON COLUMN product_prices.is_active IS 'Solo un precio por producto debe tener is_active = TRUE';
COMMENT ON COLUMN product_prices.end_date  IS 'NULL = precio sin fecha de vencimiento definida';

-- Índice parcial: garantiza un solo precio activo por producto
CREATE UNIQUE INDEX uq_product_prices_active
    ON product_prices(product_id)
    WHERE is_active = TRUE;


-- ------------------------------------------------------------

CREATE TABLE inventory (
    id              BIGSERIAL    PRIMARY KEY,
    product_id      BIGINT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    available_stock INTEGER      NOT NULL DEFAULT 0,
    reserved_stock  INTEGER      NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_inventory_product     UNIQUE (product_id),
    CONSTRAINT chk_inventory_available  CHECK (available_stock >= 0),
    CONSTRAINT chk_inventory_reserved   CHECK (reserved_stock  >= 0)
);

COMMENT ON TABLE  inventory                 IS 'Control de stock separado del catálogo';
COMMENT ON COLUMN inventory.available_stock IS 'Stock libre para nuevos pedidos';
COMMENT ON COLUMN inventory.reserved_stock  IS 'Stock bloqueado por pedidos en curso — previene sobreventa';
```

---

## 5. Módulo 3 — Carrito de Compras

**Tablas:** `carts`, `cart_items`

### Por qué este diseño

El carrito persistente en base de datos permite recuperar la sesión de compra si el usuario cierra el navegador, cambia de dispositivo o su sesión JWT expira. Es la diferencia entre perder una venta y recuperarla.

---

```sql
-- ============================================================
-- MÓDULO 3: CARRITO DE COMPRAS
-- ============================================================

CREATE TABLE carts (
    id         BIGSERIAL   PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_carts_user UNIQUE (user_id)
);

COMMENT ON TABLE carts IS 'Un carrito activo por usuario — se reutiliza entre sesiones';


-- ------------------------------------------------------------

CREATE TABLE cart_items (
    id         BIGSERIAL PRIMARY KEY,
    cart_id    BIGINT    NOT NULL REFERENCES carts(id)    ON DELETE CASCADE,
    product_id BIGINT    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INTEGER   NOT NULL DEFAULT 1,

    CONSTRAINT uq_cart_items_product  UNIQUE (cart_id, product_id),
    CONSTRAINT chk_cart_items_qty     CHECK  (quantity > 0)
);

COMMENT ON TABLE  cart_items          IS 'Productos dentro del carrito';
COMMENT ON COLUMN cart_items.quantity IS 'Mínimo 1 — si llega a 0 se elimina la fila';
```

---

## 6. Módulo 4 — Pedidos

**Tablas:** `orders`, `order_shipping_address`, `order_items`, `order_status_history`

### Por qué este diseño

- `order_shipping_address` es un snapshot inmutable de la dirección al momento de la compra. Si el cliente cambia su dirección después, el pedido histórico debe mostrar a dónde fue el envío original.
- `order_items` guarda `product_name` y `unit_price` copiados del producto al momento de la compra. Si mañana cambias el nombre o precio del producto, los pedidos históricos no se alteran.
- `order_status_history` reemplaza un campo `status` estático. Ganas trazabilidad completa, puedes mostrar una línea de tiempo al cliente y saber exactamente quién cambió qué y cuándo.
- El campo `status` en `orders` es un resumen del último estado para consultas rápidas (evita siempre hacer JOIN con el historial).

---

```sql
-- ============================================================
-- MÓDULO 4: PEDIDOS
-- ============================================================

CREATE TABLE orders (
    id              BIGSERIAL     PRIMARY KEY,
    order_number    VARCHAR(50)   NOT NULL,
    user_id         BIGINT        NOT NULL REFERENCES users(id),
    status          VARCHAR(30)   NOT NULL DEFAULT 'PENDING',
    subtotal        NUMERIC(12,2) NOT NULL,
    shipping_cost   NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total           NUMERIC(12,2) NOT NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_orders_number    UNIQUE (order_number),
    CONSTRAINT chk_orders_status   CHECK  (status IN (
        'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
    )),
    CONSTRAINT chk_orders_subtotal  CHECK (subtotal        >= 0),
    CONSTRAINT chk_orders_shipping  CHECK (shipping_cost   >= 0),
    CONSTRAINT chk_orders_discount  CHECK (discount_amount >= 0),
    CONSTRAINT chk_orders_total     CHECK (total           >= 0)
);

COMMENT ON TABLE  orders                 IS 'Pedidos realizados por los clientes';
COMMENT ON COLUMN orders.order_number    IS 'Número legible para el cliente — ej: ORD-20240605-00001';
COMMENT ON COLUMN orders.status          IS 'Resumen del último estado para consultas rápidas';
COMMENT ON COLUMN orders.discount_amount IS 'Total descontado por cupones u otras promociones';


-- ------------------------------------------------------------

CREATE TABLE order_shipping_address (
    id           BIGSERIAL PRIMARY KEY,
    order_id     BIGINT       NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    department   VARCHAR(100) NOT NULL,
    province     VARCHAR(100) NOT NULL,
    district     VARCHAR(100) NOT NULL,
    address_line TEXT         NOT NULL,
    reference    TEXT,

    CONSTRAINT uq_order_shipping_address_order UNIQUE (order_id)
);

COMMENT ON TABLE order_shipping_address IS 'Snapshot inmutable de la dirección de entrega al momento del pedido';


-- ------------------------------------------------------------

CREATE TABLE order_items (
    id           BIGSERIAL     PRIMARY KEY,
    order_id     BIGINT        NOT NULL REFERENCES orders(id)    ON DELETE CASCADE,
    product_id   BIGINT        REFERENCES products(id)           ON DELETE SET NULL,
    product_name VARCHAR(255)  NOT NULL,
    unit_price   NUMERIC(12,2) NOT NULL,
    quantity     INTEGER       NOT NULL,
    subtotal     NUMERIC(12,2) NOT NULL,

    CONSTRAINT chk_order_items_unit_price CHECK (unit_price  > 0),
    CONSTRAINT chk_order_items_qty        CHECK (quantity    > 0),
    CONSTRAINT chk_order_items_subtotal   CHECK (subtotal    > 0)
);

COMMENT ON TABLE  order_items              IS 'Líneas del pedido con datos congelados al momento de la compra';
COMMENT ON COLUMN order_items.product_name IS 'Copia del nombre del producto — no cambia si el producto se edita';
COMMENT ON COLUMN order_items.unit_price   IS 'Precio pagado — no cambia si el precio del producto cambia';
COMMENT ON COLUMN order_items.product_id   IS 'SET NULL si el producto es eliminado — el historial se conserva';


-- ------------------------------------------------------------

CREATE TABLE order_status_history (
    id         BIGSERIAL   PRIMARY KEY,
    order_id   BIGINT      NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    changed_by BIGINT      REFERENCES users(id) ON DELETE SET NULL,
    status     VARCHAR(30) NOT NULL,
    note       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_order_status_history_status CHECK (status IN (
        'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
    ))
);

COMMENT ON TABLE  order_status_history            IS 'Línea de tiempo completa de cambios de estado del pedido';
COMMENT ON COLUMN order_status_history.changed_by IS 'NULL = cambio automático del sistema. NOT NULL = cambio manual por admin';
COMMENT ON COLUMN order_status_history.note       IS 'Comentario opcional: motivo de cancelación, incidencia, etc.';
```

---

## 7. Módulo 5 — Pagos

**Tabla:** `payments`

### Por qué este diseño

- Relación `1:1` con `orders` — un pedido tiene un pago (o ninguno si está pendiente).
- `metadata` en JSONB almacena el payload completo de la respuesta de Culqi: número de tarjeta enmascarado, banco emisor, código de autorización. Indispensable para disputas de cargo y conciliación financiera.
- `currency` preparado para soportar PEN y futuras monedas.
- El campo `transaction_id` es el ID que devuelve Culqi — único y trazable.

---

```sql
-- ============================================================
-- MÓDULO 5: PAGOS
-- ============================================================

CREATE TABLE payments (
    id             BIGSERIAL     PRIMARY KEY,
    order_id       BIGINT        NOT NULL REFERENCES orders(id),
    provider       VARCHAR(50)   NOT NULL DEFAULT 'CULQI',
    transaction_id VARCHAR(255)  NOT NULL,
    amount         NUMERIC(12,2) NOT NULL,
    currency       VARCHAR(3)    NOT NULL DEFAULT 'PEN',
    status         VARCHAR(30)   NOT NULL DEFAULT 'PENDING',
    metadata       JSONB,
    paid_at        TIMESTAMPTZ,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_payments_order          UNIQUE (order_id),
    CONSTRAINT uq_payments_transaction    UNIQUE (transaction_id),
    CONSTRAINT chk_payments_amount        CHECK  (amount > 0),
    CONSTRAINT chk_payments_status        CHECK  (status IN (
        'PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED'
    )),
    CONSTRAINT chk_payments_provider      CHECK  (provider IN ('CULQI')),
    CONSTRAINT chk_payments_currency      CHECK  (currency ~ '^[A-Z]{3}$')
);

COMMENT ON TABLE  payments                IS 'Registro de transacciones de pago';
COMMENT ON COLUMN payments.transaction_id IS 'ID devuelto por Culqi — único e irrepetible';
COMMENT ON COLUMN payments.metadata       IS 'Payload completo de Culqi en JSONB para conciliación y disputas';
COMMENT ON COLUMN payments.paid_at        IS 'NULL = pago no completado aún';
```

---

## 8. Módulo 6 — Envíos y Tracking

**Tablas:** `shipping_zones`, `shipping_rates`, `shipments`, `shipment_tracking`

### Por qué este diseño

- `shipping_zones` agrupa regiones geográficas con el mismo costo logístico: Lima Centro, Costa Norte, Sierra, Selva.
- `shipping_rates` define tarifas por tramo de peso dentro de cada zona. Así Shalom cobra diferente por un paquete de 1 kg vs 10 kg en la misma zona.
- `shipments` tiene `zone_id` para saber qué tarifa se aplicó y `tracking_code` para consultar el estado en la API de Shalom.
- `shipment_tracking` registra cada evento del paquete con `location` para mostrar al cliente dónde está su pedido en tiempo real.

---

```sql
-- ============================================================
-- MÓDULO 6: ENVÍOS Y TRACKING
-- ============================================================

CREATE TABLE shipping_zones (
    id     SERIAL       PRIMARY KEY,
    name   VARCHAR(100) NOT NULL,
    active BOOLEAN      NOT NULL DEFAULT TRUE,

    CONSTRAINT uq_shipping_zones_name UNIQUE (name)
);

COMMENT ON TABLE shipping_zones IS 'Zonas geográficas de envío con costos diferenciados';

INSERT INTO shipping_zones (name) VALUES
    ('LIMA_CENTRO'),
    ('LIMA_NORTE'),
    ('LIMA_SUR'),
    ('LIMA_ESTE'),
    ('COSTA_NORTE'),
    ('COSTA_SUR'),
    ('SIERRA'),
    ('SELVA');


-- ------------------------------------------------------------

CREATE TABLE shipping_rates (
    id         SERIAL        PRIMARY KEY,
    zone_id    INTEGER       NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
    weight_min NUMERIC(8,3)  NOT NULL DEFAULT 0,
    weight_max NUMERIC(8,3)  NOT NULL,
    price      NUMERIC(12,2) NOT NULL,

    CONSTRAINT chk_shipping_rates_weight CHECK (weight_min >= 0 AND weight_max > weight_min),
    CONSTRAINT chk_shipping_rates_price  CHECK (price >= 0)
);

COMMENT ON TABLE  shipping_rates            IS 'Tarifas de envío por tramo de peso y zona';
COMMENT ON COLUMN shipping_rates.weight_min IS 'Peso mínimo en kilogramos (inclusivo)';
COMMENT ON COLUMN shipping_rates.weight_max IS 'Peso máximo en kilogramos (inclusivo)';
COMMENT ON COLUMN shipping_rates.price      IS 'Costo de envío en soles (PEN)';


-- ------------------------------------------------------------

CREATE TABLE shipments (
    id            BIGSERIAL     PRIMARY KEY,
    order_id      BIGINT        NOT NULL REFERENCES orders(id),
    zone_id       INTEGER       REFERENCES shipping_zones(id) ON DELETE SET NULL,
    courier       VARCHAR(50)   NOT NULL DEFAULT 'SHALOM',
    tracking_code VARCHAR(100),
    shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    status        VARCHAR(30)   NOT NULL DEFAULT 'PENDING',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_shipments_order  UNIQUE (order_id),
    CONSTRAINT chk_shipments_status CHECK (status IN (
        'PENDING', 'HANDED_TO_COURIER', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED'
    )),
    CONSTRAINT chk_shipments_cost   CHECK (shipping_cost >= 0)
);

COMMENT ON TABLE  shipments               IS 'Envíos asociados a pedidos';
COMMENT ON COLUMN shipments.courier       IS 'Empresa de transporte — por defecto SHALOM';
COMMENT ON COLUMN shipments.tracking_code IS 'Código para consultar en la API de Shalom';
COMMENT ON COLUMN shipments.zone_id       IS 'Zona usada para calcular la tarifa aplicada';


-- ------------------------------------------------------------

CREATE TABLE shipment_tracking (
    id          BIGSERIAL    PRIMARY KEY,
    shipment_id BIGINT       NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    status      VARCHAR(30)  NOT NULL,
    location    VARCHAR(255),
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_shipment_tracking_status CHECK (status IN (
        'PENDING', 'HANDED_TO_COURIER', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED'
    ))
);

COMMENT ON TABLE  shipment_tracking             IS 'Línea de tiempo de eventos del paquete';
COMMENT ON COLUMN shipment_tracking.location    IS 'Ubicación del paquete — ej: Agencia Lima Norte, En camino a Cusco';
COMMENT ON COLUMN shipment_tracking.description IS 'Descripción del evento para mostrar al cliente';
```

---

## 9. Módulo 7 — Cupones y Promociones

**Tablas:** `coupons`, `coupon_redemptions`

### Por qué este diseño

- `max_uses` con `used_count` permite cupones de uso limitado sin consultas costosas de conteo.
- `discount_type` acepta `PERCENTAGE` (20% de descuento) o `FIXED` (S/10 de descuento).
- `min_order_amount` evita que el cupón se aplique a pedidos pequeños.
- `coupon_redemptions` previene que el mismo usuario use el mismo cupón más de una vez.

---

```sql
-- ============================================================
-- MÓDULO 7: CUPONES Y PROMOCIONES
-- ============================================================

CREATE TABLE coupons (
    id                SERIAL        PRIMARY KEY,
    code              VARCHAR(50)   NOT NULL,
    discount_type     VARCHAR(20)   NOT NULL,
    discount_value    NUMERIC(12,2) NOT NULL,
    min_order_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
    max_uses          INTEGER,
    used_count        INTEGER       NOT NULL DEFAULT 0,
    start_date        DATE          NOT NULL,
    end_date          DATE,
    active            BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_coupons_code          UNIQUE (code),
    CONSTRAINT chk_coupons_type         CHECK  (discount_type IN ('PERCENTAGE', 'FIXED')),
    CONSTRAINT chk_coupons_value        CHECK  (discount_value > 0),
    CONSTRAINT chk_coupons_pct_max      CHECK  (discount_type <> 'PERCENTAGE' OR discount_value <= 100),
    CONSTRAINT chk_coupons_min_amount   CHECK  (min_order_amount >= 0),
    CONSTRAINT chk_coupons_max_uses     CHECK  (max_uses IS NULL OR max_uses > 0),
    CONSTRAINT chk_coupons_used_count   CHECK  (used_count >= 0),
    CONSTRAINT chk_coupons_dates        CHECK  (end_date IS NULL OR end_date >= start_date)
);

COMMENT ON TABLE  coupons                  IS 'Cupones de descuento para campañas de marketing';
COMMENT ON COLUMN coupons.discount_type    IS 'PERCENTAGE = porcentaje, FIXED = monto fijo en soles';
COMMENT ON COLUMN coupons.max_uses         IS 'NULL = usos ilimitados';
COMMENT ON COLUMN coupons.used_count       IS 'Contador incremental para evitar queries de conteo';


-- ------------------------------------------------------------

CREATE TABLE coupon_redemptions (
    id          BIGSERIAL   PRIMARY KEY,
    coupon_id   INTEGER     NOT NULL REFERENCES coupons(id),
    user_id     BIGINT      NOT NULL REFERENCES users(id),
    order_id    BIGINT      NOT NULL REFERENCES orders(id),
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_coupon_redemptions_user_coupon UNIQUE (coupon_id, user_id)
);

COMMENT ON TABLE coupon_redemptions IS 'Registro de canjes de cupón — previene reutilización por usuario';
```

---

## 10. Módulo 8 — Wishlist

**Tablas:** `wishlists`, `wishlist_items`

### Por qué este diseño

La wishlist persistente permite al equipo de marketing identificar productos deseados, enviar notificaciones de reabastecimiento o bajada de precio, y medir la intención de compra futura.

---

```sql
-- ============================================================
-- MÓDULO 8: WISHLIST
-- ============================================================

CREATE TABLE wishlists (
    id         BIGSERIAL   PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_wishlists_user UNIQUE (user_id)
);

COMMENT ON TABLE wishlists IS 'Una wishlist por usuario para guardar productos favoritos';


-- ------------------------------------------------------------

CREATE TABLE wishlist_items (
    id          BIGSERIAL   PRIMARY KEY,
    wishlist_id BIGINT      NOT NULL REFERENCES wishlists(id)  ON DELETE CASCADE,
    product_id  BIGINT      NOT NULL REFERENCES products(id)   ON DELETE CASCADE,
    added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_wishlist_items_product UNIQUE (wishlist_id, product_id)
);

COMMENT ON TABLE wishlist_items IS 'Productos en la wishlist del usuario';
```

---

## 11. Módulo 9 — Notificaciones

**Tabla:** `notifications`

### Por qué este diseño

Las plantillas de email viven en el código (Thymeleaf/Freemarker), no en base de datos — facilitan el control de versiones y el despliegue. La tabla `notifications` solo registra cada mensaje enviado para auditoría y reenvío en caso de fallo. El campo `payload` guarda el contexto del mensaje (número de pedido, código de tracking) en JSONB para reprocessing.

---

```sql
-- ============================================================
-- MÓDULO 9: NOTIFICACIONES
-- ============================================================

CREATE TABLE notifications (
    id         BIGSERIAL    PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(100) NOT NULL,
    payload    JSONB        NOT NULL DEFAULT '{}',
    status     VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    channel    VARCHAR(20)  NOT NULL DEFAULT 'EMAIL',
    sent_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_notifications_status  CHECK (status  IN ('PENDING', 'SENT', 'FAILED', 'CANCELLED')),
    CONSTRAINT chk_notifications_channel CHECK (channel IN ('EMAIL', 'SMS', 'PUSH'))
);

COMMENT ON TABLE  notifications         IS 'Registro de notificaciones enviadas o pendientes';
COMMENT ON COLUMN notifications.type    IS 'Ej: ORDER_CREATED, ORDER_SHIPPED, PAYMENT_CONFIRMED, PASSWORD_RESET';
COMMENT ON COLUMN notifications.payload IS 'Contexto del mensaje en JSONB — usado para reenvíos y auditoría';
COMMENT ON COLUMN notifications.sent_at IS 'NULL = pendiente de envío o fallido';
```

---

## 12. Módulo 10 — Auditoría

**Tabla:** `audit_logs`

### Por qué este diseño

`old_value` y `new_value` en JSONB permiten ver exactamente qué cambió en cada operación. El campo `ip_address` ayuda a detectar accesos sospechosos y es requerido en muchas regulaciones de datos. Esta tabla solo debe tener INSERT — nunca UPDATE ni DELETE.

---

```sql
-- ============================================================
-- MÓDULO 10: AUDITORÍA
-- ============================================================

CREATE TABLE audit_logs (
    id         BIGSERIAL    PRIMARY KEY,
    user_id    BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    action     VARCHAR(100) NOT NULL,
    entity     VARCHAR(100) NOT NULL,
    entity_id  BIGINT,
    old_value  JSONB,
    new_value  JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  audit_logs            IS 'Log inmutable de acciones del sistema — solo INSERT permitido';
COMMENT ON COLUMN audit_logs.user_id    IS 'NULL = acción del sistema sin usuario autenticado';
COMMENT ON COLUMN audit_logs.action     IS 'Ej: PRODUCT_CREATED, ORDER_CANCELLED, PAYMENT_CONFIRMED, USER_LOGIN';
COMMENT ON COLUMN audit_logs.entity     IS 'Nombre de la tabla afectada — ej: products, orders, users';
COMMENT ON COLUMN audit_logs.old_value  IS 'Estado anterior en JSONB — NULL en creaciones';
COMMENT ON COLUMN audit_logs.new_value  IS 'Estado nuevo en JSONB — NULL en eliminaciones';
COMMENT ON COLUMN audit_logs.ip_address IS 'IPv4 o IPv6 del cliente — requerido para auditoría de seguridad';

-- Política de seguridad: solo INSERT en audit_logs
REVOKE UPDATE, DELETE ON audit_logs FROM PUBLIC;
```

---

## 13. Índices

Los índices se crean **después** de las tablas para no afectar el rendimiento de las inserciones masivas iniciales.

```sql
-- ============================================================
-- ÍNDICES DE RENDIMIENTO
-- ============================================================

-- MÓDULO 1: Seguridad
CREATE INDEX idx_users_email          ON users(email);
CREATE INDEX idx_users_active         ON users(active) WHERE active = TRUE;
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user  ON refresh_tokens(user_id);
CREATE INDEX idx_pwd_reset_user       ON password_reset_tokens(user_id);
CREATE INDEX idx_addresses_user       ON addresses(user_id);

-- MÓDULO 2: Catálogo
CREATE INDEX idx_products_active      ON products(active) WHERE active = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_products_slug        ON products(slug);
CREATE INDEX idx_products_sku         ON products(sku);
CREATE INDEX idx_product_prices_product ON product_prices(product_id);
CREATE INDEX idx_inventory_product    ON inventory(product_id);
CREATE INDEX idx_categories_parent    ON categories(parent_id);
CREATE INDEX idx_categories_slug      ON categories(slug);

-- Búsqueda de texto en productos (requiere extensión pg_trgm)
CREATE INDEX idx_products_name_trgm   ON products USING GIN (name gin_trgm_ops);

-- MÓDULO 3: Carrito
CREATE INDEX idx_cart_items_cart      ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product   ON cart_items(product_id);

-- MÓDULO 4: Pedidos
CREATE INDEX idx_orders_user          ON orders(user_id);
CREATE INDEX idx_orders_status        ON orders(status);
CREATE INDEX idx_orders_created       ON orders(created_at DESC);
CREATE INDEX idx_order_items_order    ON order_items(order_id);
CREATE INDEX idx_order_status_history ON order_status_history(order_id, created_at DESC);

-- MÓDULO 5: Pagos
CREATE INDEX idx_payments_order       ON payments(order_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_status      ON payments(status);

-- MÓDULO 6: Envíos
CREATE INDEX idx_shipments_order      ON shipments(order_id);
CREATE INDEX idx_shipments_tracking   ON shipments(tracking_code);
CREATE INDEX idx_shipment_tracking_id ON shipment_tracking(shipment_id, created_at DESC);

-- MÓDULO 7: Cupones
CREATE INDEX idx_coupons_code         ON coupons(code) WHERE active = TRUE;
CREATE INDEX idx_coupon_redemptions_user ON coupon_redemptions(user_id);

-- MÓDULO 8: Wishlist
CREATE INDEX idx_wishlist_items_user  ON wishlist_items(wishlist_id);

-- MÓDULO 9: Notificaciones
CREATE INDEX idx_notifications_user   ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status) WHERE status = 'PENDING';

-- MÓDULO 10: Auditoría
CREATE INDEX idx_audit_logs_user      ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity    ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_created   ON audit_logs(created_at DESC);
```

---

## 14. Orden de Ejecución

Ejecutar los scripts exactamente en este orden para respetar las dependencias de claves foráneas.

```
 1. users
 2. roles
 3. user_roles
 4. refresh_tokens
 5. password_reset_tokens
 6. addresses
 7. categories
 8. products
 9. product_categories
10. product_images
11. product_prices
12. inventory
13. carts
14. cart_items
15. orders
16. order_shipping_address
17. order_items
18. order_status_history
19. shipping_zones
20. shipping_rates
21. shipments
22. shipment_tracking
23. coupons
24. coupon_redemptions
25. payments
26. wishlists
27. wishlist_items
28. notifications
29. audit_logs
30. ÍNDICES (al final)
```

> **Importante:** Los índices siempre al final, especialmente el índice GIN de búsqueda de texto (`idx_products_name_trgm`) que puede tardar varios segundos en tablas grandes.

---

## Resumen de Tablas

| # | Tabla | Módulo | Filas estimadas (1 año) |
|---|---|---|---|
| 1 | `users` | Seguridad | 10K – 100K |
| 2 | `roles` | Seguridad | 2 |
| 3 | `user_roles` | Seguridad | = users |
| 4 | `refresh_tokens` | Seguridad | = sessions activas |
| 5 | `password_reset_tokens` | Seguridad | Baja |
| 6 | `addresses` | Seguridad | 2–3× users |
| 7 | `categories` | Catálogo | < 500 |
| 8 | `products` | Catálogo | 100 – 10K |
| 9 | `product_categories` | Catálogo | 2–3× products |
| 10 | `product_images` | Catálogo | 5–10× products |
| 11 | `product_prices` | Catálogo | Crece lentamente |
| 12 | `inventory` | Catálogo | = products |
| 13 | `carts` | Carrito | = users activos |
| 14 | `cart_items` | Carrito | Alta rotación |
| 15 | `orders` | Pedidos | 1K – 50K |
| 16 | `order_shipping_address` | Pedidos | = orders |
| 17 | `order_items` | Pedidos | 2–5× orders |
| 18 | `order_status_history` | Pedidos | 5–7× orders |
| 19 | `shipping_zones` | Envíos | 8–20 |
| 20 | `shipping_rates` | Envíos | < 200 |
| 21 | `shipments` | Envíos | = orders |
| 22 | `shipment_tracking` | Envíos | 5–10× shipments |
| 23 | `coupons` | Marketing | < 1K |
| 24 | `coupon_redemptions` | Marketing | = canjes |
| 25 | `payments` | Pagos | = orders pagados |
| 26 | `wishlists` | Wishlist | = users |
| 27 | `wishlist_items` | Wishlist | Variable |
| 28 | `notifications` | Sistema | Alta rotación |
| 29 | `audit_logs` | Sistema | Muy alta — particionar por fecha en producción |

---

*EcommerceBD.md — v1.0*
