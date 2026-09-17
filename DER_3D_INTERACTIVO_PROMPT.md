# 🚀 PROMPT MAESTRO: Diagrama de Entidad-Relación (DER) 3D Interactivo y Animado con Three.js

> **Instrucciones para el Agente:** Utiliza este documento como especificación técnica y conjunto de datos completo para construir una aplicación web interactiva en 3D que visualice el modelo de datos multi-tenant de **Cleo Platform** usando **Three.js**.

---

## 🎯 Objetivo y Prompt para el Agente Generador

```markdown
Actúa como un Desarrollador Web Creativo Senior y Diseñador 3D experto en Three.js, WebGL y UI/UX de alta fidelidad.

Tu misión es crear una aplicación web interactiva en 3D impresionante y de calidad "cyberpunk / sci-fi glassmorphism" que renderice el Diagrama de Entidad-Relación (DER) de la base de datos de Cleo Platform (37 tablas y más de 50 relaciones) proporcionada en la especificación inferior.

### Requisitos Visuales y Técnicos Obligatorios:
1. **Motor 3D y Gráficos:**
   - Usa **Three.js** (con `OrbitControls`, `EffectComposer`, `UnrealBloomPass` para efectos de resplandor neón/glow, y `Canvas` responsivo a pantalla completa).
   - Fondo espacial oscuro con gradiente radial profundo (`#080914` a `#020308`), rejilla de perspectiva infinita (*grid floor* animado) y partículas estelares flotantes.
   - Iluminación dinámica: Luces puntuales de colores según el dominio, luz ambiental suave y reflejos metálicos/vidrio.

2. **Representación de Nodos (Tablas de BD):**
   - Cada tabla se representa como una "caja de cristal holográfica" flotante (Mesh con bordes brillantes y caras translúcidas glassmorphism).
   - En la parte superior de cada nodo se muestra el nombre de la tabla (usando Sprite 2D, CanvasTexture o CSS2DRenderer/CSS3DRenderer para textos nítidos).
   - Animación de levitación suave (senoidal/ondulante en el eje Y) para que la escena se sienta viva.
   - Código de color por dominios:
     - 🟣 **Multi-Tenant & Auth:** `#8B5CF6` (Púrpura Neón)
     - 🔵 **Catálogo & Variantes:** `#3B82F6` (Azul Eléctrico)
     - 🟢 **Inventario & Stock:** `#10B981` (Verde Esmeralda)
     - 🟠 **Pedidos & Carrito:** `#F59E0B` (Ámbar / Naranja)
     - 🔴 **Pagos & Cupones:** `#EF4444` (Rojo Rubí)
     - 🩵 **Logística & Envíos:** `#06B6D4` (Cian)
     - 🩷 **SaaS, Notificaciones & Auditoría:** `#EC4899` (Rosa Fucsia)

3. **Representación de Relaciones (Foreign Keys / Conexiones):**
   - Líneas curvas 3D (`CatmullRomCurve3D` / `QuadraticBezierCurve3D`) o tubos luminosos que conectan las tablas padre e hijo.
   - **Partículas de Luz Animadas:** Pulsos de energía que viajan continuamente a lo largo de las curvas desde la tabla referenciada hacia la tabla dependiente para mostrar la dirección del flujo de datos.
   - Grosor y brillo reactivos: Al pasar el cursor sobre una tabla, sus conexiones se iluminan fuertemente y las no relacionadas se atenúan.

4. **Distribución Espacial (Layout 3D):**
   - Agrupa las tablas en clusters espaciales según su dominio temático (islas o constelaciones 3D conectadas).
   - Tabla central: `tenants` en el núcleo con enlaces hacia todos los dominios.

5. **Interactividad y Controles de Usuario:**
   - **Navegación 3D:** Rotación orbital, paneo, zoom con límites suaves de cámara.
   - **Click en una Tabla:**
     - La cámara realiza una transición animada suave (con Tween/LERP) para enfocar la tabla seleccionada.
     - Se abre un **Panel Lateral HUD (Glassmorphism)** con el detalle exhaustivo:
       - Nombre físico (`@@map`) y nombre en Prisma.
       - Dominio al que pertenece.
       - Lista completa de columnas con badges: 🔑 PK, 🔗 FK (con botón para viajar a la tabla enlazada), ⚡ UNIQUE, 🔒 NOT NULL, tipo de dato y valor por defecto.
       - Índices definidos.
   - **Buscador en Tiempo Real:** Input superior con autocompletado para buscar tablas o campos específicos y centrar la cámara en ellos al seleccionarlos.
   - **Filtro por Dominios:** Barra de botones con chips para encender/apagar dominios completos.
   - **Modo Cinemático (Auto-Rotate):** Botón para activar/pausar un giro cinemático de presentación.
   - **Botón Reset Vista:** Devuelve la cámara a la perspectiva isométrica general.
```

---

## 🗄️ Diccionario y Estructura Completa de la Base de Datos (37 Tablas)

### 1. Dominio: Multi-Tenant, Usuarios y Autenticación (Púrpura #8B5CF6)

#### 1.1 `tenants` (Tenant)
- **Descripción:** Tabla raíz de aislamiento multi-tenant.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `name` (VARCHAR(150), NOT NULL) - Nombre de la tienda
  - `slug` (VARCHAR(150), UNIQUE, NOT NULL) - Identificador en URL
  - `domain` (VARCHAR(255), UNIQUE, Nullable) - Dominio propio personalizado
  - `subdomain` (VARCHAR(150), UNIQUE, Nullable) - Subdominio
  - `description` (TEXT, Nullable)
  - `logo_url` (TEXT, Nullable)
  - `favicon_url` (TEXT, Nullable)
  - `primary_color` (VARCHAR(20), DEFAULT '#6A2CFF')
  - `secondary_color` (VARCHAR(20), DEFAULT '#1976FF')
  - `status` (VARCHAR(30), DEFAULT 'ACTIVE') - ACTIVE, SUSPENDED, DELETED
  - `active` (BOOLEAN, DEFAULT true)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, Nullable)
- **Relaciones Salientes:** Hacia casi todas las tablas del sistema vía `tenant_id`.

#### 1.2 `tenant_settings` (TenantSettings)
- **Descripción:** Configuración local 1:1 de cada tenant.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `tenant_id` (BIGINT, UNIQUE, FK → `tenants.id`)
  - `currency` (VARCHAR(10), DEFAULT 'PEN')
  - `timezone` (VARCHAR(50), DEFAULT 'America/Lima')
  - `locale` (VARCHAR(20), DEFAULT 'es_PE')
  - `support_email` (VARCHAR(255), Nullable)
  - `support_phone` (VARCHAR(30), Nullable)
  - `address` (TEXT, Nullable)
  - `business_hours` (JSON, Nullable)
  - `settings` (JSON, Nullable)
  - `updated_at` (TIMESTAMPTZ)

#### 1.3 `users` (User)
- **Descripción:** Usuarios globales del ecosistema (clientes, administradores, super admins).
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `auth_user_id` (UUID, UNIQUE, Nullable)
  - `email` (VARCHAR(255), UNIQUE, NOT NULL)
  - `password` (VARCHAR(255), Nullable)
  - `first_name` (VARCHAR(100), NOT NULL)
  - `last_name` (VARCHAR(100), NOT NULL)
  - `phone` (VARCHAR(30), Nullable)
  - `active` (BOOLEAN, DEFAULT true)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, Nullable)

#### 1.4 `roles` (Role)
- **Descripción:** Roles y niveles de permisos del sistema.
- **Campos:**
  - `id` (INT, PK, autoincrement)
  - `name` (VARCHAR(50), UNIQUE, NOT NULL) - PLATFORM_SUPER_ADMIN, TENANT_ADMIN, TENANT_MANAGER, CUSTOMER
  - `scope` (VARCHAR(30), DEFAULT 'TENANT') - PLATFORM | TENANT
  - `description` (TEXT, Nullable)
  - `active` (BOOLEAN, DEFAULT true)

#### 1.5 `user_tenants` (UserTenant)
- **Descripción:** Tabla pivote N:M entre Usuarios, Tenants y Roles.
- **Campos:**
  - `user_id` (BIGINT, PK compuesto, FK → `users.id`)
  - `tenant_id` (BIGINT, PK compuesto, FK → `tenants.id`)
  - `role_id` (INT, FK → `roles.id`)
  - `active` (BOOLEAN, DEFAULT true)
  - `joined_at` (TIMESTAMPTZ, DEFAULT now())

#### 1.6 `addresses` (Address)
- **Descripción:** Libreta de direcciones guardadas por los usuarios.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `user_id` (BIGINT, FK → `users.id`)
  - `department` (VARCHAR(100), NOT NULL)
  - `province` (VARCHAR(100), NOT NULL)
  - `district` (VARCHAR(100), NOT NULL)
  - `address_line` (TEXT, NOT NULL)
  - `reference` (TEXT, Nullable)
  - `postal_code` (VARCHAR(20), Nullable)
  - `is_default` (BOOLEAN, DEFAULT false)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())
  - `updated_at` (TIMESTAMPTZ)

---

### 2. Dominio: Catálogo de Productos y Variantes (Azul #3B82F6)

#### 2.1 `categories` (Category)
- **Descripción:** Categorías jerárquicas de productos (árbol con autorreferencia).
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `tenant_id` (BIGINT, FK → `tenants.id`)
  - `parent_id` (BIGINT, Nullable, FK → `categories.id`)
  - `name` (VARCHAR(150), NOT NULL)
  - `slug` (VARCHAR(150), NOT NULL)
  - `description` (TEXT, Nullable)
  - `image_url` (TEXT, Nullable)
  - `active` (BOOLEAN, DEFAULT true)
  - `display_order` (INT, DEFAULT 0)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, Nullable)
- **Constraints:** UNIQUE(`tenant_id`, `slug`)

#### 2.2 `products` (Product)
- **Descripción:** Producto principal o cabecera del catálogo.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `tenant_id` (BIGINT, FK → `tenants.id`)
  - `name` (VARCHAR(255), NOT NULL)
  - `slug` (VARCHAR(255), NOT NULL)
  - `base_sku` (VARCHAR(100), Nullable)
  - `description` (TEXT, Nullable)
  - `short_description` (TEXT, Nullable)
  - `brand` (VARCHAR(150), Nullable)
  - `weight` (DECIMAL(12,3), Nullable)
  - `height` (DECIMAL(12,3), Nullable)
  - `width` (DECIMAL(12,3), Nullable)
  - `length` (DECIMAL(12,3), Nullable)
  - `has_variants` (BOOLEAN, DEFAULT false)
  - `featured` (BOOLEAN, DEFAULT false)
  - `active` (BOOLEAN, DEFAULT true)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ, Nullable)
- **Constraints:** UNIQUE(`tenant_id`, `slug`), UNIQUE(`tenant_id`, `base_sku`)

#### 2.3 `product_categories` (ProductCategory)
- **Descripción:** Pivote N:M entre Productos y Categorías.
- **Campos:**
  - `product_id` (BIGINT, PK compuesto, FK → `products.id`)
  - `category_id` (BIGINT, PK compuesto, FK → `categories.id`)

#### 2.4 `product_variants` (ProductVariant)
- **Descripción:** SKU comercial específico (combinación de atributos o producto simple).
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `product_id` (BIGINT, FK → `products.id`)
  - `sku` (VARCHAR(100), NOT NULL)
  - `name` (VARCHAR(150), Nullable)
  - `weight` (DECIMAL(12,3), Nullable)
  - `height` (DECIMAL(12,3), Nullable)
  - `width` (DECIMAL(12,3), Nullable)
  - `length` (DECIMAL(12,3), Nullable)
  - `active` (BOOLEAN, DEFAULT true)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())
  - `updated_at` (TIMESTAMPTZ)
- **Constraints:** UNIQUE(`product_id`, `sku`)

#### 2.5 `product_options` (ProductOption)
- **Descripción:** Atributos/opciones definidos por el tenant (ej. Talla, Color, Presentación).
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `tenant_id` (BIGINT, FK → `tenants.id`)
  - `name` (VARCHAR(100), NOT NULL)
  - `display_type` (VARCHAR(30), DEFAULT 'BUTTON')
  - `display_order` (INT, DEFAULT 0)
  - `active` (BOOLEAN, DEFAULT true)
- **Constraints:** UNIQUE(`tenant_id`, `name`)

#### 2.6 `product_option_values` (ProductOptionValue)
- **Descripción:** Valores específicos de las opciones (ej. 'Rojo', 'Azul', '10kg', '250g').
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `option_id` (BIGINT, FK → `product_options.id`)
  - `value` (VARCHAR(100), NOT NULL)
  - `label` (VARCHAR(100), NOT NULL)
  - `color_hex` (VARCHAR(20), Nullable)
  - `image_url` (TEXT, Nullable)
  - `display_order` (INT, DEFAULT 0)
- **Constraints:** UNIQUE(`option_id`, `value`)

#### 2.7 `product_variant_options` (ProductVariantOption)
- **Descripción:** Asignación de opciones activas a un producto.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `product_id` (BIGINT, FK → `products.id`)
  - `option_id` (BIGINT, FK → `product_options.id`)
- **Constraints:** UNIQUE(`product_id`, `option_id`)

#### 2.8 `product_variant_values` (ProductVariantValue)
- **Descripción:** Cruce exacto de qué valores componen cada variante física.
- **Campos:**
  - `variant_id` (BIGINT, PK compuesto, FK → `product_variants.id`)
  - `option_value_id` (BIGINT, PK compuesto, FK → `product_option_values.id`)

#### 2.9 `product_images` (ProductImage)
- **Descripción:** Galería multimedia de productos y variantes.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `product_id` (BIGINT, FK → `products.id`)
  - `url` (TEXT, NOT NULL)
  - `alt_text` (VARCHAR(255), Nullable)
  - `display_order` (INT, DEFAULT 0)
  - `is_primary` (BOOLEAN, DEFAULT false)

#### 2.10 `product_prices` (ProductPrice)
- **Descripción:** Historial y vigencia de precios por variante.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `variant_id` (BIGINT, FK → `product_variants.id`)
  - `price` (DECIMAL(12,2), NOT NULL)
  - `compare_at_price` (DECIMAL(12,2), Nullable)
  - `currency` (VARCHAR(10), DEFAULT 'PEN')
  - `start_date` (DATE, DEFAULT now())
  - `end_date` (DATE, Nullable)
  - `is_active` (BOOLEAN, DEFAULT true)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())

---

### 3. Dominio: Inventario y Movimientos (Verde #10B981)

#### 3.1 `inventory` (Inventory)
- **Descripción:** Balance de stock en tiempo real por variante (evita sobreventas).
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `variant_id` (BIGINT, UNIQUE, FK → `product_variants.id`)
  - `available_stock` (INT, DEFAULT 0)
  - `reserved_stock` (INT, DEFAULT 0)
  - `minimum_stock` (INT, DEFAULT 5)
  - `updated_at` (TIMESTAMPTZ)

#### 3.2 `inventory_movements` (InventoryMovement)
- **Descripción:** Kardex / Libro de auditoría de cada unidad que entra o sale.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `tenant_id` (BIGINT, FK → `tenants.id`)
  - `variant_id` (BIGINT, FK → `product_variants.id`)
  - `movement_type` (VARCHAR(40), NOT NULL) - PURCHASE, SALE, RESERVATION, RELEASE, RETURN, ADJUSTMENT
  - `quantity` (INT, NOT NULL)
  - `stock_before` (INT, NOT NULL)
  - `stock_after` (INT, NOT NULL)
  - `reference_type` (VARCHAR(50), Nullable) - ORDER, MANUAL, RETURN
  - `reference_id` (BIGINT, Nullable)
  - `note` (TEXT, Nullable)
  - `created_by` (BIGINT, Nullable, FK → `users.id`)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())

---

### 4. Dominio: Carrito y Wishlist (Ámbar #F59E0B)

#### 4.1 `carts` (Cart)
- **Descripción:** Canasta de compra persistida para sesiones anónimas o clientes logueados.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `tenant_id` (BIGINT, FK → `tenants.id`)
  - `user_id` (BIGINT, Nullable, FK → `users.id`)
  - `session_id` (VARCHAR(255), Nullable)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())
  - `updated_at` (TIMESTAMPTZ)

#### 4.2 `cart_items` (CartItem)
- **Descripción:** Ítems contenidos dentro del carrito.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `cart_id` (BIGINT, FK → `carts.id`)
  - `variant_id` (BIGINT, FK → `product_variants.id`)
  - `quantity` (INT, DEFAULT 1)
  - `unit_price_snapshot` (DECIMAL(12,2), NOT NULL)
  - `added_at` (TIMESTAMPTZ, DEFAULT now())
  - `updated_at` (TIMESTAMPTZ)
- **Constraints:** UNIQUE(`cart_id`, `variant_id`)

#### 4.3 `wishlists` (Wishlist)
- **Descripción:** Lista de favoritos por cliente en una tienda.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `tenant_id` (BIGINT, FK → `tenants.id`)
  - `user_id` (BIGINT, FK → `users.id`)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())
  - `updated_at` (TIMESTAMPTZ)
- **Constraints:** UNIQUE(`tenant_id`, `user_id`)

#### 4.4 `wishlist_items` (WishlistItem)
- **Descripción:** Productos guardados en favoritos.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `wishlist_id` (BIGINT, FK → `wishlists.id`)
  - `variant_id` (BIGINT, FK → `product_variants.id`)
  - `added_at` (TIMESTAMPTZ, DEFAULT now())
- **Constraints:** UNIQUE(`wishlist_id`, `variant_id`)

---

### 5. Dominio: Pedidos y Transacciones (Naranja #F97316)

#### 5.1 `orders` (Order)
- **Descripción:** Encabezado principal del pedido de compra.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `tenant_id` (BIGINT, FK → `tenants.id`)
  - `user_id` (BIGINT, FK → `users.id`)
  - `order_number` (VARCHAR(50), UNIQUE, NOT NULL) - ej. `ORD-2026-0001`
  - `status` (VARCHAR(40), DEFAULT 'PENDING_PAYMENT')
  - `subtotal` (DECIMAL(12,2), NOT NULL)
  - `shipping_cost` (DECIMAL(12,2), DEFAULT 0.00)
  - `discount_amount` (DECIMAL(12,2), DEFAULT 0.00)
  - `tax_amount` (DECIMAL(12,2), DEFAULT 0.00)
  - `total` (DECIMAL(12,2), NOT NULL)
  - `currency` (VARCHAR(10), DEFAULT 'PEN')
  - `payment_status` (VARCHAR(30), DEFAULT 'PENDING')
  - `fulfillment_status` (VARCHAR(30), DEFAULT 'UNFULFILLED')
  - `created_at` (TIMESTAMPTZ, DEFAULT now())
  - `updated_at` (TIMESTAMPTZ)
  - `cancelled_at` (TIMESTAMPTZ, Nullable)

#### 5.2 `order_shipping_address` (OrderShippingAddress)
- **Descripción:** Snapshot inmutable 1:1 de la dirección donde se entregará la orden.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `order_id` (BIGINT, UNIQUE, FK → `orders.id`)
  - `department` (VARCHAR(100), NOT NULL)
  - `province` (VARCHAR(100), NOT NULL)
  - `district` (VARCHAR(100), NOT NULL)
  - `address_line` (TEXT, NOT NULL)
  - `reference` (TEXT, Nullable)
  - `postal_code` (VARCHAR(20), Nullable)

#### 5.3 `order_items` (OrderItem)
- **Descripción:** Snapshot inmutable de cada producto vendido en la orden.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `order_id` (BIGINT, FK → `orders.id`)
  - `product_id` (BIGINT, FK → `products.id`)
  - `variant_id` (BIGINT, FK → `product_variants.id`)
  - `product_name` (VARCHAR(255), NOT NULL)
  - `product_sku` (VARCHAR(100), NOT NULL)
  - `variant_name` (VARCHAR(150), Nullable)
  - `unit_price` (DECIMAL(12,2), NOT NULL)
  - `quantity` (INT, NOT NULL)
  - `subtotal` (DECIMAL(12,2), NOT NULL)
  - `product_snapshot` (JSON, Nullable)

#### 5.4 `order_status_history` (OrderStatusHistory)
- **Descripción:** Bitácora de trazabilidad de cambios de estado del pedido.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `order_id` (BIGINT, FK → `orders.id`)
  - `changed_by` (BIGINT, Nullable, FK → `users.id`)
  - `status` (VARCHAR(40), NOT NULL)
  - `note` (TEXT, Nullable)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())

---

### 6. Dominio: Pagos y Cupones de Descuento (Rojo #EF4444)

#### 6.1 `payments` (Payment)
- **Descripción:** Registro de transacciones de pago vía pasarela (Culqi / Tarjetas).
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `order_id` (BIGINT, FK → `orders.id`)
  - `provider` (VARCHAR(50), DEFAULT 'CULQI')
  - `transaction_id` (VARCHAR(255), Nullable)
  - `idempotency_key` (VARCHAR(255), UNIQUE, Nullable)
  - `amount` (DECIMAL(12,2), NOT NULL)
  - `currency` (VARCHAR(10), DEFAULT 'PEN')
  - `status` (VARCHAR(40), DEFAULT 'PENDING')
  - `payment_method` (VARCHAR(50), Nullable)
  - `metadata` (JSON, Nullable)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())
  - `paid_at` (TIMESTAMPTZ, Nullable)
  - `failed_at` (TIMESTAMPTZ, Nullable)

#### 6.2 `payment_webhooks` (PaymentWebhook)
- **Descripción:** Registro crudo y auditoría de eventos Webhook de pasarelas de pago.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `payment_id` (BIGINT, Nullable, FK → `payments.id`)
  - `provider` (VARCHAR(50), NOT NULL)
  - `event_id` (VARCHAR(255), UNIQUE, NOT NULL)
  - `event_type` (VARCHAR(100), NOT NULL)
  - `payload` (JSON, NOT NULL)
  - `status` (VARCHAR(30), DEFAULT 'PENDING')
  - `processed` (BOOLEAN, DEFAULT false)
  - `processed_at` (TIMESTAMPTZ, Nullable)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())

#### 6.3 `coupons` (Coupon)
- **Descripción:** Reglas de cupones promocionales configurados por el tenant.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `tenant_id` (BIGINT, FK → `tenants.id`)
  - `code` (VARCHAR(50), NOT NULL)
  - `discount_type` (VARCHAR(30), DEFAULT 'PERCENTAGE') - PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING
  - `discount_value` (DECIMAL(12,2), NOT NULL)
  - `max_discount_amount` (DECIMAL(12,2), Nullable)
  - `min_order_amount` (DECIMAL(12,2), Nullable)
  - `max_uses` (INT, Nullable)
  - `used_count` (INT, DEFAULT 0)
  - `per_user_limit` (INT, DEFAULT 1)
  - `start_date` (DATE, DEFAULT now())
  - `end_date` (DATE, NOT NULL)
  - `active` (BOOLEAN, DEFAULT true)
- **Constraints:** UNIQUE(`tenant_id`, `code`)

#### 6.4 `coupon_redemptions` (CouponRedemption)
- **Descripción:** Registro de canjes efectivos de cupones en compras.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `coupon_id` (BIGINT, FK → `coupons.id`)
  - `user_id` (BIGINT, FK → `users.id`)
  - `order_id` (BIGINT, FK → `orders.id`)
  - `discount_amount` (DECIMAL(12,2), NOT NULL)
  - `redeemed_at` (TIMESTAMPTZ, DEFAULT now())

---

### 7. Dominio: Envíos y Logística (Cian #06B6D4)

#### 7.1 `shipping_zones` (ShippingZone)
- **Descripción:** Zonas geográficas de cobertura de despacho.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `tenant_id` (BIGINT, FK → `tenants.id`)
  - `name` (VARCHAR(100), NOT NULL)
  - `active` (BOOLEAN, DEFAULT true)
- **Constraints:** UNIQUE(`tenant_id`, `name`)

#### 7.2 `shipping_rates` (ShippingRate)
- **Descripción:** Tarifario de envíos por rangos de peso.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `zone_id` (BIGINT, FK → `shipping_zones.id`)
  - `weight_min` (DECIMAL(12,3), NOT NULL)
  - `weight_max` (DECIMAL(12,3), NOT NULL)
  - `price` (DECIMAL(12,2), NOT NULL)
  - `currency` (VARCHAR(10), DEFAULT 'PEN')
  - `active` (BOOLEAN, DEFAULT true)

#### 7.3 `shipments` (Shipment)
- **Descripción:** Despacho físico de un pedido a través de un courier.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `tenant_id` (BIGINT, FK → `tenants.id`)
  - `order_id` (BIGINT, UNIQUE, FK → `orders.id`)
  - `zone_id` (BIGINT, Nullable, FK → `shipping_zones.id`)
  - `courier` (VARCHAR(100), Nullable) - Olva, Shalom, 99minutos
  - `delivery_service` (VARCHAR(100), Nullable)
  - `tracking_code` (VARCHAR(150), Nullable)
  - `shipping_cost` (DECIMAL(12,2), DEFAULT 0.00)
  - `status` (VARCHAR(40), DEFAULT 'PENDING')
  - `shipped_at` (TIMESTAMPTZ, Nullable)
  - `delivered_at` (TIMESTAMPTZ, Nullable)

#### 7.4 `shipment_tracking` (ShipmentTracking)
- **Descripción:** Eventos de seguimiento e hitos de entrega en ruta.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `shipment_id` (BIGINT, FK → `shipments.id`)
  - `status` (VARCHAR(50), NOT NULL)
  - `location` (VARCHAR(150), Nullable)
  - `description` (TEXT, Nullable)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())

---

### 8. Dominio: Plataforma SaaS, Auditoría y Notificaciones (Rosa #EC4899)

#### 8.1 `plans` (Plan)
- **Descripción:** Planes de suscripción SaaS para tenants (Free, Basic, Pro, Enterprise).
- **Campos:**
  - `id` (INT, PK, autoincrement)
  - `name` (VARCHAR(50), UNIQUE, NOT NULL)
  - `display_name` (VARCHAR(100), NOT NULL)
  - `description` (TEXT, Nullable)
  - `price` (DECIMAL(10,2), NOT NULL)
  - `currency` (VARCHAR(10), DEFAULT 'PEN')
  - `billing_cycle` (VARCHAR(20), DEFAULT 'MONTHLY')
  - `active` (BOOLEAN, DEFAULT true)
  - `sort_order` (INT, DEFAULT 0)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())

#### 8.2 `plan_limits` (PlanLimit)
- **Descripción:** Restricciones de cuotas por plan (máx productos, órdenes, almacenamiento).
- **Campos:**
  - `id` (INT, PK, autoincrement)
  - `plan_id` (INT, FK → `plans.id`)
  - `resource` (VARCHAR(50), NOT NULL) - products, orders, users, storage_mb
  - `max_limit` (INT, NOT NULL) - (-1 para ilimitado)
  - `description` (TEXT, Nullable)
- **Constraints:** UNIQUE(`plan_id`, `resource`)

#### 8.3 `subscriptions` (Subscription)
- **Descripción:** Suscripción activa y ciclo de facturación de cada tenant.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `tenant_id` (BIGINT, UNIQUE, FK → `tenants.id`)
  - `plan_id` (INT, FK → `plans.id`)
  - `status` (VARCHAR(20), DEFAULT 'ACTIVE')
  - `trial_starts_at` (TIMESTAMPTZ, Nullable)
  - `trial_ends_at` (TIMESTAMPTZ, Nullable)
  - `current_period_start` (TIMESTAMPTZ, DEFAULT now())
  - `current_period_end` (TIMESTAMPTZ, NOT NULL)
  - `cancelled_at` (TIMESTAMPTZ, Nullable)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())
  - `updated_at` (TIMESTAMPTZ)

#### 8.4 `notifications` (Notification)
- **Descripción:** Bandeja de mensajes y correos transaccionales enviados.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `tenant_id` (BIGINT, FK → `tenants.id`)
  - `user_id` (BIGINT, FK → `users.id`)
  - `type` (VARCHAR(50), NOT NULL)
  - `channel` (VARCHAR(30), DEFAULT 'EMAIL')
  - `payload` (JSON, NOT NULL)
  - `status` (VARCHAR(30), DEFAULT 'PENDING')
  - `sent_at` (TIMESTAMPTZ, Nullable)
  - `read_at` (TIMESTAMPTZ, Nullable)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())

#### 8.5 `audit_logs` (AuditLog)
- **Descripción:** Auditoría inmutable de mutaciones para compliance y seguridad.
- **Campos:**
  - `id` (BIGINT, PK, autoincrement)
  - `tenant_id` (BIGINT, Nullable, FK → `tenants.id`)
  - `user_id` (BIGINT, Nullable, FK → `users.id`)
  - `action` (VARCHAR(100), NOT NULL) - CREATE, UPDATE, DELETE
  - `entity` (VARCHAR(100), NOT NULL) - products, orders, coupons, etc.
  - `entity_id` (BIGINT, Nullable)
  - `old_value` (JSON, Nullable)
  - `newValue` (JSON, Nullable)
  - `ip_address` (VARCHAR(45), Nullable)
  - `user_agent` (TEXT, Nullable)
  - `created_at` (TIMESTAMPTZ, DEFAULT now())

---

## 🔗 Matriz Rápida de Relaciones (Foreign Keys)

| Origen (Tabla Dependiente) | Campo FK | Destino (Tabla Principal) | Campo PK | Tipo Relación |
| :--- | :--- | :--- | :--- | :--- |
| `tenant_settings` | `tenant_id` | `tenants` | `id` | 1:1 (Cascade) |
| `user_tenants` | `user_id` | `users` | `id` | N:1 (Cascade) |
| `user_tenants` | `tenant_id` | `tenants` | `id` | N:1 (Cascade) |
| `user_tenants` | `role_id` | `roles` | `id` | N:1 |
| `addresses` | `user_id` | `users` | `id` | N:1 (Cascade) |
| `categories` | `tenant_id` | `tenants` | `id` | N:1 (Cascade) |
| `categories` | `parent_id` | `categories` | `id` | 1:N (Autorreferencia) |
| `products` | `tenant_id` | `tenants` | `id` | N:1 (Cascade) |
| `product_categories` | `product_id` | `products` | `id` | N:1 (Cascade) |
| `product_categories` | `category_id` | `categories` | `id` | N:1 (Cascade) |
| `product_variants` | `product_id` | `products` | `id` | 1:N (Cascade) |
| `product_options` | `tenant_id` | `tenants` | `id` | N:1 (Cascade) |
| `product_option_values` | `option_id` | `product_options` | `id` | 1:N (Cascade) |
| `product_variant_options`| `product_id`| `products` | `id` | N:1 (Cascade) |
| `product_variant_options`| `option_id` | `product_options` | `id` | N:1 (Cascade) |
| `product_variant_values` | `variant_id`| `product_variants` | `id` | N:1 (Cascade) |
| `product_variant_values` | `option_value_id` | `product_option_values` | `id` | N:1 (Cascade) |
| `product_images` | `product_id` | `products` | `id` | 1:N (Cascade) |
| `product_prices` | `variant_id` | `product_variants` | `id` | 1:N (Cascade) |
| `inventory` | `variant_id` | `product_variants` | `id` | 1:1 (Cascade) |
| `inventory_movements` | `tenant_id` | `tenants` | `id` | N:1 (Cascade) |
| `inventory_movements` | `variant_id` | `product_variants` | `id` | N:1 (Cascade) |
| `inventory_movements` | `created_by` | `users` | `id` | N:1 (SetNull) |
| `carts` | `tenant_id` | `tenants` | `id` | N:1 (Cascade) |
| `carts` | `user_id` | `users` | `id` | N:1 (Cascade) |
| `cart_items` | `cart_id` | `carts` | `id` | 1:N (Cascade) |
| `cart_items` | `variant_id` | `product_variants` | `id` | N:1 (Cascade) |
| `wishlists` | `tenant_id` | `tenants` | `id` | N:1 (Cascade) |
| `wishlists` | `user_id` | `users` | `id` | N:1 (Cascade) |
| `wishlist_items` | `wishlist_id`| `wishlists` | `id` | 1:N (Cascade) |
| `wishlist_items` | `variant_id` | `product_variants` | `id` | N:1 (Cascade) |
| `orders` | `tenant_id` | `tenants` | `id` | N:1 (Cascade) |
| `orders` | `user_id` | `users` | `id` | N:1 (Cascade) |
| `order_shipping_address`| `order_id` | `orders` | `id` | 1:1 (Cascade) |
| `order_items` | `order_id` | `orders` | `id` | 1:N (Cascade) |
| `order_items` | `product_id` | `products` | `id` | N:1 |
| `order_items` | `variant_id` | `product_variants` | `id` | N:1 |
| `order_status_history` | `order_id` | `orders` | `id` | 1:N (Cascade) |
| `order_status_history` | `changed_by` | `users` | `id` | N:1 (SetNull) |
| `payments` | `order_id` | `orders` | `id` | 1:N (Cascade) |
| `payment_webhooks` | `payment_id` | `payments` | `id` | N:1 (SetNull) |
| `shipping_zones` | `tenant_id` | `tenants` | `id` | N:1 (Cascade) |
| `shipping_rates` | `zone_id` | `shipping_zones` | `id` | 1:N (Cascade) |
| `shipments` | `tenant_id` | `tenants` | `id` | N:1 (Cascade) |
| `shipments` | `order_id` | `orders` | `id` | 1:1 (Cascade) |
| `shipments` | `zone_id` | `shipping_zones` | `id` | N:1 (SetNull) |
| `shipment_tracking` | `shipment_id` | `shipments` | `id` | 1:N (Cascade) |
| `coupons` | `tenant_id` | `tenants` | `id` | N:1 (Cascade) |
| `coupon_redemptions` | `coupon_id` | `coupons` | `id` | 1:N (Cascade) |
| `coupon_redemptions` | `user_id` | `users` | `id` | N:1 (Cascade) |
| `coupon_redemptions` | `order_id` | `orders` | `id` | N:1 (Cascade) |
| `notifications` | `tenant_id` | `tenants` | `id` | N:1 (Cascade) |
| `notifications` | `user_id` | `users` | `id` | N:1 (Cascade) |
| `audit_logs` | `tenant_id` | `tenants` | `id` | N:1 (SetNull) |
| `audit_logs` | `user_id` | `users` | `id` | N:1 (SetNull) |
| `plan_limits` | `plan_id` | `plans` | `id` | 1:N (Cascade) |
| `subscriptions` | `tenant_id` | `tenants` | `id` | 1:1 (Cascade) |
| `subscriptions` | `plan_id` | `plans` | `id` | N:1 |
