#!/bin/bash

# IMOBI AWS Deployment Script
# Usage: ./deploy.sh [environment] [region]

set -e

ENVIRONMENT=${1:-production}
AWS_REGION=${2:-us-east-1}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "🚀 Deploying IMOBI to AWS"
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"
echo "Account: $AWS_ACCOUNT_ID"
echo ""

# Step 1: Create Infrastructure
echo "📦 Step 1: Creating Infrastructure with CloudFormation..."
aws cloudformation deploy \
  --template-file aws/cloudformation-infrastructure.yaml \
  --stack-name imobi-$ENVIRONMENT-infrastructure \
  --parameter-overrides EnvironmentName=$ENVIRONMENT \
  --capabilities CAPABILITY_IAM \
  --region $AWS_REGION

echo "✅ Infrastructure created"
echo ""

# Step 2: Build and Push Docker Images
echo "🐳 Step 2: Building and pushing Docker images..."

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push Directus
echo "Building Directus..."
docker build -t imobi-directus:latest -f directus/Dockerfile directus/
docker tag imobi-directus:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/imobi-directus:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/imobi-directus:latest

# Build and push Frontend
echo "Building Frontend..."
docker build -t imobi-frontend:latest -f nextjs/Dockerfile nextjs/
docker tag imobi-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/imobi-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/imobi-frontend:latest

echo "✅ Docker images pushed"
echo ""

# Step 3: Register Task Definitions
echo "📝 Step 3: Registering ECS Task Definitions..."

# Replace variables in task definitions
sed -e "s/\${AWS_ACCOUNT_ID}/$AWS_ACCOUNT_ID/g" \
    -e "s/\${AWS_REGION}/$AWS_REGION/g" \
    aws/task-definition-directus.json > /tmp/task-definition-directus.json

sed -e "s/\${AWS_ACCOUNT_ID}/$AWS_ACCOUNT_ID/g" \
    -e "s/\${AWS_REGION}/$AWS_REGION/g" \
    aws/task-definition-frontend.json > /tmp/task-definition-frontend.json

# Register task definitions
aws ecs register-task-definition \
  --cli-input-json file:///tmp/task-definition-directus.json \
  --region $AWS_REGION

aws ecs register-task-definition \
  --cli-input-json file:///tmp/task-definition-frontend.json \
  --region $AWS_REGION

echo "✅ Task definitions registered"
echo ""

# Step 4: Create ECS Services
echo "🎯 Step 4: Creating ECS Services..."

# Get VPC and Subnet info
VPC_ID=$(aws cloudformation describe-stacks \
  --stack-name imobi-$ENVIRONMENT-infrastructure \
  --query "Stacks[0].Outputs[?OutputKey=='VPCId'].OutputValue" \
  --output text \
  --region $AWS_REGION)

SUBNET_1=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=$ENVIRONMENT-imobi-public-1" \
  --query "Subnets[0].SubnetId" \
  --output text \
  --region $AWS_REGION)

SUBNET_2=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=$ENVIRONMENT-imobi-public-2" \
  --query "Subnets[0].SubnetId" \
  --output text \
  --region $AWS_REGION)

SECURITY_GROUP=$(aws ec2 describe-security-groups \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=$ENVIRONMENT-imobi-ecs-sg" \
  --query "SecurityGroups[0].GroupId" \
  --output text \
  --region $AWS_REGION)

TARGET_GROUP_DIRECTUS=$(aws cloudformation describe-stacks \
  --stack-name imobi-$ENVIRONMENT-infrastructure \
  --query "Stacks[0].Outputs[?OutputKey=='DirectusTargetGroup'].OutputValue" \
  --output text \
  --region $AWS_REGION)

TARGET_GROUP_FRONTEND=$(aws cloudformation describe-stacks \
  --stack-name imobi-$ENVIRONMENT-infrastructure \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendTargetGroup'].OutputValue" \
  --output text \
  --region $AWS_REGION)

# Create Directus Service
aws ecs create-service \
  --cluster $ENVIRONMENT-imobi-cluster \
  --service-name directus \
  --task-definition imobi-directus \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$SECURITY_GROUP],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$TARGET_GROUP_DIRECTUS,containerName=directus,containerPort=8055" \
  --region $AWS_REGION \
  || echo "Service already exists, updating..."

# Create Frontend Service
aws ecs create-service \
  --cluster $ENVIRONMENT-imobi-cluster \
  --service-name frontend \
  --task-definition imobi-frontend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$SECURITY_GROUP],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$TARGET_GROUP_FRONTEND,containerName=frontend,containerPort=3000" \
  --region $AWS_REGION \
  || echo "Service already exists, updating..."

echo "✅ ECS Services created"
echo ""

# Get ALB DNS
ALB_DNS=$(aws cloudformation describe-stacks \
  --stack-name imobi-$ENVIRONMENT-infrastructure \
  --query "Stacks[0].Outputs[?OutputKey=='ALBDNSName'].OutputValue" \
  --output text \
  --region $AWS_REGION)

echo "🎉 Deployment Complete!"
echo ""
echo "📱 Access your application at:"
echo "   Frontend: http://$ALB_DNS"
echo "   Directus: http://$ALB_DNS/admin"
echo "   API: http://$ALB_DNS/api"
echo ""
echo "⏱️  Note: It may take 2-3 minutes for the services to become healthy"
