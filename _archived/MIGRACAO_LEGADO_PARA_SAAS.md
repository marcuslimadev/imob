# 🔄 MIGRAÇÃO DO SISTEMA LEGADO PARA SAAS MULTI-TENANT

**Data:** 24 de Novembro de 2025  
**Sistema Origem:** Exclusiva Lar CRM (Lumen + Vue 3)  
**Sistema Destino:** IMOBI SaaS (Directus + Next.js)

---

## 📊 INVENTÁRIO DO SISTEMA LEGADO

### Backend (Laravel Lumen + PostgreSQL)

#### ✅ Tabelas Existentes (8 tabelas)

1. **users** - Usuários do sistema
   ```sql
   - id, nome, email, senha, tipo (admin/corretor)
   - telefone, ativo, foto_perfil
   ```

2. **leads** - Leads capturados via WhatsApp + IA
   ```sql
   - Dados básicos: telefone, nome, cpf, email, whatsapp_name
   - Dados financeiros: renda_mensal, budget_min, budget_max
   - Dados pessoais: estado_civil, composicao_familiar, profissao
   - Preferências: localizacao, quartos, suites, garagem, tipo_imovel
   - Diagnóstico IA: diagnostico_ia, diagnostico_status, diagnostico_gerado_em
   - Gestão: corretor_id, status, origem, score
   ```

3. **conversas** - Conversas WhatsApp
   ```sql
   - telefone, lead_id, corretor_id
   - status (ativa, aguardando_lead, aguardando_corretor, finalizada)
   - stage, whatsapp_name, profile_pic
   - contexto_conversa, ultima_mensagem
   ```

4. **mensagens** - Mensagens WhatsApp individuais
   ```sql
   - conversa_id, message_sid, direction (incoming/outgoing)
   - message_type (text, audio, image, document)
   - content, media_url, transcription
   - status, sent_at, delivered_at, read_at
   ```

5. **imo_properties** - Catálogo de imóveis
   ```sql
   - codigo_imovel, referencia_imovel, finalidade_imovel
   - tipo_imovel, descricao, observacoes
   - dormitorios, suites, banheiros, garagem
   - valores: valor_venda, valor_aluguel, condominio, iptu
   - localização: cidade, estado, bairro, endereco, cep, lat/lng
   - características JSON, imagens JSON
   - em_condominio, nome_condominio
   - aceita_financiamento, exibir_imovel, destaque, active
   ```

6. **lead_property_matches** - Matches Lead x Imóvel (IA)
   ```sql
   - lead_id, property_id, conversa_id
   - match_score (0-100)
   - pdf_sent, pdf_sent_at, pdf_path
   - visualizado, interesse, feedback
   ```

7. **atividades** - Log de atividades do sistema
   ```sql
   - user_id, lead_id, tipo, descricao
   - dados JSON, ip_address
   ```

8. **app_settings** - Configurações gerais
   ```sql
   - chave, valor, tipo, descricao, categoria
   ```

#### ✅ Controllers (12 arquivos)

1. **AuthController** - Login JWT, logout, me
2. **LeadsController** - CRUD completo de leads
   - `index()` - Listar com filtros
   - `show()` - Detalhes + relacionamentos
   - `update()` - Atualizar lead
   - `stats()` - Estatísticas
   - `updateStatus()` - Kanban drag-and-drop
   - `destroy()` / `bulkDestroy()` - Deletar
   - **`diagnostico()`** - Gerar diagnóstico IA sob demanda

3. **ConversasController** - Gestão de conversas WhatsApp
   - `index()` - Listar conversas
   - `show()` - Detalhes + mensagens
   - `sendMessage()` - Enviar mensagem Twilio
   - `porTelefone()` - Buscar por telefone
   - `tempoReal()` - Conversas ativas

4. **WebhookController** - Receber mensagens Twilio
   - `receive()` - Processar mensagem recebida
   - `status()` - Status de entrega
   - Transcrição de áudio (Whisper)
   - Processamento IA (GPT-4o-mini)
   - Match automático de imóveis

5. **PropertyController** - Gestão de imóveis
   - `sync()` - Sincronizar com API externa
   - `detalhesCompletos()` - Debug completo

6. **PublicPropertyController** - API pública de imóveis
   - `index()` - Listagem pública
   - `show()` - Detalhes públicos

7. **ImportacaoImoveisController** - Importação automática
   - `overview()` - Visão geral
   - `historico()` - Histórico de importações
   - `agendarImportacao()` - Agendar sync

8. **DashboardController** - Estatísticas
   - `stats()` - Métricas gerais
   - `chartAtendimentos()` - Gráfico
   - `atividades()` - Atividades recentes

9. **SettingsController** - Configurações do sistema
10. **TextFormatterController** - Formatação de texto com IA

#### ✅ Services (Lógica de Negócio)

1. **OpenAIService** - Integração OpenAI
   - `generateLeadDiagnostic()` - Diagnóstico inteligente
   - Transcrição de áudio (Whisper)
   - Conversação GPT-4o-mini

2. **PropertySyncService** - Sincronização de imóveis
   - `syncAll()` - Sync completo
   - `callApi()` - Chamadas API externa
   - `mapPropertyData()` - Mapeamento de dados

3. **TwilioService** (presumido) - WhatsApp
   - Envio de mensagens
   - Webhooks

#### ✅ Integrações Ativas

1. **Twilio WhatsApp**
   - Número: +55 31 7334-1150
   - Webhook: `/webhook/whatsapp`
   - Recebe mensagens, áudio, imagem
   - Envia respostas automáticas

2. **OpenAI**
   - Model: gpt-4o-mini
   - Whisper (transcrição de áudio)
   - Extração de dados estruturados
   - Match de imóveis

3. **API Externa de Imóveis**
   - Base: `https://www.exclusivalarimoveis.com.br/api/v1/app/imovel`
   - Token Bearer
   - Endpoints: `/lista`, `/dados/{codigo}`
   - Sync automático

### Frontend (Vue 3 + Vite + Tailwind)

#### ✅ Páginas (6 views)

1. **Login.vue** - Autenticação
2. **Dashboard.vue** - Dashboard com stats
3. **Conversas.vue** - Chat WhatsApp em tempo real
4. **Leads.vue** - Gestão de leads (Kanban?)
5. **Imoveis.vue** - Catálogo de imóveis (público)
6. **ImportacaoImoveis.vue** - Painel de importação

#### ✅ Funcionalidades Implementadas

- Login/Logout JWT
- Dashboard com métricas em tempo real
- Chat WhatsApp (enviar/receber)
- Transcrição de áudio automática
- IA conversacional
- Match automático de imóveis
- Listagem de leads com filtros
- Gestão de conversas
- Design responsivo (Tailwind)
- Vitrine pública de imóveis

---

## 🎯 PLANO DE MIGRAÇÃO

### FASE 1: Estrutura de Dados (2 dias)

#### 1.1. Criar Collections no Directus (Aproveitando Existentes)

✅ **JÁ EXISTE (migrar dados):**
- `companies` - Adicionar campos de integração
- `properties` - Expandir com campos do legado
- `leads` - Expandir com campos financeiros/diagnóstico
- `property_media` - Manter como está

🆕 **CRIAR NOVAS:**

```typescript
// Collection: users (substituir Directus Users para multi-tenant)
{
  id: uuid,
  company_id: uuid,              // FK -> companies
  first_name: string,
  last_name: string,
  email: string,
  password: hash,
  phone: string,
  avatar: file,
  role: enum,                    // super_admin, company_admin, manager, agent
  is_active: boolean,
  email_verified: boolean,
  last_login_at: timestamp,
  created_at: timestamp,
  updated_at: timestamp,
}

// Collection: conversas (WhatsApp)
{
  id: uuid,
  company_id: uuid,              // FK -> companies (MULTI-TENANT)
  telefone: string,
  lead_id: uuid,                 // FK -> leads
  corretor_id: uuid,             // FK -> users
  status: enum,                  // ativa, aguardando_lead, aguardando_corretor, finalizada
  stage: string,
  whatsapp_name: string,
  profile_pic: string,
  contexto_conversa: text,
  ultima_mensagem: text,
  iniciada_em: timestamp,
  ultima_atividade: timestamp,
  finalizada_em: timestamp,
}

// Collection: mensagens (WhatsApp)
{
  id: uuid,
  conversa_id: uuid,             // FK -> conversas
  message_sid: string,
  direction: enum,               // incoming, outgoing
  message_type: enum,            // text, audio, image, document
  content: text,
  media_url: string,
  transcription: text,           // Whisper
  status: string,
  error_message: text,
  sent_at: timestamp,
  delivered_at: timestamp,
  read_at: timestamp,
}

// Collection: lead_property_matches (IA)
{
  id: uuid,
  lead_id: uuid,                 // FK -> leads
  property_id: uuid,             // FK -> properties
  conversa_id: uuid,             // FK -> conversas
  match_score: decimal,          // 0-100
  pdf_sent: boolean,
  pdf_sent_at: timestamp,
  pdf_path: string,
  visualizado: boolean,
  interesse: enum,               // baixo, medio, alto
  feedback: text,
  created_at: timestamp,
}

// Collection: atividades (Log)
{
  id: uuid,
  company_id: uuid,              // FK -> companies (MULTI-TENANT)
  user_id: uuid,                 // FK -> users
  lead_id: uuid,                 // FK -> leads
  tipo: string,
  descricao: text,
  dados: json,
  ip_address: string,
  created_at: timestamp,
}

// Collection: webhooks_log (NOVO - para SaaS)
{
  id: uuid,
  company_id: uuid,              // FK -> companies
  service: enum,                 // twilio, asaas, clicksign
  event_type: string,
  payload: json,
  processed: boolean,
  processed_at: timestamp,
  error_message: text,
  received_at: timestamp,
}

// Collection: app_settings (por empresa)
{
  id: uuid,
  company_id: uuid,              // FK -> companies (MULTI-TENANT)
  chave: string,
  valor: text,
  tipo: string,
  descricao: string,
  categoria: string,
  editavel: boolean,
  created_at: timestamp,
  updated_at: timestamp,
}
```

#### 1.2. Expandir Collections Existentes

**companies** - Adicionar campos de integração:
```sql
ALTER TABLE companies ADD COLUMN:
  twilio_account_sid: string,
  twilio_auth_token: string,
  twilio_phone_number: string,
  twilio_webhook_url: string,
  
  openai_api_key: string,
  openai_model: string (default: gpt-4o-mini),
  
  asaas_api_key: string,
  asaas_webhook_url: string,
  
  clicksign_api_token: string,
  clicksign_webhook_url: string,
  
  external_property_api_url: string,
  external_property_api_token: string,
```

**leads** - Adicionar campos do legado:
```sql
ALTER TABLE leads ADD COLUMN:
  // Dados Cadastrais
  whatsapp_name: string,
  profile_pic_url: string,
  
  // Dados Financeiros
  renda_mensal: decimal,
  
  // Dados Pessoais
  estado_civil: string,
  composicao_familiar: string,
  profissao: string,
  fonte_renda: string,
  
  // Financiamento
  financiamento_status: string,
  prazo_compra: string,
  objetivo_compra: string,
  
  // Preferências de Lazer/Segurança
  preferencia_lazer: text,
  preferencia_seguranca: text,
  caracteristicas_desejadas: text,
  observacoes_cliente: text,
  
  // Diagnóstico IA
  diagnostico_ia: text,
  diagnostico_status: enum (pendente, concluido, erro),
  diagnostico_gerado_em: timestamp,
  
  // Timestamps
  primeira_interacao: timestamp,
  ultima_interacao: timestamp,
```

**properties** - Adicionar campos do legado:
```sql
ALTER TABLE properties ADD COLUMN:
  codigo_imovel: string (unique),
  referencia_imovel: string,
  observacoes: text,
  
  // Localização detalhada
  numero: string,
  complemento: string,
  logradouro: string,
  
  // Condomínio
  em_condominio: boolean,
  nome_condominio: string,
  
  // Características extras
  area_terreno: decimal,
  caracteristicas: json,
  
  // Controle
  aceita_financiamento: boolean,
  exclusividade: boolean,
  last_sync: timestamp,
  api_data: json,
```

---

### FASE 2: Migração de Código Backend (3 dias)

#### 2.1. Portar Controllers para Next.js API Routes

**Estrutura de API Routes:**
```
nextjs/src/app/api/
  /auth/
    /login/route.ts
    /logout/route.ts
    /me/route.ts
  /leads/
    /route.ts (GET, POST)
    /[id]/route.ts (GET, PUT, DELETE)
    /[id]/diagnostico/route.ts (POST)
    /[id]/status/route.ts (PATCH)
    /stats/route.ts (GET)
  /conversas/
    /route.ts (GET)
    /[id]/route.ts (GET)
    /[id]/mensagens/route.ts (POST)
    /por-telefone/[telefone]/route.ts (GET)
  /webhooks/
    /twilio/[company_id]/route.ts (POST)
    /asaas/[company_id]/route.ts (POST)
  /properties/
    /sync/route.ts (POST)
  /dashboard/
    /stats/route.ts (GET)
    /atividades/route.ts (GET)
```

#### 2.2. Portar Services

**OpenAI Service** (`lib/services/openai.ts`):
```typescript
import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }
  
  async generateLeadDiagnostic(
    lead: any,
    historico: string,
    properties: any[]
  ) {
    // Portar lógica do PHP
  }
  
  async transcribeAudio(audioUrl: string) {
    // Whisper API
  }
  
  async chat(messages: any[]) {
    // GPT-4o-mini
  }
}
```

**Twilio Service** (`lib/services/twilio.ts`):
```typescript
import twilio from 'twilio';

export class TwilioService {
  private client: any;
  
  constructor(accountSid: string, authToken: string) {
    this.client = twilio(accountSid, authToken);
  }
  
  async sendMessage(to: string, body: string, from: string) {
    // Enviar mensagem
  }
  
  async sendMediaMessage(to: string, mediaUrl: string, from: string) {
    // Enviar mídia
  }
}
```

**Property Sync Service** (`lib/services/property-sync.ts`):
```typescript
export class PropertySyncService {
  async syncAll(companyId: string, apiUrl: string, apiToken: string) {
    // Portar lógica do PropertySyncService.php
  }
  
  async syncOne(codigo: string) {
    // Sync único
  }
}
```

#### 2.3. Webhook Processing

**Twilio Webhook** (`app/api/webhooks/twilio/[company_id]/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { TwilioService } from '@/lib/services/twilio';
import { OpenAIService } from '@/lib/services/openai';
import { directus } from '@/lib/directus';

export async function POST(
  request: NextRequest,
  { params }: { params: { company_id: string } }
) {
  // 1. Validar company_id
  const company = await directus.items('companies').readOne(params.company_id);
  
  // 2. Processar payload Twilio
  const body = await request.formData();
  const from = body.get('From');
  const messageBody = body.get('Body');
  const mediaUrl = body.get('MediaUrl0');
  const messageType = mediaUrl ? 'audio' : 'text';
  
  // 3. Encontrar ou criar conversa
  let conversa = await directus.items('conversas')
    .readByQuery({
      filter: {
        company_id: { _eq: params.company_id },
        telefone: { _eq: from }
      }
    });
  
  if (!conversa.data.length) {
    conversa = await directus.items('conversas').createOne({
      company_id: params.company_id,
      telefone: from,
      status: 'ativa'
    });
  }
  
  // 4. Salvar mensagem
  const mensagem = await directus.items('mensagens').createOne({
    conversa_id: conversa.id,
    direction: 'incoming',
    message_type: messageType,
    content: messageBody,
    media_url: mediaUrl,
    sent_at: new Date()
  });
  
  // 5. Se for áudio, transcrever
  let transcription = null;
  if (messageType === 'audio') {
    const openai = new OpenAIService(company.openai_api_key);
    transcription = await openai.transcribeAudio(mediaUrl);
    
    await directus.items('mensagens').updateOne(mensagem.id, {
      transcription
    });
  }
  
  // 6. Processar com IA
  const openai = new OpenAIService(company.openai_api_key);
  const response = await openai.chat([
    { role: 'system', content: 'Você é um assistente de imobiliária...' },
    { role: 'user', content: transcription || messageBody }
  ]);
  
  // 7. Enviar resposta
  const twilio = new TwilioService(
    company.twilio_account_sid,
    company.twilio_auth_token
  );
  
  await twilio.sendMessage(
    from,
    response.message,
    company.twilio_phone_number
  );
  
  // 8. Salvar resposta
  await directus.items('mensagens').createOne({
    conversa_id: conversa.id,
    direction: 'outgoing',
    message_type: 'text',
    content: response.message,
    sent_at: new Date()
  });
  
  return NextResponse.json({ success: true });
}
```

---

### FASE 3: Migração de Frontend (3 dias)

#### 3.1. Portar Views do Vue para Next.js/React

**Dashboard** (`app/(admin)/dashboard/page.tsx`):
```tsx
import { DashboardStats } from '@/components/dashboard/Stats';
import { RecentActivities } from '@/components/dashboard/Activities';

export default async function DashboardPage() {
  const stats = await fetch('/api/dashboard/stats').then(r => r.json());
  const activities = await fetch('/api/dashboard/atividades').then(r => r.json());
  
  return (
    <div>
      <DashboardStats data={stats} />
      <RecentActivities data={activities} />
    </div>
  );
}
```

**Conversas** (`app/(admin)/conversas/page.tsx`):
```tsx
'use client';

import { useState, useEffect } from 'react';
import { ChatWindow } from '@/components/conversas/ChatWindow';
import { ConversasList } from '@/components/conversas/List';

export default function ConversasPage() {
  const [conversas, setConversas] = useState([]);
  const [selected, setSelected] = useState(null);
  
  useEffect(() => {
    fetch('/api/conversas').then(r => r.json()).then(setConversas);
  }, []);
  
  return (
    <div className="flex h-screen">
      <ConversasList conversas={conversas} onSelect={setSelected} />
      {selected && <ChatWindow conversaId={selected.id} />}
    </div>
  );
}
```

**Leads** (`app/(admin)/leads/page.tsx`):
```tsx
'use client';

import { LeadKanban } from '@/components/leads/Kanban';
import { LeadTable } from '@/components/leads/Table';
import { useState } from 'react';

export default function LeadsPage() {
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  
  return (
    <div>
      <div className="mb-4">
        <button onClick={() => setView('kanban')}>Kanban</button>
        <button onClick={() => setView('table')}>Tabela</button>
      </div>
      
      {view === 'kanban' ? <LeadKanban /> : <LeadTable />}
    </div>
  );
}
```

#### 3.2. Componentes Reutilizáveis

**ChatWindow** (`components/conversas/ChatWindow.tsx`):
```tsx
import { useState, useEffect } from 'react';
import { AudioPlayer } from './AudioPlayer';
import { MessageInput } from './MessageInput';

export function ChatWindow({ conversaId }: { conversaId: string }) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    fetch(`/api/conversas/${conversaId}`)
      .then(r => r.json())
      .then(data => setMessages(data.mensagens));
  }, [conversaId]);
  
  const sendMessage = async (content: string) => {
    await fetch(`/api/conversas/${conversaId}/mensagens`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    
    // Recarregar mensagens
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id}>
            {msg.message_type === 'audio' ? (
              <AudioPlayer url={msg.media_url} transcription={msg.transcription} />
            ) : (
              <p>{msg.content}</p>
            )}
          </div>
        ))}
      </div>
      
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

**LeadKanban** (`components/leads/Kanban.tsx`):
```tsx
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const stages = ['novo', 'em_atendimento', 'qualificado', 'proposta', 'fechado', 'perdido'];

export function LeadKanban() {
  const [leads, setLeads] = useState<any>({});
  
  const onDragEnd = async (result: any) => {
    const { draggableId, destination } = result;
    
    await fetch(`/api/leads/${draggableId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: destination.droppableId })
    });
    
    // Atualizar estado
  };
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4">
        {stages.map(stage => (
          <Droppable key={stage} droppableId={stage}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <h3>{stage}</h3>
                {(leads[stage] || []).map((lead: any, index: number) => (
                  <Draggable key={lead.id} draggableId={lead.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {lead.nome} - {lead.telefone}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
```

---

### FASE 4: Camada Multi-Tenant (2 dias)

#### 4.1. Middleware de Detecção de Tenant

**nextjs/src/middleware.ts**:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { directus } from '@/lib/directus';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Super Admin
  if (hostname === 'admin.imobi.com.br') {
    return NextResponse.next();
  }
  
  // Painel da Imobiliária (subdomain)
  const subdomainMatch = hostname.match(/^([^.]+)\.imobi\.com\.br$/);
  if (subdomainMatch) {
    const slug = subdomainMatch[1];
    
    const companies = await directus.items('companies').readByQuery({
      filter: { slug: { _eq: slug } },
      limit: 1
    });
    
    if (!companies.data.length) {
      return NextResponse.redirect(new URL('/404', request.url));
    }
    
    const company = companies.data[0];
    
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-company-id', company.id);
    requestHeaders.set('x-company-slug', company.slug);
    
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }
  
  // Vitrine Pública (custom domain)
  const companies = await directus.items('companies').readByQuery({
    filter: { custom_domain: { _eq: hostname } },
    limit: 1
  });
  
  if (companies.data.length) {
    const company = companies.data[0];
    
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-company-id', company.id);
    requestHeaders.set('x-tenant-type', 'public');
    
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }
  
  return NextResponse.redirect(new URL('https://imobi.com.br', request.url));
}
```

#### 4.2. Helper para Pegar Company ID

**lib/tenant.ts**:
```typescript
import { headers } from 'next/headers';

export async function getCurrentCompanyId(): Promise<string | null> {
  const headersList = headers();
  return headersList.get('x-company-id');
}

export async function requireCompany(): Promise<string> {
  const companyId = await getCurrentCompanyId();
  if (!companyId) {
    throw new Error('Company ID not found');
  }
  return companyId;
}
```

#### 4.3. Filtrar Queries por Company

**Exemplo em API Route**:
```typescript
import { requireCompany } from '@/lib/tenant';
import { directus } from '@/lib/directus';

export async function GET() {
  const companyId = await requireCompany();
  
  const leads = await directus.items('leads').readByQuery({
    filter: {
      company_id: { _eq: companyId }
    }
  });
  
  return Response.json(leads);
}
```

---

### FASE 5: Super Admin Panel (2 dias)

#### 5.1. Páginas Super Admin

**admin.imobi.com.br/admin/companies**:
```tsx
export default async function CompaniesPage() {
  const companies = await directus.items('companies').readByQuery({});
  
  return (
    <div>
      <h1>Imobiliárias</h1>
      <Link href="/admin/companies/new">+ Nova Imobiliária</Link>
      
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Slug</th>
            <th>Plano</th>
            <th>Status</th>
            <th>Vencimento</th>
          </tr>
        </thead>
        <tbody>
          {companies.data.map(company => (
            <tr key={company.id}>
              <td>{company.name}</td>
              <td>{company.slug}.imobi.com.br</td>
              <td>{company.subscription_plan}</td>
              <td>{company.subscription_status}</td>
              <td>{company.subscription_expires_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**admin.imobi.com.br/admin/companies/new**:
```tsx
'use client';

export default function NewCompanyPage() {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      cnpj: formData.get('cnpj'),
      email: formData.get('email'),
      subscription_plan: formData.get('plan'),
      subscription_starts_at: new Date(),
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
    };
    
    // Gerar slug automaticamente
    data.slug = data.name.toLowerCase().replace(/\s+/g, '-');
    
    // Gerar URLs de webhook
    data.twilio_webhook_url = `https://api.imobi.com.br/webhooks/twilio/{company_id}`;
    data.asaas_webhook_url = `https://api.imobi.com.br/webhooks/asaas/{company_id}`;
    
    await fetch('/api/admin/companies', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    router.push('/admin/companies');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Nome da Imobiliária" />
      <input name="cnpj" placeholder="CNPJ" />
      <input name="email" placeholder="Email" />
      
      <select name="plan">
        <option value="basic">Basic (R$ 479/mês)</option>
        <option value="professional">Professional (R$ 759/mês)</option>
        <option value="enterprise">Enterprise (R$ 1.490/mês)</option>
      </select>
      
      <button type="submit">Criar Imobiliária</button>
    </form>
  );
}
```

---

## 📦 DEPENDÊNCIAS NECESSÁRIAS

```json
{
  "dependencies": {
    "@directus/sdk": "^15.0.0",
    "openai": "^4.20.0",
    "twilio": "^4.19.0",
    "@hello-pangea/dnd": "^16.5.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.4",
    "date-fns": "^3.0.0",
    "recharts": "^2.10.0"
  }
}
```

---

## ✅ CHECKLIST DE MIGRAÇÃO

### Dados
- [ ] Criar 8 novas collections no Directus
- [ ] Expandir companies com campos de integração
- [ ] Expandir leads com diagnóstico IA
- [ ] Expandir properties com campos detalhados
- [ ] Migrar dados da Exclusiva para primeira company
- [ ] Popular conversas e mensagens existentes

### Backend
- [ ] Portar AuthController → API Routes
- [ ] Portar LeadsController → API Routes
- [ ] Portar ConversasController → API Routes
- [ ] Portar WebhookController → API Routes
- [ ] Implementar OpenAIService em TypeScript
- [ ] Implementar TwilioService em TypeScript
- [ ] Implementar PropertySyncService em TypeScript
- [ ] Configurar webhooks com company_id

### Frontend
- [ ] Migrar Dashboard.vue → page.tsx
- [ ] Migrar Conversas.vue → page.tsx + ChatWindow
- [ ] Migrar Leads.vue → page.tsx + Kanban
- [ ] Criar componente de diagnóstico IA
- [ ] Criar componente de áudio player (Whisper)
- [ ] Implementar drag-and-drop Kanban

### Multi-Tenant
- [ ] Middleware de detecção de domínios
- [ ] Helper getCurrentCompanyId()
- [ ] Filtros automáticos por company_id
- [ ] Super Admin panel
- [ ] Wizard de onboarding

### Integrações
- [ ] Twilio WhatsApp por company
- [ ] OpenAI por company (ou global)
- [ ] Property Sync API por company
- [ ] Asaas (futuro)
- [ ] ClickSign (futuro)

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

1. **Criar as novas collections no Directus** (30 min)
2. **Migrar dados da Exclusiva** como primeira company (1h)
3. **Implementar webhook Twilio multi-tenant** (2h)
4. **Portar página de conversas** (3h)
5. **Testar fluxo completo** WhatsApp → IA → Resposta (1h)

---

**Total estimado:** 10-12 dias de desenvolvimento full-time
