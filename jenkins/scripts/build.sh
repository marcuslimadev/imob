#!/bin/bash
set -e

# Script de build Docker otimizado para Jenkins
# Uso: ./build.sh [image_tag]

IMAGE_TAG=${1:-latest}
ECR_REGISTRY="575098225472.dkr.ecr.sa-east-1.amazonaws.com"
ECR_REPOSITORY="imobi-frontend"

echo "🐳 Iniciando build Docker..."
echo "📦 Tag: ${IMAGE_TAG}"

cd ../nextjs

# Build com cache layers otimizado
docker build \
    -f Dockerfile.prod \
    -t ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG} \
    -t ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --cache-from ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest \
    .

echo "✅ Build concluído com sucesso!"
echo "📦 Imagens criadas:"
docker images ${ECR_REGISTRY}/${ECR_REPOSITORY} --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
