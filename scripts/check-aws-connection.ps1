# Script de Diagnostico AWS EC2
$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=== DIAGNOSTICO DE CONEXAO AWS ===" -ForegroundColor Cyan
Write-Host ""

$EC2_HOST = "18.206.14.123"
$SSH_KEY = "d:\IMob\exclusiva-prod-key.pem"

Write-Host "Host: $EC2_HOST" -ForegroundColor Yellow
Write-Host ""

# Teste 1: Ping
Write-Host "[1/3] Teste de Ping..." -ForegroundColor Cyan
try {
    $pingResult = Test-Connection -ComputerName $EC2_HOST -Count 2 -ErrorAction Stop
    Write-Host "   OK - Servidor responde ao ping" -ForegroundColor Green
    Write-Host "   Latencia: $($pingResult[0].ResponseTime)ms" -ForegroundColor Gray
} catch {
    Write-Host "   Falhou - Servidor NAO responde ao ping" -ForegroundColor Red
    Write-Host "   (Isso e normal - AWS pode bloquear ICMP)" -ForegroundColor Gray
}
Write-Host ""

# Teste 2: Porta 22
Write-Host "[2/3] Teste de Porta 22 (SSH)..." -ForegroundColor Cyan
$tcpTest = Test-NetConnection -ComputerName $EC2_HOST -Port 22 -WarningAction SilentlyContinue
if ($tcpTest.TcpTestSucceeded) {
    Write-Host "   OK - Porta 22 esta ABERTA" -ForegroundColor Green
    Write-Host "   Endereco: $($tcpTest.RemoteAddress)" -ForegroundColor Gray
} else {
    Write-Host "   FALHOU - Porta 22 esta FECHADA" -ForegroundColor Red
    Write-Host "   Possiveis causas:" -ForegroundColor Yellow
    Write-Host "   - Security Group nao permite SSH do seu IP"
    Write-Host "   - Instancia esta desligada"
    Write-Host "   - IP esta incorreto"
}
Write-Host ""

# Teste 3: Chave SSH
Write-Host "[3/3] Verificando chave SSH..." -ForegroundColor Cyan
if (Test-Path $SSH_KEY) {
    Write-Host "   OK - Chave SSH encontrada" -ForegroundColor Green
    $keySize = (Get-Item $SSH_KEY).Length
    Write-Host "   Tamanho: $keySize bytes" -ForegroundColor Gray
} else {
    Write-Host "   FALHOU - Chave SSH NAO encontrada" -ForegroundColor Red
}
Write-Host ""

# Resumo
Write-Host "==================================" -ForegroundColor Gray
Write-Host ""

if ($tcpTest.TcpTestSucceeded) {
    Write-Host "RESULTADO: Servidor esta ACESSIVEL" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximo passo: Execute o deploy manual" -ForegroundColor Yellow
    Write-Host "   .\scripts\deploy-manual-aws.ps1" -ForegroundColor White
} else {
    Write-Host "RESULTADO: Servidor NAO esta acessivel" -ForegroundColor Red
    Write-Host ""
    Write-Host "ACOES NECESSARIAS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Verificar se a instancia EC2 esta LIGADA" -ForegroundColor White
    Write-Host "   https://console.aws.amazon.com/ec2/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Verificar Security Group permite SSH" -ForegroundColor White
    Write-Host "   - Regra de entrada (Inbound): SSH porta 22"
    Write-Host "   - Origem: Seu IP ou 0.0.0.0/0" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Confirmar o IP correto da EC2" -ForegroundColor White
    Write-Host "   - IP atual: $EC2_HOST" -ForegroundColor Gray
}
Write-Host ""
