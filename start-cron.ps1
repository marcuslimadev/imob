# Script para iniciar o scheduler de importação automática
# Mantém rodando em background até ser interrompido

Write-Host "=== iMOBI - Scheduler de Importação ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Iniciando scheduler de importação automática..." -ForegroundColor Yellow
Write-Host "Agendamento: A cada 4 horas (00:00, 04:00, 08:00, 12:00, 16:00, 20:00)" -ForegroundColor Gray
Write-Host ""
Write-Host "Pressione Ctrl+C para encerrar" -ForegroundColor Yellow
Write-Host ""

cd d:\IMob\directus
node cron/scheduler.js
