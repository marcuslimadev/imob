#!/bin/bash

# AWS Deployment Health Check Script
# Purpose: Quick health check of deployed infrastructure
# Usage: ./check-health.sh [environment] [region]

set -e

ENVIRONMENT=${1:-production}
AWS_REGION=${2:-sa-east-1}
STACK_NAME="${ENVIRONMENT}-imobi-unified"

echo "🏥 AWS Deployment Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"
echo ""

ERRORS=0

# Check CloudFormation stack
echo "1. CloudFormation Stack"
STACK_STATUS=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $AWS_REGION \
  --query 'Stacks[0].StackStatus' \
  --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$STACK_STATUS" = "CREATE_COMPLETE" ] || [ "$STACK_STATUS" = "UPDATE_COMPLETE" ]; then
  echo "   ✅ Status: $STACK_STATUS"
else
  echo "   ❌ Status: $STACK_STATUS"
  ERRORS=$((ERRORS + 1))
fi

# Check RDS
echo ""
echo "2. RDS PostgreSQL"
RDS_STATUS=$(aws rds describe-db-instances \
  --db-instance-identifier ${ENVIRONMENT}-imobi-postgres \
  --region $AWS_REGION \
  --query 'DBInstances[0].DBInstanceStatus' \
  --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$RDS_STATUS" = "available" ]; then
  echo "   ✅ Status: $RDS_STATUS"
  RDS_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier ${ENVIRONMENT}-imobi-postgres \
    --region $AWS_REGION \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)
  echo "   📍 Endpoint: $RDS_ENDPOINT"
else
  echo "   ❌ Status: $RDS_STATUS"
  ERRORS=$((ERRORS + 1))
fi

# Check ECS Cluster
echo ""
echo "3. ECS Cluster"
ECS_CLUSTER_STATUS=$(aws ecs describe-clusters \
  --clusters ${ENVIRONMENT}-imobi-cluster \
  --region $AWS_REGION \
  --query 'clusters[0].status' \
  --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$ECS_CLUSTER_STATUS" = "ACTIVE" ]; then
  echo "   ✅ Status: $ECS_CLUSTER_STATUS"
  
  # Check services
  SERVICES=$(aws ecs list-services \
    --cluster ${ENVIRONMENT}-imobi-cluster \
    --region $AWS_REGION \
    --query 'serviceArns' \
    --output text 2>/dev/null || echo "")
  
  if [ -n "$SERVICES" ]; then
    echo "   📦 Services:"
    for service in $SERVICES; do
      SERVICE_NAME=$(basename $service)
      SERVICE_INFO=$(aws ecs describe-services \
        --cluster ${ENVIRONMENT}-imobi-cluster \
        --services $SERVICE_NAME \
        --region $AWS_REGION \
        --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}' \
        --output text)
      echo "      - $SERVICE_NAME: $SERVICE_INFO"
    done
  else
    echo "   ⚠️  No services deployed yet"
  fi
else
  echo "   ❌ Status: $ECS_CLUSTER_STATUS"
  ERRORS=$((ERRORS + 1))
fi

# Check ALB
echo ""
echo "4. Application Load Balancer"
ALB_STATE=$(aws elbv2 describe-load-balancers \
  --names ${ENVIRONMENT}-imobi-alb \
  --region $AWS_REGION \
  --query 'LoadBalancers[0].State.Code' \
  --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$ALB_STATE" = "active" ]; then
  echo "   ✅ Status: $ALB_STATE"
  ALB_DNS=$(aws elbv2 describe-load-balancers \
    --names ${ENVIRONMENT}-imobi-alb \
    --region $AWS_REGION \
    --query 'LoadBalancers[0].DNSName' \
    --output text)
  echo "   📍 DNS: $ALB_DNS"
  echo "   🌐 URLs:"
  echo "      - Frontend: http://$ALB_DNS"
  echo "      - Directus: http://$ALB_DNS/admin"
else
  echo "   ❌ Status: $ALB_STATE"
  ERRORS=$((ERRORS + 1))
fi

# Check S3 Bucket
echo ""
echo "5. S3 Uploads Bucket"

# Get AWS Account ID and construct bucket name
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
EXPECTED_BUCKET_NAME="${ENVIRONMENT}-imobi-uploads-${AWS_ACCOUNT_ID}"

if aws s3 ls "s3://${EXPECTED_BUCKET_NAME}" --region $AWS_REGION &> /dev/null; then
  echo "   ✅ Bucket: $EXPECTED_BUCKET_NAME"
else
  echo "   ❌ Bucket not found: $EXPECTED_BUCKET_NAME"
  ERRORS=$((ERRORS + 1))
fi

# Check ECR Repositories
echo ""
echo "6. ECR Repositories"
DIRECTUS_ECR=$(aws ecr describe-repositories \
  --repository-names ${ENVIRONMENT}-imobi-directus \
  --region $AWS_REGION 2>/dev/null || echo "NOT_FOUND")

if [ "$DIRECTUS_ECR" != "NOT_FOUND" ]; then
  IMAGE_COUNT=$(aws ecr list-images \
    --repository-name ${ENVIRONMENT}-imobi-directus \
    --region $AWS_REGION \
    --query 'length(imageIds)' \
    --output text)
  echo "   ✅ Directus ECR: $IMAGE_COUNT images"
else
  echo "   ❌ Directus ECR not found"
  ERRORS=$((ERRORS + 1))
fi

FRONTEND_ECR=$(aws ecr describe-repositories \
  --repository-names ${ENVIRONMENT}-imobi-frontend \
  --region $AWS_REGION 2>/dev/null || echo "NOT_FOUND")

if [ "$FRONTEND_ECR" != "NOT_FOUND" ]; then
  IMAGE_COUNT=$(aws ecr list-images \
    --repository-name ${ENVIRONMENT}-imobi-frontend \
    --region $AWS_REGION \
    --query 'length(imageIds)' \
    --output text)
  echo "   ✅ Frontend ECR: $IMAGE_COUNT images"
else
  echo "   ❌ Frontend ECR not found"
  ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
  echo "✅ ALL CHECKS PASSED"
  exit 0
else
  echo "❌ FOUND $ERRORS ERROR(S)"
  echo ""
  echo "💡 For troubleshooting, see: AWS_TROUBLESHOOTING.md"
  exit 1
fi
