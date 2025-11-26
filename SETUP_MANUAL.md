# 🚀 Guia Rápido: Setup Multi-Tenant Manual

## 📋 Passo a Passo para Configurar Primeira Empresa

### 1️⃣ Criar Empresa

1. Acesse: http://localhost:8055/admin/content/companies
2. Clique em **"+ Criar Item"**
3. Preencha:
   - **Nome:** Exclusiva Lar Imóveis
   - **CNPJ:** 12.345.678/0001-90
   - **Email:** contato@exclusivalar.com.br
   - **Telefone:** (31) 99999-9999
   - **Endereço:** Belo Horizonte, MG
   - **Status:** active
4. Clique em **"Salvar"**
5. **📝 Anote o ID gerado** (ex: 1)

---

### 2️⃣ Criar Configurações da Empresa

1. Acesse: http://localhost:8055/admin/content/app_settings
2. Clique em **"+ Criar Item"**
3. Preencha:

#### 🏢 Empresa
- **Company ID:** 1 (ou o ID que você anotou)

#### 🤖 OpenAI
- **OpenAI API Key:** `sk-proj-...` (sua chave real ou deixe placeholder)
- **OpenAI Model:** `gpt-4o-mini`
- **AI Assistant Name:** `Teresa`

#### 📱 Twilio WhatsApp
- **Twilio Account SID:** `ACxxxxxxxxxxxxxxxx` (sua conta real ou placeholder)
- **Twilio Auth Token:** `xxxxxxxxxxxxxxxxxx`
- **Twilio WhatsApp Number:** `whatsapp:+5531999999999` (seu número Twilio)

#### 🔗 Webhooks e APIs
- **Webhook URL:** `http://localhost:8055/whatsapp`
- **External API URL:** `https://api.example.com`
- **External API Key:** `YOUR_KEY`

#### ✅ Status
- **Is Active:** ✓ (marcado)

4. Clique em **"Salvar"**

---

### 3️⃣ Configurar Usuário (Adicionar Company ID)

**IMPORTANTE:** Precisamos adicionar o campo `company_id` em `directus_users`

#### Opção A: Via SQL (Rápido)

1. Acesse o container PostgreSQL:
```powershell
cd directus
docker compose exec database psql -U directus
```

2. Execute:
```sql
-- Adicionar coluna company_id
ALTER TABLE directus_users 
ADD COLUMN company_id INTEGER REFERENCES companies(id);

-- Vincular usuário admin à primeira empresa
UPDATE directus_users 
SET company_id = 1 
WHERE email = 'marcus@admin.com';
```

3. Sair: `\q`

#### Opção B: Via Directus Admin (Mais seguro)

1. Acesse: http://localhost:8055/admin/settings/data-model/directus_users
2. Clique em **"Criar Campo"**
3. Configure:
   - **Tipo:** Many to One (M2O)
   - **Campo Chave:** `company_id`
   - **Collection Relacionada:** `companies`
   - **Interface:** Dropdown
4. Salvar

5. Agora vá em **Users** e edite seu usuário:
   - Selecione **Company:** Exclusiva Lar Imóveis

---

### 4️⃣ Testar Isolamento

1. Crie uma segunda empresa:
   - Nome: Teste Imobiliária
   - CNPJ: 98.765.432/0001-00
   - Status: active

2. Crie configurações para ela (app_settings)

3. Crie um segundo usuário:
   - Email: admin@teste.com
   - Company: Teste Imobiliária

4. Faça login com cada usuário e verifique que veem apenas dados da sua empresa

---

## 🔐 Configurar Permissões por Empresa

### 1. Criar Role "Admin Empresa"

1. Acesse: http://localhost:8055/admin/settings/roles
2. Clique em **"+ Criar Role"**
3. Configure:
   - **Nome:** Admin Empresa
   - **Descrição:** Administrador com acesso apenas aos dados da sua empresa
   - **App Access:** ✓
   - **Admin Access:** ✗

### 2. Configurar Permissões por Collection

Para **CADA** collection (leads, conversas, mensagens, properties, etc.):

1. Vá em **Permissions** da role "Admin Empresa"
2. Para cada collection, configure:

#### ✅ Read (Leitura)
- **Permissões:** Custom
- **Filtro:**
```json
{
  "_and": [
    {
      "company_id": {
        "_eq": "$CURRENT_USER.company_id"
      }
    }
  ]
}
```

#### ✅ Create (Criar)
- **Permissões:** Custom
- **Preset Values:**
```json
{
  "company_id": "$CURRENT_USER.company_id"
}
```

#### ✅ Update (Editar)
- **Permissões:** Custom
- **Filtro:**
```json
{
  "_and": [
    {
      "company_id": {
        "_eq": "$CURRENT_USER.company_id"
      }
    }
  ]
}
```

#### ✅ Delete (Deletar)
- **Permissões:** Custom
- **Filtro:**
```json
{
  "_and": [
    {
      "company_id": {
        "_eq": "$CURRENT_USER.company_id"
      }
    }
  ]
}
```

### 3. Collections Especiais

#### `companies`
- **Read:** Apenas a própria empresa
```json
{
  "id": {
    "_eq": "$CURRENT_USER.company_id"
  }
}
```
- **Create/Update/Delete:** Bloqueado (apenas Super Admin)

#### `app_settings`
- **Read:** Apenas configurações da própria empresa
```json
{
  "company_id": {
    "_eq": "$CURRENT_USER.company_id"
  }
}
```
- **Update:** Permitido (para editar chaves API)
- **Create/Delete:** Bloqueado

#### `directus_users`
- **Read:** Apenas usuários da mesma empresa
```json
{
  "company_id": {
    "_eq": "$CURRENT_USER.company_id"
  }
}
```

---

## ✅ Checklist de Setup

- [ ] Empresa criada em `companies`
- [ ] Configurações criadas em `app_settings`
- [ ] Campo `company_id` adicionado em `directus_users`
- [ ] Usuário vinculado à empresa
- [ ] Role "Admin Empresa" criada
- [ ] Permissões configuradas para todas collections
- [ ] Testado isolamento de dados

---

## 🧪 Como Testar

### Teste 1: Webhook WhatsApp

```powershell
curl -X POST http://localhost:8055/whatsapp `
  -H "Content-Type: application/json" `
  -d '{
    "From": "whatsapp:+5531988887777",
    "To": "whatsapp:+5531999999999",
    "Body": "Olá, tenho interesse em um apartamento"
  }'
```

**Esperado:**
- Sistema identifica empresa pelo campo `To` (whatsapp:+5531999999999)
- Busca configurações da Exclusiva em `app_settings`
- Usa chave OpenAI da Exclusiva
- Salva conversa com `company_id = 1`

### Teste 2: Login de Usuário

1. Login como admin@exclusivalar.com.br
2. Acesse http://localhost:8055/admin/content/leads
3. Deve ver apenas leads da Exclusiva (company_id = 1)

4. Login como admin@teste.com
5. Acesse http://localhost:8055/admin/content/leads
6. Deve ver apenas leads da Teste (company_id = 2)

---

## 📝 Próximos Passos

1. ✅ Configurar primeira empresa manualmente
2. ⏳ Atualizar extensões para usar `getCompanySettingsByWhatsApp()`
3. ⏳ Implementar lógica completa WhatsApp Service
4. ⏳ Criar frontend com filtros por empresa
5. ⏳ Testar cenário completo end-to-end

---

**Criado em:** 2025-01-20  
**Autor:** Marcus Lima  
**Sistema:** iMOBI Multi-Tenant
