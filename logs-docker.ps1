# 📊 Logs em Tempo Real - iMOBI Docker

param(
    [string]$Service = ""
)

Write-Host "📊 Visualizando logs do iMOBI..." -ForegroundColor Cyan
Write-Host ""

if ($Service) {
    Write-Host "🔍 Filtrando apenas: $Service" -ForegroundColor Yellow
    docker compose logs -f $Service
} else {
    Write-Host "🔍 Mostrando todos os serviços" -ForegroundColor Yellow
    Write-Host "   Para filtrar, use: .\logs-docker.ps1 -Service [nome]" -ForegroundColor Gray
    Write-Host "   Serviços: database, cache, directus, setup, nextjs" -ForegroundColor Gray
    Write-Host ""
    docker compose logs -f
}
