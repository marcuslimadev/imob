# Script para build e deploy completo do iMOBI na AWS
param(
    [switch]$SkipInfrastructure,
    [switch]$SkipFrontendBuild,
    [switch]$SkipBackendBuild
)

$ErrorActionPreference = "Continue"

# região/conta (padrão sa-east-1)
if (-not $env:AWS_REGION) { $env:AWS_REGION = 'sa-east-1' }
$AWS_REGION = $env:AWS_REGION
if (-not $env:AWS_ACCOUNT_ID) {
    $env:AWS_ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
}
$AWS_ACCOUNT_ID = $env:AWS_ACCOUNT_ID

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 iMOBI - Deploy Completo na AWS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# 1. Verificar infraestrutura
if (-not $SkipInfrastructure) {
    Write-Host "1️⃣  Verificando infraestrutura (CloudFormation)..." -ForegroundColor Yellow
    
    $stackStatus = aws cloudformation describe-stacks --stack-name imobi-prod --region $AWS_REGION --query "Stacks[0].StackStatus" --output text 2>$null
    
    if ($stackStatus -eq "CREATE_IN_PROGRESS" -or $stackStatus -eq "UPDATE_IN_PROGRESS") {
        Write-Host "   Stack em criação. Aguardando..." -ForegroundColor Yellow
        Write-Host "   Isso pode levar 10-15 minutos (RDS PostgreSQL)`n" -ForegroundColor Gray
        
        aws cloudformation wait stack-create-complete --stack-name imobi-prod --region $AWS_REGION
        Write-Host "   ✅ Infraestrutura pronta!`n" -ForegroundColor Green
    }
    elseif ($stackStatus -eq "CREATE_COMPLETE" -or $stackStatus -eq "UPDATE_COMPLETE") {
        Write-Host "   ✅ Infraestrutura já existe`n" -ForegroundColor Green
    }
    else {
        Write-Host "   ⚠️  Status do stack: $stackStatus" -ForegroundColor Yellow
        Write-Host "   Execute: aws cloudformation describe-stack-events --stack-name imobi-prod`n" -ForegroundColor Gray
    }
}

# 2. Obter outputs da infraestrutura
Write-Host "2️⃣  Obtendo informações da infraestrutura..." -ForegroundColor Yellow

$outputs = aws cloudformation describe-stacks --stack-name imobi-prod --region $AWS_REGION --query "Stacks[0].Outputs" --output json | ConvertFrom-Json

$albDNS = ($outputs | Where-Object { $_.OutputKey -eq "ALBDNSName" }).OutputValue
$rdsEndpoint = ($outputs | Where-Object { $_.OutputKey -eq "RDSEndpoint" }).OutputValue
$ecsCluster = ($outputs | Where-Object { $_.OutputKey -eq "ECSClusterName" }).OutputValue
$frontendTG = ($outputs | Where-Object { $_.OutputKey -eq "FrontendTargetGroupArn" }).OutputValue
$directusTG = ($outputs | Where-Object { $_.OutputKey -eq "DirectusTargetGroupArn" }).OutputValue
$ecsSG = ($outputs | Where-Object { $_.OutputKey -eq "ECSSecurityGroupId" }).OutputValue
$subnet1 = ($outputs | Where-Object { $_.OutputKey -eq "PublicSubnet1Id" }).OutputValue
$subnet2 = ($outputs | Where-Object { $_.OutputKey -eq "PublicSubnet2Id" }).OutputValue
$s3Bucket = ($outputs | Where-Object { $_.OutputKey -eq "UploadsBucketName" }).OutputValue

Write-Host "   ALB DNS: $albDNS" -ForegroundColor Cyan
Write-Host "   RDS: $rdsEndpoint" -ForegroundColor Cyan
Write-Host "   S3: $s3Bucket`n" -ForegroundColor Cyan

# 3. Build e push Directus
if (-not $SkipBackendBuild) {
    Write-Host "3️⃣  Build e push - Directus..." -ForegroundColor Yellow
    
    cd ..\directus
    
    Write-Host "   Login no ECR..." -ForegroundColor Gray
    if (-not $env:AWS_REGION) { $env:AWS_REGION = 'sa-east-1' }
    if (-not $env:AWS_ACCOUNT_ID) { $env:AWS_ACCOUNT_ID = aws sts get-caller-identity --query Account --output text }
    $AWS_REGION = $env:AWS_REGION
    $AWS_ACCOUNT_ID = $env:AWS_ACCOUNT_ID
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $($AWS_ACCOUNT_ID).dkr.ecr.$AWS_REGION.amazonaws.com
    
    Write-Host "   Building Directus image..." -ForegroundColor Gray
    docker build -t imobi-directus .
    
    Write-Host "   Pushing to ECR..." -ForegroundColor Gray
    docker tag imobi-directus:latest $($AWS_ACCOUNT_ID).dkr.ecr.$AWS_REGION.amazonaws.com/imobi-directus:latest
    docker push $($AWS_ACCOUNT_ID).dkr.ecr.$AWS_REGION.amazonaws.com/imobi-directus:latest
    
    Write-Host "   ✅ Directus image publicada`n" -ForegroundColor Green
}

# 4. Build e push Frontend
if (-not $SkipFrontendBuild) {
    Write-Host "4️⃣  Build e push - Next.js Frontend..." -ForegroundColor Yellow
    
    cd ..\nextjs
    
    Write-Host "   Building Frontend image (pode demorar)..." -ForegroundColor Gray
    docker build -t imobi-frontend .
    
    Write-Host "   Pushing to ECR..." -ForegroundColor Gray
    docker tag imobi-frontend:latest $($AWS_ACCOUNT_ID).dkr.ecr.$AWS_REGION.amazonaws.com/imobi-frontend:latest
    docker push $($AWS_ACCOUNT_ID).dkr.ecr.$AWS_REGION.amazonaws.com/imobi-frontend:latest
    
    Write-Host "   ✅ Frontend image publicada`n" -ForegroundColor Green
}

# 5. Atualizar task definitions com RDS
Write-Host "5️⃣  Atualizando task definitions..." -ForegroundColor Yellow

cd ..\aws

# Atualizar Directus task definition
$directusTask = Get-Content task-definition-directus-postgres.json | ConvertFrom-Json
$directusTask.containerDefinitions[0].environment += @{
    name = "DB_HOST"
    value = $rdsEndpoint
}
$directusTask.containerDefinitions[0].environment += @{
    name = "DB_PORT"
    value = "5432"
}
$directusTask.containerDefinitions[0].environment += @{
    name = "DB_DATABASE"
    value = "imobi"
}
$directusTask.containerDefinitions[0].environment += @{
    name = "DB_USER"
    value = "imobi_admin"
}
$directusTask.containerDefinitions[0].environment += @{
    name = "PUBLIC_URL"
    value = "http://$albDNS"
}
$directusTask.containerDefinitions[0].environment += @{
    name = "STORAGE_S3_BUCKET"
    value = $s3Bucket
}

# ensure secrets array exists
if (-not ($directusTask.containerDefinitions[0].PSObject.Properties.Name -contains 'secrets')) {
    $directusTask.containerDefinitions[0].secrets = @()
}

# attach secrets from Secrets Manager (must exist)
$directusTask.containerDefinitions[0].secrets += @{
    name = "DB_PASSWORD"
    valueFrom = "arn:aws:secretsmanager:$($AWS_REGION):$($AWS_ACCOUNT_ID):secret:imobi/directus-db-password"
}
$directusTask.containerDefinitions[0].secrets += @{
    name = "ADMIN_PASSWORD"
    valueFrom = "arn:aws:secretsmanager:$($AWS_REGION):$($AWS_ACCOUNT_ID):secret:imobi/directus-admin-password"
}
$directusTask.containerDefinitions[0].secrets += @{
    name = "KEY"
    valueFrom = "arn:aws:secretsmanager:$($AWS_REGION):$($AWS_ACCOUNT_ID):secret:imobi/directus-key"
}
$directusTask.containerDefinitions[0].secrets += @{
    name = "SECRET"
    valueFrom = "arn:aws:secretsmanager:$($AWS_REGION):$($AWS_ACCOUNT_ID):secret:imobi/directus-secret"
}

$directusTask | ConvertTo-Json -Depth 10 | Out-File -FilePath task-definition-directus-final.json -Encoding UTF8

aws ecs register-task-definition --cli-input-json file://task-definition-directus-final.json --region $AWS_REGION

Write-Host "   ✅ Task definitions registradas`n" -ForegroundColor Green

# 6. Deploy services
Write-Host "6️⃣  Criando ECS Services..." -ForegroundColor Yellow

# Directus Service
aws ecs create-service `
    --cluster $ecsCluster `
    --service-name directus-service `
    --task-definition imobi-directus-postgres `
    --desired-count 1 `
    --launch-type FARGATE `
    --network-configuration "awsvpcConfiguration={subnets=[$subnet1,$subnet2],securityGroups=[$ecsSG],assignPublicIp=ENABLED}" `
    --load-balancers "targetGroupArn=$directusTG,containerName=directus,containerPort=8055" `
    --region $AWS_REGION

Write-Host "   ✅ Services criados`n" -ForegroundColor Green

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ DEPLOY COMPLETO!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Green

Write-Host "🌐 URLs de Acesso:" -ForegroundColor White
Write-Host "   Frontend: http://$albDNS" -ForegroundColor Cyan
Write-Host "   Directus: http://$albDNS/admin" -ForegroundColor Cyan
Write-Host "`n📊 Banco de Dados:" -ForegroundColor White
Write-Host "   Host: $rdsEndpoint" -ForegroundColor Cyan
Write-Host "   Database: imobi" -ForegroundColor Cyan
Write-Host "   User: imobi_admin" -ForegroundColor Cyan
Write-Host "`n☁️  Infraestrutura:" -ForegroundColor White
Write-Host "   Cluster: $ecsCluster" -ForegroundColor Cyan
Write-Host "   Region: sa-east-1" -ForegroundColor Cyan
Write-Host "   S3 Bucket: $s3Bucket`n" -ForegroundColor Cyan
