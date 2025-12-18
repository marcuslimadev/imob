# Script para criar usuário admin no Directus de produção
# Usa AWS ECS Execute Command

$ErrorActionPreference = "Stop"

Write-Host "🔐 Criando usuário admin no Directus de produção..." -ForegroundColor Cyan

# 1. Obter task ID do Directus
Write-Host "`n1️⃣  Buscando task do Directus..." -ForegroundColor Yellow
$taskArn = aws ecs list-tasks `
    --cluster production-imobi-cluster `
    --service-name production-imobi-directus `
    --region sa-east-1 `
    --query 'taskArns[0]' `
    --output text

if (-not $taskArn -or $taskArn -eq "None") {
    Write-Host "❌ Nenhuma task do Directus encontrada rodando!" -ForegroundColor Red
    exit 1
}

$taskId = $taskArn.Split('/')[-1]
Write-Host "✅ Task encontrada: $taskId" -ForegroundColor Green

# 2. Criar usuário via npx directus users create
Write-Host "`n2️⃣  Criando usuário admin..." -ForegroundColor Yellow

$command = "npx directus users create --email admin@imobi.com --password Admin123! --role administrator"

Write-Host "⚠️  IMPORTANTE: Este comando pode não funcionar se ECS Exec não estiver habilitado!" -ForegroundColor Yellow
Write-Host "Comando que será executado:" -ForegroundColor Gray
Write-Host $command -ForegroundColor Gray

try {
    aws ecs execute-command `
        --cluster production-imobi-cluster `
        --task $taskId `
        --container directus `
        --interactive `
        --command $command `
        --region sa-east-1
    
    Write-Host "`n✅ Usuário criado com sucesso!" -ForegroundColor Green
    Write-Host "`n📧 Credenciais:" -ForegroundColor Cyan
    Write-Host "   Email: admin@imobi.com" -ForegroundColor White
    Write-Host "   Senha: Admin123!" -ForegroundColor White
    
} catch {
    Write-Host "`n❌ Erro ao criar usuário via ECS Exec" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    Write-Host "`n💡 ALTERNATIVAS:" -ForegroundColor Yellow
    Write-Host "`n1️⃣  Criar via API REST (se houver usuário inicial):" -ForegroundColor Cyan
    Write-Host '   curl -X POST http://production-imobi-alb-1837293727.sa-east-1.elb.amazonaws.com/users \'
    Write-Host '     -H "Content-Type: application/json" \'
    Write-Host '     -d ''{"email":"admin@imobi.com","password":"Admin123!","role":"<role_id>","status":"active"}'''
    
    Write-Host "`n2️⃣  Conectar no RDS e inserir direto no banco:" -ForegroundColor Cyan
    Write-Host "   (Requer hash da senha gerado pelo bcrypt)"
    
    Write-Host "`n3️⃣  Usar AWS Systems Manager Session Manager:" -ForegroundColor Cyan
    Write-Host "   aws ecs execute-command --cluster production-imobi-cluster --task $taskId --container directus --interactive --command /bin/sh"
}
