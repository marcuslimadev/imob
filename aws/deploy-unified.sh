#!/bin/bash

# iMOBI Unified AWS Deployment Script
# Purpose: Deploy complete infrastructure without resource conflicts
# Usage: ./deploy-unified.sh [environment] [region]

set -e

ENVIRONMENT=${1:-production}
AWS_REGION=${2:-sa-east-1}
STACK_NAME="${ENVIRONMENT}-imobi-unified"

echo "🚀 iMOBI Unified AWS Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"
echo "Stack Name: $STACK_NAME"
echo ""

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account: $AWS_ACCOUNT_ID"
echo ""

# Validate CloudFormation template
echo "🔍 Step 1: Validating CloudFormation template..."
aws cloudformation validate-template \
  --template-body file://cloudformation-unified.yaml \
  --region $AWS_REGION > /dev/null
echo "✅ Template is valid"
echo ""

# Check if stack already exists
STACK_EXISTS=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $AWS_REGION \
  --query "Stacks[0].StackName" \
  --output text 2>/dev/null || echo "DOES_NOT_EXIST")

if [ "$STACK_EXISTS" != "DOES_NOT_EXIST" ]; then
  echo "ℹ️  Stack $STACK_NAME already exists. This will UPDATE the stack."
  read -p "   Continue? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
  fi
fi

# Prompt for database password
echo "🔑 Database Password Configuration:"
echo "   For production, use a strong password (min 8 chars)"
echo "   For dev/testing, you can use the default"
echo ""
read -sp "Enter RDS PostgreSQL password (or press Enter for default): " DB_PASSWORD
echo
if [ -z "$DB_PASSWORD" ]; then
  DB_PASSWORD="iMobiSecurePass2025!"
  echo "⚠️  Using default password (change this in production!)"
fi

# Deploy CloudFormation stack
echo ""
echo "📦 Step 2: Deploying CloudFormation stack..."
echo "   This may take 10-15 minutes (RDS creation is slow)"
echo ""

aws cloudformation deploy \
  --template-file cloudformation-unified.yaml \
  --stack-name $STACK_NAME \
  --parameter-overrides \
    Environment=$ENVIRONMENT \
    DBPassword=$DB_PASSWORD \
  --capabilities CAPABILITY_NAMED_IAM \
  --region $AWS_REGION

echo ""
echo "✅ Infrastructure deployed successfully!"
echo ""

# Get stack outputs
echo "📋 Step 3: Retrieving stack outputs..."
OUTPUTS=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $AWS_REGION \
  --query "Stacks[0].Outputs" \
  --output json)

ALB_DNS=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="ALBDNSName") | .OutputValue')
RDS_ENDPOINT=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="RDSEndpoint") | .OutputValue')
ECS_CLUSTER=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="ECSClusterName") | .OutputValue')
S3_BUCKET=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="UploadsBucketName") | .OutputValue')
TASK_ROLE_ARN=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="TaskExecutionRoleArn") | .OutputValue')

echo "✅ Outputs retrieved"
echo ""

# Create ECR repositories if they don't exist
echo "🐳 Step 4: Ensuring ECR repositories exist..."

# Check and create Directus ECR
DIRECTUS_ECR_EXISTS=$(aws ecr describe-repositories \
  --repository-names ${ENVIRONMENT}-imobi-directus \
  --region $AWS_REGION 2>/dev/null || echo "DOES_NOT_EXIST")

if [ "$DIRECTUS_ECR_EXISTS" = "DOES_NOT_EXIST" ]; then
  echo "   Creating Directus ECR repository..."
  aws ecr create-repository \
    --repository-name ${ENVIRONMENT}-imobi-directus \
    --image-scanning-configuration scanOnPush=true \
    --region $AWS_REGION > /dev/null
  echo "   ✅ Created ${ENVIRONMENT}-imobi-directus"
else
  echo "   ✅ ${ENVIRONMENT}-imobi-directus already exists"
fi

# Check and create Frontend ECR
FRONTEND_ECR_EXISTS=$(aws ecr describe-repositories \
  --repository-names ${ENVIRONMENT}-imobi-frontend \
  --region $AWS_REGION 2>/dev/null || echo "DOES_NOT_EXIST")

if [ "$FRONTEND_ECR_EXISTS" = "DOES_NOT_EXIST" ]; then
  echo "   Creating Frontend ECR repository..."
  aws ecr create-repository \
    --repository-name ${ENVIRONMENT}-imobi-frontend \
    --image-scanning-configuration scanOnPush=true \
    --region $AWS_REGION > /dev/null
  echo "   ✅ Created ${ENVIRONMENT}-imobi-frontend"
else
  echo "   ✅ ${ENVIRONMENT}-imobi-frontend already exists"
fi

echo ""

# Save deployment info
echo "💾 Step 5: Saving deployment configuration..."
cat > deployment-info.json << EOF
{
  "environment": "$ENVIRONMENT",
  "region": "$AWS_REGION",
  "stackName": "$STACK_NAME",
  "accountId": "$AWS_ACCOUNT_ID",
  "albDNS": "$ALB_DNS",
  "rdsEndpoint": "$RDS_ENDPOINT",
  "ecsCluster": "$ECS_CLUSTER",
  "s3Bucket": "$S3_BUCKET",
  "taskExecutionRoleArn": "$TASK_ROLE_ARN",
  "directusECR": "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ENVIRONMENT}-imobi-directus",
  "frontendECR": "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ENVIRONMENT}-imobi-frontend",
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo "✅ Configuration saved to deployment-info.json"
echo ""

# Display summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Infrastructure Details:"
echo "   Environment:    $ENVIRONMENT"
echo "   Stack Name:     $STACK_NAME"
echo "   Region:         $AWS_REGION"
echo ""
echo "📡 Endpoints:"
echo "   Load Balancer:  http://$ALB_DNS"
echo "   Frontend:       http://$ALB_DNS"
echo "   Directus Admin: http://$ALB_DNS/admin"
echo ""
echo "💾 Database:"
echo "   Endpoint:       $RDS_ENDPOINT:5432"
echo "   Database:       imobi"
echo "   Username:       imobi_admin"
echo "   Password:       [hidden - you entered it during deployment]"
echo ""
echo "☁️  Resources:"
echo "   ECS Cluster:    $ECS_CLUSTER"
echo "   S3 Bucket:      $S3_BUCKET"
echo "   Directus ECR:   ${ENVIRONMENT}-imobi-directus"
echo "   Frontend ECR:   ${ENVIRONMENT}-imobi-frontend"
echo ""
echo "📋 Next Steps:"
echo "   1. Build and push Docker images:"
echo "      ./build-and-push.sh $ENVIRONMENT $AWS_REGION"
echo ""
echo "   2. Deploy ECS services:"
echo "      ./deploy-services.sh $ENVIRONMENT $AWS_REGION"
echo ""
echo "   3. Configure DNS to point to: $ALB_DNS"
echo ""
echo "📖 For troubleshooting, see: AWS_TROUBLESHOOTING.md"
echo ""
