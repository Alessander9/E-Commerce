# Plan de Implementación Frontend — Migración a Angular (E-Commerce)

Este plan describe la arquitectura y los pasos detallados para implementar el frontend en **Angular** (v17+ con Standalone Components) adaptado exactamente al estado actual de nuestro backend (Java 21, Spring Security, JWT, PostgreSQL, Shalom y pagos con Culqi).

---

## 1. Arquitectura del Proyecto Frontend

Organizaremos el proyecto bajo un diseño modular limpio por características (feature-based routing), aislando el núcleo (`core`), elementos compartidos (`shared`) y módulos funcionales (`features`):

```
src/app/
├── core/
│   ├── interceptors/
│   │   └── jwt.interceptor.ts         # Inyecta token JWT en cabeceras de HTTP y maneja 401
│   ├── guards/
│   │   ├── auth.guard.ts              # Protege rutas de clientes autenticados
│   │   └── admin.guard.ts             # Protege rutas de administrador (ROLE_ADMIN)
│   └── services/
│       ├── auth.service.ts            # Registro, login, refresh token, estado de sesión
│       └── api.service.ts             # Cliente HTTP base wrapper
│
├── shared/
│   ├── components/
│   │   ├── header/                    # Navbar responsivo con barra de búsqueda, carrito y perfil
│   │   ├── footer/                    # Footer corporativo
│   │   ├── product-card/              # Tarjeta de producto reutilizable con botón "Agregar al Carrito/Wishlist"
│   │   └── notification/              # Toasts/Alertas animadas para avisos al usuario
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── product.model.ts
│   │   ├── cart.model.ts
│   │   ├── order.model.ts
│   │   └── shipping.model.ts
│   └── pipes/
│       └── currency-pen.pipe.ts       # Formateo de precios en Soles peruanos (S/)
│
└── features/
    ├── auth/
    │   └── pages/
    │       ├── login/                 # Formulario Reactivo de inicio de sesión
    │       ├── register/              # Formulario Reactivo de registro de cliente
    │       └── password-reset/        # Flujo de recuperación de contraseña (solicitud y confirmación)
    │
    ├── catalog/
    │   ├── pages/
    │   │   ├── product-list/          # Vista con filtros por categoría, buscador por texto y paginación
    │   │   └── product-detail/        # Detalle de producto (imágenes, precio dinámico, stock disponible)
    │   └── services/
    │       └── catalog.service.ts     # Conexión a /api/v1/catalog/...
    │
    ├── cart-wishlist/
    │   ├── pages/
    │   │   ├── cart-detail/           # Carrito actual, cambio de cantidad, aplicar cupones, vaciar
    │   │   └── wishlist-detail/       # Lista de productos favoritos del cliente
    │   └── services/
    │       ├── cart.service.ts        # Conexión a /api/v1/cart/...
    │       └── wishlist.service.ts    # Conexión a /api/v1/wishlist/...
    │
    ├── checkout-order/
    │   ├── pages/
    │   │   ├── checkout-form/         # Selección/Creación de dirección, cálculo de tarifa de envío
    │   │   ├── payment-culqi/         # Carga del Culqi Checkout v2 y confirmación de cargo
    │   │   ├── order-history/         # Historial de pedidos del usuario
    │   │   └── order-detail/          # Detalle del pedido y su tracking en tiempo real
    │   └── services/
    │       ├── order.service.ts       # Conexión a /api/v1/orders/...
    │       ├── payment.service.ts     # Conexión a /api/v1/payments/...
    │       └── shipping.service.ts    # Conexión a /api/v1/shipping/...
    │
    └── admin/
        ├── pages/
        │   ├── dashboard/             # Panel de control de administrador
        │   ├── admin-products/        # CRUD de productos, stocks e historial de precios
        │   ├── admin-categories/      # CRUD de categorías jerárquicas
        │   ├── admin-orders/          # Listado de pedidos globales y control de estados
        │   ├── admin-shipments/       # Despacho de pedidos y registro de tracking de Shalom
        │   ├── admin-coupons/         # CRUD de cupones de descuento
        │   ├── admin-users/           # Lista de usuarios con habilitación/deshabilitación
        │   └── admin-audit/           # Registro de auditorías de base de datos
        └── services/
            └── admin.service.ts       # Conexión a /api/v1/admin/...
```

---

## 2. Ruteo en la Aplicación (`app.routes.ts`)

Configuraremos un sistema de rutas dinámico y protegido usando Lazy Loading para optimizar el rendimiento de la aplicación:

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Rutas Públicas (Catálogo y Auth)
  { path: '', loadComponent: () => import('./features/catalog/pages/product-list/product-list.component').then(m => m.ProductListComponent) },
  { path: 'products/:slug', loadComponent: () => import('./features/catalog/pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'password-reset', loadComponent: () => import('./features/auth/pages/password-reset/password-reset.component').then(m => m.PasswordResetComponent) },

  // Rutas del Cliente Autenticado
  { 
    path: '', 
    canActivate: [authGuard], 
    children: [
      { path: 'cart', loadComponent: () => import('./features/cart-wishlist/pages/cart-detail/cart-detail.component').then(m => m.CartDetailComponent) },
      { path: 'wishlist', loadComponent: () => import('./features/cart-wishlist/pages/wishlist-detail/wishlist-detail.component').then(m => m.WishlistDetailComponent) },
      { path: 'checkout', loadComponent: () => import('./features/checkout-order/pages/checkout-form/checkout-form.component').then(m => m.CheckoutFormComponent) },
      { path: 'checkout/payment/:orderId', loadComponent: () => import('./features/checkout-order/pages/payment-culqi/payment-culqi.component').then(m => m.PaymentCulqiComponent) },
      { path: 'orders', loadComponent: () => import('./features/checkout-order/pages/order-history/order-history.component').then(m => m.OrderHistoryComponent) },
      { path: 'orders/:orderNumber', loadComponent: () => import('./features/checkout-order/pages/order-detail/order-detail.component').then(m => m.OrderDetailComponent) },
    ]
  },

  // Rutas de Administración
  { 
    path: 'admin', 
    canActivate: [authGuard, adminGuard], 
    loadComponent: () => import('./features/admin/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: 'products', loadComponent: () => import('./features/admin/pages/admin-products/admin-products.component').then(m => m.AdminProductsComponent) },
      { path: 'categories', loadComponent: () => import('./features/admin/pages/admin-categories/admin-categories.component').then(m => m.AdminCategoriesComponent) },
      { path: 'orders', loadComponent: () => import('./features/admin/pages/admin-orders/admin-orders.component').then(m => m.AdminOrdersComponent) },
      { path: 'shipments', loadComponent: () => import('./features/admin/pages/admin-shipments/admin-shipments.component').then(m => m.AdminShipmentsComponent) },
      { path: 'coupons', loadComponent: () => import('./features/admin/pages/admin-coupons/admin-coupons.component').then(m => m.AdminCouponsComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/pages/admin-users/admin-users.component').then(m => m.AdminUsersComponent) },
      { path: 'audit', loadComponent: () => import('./features/admin/pages/admin-audit/admin-audit.component').then(m => m.AdminAuditComponent) },
    ]
  },

  { path: '**', redirectTo: '' }
];
```

---

## 3. Integración con el Módulo de Seguridad y JWT

Implementaremos un interceptor HTTP (`JwtInterceptor`) que de manera automática adjunte el Access Token guardado en el almacenamiento local a cada petición HTTP dirigida a `/api/v1/`.

### El Proceso de Renovación de Sesión (Refresh Token)
1. **Inicio de sesión:** Guarda el `accessToken` y `refreshToken` recibidos del backend.
2. **Expiración del Token:** Si el interceptor detecta un error `401 Unauthorized`, invocará automáticamente al endpoint `/auth/refresh` con el refresh token. Si tiene éxito, actualiza la sesión y repite la petición original. Si falla, cierra sesión y redirige al `/login`.

---

## 4. Flujo de Pago y Envíos (Culqi + Shalom)

### Envíos (Shalom)
1. Durante el checkout, el cliente selecciona una dirección.
2. Se consume `POST /shipping/rates/calculate` enviando el `addressId` para obtener la tarifa basada en el peso del carrito y distrito.
3. El costo devuelto se añade al subtotal para formar el total del pedido.

### Pagos (Culqi)
1. Tras crear el pedido (que inicia en estado `PENDING`), se redirige a `/checkout/payment/:orderId`.
2. Se integra el script dinámico de Culqi Checkout v2.
3. Al ingresar la tarjeta, Culqi genera un `token`.
4. El frontend captura el token de tarjeta y envía un `POST /payments` al backend estructurando el cobro.
5. Si el pago es exitoso (`PAID`), el backend cambia el estado de la orden y el front redirige al usuario a la página de éxito.

---

## 5. Estética y Diseño Premium

Para asegurar una apariencia premium de acuerdo a nuestras pautas de diseño:
*   **Colores y Degradados:** Usaremos una paleta moderna en variables CSS, priorizando tonos verdes orgánicos apagados combinados con acentos dorados sutiles (ideal para "Valle Natural").
*   **Tipografía:** Utilizaremos la fuente de Google Fonts **Outfit** o **Inter** para textos legibles y elegantes.
*   **Micro-animaciones:** Añadiremos transiciones CSS suaves en los botones de compra, el contador del carrito del header, y estados de hover de las tarjetas de producto.
*   **Imágenes y Recursos:** En lugar de placeholders, utilizaremos recursos bien definidos.

---

## 6. Fases del Desarrollo Frontend

1.  **Fase A — Inicialización:** Creación del proyecto Angular, configuración de estilos globales (`styles.css`), declaración de componentes compartidos (`Header`, `Footer`).
2.  **Fase B — Servicios & Auth:** Desarrollo de `AuthService`, interceptor de tokens, páginas de Login y Registro.
3.  **Fase C — Catálogo & Carrito:** Vista de productos con buscador funcional, página de detalles de producto, panel lateral del carrito de compras interactivo.
4.  **Fase D — Checkout & Culqi:** Integración de la vista de checkout, cálculo de envíos, llamada a pasarela de pagos con Culqi.
5.  **Fase E — Panel de Administración:** Construcción de las tablas interactivas para gestión de catálogo, auditoría, asignación de tracking de Shalom y cupones de descuento.
