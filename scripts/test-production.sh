#!/bin/bash
# Testes E2E de Produção - Exclusiva Imóveis

set -e

echo "============================================"
echo "🧪 Testes E2E - Produção"
echo "============================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs
DIRECTUS_URL="https://directus.exclusivalarimoveis.com.br"
SITE_URL="https://exclusivalarimoveis.com.br"

# Contador de testes
TOTAL=0
PASSED=0
FAILED=0

# Função para testar endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=$3
    
    TOTAL=$((TOTAL + 1))
    echo -n "[$TOTAL] $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response" == "$expected_code" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected $expected_code, got $response)"
        FAILED=$((FAILED + 1))
    fi
}

# Função para testar JSON response
test_json_endpoint() {
    local name=$1
    local url=$2
    local expected_key=$3
    
    TOTAL=$((TOTAL + 1))
    echo -n "[$TOTAL] $name... "
    
    response=$(curl -s "$url")
    
    if echo "$response" | jq -e ".$expected_key" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC} (Key '$expected_key' not found)"
        FAILED=$((FAILED + 1))
        echo "   Response: $response"
    fi
}

# ============================================
# TESTES DE INFRAESTRUTURA
# ============================================
echo "🔧 Infraestrutura"
echo "----------------------------------------"

test_endpoint "Site HTTP → HTTPS redirect" "http://exclusivalarimoveis.com.br" "301"
test_endpoint "Site HTTPS carrega" "$SITE_URL" "200"
test_endpoint "WWW → non-WWW redirect" "https://www.exclusivalarimoveis.com.br" "301"
test_endpoint "Directus HTTP → HTTPS redirect" "http://directus.exclusivalarimoveis.com.br" "301"
test_endpoint "Directus HTTPS carrega" "$DIRECTUS_URL" "200"

echo ""

# ============================================
# TESTES DE API
# ============================================
echo "🔌 Directus API"
echo "----------------------------------------"

test_json_endpoint "Server info" "$DIRECTUS_URL/server/info" "project"
test_endpoint "Server health" "$DIRECTUS_URL/server/health" "200"
test_endpoint "Auth endpoint" "$DIRECTUS_URL/auth/login" "401"  # Esperado: não autenticado

echo ""

# ============================================
# TESTES DE NEXT.JS
# ============================================
echo "⚛️  Next.js"
echo "----------------------------------------"

test_endpoint "Página inicial" "$SITE_URL" "200"
test_endpoint "Login page" "$SITE_URL/login" "200"
test_endpoint "Favicon" "$SITE_URL/favicon.ico" "200"
test_endpoint "Robots.txt" "$SITE_URL/robots.txt" "200"

echo ""

# ============================================
# TESTES DE SSL
# ============================================
echo "🔒 SSL Certificates"
echo "----------------------------------------"

TOTAL=$((TOTAL + 1))
echo -n "[$TOTAL] Site SSL válido... "
ssl_output=$(echo | openssl s_client -connect exclusivalarimoveis.com.br:443 -servername exclusivalarimoveis.com.br 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED=$((PASSED + 1))
    echo "   $ssl_output" | sed 's/^/   /'
else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

TOTAL=$((TOTAL + 1))
echo -n "[$TOTAL] Directus SSL válido... "
ssl_output=$(echo | openssl s_client -connect directus.exclusivalarimoveis.com.br:443 -servername directus.exclusivalarimoveis.com.br 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED=$((PASSED + 1))
    echo "   $ssl_output" | sed 's/^/   /'
else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""

# ============================================
# TESTES DE DOCKER
# ============================================
echo "🐳 Docker Containers"
echo "----------------------------------------"

containers=("directus-db-prod" "directus-cache-prod" "directus-cms-prod")
for container in "${containers[@]}"; do
    TOTAL=$((TOTAL + 1))
    echo -n "[$TOTAL] Container $container... "
    
    if docker ps --filter "name=$container" --filter "status=running" | grep -q "$container"; then
        echo -e "${GREEN}✅ RUNNING${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ NOT RUNNING${NC}"
        FAILED=$((FAILED + 1))
    fi
done

echo ""

# ============================================
# TESTES DE PM2
# ============================================
echo "🚀 PM2 Processes"
echo "----------------------------------------"

TOTAL=$((TOTAL + 1))
echo -n "[$TOTAL] Next.js PM2 process... "

if pm2 jlist | jq -e '.[] | select(.name=="exclusiva-nextjs" and .pm2_env.status=="online")' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ONLINE${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ OFFLINE${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""

# ============================================
# TESTES MANUAIS (Instruções)
# ============================================
echo "📋 Testes Manuais Pendentes"
echo "----------------------------------------"
echo ""
echo -e "${YELLOW}Os seguintes testes devem ser feitos manualmente:${NC}"
echo ""
echo "  1. Acessar: $DIRECTUS_URL/admin"
echo "     → Fazer login com credenciais admin"
echo "     → Verificar collections (companies, properties, leads, etc.)"
echo ""
echo "  2. Acessar: $SITE_URL/login"
echo "     → Fazer login com usuário de teste"
echo "     → Verificar dashboard"
echo "     → Verificar módulos (Imóveis, Leads, Conversas)"
echo ""
echo "  3. WhatsApp - Enviar mensagem:"
echo "     → Acessar CRM → Conversas"
echo "     → Enviar mensagem de teste"
echo "     → Verificar se chegou no WhatsApp"
echo ""
echo "  4. WhatsApp - Receber mensagem:"
echo "     → Enviar WhatsApp para o número da Exclusiva"
echo "     → Verificar se aparece no CRM → Conversas"
echo ""
echo "  5. Imóveis no site público:"
echo "     → Acessar: $SITE_URL"
echo "     → Verificar se imóveis estão listados"
echo "     → Testar busca/filtros"
echo "     → Clicar em 'Ver Detalhes'"
echo ""
echo "  6. Botão WhatsApp no site:"
echo "     → Clicar no botão flutuante"
echo "     → Verificar se abre WhatsApp com mensagem padrão"
echo ""

# ============================================
# RESULTADO FINAL
# ============================================
echo ""
echo "============================================"
echo "📊 RESULTADO FINAL"
echo "============================================"
echo ""
echo "Total de testes:  $TOTAL"
echo -e "Passaram:         ${GREEN}$PASSED${NC}"
echo -e "Falharam:         ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ TODOS OS TESTES PASSARAM!${NC}"
    echo ""
    echo "Sistema pronto para uso em produção."
    exit 0
else
    echo -e "${RED}❌ $FAILED TESTE(S) FALHARAM!${NC}"
    echo ""
    echo "Revise os erros acima antes de liberar para produção."
    exit 1
fi
