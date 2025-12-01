#!/bin/bash
# Script Rápido de Deploy - Exclusiva Imóveis
# Execute este script APÓS o setup inicial

set -e

echo "============================================"
echo "🚀 Deploy Rápido - Exclusiva"
echo "============================================"
echo ""

# Variáveis (AJUSTAR SE NECESSÁRIO)
PROJECT_DIR="$HOME/exclusiva-prod/imob"
DIRECTUS_DIR="$PROJECT_DIR/directus"
NEXTJS_DIR="$PROJECT_DIR/nextjs"

# Verificar se .env.production existe
if [ ! -f "$DIRECTUS_DIR/.env.production" ]; then
    echo "❌ ERRO: $DIRECTUS_DIR/.env.production não encontrado!"
    echo ""
    echo "Crie o arquivo com:"
    echo "  cd $DIRECTUS_DIR"
    echo "  cp .env.production.template .env.production"
    echo "  nano .env.production"
    echo ""
    echo "Depois execute este script novamente."
    exit 1
fi

if [ ! -f "$NEXTJS_DIR/.env.production" ]; then
    echo "❌ ERRO: $NEXTJS_DIR/.env.production não encontrado!"
    echo ""
    echo "Crie o arquivo com:"
    echo "  cd $NEXTJS_DIR"
    echo "  cp .env.production.template .env.production"
    echo "  nano .env.production"
    echo ""
    echo "Depois execute este script novamente."
    exit 1
fi

# Atualizar código
echo "📦 Atualizando código..."
cd "$PROJECT_DIR"
git pull origin main

# Deploy Directus
echo ""
echo "🐳 Deploying Directus..."
cd "$DIRECTUS_DIR"
cp .env.production .env

# Instalar dependências (scripts de setup)
npm install --production

# Subir Docker Compose
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d

# Aguardar Directus
echo "⏳ Aguardando Directus inicializar (60s)..."
sleep 60

# Aplicar schema
echo "🔨 Aplicando schema..."
node register-collections.js || true
node register-fields.js || true
node setup-role-permissions.js || true

# Deploy Next.js
echo ""
echo "⚛️  Deploying Next.js..."
cd "$NEXTJS_DIR"

# Instalar e buildar
pnpm install --frozen-lockfile
pnpm build

# PM2
if pm2 list | grep -q "exclusiva-nextjs"; then
    echo "🔄 Recarregando PM2..."
    pm2 reload ecosystem.config.js --env production
else
    echo "🚀 Iniciando PM2..."
    pm2 start ecosystem.config.js --env production
    pm2 save
    pm2 startup | tail -n 1 | sudo bash
fi

echo ""
echo "============================================"
echo "✅ Deploy concluído!"
echo "============================================"
echo ""
echo "📊 Status:"
docker ps --format "table {{.Names}}\t{{.Status}}"
echo ""
pm2 list
echo ""
echo "🔗 Próximo passo: Configurar Nginx e SSL"
echo "   Ver: DEPLOY_PRODUCAO_AWS.md seção 3"
echo ""
