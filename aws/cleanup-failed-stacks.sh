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

# Get all failed stacks
FAILED_STACKS=$(aws cloudformation list-stacks \
  --region $AWS_REGION \
  --query "StackSummaries[?StackStatus=='ROLLBACK_COMPLETE' || StackStatus=='CREATE_FAILED' || StackStatus=='UPDATE_ROLLBACK_COMPLETE'].StackName" \
  --output text)

if [ -z "$FAILED_STACKS" ]; then
  echo "✅ No failed stacks found. Nothing to clean up!"
else
  echo "Found failed stacks to delete:"
  for stack in $FAILED_STACKS; do
    echo "   - $stack"
  done
  echo ""
  
  read -p "Delete these stacks? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    for stack in $FAILED_STACKS; do
      echo "🗑️  Deleting stack: $stack"
      aws cloudformation delete-stack \
        --stack-name $stack \
        --region $AWS_REGION
      
      echo "⏳ Waiting for stack deletion to complete..."
      aws cloudformation wait stack-delete-complete \
        --stack-name $stack \
        --region $AWS_REGION || echo "⚠️  Timeout or error waiting for $stack deletion"
      
      echo "✅ Stack $stack deleted"
      echo ""
    done
  else
    echo "❌ Cleanup cancelled by user"
    exit 1
  fi
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
