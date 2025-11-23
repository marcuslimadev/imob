# 🚀 Deploy IMOBI na AWS

## 📋 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS Cloud                                 │
│                                                              │
│  ┌────────────────┐         ┌─────────────────┐            │
│  │   Route 53     │────────▶│  CloudFront     │            │
│  │   (DNS)        │         │  (CDN)          │            │
│  └────────────────┘         └─────────────────┘            │
│                                      │                       │
│                                      ▼                       │
│  ┌──────────────────────────────────────────────┐          │
│  │  Application Load Balancer (ALB)             │          │
│  │  - SSL/TLS Termination                       │          │
│  │  - Path-based routing                        │          │
│  └──────────────────────────────────────────────┘          │
│           │                            │                     │
│           ▼                            ▼                     │
│  ┌──────────────────┐       ┌──────────────────┐          │
│  │  ECS Fargate     │       │  ECS Fargate     │          │
│  │  Directus API    │       │  Next.js         │          │
│  │  (512 CPU/1GB)   │       │  Frontend        │          │
│  └──────────────────┘       │  (256 CPU/512MB) │          │
│           │                  └──────────────────┘          │
│           │                                                  │
│           ├─────────────┬────────────┐                     │
│           ▼             ▼            ▼                     │
│  ┌─────────────┐  ┌──────────┐  ┌────────┐               │
│  │ RDS Postgres│  │ElastiCache│  │   S3   │               │
│  │ (t4g.micro) │  │  Redis    │  │Uploads │               │
│  │ PostGIS     │  │(t4g.micro)│  │        │               │
│  └─────────────┘  └──────────┘  └────────┘               │
│                                                              │
│  ┌─────────────────────────────────────────┐               │
│  │  Secrets Manager                        │               │
│  │  - DB Credentials                       │               │
│  │  - API Keys                             │               │
│  └─────────────────────────────────────────┘               │
│                                                              │
│  ┌─────────────────────────────────────────┐               │
│  │  CloudWatch Logs & Monitoring           │               │
│  └─────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

## 💰 Estimativa de Custos Mensais

### Ambiente de Produção

| Serviço | Especificação | Custo/Mês (USD) |
|---------|--------------|-----------------|
| **Compute** |
| ECS Fargate - Directus | 0.5 vCPU, 1GB RAM | $36.50 |
| ECS Fargate - Frontend | 0.25 vCPU, 512MB RAM | $18.25 |
| **Database** |
| RDS PostgreSQL | db.t4g.micro, 20GB | $15.00 |
| ElastiCache Redis | cache.t4g.micro | $12.00 |
| **Storage** |
| S3 (100GB uploads) | Standard | $2.30 |
| **Network** |
| ALB | + 100GB data transfer | $25.00 |
| **Monitoring** |
| CloudWatch Logs | 10GB/mês | $5.00 |
| **Total** | | **~$114/mês** |

### Ambiente de Desenvolvimento/Staging

| Serviço | Especificação | Custo/Mês (USD) |
|---------|--------------|-----------------|
| ECS Fargate (menor) | 0.25 vCPU, 512MB | $9.10 |
| RDS db.t4g.micro | 10GB | $10.00 |
| ElastiCache (compartilhado) | - | $0 |
| **Total** | | **~$20/mês** |

## 🛠️ Pré-requisitos

### 1. AWS CLI Instalado e Configurado
```bash
# Instalar AWS CLI
# Windows (PowerShell)
choco install awscli

# Configurar credenciais
aws configure
# AWS Access Key ID: [sua-access-key]
# AWS Secret Access Key: [sua-secret-key]
# Default region: us-east-1
# Default output format: json
```

### 2. Docker Instalado
```bash
docker --version
# Docker version 24.0.0+
```

### 3. Permissões IAM Necessárias
- CloudFormation
- EC2
- ECS
- RDS
- ElastiCache
- S3
- ECR
- Secrets Manager
- CloudWatch
- IAM (para criar roles)

## 🚀 Deploy Rápido (Automático)

### Opção 1: Script Bash (Linux/Mac/WSL)

```bash
cd aws
chmod +x deploy.sh
./deploy.sh production us-east-1
```

### Opção 2: PowerShell (Windows)

```powershell
cd aws
.\deploy.ps1 -Environment production -Region us-east-1
```

O script executará automaticamente:
1. ✅ Criar infraestrutura (VPC, RDS, Redis, S3, ALB)
2. ✅ Build e push de imagens Docker
3. ✅ Registrar task definitions
4. ✅ Criar serviços ECS
5. ✅ Configurar health checks

**Tempo total:** ~20-30 minutos

## 📋 Deploy Manual (Passo a Passo)

### Step 1: Criar Infraestrutura

```bash
aws cloudformation create-stack \
  --stack-name imobi-production-infrastructure \
  --template-body file://aws/cloudformation-infrastructure.yaml \
  --parameters ParameterKey=EnvironmentName,ParameterValue=production \
  --capabilities CAPABILITY_IAM \
  --region us-east-1

# Aguardar conclusão (~15 minutos)
aws cloudformation wait stack-create-complete \
  --stack-name imobi-production-infrastructure \
  --region us-east-1
```

### Step 2: Build e Push Docker Images

```bash
# Login ECR
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=us-east-1

aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build Directus
cd directus
docker build -t imobi-directus:latest .
docker tag imobi-directus:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/imobi-directus:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/imobi-directus:latest

# Build Frontend
cd ../nextjs
docker build -t imobi-frontend:latest .
docker tag imobi-frontend:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/imobi-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/imobi-frontend:latest
```

### Step 3: Configurar Secrets

```bash
# Criar secrets no Secrets Manager
aws secretsmanager create-secret \
  --name production/imobi/admin/email \
  --secret-string "marcus@admin.com" \
  --region $AWS_REGION

aws secretsmanager create-secret \
  --name production/imobi/admin/password \
  --secret-string "Teste@123" \
  --region $AWS_REGION
```

### Step 4: Registrar Task Definitions

```bash
# Substituir variáveis
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=us-east-1

envsubst < aws/task-definition-directus.json > /tmp/task-directus.json
envsubst < aws/task-definition-frontend.json > /tmp/task-frontend.json

# Registrar
aws ecs register-task-definition \
  --cli-input-json file:///tmp/task-directus.json \
  --region $AWS_REGION

aws ecs register-task-definition \
  --cli-input-json file:///tmp/task-frontend.json \
  --region $AWS_REGION
```

### Step 5: Criar Serviços ECS

```bash
# Obter IDs da infraestrutura
CLUSTER_NAME=production-imobi-cluster
SUBNETS=$(aws ec2 describe-subnets \
  --filters "Name=tag:Name,Values=production-imobi-public-*" \
  --query "Subnets[*].SubnetId" \
  --output text | tr '\t' ',')

SECURITY_GROUP=$(aws ec2 describe-security-groups \
  --filters "Name=tag:Name,Values=production-imobi-ecs-sg" \
  --query "SecurityGroups[0].GroupId" \
  --output text)

# Criar serviço Directus
aws ecs create-service \
  --cluster $CLUSTER_NAME \
  --service-name directus \
  --task-definition imobi-directus \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SECURITY_GROUP],assignPublicIp=ENABLED}" \
  --region $AWS_REGION

# Criar serviço Frontend
aws ecs create-service \
  --cluster $CLUSTER_NAME \
  --service-name frontend \
  --task-definition imobi-frontend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SECURITY_GROUP],assignPublicIp=ENABLED}" \
  --region $AWS_REGION
```

## 🔒 Configurações de Segurança

### 1. Habilitar HTTPS

```bash
# Solicitar certificado SSL no ACM
aws acm request-certificate \
  --domain-name imobi.com.br \
  --subject-alternative-names *.imobi.com.br \
  --validation-method DNS \
  --region $AWS_REGION

# Adicionar listener HTTPS no ALB
aws elbv2 create-listener \
  --load-balancer-arn <ALB_ARN> \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=<CERTIFICATE_ARN> \
  --default-actions Type=forward,TargetGroupArn=<TARGET_GROUP_ARN>
```

### 2. Configurar WAF (Firewall)

```bash
aws wafv2 create-web-acl \
  --name imobi-waf \
  --scope REGIONAL \
  --default-action Allow={} \
  --rules file://waf-rules.json \
  --region $AWS_REGION
```

### 3. Backup Automático RDS

Já configurado no CloudFormation:
- Backup diário às 03:00 UTC
- Retenção de 7 dias
- Janela de manutenção: Domingos 04:00-05:00 UTC

## 📊 Monitoramento

### CloudWatch Dashboards

```bash
# Criar dashboard
aws cloudwatch put-dashboard \
  --dashboard-name imobi-production \
  --dashboard-body file://cloudwatch-dashboard.json
```

### Alarmes Importantes

```bash
# CPU Alta
aws cloudwatch put-metric-alarm \
  --alarm-name imobi-directus-high-cpu \
  --alarm-description "Directus CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold

# Erros 5xx
aws cloudwatch put-metric-alarm \
  --alarm-name imobi-alb-5xx-errors \
  --alarm-description "ALB 5xx errors" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 60 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

## 🔄 CI/CD com GitHub Actions

Arquivo `.github/workflows/deploy-aws.yml` já configurado para:
- Build automático em push para `main`
- Deploy em ECS
- Rollback automático em caso de falha

## 🐛 Troubleshooting

### Serviço não inicia

```bash
# Ver logs
aws logs tail /ecs/imobi-directus --follow

# Ver eventos do serviço
aws ecs describe-services \
  --cluster production-imobi-cluster \
  --services directus \
  --query 'services[0].events' \
  --output table
```

### Problemas de conectividade RDS

```bash
# Testar conexão
aws rds describe-db-instances \
  --db-instance-identifier production-imobi-postgres \
  --query 'DBInstances[0].Endpoint'

# Verificar security groups
aws ec2 describe-security-groups \
  --group-ids <RDS_SG_ID>
```

## 📱 URLs Após Deploy

Obter URL do Load Balancer:

```bash
aws cloudformation describe-stacks \
  --stack-name imobi-production-infrastructure \
  --query "Stacks[0].Outputs[?OutputKey=='ALBDNSName'].OutputValue" \
  --output text
```

- **Frontend:** `http://[ALB-DNS]`
- **Directus Admin:** `http://[ALB-DNS]/admin`
- **API:** `http://[ALB-DNS]/api`
- **GraphQL:** `http://[ALB-DNS]/graphql`

## 🎯 Próximos Passos

1. ✅ Configurar domínio customizado (Route 53)
2. ✅ Habilitar HTTPS (ACM + ALB)
3. ✅ Configurar CloudFront para CDN
4. ✅ Implementar backup incremental S3
5. ✅ Configurar Auto Scaling
6. ✅ Implementar Multi-Region (opcional)

---

**Custo estimado:** $114/mês  
**Tempo de deploy:** 20-30 min  
**Uptime esperado:** 99.95%
