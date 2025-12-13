#!/bin/bash

# AWS CloudFormation Cleanup Script
# Purpose: Delete failed stacks to prepare for fresh deployment
# Usage: ./cleanup-failed-stacks.sh [region]

set -e

AWS_REGION=${1:-sa-east-1}

echo "🧹 AWS CloudFormation Stack Cleanup"
echo "Region: $AWS_REGION"
echo ""

# List all stacks and their status
echo "📋 Current stacks:"
aws cloudformation list-stacks \
  --region $AWS_REGION \
  --query "StackSummaries[?StackStatus!='DELETE_COMPLETE'].[StackName,StackStatus]" \
  --output table

echo ""
echo "⚠️  WARNING: This script will delete FAILED stacks only (ROLLBACK_COMPLETE, CREATE_FAILED, etc.)"
echo ""

# Check for imobi-rds stack in ROLLBACK_COMPLETE state
IMOBI_RDS_STATUS=$(aws cloudformation describe-stacks \
  --stack-name imobi-rds \
  --region $AWS_REGION \
  --query "Stacks[0].StackStatus" \
  --output text 2>/dev/null || echo "DOES_NOT_EXIST")

if [ "$IMOBI_RDS_STATUS" = "ROLLBACK_COMPLETE" ]; then
  echo "🗑️  Deleting failed stack: imobi-rds"
  aws cloudformation delete-stack \
    --stack-name imobi-rds \
    --region $AWS_REGION
  
  echo "⏳ Waiting for stack deletion to complete..."
  aws cloudformation wait stack-delete-complete \
    --stack-name imobi-rds \
    --region $AWS_REGION
  
  echo "✅ Stack imobi-rds deleted successfully"
else
  echo "ℹ️  Stack imobi-rds status: $IMOBI_RDS_STATUS (no action needed)"
fi

echo ""
echo "🔍 Final stack status:"
aws cloudformation list-stacks \
  --region $AWS_REGION \
  --query "StackSummaries[?StackStatus!='DELETE_COMPLETE'].[StackName,StackStatus]" \
  --output table

echo ""
echo "✅ Cleanup complete! You can now deploy fresh stacks."
echo ""
echo "💡 Next steps:"
echo "   1. Review the existing imobi-production-simple stack"
echo "   2. Use the unified deployment script: ./deploy-unified.sh"
echo ""
