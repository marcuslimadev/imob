# 📊 IMOBI - Plano de Desenvolvimento Completo e Integrado

**Atualizado em:** 24 de Novembro de 2025  
**Baseado em:** Análise de sistema real + Visão original do produto

---

## 🎯 VISÃO GERAL

A IMOBI é uma **plataforma SaaS imobiliária multi-tenant** que replica e supera as funcionalidades dos melhores sistemas do mercado, oferecendo uma solução completa para:

- Imobiliárias de venda
- Imobiliárias de locação  
- Administradoras de condomínios
- Corretores autônomos
- Hubs imobiliários

---

## 🏗️ ARQUITETURA MODULAR (5 Sistemas Principais)

Baseado na análise de sistemas reais do mercado, o IMOBI é composto por 5 módulos principais integrados:

### 1️⃣ **Módulo CRM & VENDAS**
Gestão completa do funil de vendas e relacionamento com clientes.

### 2️⃣ **Módulo LOCAÇÃO**  
Gestão de contratos de aluguel, inquilinos e proprietários.

### 3️⃣ **Módulo VISTORIA**
Sistema completo de vistorias (entrada, saída, periódicas).

### 4️⃣ **Módulo FINANCEIRO**
Gestão de fluxo de caixa, contas e repasses.

### 5️⃣ **Módulo ASSINATURAS DIGITAIS**
Assinatura eletrônica de contratos e documentos.

---

## 📋 FUNCIONALIDADES DETALHADAS POR MÓDULO

### 🔵 MÓDULO 1: CRM & VENDAS

#### 1.1 Central de Comunicação (Multicanal)
**Status das Mensagens Rastreáveis:**
- ⏳ Aguardando envio
- ✅ Enviado
- ❌ Erro
- 👁️ Aberto (lido)
- 🔗 Clicado (interação)

**Canais Suportados:**
- 📧 **E-mail** (com rastreamento de abertura e cliques)
- 📱 **SMS** (entrega e confirmação)
- 💬 **WhatsApp** (mensagens e status)

**Funcionalidades:**
```
✅ Filtros por período (De/Até)
✅ Filtros por status
✅ Filtros por canal
✅ Pesquisa livre por conteúdo/destinatário
✅ Visualização em tabela (Data, Destinatário, Assunto, Tipo, Status, Ações)
✅ Reenvio de mensagens
✅ Templates personalizados
✅ Histórico completo de interações
```

#### 1.2 Gestão de Leads
```
✅ Captura automática de leads (site, portais, redes sociais)
✅ Qualificação e pontuação (lead scoring)
✅ Funil de vendas customizável
✅ Atribuição automática para corretores
✅ Histórico completo de interações
✅ Tags e segmentação
✅ Lembretes e follow-ups automáticos
```

#### 1.3 Funil de Vendas
```
✅ Estágios customizáveis (Novo → Contatado → Qualificado → Visitando → Negociando → Ganho/Perdido)
✅ Kanban visual
✅ Propostas e contratos
✅ Cálculo automático de comissões
✅ Metas e relatórios de performance
```

---

### 🟢 MÓDULO 2: LOCAÇÃO

#### 2.1 Gestão de Contratos
```
✅ Criação de contratos de locação
✅ Gestão de inquilinos e proprietários
✅ Fiadores e garantias
✅ Índices de reajuste (IGP-M, IPCA, etc.)
✅ Renovações automáticas
✅ Rescisões e multas
✅ Histórico completo do contrato
```

#### 2.2 Repasses Financeiros
```
✅ Cálculo automático de repasses
✅ Deduções (taxas de administração, reparos, IPTU)
✅ Agenda de repasses
✅ Relatórios para proprietários
✅ Comprovantes digitais
```

#### 2.3 Cobranças
```
✅ Geração automática de boletos
✅ Integração com Pix
✅ Integração com cartão de crédito
✅ Lembretes de vencimento
✅ Gestão de inadimplência
✅ Multas e juros automáticos
```

---

### 🟡 MÓDULO 3: VISTORIA

#### 3.1 Tipos de Vistoria
```
✅ Vistoria de Entrada
✅ Vistoria de Saída
✅ Vistorias Periódicas
✅ Vistorias de Manutenção
```

#### 3.2 Funcionalidades
```
✅ Checklist customizável por tipo de imóvel
✅ Captura de fotos com geolocalização
✅ Assinatura digital no laudo
✅ Comparação entrada vs saída
✅ Geração automática de laudos em PDF
✅ Histórico de vistorias por imóvel
✅ Agendamento de vistorias
✅ App mobile para vistoria offline
```

#### 3.3 Estrutura de Dados
```
Collections:
- vistorias (id, property_id, type, date, inspector, status)
- vistoria_items (id, vistoria_id, room, item, condition, photos, notes)
- vistoria_signatures (id, vistoria_id, tenant_signature, owner_signature)
```

---

### 🔴 MÓDULO 4: FINANCEIRO

#### 4.1 Fluxo de Caixa
```
✅ Contas a Pagar
✅ Contas a Receber
✅ Categorização de despesas/receitas
✅ Centro de custos
✅ Conciliação bancária
✅ Previsão de fluxo de caixa
```

#### 4.2 Relatórios Financeiros
```
✅ DRE (Demonstração do Resultado do Exercício)
✅ Balancete
✅ Relatório de comissões
✅ Relatório de repasses
✅ Gráficos e dashboards
✅ Exportação para Excel/PDF
```

#### 4.3 Integrações Fiscais
```
✅ Emissão de NFS-e (via Asaas ou similar)
✅ Configuração de impostos por cidade
✅ Programação de emissões futuras
✅ Nota fiscal em parcelamentos
✅ Arquivo SPED
```

**Integração Asaas (Exemplo Real):**
- Emissão automática de NF-e
- Personalização de impostos
- Definição da data de emissão
- Emissões programadas em assinaturas

---

### 🟣 MÓDULO 5: ASSINATURAS DIGITAIS

#### 5.1 Gestão de Documentos
```
✅ Upload e armazenamento seguro
✅ Templates de contratos
✅ Preenchimento automático de campos
✅ Variáveis dinâmicas ({{nome_cliente}}, {{valor}}, etc.)
```

#### 5.2 Assinatura Eletrônica
```
✅ Envio para múltiplos signatários
✅ Ordem de assinatura
✅ Rastreamento de status (Pendente, Assinado, Recusado)
✅ Certificação digital (validade jurídica)
✅ Notificações automáticas
✅ Lembretes para pendentes
```

#### 5.3 Arquivamento
```
✅ Armazenamento seguro de contratos assinados
✅ Busca por cliente, imóvel ou data
✅ Download de documentos
✅ Histórico de alterações
✅ Backup automático
```

---

## 🗄️ BANCO DE DADOS COMPLETO

### Collections Principais

#### 1. **companies** (Imobiliárias)
```sql
id, name, slug, cnpj, email, phone, logo,
primary_color, secondary_color, custom_domain,
subscription_status, subscription_plan, subscription_expires_at
```

#### 2. **properties** (Imóveis)
```sql
id, company_id, title, description, property_type, transaction_type,
address, neighborhood, city, state, zip_code, latitude, longitude,
bedrooms, bathrooms, suites, parking_spaces, area_total, area_built,
price_sale, price_rent, price_condo, price_iptu, amenities, featured, views_count
```

#### 3. **property_media** (Fotos/Vídeos)
```sql
id, property_id, directus_file, is_cover, caption, sort
```

#### 4. **leads** (CRM)
```sql
id, company_id, name, email, phone, cpf, interest_type,
budget_min, budget_max, preferred_neighborhoods, bedrooms_min, property_types,
lead_source, lead_score, stage, assigned_to, tags, notes, status
```

#### 5. **lead_activities** (Histórico)
```sql
id, lead_id, activity_type, subject, description,
scheduled_at, completed_at, status
```

#### 6. **contracts** (Contratos de Locação)
```sql
id, company_id, property_id, tenant_id, owner_id,
start_date, end_date, rent_amount, readjustment_index,
guarantee_type, status, contract_file
```

#### 7. **tenants** (Inquilinos)
```sql
id, company_id, name, cpf, email, phone, address,
occupation, income, references, status
```

#### 8. **owners** (Proprietários)
```sql
id, company_id, name, cpf_cnpj, email, phone, bank_account,
commission_rate, status
```

#### 9. **vistorias** (Vistorias)
```sql
id, property_id, contract_id, type, inspection_date, inspector_id,
status, pdf_report, notes
```

#### 10. **vistoria_items** (Itens de Vistoria)
```sql
id, vistoria_id, room, item, condition, photos, observations
```

#### 11. **financial_transactions** (Transações Financeiras)
```sql
id, company_id, type, category, amount, description,
due_date, payment_date, status, contract_id, attached_file
```

#### 12. **messages** (Central de Mensagens)
```sql
id, company_id, recipient, channel, subject, content,
status, sent_at, opened_at, clicked_at, error_message
```

#### 13. **digital_signatures** (Assinaturas Digitais)
```sql
id, company_id, document_name, document_file, signers,
status, created_at, completed_at
```

#### 14. **invoices** (Notas Fiscais)
```sql
id, company_id, transaction_id, invoice_number, issue_date,
amount, tax_amount, pdf_file, status
```

---

## 📅 ROADMAP DE DESENVOLVIMENTO

### ✅ **Fase 0: MVP Base - FUNDAÇÃO COMPLETA**
**Status:** 60% Implementado | **Data:** 24 Nov 2025

#### ✅ CONCLUÍDO E FUNCIONANDO:

**Infraestrutura:**
- [x] Docker Compose configurado e rodando
- [x] Directus 11.12.0 operacional (http://localhost:8055)
- [x] PostgreSQL 16 + PostGIS
- [x] Redis para cache
- [x] Next.js 15.2.4 com Turbopack (http://localhost:3000)
- [x] TypeScript + Tailwind CSS + Shadcn UI

**Collections Criadas e Registradas:**
- [x] `companies` - Imobiliárias (multi-tenant)
- [x] `properties` - Imóveis (30+ campos)
- [x] `property_media` - Fotos e vídeos
- [x] `leads` - CRM básico
- [x] `lead_activities` - Histórico de interações
- [x] `property_views` - Analytics de visualizações

**Dados de Exemplo:**
- [x] 1 Empresa: Imobiliária Exclusiva (slug: exclusiva)
- [x] 6 Imóveis cadastrados (casas e apartamentos)
- [x] 6 Leads com diferentes estágios
- [x] Relacionamentos entre collections funcionando

**Frontend (Next.js):**
- [x] Estrutura base com App Router
- [x] Integração com Directus SDK
- [x] TypeScript schemas gerados
- [x] **Vitrine pública de imóveis** (`/properties?company=exclusiva`)
- [x] **Página de detalhes** do imóvel (`/properties/[id]?company=exclusiva`)
- [x] Componente DirectusImage para fotos
- [x] Fetchers reutilizáveis (realEstate.ts)
- [x] Filtros multi-tenant por company_id

**PR #3 - Add Directus-driven property pages:**
- [x] Criado há 2 dias
- [x] 4 arquivos modificados
- [x] Pronto para merge

**Arquivos de Documentação:**
- [x] `README_IMOBI.md`
- [x] `SETUP_MVP.md`
- [x] `COMO_USAR.md`
- [x] `GUIA_CRIAR_COLLECTIONS_MANUAL.md`
- [x] `PLANO_COMPLETO_INTEGRADO.md`
- [x] Scripts SQL (`setup_imobi.sql`, `criar_exclusiva.sql`)

#### ⏳ PENDENTE PARA COMPLETAR O MVP:

**Directus Admin:**
- [ ] Configurar permissões multi-tenant (roles e filters)
- [ ] Criar usuário da Imobiliária Exclusiva
- [ ] Configurar token público para vitrine
- [ ] Customizar ícones e cores das collections
- [ ] Configurar display templates

**Frontend - Painel Administrativo:**
- [ ] Dashboard com métricas (leads, imóveis, visitas)
- [ ] CRUD completo de imóveis (criar, editar, deletar)
- [ ] Gestão de leads (kanban, filtros)
- [ ] Upload múltiplo de fotos
- [ ] Sistema de autenticação (login multi-tenant)

**Integrações Básicas:**
- [ ] Mercado Pago (assinaturas e cobrança)
- [ ] E-mail (SendGrid ou Amazon SES)
- [ ] Configuração de domínio customizado (CNAME)

---

### 🔄 **Fase 1: CRM & Comunicação** 
**Prazo:** 14 dias

#### Semana 1-2:
- [ ] **Central de Mensagens**
  - [ ] Collection `messages` com campos de rastreamento
  - [ ] Integração com provedor de E-mail (SendGrid/Amazon SES)
  - [ ] Integração com provedor de SMS (Twilio/Zenvia)
  - [ ] Integração com WhatsApp Business API
  - [ ] Interface de envio multicanal
  - [ ] Filtros e pesquisa avançada
  - [ ] Dashboard de métricas (taxa de abertura, cliques)

- [ ] **Gestão de Leads Avançada**
  - [ ] Collection `lead_activities` completa
  - [ ] Funil de vendas (Kanban)
  - [ ] Lead scoring automático
  - [ ] Atribuição automática de leads
  - [ ] Templates de mensagens
  - [ ] Follow-ups automáticos
  - [ ] Relatórios de conversão

---

### 🏠 **Fase 2: Locação Completa**
**Prazo:** 21 dias

#### Semana 3-5:
- [ ] **Collections de Locação**
  - [ ] `contracts` (contratos)
  - [ ] `tenants` (inquilinos)
  - [ ] `owners` (proprietários)
  - [ ] `guarantees` (garantias)

- [ ] **Gestão de Contratos**
  - [ ] CRUD completo de contratos
  - [ ] Cálculo de reajuste (IGP-M, IPCA)
  - [ ] Renovações automáticas
  - [ ] Gestão de rescisões
  - [ ] Alertas de vencimento

- [ ] **Repasses Financeiros**
  - [ ] Cálculo automático de repasses
  - [ ] Deduções e taxas
  - [ ] Relatórios para proprietários
  - [ ] Comprovantes digitais

---

### 🔍 **Fase 3: Vistoria Digital**
**Prazo:** 14 dias

#### Semana 6-7:
- [ ] **Collections de Vistoria**
  - [ ] `vistorias`
  - [ ] `vistoria_items`
  - [ ] `vistoria_templates`

- [ ] **Sistema de Vistoria**
  - [ ] Templates customizáveis
  - [ ] App web de vistoria
  - [ ] Upload de fotos com geolocalização
  - [ ] Assinatura digital nos laudos
  - [ ] Geração de PDF automática
  - [ ] Comparação entrada vs saída

- [ ] **App Mobile (React Native)**
  - [ ] Vistoria offline
  - [ ] Sincronização automática
  - [ ] Captura de fotos
  - [ ] Geolocalização

---

### 💰 **Fase 4: Financeiro Avançado**
**Prazo:** 21 dias

#### Semana 8-10:
- [ ] **Collection `financial_transactions`**
  - [ ] Contas a pagar
  - [ ] Contas a receber
  - [ ] Categorização
  - [ ] Centro de custos

- [ ] **Fluxo de Caixa**
  - [ ] Dashboard financeiro
  - [ ] Conciliação bancária
  - [ ] Previsão de fluxo
  - [ ] Relatórios DRE

- [ ] **Integrações Fiscais**
  - [ ] Collection `invoices`
  - [ ] Integração Asaas (NFS-e)
  - [ ] Configuração de impostos
  - [ ] Emissão automática
  - [ ] Arquivo SPED

- [ ] **Cobranças**
  - [ ] Geração de boletos
  - [ ] Integração Pix
  - [ ] Cartão de crédito
  - [ ] Gestão de inadimplência

---

### ✍️ **Fase 5: Assinaturas Digitais**
**Prazo:** 14 dias

#### Semana 11-12:
- [ ] **Collection `digital_signatures`**
  - [ ] Upload de documentos
  - [ ] Definir signatários
  - [ ] Rastreamento de status

- [ ] **Integração ClickSign ou D4Sign**
  - [ ] Envio de documentos
  - [ ] Webhook de status
  - [ ] Download de assinados

- [ ] **Templates de Contratos**
  - [ ] Editor de templates
  - [ ] Variáveis dinâmicas
  - [ ] Preenchimento automático

---

### 🚀 **Fase 6: Integrações e Add-ons**
**Prazo:** 30 dias

#### Semana 13-16:
- [ ] **Portais Imobiliários**
  - [ ] Integração OLX
  - [ ] Integração VivaReal
  - [ ] Integração ZapImóveis
  - [ ] Sincronização automática

- [ ] **Consultas de Crédito**
  - [ ] Integração SPC
  - [ ] Integração Serasa
  - [ ] Relatórios de crédito

- [ ] **Seguro Fiança**
  - [ ] Cálculo de seguro
  - [ ] Envio de propostas
  - [ ] Gestão de apólices

- [ ] **AVM (Avaliação Automática)**
  - [ ] Algoritmo de precificação
  - [ ] Análise de mercado
  - [ ] Sugestões de preço

---

### 📊 **Fase 7: BI e Analytics**
**Prazo:** 14 dias

#### Semana 17-18:
- [ ] **Dashboards Avançados**
  - [ ] Métricas de vendas
  - [ ] Métricas de locação
  - [ ] Performance de corretores
  - [ ] ROI por canal

- [ ] **Relatórios Customizados**
  - [ ] Construtor de relatórios
  - [ ] Exportação Excel/PDF
  - [ ] Agendamento de envios

---

## 💰 MODELO DE NEGÓCIO

### Plano Único
**R$ 759/mês** (½ salário mínimo)

**Incluso:**
- Usuários ilimitados
- Imóveis ilimitados
- Leads ilimitados
- 5 módulos principais
- Suporte via chat
- Armazenamento: 50GB

### Add-ons (Receita Extra)

| Add-on | Preço | Descrição |
|--------|-------|-----------|
| **Consultas SPC/Serasa** | R$ 15/consulta | Análise de crédito |
| **Seguro Fiança** | 2% do valor | Comissão por apólice |
| **NFS-e Automática** | R$ 79/mês | Emissão ilimitada |
| **AVM Premium** | R$ 149/mês | Avaliações ilimitadas |
| **App Mobile Personalizado** | R$ 499/mês | White label completo |
| **Marketing Pro** | R$ 299/mês | 5.000 SMS + 10.000 emails |
| **Portal Proprietário Pro** | R$ 99/mês | Recursos avançados |
| **Armazenamento Extra** | R$ 49/100GB | Espaço adicional |

### Meta de Receita

**Para R$ 10.000/mês:**
- 19 clientes no plano base
- ou 15 clientes com add-ons

---

## 🛠️ STACK TECNOLÓGICA

### Backend
- **Directus** 11.12.0 (Headless CMS)
- **PostgreSQL** 16 + PostGIS
- **Redis** (cache)
- **Node.js** 18+

### Frontend
- **Next.js** 15 (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI**

### Mobile
- **React Native** (Expo)
- **TypeScript**

### Integrações
- **SendGrid/Amazon SES** (E-mail)
- **Twilio/Zenvia** (SMS)
- **WhatsApp Business API**
- **ClickSign/D4Sign** (Assinatura digital)
- **Asaas** (Pagamentos + NFS-e)
- **SPC/Serasa** (Consultas)

### Deploy
- **Render** (Backend)
- **Vercel** (Frontend)
- **AWS S3** (Arquivos)
- **Cloudflare** (CDN)

---

## 🎨 UX/UI - Padrões de Interface

### Dashboard Principal
```
┌─────────────────────────────────────────────┐
│  IMOBI - Imobiliária Exclusiva       [user] │
├─────────────────────────────────────────────┤
│ ☰ Menu                                      │
│   Dashboard                                 │
│   📊 CRM & Vendas                          │
│   🏠 Locação                               │
│   🔍 Vistorias                             │
│   💰 Financeiro                            │
│   ✍️ Assinaturas                           │
│   📧 Mensagens                             │
├─────────────────────────────────────────────┤
│  Cards de Resumo:                           │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐       │
│  │Leads│  │Visitas│ │Propostas│ │Vendas│   │
│  │ 45  │  │ 12   │ │   8    │ │  3   │    │
│  └─────┘  └─────┘  └─────┘  └─────┘       │
│                                             │
│  📈 Gráficos e Métricas                    │
└─────────────────────────────────────────────┘
```

### Central de Mensagens
```
┌─────────────────────────────────────────────┐
│ 📧 Central de Mensagens                     │
├─────────────────────────────────────────────┤
│ Filtros:                                    │
│ [De: __/__/____] [Até: __/__/____]         │
│ Status: [Todos ▼] Canal: [Todos ▼]         │
│ 🔍 Pesquisar...                            │
├─────────────────────────────────────────────┤
│ Data      │ Dest.    │ Assunto │ Canal │ Status│
│ 24/11 10h │ João     │ Proposta│ Email │ 👁️ Aberto│
│ 24/11 09h │ Maria    │ Visita  │ WhatsApp│ ✅ Enviado│
│ 23/11 15h │ Pedro    │ Contrato│ SMS   │ 🔗 Clicado│
└─────────────────────────────────────────────┘
```

---

## 🔐 SEGURANÇA E MULTI-TENANCY

### Isolamento de Dados
```javascript
// Exemplo de filtro automático por empresa
const properties = await directus.items('properties').readByQuery({
  filter: {
    company_id: { _eq: currentUser.company_id }
  }
});
```

### Permissões por Role
- **SuperAdmin**: Acesso total
- **Company Admin**: Gerencia sua imobiliária
- **Corretor**: Acessa apenas seus leads
- **Vistoriador**: Apenas vistorias
- **Public**: Vitrine pública

---

## 📈 MÉTRICAS DE SUCESSO

### KPIs do Produto
- Tempo médio de onboarding: < 30 min
- Taxa de retenção: > 90%
- NPS: > 50
- Uptime: > 99.9%

### KPIs de Negócio
- CAC (Custo de Aquisição): < R$ 500
- LTV (Lifetime Value): > R$ 15.000
- Churn: < 5%/mês
- MRR Growth: > 20%/mês

---

## 📚 DOCUMENTAÇÃO

Arquivos de referência:
- `README_IMOBI.md` - Visão geral
- `SETUP_MVP.md` - Status atual (40% MVP)
- `COMO_USAR.md` - Guia do usuário
- `GUIA_CRIAR_COLLECTIONS_MANUAL.md` - Setup collections
- `DEPLOY.md` - Deploy em produção

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

> **BASE SÓLIDA:** Sistema multi-tenant funcionando com Directus + Next.js + PostgreSQL

### ✅ JÁ TEMOS (Manter e Evoluir):
- ✅ 6 Collections funcionais (companies, properties, leads, property_media, lead_activities, property_views)
- ✅ Vitrine pública de imóveis responsiva
- ✅ Detalhes do imóvel com fotos
- ✅ Filtros multi-tenant por company_id
- ✅ Imobiliária Exclusiva cadastrada com dados reais
- ✅ Infraestrutura Docker completa
- ✅ Integração Directus SDK funcionando

### Semana Atual (24-30 Nov):
1. ✅ ~~Finalizar PR #3 (páginas de imóveis)~~ - **MERGE AGORA**
2. ⏳ Configurar permissões multi-tenant no Directus (1h)
3. ⏳ Criar usuário admin@exclusiva.com.br (30min)
4. ⏳ Dashboard administrativo usando collections existentes (8h)
5. ⏳ CRUD de imóveis no painel admin (6h)
6. ⏳ Gestão de leads - interface Kanban (8h)

### Dezembro:
- Completar Módulo CRM & Comunicação
- Iniciar Módulo de Locação
- Setup de integrações (e-mail, SMS)

---

**Desenvolvido com ❤️ para revolucionar o mercado imobiliário brasileiro**

---

*Este documento é vivo e será atualizado conforme o desenvolvimento avança.*
