#!/bin/bash
set -e

# Script de rollback ECS
# Uso: ./rollback.sh [task_definition_arn]

ECS_CLUSTER="production-imobi-cluster"
ECS_SERVICE="production-imobi-frontend"
AWS_REGION="sa-east-1"

TASK_DEF_ARN=${1}

if [ -z "${TASK_DEF_ARN}" ]; then
    # Tenta ler do arquivo salvo
    if [ -f /tmp/previous_task_def.txt ]; then
        TASK_DEF_ARN=$(cat /tmp/previous_task_def.txt)
    else
        echo "❌ Erro: Task definition ARN não fornecida"
        echo "Uso: ./rollback.sh <task_definition_arn>"
        exit 1
    fi
fi

echo "🔄 Iniciando rollback..."
echo "📝 Task definition: ${TASK_DEF_ARN}"

# Update service para a task definition anterior
aws ecs update-service \
    --cluster ${ECS_CLUSTER} \
    --service ${ECS_SERVICE} \
    --task-definition ${TASK_DEF_ARN} \
    --force-new-deployment \
    --region ${AWS_REGION}

echo "⏳ Aguardando rollback estabilizar..."
aws ecs wait services-stable \
    --cluster ${ECS_CLUSTER} \
    --services ${ECS_SERVICE} \
    --region ${AWS_REGION}

echo "✅ Rollback concluído!"
