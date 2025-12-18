#!/bin/bash
set -e

# Script de deploy no ECS
# Uso: ./deploy.sh

ECS_CLUSTER="production-imobi-cluster"
ECS_SERVICE="production-imobi-frontend"
AWS_REGION="sa-east-1"

echo "🚀 Iniciando deploy no ECS..."
echo "🎯 Cluster: ${ECS_CLUSTER}"
echo "🎯 Service: ${ECS_SERVICE}"

# Salva a task definition atual para rollback
echo "💾 Salvando task definition atual..."
PREVIOUS_TASK_DEF=$(aws ecs describe-services \
    --cluster ${ECS_CLUSTER} \
    --services ${ECS_SERVICE} \
    --region ${AWS_REGION} \
    --query 'services[0].taskDefinition' \
    --output text)

echo "📝 Task definition anterior: ${PREVIOUS_TASK_DEF}"
echo "${PREVIOUS_TASK_DEF}" > /tmp/previous_task_def.txt

# Force new deployment
echo "🔄 Forçando novo deployment..."
aws ecs update-service \
    --cluster ${ECS_CLUSTER} \
    --service ${ECS_SERVICE} \
    --force-new-deployment \
    --region ${AWS_REGION} \
    --query 'service.[serviceName,desiredCount,runningCount,deployments[0].status]' \
    --output table

# Aguarda estabilização
echo "⏳ Aguardando deployment estabilizar (até 10 minutos)..."
aws ecs wait services-stable \
    --cluster ${ECS_CLUSTER} \
    --services ${ECS_SERVICE} \
    --region ${AWS_REGION}

echo "✅ Deploy concluído com sucesso!"

# Mostra status final
echo "📊 Status do serviço:"
aws ecs describe-services \
    --cluster ${ECS_CLUSTER} \
    --services ${ECS_SERVICE} \
    --region ${AWS_REGION} \
    --query 'services[0].[serviceName,status,desiredCount,runningCount,deployments[0].rolloutState]' \
    --output table
