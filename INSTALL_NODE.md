# 📦 Instalação do Node.js e PNPM

## ⚠️ Node.js não detectado no sistema

Para executar o Next.js, você precisa instalar o Node.js primeiro.

## 🚀 Instalação Rápida

### Opção 1: Instalador Oficial (Recomendado)

1. **Download Node.js LTS:**
   - Acesse: https://nodejs.org/
   - Baixe versão **LTS (Long Term Support)** - atualmente v20.x ou v22.x
   - Execute o instalador `.msi`

2. **Durante instalação:**
   - ✅ Marcar "Automatically install necessary tools"
   - ✅ Adicionar ao PATH (já vem marcado por padrão)

3. **Verificar instalação:**
   ```powershell
   node --version   # Deve mostrar v20.x.x ou v22.x.x
   npm --version    # Deve mostrar 10.x.x
   ```

4. **Instalar PNPM:**
   ```powershell
   npm install -g pnpm
   pnpm --version   # Deve mostrar 9.x.x
   ```

### Opção 2: Via Chocolatey (Se já usa)

```powershell
choco install nodejs-lts -y
npm install -g pnpm
```

### Opção 3: Via Scoop (Se já usa)

```powershell
scoop install nodejs-lts
npm install -g pnpm
```

## 📝 Após Instalação

1. **Fechar e reabrir PowerShell** (para PATH atualizar)

2. **Instalar dependências do projeto:**
   ```powershell
   cd d:\IMob\nextjs
   pnpm install
   ```

3. **Iniciar servidor:**
   ```powershell
   pnpm dev
   ```

4. **Acessar aplicação:**
   - URL: http://localhost:4000

## 🧪 Testes Disponíveis SEM Next.js

Enquanto não instala Node.js, você pode testar:

### ✅ Backend Directus (Já funcionando!)

- **Admin UI:** http://localhost:8055/admin
  - Login: marcus@admin.com
  - Senha: Teste@123

- **Verificar permissões aplicadas:**
  - Settings → Roles & Permissions → Company Admin
  - Deve mostrar 37 permissões configuradas

### ✅ Testar Endpoints Diretamente

```powershell
# Teste 1: Login
$body = @{
    email = "marcus@admin.com"
    password = "Teste@123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8055/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$token = $response.data.access_token
Write-Host "Token: $token"

# Teste 2: Listar companies
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8055/items/companies" `
    -Method GET `
    -Headers $headers

# Teste 3: Listar properties
Invoke-RestMethod -Uri "http://localhost:8055/items/properties?limit=5" `
    -Method GET `
    -Headers $headers
```

### ✅ Verificar Collections no Banco

```powershell
cd d:\IMob\directus
docker compose exec database psql -U directus -d directus
```

```sql
-- Listar todas as tables
\dt

-- Ver companies
SELECT id, name, slug, email, status FROM companies;

-- Ver properties
SELECT codigo, titulo, tipo, finalidade, preco FROM properties LIMIT 5;

-- Ver permissões aplicadas
SELECT 
    p.collection,
    p.action,
    CASE WHEN p.permissions IS NOT NULL THEN '✓' ELSE '-' END as has_filter,
    CASE WHEN p.presets IS NOT NULL THEN '✓' ELSE '-' END as has_presets
FROM directus_permissions p
WHERE p.policy = (SELECT id FROM directus_policies WHERE name = 'Company Admin')
ORDER BY p.collection, p.action;

-- Sair
\q
```

## 🎯 Resumo

**Status atual:**
- ✅ Docker + Directus funcionando
- ✅ PostgreSQL + Redis rodando
- ✅ 37 permissões multi-tenant aplicadas
- ✅ Collections criadas (16 total)
- ❌ Node.js não instalado (necessário para Next.js)

**Próximo passo:**
1. Instalar Node.js LTS
2. Instalar pnpm globalmente
3. Executar `pnpm install` no diretório nextjs/
4. Executar `pnpm dev` para iniciar frontend
