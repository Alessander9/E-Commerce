# Plan de Implementación y Arquitectura — PeruCat E-Commerce

Este documento describe la arquitectura técnica y el diseño de la plataforma **PeruCat** construida sobre **Cleo Platform (SaaS Multi-Tenant)** con frontend en **React 19 + Vite + Tailwind CSS** y backend en **NestJS 10 + Prisma 6 + PostgreSQL 18**.

---

## 🐾 Temática y Propuesta de Valor Oficial

- **Marca:** PeruCat
- **Propósito:** *Una nueva forma de cuidar su mundo.*
- **Mensaje Principal:** La arena sanitaria que combina absorción, aglomeración y control de olores para hacer más fácil la vida junto a tu gato.
- **Slogan:** *Limpieza para ellos. Tranquilidad para ti.*

---

## 1. Arquitectura del Frontend (`apps/web`)

Organizado por *Feature-Driven Development*:

```text
apps/web/src/
├── layouts/
│   ├── StorefrontLayout.tsx      # Header con logo, navegación, buscador, favoritos, carrito y user menu
│   ├── TenantAdminLayout.tsx     # Sidebar administrativo para gestión de tienda (productos, pedidos, inventario)
│   └── PlatformAdminLayout.tsx   # Panel Super Admin de gestión global de tenants
├── features/
│   ├── storefront/
│   │   ├── components/
│   │   │   ├── AnimatedHeroSection.tsx # Hero con Remotion Player y badges animados
│   │   │   └── OffersMarqueeBanner.tsx # Barra horizontal infinita de ofertas con copiado de cupones
│   │   └── pages/
│   │       ├── Home.tsx          # Home completa con los 12 bloques temáticos de PeruCat
│   │       ├── Catalog.tsx       # Catálogo con filtros por categoría, búsqueda y ordenamiento
│   │       ├── ProductDetail.tsx # Ficha técnica, selector interactivo de variantes (peso/formato) y stock
│   │       ├── Checkout.tsx      # Formulario de dirección, cálculo de tarifa de envío y cupones
│   │       ├── Payment.tsx       # Integración de pasarela de pago Culqi
│   │       └── OrderSuccess.tsx  # Confirmación de pedido con número ORD-XXXX y tracking
│   ├── auth/
│   │   ├── pages/Login.tsx       # Acceso rápido para Super Admin, Tenant Admin y Cliente
│   │   └── pages/Register.tsx    # Registro de nuevos clientes
│   └── tenant-admin/
│       └── pages/                # Dashboard, CRUD de Productos, Pedidos, Inventario y Cupones
├── hooks/
│   ├── useTenant.ts              # Contexto de tenant activo (slug, metadata, colores)
│   ├── useAuth.ts                # Estado de autenticación JWT y roles RBAC
│   ├── useCart.ts                # Carrito con persistencia local y sincronización en BD
│   └── useWishlist.ts            # Lista de favoritos
└── services/
    └── api.ts                    # Wrapper HTTP centralizado con inyección automática de tenant
```

---

## 2. Arquitectura del Backend (`apps/api`)

Estructurado en módulos desacoplados con NestJS y Prisma:

```text
apps/api/src/
├── common/
│   ├── guards/                   # TenantGuard, AuthGuard, RolesGuard
│   ├── decorators/               # @CurrentTenant(), @CurrentUser(), @Roles()
│   ├── filters/                  # HttpExceptionFilter unificado
│   └── interceptors/             # TransformInterceptor (manejo de BigInt y respuestas uniformes)
├── platform/                     # Control Super Admin de Tenants, planes y cuotas
├── catalog/                      # Catálogo público, categorías y administración de variantes
├── orders/                       # Transacciones atómicas de compra y reserva de stock
├── payments/                     # Procesamiento de cargos con Culqi y webhooks
├── shipping/                     # Zonas geográficas y cálculo dinámico de tarifas
├── coupons/                      # Validación y redención de cupones de descuento
└── inventory/                    # Control de stock disponible vs reservado y mermas
```

---

## 3. Paleta de Colores de Marca (PeruCat)

| Color | HEX | Aplicación |
| :--- | :--- | :--- |
| 🟣 **Morado Principal** | `#6A2CFF` | Botones de compra, CTAs primarios, banners destacados |
| 🟣 **Morado Claro** | `#8E5BFF` | Hover states, chips de variantes, fondos suaves |
| 🔷 **Azul Eléctrico** | `#1976FF` | Acciones secundarias, badges de características |
| 🩵 **Turquesa** | `#00B8C9` | Indicadores de confianza, badges de frescura |
| 🔵 **Azul Marino** | `#0D1B3D` | Background de Hero, barra de ofertas, footer y sidebars |
| ⚪ **Fondo Neutro** | `#F7F8FC` | Fondo de página y tarjetas limpias |
