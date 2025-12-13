#!/bin/bash

# iMOBI Docker Build and Push Script
# Purpose: Build and push Docker images to ECR
# Usage: ./build-and-push.sh [environment] [region]

set -e

ENVIRONMENT=${1:-production}
AWS_REGION=${2:-sa-east-1}

echo "🐳 iMOBI Docker Build & Push"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"
echo ""

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "AWS Account: $AWS_ACCOUNT_ID"
echo "ECR Registry: $ECR_REGISTRY"
echo ""

# Login to ECR
echo "🔐 Step 1: Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_REGISTRY
echo "✅ Logged in to ECR"
echo ""

# Build and push Directus
echo "📦 Step 2: Building Directus image..."
cd ../directus

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
  echo "❌ Error: Dockerfile not found in directus/"
  exit 1
fi

docker build -t ${ENVIRONMENT}-imobi-directus:latest .
docker tag ${ENVIRONMENT}-imobi-directus:latest \
  ${ECR_REGISTRY}/${ENVIRONMENT}-imobi-directus:latest
docker tag ${ENVIRONMENT}-imobi-directus:latest \
  ${ECR_REGISTRY}/${ENVIRONMENT}-imobi-directus:$(date +%Y%m%d-%H%M%S)

echo "✅ Directus image built"
echo ""

echo "⬆️  Step 3: Pushing Directus to ECR..."
docker push ${ECR_REGISTRY}/${ENVIRONMENT}-imobi-directus:latest
docker push ${ECR_REGISTRY}/${ENVIRONMENT}-imobi-directus:$(date +%Y%m%d-%H%M%S)
echo "✅ Directus image pushed"
echo ""

# Build and push Frontend
echo "📦 Step 4: Building Frontend image..."
cd ../nextjs

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
  echo "❌ Error: Dockerfile not found in nextjs/"
  exit 1
fi

docker build -t ${ENVIRONMENT}-imobi-frontend:latest .
docker tag ${ENVIRONMENT}-imobi-frontend:latest \
  ${ECR_REGISTRY}/${ENVIRONMENT}-imobi-frontend:latest
docker tag ${ENVIRONMENT}-imobi-frontend:latest \
  ${ECR_REGISTRY}/${ENVIRONMENT}-imobi-frontend:$(date +%Y%m%d-%H%M%S)

echo "✅ Frontend image built"
echo ""

echo "⬆️  Step 5: Pushing Frontend to ECR..."
docker push ${ECR_REGISTRY}/${ENVIRONMENT}-imobi-frontend:latest
docker push ${ECR_REGISTRY}/${ENVIRONMENT}-imobi-frontend:$(date +%Y%m%d-%H%M%S)
echo "✅ Frontend image pushed"
echo ""

cd ../aws

# List images in ECR
echo "📋 ECR Image Summary:"
echo ""
echo "Directus images:"
aws ecr list-images \
  --repository-name ${ENVIRONMENT}-imobi-directus \
  --region $AWS_REGION \
  --query 'imageIds[*].imageTag' \
  --output table

echo ""
echo "Frontend images:"
aws ecr list-images \
  --repository-name ${ENVIRONMENT}-imobi-frontend \
  --region $AWS_REGION \
  --query 'imageIds[*].imageTag' \
  --output table

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ BUILD & PUSH COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo "   1. Register ECS task definitions:"
echo "      ./deploy-services.sh $ENVIRONMENT $AWS_REGION"
echo ""
echo "   2. Monitor deployment:"
echo "      aws ecs list-services --cluster ${ENVIRONMENT}-imobi-cluster --region $AWS_REGION"
echo ""
