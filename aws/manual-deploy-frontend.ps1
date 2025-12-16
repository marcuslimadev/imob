# Deploy manual do frontend Next.js para AWS ECS
# Uso: .\manual-deploy-frontend.ps1

$ErrorActionPreference = "Stop"

$AWS_REGION = "sa-east-1"
$AWS_ACCOUNT_ID = "575098225472"
$ECR_REPOSITORY = "production-imobi-frontend"
$ECS_CLUSTER = "production-imobi-cluster"
$ECS_SERVICE = "production-imobi-frontend"
$IMAGE_TAG = (Get-Date -Format "yyyyMMdd-HHmmss")

Write-Host "🚀 Deploy Manual - Frontend Next.js" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Região: $AWS_REGION"
Write-Host "Repository: $ECR_REPOSITORY"
Write-Host "Tag: $IMAGE_TAG"
Write-Host ""

# Step 1: Login no ECR
Write-Host "🔐 Step 1: Login no Amazon ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
Write-Host "✅ Login realizado" -ForegroundColor Green
Write-Host ""

# Step 2: Build da imagem Docker
Write-Host "🏗️ Step 2: Building Docker image..." -ForegroundColor Yellow
Set-Location ..\nextjs
docker build -f Dockerfile.prod -t ${ECR_REPOSITORY}:${IMAGE_TAG} -t ${ECR_REPOSITORY}:latest .
Write-Host "✅ Build concluído" -ForegroundColor Green
Write-Host ""

# Step 3: Tag das imagens
Write-Host "🏷️ Step 3: Tagging images..." -ForegroundColor Yellow
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}"
docker tag ${ECR_REPOSITORY}:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${ECR_REPOSITORY}:latest"
Write-Host "✅ Tags aplicadas" -ForegroundColor Green
Write-Host ""

# Step 4: Push para ECR
Write-Host "⬆️ Step 4: Pushing to ECR..." -ForegroundColor Yellow
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${ECR_REPOSITORY}:latest"
Write-Host "✅ Push concluído" -ForegroundColor Green
Write-Host ""

# Step 5: Force new deployment no ECS
Write-Host "🔄 Step 5: Updating ECS service..." -ForegroundColor Yellow
aws ecs update-service `
    --cluster $ECS_CLUSTER `
    --service $ECS_SERVICE `
    --force-new-deployment `
    --region $AWS_REGION | Out-File ..\aws\temp-ecs-update.json
Write-Host "✅ Deployment iniciado" -ForegroundColor Green
Write-Host ""

# Step 6: Aguardar estabilização
Write-Host "⏳ Step 6: Aguardando serviço estabilizar..." -ForegroundColor Yellow
Write-Host "Isso pode levar 5-10 minutos" -ForegroundColor Gray
aws ecs wait services-stable `
    --cluster $ECS_CLUSTER `
    --services $ECS_SERVICE `
    --region $AWS_REGION

Write-Host ""
Write-Host "✅ DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend atualizado:"
Write-Host "   https://lojadaesquina.store"
Write-Host "   https://www.lojadaesquina.store"
Write-Host ""
Write-Host "📊 Status do serviço:" -ForegroundColor Cyan
aws ecs describe-services `
    --cluster $ECS_CLUSTER `
    --services $ECS_SERVICE `
    --region $AWS_REGION `
    --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}' `
    --output table

Set-Location ..\aws
