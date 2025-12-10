# 🚀 Script de Inicialização - iMOBI Docker

Write-Host "🐳 Iniciando iMOBI via Docker..." -ForegroundColor Cyan
Write-Host ""

# Parar containers antigos se existirem
Write-Host "🛑 Parando containers antigos..." -ForegroundColor Yellow
docker compose -f directus/docker-compose.yaml down 2>$null

# Limpar volumes antigos (opcional - descomente se quiser reset completo)
# Write-Host "🗑️  Limpando volumes..." -ForegroundColor Yellow
# docker volume prune -f

# Iniciar todos os serviços
Write-Host "🚀 Iniciando serviços..." -ForegroundColor Green
docker compose up -d --build

# Aguardar serviços ficarem prontos
Write-Host ""
Write-Host "⏳ Aguardando serviços ficarem prontos..." -ForegroundColor Yellow
Write-Host ""

$maxAttempts = 60
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $attempt++
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8055/server/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Directus está pronto!" -ForegroundColor Green
            break
        }
    }
    catch {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}

Write-Host ""
Write-Host ""

# Verificar se setup rodou
Write-Host "📦 Verificando setup..." -ForegroundColor Yellow
$setupLogs = docker compose logs setup 2>$null

if ($setupLogs -match "Setup concluído") {
    Write-Host "✅ Collections e dados criados com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Setup ainda rodando ou falhou. Verificando logs..." -ForegroundColor Yellow
    docker compose logs setup --tail 20
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 iMOBI está rodando!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs de Acesso:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   🔧 Directus Admin:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8055/admin" -ForegroundColor Blue
Write-Host "      Login: marcus@admin.com" -ForegroundColor Gray
Write-Host "      Senha: Teste@123" -ForegroundColor Gray
Write-Host ""
Write-Host "   🌐 Next.js Frontend:" -NoNewline -ForegroundColor White
Write-Host " http://localhost:4000" -ForegroundColor Blue
Write-Host ""
Write-Host "   🏪 Vitrine Pública: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:4000/vitrine?company=exclusiva" -ForegroundColor Blue
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Comandos Úteis:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Ver logs:          " -NoNewline -ForegroundColor White
Write-Host "docker compose logs -f [service]" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Parar tudo:        " -NoNewline -ForegroundColor White
Write-Host "docker compose down" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Reiniciar:         " -NoNewline -ForegroundColor White
Write-Host "docker compose restart [service]" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Status:            " -NoNewline -ForegroundColor White
Write-Host "docker compose ps" -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Abrir navegador automaticamente
$openBrowser = Read-Host "Abrir Directus Admin no navegador? (S/N)"
if ($openBrowser -eq "S" -or $openBrowser -eq "s") {
    Start-Process "http://localhost:8055/admin"
}
