#!/bin/bash
# Deploy de Produção - Exclusiva Imóveis
# Executar na EC2 como usuário ubuntu

set -e  # Exit on error

echo "============================================"
echo "🚀 Deploy de Produção - Exclusiva Imóveis"
echo "============================================"
echo ""

# Variáveis
PROJECT_DIR="/home/ubuntu/exclusiva-prod/imob"
DIRECTUS_DIR="$PROJECT_DIR/directus"
NEXTJS_DIR="$PROJECT_DIR/nextjs"
LOGS_DIR="/home/ubuntu/exclusiva-prod/logs"

# Criar estrutura de diretórios
echo "📁 Criando estrutura de diretórios..."
mkdir -p /home/ubuntu/exclusiva-prod/{directus,nextjs,nginx,logs}

# Clonar repositório (se não existir)
if [ ! -d "$PROJECT_DIR" ]; then
    echo "📦 Clonando repositório..."
    cd /home/ubuntu/exclusiva-prod
    git clone https://github.com/marcuslimadev/imob.git
else
    echo "📦 Atualizando repositório..."
    cd "$PROJECT_DIR"
    git pull origin main
fi

# ============================================
# DIRECTUS
# ============================================
echo ""
echo "🔧 Configurando Directus..."
cd "$DIRECTUS_DIR"

# Verificar .env.production
if [ ! -f ".env.production" ]; then
    echo "⚠️  ATENÇÃO: .env.production não encontrado!"
    echo "   1. Copie o template: cp .env.production.template .env.production"
    echo "   2. Edite com valores reais: nano .env.production"
    echo "   3. Execute este script novamente"
    exit 1
fi

# Copiar .env
cp .env.production .env

# Instalar dependências (para scripts de setup)
echo "📦 Instalando dependências do Directus..."
npm install --production

# Subir containers Docker
echo "🐳 Iniciando containers Docker..."
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d

# Aguardar Directus ficar pronto
echo "⏳ Aguardando Directus inicializar (60s)..."
sleep 60

# Aplicar schema
echo "🔨 Aplicando schema do Directus..."
node register-collections.js
node register-fields.js
node setup-role-permissions.js

# Registrar empresa Exclusiva
echo "🏢 Registrando empresa Exclusiva..."
node - <<'EOF'
const axios = require('axios');
require('dotenv').config({ path: '.env.production' });

const DIRECTUS_URL = process.env.PUBLIC_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function main() {
  try {
    // Login
    const login = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const token = login.data.data.access_token;
    const headers = { Authorization: `Bearer ${token}` };
    
    // Verificar se empresa já existe
    const existing = await axios.get(`${DIRECTUS_URL}/items/companies`, {
      params: { filter: { slug: { _eq: 'exclusiva' } } },
      headers
    });
    
    if (existing.data.data.length > 0) {
      console.log('✅ Empresa Exclusiva já existe (ID:', existing.data.data[0].id, ')');
      return;
    }
    
    // Criar empresa
    const company = await axios.post(`${DIRECTUS_URL}/items/companies`, {
      name: 'Exclusiva Lar Imóveis',
      slug: 'exclusiva',
      custom_domain: 'exclusivalarimoveis.com.br',
      email: 'contato@exclusivalarimoveis.com.br',
      phone: '(11) 99999-9999',
      city: 'São Paulo',
      state: 'SP',
      twilio_account_sid: process.env.TWILIO_ACCOUNT_SID,
      twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
      twilio_whatsapp_number: process.env.TWILIO_WHATSAPP_NUMBER,
      openai_api_key: process.env.OPENAI_API_KEY,
      openai_model: 'gpt-4o-mini',
      subscription_plan: 'pro',
      subscription_status: 'active'
    }, { headers });
    
    console.log('✅ Empresa criada (ID:', company.data.data.id, ')');
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    process.exit(1);
  }
}

main();
EOF

echo "✅ Directus configurado com sucesso!"

# ============================================
# NEXT.JS
# ============================================
echo ""
echo "🔧 Configurando Next.js..."
cd "$NEXTJS_DIR"

# Verificar .env.production
if [ ! -f ".env.production" ]; then
    echo "⚠️  ATENÇÃO: .env.production não encontrado!"
    echo "   1. Copie o template: cp .env.production.template .env.production"
    echo "   2. Edite com valores reais: nano .env.production"
    echo "   3. Obtenha DIRECTUS_STATIC_TOKEN no painel admin"
    echo "   4. Execute este script novamente"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências do Next.js..."
pnpm install --frozen-lockfile --production=false

# Build
echo "🔨 Executando build do Next.js..."
pnpm build

# Iniciar/reiniciar com PM2
echo "🚀 Iniciando Next.js com PM2..."
if pm2 list | grep -q "exclusiva-nextjs"; then
    pm2 reload ecosystem.config.js --env production
else
    pm2 start ecosystem.config.js --env production
fi

# Salvar configuração PM2
pm2 save

# Garantir que PM2 inicie no boot
pm2 startup | tail -n 1 | bash

echo "✅ Next.js configurado com sucesso!"

# ============================================
# NGINX
# ============================================
echo ""
echo "🔧 Configurando Nginx..."

# Copiar configurações
sudo cp "$PROJECT_DIR/nginx/directus.conf" /etc/nginx/sites-available/directus.exclusivalarimoveis.com.br
sudo cp "$PROJECT_DIR/nginx/nextjs.conf" /etc/nginx/sites-available/exclusivalarimoveis.com.br

# Criar symlinks
sudo ln -sf /etc/nginx/sites-available/directus.exclusivalarimoveis.com.br /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/exclusivalarimoveis.com.br /etc/nginx/sites-enabled/

# Remover default (se existir)
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
echo "🧪 Testando configuração do Nginx..."
sudo nginx -t

# Recarregar Nginx
echo "🔄 Recarregando Nginx..."
sudo systemctl reload nginx

echo "✅ Nginx configurado com sucesso!"

# ============================================
# SSL CERTIFICATES
# ============================================
echo ""
echo "🔒 Configurando SSL com Let's Encrypt..."
echo ""
echo "⚠️  MANUAL: Execute os comandos abaixo manualmente:"
echo ""
echo "  # Directus"
echo "  sudo certbot --nginx -d directus.exclusivalarimoveis.com.br"
echo ""
echo "  # Next.js"
echo "  sudo certbot --nginx -d exclusivalarimoveis.com.br -d www.exclusivalarimoveis.com.br"
echo ""
echo "  # Testar renovação automática"
echo "  sudo certbot renew --dry-run"
echo ""

# ============================================
# STATUS FINAL
# ============================================
echo ""
echo "============================================"
echo "✅ DEPLOY CONCLUÍDO!"
echo "============================================"
echo ""
echo "📊 Status dos Serviços:"
echo ""

echo "🐳 Docker:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🚀 PM2:"
pm2 list

echo ""
echo "🌐 Nginx:"
sudo systemctl status nginx --no-pager | grep Active

echo ""
echo "============================================"
echo "🔗 URLs de Acesso:"
echo "============================================"
echo "Directus Admin: https://directus.exclusivalarimoveis.com.br/admin"
echo "Site Público:   https://exclusivalarimoveis.com.br"
echo "CRM:            https://exclusivalarimoveis.com.br/login"
echo ""
echo "============================================"
echo "📋 Próximos Passos:"
echo "============================================"
echo "1. Executar comandos certbot acima para SSL"
echo "2. Testar acesso às URLs"
echo "3. Configurar webhook do Twilio"
echo "4. Importar imóveis (se necessário)"
echo "5. Treinar usuários no CRM"
echo ""
echo "============================================"
