#!/bin/bash
# Fix .env and restart Directus containers
# Execute on EC2: bash scripts/fix-env-and-restart.sh

set -e

echo "🔧 Fixing Directus environment configuration..."

cd ~/exclusiva-prod/imob/directus

# 1. Stop containers
echo "⏸️  Stopping containers..."
docker-compose -f docker-compose.production.yml down

# 2. Clean old database AND volumes
echo "🗑️  Removing old database and Docker volumes..."
sudo rm -rf data/database/*
docker volume prune -f

# 3. Get EC2 public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "127.0.0.1")
echo "📍 EC2 Public IP: $PUBLIC_IP"

# 4. Create .env with correct values
echo "📝 Creating .env file..."
cat > .env << EOF
# Database
DB_CLIENT=postgres
DB_HOST=database
DB_PORT=5432
DB_DATABASE=directus_prod
DB_USER=directus
DB_PASSWORD=DirectusProd2024!

# Redis
REDIS_HOST=cache
REDIS_PORT=6379
CACHE_ENABLED=true
CACHE_STORE=redis
CACHE_REDIS=redis://cache:6379

# Directus Core
KEY=super-secret-directus-key-12345678
SECRET=another-super-secret-directus-87654321
PUBLIC_URL=http://${PUBLIC_IP}:8055
CORS_ENABLED=true
CORS_ORIGIN=*

# Admin
ADMIN_EMAIL=admin@exclusivalarimoveis.com.br
ADMIN_PASSWORD=AdminExclusiva2024!

# Extensions
EXTENSIONS_PATH=./extensions

# Storage
STORAGE_LOCATIONS=local
STORAGE_LOCAL_ROOT=./uploads

# SMTP
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@exclusivalarimoveis.com.br

# Logs
LOG_LEVEL=info
EOF

# 5. Verify .env
echo ""
echo "✅ .env created with:"
echo "   DB_HOST: database"
echo "   REDIS_HOST: cache"
echo "   PUBLIC_URL: http://${PUBLIC_IP}:8055"
echo ""

# 6. Start containers
echo "🚀 Starting containers..."
docker-compose -f docker-compose.production.yml up -d

# 7. Wait for initialization
echo "⏳ Waiting 60 seconds for Directus to initialize..."
sleep 60

# 8. Check logs
echo ""
echo "📋 Recent logs:"
docker logs --tail 30 directus-cms-prod

echo ""
echo "🔍 Checking status..."
docker ps | grep directus

echo ""
echo "✅ Done! Check logs above for 'Server started at port 8055'"
echo ""
echo "Next steps:"
echo "1. Access http://${PUBLIC_IP}:8055/admin in your browser"
echo "2. Complete admin setup wizard"
echo "3. Run schema registration: node register-collections.js"
