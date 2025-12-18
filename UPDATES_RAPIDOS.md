# 🚀 GUIA DE UPDATES RÁPIDOS (SEM REBUILD)

**Problema:** Builds Docker completos levam 2-3 minutos. Para mudanças simples (logos, textos, configs), isso é inaceitável.

---

## ✅ SOLUÇÃO 1: Assets Dinâmicos via Directus (RECOMENDADO)

### Logos, Imagens, PDFs
Todos os assets visuais devem estar no **Directus**, não no build do Next.js.

**Como fazer:**

1. **Upload via Interface Web:**
   ```
   https://lojadaesquina.store/admin
   Login: admin@imobi.com / senha configurada
   
   Content > Files > Upload
   ```

2. **Upload via API (automatizado):**
   ```powershell
   # PowerShell
   $file = "d:\Saas\imob\logo.png"
   
   curl.exe -X POST "https://lojadaesquina.store/files" `
     -H "Authorization: Bearer admin-static-token-imobi-2025" `
     -F "file=@$file"
   ```

3. **Usar no Frontend:**
   ```tsx
   // O sistema já está configurado!
   const logoUrl = `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${globals.logo}`;
   ```

**Vantagens:**
- ✅ Mudança instantânea (0 segundos)
- ✅ Sem rebuild necessário
- ✅ Versionamento automático (Directus)
- ✅ CDN-ready

---

## ✅ SOLUÇÃO 2: Variáveis de Ambiente

### Textos, URLs, Configurações
Use **variáveis de ambiente** no ECS Task Definition.

**Como fazer:**

1. **Editar Task Definition:**
   ```powershell
   # Baixar task definition atual
   aws ecs describe-task-definition --task-definition imobi-frontend:9 `
     --region sa-east-1 > task-def.json
   
   # Editar environment variables no JSON
   # Registrar nova versão
   aws ecs register-task-definition --cli-input-json file://task-def.json
   
   # Update service (sem rebuild!)
   aws ecs update-service --cluster production-imobi-cluster `
     --service production-imobi-frontend `
     --task-definition imobi-frontend:10 `
     --force-new-deployment
   ```

2. **Exemplos de ENV vars úteis:**
   ```json
   {
     "name": "SITE_NAME",
     "value": "iMOBI - Gestão Imobiliária"
   },
   {
     "name": "LOGO_URL",
     "value": "https://lojadaesquina.store/assets/abc123"
   },
   {
     "name": "PRIMARY_COLOR",
     "value": "#e63946"
   }
   ```

**Vantagens:**
- ✅ Update em 30 segundos (só restart container)
- ✅ Sem rebuild
- ✅ Versionamento (task definitions)

---

## ✅ SOLUÇÃO 3: Hot Reload em Dev (Desenvolvimento Local)

### Para testes rápidos localmente
```powershell
cd d:\Saas\imob\nextjs
pnpm dev
```

**Acesse:** http://localhost:3000

- ✅ Hot reload automático
- ✅ Mudanças instantâneas
- ✅ Teste logo, cores, textos sem deploy

---

## ❌ EVITE: Rebuild Completo para Mudanças Simples

**NÃO FAÇA ISSO para logos/textos/configs:**
```powershell
# ❌ LENTO (2-3 minutos)
docker build -f Dockerfile.prod -t frontend:latest .
docker push ...
aws ecs update-service --force-new-deployment
```

**FAÇA ISSO:**
```powershell
# ✅ RÁPIDO (10 segundos)
# 1. Upload logo para Directus (uma vez)
# 2. Update globals no Directus admin
# 3. Pronto! Mudança refletida instantaneamente
```

---

## 📋 CHECKLIST: Quando Fazer Rebuild?

**✅ REBUILD NECESSÁRIO:**
- [ ] Mudança de código TypeScript/JSX
- [ ] Nova dependência (npm install)
- [ ] Mudança de estrutura de rotas
- [ ] Alteração de next.config.js
- [ ] Nova feature/componente

**❌ REBUILD NÃO NECESSÁRIO:**
- [ ] Trocar logo ➜ Use Directus
- [ ] Mudar texto ➜ Use Directus (i18n) ou env vars
- [ ] Alterar cor tema ➜ Use CSS variables + Directus
- [ ] Configurar domínio ➜ Cloudflare/Route53
- [ ] Ajustar health check ➜ ALB Target Group

---

## 🎯 EXEMPLO PRÁTICO: Trocar Logo (10 segundos)

### Passo 1: Upload para Directus (CLI)
```powershell
# Windows PowerShell
$env:DIRECTUS_TOKEN = "admin-static-token-imobi-2025"
$env:DIRECTUS_URL = "https://lojadaesquina.store"

# Upload
curl.exe -X POST "$env:DIRECTUS_URL/files" `
  -H "Authorization: Bearer $env:DIRECTUS_TOKEN" `
  -F "file=@d:\Saas\imob\logo.png"

# Copie o "id" retornado, ex: "abc-123-def"
```

### Passo 2: Atualizar Globals
```powershell
# Opção A: Via Admin UI
# Acesse https://lojadaesquina.store/admin
# Settings > Global > Logo > Selecione o arquivo

# Opção B: Via API
curl.exe -X PATCH "$env:DIRECTUS_URL/items/globals/1" `
  -H "Authorization: Bearer $env:DIRECTUS_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"logo": "abc-123-def"}'
```

### Passo 3: Pronto! ✅
Acesse o site: https://lojadaesquina.store
**Logo atualizado instantaneamente, sem rebuild!**

---

## 🔧 TROUBLESHOOTING

### "Logo não aparece após update"
1. Limpe cache do browser (Ctrl+Shift+R)
2. Verifique se o logo está público no Directus
3. Confirme URL: `https://lojadaesquina.store/assets/{file_id}`

### "Env var não atualiza"
1. Confirme task definition nova foi criada
2. Force new deployment: `aws ecs update-service ... --force-new-deployment`
3. Aguarde task antiga ser substituída (~30s)

---

## 📞 CONTATO RÁPIDO

**Backend Directus Admin:** https://lojadaesquina.store/admin
**User:** admin@imobi.com
**Token API:** admin-static-token-imobi-2025

**AWS ECS:**
- Cluster: production-imobi-cluster
- Service: production-imobi-frontend
- Region: sa-east-1
