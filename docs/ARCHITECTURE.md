# 🏗️ Architecture — Cleo Platform

> Documentación técnica de los flujos de petición y el contexto multi-tenant de **Cleo Platform**, un SaaS multi-tenant para e-commerce.

---

## 1. Visión General del Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Backend API** | NestJS | 10.x |
| **ORM** | Prisma | 6.x |
| **Base de Datos** | PostgreSQL | 16+ |
| **Frontend Web** | React + Vite | 19.x |
| **Estilos** | Tailwind CSS | 3.x |
| **Documentación** | Swagger OpenAPI | 8.x |

### Estructura Monorepo

```
apps/
├── api/                    # Backend NestJS
│   ├── src/
│   │   ├── auth/           # Autenticación y RBAC
│   │   ├── catalog/        # Catálogo de productos
│   │   ├── common/         # Guards, decorators, filters, interceptors, middleware
│   │   ├── coupons/        # Cupones de descuento
│   │   ├── database/       # PrismaService y configuración
│   │   ├── orders/         # Pedidos y snapshots
│   │   ├── payments/       # Pagos con Culqi
│   │   ├── platform/       # Super Admin (gestión de tenants)
│   │   └── shipping/       # Envíos y tracking
│   └── prisma/
│       └── schema.prisma   # Schema de base de datos (37 tablas)
└── web/                    # Frontend React + Vite
    └── src/
        ├── features/
        │   ├── auth/           # Login, Registro
        │   ├── platform-admin/ # Super Admin
        │   ├── tenant-admin/   # Tenant Admin
        │   └── storefront/     # Tienda pública
        ├── layouts/
        ├── routes/
        └── services/
```

---

## 2. Flujo de Petición Multi-Tenant

Cada petición HTTP atraviesa la siguiente cadena de middleware/guards:

```
HTTP Request
    │
    ▼
┌─────────────────────────────────────────┐
│  Helmet (Security Headers)             │
│  - Content-Security-Policy             │
│  - X-Content-Type-Options: nosniff     │
│  - Strict-Transport-Security (HSTS)    │
│  - X-Frame-Options: DENY               │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  ThrottlerGuard (Rate Limiting)        │
│  - Global: 100 req/60s por IP          │
│  - Auth: 10 req/60s (login)           │
│  - Forgot-password: 5 req/300s        │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  TenantContextMiddleware               │
│  - Crea AsyncLocalStorage context      │
│  - Inicializa { tenantId: undefined }   │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  TenantGuard (resolución de tenant)    │
│  1. Header: x-tenant-slug / x-tenant-id│
│  2. Query param: ?tenantId= / ?tenant= │
│  3. Subdomain (host header)            │
│  4. Fallback: 'cleo' (desarrollo)      │
│                                         │
│  → request.tenant = tenant object      │
│  → tenantContext.setTenantId(tenant.id)│
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  AuthGuard (opcional, si @UseGuards)   │
│  - Verifica JWT Bearer token           │
│  - Carga usuario + memberships         │
│  → request.user = user object          │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  RolesGuard (opcional, si @Roles)      │
│  - Verifica que user tenga el rol      │
│    requerido en el tenant actual       │
│  - PLATFORM_SUPER_ADMIN tiene acceso   │
│    global sin restricción de tenant    │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  ValidationPipe (whitelist + transform)│
│  - Valida DTOs con class-validator     │
│  - Elimina propiedades no declaradas   │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  Controller → Service → PrismaService  │
│                                         │
│  PrismaService.db (extended client):   │
│  - Intercepta findMany, findFirst,     │
│    count, aggregate, groupBy           │
│  - Inyecta tenantId automáticamente   │
│  - Lee de TenantContext.getTenantId()  │
│  - Bypass: setBypassFilter(true)       │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  TransformInterceptor                  │
│  - Serializa BigInt a string           │
│  - Envuelve respuesta en { data, meta }│
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  HttpExceptionFilter                   │
│  - Formatea errores HTTP               │
│  - Logging de excepciones              │
└─────────────────────────────────────────┘
    │
    ▼
HTTP Response
```

---

## 3. Aislamiento Multi-Tenant

### 3.1 Estrategia de Filtrado

El aislamiento se logra mediante **tres capas de protección**:

#### Capa 1 — TenantGuard (Resolución)
Resuelve el tenant actual desde la petición HTTP y lo almacena en:
- `request.tenant` — objeto tenant completo (para controllers)
- `TenantContext` (AsyncLocalStorage) — para Prisma middleware

#### Capa 2 — Prisma Middleware (Automático)
El `PrismaService.db` (cliente extendido) intercepta automáticamente las queries de lectura y las enriquece con `tenantId`:

```typescript
// Sin middleware (requerido manualmente):
await this.prisma.product.findMany({
  where: { tenantId: BigInt(1), active: true }
});

// Con middleware (automático):
await this.prisma.db.product.findMany({
  where: { active: true }
  // tenantId se inyecta automáticamente desde TenantContext
});
```

**Modelos con filtrado automático:**
| Modelo | Descripción |
|--------|-------------|
| `category` | Categorías de productos |
| `product` | Productos |
| `productOption` | Opciones de variantes |
| `inventoryMovement` | Movimientos de inventario |
| `cart` | Carritos de compra |
| `wishlists` | Listas de deseos |
| `order` | Pedidos |
| `shipment` | Envíos |
| `coupon` | Cupones de descuento |
| `notification` | Notificaciones |
| `auditLog` | Logs de auditoría |

#### Capa 3 — Bypass para Platform Super Admin
Los endpoints del Platform Super Admin necesitan acceso cross-tenant. Para ello:

```typescript
// En el controller/service del Platform Admin:
this.tenantContext.setBypassFilter(true);
// Ahora PrismaService.db no inyecta tenantId
```

### 3.2 Modelos NO Filtrados (Cross-Tenant)

Estos modelos son accesibles sin filtrado automático:
- `Tenant` — gestionado por Platform Super Admin
- `TenantSettings` — configuración por tenant
- `User` — usuarios globales (no tenant-scoped)
- `Role` — roles del sistema
- `UserTenant` — relación usuario-tenant
- `Address` — direcciones de usuario

---

## 4. Autenticación y RBAC

### 4.1 Flujo de Login

```
POST /api/auth/login
    │
    ├─ TenantGuard → resuelve tenant
    ├─ AuthService.login()
    │   ├─ Busca usuario por email
    │   ├─ Verifica contraseña (bcryptjs)
    │   ├─ Determina membership activa
    │   ├─ Genera JWT con roles + tenants
    │   └─ Retorna { accessToken, user }
    └─ Response
```

### 4.2 Roles del Sistema

| Rol | Scope | Descripción | Acceso |
|-----|-------|-------------|--------|
| `PLATFORM_SUPER_ADMIN` | PLATFORM | Super administrador | Todo (cross-tenant) |
| `TENANT_ADMIN` | TENANT | Admin del tenant | Admin panel completo |
| `TENANT_MANAGER` | TENANT | Gestor del tenant | Productos, pedidos, inventario |
| `CUSTOMER` | TENANT | Cliente final | Storefront, pedidos propios |

### 4.3 Estructura del JWT

```json
{
  "sub": "123",
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

### 4.4 Recuperación de Contraseña

```
1. POST /api/auth/forgot-password { email }
   → Genera JWT con purpose: "password-reset" (expira 1h)
   → Envía email con token (pendiente integración email)
   → Siempre retorna mensaje genérico (previene enum. de emails)

2. POST /api/auth/reset-password { token, newPassword }
   → Verifica JWT con JWT_RESET_SECRET
   → Actualiza contraseña (bcrypt hash)
   → Token de un solo uso
```

---

## 5. Flujos de Negocio

### 5.1 Creación de Pedido (Atomicalidad)

```
OrdersService.createOrder()
    │
    ├─ $transaction (Prisma Transaction)
    │   ├─ 1. Validar items + calcular subtotal
    │   ├─ 2. Verificar stock por variante
    │   ├─ 3. Reservar inventario (availableStock--, reservedStock++)
    │   ├─ 4. Calcular envío (zona + tarifa)
    │   ├─ 5. Aplicar cupón (si existe)
    │   ├─ 6. Calcular total (subtotal + envío - descuento)
    │   ├─ 7. Crear Order + OrderItems + OrderShippingAddress
    │   ├─ 8. Registrar OrderStatusHistory
    │   ├─ 9. Crear Shipment + primer tracking event
    │   └─ 10. Registrar CouponRedemption (si aplica)
    │
    └─ Si cualquier paso falla → Rollback automático
```

### 5.2 Snapshots Históricos

Los pedidos almacenan snapshots inmutables:
- **ORDER_ITEMS**: nombre, SKU, precio, cantidad al momento de compra
- **ORDER_SHIPPING_ADDRESS**: dirección completa al momento de compra
- **ProductSnapshot** (JSON): datos adicionales del producto

Esto garantiza que un cambio en el catálogo no afecte pedidos históricos.

### 5.3 Gestión de Inventario

```
Estado del Stock:
  availableStock = stock físico disponible para venta
  reservedStock  = stock reservado por pedidos no pagados
  
  Stock Total = availableStock + reservedStock

Flujos:
  RESERVATION: availableStock--, reservedStock++  (al crear pedido)
  RELEASE:     availableStock++, reservedStock--  (pedido cancelado/no pagado)
  SALE:        reservedStock--                     (pago confirmado)
  ADJUSTMENT:  ± availableStock                    (movimiento manual)
```

---

## 6. Seguridad

### 6.1 Headers HTTP (Helmet)

| Header | Valor | Propósito |
|--------|-------|-----------|
| `Content-Security-Policy` | default-src 'self' | Prev. XSS |
| `X-Content-Type-Options` | nosniff | Prev. MIME sniffing |
| `X-Frame-Options` | DENY | Prev. Clickjacking |
| `Strict-Transport-Security` | max-age=31536000 | Forzar HTTPS |
| `X-XSS-Protection` | 0 | Deshabilitar XSS legacy |

### 6.2 Rate Limiting (Throttler)

| Endpoint | Límite | TTL |
|----------|--------|-----|
| Global (default) | 100 req | 60s |
| `POST /api/auth/login` | 10 req | 60s |
| `POST /api/auth/forgot-password` | 5 req | 300s |
| `POST /api/auth/reset-password` | 5 req | 300s |

### 6.3 Validación de Entrada

- `ValidationPipe` con `whitelist: true` elimina propiedades no declaradas
- `class-validator` valida tipos, formatos y longitudes
- `bcryptjs` con 10 rounds para hashing de contraseñas

---

## 7. Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/cleo_platform

# JWT
JWT_SECRET=tu-secreto-aqui
JWT_EXPIRES_IN=7d
JWT_RESET_SECRET=tu-secreto-reset-aqui

# Culqi (pagos)
CULQI_SECRET_KEY=sk_test_...

# Server
PORT=3000
NODE_ENV=development
```

---

## 8. Convenciones de Código

### Controllers
- Prefijo: `api/` (ej. `api/auth`, `api/store/products`)
- Tags Swagger: agrupados por dominio
- Guards: `@UseGuards(TenantGuard)` para endpoints multi-tenant
- Auth: `@UseGuards(AuthGuard, TenantGuard)` + `@ApiBearerAuth()`

### Services
- Inyectan `PrismaService` (o `PrismaService.db` para filtrado automático)
- Usan `BigInt` para IDs de Prisma
- Transacciones: `this.prisma.$transaction(async (tx) => { ... })`

### DTOs
- Validados con `class-validator` decorators
- Documentados con `@ApiProperty()` de Swagger
- Prefijo descriptivo: `LoginDto`, `RegisterDto`, `ForgotPasswordDto`

### Decoradores Personalizados
- `@CurrentTenant()` — obtiene el tenant de la request
- `@CurrentUser()` — obtiene el usuario autenticado
- `@Roles('TENANT_ADMIN')` — requiere rol específico
