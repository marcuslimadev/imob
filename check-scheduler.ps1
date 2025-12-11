# Script para verificar status do scheduler
Write-Host "`n=== STATUS DO SCHEDULER ===" -ForegroundColor Cyan
Write-Host ""

$schedulerProcess = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)" -ErrorAction SilentlyContinue).CommandLine
    $cmdLine -like '*scheduler.js*'
}

if ($schedulerProcess) {
    Write-Host "STATUS: ATIVO" -ForegroundColor Green
    Write-Host ""
    Write-Host "Detalhes:" -ForegroundColor Yellow
    Write-Host "  PID: $($schedulerProcess.Id)" -ForegroundColor White
    Write-Host "  Iniciado em: $($schedulerProcess.StartTime)" -ForegroundColor White
    Write-Host "  Tempo rodando: $(((Get-Date) - $schedulerProcess.StartTime).ToString('hh\:mm\:ss'))" -ForegroundColor White
    Write-Host ""
    Write-Host "Agendamento: A cada 4 horas (00:00, 04:00, 08:00, 12:00, 16:00, 20:00)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para parar:" -ForegroundColor Yellow
    Write-Host "  Stop-Process -Id $($schedulerProcess.Id) -Force" -ForegroundColor Gray
} else {
    Write-Host "STATUS: INATIVO" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para iniciar:" -ForegroundColor Yellow
    Write-Host "  .\start-cron.ps1" -ForegroundColor Gray
}
Write-Host ""
