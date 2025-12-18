#!/bin/bash
set -e

# Script de health check
# Uso: ./health-check.sh [url]

URL=${1:-"https://lojadaesquina.store/home"}
MAX_RETRIES=5
RETRY_DELAY=10

echo "🏥 Verificando health da aplicação..."
echo "🌐 URL: ${URL}"

for i in $(seq 1 ${MAX_RETRIES}); do
    echo "📡 Tentativa ${i}/${MAX_RETRIES}..."
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" ${URL} || echo "000")
    
    if [ "${HTTP_CODE}" = "200" ]; then
        echo "✅ Health check passou! Status: ${HTTP_CODE}"
        exit 0
    else
        echo "⚠️  Status: ${HTTP_CODE} - Aguardando ${RETRY_DELAY}s..."
        sleep ${RETRY_DELAY}
    fi
done

echo "❌ Health check falhou após ${MAX_RETRIES} tentativas"
exit 1
