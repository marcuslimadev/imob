# 🚀 Plano de Migração Completa - Exclusiva → iMOBI

## 📋 Contexto

O repositório [marcuslimadev/exclusiva](https://github.com/marcuslimadev/exclusiva) contém um sistema CRM imobiliário **100% funcional** com:
- Backend Lumen (Laravel) com Twilio WhatsApp + OpenAI
- Frontend Vue 3 + Tailwind
- Sync worker para importação de imóveis
- 17 stages de funil inteligente
- Transcrição de áudio (Whisper)
- Matching automático de imóveis
- Dashboard em tempo real

**Objetivo:** Migrar TODO este ecossistema para a stack iMOBI (Directus + Next.js), mantendo 100% das funcionalidades.

---

## 🎯 Componentes a Migrar

### 1. **Services (Backend Lumen → Directus)**

#### 1.1 WhatsAppService.php → Directus Flows + Webhooks
- **Arquivo original:** `backend/app/Services/WhatsAppService.php` (1.479 linhas)
- **Funcionalidades:**
  - Processar webhooks Twilio/Evolution API
  - Transcrever áudios via Whisper
  - Extrair dados de leads via IA
  - Matching automático de imóveis
  - 17 stages do funil (boas_vindas → fechamento)
  - Envio de mensagens via Twilio
  
- **Migração:**
  - Criar Directus Flow `whatsapp-webhook` (trigger: webhook POST `/whatsapp`)
  - Criar operação custom `process-whatsapp-message`
  - Integrar com Directus SDK para CRUD de `conversas` e `mensagens`
  - Manter lógica de stages em JavaScript

#### 1.2 OpenAIService.php → Directus Extension/Module
- **Arquivo original:** `backend/app/Services/OpenAIService.php` (407 linhas)
- **Funcionalidades:**
  - Chat Completion (GPT-4o-mini)
  - Whisper transcription
  - Extração de dados estruturados (JSON)
  - Geração de diagnóstico de lead
  
- **Migração:**
  - Criar Directus Extension `openai-service`
  - Endpoints: `/ai/chat`, `/ai/transcribe`, `/ai/extract`, `/ai/diagnostic`
  - Reutilizar prompts existentes do arquivo original

#### 1.3 TwilioService.php → Directus Extension
- **Arquivo original:** `backend/app/Services/TwilioService.php` (102 linhas)
- **Funcionalidades:**
  - Envio de mensagens WhatsApp
  - Download de mídia
  
- **Migração:**
  - Criar helper `twilio-client.js` em Directus
  - Usar variáveis de ambiente (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

#### 1.4 StageDetectionService.php → Directus Flow
- **Arquivo original:** `backend/app/Services/StageDetectionService.php`
- **Funcionalidades:**
  - Detectar próximo stage baseado em mensagem
  - Regras de transição automática
  
- **Migração:**
  - Criar módulo `stage-detector.js` em Directus
  - Implementar lógica de decisão em JavaScript

---

### 2. **Controllers (API Routes → Directus Endpoints)**

#### 2.1 WebhookController → Directus Webhook Endpoint
- **Arquivo original:** `backend/app/Http/Controllers/WebhookController.php`
- **Rotas:**
  - POST `/webhook/whatsapp` → Receber mensagens
  - POST `/webhook/whatsapp/status` → Status de entrega
  
- **Migração:**
  - Criar endpoint customizado `directus/extensions/endpoints/whatsapp/index.js`
  - Processar payload Twilio/Evolution API
  - Chamar WhatsAppService adaptado

#### 2.2 LeadsController → Directus Collections + Permissions
- **Arquivo original:** `backend/app/Http/Controllers/LeadsController.php` (396 linhas)
- **Rotas:**
  - GET `/api/leads` → Lista com filtros
  - GET `/api/leads/{id}` → Detalhes
  - PUT `/api/leads/{id}` → Atualizar
  - POST `/api/leads/{id}/diagnostic` → Gerar diagnóstico IA
  
- **Migração:**
  - Usar Directus REST API padrão (`/items/leads`)
  - Criar endpoint custom `/leads/{id}/diagnostic` para IA

#### 2.3 ConversasController → Directus Collections
- **Arquivo original:** `backend/app/Http/Controllers/ConversasController.php`
- **Rotas:**
  - GET `/api/conversas` → Lista
  - GET `/api/conversas/{id}` → Chat completo
  - POST `/api/conversas/{id}/mensagens` → Enviar mensagem
  
- **Migração:**
  - Usar `/items/conversas` e `/items/mensagens`
  - Endpoint custom `/conversas/{id}/send` para envio via Twilio

#### 2.4 PropertiesController → Directus Collections
- **Arquivo original:** `backend/app/Http/Controllers/PropertiesController.php`
- **Rotas:**
  - POST `/api/properties/sync` → Sincronizar com API externa
  
- **Migração:**
  - Criar Flow `sync-properties` (cron ou manual)
  - Reutilizar lógica do `sync_worker.php`

---

### 3. **Sync Worker (PHP → Node.js)**

#### 3.1 sync_worker.php → Node.js Script
- **Arquivo original:** `backend/sync_worker.php` (180 linhas)
- **Funcionalidades:**
  - Buscar lista de imóveis da API externa
  - Processar detalhes de cada imóvel
  - Salvar no banco de dados
  - Gerar descrição com IA (opcional)
  
- **Migração:**
  - Criar `directus/workers/sync-properties.js`
  - Usar Directus SDK para inserir em `properties`
  - Usar `p-queue` para controle de rate limit
  - Logs em `job_status` collection

---

### 4. **Frontend (Vue 3 → Next.js 15)**

#### 4.1 Dashboard → Next.js Page
- **Arquivo original:** `frontend/src/views/Dashboard.vue` (487 linhas)
- **Componentes:**
  - Estatísticas (total leads, conversões, novos hoje)
  - Configuração do atendimento (nome da IA)
  - Últimas conversas
  
- **Migração:**
  - Criar `nextjs/src/app/dashboard/page.tsx`
  - Fetch via Directus SDK
  - Usar shadcn/ui para cards e stats

#### 4.2 Conversas (Chat WhatsApp) → Next.js Page
- **Arquivo original:** `frontend/src/views/Conversas.vue` (612 linhas)
- **Componentes:**
  - Lista de conversas (sidebar)
  - Chat com mensagens em tempo real
  - Input para enviar mensagens
  - Indicadores de status (lida, enviada)
  
- **Migração:**
  - Criar `nextjs/src/app/conversas/page.tsx`
  - WebSocket ou polling para tempo real
  - Componente `<ChatMessage>` reutilizável

#### 4.3 Leads (CRM) → Next.js Page
- **Arquivo original:** `frontend/src/views/Leads.vue` (584 linhas)
- **Componentes:**
  - Tabela de leads com filtros
  - Detalhes do lead (modal)
  - Histórico de atividades
  - Geração de diagnóstico IA
  
- **Migração:**
  - Criar `nextjs/src/app/leads/page.tsx`
  - Usar `@tanstack/react-table` para tabela
  - Modal com shadcn/ui Dialog

#### 4.4 Imoveis (Vitrine Pública) → Next.js Page
- **Arquivo original:** `frontend/src/views/Imoveis.vue` (548 linhas)
- **Componentes:**
  - Grid de imóveis com filtros
  - Modal de detalhes
  - Botão WhatsApp "Tenho Interesse"
  
- **Migração:**
  - Já existe em `nextjs/src/app/vitrine/page.tsx`
  - Ajustar para consumir Directus SDK

---

### 5. **Database Schema (MySQL → PostgreSQL/Directus)**

#### 5.1 Tabelas do Lumen → Collections Directus
- **Arquivos originais:** `database/migrations/*.php`
- **Tabelas principais:**
  - `users` → `directus_users`
  - `imo_properties` → `properties`
  - `leads` → `leads`
  - `conversas` → `conversas`
  - `mensagens` → `mensagens`
  - `lead_property_matches` → `lead_property_matches`
  - `atividades` → `atividades`
  - `webhooks_log` → `webhooks_log`
  
- **Migração:**
  - Já criadas via `register-collections.js` e `register-fields.js`
  - Verificar relacionamentos (M2O, O2M)

---

### 6. **Funil de Stages (17 Stages Inteligentes)**

#### 6.1 Documentação do Funil
- **Arquivo original:** `backend/FUNIL_STAGES.md` (230 linhas)
- **Stages:**
  1. boas_vindas
  2. coleta_dados
  3. aguardando_info
  4. matching
  5. apresentacao
  6. interesse
  7. refinamento
  8. sem_match
  9. agendamento
  10. visita_agendada
  11. pos_visita
  12. negociacao
  13. fechamento
  14. perdido
  15. follow_up
  16. inativo
  17. aguardando_corretor

- **Migração:**
  - Criar enum `stage` na collection `conversas`
  - Implementar lógica de transição em Directus Flow
  - Automações baseadas em tempo (follow_up, inativo)

---

## 🗓️ Cronograma de Execução

### Semana 1: Infraestrutura e Backend Core
- [x] Dia 1-2: Criar collections e fields no Directus
- [ ] Dia 3-4: Migrar TwilioService e OpenAIService
- [ ] Dia 5-7: Criar webhook `/whatsapp` e processar mensagens

### Semana 2: Lógica de Negócio
- [ ] Dia 8-10: Implementar WhatsAppService (stages, matching)
- [ ] Dia 11-12: Migrar sync_worker.php para Node.js
- [ ] Dia 13-14: Testar fluxo completo (webhook → IA → resposta)

### Semana 3: Frontend
- [ ] Dia 15-16: Dashboard Next.js
- [ ] Dia 17-18: Conversas (Chat WhatsApp)
- [ ] Dia 19-20: Leads (CRM)
- [ ] Dia 21: Vitrine pública

### Semana 4: Testes e Deploy
- [ ] Dia 22-24: Testes integrados (WhatsApp real)
- [ ] Dia 25-26: Deploy (Directus + Next.js)
- [ ] Dia 27-28: Documentação e handoff

---

## 🔧 Tecnologias Mapeadas

| Componente Exclusiva | Tecnologia Usada | Equivalente iMOBI |
|---------------------|------------------|-------------------|
| Backend | Lumen (Laravel) | Directus 11 |
| Database | MySQL | PostgreSQL |
| WhatsApp | Twilio API | Twilio API (manter) |
| IA | OpenAI GPT-4o-mini + Whisper | OpenAI (manter) |
| Frontend | Vue 3 + Tailwind | Next.js 15 + Tailwind |
| Real-time | Polling | WebSocket/Polling |
| Autenticação | JWT | Directus Auth |
| File Upload | Local storage | Directus Files |

---

## ✅ Checklist de Paridade

### Backend
- [ ] Webhook WhatsApp funcionando
- [ ] Transcrição de áudio (Whisper)
- [ ] IA conversacional (GPT)
- [ ] Extração de dados estruturados
- [ ] Matching automático de imóveis
- [ ] 17 stages do funil
- [ ] Envio de mensagens Twilio
- [ ] Sync worker de imóveis
- [ ] Diagnóstico IA de leads

### Frontend
- [ ] Dashboard com estatísticas
- [ ] Chat WhatsApp (enviar/receber)
- [ ] Lista de leads com filtros
- [ ] Detalhes do lead (modal)
- [ ] Vitrine pública de imóveis
- [ ] Modal de detalhes do imóvel
- [ ] Botão WhatsApp "Tenho Interesse"

### Automações
- [ ] Boas-vindas automáticas
- [ ] Matching ao detectar dados suficientes
- [ ] Follow-up após 3 dias sem resposta
- [ ] Inativação após 7 dias
- [ ] Lembrete 1 dia antes da visita
- [ ] Feedback pós-visita

---

## 📦 Entregáveis Finais

1. **Directus configurado:**
   - Collections criadas
   - Endpoints customizados
   - Flows WhatsApp
   - Extensions (OpenAI, Twilio)

2. **Next.js funcionando:**
   - Dashboard
   - Conversas
   - Leads
   - Vitrine

3. **Worker de sync:**
   - Script Node.js
   - Cron job configurado
   - Logs em `job_status`

4. **Documentação:**
   - README.md atualizado
   - Guia de deploy
   - Variáveis de ambiente

---

## 🚀 Próximos Passos Imediatos

1. Criar Directus Extension `openai-service`
2. Criar Directus Extension `twilio-client`
3. Criar endpoint custom `/whatsapp` (webhook)
4. Implementar lógica de stages em JavaScript
5. Testar com mensagem WhatsApp real

---

**Atualizado em:** 25/11/2025  
**Status:** Planejamento concluído, iniciando migração
