#!/bin/bash
set -e

# Script de push para ECR
# Uso: ./push.sh [image_tag]

IMAGE_TAG=${1:-latest}
ECR_REGISTRY="575098225472.dkr.ecr.sa-east-1.amazonaws.com"
ECR_REPOSITORY="imobi-frontend"
AWS_REGION="sa-east-1"

echo "📤 Fazendo push para ECR..."
echo "📦 Tag: ${IMAGE_TAG}"

# Login no ECR
echo "🔐 Autenticando no ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
    docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Push das imagens
echo "⬆️  Enviando imagem tagged..."
docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}

echo "⬆️  Enviando imagem latest..."
docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest

echo "✅ Push concluído com sucesso!"

# Verifica se a imagem está no ECR
echo "🔍 Verificando imagem no ECR..."
aws ecr describe-images \
    --repository-name ${ECR_REPOSITORY} \
    --region ${AWS_REGION} \
    --image-ids imageTag=${IMAGE_TAG} \
    --query 'imageDetails[0].[imageTags[0],imagePushedAt,imageSizeInBytes]' \
    --output table
