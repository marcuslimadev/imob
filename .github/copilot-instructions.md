# iMOBI - AI Agent Instructions

## Project Overview
Multi-tenant SaaS platform for real estate agencies with WhatsApp automation and AI. **Stack:** Next.js 15 + Directus 11 + PostgreSQL + Redis. **Migration status:** 30% complete from legacy Lumen+Vue.js system (Exclusiva).

## Architecture & Multi-Tenancy

### Core Multi-Tenant Pattern
All data is isolated by `company_id` (UUID FK to `companies` collection). Every collection MUST include `company_id` and filter by it.

**Frontend middleware** (`nextjs/src/middleware.ts`): Detects company via subdomain (`exclusiva.imobi.com.br`) or custom domain, injects `x-company-id`/`x-company-slug` headers.

**Backend helper** (`directus/extensions/shared/company-settings.js`): 
```javascript
const settings = await getCompanySettings(services, companyId);
// Returns company-specific API keys, Twilio creds, OpenAI config, etc.
```

**CRITICAL:** When creating/reading data:
- Frontend: Get `company_id` from auth context (`AuthContext.tsx`) or middleware headers
- Backend extensions: Extract `company_id` from request body or lookup via `getCompanySettingsByWhatsApp()`
- Never hardcode company IDs (many TODOs exist for this - fix them!)

### Service Boundaries
```
┌─ Next.js (localhost:4000) ─┐      ┌─ Directus (localhost:8055) ─┐
│ - App Router (Server/Client)│ ←──→ │ - 16 Collections           │
│ - Middleware (tenant detect) │      │ - 3 Custom Extensions      │
│ - Radix UI + Tailwind + Naive│      │ - PostgreSQL + PostGIS     │
│ - Directus SDK (@directus/sdk)│      │ - Redis Cache             │
└─────────────────────────────┘      └────────────────────────────┘
                                              ↓
                                    External APIs (Twilio, OpenAI)
```

### Domain Structure
- **Super Admin:** `admin.imobi.com.br` - Manage all companies, billing, global settings
- **Company Panel:** `{slug}.imobi.com.br` - Company dashboard, CRM, property management
- **Public Storefront:** Custom domain (e.g., `exclusivaimoveis.com.br`) - Public property listings with selectable template

**Storefront Templates:** Companies select from 20 pre-built templates in their admin panel. Template #1 is based on `/imoveis` from Exclusiva project. Company configures CNAME at their domain registrar, then enters custom domain in admin panel.

## Development Workflows

### Local Setup (PowerShell)
```powershell
# 1. Start Directus (Docker)
cd directus
docker compose up -d

# 2. Apply schema (FIRST TIME ONLY - creates collections, fields, roles)
node register-collections.js
node register-fields.js
node setup-roles.js          # Creates roles with permissions
node seed-data.js            # Seeds test companies & properties

# 3. Start Next.js
cd ../nextjs
pnpm install
pnpm dev                     # Runs on port 4000

# Access:
# Directus Admin: http://localhost:8055/admin (marcus@admin.com / Teste@123)
# Next.js: http://localhost:4000/home?company=exclusiva
```

### Schema Changes
**Never** edit Directus schema via UI in production. Always:
1. Update `directus/register-collections.js` or `register-fields.js`
2. Test locally via `node register-collections.js`
3. Export permissions: manually backup via Directus UI → Settings → Data Model → Export
4. Commit changes to repo

### Testing
- **E2E Tests:** `nextjs/tests/e2e/*.spec.ts` (Playwright) - **Currently broken** with outdated selectors. Run `pnpm test` after fixing.
- **Backend Smoke Tests:** `directus/test-backend.js`, `directus/test-login.js`
- **No CI/CD pipeline exists** - this is a critical gap

## Code Conventions

### Directus Extensions (CommonJS)
Extensions in `directus/extensions/endpoints/` use **CommonJS** (not ESM):
```javascript
// ✅ Correct
const { getCompanySettings } = require('../../shared/company-settings.js');
module.exports = (router, { env, logger, database }) => { ... };

// ❌ Wrong
import { getCompanySettings } from '../../shared/company-settings.js';
export default (router, context) => { ... };
```

**Error handling:** All endpoints must wrap in try/catch and log errors:
```javascript
try {
  const config = await getCompanyTwilioConfig(company_id);
  // ... make external API call
  return res.json({ success: true, ... });
} catch (error) {
  logger.error('Operation failed', { error: error.message, company_id });
  return res.status(500).json({ success: false, error: error.message });
}
```

**Known issue:** `directus/extensions/endpoints/twilio/index.js` references undefined constants `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN` in `/send-image` route - use `config.accountSid`/`config.authToken` instead.

### Next.js Patterns

**Server Components** (default): Use `directusServer` client with static token:
```typescript
import { directusServer } from '@/lib/directus/client';
import { readItems } from '@directus/sdk';

const properties = await directusServer.request(
  readItems('properties', {
    filter: { company_id: { _eq: companyId } },
    fields: ['*', { property_media: ['*'] }]
  })
);
```

**Client Components** (`'use client'`): Use `directusClient` with user authentication:
```typescript
'use client';
import { directusClient } from '@/lib/directus/client';
import { useAuth } from '@/contexts/AuthContext';

const { user } = useAuth();
// user.company_id available after login
```

**Middleware caveats:** 
- Database queries in middleware increase latency - cache aggressively
- Currently does 2 Directus requests per page load (slug lookup + custom domain fallback)

### Data Loading States
Many pages still use **mock data** or hardcoded `company_id`. When converting to real data:
```typescript
// 1. Add loading skeleton
if (loading) return <LeadsSkeleton />;

// 2. Add error boundary
if (error) return <ErrorState message={error.message} />;

// 3. Get company from auth
const { user } = useAuth();
if (!user?.company_id) redirect('/login');

// 4. Filter by company
const leads = await directusServer.request(
  readItems('leads', {
    filter: { company_id: { _eq: user.company_id } }
  })
);
```

## Integration Points

### WhatsApp Flow (Twilio)
1. **Webhook** → `directus/extensions/endpoints/whatsapp/index.js` receives message
2. **Identify company** → `getCompanySettingsByWhatsApp()` via `To` field (company's WhatsApp number)
3. **Process message** → Uses company's OpenAI key to analyze intent, extract data
4. **Store conversation** → Creates/updates `conversas` and `mensagens` collections with `company_id`
5. **Auto-respond** → Calls Twilio endpoint with company's credentials

**Not yet implemented:** Audio transcription (Whisper), advanced property matching automation.

**Testing:** Use real credentials from Exclusiva project for development/staging.

### Property Sync Worker
`directus/workers/import-properties.js` - 2-phase import from external API:
- Phase 1: Fetch property list
- Phase 2: Fetch details + photos for each property
- Uploads images to Directus Files, creates `property_media` records

**Run manually:** `npm run import:properties`
**Missing:** Scheduled job (cron), job status tracking, error recovery.

### External APIs
All credentials stored in `app_settings` collection per company:
- **Twilio:** `twilio_account_sid`, `twilio_auth_token`, `twilio_whatsapp_number` (primary WhatsApp integration)
- **OpenAI:** `openai_api_key`, `openai_model` (default: gpt-4o-mini)

**Testing credentials:** Use real Exclusiva project credentials for development - no sandbox separation.

**Security issue:** `.env` has default admin password and CORS wide open - rotate before production.

## Critical Gaps & TODOs

### Immediate Fixes Needed
1. **Auth protection:** Routes under `/empresa/*` and `/admin/*` have no server-side auth check - add middleware
2. **Mock data removal:** Search codebase for `TODO: Get company_id from authenticated user` and implement
3. **Twilio extension bug:** Fix undefined constants in `/send-image` route
4. **Permissions:** Run `directus/setup-role-permissions.js` and export `access/permissions.json` to version control

### Storefront Development (High Priority)
Companies need ability to select public-facing website template:
- **Requirement:** 20 different storefront templates for property listings
- **Template #1:** Port `/imoveis` page from Exclusiva project as first template
- **Admin UI:** Add template selector in company admin panel (`/empresa/configuracoes`)
- **Custom Domain:** Company configures CNAME at registrar, enters domain in admin (stored in `companies.custom_domain`)
- **Rendering:** Middleware detects custom domain, applies selected template, filters properties by `company_id`
- **Fields needed:** Add `storefront_template_id` (1-20) to `companies` collection

### Migration from Exclusiva (Legacy System)
Repo: `marcuslimadev/exclusiva` (Lumen + Vue.js)

**Needs porting:**
- WhatsAppService logic (intent detection, conversation context)
- OpenAI integration (GPT-4o-mini + Whisper transcription)
- Lead-property matching algorithm
- Diagnostic reports via AI

**Collections to add:** `lead_property_matches`, `atividades`, extended conversation fields.

## New Feature Requirements (Vistoria & Assinatura)

### Module: Vistoria (Inspection) - **NOT IMPLEMENTED**
Full inspection management system for property condition documentation:

**Collections needed:**
- `vistorias` - Inspection records (status: Solicitada, Designada, Em Andamento, Concluída, Cancelada)
- `vistoria_solicitacoes` - Inspection requests with Kanban/Calendar views
- `vistoria_itens` - Room-by-room inspection items with photos/videos
- `vistoria_contestacoes` - Disputes/divergences (status: Apontadas, Em Análise, Finalizadas)

**Frontend pages needed:**
- `/empresa/vistorias` - List with filters (Código, Status, Cliente, Imóvel, Tipo)
- `/empresa/vistorias/solicitacoes` - Kanban board, Calendar, List views
- `/empresa/vistorias/nova` - Multi-tab form (Solicitação, Observações, Pessoas, Histórico)
- `/empresa/vistorias/contestacoes` - Disputes management

**Features:**
- Searchable/filterable lists with export
- Multiple view modes (Kanban, Calendar, List)
- Photo/video upload for each inspection item
- Time estimation and vistoriador assignment
- Property condition comparison (entrada vs saída)

### Module: Assinatura Eletrônica (e-Signature) - **PARTIAL**
Document signing workflow with ClickSign integration:

**Collections needed:**
- `documentos_assinatura` - Document signing records (status: Assinado, Pendente, Cancelado)
- `documentos_signatarios` - Signers per document with individual status tracking

**Frontend pages needed:**
- `/empresa/assinaturas` - Document list (Código, Data, Assunto, Status, Assinantes)
- `/empresa/assinaturas/novo` - Upload document, add signatories, send for signing
- `/empresa/assinaturas/[id]` - Track signing progress, resend notifications

**Integration:**
- ClickSign API extension (`directus/extensions/endpoints/clicksign/`)
- Webhook receiver for signature status updates
- Email notifications for pending signatures
- PDF document storage in Directus Files

**Note:** `clicksign_access_token` field already exists in `app_settings` but no endpoint/UI implemented.

### Module Enhancements: Pessoas (People) - **PARTIAL**
Current `leads` collection covers basic person data. Needs enhancement:

**Missing fields:**
- Tipo (Física/Jurídica) toggle
- RG, Órgão Expedidor, Data de Expedição, CNH (Pessoa Física)
- Multiple contacts per person (tipo, contato, descrição)
- Address fields already exist but need CEP auto-fill integration

**Frontend enhancements:**
- Multi-tab form (Principal, Pessoa Física, Endereço, Contatos)
- CEP lookup service integration
- Contact list management (add/remove multiple)

### Module Enhancements: Imóveis (Properties) - **IMPLEMENTED**
Current `properties` collection has most required fields. Minor gaps:

**Already exists:**
- ✅ Identificação, Tipo, Finalidade, Metragem
- ✅ Endereço completo (CEP, Estado, Cidade, Bairro, etc.)
- ✅ Company_id isolation

**Missing:**
- Edifício/Condomínio field (add to `properties`)
- CEP auto-fill on frontend forms

## File References

### Key Backend Files
- `directus/extensions/shared/company-settings.js` - Multi-tenant config helper
- `directus/register-collections.js` - Schema creation (16 collections)
- `directus/setup-roles.js` - Role/permission setup
- `directus/extensions/endpoints/twilio/index.js` - WhatsApp sending (needs fixes)
- `directus/extensions/endpoints/openai/index.js` - AI endpoints

### Key Frontend Files
- `nextjs/src/middleware.ts` - Tenant detection logic
- `nextjs/src/contexts/AuthContext.tsx` - User session management
- `nextjs/src/lib/directus/client.ts` - Directus SDK setup (server vs client)
- `nextjs/src/app/empresa/*` - Company dashboard pages (many TODOs)
- `nextjs/src/app/leads/page.tsx` - Lead management (uses mock data)

### Documentation
- `PLANO_CENTRAL.md` - **Single source of truth** for project status & backlog
- `ARQUITETURA_SAAS_MULTI_TENANT.md` - Full architecture reference
- `COMO_USAR.md` - Setup guide & manual testing steps
- `README.md` - Project overview

## When Making Changes

1. **Always filter by company_id** when querying collections (except `companies` itself)
2. **Use the helper** in Directus extensions: `getCompanySettings()` for API keys, never hardcode
3. **Check PLANO_CENTRAL.md** before starting work - it lists all known issues and priorities
4. **Update schema via scripts** not Directus UI - edit `register-*.js` files
5. **Test multi-tenant isolation** - create 2 test companies, ensure data doesn't leak
6. **Add loading states** when converting from mock to real data
7. **Log errors with context** - include `company_id`, `user_id`, request details in logs

---

## AI Agent Development Guidelines (Directus + SaaS Multi-Tenant)

### General Rules (MANDATORY)
- Always assume backend is Directus (PostgreSQL + Redis + Docker in production)
- Always propose/generate code thinking about multi-tenant, security, and scalability
- Avoid "hacks" in frontend to compensate for lack of Directus modeling: if it's data/business logic, model it in Directus

### Multi-Tenant Implementation

1. **Tenant Isolation**
   - Always consider `company_id` (tenant identifier) in all business collections (properties, leads, users, etc.)
   - Every query MUST be filtered by tenant
   - Use Directus Permissions + Conditions filters instead of frontend-only filtering
   - Always think about endpoints/flows for automatic new tenant creation (real estate agency onboarding)

2. **Permission Conditions Pattern**
   ```javascript
   // Always apply in Directus role permissions
   {
     "company_id": { "_eq": "$CURRENT_USER.company_id" }
   }
   ```

### Roles and Permissions

**Required roles:**
- `platform_super_admin` - Full platform access, manages all tenants
- `tenant_admin` - Company administrator, manages their own agency
- `agent` / `corretor` - Real estate agent, limited to assigned leads/properties
- `assistant` - Support staff, read-only or limited write access
- `viewer` - Read-only access

**Every sensitive operation** (create/edit/delete properties, leads, users, documents) must respect these roles.

**When suggesting new collections**, always include permission definitions (who can read, create, update, delete).

### Flows and Automations

**Prefer reactive business logic via:**
1. Directus Flows + Webhook/external endpoint, OR
2. Directus Hooks/Extensions

**NEVER put critical business logic only in frontend.**

**Required automation triggers:**
- Lead created → WhatsApp notification, email, CRM activity log
- Property published → Webhook to portals, sitemap update
- Status changed → Notifications, audit log
- Document signed → Update contract status, notify parties

### Directus Extensions

**When needing specialized logic:**
- Use `extensions/endpoints` for custom API routes
- Use `extensions/hooks` for data lifecycle events
- Use `extensions/modules` for admin UI extensions

**Avoid creating parallel APIs outside Directus without necessity.**

### Files and Media

- Use Directus file system for documents, photos, and property videos
- Always consider multi-tenant structure: folders or metadata by `company_id`
- Configure public/private access via permissions + storage (e.g., S3)

### Platform Super Admin Panel

Always consider a `platform_super_admin` panel with:
- Real estate agency (tenant) management
- Plans, limits, and contract status
- Logs/audit (user activities, API consumption, storage)
- Billing integration (Mercado Pago/Asaas)

### External Integrations

**Main integrations:**
- **Mercado Pago / Asaas** - SaaS billing
- **WhatsApp API (Twilio)** - Messaging
- **Transactional Email** - SendGrid/Resend
- **SMS** - Twilio
- **ClickSign** - Document signing

**Always call integrations from Directus Flows/Hooks or well-defined backend, NOT from frontend.**

### API for Next.js

- Assume Next.js consumes Directus API (REST or GraphQL) with proper authentication (JWT, static token)
- Optimize queries (filters, selected fields, pagination) to avoid unnecessary traffic
- Always respect `company_id` and roles in queries

### Code Style

- Clear, modular, maintainable, and extensible code
- Name entities, collections, fields, and functions explicitly and coherent with real estate domain:
  - `imovel`, `lead`, `contrato`, `locacao`, `venda`, `vistoria`, `corretor`
- When suggesting code, always include collection structure AND permission definitions

### Collections Naming Convention

| Collection | Description |
|------------|-------------|
| `companies` | Tenants (real estate agencies) |
| `properties` | Properties/listings |
| `leads` | Leads and clients |
| `conversas` | WhatsApp conversations |
| `mensagens` | Individual messages |
| `contratos` | Rental/sale contracts |
| `vistorias` | Property inspections |
| `documentos_assinatura` | e-Signature documents |
| `atividades` | Activity/audit log |
| `app_settings` | Per-tenant configuration |
| `subscription_plans` | SaaS plans |
| `tenant_subscriptions` | Tenant billing records |
