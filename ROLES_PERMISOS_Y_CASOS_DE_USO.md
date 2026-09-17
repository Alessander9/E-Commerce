# 📘 Especificación de Roles, Permisos, Jerarquías y Casos de Uso (ECU)
## Cleo Platform — SaaS E-Commerce Multi-Tenant

> **Documento Maestro de Arquitectura Funcional:** Define exhaustivamente el modelo de seguridad RBAC, jerarquías de usuarios, matriz de privilegios y las Especificaciones de Casos de Uso (ECU) con sus respectivos flujos de pantalla de extremo a extremo (*end-to-end*).

---

## 📑 Tabla de Contenidos
1. [Modelo de Roles y Jerarquías](#1-modelo-de-roles-y-jerarquías)
2. [Matriz RBAC de Permisos por Rol](#2-matriz-rbac-de-permisos-por-rol)
3. [Arquitectura de Autenticación y Contexto Multi-Tenant](#3-arquitectura-de-autenticación-y-contexto-multi-tenant)
4. [Mapa de Rutas y Flujos de Pantallas del Sistema](#4-mapa-de-rutas-y-flujos-de-pantallas-del-sistema)
5. [Especificación de Casos de Uso (ECU) de Inicio a Fin](#5-especificación-de-casos-de-uso-ecu-de-inicio-a-fin)
   - [ECU-01: Registro e Inicio de Sesión de Cliente (Customer Onboarding)](#ecu-01-registro-e-inicio-de-sesión-de-cliente)
   - [ECU-02: Exploración de Catálogo, Selección de Variantes y Carrito](#ecu-02-exploración-de-catálogo-selección-de-variantes-y-carrito)
   - [ECU-03: Proceso de Checkout, Validación de Cupón y Pago Culqi](#ecu-03-proceso-de-checkout-validación-de-cupón-y-pago-culqi)
   - [ECU-04: Seguimiento y Tracking Post-Venta por el Cliente](#ecu-04-seguimiento-y-tracking-post-venta-por-el-cliente)
   - [ECU-05: Gestión de Catálogo y Creación de Variantes (Tenant Admin/Manager)](#ecu-05-gestión-de-catálogo-y-creación-de-variantes)
   - [ECU-06: Control de Inventario y Kardex de Movimientos](#ecu-06-control-de-inventario-y-kardex-de-movimientos)
   - [ECU-07: Procesamiento, Despacho y Tracking Logístico de Pedidos](#ecu-07-procesamiento-despacho-y-tracking-logístico-de-pedidos)
   - [ECU-08: Gestión Comercial de Cupones y Descuentos](#ecu-08-gestión-comercial-de-cupones-y-descuentos)
   - [ECU-09: Configuración y Personalización de Marca del Tenant](#ecu-09-configuración-y-personalización-de-marca-del-tenant)
   - [ECU-10: Aprovisionamiento y Suspensión de Tenants (Platform Super Admin)](#ecu-10-aprovisionamiento-y-suspensión-de-tenants)
   - [ECU-11: Auditoría y Monitoreo Global de Plataforma](#ecu-11-auditoría-y-monitoreo-global-de-plataforma)

---

## 1. Modelo de Roles y Jerarquías

Cleo Platform implementa un modelo **RBAC Híbrido** (*Role-Based Access Control* con alcance Multi-Tenant). Un usuario (`User`) es una entidad global única en el sistema que puede poseer distintas membresías y roles en diferentes tiendas (`Tenant`) a través de la tabla relacional `user_tenants`.

```
                  ┌──────────────────────────────────────────────┐
                  │          PLATFORM_SUPER_ADMIN                │
                  │   (Alcance: PLATFORM | Nivel Global: ∞)      │
                  └──────────────────────┬───────────────────────┘
                                         │ Administra Tenants y Sistema
                  ┌──────────────────────▼───────────────────────┐
                  │              TENANT_ADMIN                    │
                  │     (Alcance: TENANT | Jerarquía: Nivel 3)   │
                  └──────────────────────┬───────────────────────┘
                                         │ Delega Operaciones Diarias
                  ┌──────────────────────▼───────────────────────┐
                  │             TENANT_MANAGER                   │
                  │     (Alcance: TENANT | Jerarquía: Nivel 2)   │
                  └──────────────────────┬───────────────────────┘
                                         │ Atiende Ventas y Despachos
                  ┌──────────────────────▼───────────────────────┐
                  │                CUSTOMER                      │
                  │     (Alcance: TENANT | Jerarquía: Nivel 1)   │
                  └──────────────────────┬───────────────────────┘
                                         │ Navegación Pública
                  ┌──────────────────────▼───────────────────────┐
                  │            GUEST / INVITADO                  │
                  │     (Alcance: PÚBLICO | Jerarquía: Nivel 0)  │
                  └──────────────────────────────────────────────┘
```

### 1.1 Definición de Roles

| Nivel | Rol | Scope | Descripción y Responsabilidad Principal |
| :---: | :--- | :---: | :--- |
| **∞** | `PLATFORM_SUPER_ADMIN` | `PLATFORM` | Super Administrador del SaaS. Acceso omnipotente *cross-tenant*. Crea y suspende tenants, gestiona planes SaaS, supervisa límites de recursos y audita la plataforma completa. |
| **3** | `TENANT_ADMIN` | `TENANT` | Dueño o Administrador General de la tienda. Control total sobre su tenant: configuración de marca, pasarelas de pago, creación de cupones, finanzas, inventario y gestión de usuarios administradores. |
| **2** | `TENANT_MANAGER` | `TENANT` | Gestor Operativo de Tienda. Responsable de la carga de catálogo, actualización de stock, cambio de estados de pedidos y asignación de números de seguimiento de courier. |
| **1** | `CUSTOMER` | `TENANT` | Cliente comprador autenticado. Puede guardar direcciones, crear pedidos, pagar con tarjeta/billetera, acceder a historial de compras y gestionar su lista de deseos. |
| **0** | `GUEST` (Anónimo) | `PÚBLICO` | Visitante sin sesión iniciada. Puede explorar el catálogo público, ver detalles de productos y agregar artículos a un carrito temporal persistido en sesión. |

---

## 2. Matriz RBAC de Permisos por Rol

La siguiente matriz estipula los privilegios granulares (`CREATE`, `READ`, `UPDATE`, `DELETE`) en cada módulo del sistema:

| Módulo Funcional | Recurso / Acción | GUEST (0) | CUSTOMER (1) | TENANT_MANAGER (2) | TENANT_ADMIN (3) | SUPER_ADMIN (∞) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Plataforma SaaS** | Crear / Eliminar Tenants | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Suspender / Reactivar Tenants | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Asignar Planes y Suscripciones | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Ver Auditoría Global del SaaS | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Configuración Tenant**| Modificar Colores, Logo, Slugs | ❌ | ❌ | ❌ | ✅ | ✅ |
| | Horarios, Teléfono, Moneda | ❌ | ❌ | ❌ | ✅ | ✅ |
| | Administrar Usuarios del Tenant | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Catálogo** | Explorar Catálogo y Productos | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Crear y Modificar Productos | ❌ | ❌ | ✅ | ✅ | ✅ |
| | Crear Atributos y Variantes | ❌ | ❌ | ✅ | ✅ | ✅ |
| | Eliminar Productos (Soft-delete)| ❌ | ❌ | ❌ | ✅ | ✅ |
| | Subir Imágenes a CDN/Storage | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Inventario** | Consultar Stock Disponible | ❌ (Solo badge) | ❌ (Solo badge) | ✅ | ✅ | ✅ |
| | Registrar Ingresos/Compras | ❌ | ❌ | ✅ | ✅ | ✅ |
| | Registrar Mermas y Ajustes | ❌ | ❌ | ✅ | ✅ | ✅ |
| | Modificar Stock Mínimo Alerta | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Carrito & Wishlist** | Carrito en Memoria / Sesión | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Persistir Carrito en BD | ❌ | ✅ | ❌ | ❌ | ❌ |
| | Gestionar Favoritos (Wishlist) | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Pedidos** | Crear Pedido y Reservar Stock | ❌ | ✅ | ❌ | ❌ | ❌ |
| | Ver Mis Propios Pedidos | ❌ | ✅ | ❌ | ❌ | ❌ |
| | Ver Todos los Pedidos del Tenant| ❌ | ❌ | ✅ | ✅ | ✅ |
| | Cambiar Estados (`PROCESSING`, etc.)| ❌ | ❌ | ✅ | ✅ | ✅ |
| | Cancelar Pedido de Cliente | ❌ | ✅ (Si PENDING) | ✅ | ✅ | ✅ |
| **Pagos** | Iniciar Transacción Culqi | ❌ | ✅ | ❌ | ❌ | ❌ |
| | Consultar Transacciones | ❌ | ❌ | ✅ | ✅ | ✅ |
| | Ejecutar Reembolso (`REFUND`) | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Logística & Envíos** | Ver Zonas y Tarifas de Despacho | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Asignar Courier y Tracking | ❌ | ❌ | ✅ | ✅ | ✅ |
| | Configurar Zonas y Tarifas | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Marketing** | Validar y Aplicar Cupón | ❌ | ✅ | ❌ | ❌ | ❌ |
| | Crear / Editar / Apagar Cupones| ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 3. Arquitectura de Autenticación y Contexto Multi-Tenant

### 3.1 Cadena de Seguridad en el Backend (NestJS Guards)
Cada petición HTTP entrante atraviesa una tubería de tres filtros secuenciales:

```
[ HTTP Request ]
       │
       ▼
┌──────────────────┐  Resuelve el tenant según:
│   TenantGuard    │  1. Header `x-tenant-slug`
└────────┬─────────┘  2. Subdominio (ej: tienda.cleoplatform.com)
         │            3. Fallback configurable (ej: perucat)
         ▼
┌──────────────────┐  Valida cabecera `Authorization: Bearer <JWT>`.
│  JwtAuthGuard    │  Extrae usuario autenticado y membresías activas.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐  Verifica que el usuario posea el rol exigido
│   RolesGuard     │  en el Tenant resuelto.
└────────┬─────────┘  (Bypass automático si es PLATFORM_SUPER_ADMIN).
         │
         ▼
[ Controller Handler ]
```

### 3.2 Protección de Rutas en Frontend (React `ProtectedRoute`)
El componente `<ProtectedRoute />` valida en tiempo de renderizado:
1. **Estado de Autenticación:** Si el usuario no tiene token válido, redirecciona a `/login?redirect=<url_origen>`.
2. **Nivel Mínimo (`minRoleLevel`):** Valida que `roleLevel >= minRoleLevel` (Ej: Nivel 1 para Checkout, Nivel 2 para Operaciones).
3. **Roles Permitidos (`allowedRoles`):** Bloquea acceso con una pantalla visual de **Acceso Denegado (403 Forbidden)** que incluye indicador jerárquico y botón de retorno seguro.

---

## 4. Mapa de Rutas y Flujos de Pantallas del Sistema

```
=============================================================================================
1. ÁREA PÚBLICA / STOREFRONT (Accesible por GUEST y CUSTOMER)
=============================================================================================
/                                  ➔ Inicio (Hero, Banners, Destacados, Categorías)
/productos                         ➔ Catálogo General con Filtros y Búsqueda
/productos/:slug                   ➔ Detalle de Producto con Selector de Variantes
/favoritos                         ➔ Lista de Deseos (Requiere Nivel 1: CUSTOMER)
/checkout                          ➔ Pasarela de Compra (Requiere Nivel 1: CUSTOMER)
/mis-pedidos                       ➔ Historial de Compras (Requiere Nivel 1: CUSTOMER)
/pedidos/:orderNumber              ➔ Detalle de Pedido y Tracking (Requiere Nivel 1)
/login                             ➔ Inicio de Sesión
/register                          ➔ Registro de Nuevos Clientes
/forgot-password                   ➔ Solicitud de Token de Recuperación
/reset-password                    ➔ Cambio Seguro de Contraseña

=============================================================================================
2. ÁREA ADMINISTRATIVA DE TIENDA (Requiere Nivel 2+: TENANT_MANAGER o TENANT_ADMIN)
=============================================================================================
/admin                             ➔ Dashboard Operativo (KPIs, Ventas, Pedidos Recientes)
/admin/productos                   ➔ Gestión de Catálogo (Crear, Editar, Galería, Variantes)
/admin/pedidos                     ➔ Listado de Órdenes y Filtrado por Estados
/admin/pedidos/:id                 ➔ Despacho, Detalle Financiero y Tracking de Pedido
/admin/inventario                  ➔ Control de Stock, Alertas y Kardex de Movimientos
/admin/configuracion               ➔ Parámetros de Marca, Redes y Horarios (Solo TENANT_ADMIN)
/admin/cupones                     ➔ Creación y Reglas de Cupones (Solo TENANT_ADMIN)

=============================================================================================
3. ÁREA DE SUPER ADMINISTRACIÓN DE PLATAFORMA (Requiere PLATFORM_SUPER_ADMIN / Nivel 3 Global)
=============================================================================================
/platform                          ➔ Métricas Globales del SaaS y MRR
/platform/tenants                  ➔ Directorio de Tiendas (Aprovisionar, Suspender, Eliminar)
/platform/usuarios                 ➔ Directorio Global de Cuentas y Asignación de Roles
/platform/auditoria                ➔ Registro Global de Auditoría de Mutaciones (AuditLog)
```

---

## 5. Especificación de Casos de Uso (ECU) de Inicio a Fin

---

### ECU-01: Registro e Inicio de Sesión de Cliente
- **ID:** ECU-01
- **Nombre:** Registro e Inicio de Sesión de Cliente en Storefront
- **Actor Principal:** Cliente Visitante (GUEST)
- **Actores Secundarios:** Servicio de Correo Transaccional (`Nodemailer`)
- **Precondiciones:** El visitante tiene acceso al storefront de la tienda (ej. *PeruCat*).

#### Flujo de Pantallas:
`Storefront Home (/)` ➔ Clic en "Iniciar Sesión" ➔ `/login` ➔ Clic en "¿No tienes cuenta? Regístrate" ➔ `/register` ➔ Envío de Formulario ➔ Redirección a `/` o al Checkout pendiente.

#### Flujo Principal:
1. El usuario accede a la vista `/register`.
2. El sistema presenta el formulario de registro solicitando: Nombres, Apellidos, Correo Electrónico, Teléfono y Contraseña.
3. El usuario completa los datos y presiona **"Crear Cuenta"**.
4. El frontend valida en tiempo real con esquema Zod (contraseña segura de mínimo 6 caracteres, formato email válido).
5. Se despacha `POST /api/auth/register` enviando el header `x-tenant-slug`.
6. El backend ejecuta en transacción:
   - Valida que el email no esté registrado previamente.
   - Aplica hash de contraseña con `bcryptjs` (salt rounds = 10).
   - Crea el registro en tabla `users`.
   - Crea la membresía en `user_tenants` con rol `CUSTOMER`.
   - Emite un token JWT firmado (`sub`, `email`, `tenantId`, `role: CUSTOMER`).
   - Envía correo de bienvenida en segundo plano con plantilla HTML.
7. El frontend almacena el token en `localStorage` y actualiza el `AuthContext`.
8. El sistema redirige al usuario a la vista de inicio mostrando su nombre en la barra de navegación.

#### Flujos Alternativos y Excepciones:
- **3a. Correo ya registrado:** El backend retorna HTTP 409 Conflict. El formulario resalta el campo de email con el mensaje *"Este correo electrónico ya se encuentra en uso"*.
- **3b. Inicio de sesión directo (`/login`):** Si el usuario ya posee cuenta, ingresa sus credenciales en `/login`. El backend valida el hash `bcryptjs`. Si coincide, emite JWT; si no, retorna HTTP 401 Unauthorized (*"Credenciales inválidas"*).

#### Postcondiciones:
- Usuario creado en `users` y vinculado al tenant en `user_tenants`.
- Token JWT emitido con vigencia de 7 días.

---

### ECU-02: Exploración de Catálogo, Selección de Variantes y Carrito
- **ID:** ECU-02
- **Nombre:** Búsqueda de Productos, Selección de Variantes y Gestión de Carrito
- **Actor Principal:** Cliente (GUEST o CUSTOMER)
- **Precondiciones:** La tienda cuenta con categorías y productos activos en base de datos.

#### Flujo de Pantallas:
`/productos` ➔ Filtros laterales / Barra de búsqueda ➔ Clic en tarjeta de producto ➔ `/productos/:slug` ➔ Selector de Variantes ➔ Clic en "Añadir al Carrito" ➔ Despliegue de Drawer Lateral (`CartDrawer`).

#### Flujo Principal:
1. El usuario navega en el catálogo `/productos`.
2. Utiliza los filtros facetados: selecciona una categoría (ej. *"Arena Clásica"*), rango de precio o ingresa un término en la barra de búsqueda reactiva.
3. El frontend consume `GET /api/store/products` con query params y renderiza la grilla de productos con imagen, título, precio base y badge de stock.
4. El cliente hace clic en una tarjeta y es dirigido a `/productos/:slug`.
5. La vista de detalle consume `GET /api/store/products/:slug`:
   - Muestra carrusel de imágenes de alta resolución.
   - Renderiza los botones de opciones (ej. Peso: `5 kg`, `10 kg`, `15 kg`).
6. El cliente selecciona una opción. El componente recalcula dinámicamente la variante correspondiente (`ProductVariant`), actualizando precio (`product_prices`), SKU y stock disponible en tiempo real.
7. El cliente define la cantidad deseada y presiona **"Agregar al Carrito"**.
8. El sistema valida que `cantidad <= availableStock`.
9. Se abre el **Drawer Lateral del Carrito**:
   - Muestra el listado de ítems seleccionados con miniaturas y subtotales.
   - Si el usuario está autenticado, despacha `POST /api/store/cart/items` persistiendo en tabla `cart_items`. Si es invitado, lo guarda en `localStorage`.
10. El cliente puede incrementar cantidades, eliminar productos o hacer clic en **"Proceder al Pago"** para ir al Checkout.

#### Flujos Alternativos y Excepciones:
- **6a. Variante sin existencias:** El botón de la opción muestra estado inhabilitado (*"Agotado"*) y el botón principal cambia a *"Sin Stock Disponible"*, impidiendo la adición al carrito.

---

### ECU-03: Proceso de Checkout, Validación de Cupón y Pago Culqi
- **ID:** ECU-03
- **Nombre:** Checkout Integral con Dirección de Envío, Cupón y Pasarela de Pago
- **Actor Principal:** Cliente Autenticado (CUSTOMER)
- **Actores Secundarios:** Pasarela de Pago Culqi, Servicio de Notificaciones
- **Precondiciones:** El cliente tiene al menos un ítem en su carrito y ha iniciado sesión.

#### Flujo de Pantallas:
`/checkout` (Paso 1: Dirección ➔ Paso 2: Envío ➔ Paso 3: Cupón ➔ Paso 4: Pago con Tarjeta Culqi) ➔ Pantalla de Confirmación con Número de Pedido `ORD-XXXX`.

#### Flujo Principal:
1. El cliente entra a `/checkout`. El sistema valida autenticación mediante `<ProtectedRoute minRoleLevel={1} />`.
2. **Paso 1 (Dirección):** El cliente selecciona una dirección guardada de su libreta (`addresses`) o completa el formulario con Departamento, Provincia, Distrito, Dirección exacta y Referencia.
3. **Paso 2 (Método de Envío):** El sistema consulta `GET /api/store/shipping/rates` según la zona seleccionada. El cliente elige el servicio de courier y se añade el costo al resumen de compra.
4. **Paso 3 (Cupón de Descuento - Opcional):**
   - El cliente ingresa un código promocional (ej. `BIENVENIDO10`) y presiona "Aplicar".
   - El frontend despacha `POST /api/store/coupons/validate`.
   - El backend valida vigencia, monto mínimo de compra y límite de redenciones. Si es válido, calcula y descuenta el monto en el resumen financiero.
5. **Paso 4 (Pago):** El cliente selecciona "Pago con Tarjeta de Crédito/Débito".
6. El cliente hace clic en **"Pagar S/ [Total]"**.
7. El backend ejecuta la transacción atómica `$transaction`:
   - Valida que todas las variantes tengan `availableStock >= cantidad`.
   - **Reserva de Stock:** Descuenta `availableStock` e incrementa `reservedStock` en la tabla `inventory`. Registra movimiento `RESERVATION` en `inventory_movements`.
   - Crea el registro de orden en tabla `orders` con estado `PENDING_PAYMENT` y genera el código único (ej. `ORD-2026-0089`).
   - Genera los snapshots inmutables en `order_items` y `order_shipping_address`.
8. Se invoca el procesamiento de pago con Culqi API:
   - Si el cargo es exitoso, Culqi retorna ID de transacción.
   - El backend actualiza `orders.status = PAID` y `orders.payment_status = PAID`.
   - **Confirmación de Inventario:** Descuenta permanentemente `reservedStock` y registra movimiento `SALE`.
   - Registra la transacción en `payments` y crea la redención en `coupon_redemptions`.
   - Crea el despacho inicial en tabla `shipments` con estado `PENDING`.
   - Dispara correo transaccional con plantilla HTML de Confirmación de Pedido.
9. El frontend redirige a la vista de éxito mostrando el resumen de la compra y botón para rastrear el pedido.

#### Flujos Alternativos y Excepciones:
- **4a. Cupón Inválido o Expirado:** La API retorna HTTP 400 Bad Request (*"El cupón ha vencido o no alcanza el monto mínimo"*). El resumen financiero se mantiene sin descuento.
- **7a. Stock Insuficiente en Checkout:** Si otro comprador agotó el producto segundos antes, la transacción revierte y la pantalla alerta: *"El producto [X] se ha agotado. Por favor actualice su carrito"*.
- **8a. Pago Rechazado por el Banco:**
   - La pasarela retorna error (fondos insuficientes, tarjeta denegada).
   - Se registra en `payments.status = FAILED`.
   - La orden queda en `PENDING_PAYMENT` durante una ventana de 30 minutos.
   - Si el cliente no reintenta el pago, el Cron Job automático libera el stock reservado (`RELEASE`) y cancela la orden (`CANCELLED`).

---

### ECU-04: Seguimiento y Tracking Post-Venta por el Cliente
- **ID:** ECU-04
- **Nombre:** Consulta de Pedidos y Línea de Tiempo de Envíos en Tiempo Real
- **Actor Principal:** Cliente Autenticado (CUSTOMER)
- **Precondiciones:** El cliente ha generado al menos una compra en la tienda.

#### Flujo de Pantallas:
Storefront ➔ Clic en "Mis Pedidos" en menú de usuario ➔ `/mis-pedidos` ➔ Clic en "Ver Detalle y Seguimiento" ➔ `/pedidos/:orderNumber`.

#### Flujo Principal:
1. El cliente ingresa a `/mis-pedidos`.
2. El sistema consume `GET /api/store/orders` (con aislamiento automático donde `orders.user_id = token.userId`).
3. Se despliega la lista de órdenes con fecha, código, total pagado y badge de estado (`PAGADO`, `EN PREPARACIÓN`, `EN RUTA`, `ENTREGADO`).
4. El cliente hace clic en un pedido específico.
5. Se abre la pantalla `/pedidos/:orderNumber`:
   - Muestra la **Línea de Tiempo Visual Interactiva**:
     - 🟢 *Pedido Confirmado y Pagado* (Fecha y hora).
     - 🟡 *Empaquetado en Almacén* (Completado).
     - 🔵 *En Tránsito / Despachado por Courier* (Muestra Empresa de Courier y Código de Seguimiento con botón para copiar).
     - ⚪ *Entregado en Dirección de Destino*.
   - Muestra el desglose de productos comprados (nombres, cantidades, precios congelados en snapshot).
   - Muestra la dirección exacta registrada para la entrega.

---

### ECU-05: Gestión de Catálogo y Creación de Variantes
- **ID:** ECU-05
- **Nombre:** Alta y Mantenimiento de Productos, Galería y Matriz de Variantes
- **Actor Principal:** Operador de Tienda (`TENANT_MANAGER` o `TENANT_ADMIN`)
- **Precondiciones:** Sesión iniciada con Nivel 2 o superior en el panel administrativo.

#### Flujo de Pantallas:
`/admin` ➔ Menú lateral "Productos" ➔ `/admin/productos` ➔ Clic en botón "+ Nuevo Producto" ➔ Modal / Vista de Carga ➔ Configuración de Variantes ➔ Guardar.

#### Flujo Principal:
1. El administrador ingresa a `/admin/productos`.
2. Presiona **"+ Nuevo Producto"**.
3. Completa los datos generales: Nombre, Slug, Descripción enriquecida, Categoría principal y Marca.
4. Si el producto es simple (sin variantes), define el precio base, SKU y stock inicial.
5. Si activa el toggle **"Tiene Variantes"**:
   - Selecciona las opciones aplicables (ej. Opción *Peso*: `5kg`, `10kg`, `20kg`).
   - El sistema genera la matriz de combinaciones en tabla `product_variants`.
   - Para cada variante, el usuario define: SKU propio, peso logístico, precio de venta (`product_prices`) y stock inicial.
6. Sube imágenes del producto (se procesan y almacenan en storage, vinculadas a `product_images`).
7. Presiona **"Publicar Producto"**.
8. El backend guarda la estructura completa en base de datos dentro de su `tenant_id` y genera el registro en `inventory` con el stock ingresado.
9. La tabla de `/admin/productos` se actualiza automáticamente mostrando el nuevo ítem.

---

### ECU-06: Control de Inventario y Kardex de Movimientos
- **ID:** ECU-06
- **Nombre:** Monitoreo de Stock, Alertas de Escasez y Registro de Movimientos Manuales
- **Actor Principal:** Operador de Tienda (`TENANT_MANAGER` o `TENANT_ADMIN`)
- **Precondiciones:** Productos dados de alta en el catálogo.

#### Flujo de Pantallas:
`/admin` ➔ Menú lateral "Inventario" ➔ `/admin/inventario` ➔ Filtro de stock bajo ➔ Clic en "Ajustar Stock" ➔ Modal de Registro Kardex.

#### Flujo Principal:
1. El usuario ingresa a `/admin/inventario`.
2. El dashboard resalta métricas inmediatas: Total de SKUs, Unidades Totales y **Alertas de Stock Bajo** (artículos con `available_stock < minimum_stock`).
3. El usuario localiza un producto que requiere reposición y hace clic en **"Registrar Movimiento"**.
4. Se despliega un modal con los campos:
   - Tipo de Movimiento: `PURCHASE` (Ingreso por compra a proveedor), `ADJUSTMENT` (Ajuste por conteo físico) o `MERMAS` (Deterioro/Rotura).
   - Cantidad: Unidades a ingresar o retirar.
   - Motivo / Nota de Auditoría: Descripción obligatoria del por qué de la acción.
5. Al confirmar:
   - El backend ejecuta la actualización en `inventory.available_stock`.
   - Inserta una fila inmutable en `inventory_movements` con `stock_before`, `stock_after`, `created_by` (ID del usuario) y timestamp.
6. La pantalla actualiza la cifra de stock disponible y añade el movimiento a la tabla histórica inferior.

---

### ECU-07: Procesamiento, Despacho y Tracking Logístico de Pedidos
- **ID:** ECU-07
- **Nombre:** Gestión de Órdenes, Emisión de Despacho y Actualización de Tracking
- **Actor Principal:** Operador de Tienda (`TENANT_MANAGER` o `TENANT_ADMIN`)
- **Precondiciones:** Existen pedidos en estado `PAID` pendientes de despacho.

#### Flujo de Pantallas:
`/admin` ➔ Menú "Pedidos" ➔ `/admin/pedidos` ➔ Clic en orden pagada ➔ `/admin/pedidos/:id` ➔ Panel de Despacho y Courier ➔ Clic en "Guardar y Notificar".

#### Flujo Principal:
1. El operador entra a `/admin/pedidos` y filtra por estado `PAID`.
2. Hace clic en un pedido para ver su detalle (`/admin/pedidos/:id`).
3. Verifica los ítems a empaquetar y la dirección de envío del cliente.
4. Cambia el estado operativo a `PROCESSING` (*"En Empaquetado"*).
5. En la sección de Logística:
   - Selecciona el Courier asignado (ej. *Olva Courier*, *Shalom*, *99Minutos*).
   - Ingresa el **Código de Seguimiento / Guía de Remisión** (ej. `OLVA-7829103`).
6. Presiona **"Despachar Pedido"**:
   - El sistema actualiza `orders.status = SHIPPED` y `fulfillment_status = FULFILLED`.
   - Actualiza `shipments` con el courier, código de tracking y fecha de envío.
   - Inserta un nuevo evento en `shipment_tracking` con estado `EN_TRANSITO`.
   - Registra el cambio en `order_status_history`.
   - Dispara un correo automático al cliente con el enlace y número de seguimiento para que rastree su paquete.

---

### ECU-08: Gestión Comercial de Cupones y Descuentos
- **ID:** ECU-08
- **Nombre:** Creación y Control de Campañas Promocionales con Cupones
- **Actor Principal:** Administrador de Tienda (`TENANT_ADMIN`)
- **Precondiciones:** Sesión con Nivel 3.

#### Flujo de Pantallas:
`/admin` ➔ Menú "Cupones" ➔ `/admin/cupones` ➔ Clic en "+ Crear Cupón" ➔ Formulario de Parámetros ➔ Guardar Cupón.

#### Flujo Principal:
1. El Tenant Admin ingresa a `/admin/cupones`.
2. Presiona **"+ Crear Cupón"**.
3. Define los parámetros de la promoción:
   - Código alfanumérico en mayúsculas (ej. `VERANO2026`).
   - Tipo de descuento: Porcentaje (`PERCENTAGE`) o Monto Fijo (`FIXED_AMOUNT`).
   - Valor: (ej. `15` para 15% o `20.00` para S/ 20 de rebaja).
   - Monto de compra mínima requerida (ej. `S/ 80.00`).
   - Límite de usos totales (ej. primeros 100 clientes) y límite por usuario (default: 1).
   - Fechas de vigencia (Fecha de inicio y Fecha de expiración).
4. Guarda el cupón. El backend valida unicidad dentro del tenant en tabla `coupons`.
5. El cupón queda inmediatamente habilitado para ser utilizado por los clientes en el Checkout.
6. En la tabla principal, el administrador puede monitorear en tiempo real el contador `used_count` y apagar cupones manualmente mediante un switch activo/inactivo.

---

### ECU-09: Configuración y Personalización de Marca del Tenant
- **ID:** ECU-09
- **Nombre:** Personalización de Identidad Visual, Datos de Contacto y Políticas
- **Actor Principal:** Administrador de Tienda (`TENANT_ADMIN`)
- **Precondiciones:** Sesión con Nivel 3.

#### Flujo de Pantallas:
`/admin` ➔ Menú "Configuración" ➔ `/admin/configuracion` ➔ Pestañas: *General*, *Branding*, *Contacto*, *Horarios* ➔ Guardar Cambios.

#### Flujo Principal:
1. El administrador ingresa a `/admin/configuracion`.
2. Edita los parámetros de su negocio:
   - **Branding:** Modifica los colores corporativos primario (`primary_color`) y secundario (`secondary_color`) mediante un selector de color interactivo; actualiza URLs de logotipo y favicon.
   - **Contacto y Soporte:** Teléfono de WhatsApp de atención, correo electrónico de soporte y dirección física del local central.
   - **Horarios de Atención:** Días hábiles y horas de apertura/cierre.
   - **Moneda y Ubicación:** PEN (Soles), zona horaria `America/Lima`.
3. Presiona **"Guardar Configuración"**:
   - El sistema ejecuta `PUT /api/tenant/settings`.
   - Se actualizan las tablas `tenants` y `tenant_settings`.
4. El Storefront asimila instantáneamente los nuevos colores y logotipos en el header, botones y footer para todos los visitantes.

---

### ECU-10: Aprovisionamiento y Suspensión de Tenants
- **ID:** ECU-10
- **Nombre:** Alta de Nuevas Tiendas, Configuración de Dominios y Control de Suspensión
- **Actor Principal:** Super Administrador (`PLATFORM_SUPER_ADMIN`)
- **Precondiciones:** Credenciales con Nivel Global de Plataforma.

#### Flujo de Pantallas:
`/platform` ➔ Menú "Tenants" ➔ `/platform/tenants` ➔ Clic en "+ Registrar Nueva Tienda" ➔ Modal de Parámetros SaaS ➔ Crear Tenant.

#### Flujo Principal:
1. El Super Admin ingresa al portal `/platform/tenants`.
2. Presiona **"+ Registrar Nueva Tienda"**.
3. Completa los datos iniciales del nuevo cliente SaaS:
   - Nombre de la Tienda (ej. *"Moda Urbana Perú"*).
   - Slug identificador único (ej. `moda-peru`).
   - Subdominio asignado (ej. `modaperu.cleoplatform.com`) o Dominio CNAME personalizado (ej. `modaurbana.pe`).
   - Plan SaaS asignado (Free, Basic, Pro, Enterprise).
   - Correo electrónico y contraseña del Tenant Admin inicial.
4. El backend ejecuta el aprovisionamiento automático:
   - Inserta registro en `tenants` y `tenant_settings`.
   - Asigna la suscripción activa en tabla `subscriptions` vinculada a los límites del plan (`plan_limits`).
   - Crea el usuario administrador en `users` y le otorga el rol `TENANT_ADMIN` en `user_tenants`.
   - Ejecuta la creación del tenant context en la base de datos.
5. **Acción de Suspensión:** Si un tenant incumple pagos o términos, el Super Admin puede hacer clic en **"Suspender"**:
   - El estado cambia a `status = 'SUSPENDED'` y `active = false`.
   - Inmediatamente, el `TenantGuard` deniega todas las peticiones públicas de esa tienda arrojando HTTP 403 Forbidden (*"Esta tienda se encuentra temporalmente suspendida"*).

---

### ECU-11: Auditoría y Monitoreo Global de Plataforma
- **ID:** ECU-11
- **Nombre:** Registro de Mutaciones Críticas y Trazabilidad de Auditoría
- **Actor Principal:** Super Administrador (`PLATFORM_SUPER_ADMIN`)
- **Precondiciones:** Acceso a `/platform/auditoria`.

#### Flujo de Pantallas:
`/platform` ➔ Menú "Auditoría" ➔ `/platform/auditoria` ➔ Filtros por fecha, acción, usuario o entidad.

#### Flujo Principal:
1. El sistema ejecuta en segundo plano el `AuditInterceptor` en cada petición mutacional (`POST`, `PUT`, `PATCH`, `DELETE`) procesada por la API REST.
2. El interceptor extrae automáticamente:
   - Usuario autor (`user_id`).
   - Tenant afectado (`tenant_id`).
   - Acción ejecutada (`CREATE`, `UPDATE`, `DELETE`).
   - Entidad modificada (`products`, `orders`, `coupons`, `settings`, etc.).
   - Snapshots en formato JSON del estado anterior (`old_value`) y estado posterior (`new_value`).
   - Dirección IP y cabecera User-Agent del navegador.
3. El Super Admin entra a `/platform/auditoria`:
   - Visualiza la tabla con orden cronológico descendente.
   - Puede expandir cualquier fila para comparar el JSON *diff* antes y después de la modificación.
   - Garantiza el cumplimiento normativo, control de fraudes y trazabilidad total del sistema.

---

## 6. Resumen de Seguridad y Garantías del Sistema

1. **Aislamiento Cero Fugas (Zero-Leakage Multi-Tenancy):** Ningún usuario ni administrador puede consultar o modificar datos pertenecientes a otro tenant; el middleware de Prisma y los guards validan la pertenencia en cada llamada a base de datos.
2. **Integridad Financiera:** Todo el ciclo de reserva de inventario, cobro y generación de orden se realiza bajo transacciones atómicas de base de datos con aislamiento estricto.
3. **Inmutabilidad de Datos Fiscales:** Los cambios futuros de precios o nombres en el catálogo no alteran bajo ninguna circunstancia las órdenes ya emitidas en el pasado gracias al uso de *JSON Snapshots*.
