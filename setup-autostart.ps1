# Script para configurar inicialização automática do scheduler no Windows
# Requer privilégios de Administrador

Write-Host "=== Configuracao de Inicializacao Automatica ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se está rodando como admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERRO: Execute como Administrador!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Clique com botao direito no PowerShell e selecione 'Executar como Administrador'" -ForegroundColor Yellow
    exit 1
}

Write-Host "Criando tarefa agendada do Windows..." -ForegroundColor Yellow

# Definir ação
$action = New-ScheduledTaskAction -Execute "node" -Argument "cron/scheduler.js" -WorkingDirectory "d:\IMob\directus"

# Definir gatilho (iniciar na inicialização do sistema)
$trigger = New-ScheduledTaskTrigger -AtStartup

# Definir configurações
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartInterval (New-TimeSpan -Minutes 1) -RestartCount 3

# Definir principal (executar com usuário atual)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest

# Registrar tarefa
try {
    Register-ScheduledTask -TaskName "iMOBI-ImportScheduler" -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
    
    Write-Host ""
    Write-Host "SUCESSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tarefa criada:" -ForegroundColor White
    Write-Host "  Nome: iMOBI-ImportScheduler" -ForegroundColor Gray
    Write-Host "  Executa: node cron/scheduler.js" -ForegroundColor Gray
    Write-Host "  Quando: Na inicializacao do Windows" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Para gerenciar:" -ForegroundColor Yellow
    Write-Host "  1. Abra o 'Agendador de Tarefas' do Windows" -ForegroundColor Gray
    Write-Host "  2. Procure por 'iMOBI-ImportScheduler'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "A tarefa ja esta ativa e iniciara automaticamente no proximo boot." -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "ERRO ao criar tarefa: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
