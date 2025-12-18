# Pipeline de Deploy Automatizado - Alternativa PowerShell ao Jenkins
# Executa as mesmas etapas do Jenkinsfile

param(
    [string]$GitBranch = "main",
    [switch]$SkipHealthCheck = $false
)

$ErrorActionPreference = "Stop"

# Configuração
$AWS_REGION = "sa-east-1"
$ECR_REGISTRY = "575098225472.dkr.ecr.sa-east-1.amazonaws.com"
$ECR_REPOSITORY = "imobi-frontend"
$ECS_CLUSTER = "production-imobi-cluster"
$ECS_SERVICE = "production-imobi-frontend"
$IMAGE_TAG = "$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$LOG_FILE = "d:\Saas\imob\temp-pipeline-$IMAGE_TAG.txt"

function Write-Stage {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n========================================" -ForegroundColor $Color
    Write-Host " $Message" -ForegroundColor $Color
    Write-Host "========================================`n" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Message {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Yellow
}

try {
    Write-Host "`n🚀 PIPELINE DE DEPLOY AUTOMATIZADO" -ForegroundColor Magenta
    Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host "Image Tag: $IMAGE_TAG" -ForegroundColor Gray
    Write-Host "Log: $LOG_FILE`n" -ForegroundColor Gray

    # STAGE 1: Checkout
    Write-Stage "STAGE 1: Checkout" "Cyan"
    Write-Info "Branch: $GitBranch"
    $gitCommit = git rev-parse HEAD
    Write-Info "Commit: $($gitCommit.Substring(0,7))"
    Write-Success "Checkout completo"

    # STAGE 2: Build Docker Image
    Write-Stage "STAGE 2: Build Docker Image" "Cyan"
    Write-Info "Iniciando build..."
    Set-Location d:\Saas\imob\nextjs
    
    $buildStart = Get-Date
    docker build `
        -f Dockerfile.prod `
        -t ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG} `
        -t ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest `
        . 2>&1 | Tee-Object -FilePath $LOG_FILE
    
    if ($LASTEXITCODE -ne 0) {
        throw "Build Docker falhou"
    }
    
    $buildTime = ((Get-Date) - $buildStart).TotalSeconds
    Write-Success "Build concluído em $([math]::Round($buildTime, 0))s"

    # STAGE 3: Push to ECR
    Write-Stage "STAGE 3: Push to ECR" "Cyan"
    Write-Info "Autenticando no ECR..."
    
    aws ecr get-login-password --region $AWS_REGION | `
        docker login --username AWS --password-stdin $ECR_REGISTRY 2>&1 | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        throw "Autenticação ECR falhou"
    }
    
    Write-Info "Enviando imagem tagged: $IMAGE_TAG"
    docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG} 2>&1 | Tee-Object -Append $LOG_FILE | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        throw "Push da imagem tagged falhou"
    }
    
    Write-Info "Enviando imagem latest..."
    docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest 2>&1 | Tee-Object -Append $LOG_FILE | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        throw "Push da imagem latest falhou"
    }
    
    Write-Success "Push para ECR concluído"

    # STAGE 4: Deploy to ECS
    Write-Stage "STAGE 4: Deploy to ECS" "Cyan"
    Write-Info "Salvando task definition atual para rollback..."
    
    $previousTaskDef = aws ecs describe-services `
        --cluster $ECS_CLUSTER `
        --services $ECS_SERVICE `
        --region $AWS_REGION `
        --query 'services[0].taskDefinition' `
        --output text
    
    $previousTaskDef | Out-File "d:\Saas\imob\temp-previous-task-$IMAGE_TAG.txt"
    Write-Info "Task anterior: $previousTaskDef"
    
    Write-Info "Iniciando deployment..."
    aws ecs update-service `
        --cluster $ECS_CLUSTER `
        --service $ECS_SERVICE `
        --force-new-deployment `
        --region $AWS_REGION 2>&1 | Tee-Object -Append $LOG_FILE | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        throw "Update service falhou"
    }
    
    Write-Info "Aguardando deployment estabilizar (até 10 minutos)..."
    $waitStart = Get-Date
    
    aws ecs wait services-stable `
        --cluster $ECS_CLUSTER `
        --services $ECS_SERVICE `
        --region $AWS_REGION
    
    if ($LASTEXITCODE -ne 0) {
        throw "Deployment não estabilizou"
    }
    
    $waitTime = ((Get-Date) - $waitStart).TotalSeconds
    Write-Success "Deployment estabilizado em $([math]::Round($waitTime, 0))s"

    # STAGE 5: Health Check
    if (-not $SkipHealthCheck) {
        Write-Stage "STAGE 5: Health Check" "Cyan"
        Write-Info "Aguardando 10s antes do health check..."
        Start-Sleep -Seconds 10
        
        $healthUrl = "https://lojadaesquina.store/home"
        Write-Info "Testando: $healthUrl"
        
        $httpCode = curl.exe -f -s -o nul -w "%{http_code}" $healthUrl
        
        if ($httpCode -eq "200") {
            Write-Success "Health check passou - Status: $httpCode"
        } else {
            throw "Health check falhou - Status: $httpCode"
        }
        
        # Teste adicional do redirect da raiz
        $rootCode = curl.exe -s -o nul -w "%{http_code}" https://lojadaesquina.store/
        Write-Info "Status raiz (/): $rootCode $(if($rootCode -eq '307' -or $rootCode -eq '308'){'✅'}else{'❌'})"
    }

    # SUCCESS
    Write-Stage "✅ DEPLOY BEM-SUCEDIDO!" "Green"
    Write-Host "📦 Imagem: ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}" -ForegroundColor Green
    Write-Host "🌐 URL: https://lojadaesquina.store/" -ForegroundColor Green
    Write-Host "📝 Log: $LOG_FILE" -ForegroundColor Green
    Write-Host "⏱️  Tempo total: $([math]::Round(((Get-Date) - $buildStart).TotalMinutes, 1)) minutos" -ForegroundColor Green
    
} catch {
    # FAILURE
    Write-Stage "❌ DEPLOY FALHOU!" "Red"
    Write-Error-Message $_.Exception.Message
    
    Write-Host "`n🔄 Iniciando ROLLBACK automático..." -ForegroundColor Yellow
    
    if (Test-Path "d:\Saas\imob\temp-previous-task-$IMAGE_TAG.txt") {
        $rollbackTaskDef = Get-Content "d:\Saas\imob\temp-previous-task-$IMAGE_TAG.txt"
        
        if ($rollbackTaskDef) {
            Write-Info "Revertendo para: $rollbackTaskDef"
            
            aws ecs update-service `
                --cluster $ECS_CLUSTER `
                --service $ECS_SERVICE `
                --task-definition $rollbackTaskDef `
                --force-new-deployment `
                --region $AWS_REGION 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Rollback executado com sucesso"
            } else {
                Write-Error-Message "Rollback falhou - intervenção manual necessária"
            }
        }
    }
    
    Write-Host "`n📝 Veja o log completo em: $LOG_FILE" -ForegroundColor Yellow
    exit 1
} finally {
    # Cleanup
    Write-Info "Limpando imagens Docker antigas..."
    docker image prune -f --filter "until=24h" 2>&1 | Out-Null
}
