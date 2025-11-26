# Configuração de Roles Multi-tenant no Directus

Este documento descreve como configurar as permissões multi-tenant no Directus para o sistema iMOBI.

## Estrutura de Roles

### 1. SuperAdmin (Já existe)
- **Descrição**: Administrador da plataforma iMOBI
- **Acesso**: Total ao sistema, todas as empresas
- **Uso**: Gerenciamento da plataforma, monitoramento, suporte

### 2. Company Admin (Criar)
- **Descrição**: Administrador de uma imobiliária
- **Acesso**: Dados apenas da sua empresa (company_id)
- **Permissões**:
  - ✅ CRUD completo em `properties` (filtrado por company_id)
  - ✅ CRUD completo em `leads` (filtrado por company_id)
  - ✅ CRUD completo em `property_media`
  - ✅ CRUD completo em `lead_activities`
  - ✅ Leitura em `companies` (apenas sua empresa)
  - ✅ Upload de arquivos em `directus_files`
  - ✅ Acesso ao dashboard da empresa
  - ✅ Gerenciar usuários da empresa (role: Corretor)

### 3. Corretor (Criar)
- **Descrição**: Corretor/vendedor de uma imobiliária
- **Acesso**: Leitura de imóveis e gerenciamento de leads da empresa
- **Permissões**:
  - ✅ Leitura em `properties` (filtrado por company_id)
  - ✅ CRUD em `leads` (filtrado por company_id + assigned_to)
  - ✅ CRUD em `lead_activities` (seus leads)
  - ✅ Leitura em `property_media`
  - ✅ Upload de fotos de perfil
  - ❌ Não pode criar/editar/excluir imóveis
  - ❌ Não pode alterar configurações da empresa

### 4. Public (Criar)
- **Descrição**: Acesso público para vitrine de imóveis
- **Acesso**: Somente leitura de imóveis ativos
- **Permissões**:
  - ✅ Leitura em `properties` (apenas status: active)
  - ✅ Leitura em `property_media`
  - ✅ Criação em `leads` (formulário de contato)
  - ✅ Criação em `property_views` (tracking)
  - ❌ Sem acesso ao admin

## Passo a Passo para Configuração

### Passo 1: Acessar Directus Admin
1. Abrir http://localhost:8055
2. Login com marcus@admin.com / Teste@123
3. Ir em Settings → Roles & Permissions

### Passo 2: Criar Role "Company Admin"

**Criar Role:**
- Nome: `Company Admin`
- Icon: `business`
- Description: `Administrador de uma imobiliária`
- Admin Access: ❌ (não marcar)
- App Access: ✅ (marcar)

**Permissões - Collection `companies`:**
- ✅ Read: Custom Access
  - Permissions: `{ "id": { "_eq": "$CURRENT_USER.company_id" } }`
  - Fields: Todos
- ✅ Update: Custom Access
  - Permissions: `{ "id": { "_eq": "$CURRENT_USER.company_id" } }`
  - Fields: Todos exceto `subscription_status`, `subscription_expires_at`

**Permissões - Collection `properties`:**
- ✅ Create: Custom Access
  - Permissions: Nenhum filtro necessário
  - Fields: Todos
  - Presets: `{ "company_id": "$CURRENT_USER.company_id" }`
- ✅ Read: Custom Access
  - Permissions: `{ "company_id": { "_eq": "$CURRENT_USER.company_id" } }`
  - Fields: Todos
- ✅ Update: Custom Access
  - Permissions: `{ "company_id": { "_eq": "$CURRENT_USER.company_id" } }`
  - Fields: Todos
- ✅ Delete: Custom Access
  - Permissions: `{ "company_id": { "_eq": "$CURRENT_USER.company_id" } }`

**Permissões - Collection `leads`:**
- ✅ Create: Custom Access (mesmo padrão)
- ✅ Read: `{ "company_id": { "_eq": "$CURRENT_USER.company_id" } }`
- ✅ Update: `{ "company_id": { "_eq": "$CURRENT_USER.company_id" } }`
- ✅ Delete: `{ "company_id": { "_eq": "$CURRENT_USER.company_id" } }`

**Permissões - Collection `property_media`:**
- ✅ Create: All Access
- ✅ Read: All Access
- ✅ Update: All Access
- ✅ Delete: All Access

**Permissões - Collection `lead_activities`:**
- ✅ Create: All Access
- ✅ Read: All Access
- ✅ Update: All Access
- ✅ Delete: All Access

**Permissões - Collection `directus_files`:**
- ✅ Create: All Access
- ✅ Read: All Access
- ✅ Update: Custom Access
  - Permissions: `{ "uploaded_by": { "_eq": "$CURRENT_USER.id" } }`
- ✅ Delete: Custom Access
  - Permissions: `{ "uploaded_by": { "_eq": "$CURRENT_USER.id" } }`

**Permissões - Collection `directus_users`:**
- ✅ Read: Custom Access
  - Permissions: `{ "company_id": { "_eq": "$CURRENT_USER.company_id" } }`
  - Fields: id, email, first_name, last_name, role, company_id, status
- ✅ Create: Custom Access
  - Permissions: Nenhum
  - Fields: email, first_name, last_name, password, role, company_id
  - Presets: `{ "company_id": "$CURRENT_USER.company_id", "role": "corretor_role_id" }`
- ✅ Update: Custom Access
  - Permissions: `{ "company_id": { "_eq": "$CURRENT_USER.company_id" }, "id": { "_neq": "$CURRENT_USER.id" } }`

### Passo 3: Criar Role "Corretor"

**Criar Role:**
- Nome: `Corretor`
- Icon: `person`
- Description: `Corretor/vendedor de imobiliária`
- Admin Access: ❌
- App Access: ✅

**Permissões - Collection `properties`:**
- ✅ Read: Custom Access
  - Permissions: `{ "company_id": { "_eq": "$CURRENT_USER.company_id" } }`
  - Fields: Todos

**Permissões - Collection `leads`:**
- ✅ Create: Custom Access
  - Presets: `{ "company_id": "$CURRENT_USER.company_id", "assigned_to": "$CURRENT_USER.id" }`
- ✅ Read: Custom Access
  - Permissions: `{ "company_id": { "_eq": "$CURRENT_USER.company_id" } }`
- ✅ Update: Custom Access
  - Permissions: `{ "assigned_to": { "_eq": "$CURRENT_USER.id" } }`
- ❌ Delete: No Access

**Permissões - Collection `lead_activities`:**
- ✅ Create: All Access
- ✅ Read: All Access
- ✅ Update: Custom Access
  - Permissions: `{ "created_by": { "_eq": "$CURRENT_USER.id" } }`
- ❌ Delete: No Access

**Permissões - Collection `property_media`:**
- ✅ Read: All Access

**Permissões - Collection `directus_files`:**
- ✅ Read: All Access
- ✅ Create: All Access (para foto de perfil)

### Passo 4: Criar Role "Public"

**Criar Role:**
- Nome: `Public`
- Icon: `public`
- Description: `Acesso público para vitrine`
- Admin Access: ❌
- App Access: ❌

**Permissões - Collection `properties`:**
- ✅ Read: Custom Access
  - Permissions: `{ "status": { "_eq": "active" } }`
  - Fields: id, title, description, property_type, transaction_type, price_sale, price_rent, bedrooms, bathrooms, area_total, area_built, city, state, featured, company_id

**Permissões - Collection `property_media`:**
- ✅ Read: All Access
  - Fields: id, property_id, file_id, sort, is_cover

**Permissões - Collection `leads`:**
- ✅ Create: All Access
  - Fields: name, email, phone, message, interest_type, property_id, company_id, budget_min, budget_max

**Permissões - Collection `property_views`:**
- ✅ Create: All Access

**Permissões - Collection `companies`:**
- ✅ Read: Custom Access
  - Permissions: `{ "status": { "_eq": "active" } }`
  - Fields: id, name, email, phone, logo, address, website_url

**Permissões - Collection `directus_files`:**
- ✅ Read: All Access

## Passo 5: Atualizar Usuários

### Adicionar campo `company_id` aos usuários
1. Settings → Data Model → directus_users
2. Verificar se existe campo `company_id` (type: Many to One → companies)
3. Se não existir, criar:
   - Field: `company_id`
   - Type: Many to One Relationship
   - Related Collection: `companies`
   - Interface: Select Dropdown

### Atualizar usuário marcus@admin.com
1. User Directory → marcus@admin.com
2. Definir `company_id`: 1 (Imobiliária Exclusiva)
3. Salvar

### Criar usuário de teste Company Admin
1. User Directory → Create New User
2. Dados:
   - Email: `admin@exclusiva.com`
   - First Name: `Admin`
   - Last Name: `Exclusiva`
   - Password: `Teste@123`
   - Role: `Company Admin`
   - Company ID: `1`
   - Status: `Active`
3. Salvar

### Criar usuário de teste Corretor
1. User Directory → Create New User
2. Dados:
   - Email: `corretor@exclusiva.com`
   - First Name: `Carlos`
   - Last Name: `Vendedor`
   - Password: `Teste@123`
   - Role: `Corretor`
   - Company ID: `1`
   - Status: `Active`
3. Salvar

## Passo 6: Testar Permissões

### Teste 1: Company Admin
1. Logout do SuperAdmin
2. Login com `admin@exclusiva.com` / `Teste@123`
3. Verificar:
   - ✅ Deve ver apenas imóveis da empresa ID 1
   - ✅ Pode criar novo imóvel
   - ✅ Pode editar imóveis existentes
   - ✅ Pode ver e gerenciar leads
   - ❌ Não vê imóveis de outras empresas

### Teste 2: Corretor
1. Logout
2. Login com `corretor@exclusiva.com` / `Teste@123`
3. Verificar:
   - ✅ Vê imóveis da empresa ID 1 (somente leitura)
   - ✅ Pode criar leads
   - ✅ Pode editar leads atribuídos a ele
   - ❌ Não pode criar/editar imóveis
   - ❌ Não pode editar leads de outros corretores

### Teste 3: API Pública (Next.js)
1. Acessar http://localhost:3000/vitrine
2. Verificar:
   - ✅ Lista apenas imóveis com status "active"
   - ✅ Mostra fotos e detalhes
   - ✅ Formulário de contato cria lead
   - ❌ Não expõe dados sensíveis

## Filtros Importantes

### Filter Rule Syntax (Directus)
```json
// Filtrar por company_id do usuário logado
{
  "company_id": {
    "_eq": "$CURRENT_USER.company_id"
  }
}

// Filtrar por status ativo
{
  "status": {
    "_eq": "active"
  }
}

// Filtrar leads atribuídos ao usuário
{
  "assigned_to": {
    "_eq": "$CURRENT_USER.id"
  }
}

// Combinação de filtros (AND)
{
  "_and": [
    {
      "company_id": {
        "_eq": "$CURRENT_USER.company_id"
      }
    },
    {
      "status": {
        "_eq": "active"
      }
    }
  ]
}

// Filtro OR
{
  "_or": [
    {
      "assigned_to": {
        "_eq": "$CURRENT_USER.id"
      }
    },
    {
      "created_by": {
        "_eq": "$CURRENT_USER.id"
      }
    }
  ]
}
```

### Presets (valores padrão ao criar)
```json
// Automaticamente definir company_id ao criar imóvel
{
  "company_id": "$CURRENT_USER.company_id"
}

// Definir status padrão
{
  "status": "draft",
  "company_id": "$CURRENT_USER.company_id",
  "created_by": "$CURRENT_USER.id"
}
```

## Segurança Adicional

### 1. Validação em Hooks (Futuro)
Criar extensão Directus para validar company_id em todas as operações:

```js
// directus/extensions/hooks/validate-company-id/index.js
export default ({ filter, action }) => {
  filter('items.create', async (input, meta, context) => {
    const { accountability } = context;
    
    if (accountability.role !== 'administrator') {
      input.company_id = accountability.user.company_id;
    }
    
    return input;
  });
  
  filter('items.update', async (input, meta, context) => {
    const { accountability } = context;
    const { collection, keys } = meta;
    
    if (accountability.role !== 'administrator') {
      // Verificar se o item pertence à empresa do usuário
      const items = await context.database
        .select('company_id')
        .from(collection)
        .whereIn('id', keys);
      
      const hasUnauthorized = items.some(
        item => item.company_id !== accountability.user.company_id
      );
      
      if (hasUnauthorized) {
        throw new Error('Unauthorized: Cannot update items from other companies');
      }
    }
    
    return input;
  });
};
```

### 2. Rate Limiting
Configurar no `docker-compose.yaml`:

```yaml
RATE_LIMITER_ENABLED: true
RATE_LIMITER_POINTS: 50
RATE_LIMITER_DURATION: 1
```

### 3. CORS Configuration
Atualizar `.env` do Directus:

```env
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000,https://seu-dominio.com
CORS_CREDENTIALS=true
```

## Script de Setup Automatizado

Para configurar todas as roles e permissões automaticamente, execute:

```bash
cd directus
npm run setup:roles
```

Ou manualmente:

```bash
cd directus
node setup-roles.js
```

O script irá:
1. Criar o campo `company_id` em `directus_users` (se não existir)
2. Criar a role "Company Admin" com todas as permissões multi-tenant
3. Criar a role "Corretor" com permissões limitadas
4. Configurar permissões públicas para a vitrine
5. Criar usuários de teste:
   - `admin@exclusiva.com` / `Teste@123` (Company Admin)
   - `corretor@exclusiva.com` / `Teste@123` (Corretor)

## Checklist de Implementação

- [x] Criar role "Company Admin"
- [x] Configurar permissões de `properties` para Company Admin
- [x] Configurar permissões de `leads` para Company Admin
- [x] Configurar permissões de `property_media` para Company Admin
- [x] Configurar permissões de `directus_users` para Company Admin
- [x] Criar role "Corretor"
- [x] Configurar permissões de `properties` para Corretor (read-only)
- [x] Configurar permissões de `leads` para Corretor
- [x] Criar role "Public"
- [x] Configurar permissões de `properties` para Public (read-only, active)
- [x] Configurar permissões de `leads` para Public (create-only)
- [x] Adicionar campo `company_id` em `directus_users`
- [x] Atualizar usuário SuperAdmin com company_id
- [x] Criar usuário teste Company Admin
- [x] Criar usuário teste Corretor
- [ ] Testar login como Company Admin
- [ ] Testar login como Corretor
- [ ] Testar criação de imóvel (Company Admin)
- [ ] Testar criação de lead (Corretor)
- [ ] Testar isolamento entre empresas
- [x] Documentar credenciais de teste

## Próximos Passos

1. **Implementar dashboard de métricas** - Filtrado por company_id
2. **Criar página de gerenciamento de usuários** - Company Admin gerencia corretores
3. **Adicionar sistema de notificações** - Alertas para novos leads
4. **Implementar geração de relatórios** - Filtrados por empresa
5. **Criar logs de auditoria** - Rastrear ações dos usuários
