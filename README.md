# Cleo Platform — SaaS E-Commerce Multi-Tenant

<p align="center">
  <img src="./apps/web/public/logo-tienda.png" alt="Cleo Platform" width="180" />
</p>

<p align="center">
  <strong>Plataforma SaaS Multi-Tenant para administrar múltiples tiendas e-commerce sobre una misma infraestructura, con Cleo-Ecommerce como primer tenant insignia.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Backend-NestJS%2010%20%2B%20TypeScript-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/ORM-Prisma%206-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%2018-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

---

## 1. Arquitectura del Sistema

```text
                         ┌──────────────────┐
                         │   CLEO PLATFORM  │
                         └────────┬─────────┘
                                  │
                 ┌────────────────┴─────────────────┐
                 │                                  │
                 ▼                                  ▼
          React Storefront                   React Admin
        (Tenants / Clientes)               (Platform & Tenant)
                 │                                  │
                 └────────────────┬─────────────────┘
                                  ▼
                        NESTJS REST API (Modular)
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
        Auth / RBAC          Multi-Tenant         Business Logic
     (Supabase / JWT)       (TenantGuard)       (Catalog/Orders/Pay)
                                  │
                                  ▼
                             Prisma ORM
                                  │
                                  ▼
                      PostgreSQL / Supabase
```

---

## 2. Estructura del Monorepo

```text
E-Commerce/
├── apps/
│   ├── api/                     # Backend NestJS + TypeScript + Prisma
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # 37 Modelos de datos multi-tenant
│   │   │   └── seed.ts          # Seed inicial con roles, tenants y catálogo
│   │   └── src/
│   │       ├── common/          # Guards (TenantGuard, AuthGuard, RolesGuard), Decorators
│   │       ├── auth/            # Módulo de autenticación y JWT
│   │       ├── platform/        # Control Super Admin de Tenants
│   │       ├── catalog/         # Catálogo público y administración
│   │       ├── orders/          # Creación de pedidos y reserva de stock
│   │       ├── payments/        # Integración de pagos Culqi
│   │       ├── shipping/        # Zonas y tarifas de envío
│   │       └── coupons/         # Cupones de descuento
│   │
│   └── web/                     # Frontend React 19 + TypeScript + Vite + Tailwind
│       ├── src/
│       │   ├── layouts/         # StorefrontLayout, TenantAdminLayout, PlatformAdminLayout
│       │   ├── features/
│       │   │   ├── storefront/  # Home, Catalog, ProductDetail, Checkout, Orders
│       │   │   ├── auth/        # Login con roles rápidos, Registro
│       │   │   ├── tenant-admin/# Dashboard, gestión de productos y órdenes
│       │   │   └── platform-admin/ # Gestión multi-tenant
│       │   ├── hooks/           # useTenant, useAuth, useCart
│       │   └── services/        # apiRequest con inyección de tenant
```

---

## 3. Paleta de Diseño Oficial (Cleo Platform)

| Color | HEX | Uso |
| :--- | :--- | :--- |
| 🟣 **Morado Principal** | `#6A2CFF` | Color de marca, botones principales, CTAs, tags destacados |
| 🟣 **Morado Claro** | `#8E5BFF` | Hover states, fondos suaves, detalles |
| 🔷 **Azul Eléctrico** | `#1976FF` | Acciones secundarias, chips de catálogo, enlaces |
| 🩵 **Turquesa** | `#00B8C9` | Indicadores de confianza, estados activos, acentos |
| 🔵 **Azul Marino** | `#0D1B3D` | Encabezados, barras de navegación, sidebar administrativo |
| ⚪ **Fondo Neutro** | `#F7F8FC` | Fondo de aplicación y tarjetas con bordes suaves |

---

## 4. Guía de Ejecución Rápida

### Requisitos
- Node.js 20+
- PostgreSQL 16+ corriendo en `localhost:5432` con credenciales configuradas en `apps/api/.env`

### Paso 1: Generar Schema y Ejecutar Seed
```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### Paso 2: Iniciar Servidores de Desarrollo

**Terminal 1 — Backend NestJS:**
```bash
npm run dev:api
# API REST corriendo en http://localhost:3000
# Swagger Docs en http://localhost:3000/api/docs
```

**Terminal 2 — Frontend React + Vite:**
```bash
npm run dev:web
# Aplicación web corriendo en http://localhost:5173
```

---

## 5. Cuentas de Demostración

| Rol | Correo | Contraseña | Alcance |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@cleoplatform.com` | `admin123` | Plataforma global (`/platform`) |
| **Tenant Admin** | `admin@cleo.com` | `admin123` | Tienda Cleo (`/admin`) |
| **Cliente** | `cliente@cleo.com` | `client123` | Compras en Storefront (`/`) |
