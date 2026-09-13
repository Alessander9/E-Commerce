# Contexto del Sistema — PeruCat (Cleo Platform)

Repositorio e-commerce SaaS multi-tenant compuesto por dos aplicaciones principales en monorepo:

- `apps/api`: backend NestJS 10 con TypeScript, Prisma 6, PostgreSQL 18, JWT, Culqi y arquitectura multi-tenant.
- `apps/web`: frontend React 19 con TypeScript, Vite, Tailwind CSS y componentes animados.

**Tenant Insignia Actual:** **PeruCat** (Arenas Sanitarias & Cuidado Felino).

---

## 🐾 Identidad y Temática Oficial: PeruCat

### Slogan Principal
> **Una nueva forma de cuidar su mundo.**  
> La arena sanitaria que combina absorción, aglomeración y control de olores para hacer más fácil la vida junto a tu gato.  
> **Limpieza para ellos. Tranquilidad para ti.**

---

## 📖 Estructura Narrativa y Secciones del E-Commerce

### 1. Todo empieza con un arenero limpio
Tu gato merece un espacio cómodo, limpio y agradable todos los días. PeruCat está pensada para ayudarte a mantener el arenero en mejores condiciones, facilitando la limpieza y ayudando a controlar los olores de manera práctica.

### 2. Hecha para facilitar tu día (4 Pilares Funcionales)
- **Alta absorción:** Ayuda a absorber rápidamente la humedad para mantener el arenero más limpio y seco.
- **Aglomeración práctica:** Forma grumos que facilitan la separación de los residuos y permiten una limpieza más sencilla.
- **Control de olores:** Ayuda a encapsular los malos olores para mantener un ambiente más agradable.
- **Más practicidad:** Limpia, retira y repone de manera sencilla para dedicar menos tiempo al mantenimiento del arenero.

### 3. Menos olor. Más tranquilidad.
La rutina con tu gato debería ser sencilla. PeruCat ayuda a controlar los olores asociados a la humedad y los residuos, para que puedas disfrutar de un hogar más fresco y agradable.  
*Porque compartir tu hogar con un gato también significa disfrutarlo.*

### 4. Una arena pensada para tu gato
Cada gato tiene su propia personalidad, pero todos necesitan un espacio limpio para sentirse cómodos. PeruCat te ayuda a mantener su arenero limpio y preparado para todos los días.  
*Más limpieza. Más comodidad. Más bienestar.*

### 5. Conoce nuestras arenas (Catálogo y Presentaciones)
Descubre nuestras diferentes presentaciones y elige la opción que mejor se adapte a tu gato y a tu hogar. Desde opciones para el día a día hasta alternativas pensadas para quienes buscan mayor practicidad y rendimiento.  
*Encuentra tu PeruCat ideal.*

### 6. Una marca con experiencia, ahora con una nueva identidad
PeruCat representa una nueva etapa en nuestra propuesta de arenas sanitarias para mascotas. Nacemos con el compromiso de ofrecer productos prácticos, confiables y pensados para las necesidades reales de quienes comparten su vida con gatos.  
*Experiencia que evoluciona. Una nueva identidad. El mismo compromiso con la calidad.*

### 7. Calidad que se nota en cada grano
Seleccionamos y desarrollamos nuestras arenas pensando en algo muy simple: que funcionen bien en tu día a día. Absorción, aglomeración y control de olores se unen para ofrecer una experiencia de limpieza más práctica y conveniente.

### 8. Para ellos. Para ti. Para su hogar.
Porque cuidar a tu gato también es cuidar el espacio que comparten. PeruCat está creada para acompañarte en esos pequeños momentos que forman parte de la convivencia con tu mascota.  
*Tu gato merece lo mejor. Tu hogar también.*

### 9. ¿Por qué elegir PeruCat?
- Porque buscamos que cada limpieza sea más sencilla.
- Porque sabemos que el control de olores importa.
- Porque una buena arena debe ofrecer rendimiento y practicidad.
- Y porque detrás de cada producto hay una familia que quiere lo mejor para su mascota.  
*PeruCat. Hecha para vivir juntos.*

### 10. Consejos para una mejor experiencia (Guía de Cuidado)
- **Mantén una buena cantidad de arena:** Asegúrate de mantener un nivel adecuado (5 a 7 cm) para favorecer la absorción y la formación de grumos.
- **Retira los residuos con frecuencia:** Una limpieza frecuente ayuda a mantener el arenero más agradable para tu gato.
- **Renueva la arena cuando sea necesario:** Mantener el arenero en buenas condiciones es parte importante del bienestar de tu mascota.
- **Coloca el arenero en un lugar adecuado:** Busca un espacio tranquilo, accesible y ventilado.

### 11. Lo que tu gato necesita, todos los días
- Un arenero limpio.
- Un espacio cómodo.
- Un hogar agradable.
- Y tú, una solución que haga todo más sencillo.  
**Eso es PeruCat.**

### 12. Descubre PeruCat
Encuentra la arena ideal para tu gato y disfruta de una limpieza más práctica todos los días.  
**PeruCat — Limpieza que se siente.**

---

## 🏛️ Arquitectura del Sistema

### Backend (`apps/api`)
- **Framework:** NestJS 10 con TypeScript.
- **ORM:** Prisma 6 con 37 modelos relacionales multi-tenant.
- **Base de Datos:** PostgreSQL 18.
- **Autenticación:** JWT con Roles RBAC (`PLATFORM_SUPER_ADMIN`, `TENANT_ADMIN`, `TENANT_MANAGER`, `CUSTOMER`).
- **Pagos:** Culqi API v2 con Webhooks e Idempotencia.
- **Logística:** Zonas dinámicas, tarifas de envío y tracking de pedidos.

### Frontend (`apps/web`)
- **Framework:** React 19 + TypeScript + Vite.
- **Estilos:** Tailwind CSS con la paleta de marca PeruCat (Morado `#6A2CFF`, Azul `#1976FF`, Turquesa `#00B8C9`, Navy `#0D1B3D`).
- **Componentes:** Storefront interactivo, Marquee infinito de ofertas, Selector de variantes, Carrito con Slide-over Drawer, Wishlist y Panel Administrativo.
