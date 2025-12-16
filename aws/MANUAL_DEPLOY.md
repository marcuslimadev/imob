# Deploy Manual do Frontend - Comandos

## Pré-requisitos
- AWS CLI instalado e configurado
- Docker Desktop rodando
- Credenciais AWS configuradas

## Comandos para executar:

### 1. Login no ECR
```powershell
$AWS_ACCOUNT_ID = "575098225472"
$AWS_REGION = "sa-east-1"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
```

### 2. Build da imagem
```powershell
cd d:\Saas\imob\nextjs
$IMAGE_TAG = (Get-Date -Format "yyyyMMdd-HHmmss")
docker build -f Dockerfile.prod -t production-imobi-frontend:$IMAGE_TAG -t production-imobi-frontend:latest .
```

### 3. Tag e Push
```powershell
docker tag production-imobi-frontend:$IMAGE_TAG "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/production-imobi-frontend:$IMAGE_TAG"
docker tag production-imobi-frontend:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/production-imobi-frontend:latest"

docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/production-imobi-frontend:$IMAGE_TAG"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/production-imobi-frontend:latest"
```

### 4. Force new deployment no ECS
```powershell
aws ecs update-service --cluster production-imobi-cluster --service production-imobi-frontend --force-new-deployment --region $AWS_REGION
```

### 5. Aguardar estabilização (opcional)
```powershell
aws ecs wait services-stable --cluster production-imobi-cluster --services production-imobi-frontend --region $AWS_REGION
```

## Alternativa: Console AWS

Se não tiver AWS CLI:

1. Build local: `docker build -f Dockerfile.prod -t production-imobi-frontend:latest .`
2. Acesse: https://console.aws.amazon.com/ecs
3. Cluster: production-imobi-cluster
4. Service: production-imobi-frontend
5. Clique "Update" → Force new deployment → Update service
