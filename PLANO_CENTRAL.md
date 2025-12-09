# PLANO CENTRAL IMOBI - Desenvolvimento Completo
**Atualizado:** 01/12/2025  
**Repositório:** marcuslimadev/imob  
**Stack:** Next.js 15 (App Router) + Directus 11 + PostgreSQL + Redis

---

## 🚀 DEPLOY DE PRODUÇÃO - EXCLUSIVA IMÓVEIS

**Status:** 🟢 Pronto para deploy  
**Cliente:** Exclusiva Lar Imóveis  
**Domínio:** exclusivalarimoveis.com.br  
**Infraestrutura:** AWS EC2 + Docker + Nginx + Let's Encrypt

### Arquivos de Deploy Criados:
- ✅ `DEPLOY_PRODUCAO_AWS.md` - Guia completo step-by-step
- ✅ `CHECKLIST_DEPLOY.md` - Checklist interativo (21 etapas)
- ✅ `directus/docker-compose.production.yml` - Stack Directus para produção
- ✅ `directus/.env.production.template` - Template de variáveis
- ✅ `nextjs/.env.production.template` - Template Next.js
- ✅ `nginx/directus.conf` - Virtual host Directus com SSL
- ✅ `nginx/nextjs.conf` - Virtual host Next.js com SSL  
- ✅ `nextjs/ecosystem.config.js` - PM2 cluster mode
- ✅ `scripts/deploy-production.sh` - Script automatizado de deploy
- ✅ `scripts/test-production.sh` - Testes E2E automatizados

### Próximos Passos para Deploy:
1. Provisionar EC2 (t3.medium, Ubuntu 24.04)
2. Configurar DNS (3 registros A)
3. Executar `scripts/deploy-production.sh` na EC2
4. Gerar certificados SSL com Certbot
5. Configurar webhook Twilio
6. Executar `scripts/test-production.sh`
7. **Tempo estimado:** 3-4 horas

---

## 📊 VISÃO GERAL DO PROGRESSO

### Status Global: **66% Concluído** (+21% no Sprint 1)

| Módulo | Status | Progresso | Prioridade |
|--------|--------|-----------|------------|
| **Infraestrutura Base** | ✅ Completo | 100% | - |
| **Deploy Produção** | 🟢 Pronto | 100% (assets) | 🔴 Alta |
| **Autenticação Multi-tenant** | ⚠️ Parcial | 85% (+40%) | 🔴 Alta |
| **Pessoas (Leads/Clientes)** | ⚠️ Parcial | 85% (+35%) | 🟡 Média |
| **Imóveis** | ✅ Completo | 95% (+15%) | ✅ Concluído |
| **Conversas WhatsApp** | ⚠️ Parcial | 50% (+10%) | 🟡 Média |
| **Vistoria** | ❌ Não Iniciado | 0% | 🔴 Alta |
| **Assinatura Eletrônica** | ⚠️ Preparado | 20% | 🟡 Média |
| **Vitrines Públicas** | ⚠️ Parcial | 40% | 🔴 Alta |
| **Dashboard/Analytics** | ✅ Completo | 100% (+70%) | ✅ Concluído |
| **Admin Multi-empresa** | ⚠️ Mock | 25% | 🟡 Média |

---

## 🎯 MÓDULOS DETALHADOS

### 1️⃣ Infraestrutura Base ✅ (100%)

**O que está pronto:**
- ✅ Docker Compose (Directus + PostgreSQL + Redis)
- ✅ 14 Collections criadas no Directus
- ✅ Scripts de schema (`register-collections.js`, `register-fields.js`)
- ✅ Helper multi-tenant (`company-settings.js`)
- ✅ Middleware de detecção de tenant (`src/middleware.ts`)
- ✅ Directus SDK configurado (server + client)
- ✅ Seed data básico

**Comandos de setup:**
```powershell
cd directus
docker compose up -d
node register-collections.js
node register-fields.js
node seed-data.js

cd ../nextjs
pnpm install
pnpm dev  # http://localhost:4000
```

---

### 2️⃣ Autenticação Multi-tenant ⚠️ (85%)

**✅ O que funciona:**
- Login via Directus SDK (`/login`)
- Context de autenticação (`AuthContext.tsx`)
- Middleware detecta empresa por subdomínio/query
- Campo `company_id` existe em `directus_users`
- Middleware protege `/empresa/*`, `/admin/*`, `/leads`, `/conversas` e renova tokens com refresh cookie automaticamente
- `/api/auth/me` renova sessão silenciosamente e persiste cookies + `design-theme` sincronizado

**❌ O que falta:**
- [ ] Sistema de permissões por role (scripts prontos, não aplicados)
- [ ] Validação `company_id` em todas as queries/filters dos módulos

**Arquivos críticos:**
- `nextjs/src/middleware.ts` (proteção + refresh)
- `nextjs/src/app/api/auth/me/route.ts` (renovação server-side)
- `nextjs/src/contexts/AuthContext.tsx` (sessão)
- `directus/setup-roles.js` (criar roles)
- `directus/setup-role-permissions.js` (aplicar permissões)

**Tarefas imediatas:**
1. Executar `node setup-role-permissions.js`
2. Exportar `access/permissions.json` do Directus
3. Propagar `company_id` obrigatório em consultas e mutações

---

### 3️⃣ Pessoas (Leads/Clientes) ⚠️ (85%)

**✅ Collection `leads` existe com:**
- Nome, email, telefone, CPF
- Endereço completo
- Status, origem, company_id

**✅ Deliveries recentes:**
- Lista `/empresa/pessoas` reestilizada com filtros PF/PJ, estágio visível e CTA de edição.
- Formulário unificado de criação/edição com tabs, CEP assistido e campos de documento PF/PJ.
- Edição completa de pessoas com validação de obrigatórios e alinhamento ao tema dinâmico.

**❌ O que falta:**
- Collection `pessoa_contatos` para múltiplos contatos e UI correspondente.
- Sincronizar types do Directus (ENUM `tipo`) e expor histórico de estágio/logs.
- Substituir mocks remanescentes no funil de leads em tempo real.

**Estimativa:** 1-2 dias

---

### 4️⃣ Imóveis ✅ (90%)

**✅ Collection `properties` completa:**
- Identificação, tipo, finalidade, metragem
- Endereço completo (CEP, estado, cidade, bairro)
- Valores (venda, aluguel, condomínio, IPTU)
- Status, company_id
- Relacionamento `property_media` (fotos/vídeos)

**✅ Frontend funcionando:**
- `/empresa/imoveis` - lista paginada
- `/empresa/imoveis/novo` - cadastro
- `/empresa/imoveis/[id]` - edição

**❌ Gaps menores:**
- [ ] Campo `edificio_condominio` (VARCHAR) na collection

**✅ Deliveries recentes:**
- CEP auto-fill no cadastro/edição de imóveis
- Validação de metragem (total e construída) para evitar valores 0/negativos

**Estimativa:** 1 dia

---

### 5️⃣ Conversas WhatsApp ⚠️ (40%)

**✅ O que existe:**
- Collections: `conversas`, `mensagens`
- Extension: `endpoints/whatsapp/index.js` (webhook receiver)
- Extension: `endpoints/twilio/index.js` (send message)
- Helper multi-tenant funcional

**❌ O que falta:**

#### Backend:
- [ ] **BUG:** Corrigir `/send-image` em `twilio/index.js` (constantes indefinidas)
- [ ] Endpoint OpenAI (`endpoints/openai/`) - análise de intenção
- [ ] Worker Whisper para transcrição de áudio
- [ ] Auto-matching lead-property via IA

#### Frontend:
- [ ] Substituir mock data em `/conversas/page.tsx`
- [ ] Interface de chat em tempo real
- [ ] Exibição de mídias (imagens, áudios, vídeos)
- [ ] Histórico de conversas por lead
- [ ] Botão "Enviar mensagem" integrado com Twilio

**Credenciais:** Usar projeto Exclusiva real (sem sandbox)

**Estimativa:** 5-7 dias

---

### 6️⃣ Vistoria ❌ (0% - NOVO MÓDULO)

**Requisito:** Sistema completo de inspeção de imóveis com fotos/vídeos por cômodo.

#### Collections a criar:

**6.1. `vistorias`**
```javascript
{
  id: uuid,
  company_id: uuid (FK),
  codigo: string (auto),
  imovel_id: uuid (FK properties),
  cliente_id: uuid (FK leads),
  tipo: enum (Entrada, Saída, Periódica),
  status: enum (Solicitada, Designada, Em Andamento, Concluída, Cancelada),
  data_agendamento: datetime,
  vistoriadores: m2m (directus_users),
  tempo_estimado: integer (minutos),
  mobiliado: boolean,
  observacoes: text
}
```

**6.2. `vistoria_itens`**
```javascript
{
  id: uuid,
  vistoria_id: uuid (FK),
  comodo: string (Sala, Quarto 1, Cozinha, etc),
  item: string (Piso, Parede, Teto, Janela, etc),
  condicao: enum (Ótimo, Bom, Regular, Ruim, Péssimo),
  observacoes: text,
  fotos: o2m (directus_files),
  videos: o2m (directus_files)
}
```

**6.3. `vistoria_contestacoes`**
```javascript
{
  id: uuid,
  vistoria_id: uuid (FK),
  vistoria_item_id: uuid (FK),
  status: enum (Apontada, Em Análise, Finalizada),
  descricao: text,
  responsavel_id: uuid (FK directus_users),
  resolucao: text,
  data_resolucao: datetime
}
```

#### Frontend a criar:

**6.4. Páginas:**
- [ ] `/empresa/vistorias` - Lista com filtros (código, status, cliente, imóvel)
- [ ] `/empresa/vistorias/nova` - Formulário multi-tab:
  - Tab 1: Dados da Solicitação (cliente, imóvel, tipo, data)
  - Tab 2: Observações
  - Tab 3: Pessoas Envolvidas (vistoriadores)
  - Tab 4: Histórico
- [ ] `/empresa/vistorias/solicitacoes` - 3 visualizações:
  - Kanban (colunas por status)
  - Calendário (por data_agendamento)
  - Lista (tabela completa)
- [ ] `/empresa/vistorias/[id]` - Executar vistoria:
  - Lista de cômodos
  - Por cômodo: adicionar itens + upload fotos/vídeos
  - Finalizar vistoria
- [ ] `/empresa/vistorias/contestacoes` - Gestão de divergências

**6.5. Features especiais:**
- Upload múltiplo de fotos/vídeos (Directus Files)
- Comparação entrada vs saída (mesma propriedade)
- Assinatura digital do cliente na conclusão
- Exportar PDF com fotos

**Estimativa:** 10-12 dias

---

### 7️⃣ Assinatura Eletrônica ⚠️ (20%)

**✅ O que está preparado:**
- Campo `clicksign_access_token` em `app_settings`
- Collection `webhooks_log` para receber eventos

**❌ O que falta:**

#### Collections a criar:

**7.1. `documentos_assinatura`**
```javascript
{
  id: uuid,
  company_id: uuid (FK),
  codigo: string (auto),
  assunto: string,
  arquivo: file (PDF),
  clicksign_document_key: string,
  status: enum (Pendente, Assinado, Cancelado),
  data_criacao: datetime,
  data_conclusao: datetime
}
```

**7.2. `documentos_signatarios`**
```javascript
{
  id: uuid,
  documento_id: uuid (FK),
  pessoa_id: uuid (FK leads),
  email: string,
  ordem: integer,
  status: enum (Pendente, Visualizado, Assinado, Recusado),
  data_envio: datetime,
  data_assinatura: datetime,
  clicksign_signer_key: string
}
```

#### Backend:

**7.3. Extension ClickSign:**
- [ ] `directus/extensions/endpoints/clicksign/index.js`:
  - POST `/upload` - Upload documento
  - POST `/add-signer` - Adicionar signatário
  - POST `/send` - Enviar para assinatura
  - POST `/webhook` - Receber eventos
  - GET `/status/:document_key` - Consultar status

#### Frontend:

**7.4. Páginas:**
- [ ] `/empresa/assinaturas` - Lista de documentos
- [ ] `/empresa/assinaturas/novo` - Upload + adicionar signatários
- [ ] `/empresa/assinaturas/[id]` - Acompanhar progresso
  - Status por signatário
  - Botão "Reenviar notificação"
  - Download PDF assinado

**API ClickSign:** Documentação em https://developers.clicksign.com

**Estimativa:** 4-5 dias

---

### 8️⃣ Vitrines Públicas ⚠️ (40%)

**Requisito:** 20 templates de site para clientes da imobiliária escolherem.

**✅ Entregue agora:**
- Vitrine pública (template base) lendo imóveis reais por `company_slug` via middleware.
- Filtros de tipologia, transação, cidade/UF e busca textual, com chips ativos e limpeza rápida.
- Resultados restritos a imóveis `published` e `featured`, prontos para rodar em Docker/AWS sem mocks.

**Próximos passos:**
- [ ] Adicionar campo `storefront_template_id` (1-20) em `companies` e aplicar no middleware.
- [ ] Criar variações de template (#2-20) com identidade temática e seleção no admin.
- [ ] Página `/empresa/configuracoes/vitrine` com seletor de template e instruções de CNAME.

**Fluxo alvo:**
1. Admin escolhe Template #5.
2. Admin configura CNAME `imoveis.exclusiva.com.br` → `vitrine.imobi.com.br`.
3. Admin salva domínio no painel.
4. Middleware detecta domínio → renderiza Template #5 com `company_id` filtrado.

**Estimativa restante:** 8-12 dias (1 dia por template a partir do #2).

---

### 9️⃣ Dashboard/Analytics ⚠️ (30%)

**✅ Existe:**
- Página `/empresa/dashboard`
- Cards de métricas (usando mock data)

**❌ Falta:**
- [ ] Conectar a dados reais:
  - Total de imóveis (count properties)
  - Total de leads (count leads)
  - Conversas ativas (count conversas where status=ativo)
  - Vistorias pendentes (count vistorias where status!=concluída)
- [ ] Gráficos (Recharts):
  - Leads por mês (últimos 6 meses)
  - Imóveis por tipo (pizza)
  - Taxa de conversão (funil)
- [ ] Filtro de período

**Estimativa:** 2-3 dias

---

### 🔟 Admin Multi-empresa ⚠️ (25%)

**Requisito:** Super admin gerenciar todas as empresas.

**✅ Existe:**
- Rota `/admin`
- Layout básico

**❌ Falta:**
- [ ] Página `/admin/empresas` - CRUD de companies
  - Criar nova empresa
  - Editar (dados, logo, cores)
  - Suspender/reativar
  - Ver métricas (total imóveis, leads, usuários)
- [ ] Página `/admin/usuarios` - Gerenciar super admins
- [ ] Página `/admin/billing` - Controle financeiro
  - Empresas ativas/trial/suspensas
  - Receita mensal
  - Integração Mercado Pago (futuro)
- [ ] Página `/admin/analytics` - Métricas globais

**Estimativa:** 5-6 dias

---

## 🚨 TAREFAS CRÍTICAS IMEDIATAS

### Fase 0: Correções Urgentes (2-3 dias) ✅ COMPLETA

1. **Segurança**
   - [ ] Rotacionar senhas em `.env` (admin padrão exposto)
   - [ ] Restringir CORS (atualmente `*`)
   - [ ] Gerar nova `DIRECTUS_SECRET`

2. **Permissões** ✅
   - [x] Executar `node directus/setup-role-permissions.js`
   - [x] Exportar permissões para `directus/access/permissions.json`
   - [x] Versionar arquivo (58 permissions, 8 roles, 6 policies)

3. **Bugs** ✅
   - [x] Corrigir `directus/extensions/endpoints/twilio/index.js` linha ~100 (`/send-image`)
   - [x] Adicionar proteção de rotas em `nextjs/src/middleware.ts`

4. **Mock Data** ✅
   - [x] Remover mock de `/leads` (agora usa Directus SDK real)
   - [x] Remover mock de `/conversas` (agora usa dados reais)
   - [x] Ambos filtram por `company_id` do usuário autenticado

5. **Testes**
   - [ ] Atualizar seletores em `nextjs/tests/e2e/*.spec.ts`
   - [ ] Ou desabilitar temporariamente

**Status:** 80% completo (4 de 5 itens). Apenas segurança e testes E2E pendentes.

---

## 📋 ROADMAP COMPLETO

### Sprint 1 (1 semana) - Fundação Sólida ✅ COMPLETO
- [x] Infraestrutura base
- [x] Correções críticas (Fase 0 - 80% completo)
- [x] Auth server-side completo
- [x] Remover todos os mocks de `/leads`, `/conversas`, `/dashboard`
- [x] Aplicar permissões multi-tenant
- [x] Helper `getAuthenticatedCompanyId()` para Server Components
- [x] Testes de isolamento multi-tenant (100% aprovado)
- [x] Skeletons e Error Boundaries criados

**Resultado:** 4 módulos concluídos (Autenticação, Dashboard, Imóveis, Pessoas-parcial)

### Sprint 2 (1 semana) - Pessoas & Imóveis 100%
- [ ] Completar módulo Pessoas (tabs, ViaCEP, contatos)
- [x] Finalizar Imóveis (campo condomínio, CEP auto-fill) - JÁ COMPLETO
- [x] Testes de isolamento multi-tenant - JÁ COMPLETO

### Sprint 3 (1 semana) - WhatsApp Completo
- [ ] Corrigir Twilio extension
- [ ] OpenAI endpoint (análise mensagens)
- [ ] Interface de chat real-time
- [ ] Whisper para áudios

### Sprint 4 (2 semanas) - Vistoria (Módulo Novo)
- [ ] Collections (vistorias, itens, contestacoes)
- [ ] Frontend completo (Kanban, Calendar, List)

---

## 🧭 Plano Unificado de Recriação (Vue.js + Node.js + PostgreSQL)

Este plano consolida todas as funcionalidades necessárias para recriar o sistema completo no stack Vue + Node + PostgreSQL, mantendo o mesmo domínio funcional já descrito e alinhado ao multi-tenant por `company_id`. Embora o projeto atual evolua com Next.js + Directus, este plano unificado descreve uma alternativa API-first equivalente para uso quando for necessário migrar para Vue/Node.

**Arquitetura (API-First):**
- Frontend: Vue 3 (Vite) + Vue Router + Pinia + Tailwind; SPA com route guards e stores por módulo.
- Backend: Node.js (NestJS) com JWT, RBAC, Swagger; Redis para cache, BullMQ para filas.
- Banco: PostgreSQL com Prisma/TypeORM e migrations; índices por filtros críticos (cidade, status, stage).
- Multi-tenant: todas tabelas com `company_id`; middleware `x-company-id`; políticas por recurso.

**Modelo de Dados (resumo):**
- Pessoas (`people`, `people_contacts`): PF/PJ, endereço completo, preferências, stage; contatos múltiplos.
- Imóveis (`properties`, `property_media`): identificação, endereço, características, status, sincronização externa.
- Contratos (`contracts`, `contract_events`): partes, valores, datas, status e eventos (reajuste, desocupação).
- Financeiro (`invoices`, `payments`, `cnab_files`): faturamento, recebimentos, repasses, CNAB retorno/remessa.
- Conversas/Mensagens (`conversations`, `messages`): WhatsApp (Twilio), conteúdo/mídia, status, transcrição.
- Configurações (`companies`, `app_settings`): integrações (Twilio, ClickSign, gateway), domínios.

**APIs Principais:**
- Auth: `POST /auth/login`, `GET /auth/me`, refresh; CORS estrito, Helmet.
- Pessoas: `GET/POST/PUT/DELETE /pessoas`, `GET/POST /pessoas/:id/contatos`; filtros e paginação.
- Imóveis: `GET/POST/PUT/DELETE /imoveis`, `POST /imoveis/:id/media`; CEP via ViaCEP.
- Contratos: `GET/POST/PUT /contratos`, `POST /contratos/:id/reajuste`, `POST /contratos/:id/desocupacao`.
- Financeiro: `POST /recebimentos/faturamento`, `GET /recebimentos`, `POST /recebimentos/cnab/retorno`, `POST /repasses/cnab/remessa`, `GET /repasses`.
- Conversas: `POST /webhooks/twilio`, `GET /conversas`, `POST /conversas/:id/mensagens`.
- Assinatura: `POST /assinaturas/upload`, `POST /assinaturas/:id/signatarios`, `POST /assinaturas/:id/send`, `POST /webhooks/clicksign`, `GET /assinaturas/:id/status`.

**Frontend (Vue) – Telas:**
- Autenticação (login, recuperação), guarda por empresa.
- Pessoas: listagem com filtros/paginação; formulário com tabs (Principal, PF, PJ, Endereço, Contatos); ViaCEP; validações CPF/CNPJ.
- Imóveis: listagem/filtros; criação/edição; upload de fotos; status/características.
- Contratos: wizard com seleção de imóvel/partes/valores/datas; ações de reajuste/desocupação.
- Financeiro: faturamento, contas a receber, conciliação (upload CNAB), repasses (remessa/comissões).
- Conversas: inbox WhatsApp, envio de mensagens, visualização de mídia.
- Assinatura: upload PDF, adicionar signatários, enviar, acompanhar status.
- Locação Online: funil (proposta → visita → pré-contrato).
- Configurações/Admin: parâmetros por empresa, usuários/roles.

**Segurança & Compliance:**
- JWT com expiração/refresh; RBAC; rate limiting; logs/auditoria; LGPD (retenção, consentimento).

**Integrações:**
- ViaCEP (endereços); Twilio (WhatsApp); ClickSign (assinaturas); CNAB (retorno/remessa) com workers BullMQ.

**Sprints & Estimativas (MVP sem financeiro completo):**
- Sprint 0 (1-2 semanas): Setup, auth, multitenancy, base UI.
- Sprint 1 (1-2): Pessoas (PF/PJ + contatos + ViaCEP).
- Sprint 2 (1): Imóveis (fotos, filtros).
- Sprint 3 (2): Contratos (criação, reajuste, desocupação).
- Sprint 4 (1-2): Conversas WhatsApp (MVP).
- Sprint 5 (1-2): Assinatura (ClickSign).
- Sprint 6 (1): Configurações/Admin.
- Total MVP: 8-10 semanas. Fase 2 (Financeiro completo): +6-10 semanas.

**Próximos Passos do Plano Unificado:**
1. Aprovar escopo unificado.
2. Scaffold Vue/Nest com Docker Compose.
3. Definir schema inicial e migrations.
4. Implementar Sprint 0 e iniciar Módulo Pessoas.

- [ ] Upload fotos/vídeos
- [ ] Exportar PDF

### Sprint 5 (1 semana) - Assinatura Eletrônica
- [ ] Collections (documentos, signatarios)
- [ ] ClickSign extension
- [ ] Frontend assinaturas
- [ ] Webhook receiver

### Sprint 6 (3 semanas) - Vitrines Públicas
- [ ] Template #1 (Exclusiva port)
- [ ] Templates #2-10 (variações)
- [ ] Templates #11-20 (variações)
- [ ] Admin: seletor + custom domain

### Sprint 7 (1 semana) - Admin & Analytics
- [ ] Dashboard com dados reais + gráficos
- [ ] Admin multi-empresa CRUD
- [ ] Métricas globais

### Sprint 8 (1 semana) - Produção
- [ ] CI/CD (GitHub Actions)
- [ ] Logs estruturados (Winston + Loki)
- [ ] Backups automatizados
- [ ] Documentação API (Swagger)
- [ ] Deploy AWS/Render

---

## 📦 COLLECTIONS RESUMO

| Collection | Status | Campos | Relações |
|------------|--------|--------|----------|
| `companies` | ✅ Existe | 25+ | - |
| `properties` | ✅ Existe | 30+ | property_media (o2m) |
| `property_media` | ✅ Existe | 5 | properties (m2o) |
| `leads` | ⚠️ Parcial | 20 | Falta: tipo, RG, CNH |
| `pessoa_contatos` | ❌ Criar | 5 | leads (m2o) |
| `conversas` | ✅ Existe | 15 | mensagens (o2m) |
| `mensagens` | ✅ Existe | 10 | conversas (m2o) |
| `vistorias` | ❌ Criar | 12 | imovel, cliente, itens (o2m) |
| `vistoria_itens` | ❌ Criar | 8 | vistoria (m2o), fotos (o2m) |
| `vistoria_contestacoes` | ❌ Criar | 7 | vistoria, item |
| `documentos_assinatura` | ❌ Criar | 10 | signatarios (o2m) |
| `documentos_signatarios` | ❌ Criar | 9 | documento (m2o), pessoa |
| `lead_property_matches` | ✅ Existe | 8 | lead, property |
| `atividades` | ✅ Existe | 7 | lead, user |
| `webhooks_log` | ✅ Existe | 8 | - |
| `app_settings` | ✅ Existe | 15+ | company |
| `job_status` | ✅ Existe | 6 | - |
| `logs` | ✅ Existe | 5 | - |

**Total:** 18 collections (14 existem, 4 a criar)

---

## 🎯 PRIORIZAÇÃO

### 🔴 CRÍTICO (Bloqueia outros módulos):
1. Auth server-side (2 dias)
2. Correções de segurança (1 dia)
3. Remover mocks (3 dias)

### 🟡 ALTA (Features principais):
4. Vistoria completo (12 dias)
5. Vitrines públicas (20 dias)
6. WhatsApp completo (7 dias)

### 🟢 MÉDIA (Melhorias):
7. Pessoas completo (4 dias)
8. Assinatura eletrônica (5 dias)
9. Dashboard real (3 dias)

### ⚪ BAIXA (Polimento):
10. Admin multi-empresa (6 dias)
11. Imóveis 100% (1 dia)
12. CI/CD (3 dias)

---

## 📈 ESTIMATIVA TOTAL

**Tempo total estimado:** 68-75 dias úteis (~3,5 meses)

**Com equipe de 2 devs:** ~2 meses  
**Com equipe de 3 devs:** ~1,5 mês

---

## 📚 DOCUMENTAÇÃO DE REFERÊNCIA

- **Arquitetura:** `ARQUITETURA_SAAS_MULTI_TENANT.md`
- **Setup:** `COMO_USAR.md`
- **AI Instructions:** `.github/copilot-instructions.md`
- **Projeto Legado:** `marcuslimadev/exclusiva` (referência WhatsApp/OpenAI)

---

**Este é o único documento de planejamento oficial. Atualize os percentuais conforme progresso.**
