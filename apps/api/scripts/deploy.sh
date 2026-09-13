#!/bin/bash
# ==========================================
# 🚀 Cleo Platform — Production Deployment
# ==========================================
# Usage: ./scripts/deploy.sh [command]
#
# Commands:
#   setup     — Initial server setup (Nginx, SSL, Docker)
#   deploy    — Deploy latest version
#   migrate   — Run database migrations
#   seed      — Seed initial data
#   logs      — View API logs
#   restart   — Restart all services
#   ssl       — Setup/renew SSL certificates

set -e

DOMAIN="${DOMAIN:-cleoplatform.com}"
EMAIL="${SSL_EMAIL:-admin@cleoplatform.com}"
COMPOSE_FILE="docker-compose.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[Cleo]${NC} $1"; }
warn() { echo -e "${YELLOW}[Warning]${NC} $1"; }
error() { echo -e "${RED}[Error]${NC} $1"; exit 1; }

# ── Setup ──
setup() {
    log "Setting up Cleo Platform on $DOMAIN..."

    # Update system
    sudo apt-get update && sudo apt-get upgrade -y

    # Install Docker
    if ! command -v docker &> /dev/null; then
        log "Installing Docker..."
        curl -fsSL https://get.docker.com | sudo sh
        sudo usermod -aG docker $USER
    fi

    # Install Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log "Installing Docker Compose..."
        sudo apt-get install docker-compose-plugin -y
    fi

    # Create .env from .env.example if not exists
    if [ ! -f .env ]; then
        warn ".env file not found. Copying from .env.example..."
        cp .env.example .env
        warn "Please edit .env with your production values!"
    fi

    # Setup SSL
    ssl_setup

    # Start services
    deploy

    log "✅ Setup complete! API available at https://$DOMAIN/api/docs"
}

# ── Deploy ──
deploy() {
    log "Deploying Cleo Platform..."

    # Pull latest images
    docker-compose -f $COMPOSE_FILE pull

    # Build and start
    docker-compose -f $COMPOSE_FILE up -d --build

    # Wait for API to be healthy
    log "Waiting for API to be healthy..."
    sleep 10

    # Run database migration
    migrate

    log "✅ Deployment complete!"
}

# ── Database Migration ──
migrate() {
    log "Running database migrations..."

    docker-compose -f $COMPOSE_FILE exec -T api npx prisma migrate deploy 2>/dev/null || \
    docker-compose -f $COMPOSE_FILE exec -T api npx prisma db push

    log "✅ Database migrations complete!"
}

# ── Seed ──
seed() {
    log "Seeding database..."

    docker-compose -f $COMPOSE_FILE exec -T api npx prisma db seed

    log "✅ Database seeded!"
}

# ── SSL Setup ──
ssl_setup() {
    log "Setting up SSL certificates..."

    # Install Certbot
    if ! command -v certbot &> /dev/null; then
        sudo apt-get install certbot -y
    fi

    # Initial certificate
    if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
        sudo certbot certonly --webroot \
            -w /var/www/certbot \
            -d $DOMAIN \
            -d www.$DOMAIN \
            --email $EMAIL \
            --agree-tos \
            --non-interactive
    fi

    # Setup auto-renewal
    echo "0 0,12 * * * root certbot renew --quiet --post-hook 'docker restart cleo-nginx'" | sudo tee /etc/cron.d/certbot-renew

    log "✅ SSL certificates configured!"
}

# ── Logs ──
logs() {
    docker-compose -f $COMPOSE_FILE logs -f api
}

# ── Restart ──
restart() {
    log "Restarting services..."
    docker-compose -f $COMPOSE_FILE restart
    log "✅ Services restarted!"
}

# ── Status ──
status() {
    docker-compose -f $COMPOSE_FILE ps
}

# ── Main ──
case "${1:-help}" in
    setup)   setup ;;
    deploy)  deploy ;;
    migrate) migrate ;;
    seed)    seed ;;
    ssl)     ssl_setup ;;
    logs)    logs ;;
    restart) restart ;;
    status)  status ;;
    *)
        echo "Usage: $0 {setup|deploy|migrate|seed|ssl|logs|restart|status}"
        echo ""
        echo "  setup    — Initial server setup"
        echo "  deploy   — Deploy latest version"
        echo "  migrate  — Run database migrations"
        echo "  seed     — Seed initial data"
        echo "  ssl      — Setup SSL certificates"
        echo "  logs     — View API logs"
        echo "  restart  — Restart all services"
        echo "  status   — Show service status"
        ;;
esac
