# Alineación del Backend

Este documento resume el estado real del backend frente a lo propuesto en `backendEcommerce.md`.

Se divide en tres grupos:

- lo que ya tenemos implementado
- lo que falta modificar para alinearse al documento
- lo que todavía falta construir

## 1. Lo que ya tenemos implementado

### Seguridad y autenticación

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `JwtService`
- `JwtAuthenticationFilter`
- `UserDetailsServiceImpl`
- `RefreshTokenService`
- `PasswordResetToken` como entidad de soporte
- cookies `HttpOnly` para `access_token` y `refresh_token`
- `SecurityConfig`
- `CorsConfig`

### Usuario

- perfil de usuario autenticado
- actualización de perfil
- gestión de direcciones
- administración de usuarios

### Catálogo

- productos
- categorías
- inventario
- precios de producto
- imágenes de producto
- endpoints públicos para listar y ver detalle de producto
- endpoints de administración para productos y categorías

### Carrito

- ver carrito
- agregar productos
- actualizar cantidades
- vaciar carrito

### Wishlist

- ver wishlist
- agregar producto
- eliminar producto

### Pedidos

- crear pedido desde carrito
- listar pedidos del usuario
- ver detalle de pedido
- consultar tracking del pedido
- administración de pedidos

### Pagos

- integración con Culqi
- creación de pagos desde backend
- entidad `Payment`

### Envíos

- cálculo de tarifas
- listado de zonas
- despachos administrativos
- tracking de envíos
- webhook de integración externa

### Cupones

- validación de cupones
- administración de cupones
- redención de cupones

### Auditoría

- entidad de auditoría
- repositorio y servicio
- endpoint administrativo para consultar logs

### Notificaciones

- `RabbitMQConfig`
- `NotificationProducer`
- `NotificationConsumer`
- `EmailService`
- persistencia de notificaciones

### Infraestructura

- configuración de base de datos
- configuración de RabbitMQ
- CORS
- manejo global de errores
- `ApiResponse`

## 2. Lo que falta modificar para alinearse al documento

### Estructura y nombres

- `backendEcommerce.md` menciona `JwtConfig`, pero la implementación real no usa esa clase con ese nombre.
- `backendEcommerce.md` menciona `CulqiConfig`, pero la configuración actual vive en `application.yml` y en los servicios.
- `backendEcommerce.md` menciona `PageResponse`, pero hoy no se usa como tipo común de respuesta.
- `backendEcommerce.md` menciona `UserRole`, pero el modelo actual usa `User` y `Role`.

### Seguridad

- el documento describe un flujo más clásico de JWT con mayor protagonismo del token en el cliente
- la implementación real usa cookies `HttpOnly`, por lo que el documento debería actualizarse si esa será la estrategia final
- el frontend y el backend deben quedar documentados bajo el mismo contrato de autenticación

### Catálogo

- el documento propone un DTO `ProductFilterRequest`, pero en la implementación actual los filtros están en parámetros query simples
- el documento menciona `GET /catalog/categories/{slug}/products`, pero ese endpoint no existe hoy

### Carrito

- el documento menciona `DELETE /cart/items/{productId}`, pero el backend actual no expone ese endpoint
- si se quiere esa forma de borrado, hay que agregarla o actualizar el documento

### Pagos

- el documento propone `GET /payments/{orderId}`, pero hoy no está expuesto
- si se necesita consultar el pago por pedido desde el frontend o admin, falta ese endpoint

### Envíos

- el documento menciona `ShalomService`
- en la implementación real la integración visible está con `ShippingService` y `ChazkiService`
- si la intención es que el proyecto use Shalom, hay que actualizar nombres, servicios y documentación

### Notificaciones

- el documento menciona `NotificationService`
- en el backend actual existe la parte de productor, consumidor y correo, pero no una capa orquestadora con ese nombre

### Auditoría

- la estructura existe, pero el documento debería reflejar la ruta real y el naming real del módulo

## 3. Lo que falta construir

### Recuperación completa de contraseña

- endpoint público para solicitar reseteo
- endpoint público para confirmar nueva contraseña
- integración completa con `PasswordResetToken`
- envío de correo con token o link de recuperación

### Endpoint de productos por categoría

- `GET /catalog/categories/{slug}/products`

### Eliminación explícita de ítem de carrito

- `DELETE /cart/items/{productId}`

### Consulta de pago por pedido

- `GET /payments/{orderId}` o una ruta equivalente

### Capa de servicio de notificaciones más formal

- `NotificationService` como coordinador explícito
- orquestación clara entre productor, consumidor y correo

### Homologación de envíos

- decidir si el sistema usará `Chazki`, `Shalom` o ambos
- si se desea alineación total con el documento original, hace falta definir una única nomenclatura y servicios consistentes

### Endpoints de documentación o soporte adicionales

- respuesta paginada homogénea si se quiere estandarizar todo bajo `PageResponse`
- endpoint de categorías con productos
- endpoints de soporte para admin si se requieren consultas avanzadas

## 4. Resumen ejecutivo

### Ya está

- la base funcional del e-commerce
- seguridad
- catálogo
- carrito
- wishlist
- pedidos
- pagos
- envíos
- cupones
- auditoría
- notificaciones

### Hay que ajustar

- el contrato de autenticación en documentación y frontend
- nombres de algunas clases y servicios
- endpoints que el documento promete pero el backend real no expone

### Falta construir

- recuperación completa de contraseña
- algunos endpoints auxiliares
- una capa de notificaciones más explícita
- homologación final de la integración de envíos

## 5. Nota final

`backendEcommerce.md` funciona bien como plan de referencia, pero ya no es una descripción exacta del backend real.

Este archivo debe usarse como guía para decidir si:

- actualizamos el documento para reflejar lo que ya existe
- o completamos el backend hasta igualar el documento original
