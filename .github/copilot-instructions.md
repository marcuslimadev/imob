
## iMOBI — Copilot instructions (concise)

**IMPORTANTE: Sempre responda em português brasileiro.**

Purpose: make AI agents productive fast in this multi-tenant Directus + Next.js repo.

**Quick start (local, PowerShell)**
- Directus: `cd directus && docker compose up -d`
- Apply schema/roles/seed on first run: `node register-collections.js && node register-fields.js && node setup-roles.js && node setup-role-permissions.js && node seed-data.js`
- Frontend: `cd ../nextjs && pnpm install && pnpm dev` (default http://localhost:3000/home)

**Architecture to remember**
- Data isolation is always by `company_id`; never hardcode IDs. Middleware detects tenant by host/subdomain and injects headers in [nextjs/src/middleware.ts](nextjs/src/middleware.ts).
- Directus is the single backend. Custom endpoints are CommonJS and must load per-tenant credentials via [directus/extensions/shared/company-settings.js](directus/extensions/shared/company-settings.js) (`getCompanySettings*` helpers, maps WhatsApp numbers → company).
- Frontend talks to Directus through typed SDK wrappers: [nextjs/src/lib/directus/client.ts](nextjs/src/lib/directus/client.ts) (server vs browser) and tenancy helpers in [nextjs/src/lib/directus/tenancy.ts](nextjs/src/lib/directus/tenancy.ts) if present.
- Theme system is data-driven (company `theme_key`, CSS variables). See [nextjs/src/styles/globals.css](nextjs/src/styles/globals.css) and [nextjs/src/lib/design-themes.ts](nextjs/src/lib/design-themes.ts) when touching layout.

**Workflow conventions**
- Schema or permission changes live in scripts, not ad-hoc UI edits: [directus/register-collections.js](directus/register-collections.js), [directus/register-fields.js](directus/register-fields.js), [directus/setup-roles.js](directus/setup-roles.js), [directus/setup-role-permissions.js](directus/setup-role-permissions.js). Run them then export permissions from Directus UI.
- Directus extensions stay CommonJS (`module.exports = (router, context) => {}`); avoid ES modules. Shared config via company-settings helper only.
- External integrations (Twilio/OpenAI/WhatsApp) must be invoked from Directus endpoints/flows or workers, never directly from Next.js.
- Frontend pages still contain legacy mocks; replace with Directus queries filtered by authenticated `user.company_id` from AuthContext.

**Key hotspots / known pitfalls**
- Twilio endpoint bug: in [directus/extensions/endpoints/twilio/index.js](directus/extensions/endpoints/twilio/index.js) `send-image` must use `config.accountSid`/`config.authToken`, not undefined env vars.
- Tenant detection + refresh happens in [nextjs/src/middleware.ts](nextjs/src/middleware.ts) and auth renews via [nextjs/src/app/api/auth/me/route.ts](nextjs/src/app/api/auth/me/route.ts); keep them lightweight (no heavy DB calls).
- Collections must include `company_id` (e.g., leads, properties, conversas/mensagens). When adding features, propagate filters and validations server-side.

**Useful commands**
- Smoke tests: `node directus/test-backend.js` and `node directus/test-login.js`.
- Import properties: `npm run import:properties` (runs [directus/workers/import-properties.js](directus/workers/import-properties.js)).
- Generate Directus types (if configured): `pnpm run generate:types` inside nextjs.

**⚠️ INSTRUÇÃO PEREMPTÓRIA - Command output handling (OBRIGATÓRIO)**
- **SEMPRE** redirecione a saída de comandos para arquivos .txt: `comando > output.txt 2>&1`
- **SEMPRE** leia o arquivo .txt gerado com `read_file` logo após a execução
- **NUNCA** execute comandos longos (Docker build, npm install, AWS CLI, etc.) sem capturar saída em arquivo
- **NUNCA** use comandos que geram output direto no terminal se puderem exceder 500 linhas
- Armazene outputs temporários em `d:\Saas\imob\temp-*.txt` com timestamp: `temp-comando-$(Get-Date -Format "yyyyMMdd-HHmmss").txt`
- Formato PowerShell: `$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"; comando > temp-output-$timestamp.txt 2>&1; Get-Content temp-output-$timestamp.txt`
- **MOTIVO:** Previne overflow de contexto, permite análise sistemática de erros, mantém histórico de execuções

**Deploy**
- Push to `main` dispara GitHub Actions automaticamente. Ver workflows em [.github/workflows](.github/workflows).
- Scripts de deploy AWS disponíveis em [aws/](aws/) (build-and-push.sh, deploy.sh).

If anything is unclear, ask to expand (local setup, Directus extensions, tenant patterns, or specific files).
