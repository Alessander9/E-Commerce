#!/bin/bash
# ==========================================
# 🗄️ Supabase Setup Script — Cleo Platform
# ==========================================
# Usage: ./scripts/setup-supabase.sh
#
# This script helps configure the Supabase PostgreSQL connection
# and run initial migrations.

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[Supabase]${NC} $1"; }
warn() { echo -e "${YELLOW}[Warning]${NC} $1"; }
error() { echo -e "${RED}[Error]${NC} $1"; exit 1; }

# Check if .env exists
if [ ! -f .env ]; then
    warn ".env not found. Copying from .env.example..."
    cp .env.example .env
fi

# Prompt for Supabase credentials
echo ""
echo "=========================================="
echo "  🗄️  Supabase Database Setup"
echo "=========================================="
echo ""
echo "Enter your Supabase PostgreSQL connection details."
echo "You can find these in: Supabase Dashboard → Settings → Database"
echo ""

read -p "Project URL (e.g., https://abc.supabase.co): " SUPABASE_URL
read -p "Service Key (eyJ...): " SUPABASE_KEY
read -p "DB Host (e.g., db.abc.supabase.co): " DB_HOST
read -p "DB Port [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}
read -p "DB Name [postgres]: " DB_NAME
DB_NAME=${DB_NAME:-postgres}
read -p "DB User [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}
read -sp "DB Password: " DB_PASS
echo ""

# Build connection string
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require"

# Update .env
log "Updating .env with Supabase configuration..."

sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${DATABASE_URL}|" .env
sed -i "s|^SUPABASE_URL=.*|SUPABASE_URL=${SUPABASE_URL}|" .env
sed -i "s|^SUPABASE_SERVICE_KEY=.*|SUPABASE_SERVICE_KEY=${SUPABASE_KEY}|" .env

log "✅ .env updated with Supabase credentials"

# Generate secrets if not set
if grep -q "your-super-secret-jwt-key" .env; then
    log "Generating secure JWT secrets..."
    JWT_SECRET=$(openssl rand -hex 32)
    JWT_RESET_SECRET=$(openssl rand -hex 32)
    sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
    sed -i "s|^JWT_RESET_SECRET=.*|JWT_RESET_SECRET=${JWT_RESET_SECRET}|" .env
    log "✅ JWT secrets generated"
fi

# Test connection
log "Testing database connection..."

if npx prisma db execute --stdin <<< "SELECT 1;" 2>/dev/null; then
    log "✅ Database connection successful"
else
    error "❌ Cannot connect to database. Check your credentials."
fi

# Run migrations
log "Running database migrations..."
npx prisma migrate deploy || npx prisma db push

log "✅ Database schema applied"

# Seed data
read -p "Seed initial data? (y/n) [y]: " SEED
SEED=${SEED:-y}

if [ "$SEED" = "y" ]; then
    log "Seeding database..."
    npx prisma db seed
    log "✅ Database seeded"
fi

# Generate Prisma client
log "Generating Prisma client..."
npx prisma generate

log ""
log "=========================================="
log "  ✅ Supabase Setup Complete!"
log "=========================================="
log ""
log "Next steps:"
log "  1. Start the API: npm run start:dev"
log "  2. Verify at: http://localhost:3000/api/docs"
log "  3. Test tenant resolution: curl -H 'x-tenant-slug: cleo' http://localhost:3000/api/platform/tenants/public/resolve/cleo"
