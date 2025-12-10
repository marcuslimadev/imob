# 🛑 Script de Parada - iMOBI Docker

Write-Host "🛑 Parando todos os serviços do iMOBI..." -ForegroundColor Yellow
Write-Host ""

docker compose down

Write-Host ""
Write-Host "✅ Todos os serviços foram parados!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Para limpar volumes e recomeçar do zero:" -ForegroundColor Cyan
Write-Host "   docker compose down -v" -ForegroundColor Yellow
Write-Host ""
