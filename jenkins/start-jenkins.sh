#!/bin/bash
# Script de start rápido do Jenkins

set -e

echo "🚀 Iniciando Jenkins com Docker..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker primeiro."
    exit 1
fi

# Criar diretórios necessários
mkdir -p jenkins_home

# Buildar imagem customizada (se necessário)
if [ "$1" == "--build" ]; then
    echo "🔨 Building imagem customizada do Jenkins..."
    docker build -t jenkins-custom jenkins/
    IMAGE="jenkins-custom"
else
    IMAGE="jenkins/jenkins:lts"
fi

# Parar container existente
if docker ps -a | grep -q jenkins; then
    echo "🛑 Parando container Jenkins existente..."
    docker stop jenkins || true
    docker rm jenkins || true
fi

# Iniciar Jenkins
echo "▶️  Iniciando Jenkins..."
docker run -d \
    --name jenkins \
    --restart unless-stopped \
    -p 8080:8080 \
    -p 50000:50000 \
    -v jenkins_home:/var/jenkins_home \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v ~/.aws:/var/jenkins_home/.aws:ro \
    --user root \
    ${IMAGE}

echo ""
echo "✅ Jenkins iniciado com sucesso!"
echo ""
echo "📍 Acesse: http://localhost:8080"
echo ""
echo "🔑 Para obter a senha inicial, execute:"
echo "   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
echo ""
echo "📝 Logs:"
echo "   docker logs -f jenkins"
echo ""

# Aguardar Jenkins iniciar
echo "⏳ Aguardando Jenkins inicializar (pode levar 1-2 minutos)..."
sleep 10

# Tentar obter senha inicial
if docker exec jenkins test -f /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null; then
    echo ""
    echo "🔑 Senha inicial do administrador:"
    docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
    echo ""
fi

echo "✅ Jenkins está pronto!"
