# 🏢 ARQUITETURA SAAS MULTI-TENANT COMPLETA

**Sistema:** IMOBI - Plataforma SaaS para Imobiliárias  
**Data:** 24 de Novembro de 2025  
**Versão:** v1.0 (Arquitetura Redefinida)

---

## 🎯 VISÃO GERAL

O IMOBI é um **SaaS multi-tenant completo** onde:

### Você (Dono do SaaS):
- Cadastra novas imobiliárias
- Define planos e preços
- Gerencia assinaturas
- Monitora uso de recursos
- Acessa métricas globais

### Cada Imobiliária:
- Tem seu próprio painel administrativo isolado
- Configura domínio customizado
- Gerencia seus corretores
- Configura integrações próprias (Twilio, Asaas, etc.)
- Tem vitrine pública de vendas
- Dados completamente segregados

---

## 🌐 ESTRUTURA DE DOMÍNIOS

### 1. **Super Admin** (Você - Dono do SaaS)
```
https://admin.imobi.com.br
- Login do super admin
- Dashboard global
- Cadastro de novas imobiliárias
- Gerenciamento de planos
- Métricas de faturamento
- Configurações globais
```

### 2. **Painel da Imobiliária** (Admin de cada empresa)
```
https://exclusiva.imobi.com.br
https://remax.imobi.com.br
https://lopes.imobi.com.br

- Subdomínio único por imobiliária
- Login dos corretores
- Dashboard da imobiliária
- CRUD de imóveis
- Gestão de leads (CRM)
- Configurações da empresa
- Gestão de corretores
- Relatórios e métricas
```

### 3. **Vitrine Pública** (Clientes finais)
```
https://vendas.exclusiva.com.br  (ou exclusivaimoveis.com.br)
https://vendas.remax.com.br
https://imoveis.lopes.com.br

- Domínio customizado por imobiliária
- Catálogo público de imóveis
- Busca e filtros
- Detalhes do imóvel
- Formulário de contato
- WhatsApp direto
- Sem login (público)
```

## 🎨 Stack de Frontend

### Next.js 15 + React 18
- App Router (Server Components + Client Components)
- Turbopack (dev)
- TypeScript

### UI Framework: **Naive UI** + Tailwind CSS
```
Por que Naive UI?
✅ Design moderno e limpo
✅ TypeScript nativo
✅ Componentes ricos (DataTable, DatePicker, Upload, Form, Dialog)
✅ Temas customizáveis
✅ Sem dependências pesadas (ao contrário do Ant Design)
✅ Performance excelente
✅ Documentação completa
```

### Bibliotecas Complementares
- **@hello-pangea/dnd** - Drag and drop (Kanban de leads)
- **date-fns** - Manipulação de datas
- **recharts** - Gráficos e métricas
- **react-hook-form** + **zod** - Formulários validados

---

### Collection: **companies** (Tenants)
```typescript
{
  id: uuid,
  
  // Dados Básicos
  name: string,              // "Imobiliária Exclusiva"
  slug: string,              // "exclusiva" (único)
  cnpj: string,
  email: string,
  phone: string,
  
  // Branding
  logo: file,
  primary_color: string,     // "#1E3A8A"
  secondary_color: string,   // "#F59E0B"
  
  // Domínios
  admin_domain: string,      // "exclusiva.imobi.com.br" (auto)
  custom_domain: string,     // "exclusivaimoveis.com.br" (customizado)
  custom_domain_verified: boolean,
  
  // Assinatura
  subscription_status: enum, // active, suspended, canceled, trial
  subscription_plan: enum,   // basic, professional, enterprise
  subscription_starts_at: date,
  subscription_expires_at: date,
  monthly_price: decimal,    // R$ 759,00
  
  // Integrações (URLs de Webhook)
  twilio_account_sid: string,
  twilio_auth_token: string,
  twilio_phone_number: string,
  twilio_webhook_url: string, // https://api.imobi.com.br/webhooks/twilio/{company_id}
  
  asaas_api_key: string,
  asaas_webhook_url: string,  // https://api.imobi.com.br/webhooks/asaas/{company_id}
  
  clicksign_api_token: string,
  clicksign_webhook_url: string,
  
  // Configurações
  enable_crm: boolean,
  enable_rental: boolean,
  enable_inspection: boolean,
  enable_financial: boolean,
  max_users: integer,        // Limite de corretores
  max_properties: integer,   // Limite de imóveis
  
  // Metadados
  created_at: timestamp,
  updated_at: timestamp,
  created_by: uuid,          // Super admin que criou
  status: enum,              // active, inactive
}
```

### Collection: **users** (Usuários do Sistema)
```typescript
{
  id: uuid,
  
  // Dados Pessoais
  first_name: string,
  last_name: string,
  email: string,             // Único global
  password: hash,
  phone: string,
  avatar: file,
  
  // Multi-Tenant
  company_id: uuid,          // FK -> companies (null para super admin)
  
  // Permissões
  role: enum,                // super_admin, company_admin, manager, agent
  permissions: json,         // Permissões granulares
  
  // Configurações
  is_active: boolean,
  email_verified: boolean,
  last_login_at: timestamp,
  
  // Metadados
  created_at: timestamp,
  updated_at: timestamp,
}
```

**Roles:**
- `super_admin`: Você (acessa admin.imobi.com.br, vê todas as empresas)
- `company_admin`: Dono da imobiliária (acessa {slug}.imobi.com.br, vê só sua empresa)
- `manager`: Gerente (acessa CRM, relatórios, configura leads)
- `agent`: Corretor (acessa CRM, cadastra imóveis, atende leads)

### Collection: **properties** (Imóveis)
```typescript
{
  id: uuid,
  company_id: uuid,          // FK -> companies (OBRIGATÓRIO)
  
  // Dados Básicos
  title: string,
  description: text,
  property_type: enum,       // apartment, house, commercial, land
  transaction_type: enum,    // sale, rent, both
  
  // Localização
  address: string,
  neighborhood: string,
  city: string,
  state: string,
  zipcode: string,
  latitude: decimal,
  longitude: decimal,
  
  // Características
  bedrooms: integer,
  bathrooms: integer,
  suites: integer,
  parking_spaces: integer,
  area_total: decimal,
  area_built: decimal,
  
  // Valores
  price_sale: decimal,
  price_rent: decimal,
  price_condo: decimal,
  price_iptu: decimal,
  
  // Proprietário (Locação)
  owner_name: string,
  owner_cpf_cnpj: string,
  owner_phone: string,
  owner_email: string,
  
  // Controle
  featured: boolean,
  status: enum,              // available, rented, sold, inactive
  views_count: integer,
  created_by: uuid,          // FK -> users (corretor)
  
  // Metadados
  created_at: timestamp,
  updated_at: timestamp,
}
```

### Collection: **leads** (CRM)
```typescript
{
  id: uuid,
  company_id: uuid,          // FK -> companies (OBRIGATÓRIO)
  
  // Dados do Lead
  name: string,
  email: string,
  phone: string,
  cpf: string,
  
  // Interesse
  interest_type: enum,       // buy, rent
  budget_min: decimal,
  budget_max: decimal,
  preferred_neighborhoods: json,
  bedrooms_min: integer,
  property_types: json,
  
  // Origem
  lead_source: enum,         // website, whatsapp, facebook, instagram, referral, walk-in
  referrer_url: string,
  utm_source: string,
  utm_campaign: string,
  
  // Qualificação
  lead_score: integer,       // 0-100
  stage: enum,               // new, contacted, qualified, viewing, proposal, negotiation, won, lost
  assigned_to: uuid,         // FK -> users (corretor responsável)
  
  // Tags e Notas
  tags: json,                // ["primeira_compra", "urgente"]
  notes: text,
  
  // Conversão
  converted_property_id: uuid, // Se virou venda/locação
  converted_at: timestamp,
  
  // Controle
  status: enum,              // active, inactive, archived
  
  // Metadados
  created_at: timestamp,
  updated_at: timestamp,
  created_by: uuid,
}
```

### Collection: **lead_activities** (Histórico CRM)
```typescript
{
  id: uuid,
  lead_id: uuid,             // FK -> leads
  
  // Atividade
  activity_type: enum,       // call, email, whatsapp, meeting, viewing, proposal
  subject: string,           // "Ligação de acompanhamento"
  description: text,
  
  // Agendamento
  scheduled_at: timestamp,
  completed_at: timestamp,
  status: enum,              // scheduled, completed, canceled
  
  // Responsável
  performed_by: uuid,        // FK -> users
  
  // Metadados
  created_at: timestamp,
}
```

### Collection: **property_media** (Fotos/Vídeos)
```typescript
{
  id: uuid,
  property_id: uuid,         // FK -> properties
  
  // Mídia
  directus_file: uuid,       // FK -> directus_files
  is_cover: boolean,
  caption: string,
  sort: integer,             // Ordem de exibição
  
  // Metadados
  uploaded_at: timestamp,
  uploaded_by: uuid,         // FK -> users
}
```

### Collection: **webhooks_log** (Log de Webhooks)
```typescript
{
  id: uuid,
  company_id: uuid,          // FK -> companies
  
  // Webhook
  service: enum,             // twilio, asaas, clicksign
  event_type: string,        // "message.received", "payment.confirmed"
  payload: json,             // Payload completo recebido
  
  // Processamento
  processed: boolean,
  processed_at: timestamp,
  error_message: text,
  
  // Metadados
  received_at: timestamp,
}
```

---

## 🔐 SISTEMA DE AUTENTICAÇÃO

### Fluxo de Login - Super Admin
```
1. Acessa: https://admin.imobi.com.br
2. Login: superadmin@imobi.com.br
3. Direciona para: /admin/companies (lista de imobiliárias)
```

### Fluxo de Login - Imobiliária
```
1. Acessa: https://exclusiva.imobi.com.br
2. Middleware detecta subdomain = "exclusiva"
3. Busca company onde slug = "exclusiva"
4. Login: admin@exclusiva.com.br (company_id já identificado)
5. Direciona para: /dashboard (painel da imobiliária)
```

### Fluxo de Acesso Público - Vitrine
```
1. Acessa: https://vendas.exclusiva.com.br
2. Middleware detecta custom_domain = "vendas.exclusiva.com.br"
3. Busca company onde custom_domain = "vendas.exclusiva.com.br"
4. Exibe imóveis filtrados por company_id
5. Sem autenticação necessária
```

---

## 🛠️ MIDDLEWARE MULTI-TENANT

### Next.js Middleware (nextjs/src/middleware.ts)
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCompanyByDomain } from '@/lib/directus/tenancy'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  
  // 1. Super Admin
  if (hostname === 'admin.imobi.com.br') {
    // Verifica se usuário tem role = super_admin
    return NextResponse.next()
  }
  
  // 2. Painel da Imobiliária (subdomínio)
  const subdomainMatch = hostname.match(/^([^.]+)\.imobi\.com\.br$/)
  if (subdomainMatch) {
    const slug = subdomainMatch[1]
    const company = await getCompanyByDomain({ slug })
    
    if (!company) {
      return NextResponse.redirect(new URL('/404', request.url))
    }
    
    // Adiciona company_id aos headers para uso nas páginas
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-company-id', company.id)
    requestHeaders.set('x-company-slug', company.slug)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  // 3. Vitrine Pública (domínio customizado)
  const company = await getCompanyByDomain({ customDomain: hostname })
  
  if (company) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-company-id', company.id)
    requestHeaders.set('x-tenant-type', 'public')
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  // 4. Domínio não reconhecido
  return NextResponse.redirect(new URL('https://imobi.com.br', request.url))
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

---

## 🎨 ESTRUTURA DE PÁGINAS

### 1. Super Admin (`admin.imobi.com.br`)
```
/admin
  /login                     # Login do super admin
  /companies                 # Lista de imobiliárias
  /companies/new             # Cadastrar nova imobiliária
  /companies/[id]            # Detalhes da imobiliária
  /companies/[id]/settings   # Configurações
  /billing                   # Faturamento global
  /analytics                 # Métricas globais
  /settings                  # Configurações do SaaS
```

### 2. Painel da Imobiliária (`{slug}.imobi.com.br`)
```
/login                       # Login dos corretores
/dashboard                   # Dashboard da imobiliária
/properties                  # CRUD de imóveis
/properties/new
/properties/[id]
/leads                       # CRM - Kanban de leads
/leads/[id]
/users                       # Gestão de corretores
/users/new
/analytics                   # Relatórios da imobiliária
/settings                    # Configurações da empresa
/settings/branding           # Logo, cores
/settings/domains            # Domínios customizados
/settings/integrations       # Twilio, Asaas, etc.
/settings/webhooks           # URLs de webhook
/billing                     # Assinatura e pagamento
```

### 3. Vitrine Pública (`{custom_domain}`)
```
/                            # Home com imóveis em destaque
/imoveis                     # Catálogo completo
/imoveis/[id]                # Detalhes do imóvel
/busca                       # Busca avançada
/sobre                       # Sobre a imobiliária
/contato                     # Formulário de contato
```

---

## 🔗 CONFIGURAÇÃO DE WEBHOOKS

### Twilio (WhatsApp/SMS)
```
URL do Webhook:
https://api.imobi.com.br/webhooks/twilio/{company_id}

Quando configurar:
- Imobiliária acessa: {slug}.imobi.com.br/settings/integrations
- Insere: Account SID, Auth Token, Phone Number
- Sistema gera automaticamente a URL de webhook
- Imobiliária copia e cola no painel do Twilio

Processamento:
1. Twilio envia mensagem para webhook
2. API valida company_id
3. Cria lead ou atividade no CRM
4. Notifica corretor responsável
```

### Asaas (Pagamentos)
```
URL do Webhook:
https://api.imobi.com.br/webhooks/asaas/{company_id}

Eventos:
- PAYMENT_CREATED
- PAYMENT_CONFIRMED
- PAYMENT_OVERDUE

Processamento:
1. Asaas envia evento
2. API valida company_id
3. Atualiza status financeiro do lead/contrato
4. Envia notificação
```

### ClickSign (Assinaturas)
```
URL do Webhook:
https://api.imobi.com.br/webhooks/clicksign/{company_id}

Eventos:
- document.signed
- document.canceled

Processamento:
1. ClickSign envia evento
2. API valida company_id
3. Atualiza status do contrato
4. Gera notificação
```

---

## 🚀 FLUXO DE ONBOARDING

### Quando Você Cadastra Nova Imobiliária:

#### 1. Super Admin Cria Empresa
```
admin.imobi.com.br/companies/new

Formulário:
- Nome da imobiliária
- CNPJ
- Email de contato
- Telefone
- Plano (Basic, Professional, Enterprise)
- Data de início da assinatura
```

#### 2. Sistema Cria Automaticamente:
```
- Registro na collection companies
- Gera slug único (ex: "exclusiva")
- Cria subdomínio: exclusiva.imobi.com.br
- Gera URLs de webhook para todas as integrações
- Envia email de boas-vindas com credenciais temporárias
```

#### 3. Primeiro Login da Imobiliária:
```
Acessa: exclusiva.imobi.com.br
Login: admin@exclusiva.com.br / senha_temporária

Wizard de Configuração:
┌─────────────────────────────────────┐
│ Passo 1: Branding                   │
│ - Upload de logo                    │
│ - Escolher cores (primary/secondary)│
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Passo 2: Domínio Customizado        │
│ - Inserir domínio (opcional)        │
│ - Instruções de configuração DNS    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Passo 3: Primeiro Corretor          │
│ - Nome completo                     │
│ - Email                             │
│ - Telefone                          │
│ - Criar como admin da imobiliária   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Passo 4: Integrações (Opcional)     │
│ - Twilio (WhatsApp)                 │
│ - Asaas (Pagamentos)                │
│ - ClickSign (Contratos)             │
│ - Copiar URLs de webhook geradas    │
└─────────────────────────────────────┘
```

#### 4. Imobiliária Já Pode Usar:
```
✅ Dashboard funcionando
✅ Cadastrar imóveis
✅ Receber leads
✅ Criar corretores
✅ Vitrine pública ativa em exclusiva.imobi.com.br (ou domínio customizado)
```

---

## 💰 MODELO DE ASSINATURA

### Planos:
```
Basic (R$ 479/mês):
- Até 3 corretores
- Até 50 imóveis
- CRM básico
- Vitrine pública
- Subdomínio grátis

Professional (R$ 759/mês): ⭐ Recomendado
- Até 10 corretores
- Imóveis ilimitados
- CRM completo
- Módulo de Locação
- Domínio customizado
- WhatsApp (Twilio)
- Assinatura digital

Enterprise (R$ 1.490/mês):
- Corretores ilimitados
- Imóveis ilimitados
- Todos os módulos
- Vistoria digital
- Multi-integração
- API própria
- Suporte prioritário
```

### Add-ons (Cobrados à Parte):
```
- SMS via Twilio: R$ 0,10/mensagem
- WhatsApp via Twilio: R$ 0,05/mensagem
- Assinatura digital: R$ 3,00/documento
- Vistoria digital: R$ 15,00/vistoria
- Relatórios avançados: R$ 99/mês
```

---

## 📊 MÉTRICAS DO SUPER ADMIN

### Dashboard Global (`admin.imobi.com.br/analytics`)
```
┌──────────────────────────────────────────────────┐
│ MRR (Monthly Recurring Revenue): R$ 45.540,00    │
│ Imobiliárias Ativas: 60                          │
│ Imobiliárias em Trial: 12                        │
│ Churn Rate: 3,2%                                 │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ Imóveis Cadastrados (Total): 8.450              │
│ Leads Gerados (Mês): 3.200                      │
│ Usuários Ativos (Corretores): 320               │
└──────────────────────────────────────────────────┘

Gráfico: Crescimento de Imobiliárias (12 meses)
Gráfico: Receita por Plano
Tabela: Top 10 Imobiliárias por Receita
```

---

## 🔧 PRÓXIMOS PASSOS DE IMPLEMENTAÇÃO

### Fase 1: Infraestrutura Multi-Tenant (2 semanas)
- [x] Collections já criadas (companies, properties, leads, etc.)
- [ ] Criar collection `users` no Directus
- [ ] Configurar roles (super_admin, company_admin, manager, agent)
- [ ] Implementar middleware de domínios
- [ ] Sistema de autenticação multi-tenant

### Fase 2: Painel Super Admin (1 semana)
- [ ] Página de login do super admin
- [ ] Dashboard global
- [ ] CRUD de imobiliárias
- [ ] Wizard de criação de empresa
- [ ] Métricas de faturamento

### Fase 3: Onboarding da Imobiliária (1 semana)
- [ ] Wizard de configuração inicial
- [ ] Upload de logo e cores
- [ ] Configuração de domínio customizado
- [ ] Criação do primeiro corretor admin
- [ ] Email de boas-vindas

### Fase 4: Painel da Imobiliária (2 semanas)
- [ ] Dashboard da imobiliária
- [ ] CRUD de imóveis (usar collection properties existente)
- [ ] CRM - Kanban de leads (usar collection leads existente)
- [ ] Gestão de corretores
- [ ] Configurações de integrações

### Fase 5: Vitrine Pública (1 semana)
- [ ] Home com imóveis em destaque
- [ ] Catálogo com filtros
- [ ] Detalhes do imóvel
- [ ] Formulário de contato (cria lead)
- [ ] Customização por empresa (logo, cores)

### Fase 6: Webhooks e Integrações (2 semanas)
- [ ] Endpoint `/webhooks/twilio/{company_id}`
- [ ] Endpoint `/webhooks/asaas/{company_id}`
- [ ] Endpoint `/webhooks/clicksign/{company_id}`
- [ ] Collection `webhooks_log`
- [ ] Processamento assíncrono

### Fase 7: Sistema de Assinaturas (1 semana)
- [ ] Integração com Asaas para cobranças
- [ ] Controle de limites por plano
- [ ] Suspensão automática por inadimplência
- [ ] Upgrade/downgrade de plano

---

## 🎯 RESUMO EXECUTIVO

**O que você faz:**
1. Acessa `admin.imobi.com.br`
2. Cadastra nova imobiliária (Exclusiva)
3. Sistema cria automaticamente:
   - Subdomínio: `exclusiva.imobi.com.br`
   - URLs de webhook
   - Envia email de boas-vindas

**O que a Imobiliária faz:**
1. Acessa `exclusiva.imobi.com.br`
2. Completa wizard de configuração (logo, cores, primeiro corretor)
3. Configura integrações (Twilio, Asaas)
4. Copia URLs de webhook para os serviços
5. Cadastra imóveis e corretores
6. Vitrine pública já funciona em `exclusiva.imobi.com.br` (ou domínio próprio)

**Dados isolados:**
- Cada imobiliária só vê seus dados (company_id)
- Corretores só veem dados da sua empresa
- Webhooks são roteados por company_id
- Integrações são configuradas por empresa

**Receita:**
- Assinatura mensal por imobiliária
- Add-ons por uso (SMS, assinaturas, etc.)
- Escalável para centenas de imobiliárias

---

**Agora ficou claro?** 🚀

Esta é a arquitetura correta de um SaaS multi-tenant onde cada imobiliária é completamente isolada, tem seu próprio domínio, configurações e integrações.
