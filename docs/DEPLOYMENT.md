# 🚀 Deployment Guide — Cleo Platform

> Runbook completo para despliegue y lanzamiento de **Cleo-Ecommerce** en producción.

---

## 1. Prerrequisitos

### Infraestructura Requerida

| Recurso | Especificación Mínima | Recomendada |
|---------|----------------------|-------------|
| **Servidor VPS** | 2 vCPU, 4GB RAM | 4 vCPU, 8GB RAM |
| **Almacenamiento** | 40GB SSD | 80GB SSD |
| **SO** | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| **Dominio** | 1 dominio | 1 dominio + subdominios |

### Cuentas Necesarias

- [ ] **Supabase** — PostgreSQL gestionado + Storage
- [ ] **Culqi** — Cuenta de producción con API keys
- [ ] **Gmail/SendGrid** — SMTP para correos transaccionales
- [ ] **GitHub** — Repositorio del código fuente
- [ ] **Dominio** — Registrado y con DNS apuntando al VPS

---

## 2. Checklist de Lanzamiento

### 2.1 Infraestructura
- [ ] VPS provisionado (Ubuntu 22.04+)
- [ ] Docker y Docker Compose instalados
- [ ] Dominio apuntando al VPS (A record → IP del VPS)
- [ ] Firewall configurado (puertos 80, 443, 22)
- [ ] SSH access configurado con llaves
- [ ] Swap configurado (mínimo 2GB)

### 2.2 Base de Datos
- [ ] Supabase proyecto creado
- [ ] PostgreSQL connection string obtenido
- [ ] Tablas creadas via `prisma migrate deploy`
- [ ] Datos iniciales sembrados (roles, tenants, seed)
- [ ] Backups automáticos configurados

### 2.3 API Backend
- [ ] `.env` configurado con variables de producción
- [ ] JWT secrets generados (mínimo 32 caracteres)
- [ ] Culqi API keys de producción configuradas
- [ ] SMTP configurado y testeado
- [ ] Supabase Storage configurado para imágenes
- [ ] SSL habilitado (Certbot)
- [ ] Nginx configurado con rate limiting
- [ ] Health check endpoint funcionando

### 2.4 Frontend
- [ ] Build de producción generado (`npm run build`)
- [ ] Variables de entorno del frontend configuradas
- [ ] Imágenes optimizadas
- [ ] PWA configurada (opcional)

### 2.5 Seguridad
- [ ] Headers HTTP (Helmet) verificados
- [ ] CORS restringido a dominios de producción
- [ ] Rate limiting activo
- [ ] SQL injection testing
- [ ] XSS testing
- [ ] HTTPS forzado en todas las rutas

### 2.6 Monitoreo
- [ ] Logs configurados
- [ ] Health check endpoint monitoreado
- [ ] Alertas de error configuradas
- [ ] Métricas de rendimiento monitoreadas

---

## 3. Paso a Paso: Despliegue

### 3.1 Preparar el Servidor

```bash
# Conectar al servidor
ssh root@tu-dominio.com

# Actualizar sistema
apt-get update && apt-get upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Instalar Docker Compose
apt-get install docker-compose-plugin -y

# Configurar firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 3.2 Clonar y Configurar

```bash
# Clonar repositorio
git clone https://github.com/tu-org/cleo-platform.git
cd cleo-platform/apps/api

# Crear .env desde plantilla
cp .env.example .env
nano .env  # Editar con valores de producción
```

### 3.3 Variables de Entorno Críticas

```bash
# Generar secrets seguros
JWT_SECRET=$(openssl rand -hex 32)
JWT_RESET_SECRET=$(openssl rand -hex 32)

# Actualizar .env
DATABASE_URL=postgresql://cleo:password@db.supabase.co:5432/postgres
JWT_SECRET=$JWT_SECRET
JWT_RESET_SECRET=$JWT_RESET_SECRET
CULQI_SECRET_KEY=sk_live_xxxxx
CULQI_WEBHOOK_SECRET=whsec_xxxxx
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=eyJxxxx
FRONTEND_URL=https://cleoplatform.com
```

### 3.4 Desplegar con Docker

```bash
# Construir y levantar servicios
docker-compose up -d --build

# Verificar estado
docker-compose ps

# Ejecutar migraciones
docker-compose exec api npx prisma migrate deploy

# Sembrar datos iniciales
docker-compose exec api npx prisma db seed

# Verificar logs
docker-compose logs -f api
```

### 3.5 Configurar SSL

```bash
# Instalar Certbot
apt-get install certbot -y

# Obtener certificado
certbot certonly --webroot \
  -w /var/www/certbot \
  -d cleoplatform.com \
  -d www.cleoplatform.com \
  -d api.cleoplatform.com \
  --email admin@cleoplatform.com \
  --agree-tos \
  --non-interactive

# Configurar renovación automática
echo "0 0,12 * * * root certbot renew --quiet --post-hook 'docker restart cleo-nginx'" \
  > /etc/cron.d/certbot-renew
```

### 3.6 Verificar

```bash
# Health check
curl -s https://cleoplatform.com/api/docs | head -5

# Test API
curl -s https://cleoplatform.com/api/platform/tenants/public/resolve/cleo

# Verificar SSL
curl -I https://cleoplatform.com
```

---

## 4. Despliegue del Frontend (React + Vite)

### Opción A: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
cd apps/web
vercel --prod
```

Configurar variables de entorno en Vercel:
```
VITE_API_URL=https://cleoplatform.com
```

### Opción B: Nginx (Mismo VPS)

```bash
# Build de producción
cd apps/web
npm run build

# Copiar a Nginx
cp -r dist/* /var/www/cleo-platform/

# Configurar Nginx para servir el SPA
# (agregartry_files $uri $uri/ /index.html; en la ubicación /)
```

---

## 5. Configuración de DNS

### Registros DNS Necesarios

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | `@` | `IP_DEL_VPS` | 3600 |
| A | `www` | `IP_DEL_VPS` | 3600 |
| A | `api` | `IP_DEL_VPS` | 3600 |
| CNAME | `tienda` | `cleoplatform.com` | 3600 |

### Dominios Personalizados (CNAME)

Para que clientes configuren sus dominios:

1. El cliente crea un CNAME: `tienda.pe` → `cleoplatform.com`
2. El Platform Super Admin asigna el dominio en el tenant
3. El TenantGuard resuelve el tenant por dominio automáticamente

---

## 6. Post-Lanzamiento

### Monitoreo
- [ ] Verificar health check cada 5 minutos
- [ ] Monitorear uso de CPU/RAM del VPS
- [ ] Revisar logs diariamente durante la primera semana
- [ ] Verificar que los emails se envían correctamente
- [ ] Probar flujo completo de compra en producción

### Backups
- [ ] PostgreSQL: backups diarios automáticos (Supabase)
- [ ] Redis: persistencia AOF habilitada
- [ ] Código fuente: GitHub (ya versionado)
- [ ] Imágenes: Supabase Storage con versionado

### Escalamiento Futuro
- [ ] Configurar CDN para imágenes (Cloudflare)
- [ ] Horizontal scaling con load balancer
- [ ] Redis Cluster para alta disponibilidad
- [ ] Read replicas de PostgreSQL

---

## 7. Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f api

# Reiniciar servicios
docker-compose restart

# Actualizar código
git pull
docker-compose up -d --build

# Ejecutar migración
docker-compose exec api npx prisma migrate deploy

# Verificar estado de contenedores
docker-compose ps

# Entrar al contenedor API
docker-compose exec api sh

# Backup de base de datos
docker-compose exec postgres pg_dump -U cleo cleo_platform > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U cleo cleo_platform < backup.sql
```

---

## 8. Troubleshooting

| Problema | Solución |
|----------|----------|
| API no responde | `docker-compose logs api` — revisar errores |
| SSL no funciona | Verificar que Certbot generó certificados en `/etc/letsencrypt/` |
| Emails no se envían | Verificar SMTP credentials en `.env` |
| Errores 502 | API no está corriendo — `docker-compose restart api` |
| Rate limit excedido | Ajustar `limit_req_zone` en nginx.conf |
| Imágenes no suben | Verificar `SUPABASE_SERVICE_KEY` y bucket permissions |
