# Script de Deploy Manual para AWS EC2
# Execute: .\scripts\deploy-manual-aws.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 DEPLOY MANUAL PARA AWS EC2`n" -ForegroundColor Cyan

# Configurações
$EC2_HOST = "18.206.14.123"  # Ajuste se necessário
$EC2_USER = "ubuntu"
$SSH_KEY = "d:\IMob\aws\exclusiva-prod-key.pem"
$PROJECT_PATH = "~/exclusiva-prod/imob"

Write-Host "📋 Configurações:" -ForegroundColor Yellow
Write-Host "   Host: $EC2_HOST"
Write-Host "   User: $EC2_USER"
Write-Host "   Project: $PROJECT_PATH"
Write-Host ""

# Verificar chave SSH
if (-not (Test-Path $SSH_KEY)) {
    Write-Host "❌ Chave SSH não encontrada: $SSH_KEY" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Chave SSH encontrada" -ForegroundColor Green
Write-Host ""

# Testar conexão SSH
Write-Host "🔌 Testando conexão SSH..." -ForegroundColor Cyan
try {
    ssh -i $SSH_KEY -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo 'Conexão OK'"
    Write-Host "✅ Conexão SSH estabelecida" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Falha na conexão SSH. Verifique:" -ForegroundColor Red
    Write-Host "   - IP correto: $EC2_HOST"
    Write-Host "   - Security Group permite SSH (porta 22)"
    Write-Host "   - Chave SSH está correta"
    exit 1
}

# Executar deploy
Write-Host "🚀 Iniciando deploy..." -ForegroundColor Cyan
Write-Host ""

$deployScript = @"
set -e

echo "📂 Navegando para diretório do projeto..."
cd $PROJECT_PATH

echo ""
echo "🔄 Atualizando código (git pull)..."
git pull origin master

echo ""
echo "🐳 Atualizando Directus (Docker)..."
cd directus
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d --build

echo ""
echo "⏳ Aguardando Directus inicializar (30s)..."
sleep 30

echo ""
echo "📦 Atualizando Next.js..."
cd ../nextjs
pnpm install --frozen-lockfile
pnpm build

echo ""
echo "🔄 Reiniciando PM2..."
pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production

echo ""
echo "✅ Deploy concluído com sucesso!"
echo ""

echo "📊 Status dos serviços:"
echo ""
echo "Docker:"
docker ps --format "table {{.Names}}\t{{.Status}}"
echo ""
echo "PM2:"
pm2 list
echo ""

echo "🌐 URLs:"
echo "   Directus: https://directus.exclusivalarimoveis.com.br/admin"
echo "   Site: https://exclusivalarimoveis.com.br"
"@

ssh -i $SSH_KEY -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" $deployScript

$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "✅ DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Acessar:" -ForegroundColor Cyan
    Write-Host "   Directus Admin: https://directus.exclusivalarimoveis.com.br/admin" -ForegroundColor White
    Write-Host "   Site: https://exclusivalarimoveis.com.br" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deploy falhou com código de saída: $exitCode" -ForegroundColor Red
    Write-Host ""
    exit $exitCode
}
