# AWS Deployment Guide - iMOBI Platform

## Overview

This guide provides a **corrected deployment workflow** for deploying the iMOBI SaaS platform to AWS. The previous approach had resource conflicts between multiple CloudFormation stacks. This guide uses a **unified deployment strategy** to avoid conflicts.

---

## Problem Summary

### What Was Wrong

❌ **Multiple CloudFormation stacks creating duplicate resources:**
- Stack `imobi-production-simple` created ECR repositories `imobi-directus` and `imobi-frontend`
- Stack `imobi-rds` tried to create the same ECR repositories
- CloudFormation doesn't allow duplicate physical resources → **ROLLBACK_COMPLETE**

❌ **Inconsistent naming:**
- Some resources named `imobi-*`, others `production-imobi-*`
- Hard to track which stack owns which resource

❌ **No cleanup mechanism:**
- Failed stacks left in ROLLBACK_COMPLETE state
- No automated way to recover

### What's Fixed

✅ **Unified CloudFormation template** (`cloudformation-unified.yaml`):
- All resources in one stack
- Environment-prefixed naming (`production-imobi-*`)
- No resource conflicts

✅ **Cleanup script** (`cleanup-failed-stacks.sh`):
- Automatically deletes failed stacks
- Safe to run multiple times

✅ **Automated deployment** (`deploy-unified.sh`):
- Template validation
- Stack update detection
- Configuration export

✅ **Comprehensive troubleshooting guide** (`AWS_TROUBLESHOOTING.md`):
- Common errors and solutions
- Diagnostic commands
- Recovery procedures

---

## Prerequisites

### Required Tools
- AWS CLI v2+ (`aws --version`)
- Docker (`docker --version`)
- Bash shell (Linux/macOS) or Git Bash (Windows)
- `jq` for JSON parsing (`sudo apt install jq` or `brew install jq`)

### AWS Permissions
Your AWS user/role needs these permissions:
- CloudFormation (full)
- EC2 (VPC, Subnets, Security Groups)
- RDS (create/manage databases)
- ECS (clusters, services, tasks)
- ECR (create/push images)
- S3 (create buckets, upload files)
- IAM (create roles for ECS tasks)
- Elastic Load Balancing (ALB, target groups)

### AWS Configuration
```bash
# Configure AWS CLI (if not done)
aws configure
# Enter: Access Key ID, Secret Key, Region (sa-east-1), Output format (json)

# Verify configuration
aws sts get-caller-identity
```

---

## Deployment Steps

### Step 1: Cleanup Failed Stacks (If Any)

If you have previous failed deployments, clean them up first:

```bash
cd aws
chmod +x *.sh

# This script deletes stacks in ROLLBACK_COMPLETE state
./cleanup-failed-stacks.sh sa-east-1
```

**What it does:**
- Lists all CloudFormation stacks
- Identifies and deletes failed stacks (ROLLBACK_COMPLETE, CREATE_FAILED)
- Waits for deletion to complete

**Output example:**
```
🧹 AWS CloudFormation Stack Cleanup
Region: sa-east-1

📋 Current stacks:
+--------------------------+---------------------+
|  imobi-rds               |  ROLLBACK_COMPLETE  |
|  imobi-production-simple |  CREATE_COMPLETE    |
+--------------------------+---------------------+

🗑️  Deleting failed stack: imobi-rds
⏳ Waiting for stack deletion to complete...
✅ Stack imobi-rds deleted successfully
```

---

### Step 2: Deploy Unified Infrastructure

Deploy the unified CloudFormation stack:

```bash
cd aws
./deploy-unified.sh production sa-east-1
```

**What it does:**
1. Validates CloudFormation template
2. Prompts for RDS password (or uses default)
3. Creates/updates infrastructure:
   - VPC with public/private subnets
   - RDS PostgreSQL database
   - Application Load Balancer
   - ECS Cluster
   - S3 bucket for uploads
   - Security groups
   - IAM roles
4. Creates ECR repositories (if they don't exist)
5. Saves deployment configuration to `deployment-info.json`

**Duration:** 10-15 minutes (RDS creation is slow)

**Output example:**
```
🚀 iMOBI Unified AWS Deployment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment: production
Region: sa-east-1
Stack Name: production-imobi-unified

🔑 Enter RDS PostgreSQL password: **********************
📦 Step 2: Deploying CloudFormation stack...
   This may take 10-15 minutes (RDS creation is slow)

Waiting for changeset to be created...
Waiting for stack create/update to complete
...
✅ Infrastructure deployed successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ DEPLOYMENT COMPLETE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Infrastructure Details:
   Environment:    production
   Stack Name:     production-imobi-unified
   Region:         sa-east-1

📡 Endpoints:
   Load Balancer:  http://production-imobi-alb-123456789.sa-east-1.elb.amazonaws.com
   Frontend:       http://production-imobi-alb-123456789.sa-east-1.elb.amazonaws.com
   Directus Admin: http://production-imobi-alb-123456789.sa-east-1.elb.amazonaws.com/admin

💾 Database:
   Endpoint:       production-imobi-postgres.abcdef123456.sa-east-1.rds.amazonaws.com:5432
   Database:       imobi
   Username:       imobi_admin
```

---

### Step 3: Build and Push Docker Images

Build Docker images for Directus and Next.js frontend, then push to ECR:

```bash
cd aws
./build-and-push.sh production sa-east-1
```

**What it does:**
1. Logs in to ECR
2. Builds Directus Docker image from `directus/Dockerfile`
3. Pushes Directus to ECR with tags `latest` and timestamp
4. Builds Next.js frontend from `nextjs/Dockerfile`
5. Pushes frontend to ECR with tags `latest` and timestamp
6. Lists all images in ECR

**Duration:** 5-10 minutes (depending on image size)

**Prerequisites:**
- Dockerfiles must exist:
  - `directus/Dockerfile`
  - `nextjs/Dockerfile`
- Docker daemon must be running

**Output example:**
```
🐳 iMOBI Docker Build & Push
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment: production
Region: sa-east-1

🔐 Step 1: Logging in to ECR...
✅ Logged in to ECR

📦 Step 2: Building Directus image...
Step 1/10 : FROM directus/directus:11.2.2
...
✅ Directus image built

⬆️  Step 3: Pushing Directus to ECR...
latest: digest: sha256:abc123... size: 1234
✅ Directus image pushed
```

---

### Step 4: Deploy ECS Services

**Note:** This step requires a separate script `deploy-services.sh` which needs to be created based on your ECS task definitions.

For manual deployment:

```bash
# Load deployment info
source <(jq -r 'to_entries | .[] | "export \(.key | ascii_upcase)=\(.value | @sh)"' aws/deployment-info.json)

# Register Directus task definition
aws ecs register-task-definition \
  --cli-input-json file://aws/task-definition-directus.json \
  --region sa-east-1

# Create Directus service
aws ecs create-service \
  --cluster $ECSCLUSTER \
  --service-name directus-service \
  --task-definition imobi-directus \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$PUBLICSUBNET1ID,$PUBLICSUBNET2ID],securityGroups=[$ECSSECURITYGROUPID],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$DIRECTUSTARGETGROUPARN,containerName=directus,containerPort=8055" \
  --region sa-east-1
```

---

### Step 5: Configure DNS

Point your domain to the Application Load Balancer:

```bash
# Get ALB DNS name from deployment-info.json
cat aws/deployment-info.json | jq -r '.albDNS'
```

**In your DNS provider (Cloudflare, Route53, etc.):**
1. Create CNAME record:
   - **Name:** `exclusivalarimoveis.com.br`
   - **Type:** CNAME
   - **Value:** `production-imobi-alb-123456789.sa-east-1.elb.amazonaws.com`
   - **TTL:** 300

2. Create CNAME for www:
   - **Name:** `www.exclusivalarimoveis.com.br`
   - **Type:** CNAME
   - **Value:** `production-imobi-alb-123456789.sa-east-1.elb.amazonaws.com`

3. Create CNAME for Directus subdomain:
   - **Name:** `directus.exclusivalarimoveis.com.br`
   - **Type:** CNAME
   - **Value:** `production-imobi-alb-123456789.sa-east-1.elb.amazonaws.com`

**Wait for DNS propagation (5-30 minutes):**
```bash
nslookup exclusivalarimoveis.com.br
```

---

### Step 6: Configure SSL/TLS (Optional but Recommended)

For HTTPS support, configure AWS Certificate Manager (ACM):

```bash
# Request certificate
aws acm request-certificate \
  --domain-name exclusivalarimoveis.com.br \
  --subject-alternative-names www.exclusivalarimoveis.com.br directus.exclusivalarimoveis.com.br \
  --validation-method DNS \
  --region sa-east-1

# Get certificate ARN and validation records
aws acm describe-certificate \
  --certificate-arn <CERT_ARN> \
  --region sa-east-1
```

Add DNS validation records to your DNS provider, then:

```bash
# Add HTTPS listener to ALB
ALB_ARN=$(aws elbv2 describe-load-balancers \
  --names production-imobi-alb \
  --region sa-east-1 \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=<CERT_ARN> \
  --default-actions Type=forward,TargetGroupArn=<FRONTEND_TG_ARN>
```

---

## Verification

### Check Infrastructure Status

```bash
# CloudFormation stack
aws cloudformation describe-stacks \
  --stack-name production-imobi-unified \
  --region sa-east-1 \
  --query 'Stacks[0].StackStatus'
# Expected: CREATE_COMPLETE or UPDATE_COMPLETE

# RDS Database
aws rds describe-db-instances \
  --db-instance-identifier production-imobi-postgres \
  --region sa-east-1 \
  --query 'DBInstances[0].DBInstanceStatus'
# Expected: available

# ECS Services
aws ecs describe-services \
  --cluster production-imobi-cluster \
  --services directus-service \
  --region sa-east-1 \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}'
# Expected: Status=ACTIVE, Running=Desired
```

### Test Endpoints

```bash
# Get ALB DNS
ALB_DNS=$(cat aws/deployment-info.json | jq -r '.albDNS')

# Test frontend
curl -I http://$ALB_DNS

# Test Directus health
curl http://$ALB_DNS/server/health

# Test Directus admin
curl -I http://$ALB_DNS/admin
```

---

## Rollback Procedure

If deployment fails, rollback:

```bash
# Option 1: Rollback CloudFormation stack to previous version
aws cloudformation update-stack \
  --stack-name production-imobi-unified \
  --use-previous-template \
  --region sa-east-1

# Option 2: Delete stack and start over
aws cloudformation delete-stack \
  --stack-name production-imobi-unified \
  --region sa-east-1

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name production-imobi-unified \
  --region sa-east-1
```

---

## Cost Estimation

Monthly costs for production environment (sa-east-1 region):

| Service | Resource | Cost (USD/month) |
|---------|----------|------------------|
| RDS PostgreSQL | db.t3.small (20GB) | ~$30 |
| ECS Fargate | 0.25 vCPU, 0.5GB RAM (2 tasks) | ~$15 |
| ALB | 1 load balancer | ~$20 |
| S3 | 10GB storage + requests | ~$3 |
| ECR | 5GB images | ~$0.50 |
| CloudWatch | Logs + metrics | ~$5 |
| **Total** | | **~$73/month** |

**Free Tier eligible (first 12 months):**
- RDS: 750 hours/month of db.t2.micro (not db.t3.small)
- S3: 5GB storage
- CloudWatch: 5GB logs

---

## Troubleshooting

See [`AWS_TROUBLESHOOTING.md`](./AWS_TROUBLESHOOTING.md) for detailed troubleshooting guide.

**Quick diagnostics:**
```bash
# One-liner health check
cd aws
./check-deployment-health.sh production sa-east-1
```

---

## Additional Resources

- **AWS CloudFormation:** https://docs.aws.amazon.com/cloudformation/
- **AWS ECS:** https://docs.aws.amazon.com/ecs/
- **AWS RDS:** https://docs.aws.amazon.com/rds/
- **Project Docs:** See `DEPLOY_PRODUCAO_AWS.md` for EC2-based deployment (alternative approach)

---

## Support

For issues specific to this deployment:
1. Check `AWS_TROUBLESHOOTING.md`
2. Review CloudFormation events: `aws cloudformation describe-stack-events --stack-name production-imobi-unified`
3. Check ECS task logs: `aws ecs describe-tasks --cluster production-imobi-cluster --tasks <TASK_ARN>`

---

**Last Updated:** 2025-01-13  
**Version:** 1.0  
**Maintained By:** DevOps Team
