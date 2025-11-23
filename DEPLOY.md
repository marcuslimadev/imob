# 🚀 Deploy IMOBI na Render

## 📋 Pré-requisitos

- Conta no [Render](https://render.com)
- Repositório GitHub conectado
- Plano Starter ($7/mês por serviço)

## 🎯 Opções de Deploy

### Opção 1: Deploy Automático via Blueprint (Recomendado)

1. **Conectar Repositório no Render**
   - Acesse: https://dashboard.render.com
   - Clique em "New +" → "Blueprint"
   - Selecione o repositório `marcuslimadev/imob`
   - Branch: `main`

2. **Render detectará `render.yaml` automaticamente**
   - Criará 4 serviços:
     - PostgreSQL (imobi-postgres)
     - Redis (imobi-redis)
     - Directus (imobi-directus)
     - Next.js Frontend (imobi-frontend)

3. **Aguardar Deploy**
   - Primeiro: PostgreSQL e Redis (~3 min)
   - Depois: Directus (~5 min)
   - Por último: Frontend (~4 min)
   - **Total: ~12 minutos**

4. **Acessar Aplicação**
   - Directus: `https://imobi-directus.onrender.com`
   - Frontend: `https://imobi-frontend.onrender.com`

### Opção 2: Deploy Manual (Passo a Passo)

#### 1. Criar PostgreSQL
```
Name: imobi-postgres
Plan: Starter ($7/mês)
Region: Oregon
Database: directus
User: directus
```

#### 2. Criar Redis
```
Name: imobi-redis
Plan: Starter ($7/mês)
Region: Oregon
Maxmemory Policy: allkeys-lru
```

#### 3. Criar Directus Web Service
```
Name: imobi-directus
Environment: Docker
Region: Oregon
Branch: main
Dockerfile Path: ./directus/Dockerfile

Environment Variables:
- SECRET: [Generate]
- DB_CLIENT: pg
- DB_HOST: [Internal PostgreSQL Host]
- DB_PORT: 5432
- DB_DATABASE: directus
- DB_USER: directus
- DB_PASSWORD: [PostgreSQL Password]
- CACHE_ENABLED: true
- CACHE_STORE: redis
- REDIS: [Internal Redis URL]
- ADMIN_EMAIL: marcus@admin.com
- ADMIN_PASSWORD: Teste@123
- WEBSOCKETS_ENABLED: true
- PUBLIC_URL: https://imobi-directus.onrender.com
- CORS_ENABLED: true
- CORS_ORIGIN: *

Health Check Path: /server/health
```

#### 4. Criar Frontend Next.js
```
Name: imobi-frontend
Environment: Node
Region: Oregon
Branch: main
Build Command: cd nextjs && npm install && npm run build
Start Command: cd nextjs && npm start

Environment Variables:
- NEXT_PUBLIC_API_URL: https://imobi-directus.onrender.com
- NODE_ENV: production
```

## 💰 Custos Estimados

### Plano Starter (Recomendado para MVP)
- PostgreSQL: $7/mês
- Redis: $7/mês
- Directus: $7/mês
- Frontend: $7/mês
- **Total: $28/mês (~R$ 140/mês)**

### Plano Free (Limitado - Para Testes)
- PostgreSQL: Free (expira em 90 dias)
- Redis: Free (25MB)
- Directus: Free (750h/mês, sleep após inatividade)
- Frontend: Free (750h/mês, sleep após inatividade)
- **Total: $0/mês** ⚠️ Com limitações

## ⚡ Performance

### Plano Starter
- **CPU:** 0.5 vCPU
- **RAM:** 512 MB
- **Bandwidth:** 100 GB/mês
- **Uptime:** 99.9%
- **Sleep:** Nunca
- **Build Minutes:** 500/mês

### Plano Free
- **CPU:** 0.1 vCPU
- **RAM:** 512 MB
- **Bandwidth:** 100 GB/mês
- **Sleep:** Após 15 min de inatividade
- **Build Minutes:** 500/mês

## 🔒 Segurança

### Após Deploy:

1. **Atualizar Senha Admin**
   ```
   Acessar: https://imobi-directus.onrender.com
   Login: marcus@admin.com
   Trocar senha padrão
   ```

2. **Configurar CORS**
   - Atualizar `CORS_ORIGIN` com domínio do frontend
   - Remover wildcard `*` em produção

3. **Adicionar Domínio Customizado** (Opcional)
   - Render Settings → Custom Domain
   - Adicionar: `api.imobi.com.br`
   - Configurar DNS CNAME

## 📊 Monitoramento

### Métricas Disponíveis
- CPU Usage
- Memory Usage
- Response Time
- Request Rate
- Error Rate

### Logs
```bash
# Via Render Dashboard
Services → [Nome do Serviço] → Logs

# Ou via CLI
render logs -s imobi-directus
```

## 🔄 CI/CD Automático

Render faz deploy automático quando:
- Push para branch `main`
- Merge de pull request
- Detecção de mudanças em `render.yaml`

## 🐛 Troubleshooting

### Directus não inicia
```bash
# Verificar variáveis de ambiente
# Verificar conexão com PostgreSQL
# Checar logs: "Database connection failed"
```

### Frontend não conecta ao Directus
```bash
# Verificar NEXT_PUBLIC_API_URL
# Verificar CORS_ORIGIN no Directus
# Testar API: curl https://imobi-directus.onrender.com/server/health
```

### PostgreSQL sem espaço
```bash
# Upgrade para plano maior
# Limpar dados antigos
# Otimizar queries
```

## 🎯 Próximos Passos Após Deploy

1. ✅ Verificar health checks
2. ✅ Testar login no Directus
3. ✅ Conferir collections criadas
4. ✅ Testar API endpoints
5. ✅ Acessar frontend
6. ✅ Configurar domínio customizado
7. ✅ Configurar SSL (automático no Render)
8. ✅ Montar backup automático do PostgreSQL

## 📱 URLs Após Deploy

- **Directus Admin:** https://imobi-directus.onrender.com
- **API REST:** https://imobi-directus.onrender.com/items/[collection]
- **GraphQL:** https://imobi-directus.onrender.com/graphql
- **Frontend:** https://imobi-frontend.onrender.com

## 🔐 Credenciais Iniciais

```
Email: marcus@admin.com
Senha: Teste@123

⚠️ TROCAR IMEDIATAMENTE APÓS PRIMEIRO ACESSO!
```

---

**Tempo estimado de deploy:** 15-20 minutos  
**Custo mensal (Starter):** $28/mês  
**Uptime esperado:** 99.9%
