# AWS Deployment Scripts & Templates

This directory contains CloudFormation templates and deployment scripts for deploying the iMOBI platform to AWS.

## 🚀 Quick Start

```bash
# 1. Validate your environment
./validate-deployment.sh production sa-east-1

# 2. Clean up any failed stacks (if needed)
./cleanup-failed-stacks.sh sa-east-1

# 3. Deploy infrastructure
./deploy-unified.sh production sa-east-1

# 4. Build and push Docker images
./build-and-push.sh production sa-east-1
```

**Total time:** ~20 minutes  
**See:** [`QUICK_START.md`](./QUICK_START.md) for detailed walkthrough

---

## 📁 Directory Structure

### CloudFormation Templates

| File | Purpose | Status |
|------|---------|--------|
| `cloudformation-unified.yaml` | ✅ **RECOMMENDED** - Complete infrastructure, no resource conflicts | Active |
| `cloudformation-simple.yaml` | Basic infrastructure (ECS + ECR only, no RDS) | Legacy |
| `cloudformation-with-rds.yaml` | Infrastructure with RDS (has resource conflicts) | Deprecated |
| `cloudformation-production.yaml` | Full stack with ALB (has resource conflicts) | Deprecated |
| `cloudformation-infrastructure.yaml` | Infrastructure only | Legacy |
| `cloudformation-alb.yaml` | Application Load Balancer only | Legacy |

### Deployment Scripts

| Script | Purpose |
|--------|---------|
| `validate-deployment.sh` | ✅ Pre-flight validation (checks prerequisites) |
| `cleanup-failed-stacks.sh` | ✅ Delete failed CloudFormation stacks |
| `deploy-unified.sh` | ✅ Deploy unified infrastructure stack |
| `build-and-push.sh` | ✅ Build and push Docker images to ECR |
| `deploy.sh` | Legacy deployment script |
| `deploy-production.ps1` | Legacy PowerShell script |
| `deploy.ps1` | Legacy PowerShell script |

### ECS Task Definitions

| File | Purpose |
|------|---------|
| `task-definition-directus.json` | Directus CMS task definition |
| `task-definition-frontend.json` | Next.js frontend task definition |
| `task-definition-directus-postgres.json` | Directus with PostgreSQL config |
| `task-definition-directus-simple.json` | Simplified Directus config |
| `task-definition-directus-final.json` | Final Directus config with all env vars |

### Other Scripts

| File | Purpose |
|------|---------|
| `setup-directus-aws.ps1` | PowerShell setup script |
| `directus-token.txt` | Directus authentication token |

### Documentation

| File | Description |
|------|-------------|
| [`QUICK_START.md`](./QUICK_START.md) | Quick reference guide |
| [`AWS_DEPLOYMENT_GUIDE.md`](../AWS_DEPLOYMENT_GUIDE.md) | Complete deployment guide |
| [`AWS_TROUBLESHOOTING.md`](../AWS_TROUBLESHOOTING.md) | Troubleshooting common issues |

---

## 🔧 What Changed?

### Problem: Resource Conflicts

The original deployment approach had **multiple CloudFormation stacks** trying to create the same resources:

```
❌ imobi-production-simple (stack 1)
   └─ Creates: imobi-directus (ECR)
   └─ Creates: imobi-frontend (ECR)

❌ imobi-rds (stack 2)
   └─ Tries to create: imobi-directus (ECR) ← CONFLICT!
   └─ Tries to create: imobi-frontend (ECR) ← CONFLICT!
   └─ Result: ROLLBACK_COMPLETE (failed)
```

### Solution: Unified Template

New approach uses **one unified CloudFormation stack** per environment:

```
✅ production-imobi-unified (single stack)
   ├─ VPC & Networking
   ├─ RDS PostgreSQL
   ├─ Application Load Balancer
   ├─ ECS Cluster
   ├─ ECR Repositories (environment-prefixed)
   ├─ S3 Bucket
   └─ Security Groups & IAM Roles
```

**Benefits:**
- ✅ No resource name conflicts
- ✅ Environment-prefixed names (`production-imobi-*`)
- ✅ Single source of truth per environment
- ✅ Easy to delete entire stack when needed

---

## 🎯 Recommended Workflow

### For New Deployments

1. **Validate** → `./validate-deployment.sh`
2. **Deploy Infrastructure** → `./deploy-unified.sh`
3. **Build Images** → `./build-and-push.sh`
4. **Deploy Services** → Manual (AWS Console or CLI)

### For Updates

```bash
# Update infrastructure
./deploy-unified.sh production sa-east-1

# Rebuild and push images
./build-and-push.sh production sa-east-1

# Update ECS services (automatic if using latest tag)
aws ecs update-service \
  --cluster production-imobi-cluster \
  --service directus-service \
  --force-new-deployment \
  --region sa-east-1
```

### For Cleanup

```bash
# Delete failed stacks only
./cleanup-failed-stacks.sh sa-east-1

# Delete entire environment
aws cloudformation delete-stack \
  --stack-name production-imobi-unified \
  --region sa-east-1
```

---

## 📊 Infrastructure Components

### VPC & Networking
- VPC: `10.0.0.0/16`
- Public Subnets: `10.0.1.0/24`, `10.0.2.0/24`
- Private Subnets: `10.0.11.0/24`, `10.0.12.0/24`
- Internet Gateway + Route Tables

### Compute
- **ECS Cluster:** Fargate-based (serverless)
- **Application Load Balancer:** Routes traffic to ECS tasks
- **Target Groups:** One for frontend (port 4000), one for Directus (port 8055)

### Database
- **RDS PostgreSQL 15.5**
- **Instance:** db.t3.micro (dev) or db.t3.small (production)
- **Storage:** 20GB (dev) or 50GB (production)
- **Backups:** 1 day (dev) or 7 days (production)

### Storage
- **S3 Bucket:** For Directus uploads and media
- **ECR Repositories:** For Docker images (Directus + Frontend)

### Security
- **Security Groups:** ALB, ECS, RDS (least privilege)
- **IAM Roles:** ECS task execution role with ECR + S3 permissions

---

## 💰 Cost Estimates

### Production Environment (sa-east-1)

| Resource | Configuration | Monthly Cost (USD) |
|----------|--------------|-------------------|
| RDS PostgreSQL | db.t3.small, 50GB | $30 |
| ECS Fargate | 2 tasks (0.25 vCPU, 0.5GB) | $15 |
| Application Load Balancer | 1 ALB | $20 |
| S3 Storage | 10GB + requests | $3 |
| ECR Storage | 5GB images | $0.50 |
| CloudWatch | Logs + metrics | $5 |
| **Total** | | **~$73/month** |

### Dev/Staging Environment

| Resource | Configuration | Monthly Cost (USD) |
|----------|--------------|-------------------|
| RDS PostgreSQL | db.t3.micro, 20GB | $15 |
| ECS Fargate | 1 task (0.25 vCPU, 0.5GB) | $7 |
| Application Load Balancer | 1 ALB | $20 |
| Other | S3, ECR, CloudWatch | $3 |
| **Total** | | **~$45/month** |

**Cost Optimization Tips:**
- Stop dev/staging when not in use
- Use spot instances for non-critical workloads
- Enable CloudWatch cost monitoring
- Consider Reserved Instances for production

---

## 🔍 Monitoring & Debugging

### Check Infrastructure Health

```bash
# CloudFormation stack status
aws cloudformation describe-stacks \
  --stack-name production-imobi-unified \
  --region sa-east-1 \
  --query 'Stacks[0].StackStatus'

# List all resources in stack
aws cloudformation describe-stack-resources \
  --stack-name production-imobi-unified \
  --region sa-east-1
```

### Check Application Health

```bash
# ECS services
aws ecs describe-services \
  --cluster production-imobi-cluster \
  --services directus-service frontend-service \
  --region sa-east-1

# Load balancer target health
aws elbv2 describe-target-health \
  --target-group-arn <TARGET_GROUP_ARN> \
  --region sa-east-1

# RDS database status
aws rds describe-db-instances \
  --db-instance-identifier production-imobi-postgres \
  --region sa-east-1
```

### View Logs

```bash
# CloudWatch logs for ECS tasks
aws logs tail /ecs/production-imobi-directus --follow --region sa-east-1

# CloudFormation events (recent failures)
aws cloudformation describe-stack-events \
  --stack-name production-imobi-unified \
  --region sa-east-1 \
  --query "StackEvents[?ResourceStatus=='CREATE_FAILED' || ResourceStatus=='UPDATE_FAILED']"
```

---

## 🆘 Troubleshooting

### Common Issues

1. **Stack in ROLLBACK_COMPLETE**
   - Run: `./cleanup-failed-stacks.sh sa-east-1`
   - Then redeploy: `./deploy-unified.sh production sa-east-1`

2. **ECR Repository Already Exists**
   - This is OK! The script will reuse existing repositories
   - Use environment-specific names to avoid conflicts

3. **RDS Creation Timeout**
   - RDS takes 10-15 minutes - this is normal
   - Monitor progress: `aws cloudformation describe-stack-events --stack-name production-imobi-unified`

4. **ECS Tasks Not Starting**
   - Check task logs: `aws ecs describe-tasks --cluster production-imobi-cluster --tasks <TASK_ARN>`
   - Common causes: database not ready, wrong environment variables, image pull errors

**For detailed troubleshooting, see:** [`AWS_TROUBLESHOOTING.md`](../AWS_TROUBLESHOOTING.md)

---

## 📚 Additional Resources

- **AWS CloudFormation:** https://docs.aws.amazon.com/cloudformation/
- **AWS ECS:** https://docs.aws.amazon.com/ecs/
- **AWS RDS:** https://docs.aws.amazon.com/rds/
- **AWS CLI Reference:** https://awscli.amazonaws.com/v2/documentation/api/latest/index.html

---

## 🤝 Support

For deployment issues:
1. Check [`QUICK_START.md`](./QUICK_START.md) for quick reference
2. Review [`AWS_TROUBLESHOOTING.md`](../AWS_TROUBLESHOOTING.md) for common issues
3. Check CloudFormation events for specific errors
4. Review ECS task logs in CloudWatch

---

**Last Updated:** 2025-01-13  
**Maintained By:** DevOps Team
