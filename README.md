# iMOBI - CRM Imobiliário Inteligente Multi-Tenant com WhatsApp + IA

Sistema **SaaS multi-tenant** completo para gestão de imobiliárias com atendimento WhatsApp automatizado, inteligência artificial (GPT-4o-mini + Whisper) e funil de vendas de 17 stages.

## 🎯 Sobre o Projeto

Este projeto é uma **migração e modernização completa** do sistema [Exclusiva](https://github.com/marcuslimadev/exclusiva) (Lumen + Vue.js) para uma stack moderna com **arquitetura multi-tenant**:

- **Backend:** Directus 11 (Headless CMS + API)
- **Frontend:** Next.js 15 + Tailwind CSS
- **IA:** OpenAI GPT-4o-mini + Whisper
- **WhatsApp:** Twilio API
- **Database:** PostgreSQL + PostGIS + Redis
- **Multi-Tenancy:** Isolamento completo de dados por empresa

**Status:** 🚧 **Migração em andamento** (30% concluído)

---

## 🏢 Arquitetura Multi-Tenant

> **"Quando pronto, eu apenas tenho que criar um acesso para a empresa cliente e tudo funcione de acordo com o login e configurações dela"**

Cada empresa cliente tem:
- ✅ Configurações isoladas (API keys, credenciais)
- ✅ Dados isolados (leads, conversas, propriedades)
- ✅ Usuários vinculados à empresa
- ✅ WhatsApp próprio com assistente AI personalizado

**Documentação completa:** [ARQUITETURA_MULTI_TENANT.md](./ARQUITETURA_MULTI_TENANT.md)

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    Directus (Backend)                    │
│                   localhost:8055                         │
├─────────────────────────────────────────────────────────┤
│ ✅ 16 Collections (multi-tenant)                        │
│    - companies (empresas clientes)                      │
│    - app_settings (configs por empresa)                 │
│    - leads, conversas, mensagens, properties...         │
│ ✅ 3 Custom Extensions (OpenAI, Twilio, WhatsApp)       │
│ ✅ Helper multi-tenant (company-settings.js)            │
│ ✅ PostgreSQL + PostGIS + Redis                         │
│ ✅ API REST + GraphQL                                   │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                    Next.js (Frontend)                    │
│                   localhost:3000                         │
├─────────────────────────────────────────────────────────┤
│ ✅ Landing Page (/home)                                 │
│ ⏳ Dashboard CRM (filtrado por empresa)                 │
│ ⏳ Chat WhatsApp (em desenvolvimento)                    │
│ ⏳ Gerenciamento de Leads (em desenvolvimento)           │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│              Integrações Externas                        │
├─────────────────────────────────────────────────────────┤
│ 🤖 OpenAI API (GPT-4o-mini + Whisper)                  │
│ 📱 Twilio WhatsApp API                                  │
│ 🏠 API Externa de Imóveis                               │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Funcionalidades

### ✅ Implementado

- [x] Collections Directus (16 tabelas incluindo multi-tenant)
- [x] Collection: `companies` (empresas clientes)
- [x] Collection: `app_settings` (configurações por empresa)
- [x] Extension: OpenAI Service (5 endpoints)
- [x] Extension: Twilio Client (4 endpoints)
- [x] Extension: WhatsApp Webhook (2 endpoints)
- [x] Helper: company-settings.js (6 funções multi-tenant)
- [x] Landing Page Next.js
- [x] Suporte para Twilio e Evolution API
- [x] Documentação arquitetura multi-tenant

### ⏳ Em Desenvolvimento

- [ ] Adicionar company_id em directus_users
- [ ] Configurar Roles e Permissions por empresa
- [ ] Atualizar extensões para usar helper multi-tenant
- [ ] Lógica completa de processamento WhatsApp
- [ ] Sistema de 17 stages do funil
- [ ] Transcrição de áudio (Whisper)
- [ ] Extração automática de dados via IA
- [ ] Matching automático de imóveis
- [ ] Dashboard CRM (Next.js)
- [ ] Chat WhatsApp em tempo real (Next.js)
- [ ] Gerenciamento de Leads (Next.js)
- [ ] Worker de sincronização de imóveis

### 📋 Planejado

- [ ] Sistema multi-tenant completo
- [ ] Automações via Directus Flows
- [ ] Testes E2E
- [ ] Deploy em produção

---

## 🚀 Quick Start

### 1. Iniciar Directus (Backend)

```powershell
cd directus
docker compose up -d
```

**Acesso:** http://localhost:8055
- **Login:** marcus@admin.com
- **Senha:** Teste@123

### 2. Iniciar Next.js (Frontend)

```powershell
cd nextjs
npm install
npm run dev
```

**Acesso:** http://localhost:3000/home

---

## 🔁 Deploy automático na AWS

- **Como dispara:** qualquer `git push` para os branches `main` ou `master` executa o workflow [deploy.yml](.github/workflows/deploy.yml), que conecta na EC2, faz `git pull`, reconstrói Directus (Docker Compose) e Next.js (pnpm) e reinicia o PM2 com zero-downtime.
- **Pré-requisitos:** secrets `EC2_SSH_KEY`, `EC2_HOST` e `EC2_USER` configurados no repositório do GitHub, Node 20 + pnpm + PM2 instalados na EC2 e o projeto clonado em `/home/ubuntu/exclusiva-prod/imob`.
- **Ver status:** acompanhe a execução em **Actions → Deploy to AWS EC2**. Falhas aparecem no log e o health check valida Directus e Next.js ao final.

---

## 📦 Extensões Directus

### 1. OpenAI Service (`/openai`)

```bash
POST /openai/transcribe        # Transcrever áudio (Whisper)
POST /openai/chat               # Chat completion (GPT)
POST /openai/extract            # Extrair dados estruturados
POST /openai/diagnostic         # Gerar diagnóstico de lead
POST /openai/process-message    # Processar mensagem completa
```

### 2. Twilio Client (`/twilio`)

```bash
POST /twilio/send-message       # Enviar mensagem WhatsApp
POST /twilio/send-image         # Enviar imagem
POST /twilio/download-media     # Baixar mídia (áudio/imagem)
GET  /twilio/message-status/:sid # Consultar status
```

### 3. WhatsApp Webhook (`/whatsapp`)

```bash
POST /whatsapp                  # Receber webhooks (Twilio/Evolution)
POST /whatsapp/status           # Status callbacks
```

---

## 🗄️ Collections (Directus)

| Collection | Descrição |
|-----------|-----------|
| `companies` | Empresas (multi-tenant) |
| `properties` | Imóveis |
| `leads` | Leads/Clientes |
| `conversas` | Conversas WhatsApp |
| `mensagens` | Mensagens (incoming/outgoing) |
| `lead_property_matches` | Matching lead ↔ imóvel |
| `atividades` | Timeline de atividades |
| `webhooks_log` | Logs de webhooks |
| `logs` | Logs gerais do sistema |
| `job_status` | Status de jobs/workers |

---

## 🔧 Configuração

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
AI_ASSISTANT_NAME=Teresa

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Directus
PUBLIC_URL=http://localhost:8055
```

---

## 📖 Documentação

- [Plano de Migração Completo](PLANO_MIGRACAO_EXCLUSIVA.md)
- [Extensões Directus](directus/extensions/README_EXTENSOES.md)
- [Mapeamento Lumen → Directus](MAPPING.md)

---

## 🧪 Testes

### Testar OpenAI Service

```bash
curl -X POST http://localhost:8055/openai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "systemPrompt": "Você é um assistente virtual.",
    "userPrompt": "Olá!"
  }'
```

### Testar Twilio

```bash
curl -X POST http://localhost:8055/twilio/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+5511999999999",
    "message": "Teste"
  }'
```

### Testar Webhook WhatsApp

```bash
curl -X POST http://localhost:8055/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "From": "whatsapp:+5511999999999",
    "Body": "Olá, teste",
    "MessageSid": "SM123",
    "ProfileName": "João"
  }'
```

---

## 🗺️ Roadmap

### Semana 1 (25/11 - 01/12) - Backend Core ✅
- [x] Criar collections Directus
- [x] Extension: OpenAI Service
- [x] Extension: Twilio Client
- [x] Extension: WhatsApp Webhook

### Semana 2 (02/12 - 08/12) - Lógica de Negócio
- [ ] WhatsApp Service completo
- [ ] Sistema de 17 stages
- [ ] Worker de sync de imóveis
- [ ] Testes integrados

### Semana 3 (09/12 - 15/12) - Frontend
- [ ] Dashboard CRM
- [ ] Chat WhatsApp
- [ ] Gerenciamento de Leads
- [ ] Vitrine pública

### Semana 4 (16/12 - 22/12) - Deploy
- [ ] Automações (Flows)
- [ ] Testes E2E
- [ ] Deploy produção
- [ ] Documentação final

---

## 🤝 Contribuindo

Este é um projeto privado em desenvolvimento ativo. Contribuições serão aceitas após a versão 1.0.

---

## 📄 Licença

Proprietary - Todos os direitos reservados

---

## 🔗 Links

- **Repositório:** https://github.com/marcuslimadev/imob
- **Exclusiva (Original):** https://github.com/marcuslimadev/exclusiva
- **Directus:** https://directus.io
- **Next.js:** https://nextjs.org

---

**Última atualização:** 25/11/2025  
**Status:** 🚧 Migração em andamento (25% concluído)
