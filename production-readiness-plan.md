# Plano de Readiness para Produção

## Resumo executivo
- O produto ainda opera em modo protótipo: telas de `nextjs/src/app/leads/page.tsx` e `nextjs/src/app/conversas/page.tsx` usam dados mockados e não tratam estados de carregamento/erros.
- O backend Directus (`directus/docker-compose.yaml` + extensões) mantém credenciais padrão, CORS aberto (`*`) e fluxos parcialmente definidos, o que impede expor o stack fora do ambiente interno.
- Processos operacionais (observabilidade, backups, testes e CI) estão incompletos; há apenas specs Playwright (`tests/e2e/*.spec.ts`) com asserts desatualizados.
- Multi-tenant e permissões existem em documentação, porém não há validações ponta-a-ponta (middleware + Directus + flows), expondo risco de vazamento entre empresas.
- Antes do go-live é necessário alinhar código, infraestrutura e governança (logs, secretes, roles, monitoramento e plano de rollback).

## Visão arquitetural
- **Frontend:** Next.js 15 (App Router) com Tailwind/shadcn, roteamento dinâmico e middleware multi-tenant (`nextjs/src/middleware.ts`).
- **Backend:** Directus 11 em Docker (Postgres + Redis) com extensões customizadas (`directus/extensions/*`) para OpenAI, Twilio e WhatsApp.
- **Integrações:** Scripts `directus/scripts/*.ts` registram coleções/campos; flows planejados, porém não versionados.
- **Ops:** Docker Compose local, sem pipelines de build, testes ou deploy; env vars documentadas em `README.md`, mas não automatizadas.

## Lacunas e recomendações
### Frontend Next.js
1. **Mock data em módulos críticos** (`leads`, `conversas`, `dashboard`).
   - **Impacto:** Métricas incorretas, ausência de loading/error states.
   - **Ações:** Implementar data fetchers via `src/lib/directus/*`, adicionar suspense/loading, skeletons e tratativas de erros.
2. **Multi-tenant parcial.** Middleware injeta `company-id`, porém componentes ainda usam IDs hardcoded.
   - **Ações:** Adotar hook/contexto para company atual, validar em cada fetcher e impedir renderização sem header obrigatório.
3. **Autenticação e UX.** `AuthProvider` não bloqueia acesso durante refresh; páginas sensíveis não verificam sessão server-side.
   - **Ações:** Usar `cookies()` + `redirect` em rotas server components, revisar `nextjs/src/app/layout.tsx` para fallback offline, criar rota de logout e renovação de tokens.
4. **Acessibilidade/perf.** Falta de metas e metadata em páginas (SEO) e ausência de lazy-loading para gráficos/painéis pesados.
   - **Ações:** Configurar `metadata` nos layouts, dividir pacotes via dynamic imports e integrar Web Vitals logging.

### Backend Directus
1. **Configuração insegura.** `directus/.env` mantém admin defaults, `PUBLIC_CORS_ENABLED=true`, `PUBLIC_CORS_ORIGIN=*` e `KEY=<placeholder>`.
   - **Ações:** Rotacionar credenciais, restringir CORS/headers, mover segredos para vault/secret manager e habilitar HTTPS/PROXY trust.
2. **Permissões incompletas.** Documentação de roles não garante enforcement; flows de sincronia (WhatsApp status, backups) não existem.
   - **Ações:** Versionar `access.json`/`permissions.json`, automatizar seed via CLI, criar testes de permissão.
3. **Extensões sem observabilidade.** `directus/extensions/openai/index.js` e `shared/company-settings` não tratam timeouts/falhas externas.
   - **Ações:** Adicionar circuit breaker simples, logs estruturados e métricas (Prometheus/ELK) + retries com limites.
4. **Scripts utilitários manuais.** Criação de empresas/usuários depende de scripts TypeScript sem validação.
   - **Ações:** Transformar em comandos confiáveis (idempotentes) e integrá-los ao pipeline (ex.: `pnpm directus seed`).

### Integrações & Automação
- **WhatsApp/Twilio:** Config placeholders sem provas de funcionamento. Necessário ambiente de homologação, webhooks autenticados e rastro de mensagens.
- **OpenAI:** Token único (`OPENAI_API_KEY`) e rate limiting inexistente. Configurar quotas por empresa e armazenamento seguro de prompts/respostas.
- **Flows & Webhooks:** Planejamento descrito em docs, porém sem arquivos `.json` exportados.
  - **Ações:** Versionar flows, validar triggers e adicionar testes unitários para operações customizadas.

### Infraestrutura & DevOps
- **Ausência de CI/CD.** Sem lint/test automation ou builds reprodutíveis.
  - **Ações:** Definir pipeline (GitHub Actions/Azure DevOps) com lint, type-check, Playwright e build Docker.
- **Observabilidade nula.** Sem logs centralizados, métricas ou alertas.
  - **Ações:** Adotar stack (Grafana/Loki/Prometheus) ou serviço gerenciado; instrumentar Next.js e Directus com log estruturado e request IDs.
- **Backups/DR.** Postgres roda dentro de Compose com volumes locais e sem snapshots.
  - **Ações:** Configurar backups automáticos, política de retenção e restore drills.

### Qualidade & Testes
- **Playwright specs desatualizadas** (`tests/e2e/dashboard.spec.ts`, etc.).
  - **Ações:** Atualizar seletores/textos reais, incluir cenários críticos (login, troca de empresa, filtros, integrações).
- **Sem testes unitários/integration.** Nenhum coverage para hooks/lib.
  - **Ações:** Introduzir Vitest/Jest para utilitários e mocks Directus, definir meta de cobertura mínima.
- **Test data management.** Falta base de dados seed para QA.
  - **Ações:** Criar fixtures versionadas (empresas, usuários, leads) e script de reset.

## Plano de ação priorizado
| Janela | Objetivo | Entregas chave |
| --- | --- | --- |
| **Quick Wins (0-3 dias)** | Saneamento mínimo | Rotacionar credenciais `.env`, restringir CORS, remover dados mock do `dashboard`, ajustar middleware para bloquear ausência de `company-id`, revisar textos dos testes Playwright existentes. |
| **Sprint 1 (1 semana)** | Dados reais e auth robusta | Implementar fetchers reais para `leads` e `conversas`, loading/error states, proteção server-side (`redirect` se sem sessão), seed automatizado de permissões/roles, scripts de criação de empresas idempotentes. |
| **Sprint 2 (1 semana)** | Observabilidade e integrações | Instrumentar logs/telemetria, configurar backups do Postgres, documentar/exportar flows Directus, validar Twilio/WhatsApp e OpenAI com ambientes segregados. |
| **Pré-GoLive (última milha)** | Hardening e conformidade | Testes E2E completos, pentest básico, políticas de acesso revisadas, plano de rollback e checklist de onboarding (monitoramento, alertas, backups). |

## Checklists antes do Go-Live
- **Funcional:** Navegação multi-tenant validada, dashboards refletindo dados de produção, formulários com validação e feedback completo, integrações externas testadas com contas reais.
- **Segurança:** TLS fim-a-fim, secret rotation, política de logs e auditoria em Directus, RBAC validado, varredura SAST/DAST.
- **Operacional:** Backups automatizados + restore testado, monitoramento ativo, runbooks de incidentes, CI/CD com gates de qualidade, documentação atualizada no repositório.
