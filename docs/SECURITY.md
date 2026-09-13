# 🔒 Security — Cleo Platform

> Políticas RBAC, mitigación OWASP y configuración de seguridad de **Cleo Platform**.

---

## 1. RBAC (Role-Based Access Control)

### 1.1 Roles del Sistema

| Rol | Scope | Permisos |
|-----|-------|----------|
| `PLATFORM_SUPER_ADMIN` | PLATFORM | Acceso global a todos los tenants. Puede crear, suspender, reactivar y eliminar tenants. Gestiona usuarios y roles globales. |
| `TENANT_ADMIN` | TENANT | Control total dentro de su tenant. Gestiona productos, categorías, pedidos, cupones, inventario, configuración y envíos. |
| `TENANT_MANAGER` | TENANT | Gestión de contenido: productos, categorías, pedidos, inventario y envíos. No puede gestionar configuración ni cupones. |
| `CUSTOMER` | TENANT | Acceso al storefront: navegar catálogo, gestionar carrito/favoritos, crear pedidos, ver sus pedidos. |

### 1.2 Matriz de Permisos

| Recurso | PLATFORM_SUPER_ADMIN | TENANT_ADMIN | TENANT_MANAGER | CUSTOMER |
|---------|:--------------------:|:------------:|:--------------:|:--------:|
| **Plataforma** |||||
| Gestionar tenants | ✅ | ❌ | ❌ | ❌ |
| Ver todos los usuarios | ✅ | ❌ | ❌ | ❌ |
| Asignar roles | ✅ | ❌ | ❌ | ❌ |
| Logs de auditoría global | ✅ | ❌ | ❌ | ❌ |
| **Tenant Admin** |||||
| Configuración del tenant | ✅ | ✅ | ❌ | ❌ |
| Gestionar cupones | ✅ | ✅ | ❌ | ❌ |
| **Catálogo** |||||
| CRUD productos | ✅ | ✅ | ✅ | ❌ |
| CRUD categorías | ✅ | ✅ | ✅ | ❌ |
| Crear opciones/variantes | ✅ | ✅ | ✅ | ❌ |
| Ver catálogo público | ✅ | ✅ | ✅ | ✅ |
| **Inventario** |||||
| Ver inventario | ✅ | ✅ | ✅ | ❌ |
| Registrar movimientos | ✅ | ✅ | ✅ | ❌ |
| Actualizar stock mínimo | ✅ | ✅ | ✅ | ❌ |
| **Pedidos** |||||
| Ver todos los pedidos | ✅ | ✅ | ✅ | ❌ |
| Cambiar estado de pedido | ✅ | ✅ | ✅ | ❌ |
| Asignar courier/tracking | ✅ | ✅ | ✅ | ❌ |
| Crear pedido | ❌ | ❌ | ❌ | ✅ |
| Ver propios pedidos | ❌ | ❌ | ❌ | ✅ |
| **Pagos** |||||
| Procesar pago | ❌ | ❌ | ❌ | ✅ |
| Reembolsar pedido | ✅ | ✅ | ❌ | ❌ |
| Webhook Culqi | Público | — | — | — |
| **Carrito & Favoritos** |||||
| Gestionar carrito | ❌ | ❌ | ❌ | ✅ |
| Gestionar favoritos | ❌ | ❌ | ❌ | ✅ |
| **Envíos** |||||
| Ver zonas de envío | ✅ | ✅ | ✅ | ✅ |
| Gestionar envíos | ✅ | ✅ | ✅ | ❌ |
| **Reportes** |||||
| Ver reportes de ventas | ✅ | ✅ | ✅ | ❌ |
| Exportar CSV | ✅ | ✅ | ✅ | ❌ |

### 1.3 Guard Chain (NestJS)

Cada endpoint protegido usa esta cadena de guards:

```
@UseGuards(TenantGuard, AuthGuard, RolesGuard)
@Roles('TENANT_ADMIN', 'TENANT_MANAGER')
```

**Flujo:**
1. `TenantGuard` → resuelve tenant del request
2. `AuthGuard` → verifica JWT y carga usuario + memberships
3. `RolesGuard` → verifica que el usuario tenga al menos uno de los roles requeridos en el tenant actual

**Excepción:** `PLATFORM_SUPER_ADMIN` siempre tiene acceso (bypass en RolesGuard).

---

## 2. OWASP Top 10 — Mitigaciones

### A01:2021 — Broken Access Control

| Mitigación | Implementación |
|-----------|---------------|
| **Multi-tenant isolation** | Prisma middleware inyecta `tenantId` automáticamente en queries de lectura |
| **Role verification** | `RolesGuard` verifica permisos en cada endpoint protegido |
| **Tenant resolution** | `TenantGuard` valida que el tenant existe y está activo |
| **Platform bypass** | Solo `PLATFORM_SUPER_ADMIN` puede acceder a datos cross-tenant |
| **Ownership checks** | Endpoints de cliente solo acceden a sus propios pedidos/datos |

### A02:2021 — Cryptographic Failures

| Mitigación | Implementación |
|-----------|---------------|
| **Password hashing** | bcryptjs con 10 rounds |
| **JWT signing** | HS256 con secret configurado via `JWT_SECRET` env var |
| **Reset tokens** | JWT separado con `JWT_RESET_SECRET` y expiración de 1 hora |
| **Webhook validation** | HMAC-SHA256 con `CULQI_WEBHOOK_SECRET` |
| **HTTPS** | Helmet HSTS habilitado (max-age=31536000) |

### A03:2021 — Injection

| Mitigación | Implementación |
|-----------|---------------|
| **SQL Injection** | Prisma ORM parametriza todas las queries automáticamente |
| **NoSQL Injection** | Prisma valida tipos en tiempo de compilación |
| **Input validation** | `class-validator` en DTOs con `whitelist: true` |
| **Input sanitization** | `ValidationPipe` elimina propiedades no declaradas |

### A04:2021 — Insecure Design

| Mitigación | Implementación |
|-----------|---------------|
| **Rate limiting** | `@nestjs/throttler` global (100/60s) + endpoints sensibles más restrictivos |
| **Least privilege** | RBAC con 4 roles, cada uno con permisos mínimos necesarios |
| **Separation of concerns** | Tenant context via AsyncLocalStorage, no se comparte estado entre requests |

### A05:2021 — Security Misconfiguration

| Mitigación | Implementación |
|-----------|---------------|
| **Security headers** | Helmet configura CSP, X-Content-Type-Options, X-Frame-Options, HSTS |
| **CORS** | Configurado con `origin: true, credentials: true` |
| **Error handling** | `HttpExceptionFilter` no expone stack traces en producción |
| **Dev mode** | Prisma logging solo en development, no en producción |

### A06:2021 — Vulnerable and Outdated Components

| Mitigación | Implementación |
|-----------|---------------|
| **Dependency management** | package.json con versiones especificadas |
| **Prisma 6** | ORM actualizado con schema-first approach |
| **NestJS 10** | Framework LTS con actualizaciones de seguridad |

### A07:2021 — Identification and Authentication Failures

| Mitigación | Implementación |
|-----------|---------------|
| **Brute force protection** | Rate limiting: 10 req/60s en login |
| **Password policy** | Mínimo 6 caracteres (validado en DTO) |
| **Account enumeration** | `forgot-password` siempre retorna mensaje genérico |
| **JWT expiration** | Tokens expiran en 7 días (configurable) |
| **Inactive accounts** | `AuthGuard` verifica `user.active === true` |

### A08:2021 — Software and Data Integrity Failures

| Mitigación | Implementación |
|-----------|---------------|
| **Atomic transactions** | `prisma.$transaction` para operaciones críticas (pedidos, pagos) |
| **Idempotency** | `idempotencyKey` único en payments, `eventId` único en webhooks |
| **Soft deletes** | `deletedAt` en vez de DELETE físico, preserva datos históricos |
| **Snapshots inmutables** | OrderItems y OrderShippingAddress almacenan estado al momento de compra |

### A09:2021 — Security Logging and Monitoring Failures

| Mitigación | Implementación |
|-----------|---------------|
| **Audit logging** | `AuditInterceptor` registra automáticamente CREATE, UPDATE, DELETE |
| **Audit log fields** | action, entity, entityId, oldValue, newValue, ipAddress, userAgent |
| **Webhook logging** | Todos los webhooks se almacenan en `payment_webhooks` con status |
| **Inventory movements** | Cada cambio de stock registra movementType, stockBefore, stockAfter |
| **Order status history** | Cada cambio de estado se registra con timestamp y usuario |

### A10:2021 — Server-Side Request Forgery (SSRF)

| Mitigación | Implementación |
|-----------|---------------|
| **No user-controlled URLs** | La API no hace fetch a URLs proporcionadas por el usuario |
| **CORS限制** | Solo permite requests desde orígenes configurados |

---

## 3. Seguridad de Headers HTTP

### Helmet Configuration

```typescript
app.use(helmet());
```

Headers configurados:

| Header | Valor | Propósito |
|--------|-------|-----------|
| `Content-Security-Policy` | default-src 'self' | Previene XSS y inyección de contenido |
| `X-Content-Type-Options` | nosniff | Previene MIME sniffing |
| `X-Frame-Options` | DENY | Previene clickjacking |
| `Strict-Transport-Security` | max-age=31536000 | Fuerza HTTPS por 1 año |
| `X-XSS-Protection` | 0 | Deshabilita XSS filter legacy (recomendado) |
| `Referrer-Policy` | no-referrer | Controla envío de referrer |
| `Permissions-Policy` | camera=(), microphone=() | Deshabilita features del navegador |

---

## 4. Rate Limiting

### Configuración Global

```typescript
ThrottlerModule.forRoot([{
  name: 'default',
  ttl: 60_000,  // 60 segundos
  limit: 100,    // 100 requests por IP
}])
```

### Endpoints Especiales

| Endpoint | Límite | Ventana | Justificación |
|----------|--------|---------|---------------|
| `POST /api/auth/login` | 10 | 60s | Prevenir fuerza bruta |
| `POST /api/auth/forgot-password` | 5 | 300s | Prevenir abuso de envío de emails |
| `POST /api/auth/reset-password` | 5 | 300s | Prevenir intentos de adivinación de token |

### Custom Throttler por Endpoint

```typescript
@Throttle({ default: { limit: 10, ttl: 60_000 } })
@Post('login')
async login() { ... }
```

---

## 5. Autenticación y JWT

### Flujo de Login

```
1. Recibir email + password
2. Buscar usuario por email (case-insensitive)
3. Verificar que usuario esté activo
4. Comparar password con bcrypt
5. Determinar membership activa en el tenant
6. Generar JWT con: sub, email, firstName, lastName, roles[]
7. Retornar accessToken + datos del usuario
```

### Estructura del JWT

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

### Tokens Separados

| Token | Secret | Expiración | Uso |
|-------|--------|-----------|-----|
| Access Token | `JWT_SECRET` | 7 días | Autenticación de requests |
| Reset Token | `JWT_RESET_SECRET` | 1 hora | Recuperación de contraseña |

---

## 6. Aislamiento Multi-Tenant

### Capas de Protección

1. **TenantGuard** — Resuelve y valida el tenant desde la request
2. **Prisma Middleware** — Inyecta `tenantId` automáticamente en queries
3. **AsyncLocalStorage** — Propaga contexto de tenant por toda la request
4. **RolesGuard** — Verifica permisos del usuario en el tenant actual

### Bypass para Platform Admin

```typescript
// En endpoints de Platform Super Admin:
this.tenantContext.setBypassFilter(true);
// Prisma no inyecta tenantId → acceso cross-tenant
```

### Modelos con Filtrado Automático

category, product, productOption, inventoryMovement, cart, wishlist, order, shipment, coupon, notification, auditLog

---

## 7. Webhook Security

### Culqi Webhook Validation

```typescript
// 1. Recibir payload + header x-culqi-signature
// 2. Calcular HMAC-SHA256(CULQI_WEBHOOK_SECRET, JSON.stringify(payload))
// 3. Comparar con signature recibida (timing-safe)
// 4. Verificar idempotencia via eventId
// 5. Almacenar en payment_webhooks
// 6. Procesar según tipo de evento
```

### Idempotencia

Todos los webhooks se verifican por `eventId` antes de procesarse:
- Si ya existe y `processed=true` → skip
- Si ya existe y `status=FAILED` → reintentar
- Si no existe → crear y procesar

---

## 8. Variables de Entorno de Seguridad

```env
# JWT Secrets (NUNCA hardcodear en código)
JWT_SECRET=tu-secreto-aqui-minimo-32-chars
JWT_RESET_SECRET=tu-secreto-reset-separado

# Culqi
CULQI_SECRET_KEY=sk_test_...
CULQI_WEBHOOK_SECRET=whsec_...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/cleo_platform

# CORS
FRONTEND_URL=http://localhost:5173
```

---

## 9. Checklist de Seguridad para Producción

- [ ] `JWT_SECRET` y `JWT_RESET_SECRET` son diferentes y de al menos 32 caracteres
- [ ] `CULQI_WEBHOOK_SECRET` está configurado
- [ ] `NODE_ENV=production` (deshabilita logging detallado de Prisma)
- [ ] HTTPS habilitado (Nginx + Certbot)
- [ ] CORS restringido a dominios de producción
- [ ] Rate limiting activo en todos los endpoints
- [ ] Helmet habilitado
- [ ] Password mínimo 8 caracteres en producción
- [ ] Rotación periódica de secrets
- [ ] Auditoría de logs revisada periódicamente
- [ ] Backup automático de base de datos
