
# iMOBI — Copilot instructions (concise)

Purpose: help AI coding agents get productive quickly in this repo (multi-tenant Next.js + Directus).

Quick start (local, PowerShell):
1. Start Directus (docker):
   cd directus && docker compose up -d
2. Apply schema & seed (first run):
   node register-collections.js
   node register-fields.js
   node setup-roles.js
   node seed-data.js
3. Start frontend: cd ../nextjs && pnpm install && pnpm dev

Key project patterns (do these always):
- Tenant isolation: every business collection is filtered by `company_id`. Do not hardcode company IDs.
- Directus extensions: use CommonJS. Import helpers with `require('../../shared/company-settings.js')` and export with `module.exports = (router, context) => {}`.
- Use `getCompanySettings()` in `directus/extensions/shared/company-settings.js` to load per-tenant creds (Twilio/OpenAI).
- Schema changes: edit `directus/register-*.js` scripts, run them locally, then export permissions from Directus UI.

Critical files to inspect when changing behavior:
- [directus/extensions/shared/company-settings.js](directus/extensions/shared/company-settings.js)
- [directus/register-collections.js](directus/register-collections.js)
- [directus/register-fields.js](directus/register-fields.js)
- [directus/setup-roles.js](directus/setup-roles.js)
- [directus/extensions/endpoints/twilio/index.js](directus/extensions/endpoints/twilio/index.js) — known bug: use `config.accountSid`/`config.authToken` instead of undefined env constants.
- [nextjs/src/middleware.ts](nextjs/src/middleware.ts) — tenant detection and header injection.
- [nextjs/src/lib/directus/client.ts](nextjs/src/lib/directus/client.ts) — server vs client Directus clients.

Testing & useful commands:
- Run Directus smoke tests: `node directus/test-backend.js` and `node directus/test-login.js`.
- Import properties manually: `npm run import:properties` (runs `directus/workers/import-properties.js`).
- Playwright E2E live in `nextjs/tests/e2e/` (currently broken; update selectors before running `pnpm test`).

Conventions & gotchas:
- Do not edit Directus schema in production via UI — update register scripts instead.
- Middleware should avoid heavy DB queries; caching is used to limit latency.
- Many frontend pages still use mock data or hardcoded `company_id` — when fixing, add loading skeletons and filter by `user.company_id` from `AuthContext`.

Integration notes:
- Credentials are stored per-tenant in `app_settings` collection (`twilio_*`, `openai_api_key`, etc.).
- WhatsApp webhook flow lives in `directus/extensions/endpoints/whatsapp/index.js` and uses `getCompanySettingsByWhatsApp()` to map numbers → company.

If you need more context, inspect `PLANO_CENTRAL.md` for priorities and `ARQUITETURA_SAAS_MULTI_TENANT.md` for architecture diagrams.

If anything above is unclear or missing, tell me which area to expand (local setup, Directus extensions, tenant patterns, or specific files).

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
