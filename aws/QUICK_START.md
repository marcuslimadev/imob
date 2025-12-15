# AWS Deployment - Quick Start Guide

## 🚀 Deploy in 3 Steps (5 minutes read, 15 minutes execution)

### Prerequisites
- AWS CLI configured (`aws configure`)
- Docker running (`docker ps`)
- Bash shell (Linux/macOS/Git Bash)

---

## Step 1: Validate & Cleanup

```bash
cd aws

# Validate your environment
./validate-deployment.sh production sa-east-1

# If you have failed stacks, clean them up
./cleanup-failed-stacks.sh sa-east-1
```

**Time:** 1 minute

---

## Step 2: Deploy Infrastructure

```bash
# Deploy unified CloudFormation stack
./deploy-unified.sh production sa-east-1
```

**What gets created:**
- ✅ VPC with public/private subnets
- ✅ RDS PostgreSQL database
- ✅ Application Load Balancer  
- ✅ ECS Cluster
- ✅ S3 bucket for uploads
- ✅ ECR repositories
- ✅ Security groups & IAM roles

**Time:** 10-15 minutes (RDS is slow)

**Output:** Saves `deployment-info.json` with all endpoints and ARNs

---

## Step 3: Build & Push Images

```bash
# Build Docker images and push to ECR
./build-and-push.sh production sa-east-1
```

**What it does:**
- ✅ Builds Directus image from `directus/Dockerfile`
- ✅ Builds Next.js frontend from `nextjs/Dockerfile`
- ✅ Pushes both to ECR with `latest` tag

**Time:** 5-10 minutes

---

## Step 4: Deploy Services (Manual - WIP)

**Option A: Use AWS Console**
1. Open ECS Console → `production-imobi-cluster`
2. Create Service → Use task definition `imobi-directus`
3. Configure load balancer → Target group from `deployment-info.json`

**Option B: Use AWS CLI**
```bash
# Load deployment config
source <(jq -r 'to_entries | .[] | "export \(.key | ascii_upcase)=\(.value | @sh)"' deployment-info.json)

# Create Directus service
aws ecs create-service \
  --cluster $ECSCLUSTERNAME \
  --service-name directus-service \
  --task-definition imobi-directus \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$PUBLICSUBNET1ID,$PUBLICSUBNET2ID],securityGroups=[$(aws cloudformation describe-stacks --stack-name production-imobi-unified --region sa-east-1 --query "Stacks[0].Outputs[?OutputKey=='ECSSecurityGroupId'].OutputValue" --output text)],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$DIRECTUSTARGETGROUPARN,containerName=directus,containerPort=8055" \
  --region sa-east-1
```

---

## Access Your Application

After services are running (2-3 minutes):

```bash
# Get ALB DNS from deployment-info.json
cat deployment-info.json | jq -r '.albDNS'
```

**Access URLs:**
- **Frontend:** `http://<ALB_DNS>`
- **Directus Admin:** `http://<ALB_DNS>/admin`
- **Directus API:** `http://<ALB_DNS>/items/properties`

---

## Configure Custom Domain (Optional)

1. **Get ALB DNS:**
   ```bash
   cat deployment-info.json | jq -r '.albDNS'
   ```

2. **Add CNAME in your DNS provider:**
   - `exclusivalarimoveis.com.br` → `<ALB_DNS>`
   - `www.exclusivalarimoveis.com.br` → `<ALB_DNS>`
   - `directus.exclusivalarimoveis.com.br` → `<ALB_DNS>`

3. **Wait for DNS propagation (5-30 min):**
   ```bash
   nslookup exclusivalarimoveis.com.br
   ```

---

## Troubleshooting

### Stack Creation Failed

```bash
# Check what failed
aws cloudformation describe-stack-events \
  --stack-name production-imobi-unified \
  --region sa-east-1 \
  --query "StackEvents[?ResourceStatus=='CREATE_FAILED']" \
  --output table

# Delete and retry
./cleanup-failed-stacks.sh sa-east-1
./deploy-unified.sh production sa-east-1
```

### Services Not Running

```bash
# Check ECS tasks
aws ecs list-tasks \
  --cluster production-imobi-cluster \
  --region sa-east-1

# Describe task to see errors
aws ecs describe-tasks \
  --cluster production-imobi-cluster \
  --tasks <TASK_ARN> \
  --region sa-east-1
```

### Database Connection Issues

```bash
# Check RDS status
aws rds describe-db-instances \
  --db-instance-identifier production-imobi-postgres \
  --region sa-east-1 \
  --query 'DBInstances[0].{Status:DBInstanceStatus,Endpoint:Endpoint.Address}'

# Verify security group allows ECS → RDS on port 5432
```

---

## Common Commands

```bash
# View deployment info
cat deployment-info.json | jq

# Check stack status
aws cloudformation describe-stacks \
  --stack-name production-imobi-unified \
  --region sa-east-1 \
  --query 'Stacks[0].StackStatus'

# List ECS services
aws ecs list-services \
  --cluster production-imobi-cluster \
  --region sa-east-1

# Check load balancer health
aws elbv2 describe-target-health \
  --target-group-arn $(cat deployment-info.json | jq -r '.directusTargetGroupArn') \
  --region sa-east-1

# View CloudWatch logs
aws logs tail /ecs/production-imobi-directus --follow --region sa-east-1
```

---

## Cost Optimization Tips

**For development/staging:**
```bash
# Use smaller instances
./deploy-unified.sh dev sa-east-1
# Automatically uses db.t3.micro (cheaper)

# Stop services when not in use
aws ecs update-service \
  --cluster dev-imobi-cluster \
  --service directus-service \
  --desired-count 0 \
  --region sa-east-1

# Delete entire stack
aws cloudformation delete-stack \
  --stack-name dev-imobi-unified \
  --region sa-east-1
```

**For production:**
- Enable RDS backups (7 days)
- Use CloudWatch alarms for cost monitoring
- Consider Reserved Instances for predictable workloads

---

## What's Different from Old Approach?

### ❌ Old Way (Had Issues)
- Multiple CloudFormation stacks (`imobi-rds`, `imobi-production-simple`)
- Resource name conflicts (ECR repos created in multiple stacks)
- Manual cleanup required for failed stacks
- No validation before deployment

### ✅ New Way (Fixed)
- **One unified CloudFormation stack** per environment
- **Environment-prefixed resource names** (no conflicts)
- **Automated cleanup script** for failed stacks
- **Pre-flight validation** catches issues early
- **Comprehensive troubleshooting guide**

---

## Next Steps

1. ✅ Infrastructure deployed
2. ✅ Docker images in ECR
3. ⏳ Deploy ECS services (manual step - see Step 4)
4. ⏳ Configure DNS (optional)
5. ⏳ Setup SSL/TLS with ACM (optional)
6. ⏳ Configure monitoring & backups

---

## Need Help?

- **Full Guide:** [`AWS_DEPLOYMENT_GUIDE.md`](./AWS_DEPLOYMENT_GUIDE.md)
- **Troubleshooting:** [`AWS_TROUBLESHOOTING.md`](./AWS_TROUBLESHOOTING.md)
- **Alternative Approach:** [`DEPLOY_PRODUCAO_AWS.md`](../DEPLOY_PRODUCAO_AWS.md) (EC2-based)

---

**Last Updated:** 2025-01-13  
**Deployment Time:** ~20 minutes total  
**Monthly Cost:** ~$73 (production) | ~$30 (dev)
