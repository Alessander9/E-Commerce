# 🚀 ROADMAP — CLEO PLATFORM

## FASE 0 — Definición y arquitectura

**Objetivo:** dejar completamente cerrado el diseño antes de programar.

### 0.1 Arquitectura

```text
React
   ↓
REST API
   ↓
NestJS
   ↓
Prisma
   ↓
PostgreSQL / Supabase
```

### 0.2 Definir estándares

```text
TypeScript
REST
JWT / Supabase Auth
RBAC
Multi-Tenancy
RLS
Soft Delete
UTC
NUMERIC(12,2)
```

### 0.3 Documentación

Crear:

```text
ARCHITECTURE.md
DATABASE.md
API.md
SECURITY.md
BUSINESS-RULES.md
README.md
```

### Resultado

✅ Arquitectura cerrada  
✅ DER definitivo  
✅ Reglas de negocio documentadas  
✅ Stack definido  

---

# FASE 1 — Inicialización del proyecto

**Objetivo:** crear la infraestructura base.

## Backend

```text
NestJS
TypeScript
Prisma
Swagger
Config
Logging
Exception handling
```

## Frontend

```text
React
TypeScript
Vite
Tailwind
shadcn/ui
React Router
TanStack Query
Zod
React Hook Form
```

## DevOps

```text
Git
GitHub
ESLint
Prettier
Husky
Environment variables
```

### Resultado

```text
apps/
├── web
└── api
```

Proyecto ejecutando correctamente de punta a punta.

---

# FASE 2 — Base de datos y Multi-Tenant

Esta es la fase **más importante**.

Crear:

```text
TENANTS
USERS
ROLES
USER_TENANTS
TENANT_SETTINGS
ADDRESSES
```

Implementar:

```text
TenantResolver
TenantContext
RBAC
Guards
Permissions
```

### Debe funcionar

```text
Super Admin
      ↓
Tenant A
      ↓
Tenant B
```

Y:

```text
Admin Tenant A
      ↓
❌ No puede acceder a Tenant B
```

### Resultado

✅ Multi-tenancy funcional  
✅ Roles funcionales  
✅ Aislamiento entre tiendas  

---

# FASE 3 — Autenticación y seguridad

Integrar:

```text
Supabase Auth
```

Flujos:

```text
Registro
Login
Logout
Email verification
Forgot password
Reset password
Session
```

Crear autorización:

```text
PLATFORM_SUPER_ADMIN
TENANT_ADMIN
TENANT_MANAGER
CUSTOMER
```

### Seguridad

Implementar:

```text
Authentication Guard
Authorization Guard
Tenant Guard
Rate limiting
CORS
Helmet
Validation
```

### Resultado

✅ Autenticación real  
✅ Autorización  
✅ Seguridad base  

---

# FASE 4 — Panel Super Admin

Construir:

```text
/platform
```

### Dashboard

Mostrar:

```text
Tiendas activas
Usuarios
Pedidos globales
Ventas
Nuevos tenants
```

### Gestión de tenants

```text
Listar
Crear
Editar
Activar
Suspender
Eliminar
Ver detalle
```

### Gestión de administradores

```text
Asignar usuario a tenant
Cambiar rol
Revocar acceso
```

### Resultado

✅ Puedes controlar toda la plataforma desde un solo lugar.

---

# FASE 5 — Gestión de tiendas

Implementar el concepto completo de tenant.

Cada tienda tendrá:

```text
Nombre
Slug
Logo
Favicon
Dominio
Subdominio
Colores
Moneda
Timezone
Contacto
Configuración
```

Crear:

```text
TENANT_SETTINGS
```

### Resultado

Cada tienda comienza a tener su propia identidad.

---

# FASE 6 — Catálogo

Construir:

```text
CATEGORIES
PRODUCTS
PRODUCT_VARIANTS
PRODUCT_OPTIONS
PRODUCT_OPTION_VALUES
PRODUCT_VARIANT_OPTIONS
PRODUCT_VARIANT_VALUES
PRODUCT_IMAGES
PRODUCT_PRICES
```

### Funcionalidades

```text
Crear producto
Editar producto
Eliminar producto
Activar/desactivar
Categorías
Subcategorías
Variantes
SKU
Precios
Imágenes
Productos destacados
```

### Resultado

✅ Catálogo completamente funcional.

---

# FASE 7 — Inventario

Implementar:

```text
INVENTORY
INVENTORY_MOVEMENTS
```

Funciones:

```text
Ingreso de stock
Salida de stock
Ajustes
Reservas
Liberación
Devoluciones
Stock mínimo
```

### Regla crítica

```text
available_stock
+
reserved_stock
```

debe manejarse correctamente bajo concurrencia.

### Resultado

✅ Inventario confiable  
✅ Prevención de sobreventas  

---

# FASE 8 — Storefront

Construir la tienda pública.

```text
/
├── Home
├── Categorías
├── Productos
├── Producto
├── Carrito
├── Wishlist
├── Login
├── Registro
└── Cuenta
```

### Producto

```text
Fotos
Precio
Oferta
Variantes
Stock
Descripción
Categorías
```

### Resultado

✅ Cliente puede navegar y seleccionar productos.

---

# FASE 9 — Carrito y Wishlist

Implementar:

```text
CARTS
CART_ITEMS

WISHLISTS
WISHLIST_ITEMS
```

Funciones:

```text
Agregar
Eliminar
Modificar cantidad
Validar stock
Favoritos
Mover favorito → carrito
```

También:

```text
Guest Cart
```

para clientes no autenticados.

### Resultado

✅ Experiencia de compra completa antes del checkout.

---

# FASE 10 — Checkout

Construir:

```text
Dirección
Envío
Cupón
Resumen
Pedido
Pago
```

Flujo:

```text
CARRITO
   ↓
DATOS DE ENTREGA
   ↓
MÉTODO DE ENVÍO
   ↓
CUPÓN
   ↓
RESUMEN
   ↓
PAGO
   ↓
PEDIDO
```

### Resultado

✅ Checkout funcional.

---

# FASE 11 — Pedidos

Implementar:

```text
ORDERS
ORDER_ITEMS
ORDER_SHIPPING_ADDRESS
ORDER_STATUS_HISTORY
```

Estados:

```text
PENDING_PAYMENT
PAID
PROCESSING
READY_TO_SHIP
SHIPPED
DELIVERED
CANCELLED
REFUNDED
```

### Dashboard admin

```text
Pedidos nuevos
Pedidos pendientes
Pedidos pagados
Pedidos enviados
Pedidos entregados
Pedidos cancelados
```

### Resultado

✅ Gestión completa del ciclo de vida del pedido.

---

# FASE 12 — Pagos

Integrar inicialmente:

```text
Culqi
```

Crear:

```text
PAYMENTS
PAYMENT_WEBHOOKS
```

Implementar:

```text
Payment Intent
Payment Attempt
Success
Failure
Cancelación
Refund
Webhook
Idempotency
```

Flujo:

```text
Checkout
   ↓
NestJS
   ↓
Culqi
   ↓
Pago
   ↓
Webhook
   ↓
Validación
   ↓
PAYMENT = PAID
   ↓
ORDER = PAID
```

### Resultado

✅ Sistema de pagos seguro y trazable.

---

# FASE 13 — Reserva y confirmación de inventario

Integrar completamente:

```text
ORDERS
PAYMENTS
INVENTORY
```

Ejemplo:

```text
Checkout
   ↓
Reservar stock
   ↓
Pago
   │
   ├── aprobado → confirmar stock
   │
   └── rechazado → liberar stock
```

Esto debe realizarse con transacciones y reglas de concurrencia.

### Resultado

✅ Evitación de sobreventa.

---

# FASE 14 — Envíos

Implementar:

```text
SHIPPING_ZONES
SHIPPING_RATES
SHIPMENTS
SHIPMENT_TRACKING
```

Primera versión:

```text
Lima
Callao
Provincias
```

Después:

```text
Courier
Tracking
API externas
```

### Resultado

✅ Cálculo de envío  
✅ Gestión del despacho  
✅ Tracking  

---

# FASE 15 — Cupones

Implementar:

```text
COUPONS
COUPON_REDEMPTIONS
```

Tipos:

```text
PERCENTAGE
FIXED_AMOUNT
FREE_SHIPPING
```

Reglas:

```text
Monto mínimo
Máximo descuento
Máximo usos
Usos por cliente
Fecha inicio
Fecha fin
```

### Resultado

✅ Sistema promocional funcional.

---

# FASE 16 — Notificaciones

Inicialmente:

```text
EMAIL
IN_APP
```

Eventos:

```text
Registro
Pedido creado
Pago aprobado
Pago rechazado
Pedido enviado
Pedido entregado
Cambio de contraseña
```

Posteriormente:

```text
WhatsApp
Push notifications
```

### Resultado

✅ Comunicación automática con el cliente.

---

# FASE 17 — Auditoría

Implementar:

```text
AUDIT_LOGS
```

Registrar:

```text
CREATE
UPDATE
DELETE
LOGIN
LOGOUT
STATUS_CHANGE
PAYMENT
STOCK_ADJUSTMENT
TENANT_CHANGE
```

Guardar:

```text
user_id
tenant_id
action
entity
entity_id
old_value
new_value
ip
user_agent
timestamp
```

### Resultado

✅ Trazabilidad completa.

---

# FASE 18 — Reportes y analytics

## Tenant Admin

```text
Ventas
Pedidos
Productos
Inventario
Clientes
Cupones
```

Dashboard:

```text
Ventas hoy
Ventas semana
Ventas mes
Pedidos
Ticket promedio
Productos más vendidos
```

## Super Admin

Global:

```text
Ventas totales
Número de tiendas
Tiendas activas
Usuarios
Pedidos
Crecimiento
```

### Resultado

✅ Toma de decisiones basada en datos.

---

# FASE 19 — Testing

No esperaría hasta el final.

A estas alturas debemos tener:

### Backend

```text
Unit tests
Integration tests
E2E
```

### Frontend

```text
Component tests
Integration tests
E2E
```

### Casos críticos

Especialmente:

```text
Tenant isolation
RBAC
Login
Checkout
Stock concurrency
Payment webhook
Coupon
Order transitions
```

Una prueba fundamental:

```text
ADMIN TENANT A
       ↓
intenta acceder a recurso TENANT B
       ↓
403 FORBIDDEN
```

---

# FASE 20 — Producción

Configurar:

```text
Frontend
→ Vercel

Backend
→ VPS

Database
→ Supabase PostgreSQL

Storage
→ Supabase Storage
```

Con:

```text
Nginx
SSL
Domain
DNS
Environment variables
Backups
Monitoring
Logs
```

Arquitectura:

```text
                       INTERNET
                           │
                 ┌─────────┴──────────┐
                 │                    │
                 ▼                    ▼
              React                  Nginx
             Frontend                 │
                                      ▼
                                  NestJS API
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                    PostgreSQL                  Storage
                    Supabase                    Supabase
```

---

# FASE 21 — Lanzamiento de Cleo

Crear oficialmente:

```text
TENANT #1
Cleo-Ecommerce
```

Configurar:

```text
Logo
Branding
Dominio
Productos
Categorías
Inventario
Pagos
Envíos
Administrador
```

Y probar todo de extremo a extremo.

### Flujo completo

```text
VISITANTE
   ↓
CLEO-ECOMMERCE
   ↓
PRODUCTO
   ↓
CARRITO
   ↓
CHECKOUT
   ↓
PAGO
   ↓
PEDIDO
   ↓
INVENTARIO
   ↓
ENVÍO
   ↓
TRACKING
   ↓
ENTREGA
```

---

# FASE 22 — Convertirlo en SaaS

Esta fase viene **después de tener estable el e-commerce**.

Agregar:

```text
PLANS
SUBSCRIPTIONS
SUBSCRIPTION_LIMITS
```

Ejemplo:

```text
BASIC
PRO
BUSINESS
ENTERPRISE
```

Límites:

```text
Productos
Pedidos
Usuarios
Administradores
Storage
Dominios
Integraciones
```

---

# FASE 23 — Dominios personalizados

Inicialmente:

```text
cleo.tuplataforma.com
```

Después:

```text
cleo.pe
modaperu.pe
techstore.pe
```

Flujo:

```text
DOMINIO
   ↓
Tenant Resolver
   ↓
TENANT
   ↓
Configuración
   ↓
Catálogo
```

---

# FASE 24 — Escalamiento

Solo cuando el volumen lo justifique:

```text
Redis
BullMQ
CDN
Image optimization
Search engine
Queue workers
Horizontal scaling
```

No agregaría estas piezas prematuramente.

---

# 🗺️ ROADMAP VISUAL

```text
                    CLEO PLATFORM
                          │
                          ▼
             ┌────────────────────────┐
             │ FASE 0                 │
             │ Arquitectura           │
             └────────────┬───────────┘
                          ▼
             ┌────────────────────────┐
             │ FASE 1                 │
             │ Base tecnológica       │
             └────────────┬───────────┘
                          ▼
             ┌────────────────────────┐
             │ FASE 2-3               │
             │ Auth + Multi-Tenant     │
             └────────────┬───────────┘
                          ▼
             ┌────────────────────────┐
             │ FASE 4-5               │
             │ Super Admin + Tenants   │
             └────────────┬───────────┘
                          ▼
             ┌────────────────────────┐
             │ FASE 6-7               │
             │ Catálogo + Inventario   │
             └────────────┬───────────┘
                          ▼
             ┌────────────────────────┐
             │ FASE 8-10              │
             │ Store + Cart + Checkout │
             └────────────┬───────────┘
                          ▼
             ┌────────────────────────┐
             │ FASE 11-14             │
             │ Orders + Payments      │
             │ + Shipping              │
             └────────────┬───────────┘
                          ▼
             ┌────────────────────────┐
             │ FASE 15-18             │
             │ Cupones + Notificaciones│
             │ Auditoría + Reportes    │
             └────────────┬───────────┘
                          ▼
             ┌────────────────────────┐
             │ FASE 19-21             │
             │ Testing + Producción   │
             │ + Lanzamiento Cleo     │
             └────────────┬───────────┘
                          ▼
             ┌────────────────────────┐
             │ FASE 22-23             │
             │ SaaS + Dominios        │
             └────────────┬───────────┘
                          ▼
             ┌────────────────────────┐
             │ FASE 24                │
             │ Escalamiento           │
             └────────────────────────┘
```

# 🧱 Prioridad de desarrollo

Yo dividiría el proyecto en **4 grandes releases**:

### Release 1 — Platform Core

```text
Auth
Users
Roles
Tenants
User_Tenants
Tenant Settings
Super Admin
RBAC
Multi-tenancy
```

### Release 2 — Commerce Core

```text
Categories
Products
Variants
Images
Prices
Inventory
Cart
Wishlist
```

### Release 3 — Transaction Core

```text
Checkout
Orders
Payments
Webhooks
Shipping
Coupons
Notifications
```

### Release 4 — Platform Growth

```text
Audit
Reports
Analytics
Plans
Subscriptions
Custom Domains
Integrations
Scaling
```

## 🎯 Objetivo del primer MVP

El primer objetivo **no debería ser construir toda la plataforma SaaS**.

Debe ser llegar a:

```text
SUPER ADMIN
      ↓
CREA TENANT
      ↓
CREA ADMIN
      ↓
ADMIN CONFIGURA CLEO
      ↓
PUBLICA PRODUCTOS
      ↓
CLIENTE COMPRA
      ↓
PAGA
      ↓
SE CREA PEDIDO
      ↓
SE RESERVA STOCK
      ↓
SE DESPACHA
```

Cuando ese flujo esté sólido, tienes un **Cleo-Ecommerce funcional** y, al mismo tiempo, la arquitectura ya está preparada para convertirlo en **Cleo Platform**, donde crearás la segunda, tercera y siguientes tiendas sin duplicar el sistema.
