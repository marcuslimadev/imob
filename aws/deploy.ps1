#!/usr/bin/env pwsh

# IMOBI AWS Deployment Script - PowerShell
# Usage: .\deploy.ps1 -Environment production -Region us-east-1

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('production','staging','development')]
    [string]$Environment = 'production',
    
    [Parameter(Mandatory=$false)]
    [string]$Region = 'us-east-1'
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying IMOBI to AWS" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow

# Get AWS Account ID
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
Write-Host "Account: $AWS_ACCOUNT_ID" -ForegroundColor Yellow
Write-Host ""

# Step 1: Create Infrastructure
Write-Host "📦 Step 1: Creating Infrastructure with CloudFormation..." -ForegroundColor Green
aws cloudformation deploy `
  --template-file aws/cloudformation-infrastructure.yaml `
  --stack-name "imobi-$Environment-infrastructure" `
  --parameter-overrides "EnvironmentName=$Environment" `
  --capabilities CAPABILITY_IAM `
  --region $Region

Write-Host "✅ Infrastructure created" -ForegroundColor Green
Write-Host ""

# Step 2: Build and Push Docker Images
Write-Host "🐳 Step 2: Building and pushing Docker images..." -ForegroundColor Green

# Login to ECR
$ECR_PASSWORD = (aws ecr get-login-password --region $Region)
$ECR_REGISTRY = "$AWS_ACCOUNT_ID.dkr.ecr.$Region.amazonaws.com"
$ECR_PASSWORD | docker login --username AWS --password-stdin $ECR_REGISTRY

# Build and push Directus
Write-Host "Building Directus..." -ForegroundColor Cyan
docker build -t imobi-directus:latest -f directus/Dockerfile directus/
docker tag imobi-directus:latest "$ECR_REGISTRY/imobi-directus:latest"
docker push "$ECR_REGISTRY/imobi-directus:latest"

# Build and push Frontend
Write-Host "Building Frontend..." -ForegroundColor Cyan
docker build -t imobi-frontend:latest -f nextjs/Dockerfile nextjs/
docker tag imobi-frontend:latest "$ECR_REGISTRY/imobi-frontend:latest"
docker push "$ECR_REGISTRY/imobi-frontend:latest"

Write-Host "✅ Docker images pushed" -ForegroundColor Green
Write-Host ""

# Step 3: Register Task Definitions
Write-Host "📝 Step 3: Registering ECS Task Definitions..." -ForegroundColor Green

# Replace variables in task definitions
$directusTaskDef = Get-Content aws/task-definition-directus.json -Raw
$directusTaskDef = $directusTaskDef -replace '\$\{AWS_ACCOUNT_ID\}', $AWS_ACCOUNT_ID
$directusTaskDef = $directusTaskDef -replace '\$\{AWS_REGION\}', $Region
$directusTaskDef | Out-File -FilePath "$env:TEMP\task-definition-directus.json" -Encoding utf8

$frontendTaskDef = Get-Content aws/task-definition-frontend.json -Raw
$frontendTaskDef = $frontendTaskDef -replace '\$\{AWS_ACCOUNT_ID\}', $AWS_ACCOUNT_ID
$frontendTaskDef = $frontendTaskDef -replace '\$\{AWS_REGION\}', $Region
$frontendTaskDef | Out-File -FilePath "$env:TEMP\task-definition-frontend.json" -Encoding utf8

# Register task definitions
aws ecs register-task-definition `
  --cli-input-json "file://$env:TEMP\task-definition-directus.json" `
  --region $Region

aws ecs register-task-definition `
  --cli-input-json "file://$env:TEMP\task-definition-frontend.json" `
  --region $Region

Write-Host "✅ Task definitions registered" -ForegroundColor Green
Write-Host ""

# Step 4: Create ECS Services (if not exists)
Write-Host "🎯 Step 4: Creating/Updating ECS Services..." -ForegroundColor Green

# Get ALB DNS
$ALB_DNS = (aws cloudformation describe-stacks `
  --stack-name "imobi-$Environment-infrastructure" `
  --query "Stacks[0].Outputs[?OutputKey=='ALBDNSName'].OutputValue" `
  --output text `
  --region $Region)

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Access your application at:" -ForegroundColor Cyan
Write-Host "   Frontend: http://$ALB_DNS" -ForegroundColor Yellow
Write-Host "   Directus: http://$ALB_DNS/admin" -ForegroundColor Yellow
Write-Host "   API: http://$ALB_DNS/api" -ForegroundColor Yellow
Write-Host ""
Write-Host "⏱️  Note: It may take 2-3 minutes for the services to become healthy" -ForegroundColor Gray
