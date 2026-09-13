# 📋 Checklist de Construcción — Cleo Platform (SaaS Multi-Tenant)

Este documento sirve como hoja de ruta operativa para dar seguimiento y construir sistemáticamente cada una de las funcionalidades pendientes de **Cleo Platform**.

---

## 🏗️ RELEASE 1: Platform Core & Seguridad

### Fase 0 — Definición y Arquitectura
- [x] Diseñar el DER multi-tenant completo (37 tablas).
- [x] Definir la estructura monorepo `apps/api` (NestJS) y `apps/web` (React + Vite).
- [x] Documentar `README.md`, `roadmap.md` y `implementation_plan.md`.
- [x] Crear documentación técnica complementaria:
  - [x] `docs/ARCHITECTURE.md` (Flujos de petición y contexto multi-tenant).
  - [x] `docs/DATABASE.md` (Diccionario de datos e índices).
  - [x] `docs/API.md` (Contratos REST y convenciones).
  - [x] `docs/SECURITY.md` (Políticas RBAC y mitigación OWASP).
  - [x] `docs/BUSINESS-RULES.md` (Reglas de stock, pedidos y pagos).
  - [x] `docs/DEPLOYMENT.md` (Runbook de despliegue y lanzamiento).

### Fase 1 — Infraestructura Base
- [x] Inicializar proyecto backend en `apps/api` (NestJS 10, TypeScript, Prisma 6).
- [x] Inicializar proyecto frontend en `apps/web` (React 19, Vite, Tailwind CSS, Lucide React).
- [x] Configurar Swagger OpenAPI en `/api/docs`.
- [x] Configurar `TransformInterceptor` (serialización BigInt segura) y `HttpExceptionFilter`.
- [x] Configurar scripts unificados en el `package.json` raíz.

### Fase 2 — Base de Datos y Aislamiento Multi-Tenant
- [x] Crear modelos `Tenant`, `TenantSettings`, `User`, `Role`, `UserTenant`, `Address`.
- [x] Implementar `TenantGuard` (resolución por header `x-tenant-slug`, subdominio y fallback).
- [x] Crear decorador `@CurrentTenant()` y `@CurrentUser()`.
- [x] Seed inicial con **Cleo-Ecommerce** (Tenant #1) y **Moda Perú** (Tenant #2).
- [x] Implementar middleware o extensión Prisma para filtrado automático por `tenantId` en queries de lectura.

### Fase 3 — Autenticación y RBAC
- [x] Endpoints `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/profile`.
- [x] Hash de contraseñas con `bcryptjs` y emisión de tokens JWT.
- [x] `RolesGuard` con soporte de `PLATFORM_SUPER_ADMIN`, `TENANT_ADMIN`, `TENANT_MANAGER`, `CUSTOMER`.
- [x] Endpoint `POST /api/auth/forgot-password` (envío de token de recuperación).
- [x] Endpoint `POST /api/auth/reset-password` (cambio seguro de contraseña).
- [x] Configurar `@nestjs/throttler` (Rate Limiting anti-fuerza bruta).
- [x] Configurar `helmet` y cabeceras de seguridad HTTP.

### Fase 4 & 5 — Paneles Administrativos y Gestión de Tiendas
- [x] Vista Super Admin `/platform` con métricas y listado de tenants.
- [x] Modal para registrar nuevos tenants con slug, colores y dominio.
- [x] Vista `/platform/usuarios` para asignar roles y vincular usuarios a tenants.
- [x] Acciones de suspender, reactivar y eliminar tenants desde `/platform`.
- [x] Vista `/admin/configuracion` para que el Tenant Admin edite `TENANT_SETTINGS` (horarios, contacto, moneda, redes).

---

## 🛍️ RELEASE 2: Commerce Core (Catálogo, Inventario y Carrito)

### Fase 6 — Catálogo de Productos y Variantes
- [x] Modelos de `Category`, `Product`, `ProductVariant`, `ProductOption`, `ProductOptionValue`, `ProductPrice`, `ProductImage`.
- [x] Endpoints públicos `/api/store/products`, `/api/store/products/:slug`, `/api/store/categories`.
- [x] Filtros por categoría, búsqueda por texto y destacado en storefront.
- [x] Vista de detalle de producto `/products/:slug` con selector interactivo de variantes (250g, 500g, 1kg).
- [x] CRUD completo de categorías en `/admin/categorias` (crear, editar, jerarquía, ordenar).
- [x] Edición y eliminación de productos en `/admin/productos`.
- [x] Creador de variantes con combinaciones de opciones (ej. Talla x Color o Peso).
- [x] Integración con Supabase Storage para subida de fotos de productos.

### Fase 7 — Inventario y Prevención de Sobreventas
- [x] Modelos `Inventory` (`available_stock`, `reserved_stock`) e `InventoryMovement`.
- [x] Reserva de stock en creación de pedido y confirmación en pago.
- [x] Alertas de stock bajo (< 10 unidades) en Dashboard Admin.
- [x] Vista `/admin/inventario` para registrar movimientos manuales (ingresos de proveedor, mermas, ajustes).
- [x] Cron Job en NestJS para liberar stock reservado de pedidos no pagados tras 30 minutos.

### Fase 8 & 9 — Carrito y Wishlist
- [x] Contexto de carrito con persistencia local (`useCart`) y Slide-over Cart Drawer.
- [x] Control de cantidades, cálculo dinámico y eliminación de ítems.
- [x] Endpoints `/api/store/cart` y `/api/store/cart/items` para sincronizar carrito en base de datos al iniciar sesión.
- [x] Modelos `Wishlist` y `WishlistItem` conectados con endpoints `/api/store/wishlist`.
- [x] Vista de favoritos en frontend `/favoritos` con botón de mover a carrito.

---

## 💳 RELEASE 3: Transaction Core (Checkout, Pagos y Logística)

### Fase 10 — Checkout
- [x] Formulario de captura de dirección de envío (departamento, provincia, distrito, referencia).
- [x] Selección de zonas de envío dinámicas desde la API.
- [x] Input de validación de cupones de descuento.
- [x] Resumen financiero detallado (subtotal, envío, descuento, total).

### Fase 11 — Pedidos y Snapshots Históricos
- [x] Transacción atómica `$transaction` en `OrdersService.createOrder`.
- [x] Snapshots inmutables de productos en `ORDER_ITEMS` y de dirección en `ORDER_SHIPPING_ADDRESS`.
- [x] Registro inicial en `ORDER_STATUS_HISTORY` y generación de número de pedido único (`ORD-XXXX`).
- [x] Vista de cliente `/mis-pedidos` con listado de pedidos.
- [x] Vista administrativa `/admin/pedidos/:id` con detalle y cambio de estados (`READY_TO_SHIP`, `SHIPPED`, `DELIVERED`, `CANCELLED`).

### Fase 12 & 13 — Pagos con Culqi y Webhooks
- [x] Endpoint `/api/store/payments/process` procesando pago y deduciendo inventario permanente.
- [x] Registro en `PAYMENTS` con ID de transacción e idempotencia.
- [x] Endpoint de Webhook público `/api/payments/webhooks/culqi` para recepción asíncrona de eventos.
- [x] Validación de firmas criptográficas de webhook y registro en `PAYMENT_WEBHOOKS`.
- [x] Soporte para reembolsos (`REFUNDED`) y reversa de inventario.

### Fase 14 — Envíos y Tracking
- [x] Modelos `ShippingZone`, `ShippingRate`, `Shipment`, `ShipmentTracking`.
- [x] Creación automática de envío y primer evento de tracking al crear el pedido.
- [x] Visualización del estado del envío en `/mis-pedidos`.
- [x] Formulario administrativo para asignar courier (Olva, Shalom, 99Minutos) y código de tracking.
- [x] Actualización de eventos de tracking (`EN_TRANSITO`, `EN_REPARTO`, `ENTREGADO`).

### Fase 15 — Cupones de Descuento
- [x] Modelo `Coupon` y `CouponRedemption`.
- [x] Endpoint `POST /api/store/coupons/validate` (validación de porcentaje, monto mínimo y límite de usos).
- [x] Vista `/admin/cupones` para que el Tenant Admin cree nuevos cupones (% o monto fijo, fechas de vigencia).

### Fase 16 — Notificaciones Transaccionales
- [x] Modelo `Notification` en Prisma.
- [x] Configurar servicio de correos en NestJS (`nodemailer` / `resend`).
- [x] Plantillas HTML responsivas con la paleta de Cleo:
  - [x] Email de Bienvenida y Activación.
  - [x] Email de Confirmación de Pedido y Pago Culqi.
  - [x] Email de Despacho con Código de Seguimiento.
  - [x] Email de Restablecimiento de Contraseña.

### Fase 17 & 18 — Auditoría y Reportes
- [x] Modelo `AuditLog` en Prisma.
- [x] `AuditInterceptor` en NestJS para registrar automáticamente mutaciones (`CREATE`, `UPDATE`, `DELETE`).
- [x] KPIs de ventas totales, pedidos y catálogo en Dashboard Admin.
- [x] Gráficos de tendencias de ventas semanales/mensuales (Recharts).
- [x] Exportación de reportes de ventas a Excel / CSV.

---

## 🚀 RELEASE 4: Platform Growth, Testing & SaaS

### Fase 19 — Testing y Validación
- [x] Pruebas unitarias de servicios críticos (`OrdersService`, `AuthService`, `PaymentsService`).
- [x] Pruebas de integración para aislamiento de tenants (Tenant 1 no puede leer datos de Tenant 2).
- [x] Pruebas E2E del flujo de compra completo (Catálogo ➔ Carrito ➔ Checkout ➔ Culqi ➔ Orden).

### Fase 20 & 21 — Despliegue a Producción & Lanzamiento Cleo
- [x] Configurar variables de entorno de producción.
- [x] Configuración de Nginx con SSL (Certbot) en VPS.
- [x] Despliegue de frontend React en Vercel / Netlify / VPS.
- [x] Conexión a base de datos PostgreSQL gestionada (Supabase).
- [x] Lanzamiento oficial de **Cleo-Ecommerce** en producción.

### Fase 22 & 23 — Modelo SaaS y Dominios Personalizados
- [x] Modelos `Plan`, `Subscription` y `SubscriptionLimits` en Prisma.
- [x] Límites automáticos de plan (ej. Plan Basic: máx 50 productos, Plan Pro: ilimitado).
- [x] Resolución de dominios personalizados CNAME (ej. `tienda.pe` ➔ Tenant).

### Fase 24 — Escalamiento (Redis & BullMQ)
- [x] Integración de Redis para caché de catálogo público.
- [x] Colas BullMQ para procesamiento asíncrono de emails y webhooks.
