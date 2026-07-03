# Contexto del sistema

Repositorio e-commerce compuesto por dos aplicaciones principales:

- `ecommerce-backend`: backend Java 21 con Spring Boot, Spring Security, JWT, PostgreSQL, RabbitMQ, Culqi y módulo de envíos.
- `valle-natural-app`: frontend Angular 22 con Standalone Components.

Este archivo resume el estado real del sistema para usarlo como referencia operativa.

## Visión general

La solución ya cubre la mayor parte de un e-commerce funcional:

- autenticación y perfil de usuario
- catálogo de productos y categorías
- carrito y wishlist
- checkout, pedido e historial
- pagos con Culqi
- cálculo de envíos
- administración de catálogo, pedidos, usuarios, cupones y auditoría
- tracking y webhooks de envío
- páginas legales y SEO por ruta

## Arquitectura real

### Backend

El backend expone la API bajo el prefijo global `/api/v1` gracias a `server.servlet.context-path`.

La aplicación incluye estos dominios principales:

- `security`: login, registro, refresh token, logout, JWT, usuarios y roles
- `catalog`: productos, categorías, inventario, historial de precios e imágenes
- `cart`: carrito de compra por usuario
- `wishlist`: lista de favoritos
- `order`: creación de pedidos, consulta de historial y tracking
- `payment`: integración con Culqi
- `shipping`: tarifas, zonas, despachos y webhook de Chazki/Shalom según el caso del dominio
- `coupon`: validación y administración de cupones
- `audit`: bitácora de eventos administrativos
- `notification`: envío de correos y mensajería interna

La implementación real ya fue alineada con parte del plan documentado:

- recuperación completa de contraseña
- endpoint de productos por categoría
- eliminación explícita de ítem de carrito
- consulta de pago por pedido
- capa `NotificationService` explícita
- plantillas HTML reales para correos

### Frontend

El frontend está organizado por features y ya tiene estas áreas reales:

- `core`: auth, interceptor JWT, guards y servicios centrales
- `shared`: modelos, componentes reutilizables y pipe de moneda
- `features/catalog`: home, listado de productos y detalle
- `features/auth`: login, registro y recuperación de contraseña
- `features/cart-wishlist`: carrito y wishlist
- `features/checkout-order`: checkout, pago, historial y detalle de pedido
- `features/admin`: dashboard y CRUDs administrativos
- `features/static-pages`: páginas legales o informativas

El front también fue mejorado con:

- pantalla de carga premium con logo
- header más limpio y funcional
- footer más consistente
- home con microinteracciones y mejor jerarquía visual
- checkout sin fallback demo y con Culqi configurado desde metadata

## Estado funcional por módulo

### Autenticación

Está implementada, pero con una diferencia importante frente al documento de implementación.

Lo que realmente ocurre:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- el backend entrega `access_token` y `refresh_token` en cookies `HttpOnly`
- el frontend usa `withCredentials` para que el navegador envíe las cookies
- la sesión visual se reconstruye consultando `GET /api/v1/users/me`

Lo que no coincide con `implementacion.md`:

- no se guardan tokens reales en `localStorage`
- `AuthService` no trabaja como un cliente de bearer tokens tradicional
- `getAccessToken()` y `getRefreshToken()` están como stubs para no romper compilación

### Catálogo

Está bien cubierto.

Backend:

- `GET /api/v1/catalog/products`
- `GET /api/v1/catalog/products/{slug}`
- `GET /api/v1/catalog/categories`
- `GET /api/v1/catalog/categories/{slug}`

Frontend:

- home en `/`
- listado en `/productos`
- detalle en `/products/:slug`

Observación:

- el plan original hablaba de `/` como catálogo principal; la implementación actual usa una home separada y el catálogo en `/productos`

### Carrito

Implementado tanto en frontend como backend.

Backend:

- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PATCH /api/v1/cart/items/{productId}?quantity=...`
- `DELETE /api/v1/cart`
- `DELETE /api/v1/cart/items/{productId}`

Frontend:

- soporte para carrito autenticado y carrito local de respaldo
- sincronización automática entre carrito local y carrito backend cuando hay sesión

### Wishlist

Implementada.

Backend:

- `GET /api/v1/wishlist`
- `POST /api/v1/wishlist/items/{productId}`
- `DELETE /api/v1/wishlist/items/{productId}`

Frontend:

- maneja wishlist con `Set<number>`
- persiste respaldo local en `localStorage`

### Checkout, pedidos y tracking

Implementado en una versión funcional.

Backend:

- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/{orderNumber}`
- `GET /api/v1/orders/{orderNumber}/tracking`

Frontend:

- checkout en `/checkout`
- pago en `/checkout/payment/:orderId`
- historial en `/orders`
- detalle en `/orders/:orderNumber`

### Pagos

Integrado con Culqi a nivel de backend y consumido desde el frontend.

Backend:

- `POST /api/v1/payments`
- `GET /api/v1/payments/{orderId}`

Frontend:

- `payment.service.ts` envía `orderId` y `culqiToken`
- la UI de pago existe como página separada
- la clave pública ya no está hardcodeada en el componente

### Envíos

También existe la parte operativa.

Backend:

- `POST /api/v1/shipping/rates/calculate`
- `GET /api/v1/shipping/zones`
- admin de despachos
- webhook para integración externa de envíos

Frontend:

- `shipping.service.ts` consume zonas y cálculo de tarifa

### Administración

Está bastante completo.

Backend:

- productos admin
- categorías admin
- órdenes admin
- envíos admin
- cupones admin
- usuarios admin
- auditoría admin

Frontend:

- dashboard
- productos
- categorías
- pedidos
- despachos
- cupones
- usuarios
- auditoría

## Rutas reales del frontend

Rutas principales actualmente presentes:

- `/`
- `/productos`
- `/products/:slug`
- `/login`
- `/register`
- `/password-reset`
- `/politicas`
- `/cart`
- `/wishlist`
- `/checkout`
- `/checkout/payment/:orderId`
- `/orders`
- `/orders/:orderNumber`
- `/admin`

## Endpoints backend relevantes

La API está organizada con controladores concretos y el backend efectivamente expone estas rutas:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/password-reset/request`
- `POST /api/v1/auth/password-reset/confirm`
- `GET /api/v1/users/me`
- `PUT /api/v1/users/me`
- `GET /api/v1/users/me/addresses`
- `POST /api/v1/users/me/addresses`
- `GET /api/v1/catalog/products`
- `GET /api/v1/catalog/products/{slug}`
- `GET /api/v1/catalog/categories`
- `GET /api/v1/catalog/categories/{slug}`
- `GET /api/v1/catalog/categories/{slug}/products`
- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PATCH /api/v1/cart/items/{productId}`
- `DELETE /api/v1/cart`
- `DELETE /api/v1/cart/items/{productId}`
- `GET /api/v1/wishlist`
- `POST /api/v1/wishlist/items/{productId}`
- `DELETE /api/v1/wishlist/items/{productId}`
- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/{orderNumber}`
- `GET /api/v1/orders/{orderNumber}/tracking`
- `POST /api/v1/payments`
- `GET /api/v1/payments/{orderId}`
- `POST /api/v1/shipping/rates/calculate`
- `GET /api/v1/shipping/zones`
- `GET /api/v1/coupons`
- `POST /api/v1/coupons/validate`
- `GET /api/v1/admin/products`
- `GET /api/v1/admin/categories`
- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/shipments`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/audit-logs`

## Observaciones técnicas importantes

- El frontend sí está conectado a la API real mediante `HttpClient`.
- `jwt.interceptor.ts` añade `withCredentials` a las peticiones hacia `/api/v1`.
- El interceptor intenta recuperar sesión ante `401`/`403` llamando a `/auth/refresh`.
- El backend gestiona la autenticación con cookies, no con bearer tokens visibles en el cliente.
- `angular.json` copia imágenes desde `public` y `IMG`, así que el proyecto ya está preparado para recursos visuales reales.
- Hay metadatos SEO por ruta en `app.routes.ts`, algo que no estaba descrito en `implementacion.md`.
- Existen páginas adicionales de contenido estático que no estaban en el plan original, como `/politicas`.

## Diferencias frente a `implementacion.md`

`implementacion.md` sigue siendo útil como referencia de intención, pero ya no describe fielmente la implementación actual.

Las diferencias más claras son:

- autenticación basada en cookies en lugar de tokens manejados en el cliente
- existencia de la ruta `/productos` en lugar de usar solo `/` como catálogo
- presencia de páginas SEO y legales adicionales
- ausencia de un `api.service.ts` central explícito en el frontend actual
- varias piezas reales del backend no estaban nombradas de forma explícita en el plan, aunque sí están implementadas

## Estado actual resumido

### Ya bastante sólido

- autenticación con cookies `HttpOnly`
- catálogo funcional y bien enlazado
- carrito y wishlist con respaldo local
- checkout operativo
- pago con Culqi
- admin funcional
- documentación viva en `README.md`, `contexto.md` y `alineacion-backend.md`

### Aún por pulir

- reducción de presupuestos CSS
- refinamiento visual de algunas pantallas admin
- estandarización final de contratos y tipos compartidos
- mejoras de soporte a producción y variables de entorno en frontend

## Conclusión

La plataforma está bastante avanzada y tiene una base coherente para operar como e-commerce real.

Si necesitamos seguir desarrollando, este archivo debe tomarse como la foto del estado actual, mientras que `implementacion.md` debe leerse como el plan original de arquitectura, no como el inventario exacto de lo ya construido.
