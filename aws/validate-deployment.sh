#!/bin/bash

# AWS Deployment Validation Script
# Purpose: Validate deployment before starting to avoid common issues
# Usage: ./validate-deployment.sh [environment] [region]

set -e

ENVIRONMENT=${1:-production}
AWS_REGION=${2:-sa-east-1}

echo "🔍 AWS Deployment Pre-flight Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"
echo ""

ERRORS=0
WARNINGS=0

# Check AWS CLI
echo "📋 Checking prerequisites..."
if ! command -v aws &> /dev/null; then
  echo "❌ AWS CLI not found. Install: https://aws.amazon.com/cli/"
  ERRORS=$((ERRORS + 1))
else
  AWS_VERSION=$(aws --version | awk '{print $1}' | cut -d'/' -f2)
  echo "✅ AWS CLI installed (version $AWS_VERSION)"
fi

# Check Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Docker not found. Install: https://docker.com/"
  ERRORS=$((ERRORS + 1))
else
  DOCKER_VERSION=$(docker --version | awk '{print $3}' | tr -d ',')
  echo "✅ Docker installed (version $DOCKER_VERSION)"
  
  # Check Docker daemon
  if ! docker ps &> /dev/null; then
    echo "❌ Docker daemon not running. Start Docker Desktop."
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ Docker daemon running"
  fi
fi

# Check jq
if ! command -v jq &> /dev/null; then
  echo "⚠️  jq not found (optional but recommended). Install: apt install jq / brew install jq"
  WARNINGS=$((WARNINGS + 1))
else
  echo "✅ jq installed"
fi

echo ""
echo "🔐 Checking AWS credentials..."

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
  echo "❌ AWS credentials not configured or invalid"
  echo "   Run: aws configure"
  ERRORS=$((ERRORS + 1))
else
  AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
  AWS_USER=$(aws sts get-caller-identity --query Arn --output text | cut -d'/' -f2)
  echo "✅ AWS credentials valid"
  echo "   Account: $AWS_ACCOUNT"
  echo "   User/Role: $AWS_USER"
fi

echo ""
echo "📂 Checking project structure..."

# Check CloudFormation template
if [ ! -f "cloudformation-unified.yaml" ]; then
  echo "❌ cloudformation-unified.yaml not found"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ CloudFormation template found"
  
  # Validate template
  if aws cloudformation validate-template --template-body file://cloudformation-unified.yaml --region $AWS_REGION &> /dev/null; then
    echo "✅ CloudFormation template is valid"
  else
    echo "❌ CloudFormation template validation failed"
    ERRORS=$((ERRORS + 1))
  fi
fi

# Check Dockerfiles
if [ ! -f "../directus/Dockerfile" ]; then
  echo "❌ directus/Dockerfile not found"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Directus Dockerfile found"
fi

if [ ! -f "../nextjs/Dockerfile" ]; then
  echo "❌ nextjs/Dockerfile not found"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Next.js Dockerfile found"
fi

echo ""
echo "☁️  Checking existing AWS resources..."

# Check for conflicting stacks
EXISTING_STACKS=$(aws cloudformation list-stacks \
  --region $AWS_REGION \
  --query "StackSummaries[?StackStatus!='DELETE_COMPLETE'].StackName" \
  --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_STACKS" ]; then
  echo "⚠️  Found existing CloudFormation stacks:"
  for stack in $EXISTING_STACKS; do
    STACK_STATUS=$(aws cloudformation describe-stacks \
      --stack-name $stack \
      --region $AWS_REGION \
      --query 'Stacks[0].StackStatus' \
      --output text 2>/dev/null)
    
    echo "   - $stack ($STACK_STATUS)"
    
    if [ "$STACK_STATUS" = "ROLLBACK_COMPLETE" ] || [ "$STACK_STATUS" = "CREATE_FAILED" ]; then
      echo "     ⚠️  Stack in failed state - run ./cleanup-failed-stacks.sh first"
      WARNINGS=$((WARNINGS + 1))
    fi
  done
else
  echo "✅ No existing stacks found (clean slate)"
fi

# Check for existing ECR repositories
DIRECTUS_ECR=$(aws ecr describe-repositories \
  --repository-names ${ENVIRONMENT}-imobi-directus \
  --region $AWS_REGION 2>/dev/null || echo "NOT_FOUND")

FRONTEND_ECR=$(aws ecr describe-repositories \
  --repository-names ${ENVIRONMENT}-imobi-frontend \
  --region $AWS_REGION 2>/dev/null || echo "NOT_FOUND")

if [ "$DIRECTUS_ECR" != "NOT_FOUND" ]; then
  echo "✅ ECR repository ${ENVIRONMENT}-imobi-directus already exists (will be reused)"
fi

if [ "$FRONTEND_ECR" != "NOT_FOUND" ]; then
  echo "✅ ECR repository ${ENVIRONMENT}-imobi-frontend already exists (will be reused)"
fi

echo ""
echo "💰 Estimating AWS costs..."
echo "   Monthly estimate (production):"
echo "   - RDS PostgreSQL (db.t3.small): ~$30"
echo "   - ECS Fargate (2 tasks): ~$15"
echo "   - Application Load Balancer: ~$20"
echo "   - S3 + ECR + CloudWatch: ~$8"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Total: ~$73/month"
echo ""
echo "   ⚠️  Costs may vary based on usage, region, and data transfer"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
  echo "✅ VALIDATION PASSED"
  echo ""
  echo "You're ready to deploy! Run:"
  echo "   ./deploy-unified.sh $ENVIRONMENT $AWS_REGION"
  echo ""
  
  if [ $WARNINGS -gt 0 ]; then
    echo "⚠️  $WARNINGS warning(s) found - review above"
  fi
  
  exit 0
else
  echo "❌ VALIDATION FAILED"
  echo ""
  echo "Found $ERRORS error(s) and $WARNINGS warning(s)"
  echo "Please fix the errors above before deploying"
  echo ""
  exit 1
fi
