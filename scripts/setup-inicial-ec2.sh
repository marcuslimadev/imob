#!/bin/bash
# Script de Setup Inicial - Execute UMA VEZ na EC2
# Uso: bash setup-inicial-ec2.sh

set -e

echo "============================================"
echo "🚀 Setup Inicial - Exclusiva Imóveis"
echo "============================================"
echo ""

# Atualizar sistema
echo "📦 Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar dependências base
echo "📦 Instalando dependências..."
sudo apt install -y \
  docker.io \
  docker-compose \
  nginx \
  certbot \
  python3-certbot-nginx \
  git \
  curl \
  jq \
  htop

# Configurar Docker
echo "🐳 Configurando Docker..."
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu

# Instalar Node.js 20
echo "📦 Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 e pnpm globalmente
echo "📦 Instalando PM2 e pnpm..."
sudo npm install -g pm2 pnpm

# Configurar firewall UFW
echo "🔥 Configurando firewall..."
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 8055/tcp # Directus (temporário)
sudo ufw --force enable

# Criar estrutura de diretórios
echo "📁 Criando estrutura de diretórios..."
mkdir -p ~/exclusiva-prod/logs
cd ~/exclusiva-prod

# Clonar repositório
echo "📦 Clonando repositório..."
if [ ! -d "imob" ]; then
    git clone https://github.com/marcuslimadev/imob.git
    cd imob
else
    cd imob
    git pull origin main
fi

# Configurar Git (para GitHub Actions funcionar)
echo "🔧 Configurando Git..."
git config --global user.name "Deploy Bot"
git config --global user.email "deploy@exclusivalarimoveis.com.br"

echo ""
echo "============================================"
echo "✅ Setup inicial concluído!"
echo "============================================"
echo ""
echo "⚠️  IMPORTANTE: Faça logout e login novamente para aplicar permissões do Docker"
echo ""
echo "Próximos passos:"
echo "1. Fazer logout: exit"
echo "2. Fazer login novamente: ssh -i 'chave.pem' ubuntu@IP_EC2"
echo "3. Configurar .env de produção (Directus e Next.js)"
echo "4. Executar: bash ~/exclusiva-prod/imob/scripts/deploy-production.sh"
echo ""
