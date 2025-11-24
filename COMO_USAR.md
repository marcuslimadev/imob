# 🚀 Como Usar o IMOBI - Guia Rápido

## ✅ Status Atual do Sistema

### Serviços Rodando:
- ✅ **Directus (Backend)**: http://localhost:8055
- ✅ **PostgreSQL + PostGIS**: Container rodando
- ✅ **Redis Cache**: Container rodando
- ✅ **Next.js (Frontend)**: http://localhost:3000

### Collections Criadas:
- ✅ `companies` - Imobiliárias (Multi-tenant)
- ✅ `properties` - Imóveis
- ✅ `property_media` - Fotos/Vídeos
- ✅ `leads` - Leads/Clientes
- ✅ `lead_activities` - Atividades
- ✅ `property_views` - Analytics

---

## 🔐 1. Acessar o Directus Admin

### URL:
```
http://localhost:8055/admin
```

### Credenciais:
```
Email: marcus@admin.com
Senha: Teste@123
```

### O que fazer após login:

1. **Ver Collections:**
   - No menu lateral, você verá as collections do IMOBI
   - Companies, Properties, Leads, etc.

2. **Verificar Dados:**
   - Clique em "Companies" para ver a Imobiliária Exclusiva
   - Clique em "Properties" para ver os 2 imóveis cadastrados
   - Clique em "Leads" para ver os 2 leads de exemplo

---

## 👥 2. Configurar Usuários e Permissões (IMPORTANTE!)

### Passo 1: Criar Role "Imobiliária"
1. Vá em **Settings** (⚙️) → **Access Control** → **Roles**
2. Clique em **"+ Create Role"**
3. Preencha:
   - **Name**: `Imobiliária`
   - **Icon**: `business`
   - **Description**: `Acesso ao painel da imobiliária`

### Passo 2: Configurar Permissões Multi-tenant

Para cada collection, configure:

#### **Collection: companies**
- ✅ **Read**: 
  - Filter: `{ "id": { "_eq": "$CURRENT_USER.company_id" } }`
  - Fields: Todos
- ✅ **Update**:
  - Filter: `{ "id": { "_eq": "$CURRENT_USER.company_id" } }`
  - Fields: Permitir editar (exceto id, subscription_*)

#### **Collection: properties**
- ✅ **Create**: Permitido (todos os campos)
- ✅ **Read**:
  - Filter: `{ "company_id": { "_eq": "$CURRENT_USER.company_id" } }`
- ✅ **Update**:
  - Filter: `{ "company_id": { "_eq": "$CURRENT_USER.company_id" } }`
- ✅ **Delete**:
  - Filter: `{ "company_id": { "_eq": "$CURRENT_USER.company_id" } }`

#### **Collection: leads**
- ✅ **Create**: Permitido
- ✅ **Read**:
  - Filter: `{ "company_id": { "_eq": "$CURRENT_USER.company_id" } }`
- ✅ **Update**:
  - Filter: `{ "company_id": { "_eq": "$CURRENT_USER.company_id" } }`
- ✅ **Delete**:
  - Filter: `{ "company_id": { "_eq": "$CURRENT_USER.company_id" } }`

### Passo 3: Criar Usuário da Imobiliária Exclusiva
1. Vá em **User Directory**
2. Clique em **"+ Create User"**
3. Preencha:
   - **Email**: `admin@exclusiva.com.br`
   - **Password**: `Exclusiva@2025`
   - **First Name**: `Admin`
   - **Last Name**: `Exclusiva`
   - **Role**: `Imobiliária`
   - **Status**: `Active`

4. **IMPORTANTE**: No campo customizado, adicione:
   - `company_id`: Selecione "Imobiliária Exclusiva"

---

## 🎨 3. Testar o Acesso da Imobiliária

### Logout e Login como Exclusiva:
1. Sair da conta admin
2. Fazer login com:
   ```
   Email: admin@exclusiva.com.br
   Senha: Exclusiva@2025
   ```

### O que você deve ver:
- ✅ Apenas os imóveis da Exclusiva
- ✅ Apenas os leads da Exclusiva
- ✅ Configurações da empresa Exclusiva
- ❌ NÃO ver dados de outras imobiliárias

---

## 📱 4. Acessar o Frontend (Next.js)

### URL:
```
http://localhost:3000
```

### Páginas Disponíveis:

#### Vitrine Pública de Imóveis:
```
http://localhost:3000/properties?company=exclusiva
```
- Lista todos os imóveis da Exclusiva
- Cards com foto, título, preço
- Filtros por empresa via query param

#### Detalhe do Imóvel:
```
http://localhost:3000/properties/[id]?company=exclusiva
```
- Informações completas do imóvel
- Foto de capa
- Características (quartos, banheiros, vagas)
- Valores (venda, aluguel, condomínio, IPTU)
- Localização

---

## 🔧 5. Configurar Token Público (para vitrine)

Para que a vitrine pública funcione sem autenticação:

1. No Directus Admin, vá em **Settings** → **Access Control** → **Roles**
2. Clique em **"Public"** (já existe por padrão)
3. Configure permissões:

### Collection: companies
- ✅ Read: Todos os campos (sem filtro)

### Collection: properties
- ✅ Read: Campos públicos (title, description, price_*, bedrooms, etc.)

### Collection: property_media
- ✅ Read: Todos os campos

4. Copie o **Public Token** e adicione no `.env` do Next.js:
```
DIRECTUS_PUBLIC_TOKEN=seu_token_aqui
```

---

## 📊 6. Próximos Passos

### No Directus:
- [ ] Criar mais imobiliárias de teste
- [ ] Cadastrar mais imóveis
- [ ] Configurar uploads de fotos
- [ ] Criar dashboards customizados
- [ ] Configurar webhooks

### No Frontend:
- [ ] Criar página de login multi-tenant
- [ ] Dashboard da imobiliária
- [ ] CRUD de imóveis
- [ ] Gestão de leads
- [ ] Formulário de contato (cria lead)

### Deploy:
- [ ] Deploy Directus no Render
- [ ] Deploy Next.js no Vercel
- [ ] Configurar domínios customizados
- [ ] SSL/HTTPS

---

## 🆘 Troubleshooting

### Erro: "You don't have permission to access this"
- Verifique se o usuário tem `company_id` configurado
- Revise as permissões da role
- Certifique-se de estar logado com a conta correta

### Collections não aparecem no menu
- Verifique se a collection tem `hidden: false` no meta
- Recarregue a página (Ctrl+F5)
- Verifique os logs do container: `docker logs directus-cms-template-directus-1`

### Imóveis não aparecem na vitrine
- Verifique o token público no `.env` do Next.js
- Confirme que as permissões públicas estão configuradas
- Veja o console do navegador para erros de API

---

## 🎯 Arquitetura Multi-Tenant

```
┌─────────────────────────────────────┐
│         IMOBI Platform              │
│    (Single Directus Instance)       │
└─────────────────────────────────────┘
              │
              │ company_id
              ├─────────────┬──────────────┬───────────
              │             │              │
    ┌─────────▼──────┐ ┌───▼─────┐   ┌───▼──────┐
    │   Exclusiva    │ │  Lopes  │   │ Century  │
    │ (slug: excl.)  │ │         │   │   21     │
    └────────────────┘ └─────────┘   └──────────┘
         │                 │              │
    Properties         Properties     Properties
    Leads              Leads          Leads
    Users              Users          Users
```

Cada imobiliária vê APENAS seus próprios dados!

---

**Desenvolvido com ❤️ para o futuro do mercado imobiliário brasileiro**
