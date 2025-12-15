# AWS Deployment Troubleshooting Guide

## Table of Contents
1. [Common CloudFormation Errors](#common-cloudformation-errors)
2. [Resource Conflict Resolution](#resource-conflict-resolution)
3. [Deployment Recovery](#deployment-recovery)
4. [Monitoring and Debugging](#monitoring-and-debugging)

---

## Common CloudFormation Errors

### Error: ECR Repository Already Exists

**Symptom:**
```
Resource creation cancelled
imobi-frontend already exists in stack arn:aws:cloudformation:...
```

**Root Cause:** 
Multiple CloudFormation stacks trying to create the same ECR repository.

**Solution:**
```bash
# Option 1: Delete the failed stack and use existing resources
cd aws
./cleanup-failed-stacks.sh sa-east-1

# Option 2: Use the unified template (no resource conflicts)
./deploy-unified.sh production sa-east-1
```

**Prevention:**
- Use environment-prefixed resource names (e.g., `production-imobi-directus`)
- Use the `cloudformation-unified.yaml` template
- Document which stack owns which resources

---

### Error: Stack in ROLLBACK_COMPLETE State

**Symptom:**
```
Stack Status: ROLLBACK_COMPLETE
Cannot update stack in ROLLBACK_COMPLETE state
```

**Root Cause:** 
Stack creation failed and rolled back. AWS prevents updates to failed stacks.

**Solution:**
```bash
# 1. Check what failed
aws cloudformation describe-stack-events \
  --stack-name imobi-rds \
  --region sa-east-1 \
  --query "StackEvents[?ResourceStatus=='CREATE_FAILED']" \
  --output table

# 2. Delete the failed stack
aws cloudformation delete-stack \
  --stack-name imobi-rds \
  --region sa-east-1

# 3. Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name imobi-rds \
  --region sa-east-1

# 4. Deploy fresh stack
cd aws
./deploy-unified.sh production sa-east-1
```

---

### Error: Multiple Stacks Managing Same Resource

**Symptom:**
```
Resource [DirectusECRRepository] is being managed by stack [imobi-production-simple]
Cannot create in stack [imobi-rds]
```

**Root Cause:**
CloudFormation doesn't allow the same physical resource in multiple stacks.

**Solution:**
```bash
# Option A: Use the existing stack and import resources
aws cloudformation describe-stacks \
  --stack-name imobi-production-simple \
  --region sa-east-1 \
  --query 'Stacks[0].Outputs'

# Option B: Delete ALL old stacks and deploy unified
cd aws
./cleanup-failed-stacks.sh sa-east-1
./deploy-unified.sh production sa-east-1
```

**Best Practice:**
- One unified CloudFormation stack per environment
- Use nested stacks for large deployments
- Export/Import values between stacks instead of duplicating resources

---

## Resource Conflict Resolution

### Strategy 1: Cleanup and Fresh Deploy

```bash
# 1. List all stacks
aws cloudformation list-stacks \
  --region sa-east-1 \
  --query "StackSummaries[?StackStatus!='DELETE_COMPLETE'].[StackName,StackStatus]" \
  --output table

# 2. Delete failed stacks (ROLLBACK_COMPLETE, CREATE_FAILED, etc.)
aws cloudformation delete-stack --stack-name imobi-rds --region sa-east-1
aws cloudformation wait stack-delete-complete --stack-name imobi-rds --region sa-east-1

# 3. Deploy unified stack
cd aws
./deploy-unified.sh production sa-east-1
```

### Strategy 2: Use Existing Resources

If `imobi-production-simple` is working:

```bash
# 1. Check what it provides
aws cloudformation describe-stacks \
  --stack-name imobi-production-simple \
  --region sa-east-1 \
  --query 'Stacks[0].Outputs' \
  --output table

# 2. Use those resources instead of creating new ones
# Modify your deployment scripts to reference existing ECR repos

# 3. Only create missing resources (RDS, VPC, etc.)
# Use cloudformation-with-rds.yaml but REMOVE ECR sections
```

### Strategy 3: Import Existing Resources

```bash
# If resources exist outside CloudFormation, import them
# Create a resources-to-import.json file
cat > resources-to-import.json << EOF
[
  {
    "ResourceType": "AWS::ECR::Repository",
    "LogicalResourceId": "DirectusECRRepository",
    "ResourceIdentifier": {
      "RepositoryName": "imobi-directus"
    }
  }
]
EOF

# Import resources into stack
aws cloudformation create-change-set \
  --stack-name imobi-production-simple \
  --change-set-name import-existing-resources \
  --change-set-type IMPORT \
  --resources-to-import file://resources-to-import.json \
  --template-body file://cloudformation-simple.yaml
```

---

## Deployment Recovery

### Scenario: Complete Deployment Failure

```bash
# 1. Save important data (if any services are running)
# Export database backup, save S3 files, etc.

# 2. Delete ALL failed/conflicting stacks
cd aws
./cleanup-failed-stacks.sh sa-east-1

# 3. Start fresh with unified template
./deploy-unified.sh production sa-east-1

# 4. Restore data
# Import database, upload files to S3, etc.
```

### Scenario: Partial Deployment (Infrastructure OK, Services Failed)

```bash
# 1. Verify infrastructure stack is healthy
aws cloudformation describe-stacks \
  --stack-name production-imobi-unified \
  --region sa-east-1 \
  --query 'Stacks[0].StackStatus'

# Expected: CREATE_COMPLETE or UPDATE_COMPLETE

# 2. Fix and rebuild Docker images
cd aws
./build-and-push.sh production sa-east-1

# 3. Re-deploy ECS services
./deploy-services.sh production sa-east-1
```

---

## Monitoring and Debugging

### Check CloudFormation Events

```bash
# Recent events for a stack
aws cloudformation describe-stack-events \
  --stack-name production-imobi-unified \
  --region sa-east-1 \
  --max-items 20 \
  --query 'StackEvents[].[Timestamp,ResourceStatus,ResourceType,LogicalResourceId,ResourceStatusReason]' \
  --output table

# Only failures
aws cloudformation describe-stack-events \
  --stack-name production-imobi-unified \
  --region sa-east-1 \
  --query "StackEvents[?ResourceStatus=='CREATE_FAILED' || ResourceStatus=='UPDATE_FAILED']" \
  --output table
```

### Check ECS Service Health

```bash
# List services
aws ecs list-services \
  --cluster production-imobi-cluster \
  --region sa-east-1

# Describe specific service
aws ecs describe-services \
  --cluster production-imobi-cluster \
  --services directus-service \
  --region sa-east-1 \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount,Events:events[0:5]}'

# Check task failures
aws ecs list-tasks \
  --cluster production-imobi-cluster \
  --desired-status STOPPED \
  --region sa-east-1

# Get task logs
TASK_ARN=$(aws ecs list-tasks \
  --cluster production-imobi-cluster \
  --service-name directus-service \
  --region sa-east-1 \
  --query 'taskArns[0]' \
  --output text)

aws ecs describe-tasks \
  --cluster production-imobi-cluster \
  --tasks $TASK_ARN \
  --region sa-east-1 \
  --query 'tasks[0].containers[0].reason'
```

### Check RDS Status

```bash
# Database instance status
aws rds describe-db-instances \
  --db-instance-identifier production-imobi-postgres \
  --region sa-east-1 \
  --query 'DBInstances[0].{Status:DBInstanceStatus,Endpoint:Endpoint.Address,Port:Endpoint.Port}'

# Recent events
aws rds describe-events \
  --source-identifier production-imobi-postgres \
  --source-type db-instance \
  --region sa-east-1 \
  --duration 60
```

### Check Application Load Balancer

```bash
# Get ALB ARN
ALB_ARN=$(aws elbv2 describe-load-balancers \
  --names production-imobi-alb \
  --region sa-east-1 \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

# Check target health
aws elbv2 describe-target-health \
  --target-group-arn $(aws cloudformation describe-stacks \
    --stack-name production-imobi-unified \
    --region sa-east-1 \
    --query "Stacks[0].Outputs[?OutputKey=='DirectusTargetGroupArn'].OutputValue" \
    --output text) \
  --region sa-east-1

# Check listeners
aws elbv2 describe-listeners \
  --load-balancer-arn $ALB_ARN \
  --region sa-east-1
```

---

## Quick Diagnostic Commands

```bash
# One-liner to check overall health
echo "=== CloudFormation Stacks ===" && \
aws cloudformation list-stacks \
  --region sa-east-1 \
  --query "StackSummaries[?StackStatus!='DELETE_COMPLETE'].[StackName,StackStatus]" \
  --output table && \
echo -e "\n=== ECS Services ===" && \
aws ecs list-services \
  --cluster production-imobi-cluster \
  --region sa-east-1 2>/dev/null || echo "Cluster not found" && \
echo -e "\n=== RDS Instances ===" && \
aws rds describe-db-instances \
  --region sa-east-1 \
  --query 'DBInstances[].[DBInstanceIdentifier,DBInstanceStatus]' \
  --output table
```

---

## Common Issues and Solutions

### Issue: RDS Takes Too Long to Create

**Normal:** RDS creation takes 10-15 minutes.

**Check progress:**
```bash
watch -n 30 'aws cloudformation describe-stack-events \
  --stack-name production-imobi-unified \
  --region sa-east-1 \
  --query "StackEvents[0:5].[Timestamp,ResourceStatus,LogicalResourceId]" \
  --output table'
```

### Issue: ECS Tasks Keep Restarting

**Check CloudWatch Logs:**
```bash
# Find log group
aws logs describe-log-groups \
  --log-group-name-prefix /ecs/imobi \
  --region sa-east-1

# Get recent logs
aws logs tail /ecs/imobi-directus --follow --region sa-east-1
```

**Common causes:**
- Database connection failure (check RDS security group)
- Missing environment variables
- Image pull errors (check ECR permissions)

### Issue: Load Balancer Shows 503 Errors

**Check target group health:**
```bash
aws elbv2 describe-target-health \
  --target-group-arn <TARGET_GROUP_ARN> \
  --region sa-east-1
```

**Common causes:**
- No healthy targets (ECS tasks not running)
- Wrong health check path
- Security group blocking ALB → ECS communication

---

## Support Resources

- **AWS CloudFormation Docs:** https://docs.aws.amazon.com/cloudformation/
- **AWS ECS Troubleshooting:** https://docs.aws.amazon.com/AmazonECS/latest/developerguide/troubleshooting.html
- **Project Documentation:** See `DEPLOY_PRODUCAO_AWS.md` for step-by-step guide

---

## Emergency Recovery Checklist

- [ ] Export critical data (database backup, S3 files)
- [ ] Delete all failed CloudFormation stacks
- [ ] Verify AWS credentials and permissions
- [ ] Deploy unified CloudFormation template
- [ ] Build and push fresh Docker images
- [ ] Deploy ECS services
- [ ] Run health checks
- [ ] Restore data from backups
- [ ] Update DNS records
- [ ] Test all critical functionality

---

**Last Updated:** 2025-01-13
**Maintained By:** DevOps Team
