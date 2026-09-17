# 🖥️ Manual Funcional del Backoffice y Paneles Administrativos
## Cleo Platform — SaaS E-Commerce Multi-Tenant

> **Guía Exhaustiva de Operaciones:** Detalla todas las pantallas, funcionalidades, formularios, botones, flujos operativos y herramientas disponibles en el **Tenant Backoffice** (`/admin`) y en el **Platform Super Admin Backoffice** (`/platform`).

---

## 📑 Tabla de Contenidos
1. [Arquitectura y Estructura del Backoffice](#1-arquitectura-y-estructura-del-backoffice)
2. [Tenant Admin Backoffice (`/admin`) — Operación de Tienda](#2-tenant-admin-backoffice-admin--operación-de-tienda)
   - [2.1 Dashboard Operativo y KPIs de Ventas](#21-dashboard-operativo-y-kpis-de-ventas)
   - [2.2 Gestión de Catálogo y Creador de Variantes](#22-gestión-de-catálogo-y-creador-de-variantes)
   - [2.3 Procesamiento, Despacho y Logística de Pedidos](#23-procesamiento-despacho-y-logística-de-pedidos)
   - [2.4 Control de Inventario, Kardex y Alertas de Stock](#24-control-de-inventario-kardex-y-alertas-de-stock)
   - [2.5 Gestión de Cupones y Promociones](#25-gestión-de-cupones-y-promociones)
   - [2.6 Configuración de Tienda, Branding y Horarios](#26-configuración-de-tienda-branding-y-horarios)
3. [Platform Super Admin Backoffice (`/platform`) — Control SaaS](#3-platform-super-admin-backoffice-platform--control-saas)
   - [3.1 Dashboard Global del SaaS y Métricas MRR](#31-dashboard-global-del-saas-y-métricas-mrr)
   - [3.2 Directorio de Tenants y Aprovisionamiento](#32-directorio-de-tenants-y-aprovisionamiento)
   - [3.3 Directorio Global de Usuarios y Asignación de Roles](#33-directorio-global-de-usuarios-y-asignación-de-roles)
   - [3.4 Visor de Auditoría y Registro de Mutaciones](#34-visor-de-auditoría-y-registro-de-mutaciones)

---

## 1. Arquitectura y Estructura del Backoffice

Cleo Platform divide su capa de administración en dos entornos independientes y estrictamente securizados mediante RBAC:

```
                                  [ Inicio de Sesión ]
                                           │
                        ┌──────────────────┴──────────────────┐
                        │                                     │
           [ Rol: TENANT_ADMIN / MANAGER ]         [ Rol: PLATFORM_SUPER_ADMIN ]
                        │                                     │
                        ▼                                     ▼
          ┌───────────────────────────┐         ┌───────────────────────────┐
          │  TENANT BACKOFFICE        │         │  PLATFORM SUPER ADMIN     │
          │  Ruta Base: `/admin`      │         │  Ruta Base: `/platform`   │
          │  Contexto: Tienda Propia  │         │  Contexto: Todo el SaaS   │
          └───────────────────────────┘         └───────────────────────────┘
```

---

## 2. Tenant Admin Backoffice (`/admin`) — Operación de Tienda

Destinado a dueños de negocio (`TENANT_ADMIN`) y operadores de catálogo y almacén (`TENANT_MANAGER`).

---

### 2.1 Dashboard Operativo y KPIs de Ventas
- **Ruta:** `/admin`
- **Nivel de Acceso:** Nivel 2+ (`TENANT_MANAGER`, `TENANT_ADMIN`).
- **Propósito:** Brindar una vista panorámica del rendimiento comercial en tiempo real.

#### Funciones y Componentes en Pantalla:
1. **Tarjetas de KPIs Principales:**
   - **Ventas Totales:** Suma acumulada de órdenes con estado `PAID` en la moneda de la tienda (ej. `S/ 24,850.00`).
   - **Total de Pedidos:** Contador global de órdenes recibidas con desglose de porcentaje de crecimiento mensual.
   - **Ticket Promedio:** Valor promedio por compra calculado automáticamente ($\text{Ventas Totales} / \text{Pedidos Pagados}$).
   - **Clientes Registrados:** Número de compradores únicos asociados al tenant en `user_tenants`.
2. **Gráfico de Tendencia de Ventas (Recharts):**
   - Curva temporal interactiva que muestra el volumen facturado por día, semana o mes.
   - Tooltips con detalles de ingresos al pasar el cursor sobre cada nodo de la gráfica.
3. **Sección de Alertas de Stock Crítico:**
   - Panel de aviso inmediato con lista de productos cuyo stock disponible sea menor o igual al stock mínimo configurado.
   - Botón de acción rápida *"Ajustar Stock"* que abre el modal de reposición directa.
4. **Tabla de Pedidos Recientes:**
   - Listado de las últimas 5 órdenes con número correlativo, nombre del cliente, total, fecha y badge de estado.
   - Enlace directo *"Ver Todos"* para saltar al listado completo de pedidos.

---

### 2.2 Gestión de Catálogo y Creador de Variantes
- **Ruta:** `/admin/productos`
- **Nivel de Acceso:** Nivel 2+ (`TENANT_MANAGER`, `TENANT_ADMIN`).
- **Propósito:** Control total del ciclo de vida de los productos, precios, fotos y combinaciones de variantes.

#### Funciones y Operaciones:
1. **Bandeja de Catálogo con Filtros Facetados:**
   - Buscador por texto predictivo (filtra por nombre del producto o SKU base).
   - Filtro por categoría jerárquica.
   - Filtro por estado: *Activos*, *Borradores/Inactivos*, *Con Stock Bajo*, *Agotados*.
   - Toggle rápido de activación: Switch que habilita o deshabilita la visibilidad del producto en el Storefront sin necesidad de abrir el formulario de edición.
2. **Formulario de Creación / Edición de Producto:**
   - **Datos Principales:** Título, Slug autogenerado URL-friendly, Marca, Categoría padre y descripción con formato.
   - **Selector de Producto Simple vs Configurable:**
     - *Producto Simple:* Asignación directa de Precio Regular, Precio de Oferta (`compare_at_price`), SKU único y Stock inicial.
     - *Producto con Variantes:* Habilita el Generador de Matriz.
3. **Generador Dinámico de Matriz de Variantes:**
   - Permite vincular opciones globales del tenant (ej. *Opción: Peso* ➔ Valores: `2.5 kg`, `5 kg`, `15 kg` | *Opción: Sabor* ➔ `Pollo`, `Salmón`).
   - El sistema cruza automáticamente los valores y genera las filas de `product_variants`.
   - Edición individual por variante: SKU específico, peso para cálculo de flete logístico, precio de venta y stock inicial de almacén.
4. **Gestor de Galería Multimedia:**
   - Zona de arrastrar y soltar (*drag & drop*) para subir múltiples imágenes de alta resolución.
   - Selector de imagen principal (Badge *"Portada"*).
   - Reordenamiento visual de fotografías.
5. **Acciones de Fila:**
   - ✏️ **Editar:** Abre el formulario completo precargado.
   - 👁️ **Ver en Tienda:** Enlace directo a `/productos/:slug` en una nueva pestaña.
   - 🗑️ **Eliminar:** Ejecuta *soft-delete* (actualiza `deleted_at = now()`), retirándolo de la tienda pública sin romper los snapshots de órdenes pasadas.

---

### 2.3 Procesamiento, Despacho y Logística de Pedidos
- **Ruta:** `/admin/pedidos` y `/admin/pedidos/:id`
- **Nivel de Acceso:** Nivel 2+ (`TENANT_MANAGER`, `TENANT_ADMIN`).
- **Propósito:** Administración del flujo de despacho desde el pago hasta la entrega física.

#### Funciones y Operaciones:
1. **Bandeja Central de Órdenes:**
   - Pestañas de estado para navegación ágil:
     - 🟠 **Pendientes de Pago (`PENDING_PAYMENT`)**
     - 🟢 **Pagados / Por Empaquetar (`PAID`)**
     - 🔵 **En Preparación (`PROCESSING`)**
     - 🟣 **En Camino / Despachados (`SHIPPED`)**
     - ⚪ **Entregados con Éxito (`DELIVERED`)**
     - 🔴 **Cancelados / Reembolsados (`CANCELLED`)**
   - Métricas de conteo por cada estado en la cabecera.
2. **Vista de Detalle del Pedido (`/admin/pedidos/:id`):**
   - **Resumen Financiero:** Subtotal, costo de envío cobrado, descuento aplicado por cupón y total final.
   - **Información del Cliente:** Nombres, correo electrónico, teléfono de contacto y fecha de registro.
   - **Dirección de Entrega Inmutable:** Departamento, provincia, distrito, dirección detallada y referencias proporcionadas por el comprador.
   - **Desglose de Ítems:** Miniatura del producto, nombre, variante, SKU y cantidad comprada.
3. **Módulo de Asignación Logística y Despacho:**
   - Menú desplegable para seleccionar el **Courier Asignado**: *Olva Courier*, *Shalom Express*, *99Minutos*, *Motorizado Propio / Local*.
   - Input de **Código de Seguimiento / Guía de Remisión**: Inserción del número de tracking oficial emitido por la empresa transportista.
   - Botón **"Despachar Pedido"**:
     - Actualiza `orders.status = 'SHIPPED'`.
     - Registra el evento en `shipment_tracking` con timestamp y estado `EN_TRANSITO`.
     - Dispara automáticamente el correo de despacho al cliente con el enlace de seguimiento.
4. **Gestión de Incidencias y Reembolsos (Solo `TENANT_ADMIN`):**
   - Botón **"Emitir Reembolso / Cancelar"**: Revierte el estado de pago a `REFUNDED`, cancela la orden y retorna las unidades al inventario disponible (`available_stock`) mediante un movimiento `RELEASE`.

---

### 2.4 Control de Inventario, Kardex y Alertas de Stock
- **Ruta:** `/admin/inventario`
- **Nivel de Acceso:** Nivel 2+ (`TENANT_MANAGER`, `TENANT_ADMIN`).
- **Propósito:** Supervisión de existencias físicas y auditoría contable de entradas/salidas.

#### Funciones y Operaciones:
1. **Tablero de Balance de Existencias:**
   - Muestra tabla con: Nombre de Producto, Variante/SKU, Stock Disponible, Stock Reservado (en proceso de compra), Stock Total y Nivel de Alerta.
   - Semáforo de color interactivo:
     - 🟢 **Verde:** Stock saludable ($> 15$ unidades).
     - 🟡 **Amarillo:** Stock próximo a agotarse ($\le$ stock mínimo).
     - 🔴 **Rojo:** Agotado ($0$ unidades disponibles).
2. **Modal de Registro de Movimiento Manual (Kardex):**
   - Selector de producto/variante a modificar.
   - **Tipo de Movimiento:**
     - `PURCHASE`: Ingreso de nuevas unidades por recepción de mercadería de fábrica/proveedor.
     - `ADJUSTMENT`: Corrección manual por diferencias en inventario físico periódico.
     - `MERMAS`: Descarte de productos dañados, rotos o vencidos.
   - Input de unidades a sumar o restar.
   - **Nota Obligatoria:** Campo de texto para justificar la operación (ej. *"Ingreso según Factura F001-4920 del proveedor"*).
3. **Kardex Histórico de Auditoría:**
   - Tabla cronológica inferior con todos los movimientos registrados automáticamente por el sistema (Ventas, Reservas, Liberaciones) o manualmente por los operadores, indicando fecha, responsable y saldo resultante.

---

### 2.5 Gestión de Cupones y Promociones
- **Ruta:** `/admin/cupones`
- **Nivel de Acceso:** Nivel 3 (`TENANT_ADMIN`).
- **Propósito:** Configuración de promociones de marketing y códigos de descuento.

#### Funciones y Operaciones:
1. **Listado de Cupones Activos:**
   - Muestra código, tipo de descuento, valor, fecha de inicio y fin, usos acumulados vs límite global y estado activo/inactivo.
   - Switch de activación inmediata para pausar una campaña en cualquier momento.
2. **Formulario de Creación de Cupón:**
   - **Código:** Código en mayúsculas (ej. `CLIENTEVIP15`).
   - **Tipo:** Porcentaje (ej. `15%`) o Monto Fijo en Soles (ej. `S/ 25.00`).
   - **Descuento Máximo:** Tope de descuento en soles para cupones porcentuales.
   - **Monto Mínimo de Pedido:** Gasto mínimo en el carrito para que aplique la promoción.
   - **Límites de Uso:** Máximo de redenciones globales y límite por cliente (ej. 1 uso por usuario).
   - **Vigencia:** Fechas de inicio y fin de la campaña con selector de calendario.

---

### 2.6 Configuración de Tienda, Branding y Horarios
- **Ruta:** `/admin/configuracion`
- **Nivel de Acceso:** Nivel 3 (`TENANT_ADMIN`).
- **Propósito:** Control de la identidad corporativa y datos comerciales de la tienda.

#### Pestañas y Funcionalidades:
1. **Identidad Visual y Branding:**
   - **Selector de Color Primario:** Color principal de botones, cabeceras y destacados (picker hexadecimal con previsualización en vivo).
   - **Selector de Color Secundario:** Color de acentos y badges.
   - **Logotipo y Favicon:** Carga y actualización de URLs de recursos gráficos.
2. **Información Comercial y Contacto:**
   - Nombre comercial visible de la tienda.
   - Número de WhatsApp de atención al cliente (se refleja automáticamente en el botón flotante del Storefront).
   - Correo electrónico de soporte y dirección física del local central.
3. **Horarios de Atención:**
   - Configuración de horarios en días hábiles (ej. `Lunes a Viernes: 08:00 - 18:00`) y fines de semana.
4. **Moneda y Parámetros Regionales:**
   - Moneda base (`PEN` - Soles), zona horaria (`America/Lima`) e idioma (`es_PE`).

---

## 3. Platform Super Admin Backoffice (`/platform`) — Control SaaS

Destinado a los administradores generales de **Cleo Platform** para gobernar el ecosistema multi-tenant completo.

---

### 3.1 Dashboard Global del SaaS y Métricas MRR
- **Ruta:** `/platform`
- **Nivel de Acceso:** `PLATFORM_SUPER_ADMIN`.
- **Propósito:** Monitoreo del crecimiento, salud financiera y volumen de operación de todo el SaaS.

#### KPIs y Métricas Globales:
1. **Total de Tiendas (Tenants):** Número de tiendas registradas con desglose de activas, en prueba (*trial*) y suspendidas.
2. **MRR (Monthly Recurring Revenue):** Ingresos recurrentes mensuales por concepto de suscripciones SaaS de los tenants.
3. **GMV (Gross Merchandise Value):** Volumen total de dinero transaccionado por todas las tiendas de la plataforma en el mes en curso.
4. **Usuarios Globales:** Total de clientes registrados en el ecosistema.
5. **Gráfico de Crecimiento de Tiendas:** Histórico de adopción de la plataforma y nuevas tiendas creadas por mes.

---

### 3.2 Directorio de Tenants y Aprovisionamiento
- **Ruta:** `/platform/tenants`
- **Nivel de Acceso:** `PLATFORM_SUPER_ADMIN`.
- **Propósito:** Aprovisionar, editar planes, suspender o eliminar tiendas cliente.

#### Funciones y Operaciones:
1. **Buscador y Listado de Tiendas:**
   - Tabla con: Nombre comercial, Slug, Dominio/Subdominio asignado, Plan SaaS activo, Fecha de creación y Estado (`ACTIVE`, `SUSPENDED`).
2. **Asistente de Aprovisionamiento ("+ Registrar Nueva Tienda"):**
   - **Paso 1 (Datos de Tienda):** Nombre, slug único en URL y dominio personalizado.
   - **Paso 2 (Plan SaaS):** Asignación del plan comercial (Free, Basic, Pro, Enterprise).
   - **Paso 3 (Cuenta Administradora):** Nombres, correo y contraseña del primer `TENANT_ADMIN`.
   - Al confirmar, el sistema inicializa en una sola transacción todas las tablas relacionales, configuraciones por defecto y permisos de la nueva tienda.
3. **Acciones Críticas de Tenant:**
   - ⏸️ **Suspender Tienda:** Inhabilita inmediatamente el acceso al Storefront y al panel admin de ese tenant arrojando error 403 con mensaje de suspensión.
   - ▶️ **Reactivar Tienda:** Restablece la operación completa tras la regularización de pagos.
   - ⚙️ **Cambiar Plan:** Modifica los límites de cuotas técnicas (máximo de productos permitidos, administradores y almacenamiento).
   - 🗑️ **Eliminar Tenant:** Borrado controlado con confirmación de seguridad en dos pasos.

---

### 3.3 Directorio Global de Usuarios y Asignación de Roles
- **Ruta:** `/platform/usuarios`
- **Nivel de Acceso:** `PLATFORM_SUPER_ADMIN`.
- **Propósito:** Gestión integral de identidades y privilegios en toda la plataforma.

#### Funciones y Operaciones:
1. **Listado de Cuentas Globales:**
   - Tabla con Nombres, Email, Teléfono, Fecha de Creación y membresías de tenants asociadas.
2. **Modal de Gestión de Membresías y Roles:**
   - Permite seleccionar un usuario y vincularlo a uno o más tenants.
   - Asignar o revocar roles específicos (`PLATFORM_SUPER_ADMIN`, `TENANT_ADMIN`, `TENANT_MANAGER`, `CUSTOMER`).
3. **Bloqueo de Cuenta:** Inhabilita el login del usuario a nivel de todo el SaaS en caso de detectar actividad fraudulenta.

---

### 3.4 Visor de Auditoría y Registro de Mutaciones
- **Ruta:** `/platform/auditoria`
- **Nivel de Acceso:** `PLATFORM_SUPER_ADMIN`.
- **Propósito:** Trazabilidad forense, seguridad de la información y cumplimiento normativo.

#### Funciones y Operaciones:
1. **Bandeja de Eventos en Tiempo Real:**
   - Lista cronológica de todas las operaciones capturadas por el `AuditInterceptor`.
   - Columnas: Timestamp, Tenant afectado, Usuario autor (nombre y correo), Acción (`CREATE`, `UPDATE`, `DELETE`), Entidad modificada (`Product`, `Order`, `Coupon`, `TenantSettings`) e IP de origen.
2. **Filtros de Búsqueda Avanzada:**
   - Filtrar por rango de fechas, por tienda específica o por tipo de acción crítica.
3. **Modal de Inspección Forense (JSON Diff):**
   - Al hacer clic en un evento, se abre una ventana modal que muestra la comparación visual del estado anterior (`old_value`) contra el nuevo estado (`new_value`), permitiendo ver con precisión qué campos fueron alterados y por quién.
