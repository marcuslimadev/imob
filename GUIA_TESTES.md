# 🧪 Guia de Testes - iMOBI Sistema Completo

## 📋 Pré-requisitos

### 1️⃣ Fechar Terminal Travado
O terminal PowerShell está preso no paginador `less`. 
- Pressione `q` para sair
- Ou feche o terminal e abra um novo

### 2️⃣ Verificar Containers Docker
```powershell
cd d:\IMob\directus
docker compose ps
```

**Esperado:** Ver containers `directus`, `database`, `redis` rodando.

Se não estiverem rodando:
```powershell
docker compose up -d
```

### 3️⃣ Verificar Next.js
```powershell
cd d:\IMob\nextjs
pnpm dev
```

**Esperado:** Next.js rodando em `http://localhost:4000`

---

## 🧪 Bateria de Testes

### TESTE 1: Aplicar Permissões Multi-tenant 🔐

**Objetivo:** Aplicar as 43 permissões configuradas para role "Company Admin"

```powershell
# Copiar script para dentro do container
cd d:\IMob\directus
docker compose cp apply-permissions-sql.js directus:/tmp/

# Executar script
docker compose exec directus node /tmp/apply-permissions-sql.js
```

**Resultado Esperado:**
```
✅ Conectado ao PostgreSQL
✅ Policy encontrada: Company Admin (ID: ...)
✅ 43 permissões aplicadas com sucesso
```

**Verificar:**
- Acessar Directus Admin: http://localhost:8055/admin
- Login: marcus@admin.com / Teste@123
- Settings → Roles & Permissions → Company Admin
- Deve ter 43 permissões configuradas

---

### TESTE 2: Vitrines Públicas com Custom Domain 🌐

#### A. Testar Template Padrão

**URL:** http://localhost:4000/vitrine?company=exclusiva

**Verificar:**
- ✅ Página carrega com template padrão (azul/branco)
- ✅ Lista de imóveis aparece
- ✅ Filtros funcionam (tipo, finalidade, preço)
- ✅ Busca por palavra funciona
- ✅ Cards de imóveis mostram foto, preço, título

#### B. Testar Seleção de Template

1. **Login como Company Admin:**
   - URL: http://localhost:4000/login
   - Email: marcus@exclusiva.com
   - Senha: Teste@123

2. **Ir para Configurações:**
   - URL: http://localhost:4000/empresa/configuracoes/vitrine

3. **Selecionar Template Diferente:**
   - Clicar em "Template 11 - Dark Mode Avançado" (ou outro)
   - Clicar em "Salvar Configuração"
   - Aguardar confirmação

4. **Verificar Mudança:**
   - Abrir aba anônima: http://localhost:4000/vitrine?company=exclusiva
   - Deve mostrar novo template selecionado

#### C. Testar Todos os 20 Templates

**Acesso direto via query param:**
```
http://localhost:4000/vitrine?company=exclusiva&template=1  # Padrão
http://localhost:4000/vitrine?company=exclusiva&template=2  # Moderno Dark
http://localhost:4000/vitrine?company=exclusiva&template=6  # Grid Masonry
http://localhost:4000/vitrine?company=exclusiva&template=11 # Dark Mode
http://localhost:4000/vitrine?company=exclusiva&template=14 # Carousel Hero
http://localhost:4000/vitrine?company=exclusiva&template=17 # Map Integration
http://localhost:4000/vitrine?company=exclusiva&template=20 # Video Background
```

**Verificar cada um:**
- ✅ Layout único e diferenciado
- ✅ Imóveis carregam corretamente
- ✅ Filtros funcionam
- ✅ Responsivo (testar mobile com DevTools)

---

### TESTE 3: WhatsApp + IA (Simulação) 🤖

#### A. Preparar Dados de Teste

1. **Verificar configurações OpenAI:**
```powershell
cd d:\IMob\directus
docker compose exec database psql -U directus -d directus -c "SELECT company_id, openai_api_key, openai_model FROM app_settings WHERE company_id IN (SELECT id FROM companies WHERE slug='exclusiva');"
```

**Se não tiver chave OpenAI configurada:**
```sql
-- Executar no psql
UPDATE app_settings 
SET openai_api_key = 'sk-sua-chave-aqui',
    openai_model = 'gpt-4o-mini'
WHERE company_id IN (SELECT id FROM companies WHERE slug='exclusiva');
```

2. **Verificar configurações Twilio:**
```powershell
docker compose exec database psql -U directus -d directus -c "SELECT company_id, twilio_account_sid, twilio_whatsapp_number FROM app_settings WHERE company_id IN (SELECT id FROM companies WHERE slug='exclusiva');"
```

#### B. Testar Endpoint de Transcrição

**Criar arquivo de teste:**
```powershell
cd d:\IMob
$body = @{
    audio_url = "https://example.com/audio.mp3"
    company_id = "ID-DA-EXCLUSIVA"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8055/openai/transcribe" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Resultado Esperado:**
```json
{
  "success": true,
  "transcription": "Texto transcrito do áudio..."
}
```

#### C. Testar Análise de Mensagem

```powershell
$body = @{
    message = "Olá, procuro apartamento de 2 quartos em Copacabana, orçamento até 800 mil"
    context = "Novo contato via WhatsApp"
    company_id = "ID-DA-EXCLUSIVA"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8055/openai/process-message" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Resultado Esperado:**
```json
{
  "success": true,
  "intent": "busca_imovel",
  "response": "Olá! Vi que você procura apartamento de 2 quartos em Copacabana...",
  "extractedData": {
    "tipo_imovel": "apartamento",
    "bairro": "Copacabana",
    "quartos": 2,
    "orcamento_max": 800000
  },
  "matchedProperties": [...]
}
```

---

### TESTE 4: Interface de Conversas WhatsApp 💬

#### A. Acessar Painel de Conversas

1. **Login:** http://localhost:4000/login
   - marcus@exclusiva.com / Teste@123

2. **Ir para Conversas:** http://localhost:4000/empresa/conversas

**Verificar:**
- ✅ Lista de conversas aparece (vazia se primeira vez)
- ✅ Botão "Nova Conversa" visível
- ✅ Filtros funcionam (Status, Data)

#### B. Visualizar Conversa (se existir)

**Verificar:**
- ✅ Histórico de mensagens em ordem cronológica
- ✅ Mensagens do cliente à esquerda
- ✅ Mensagens da empresa à direita
- ✅ Transcrições de áudio aparecem (se houver)
- ✅ Dados do lead aparecem na barra lateral
- ✅ Imóveis recomendados aparecem

---

### TESTE 5: CRUD de Imóveis 🏠

#### A. Listar Imóveis

**URL:** http://localhost:4000/empresa/imoveis

**Verificar:**
- ✅ Lista carrega com imóveis da empresa
- ✅ Filtros funcionam (Tipo, Finalidade, Status)
- ✅ Busca por código/título funciona
- ✅ Paginação funciona

#### B. Criar Novo Imóvel

1. Clicar em "Novo Imóvel"
2. Preencher formulário:
   - Código: `TEST-001`
   - Título: `Apartamento Teste Copacabana`
   - Tipo: Apartamento
   - Finalidade: Venda
   - Preço: 850000
   - Quartos: 3
   - Banheiros: 2
   - Área: 120
   - CEP: 22070-002
   - Bairro: Copacabana
   - Cidade: Rio de Janeiro
   - Estado: RJ

3. Upload de fotos (opcional)
4. Salvar

**Verificar:**
- ✅ Imóvel criado com sucesso
- ✅ Aparece na listagem
- ✅ Dados salvos corretamente
- ✅ Fotos aparecem (se enviadas)

#### C. Editar Imóvel

1. Clicar em imóvel da lista
2. Editar preço para 820000
3. Salvar

**Verificar:**
- ✅ Preço atualizado
- ✅ Mudança reflete na listagem
- ✅ Mudança reflete na vitrine pública

---

### TESTE 6: CRUD de Leads 👥

#### A. Listar Leads

**URL:** http://localhost:4000/empresa/leads

**Verificar:**
- ✅ Lista carrega com leads da empresa
- ✅ Filtros funcionam (Status, Origem)
- ✅ Busca funciona
- ✅ Cards mostram dados principais

#### B. Criar Novo Lead

1. Clicar em "Novo Lead"
2. Preencher:
   - Nome: João Silva
   - Email: joao@test.com
   - Telefone: (21) 99999-9999
   - CPF: 123.456.789-00
   - Tipo Imóvel: Apartamento
   - Finalidade: Compra
   - Orçamento: 800000

3. Salvar

**Verificar:**
- ✅ Lead criado
- ✅ Aparece na listagem
- ✅ Status "Novo" atribuído
- ✅ Timeline vazia criada

---

### TESTE 7: Sistema de Temas 🎨

#### A. Trocar Tema da Interface Admin

1. **Login:** http://localhost:4000/login
2. **Ir para:** http://localhost:4000/empresa/configuracoes
3. **Seção "Tema da Interface"**
4. **Selecionar tema diferente:** Memphis, Brutalism, etc.
5. **Salvar**

**Verificar:**
- ✅ Cores mudam imediatamente
- ✅ Fontes mudam conforme tema
- ✅ Border-radius ajusta
- ✅ Sombras/elevações mudam
- ✅ Tema persiste ao recarregar página

#### B. Testar Todos os 10 Temas

**Temas disponíveis:**
1. Bauhaus (padrão)
2. Ulm
3. Swiss
4. Brutalism
5. Memphis
6. Wabi-Sabi
7. Scandinavian
8. Art Deco
9. Minimalism
10. Neo-Brutalism

**Para cada tema, verificar:**
- ✅ Identidade visual única
- ✅ Legibilidade mantida
- ✅ Contraste adequado
- ✅ Componentes renderizam corretamente

---

### TESTE 8: Multi-tenant Isolation 🔒

#### A. Criar Segunda Empresa de Teste

```powershell
cd d:\IMob\directus
docker compose exec database psql -U directus -d directus
```

```sql
-- Criar empresa teste 2
INSERT INTO companies (id, name, slug, email, phone, theme_key, storefront_template_id, status)
VALUES (
    gen_random_uuid(),
    'Imóveis Teste 2',
    'teste2',
    'contato@teste2.com',
    '(11) 98888-8888',
    'bauhaus',
    1,
    'active'
) RETURNING id;

-- Copiar o ID retornado e criar configurações
INSERT INTO app_settings (id, company_id, openai_api_key, openai_model)
VALUES (
    gen_random_uuid(),
    'ID-COPIADO-ACIMA',
    'sk-test',
    'gpt-4o-mini'
);
```

#### B. Verificar Isolamento

1. **Login como Exclusiva:**
   - marcus@exclusiva.com / Teste@123
   - Ir para /empresa/imoveis
   - Contar quantos imóveis aparecem

2. **Login como Teste 2:**
   - Criar usuário para teste2
   - Login e ir para /empresa/imoveis
   - **Verificar:** Lista vazia (nenhum imóvel da Exclusiva)

3. **Criar imóvel em Teste 2**
4. **Verificar vitrine:**
   - http://localhost:4000/vitrine?company=teste2
   - Deve mostrar apenas imóveis de Teste 2

---

## 📊 Checklist Final

Após todos os testes, verificar:

### Backend (Directus)
- [ ] 43 permissões aplicadas
- [ ] Collections criadas (16 total)
- [ ] Roles configuradas (Administrator, Company Admin)
- [ ] Extensions carregadas (WhatsApp, OpenAI, Twilio)
- [ ] Isolation multi-tenant funcionando

### Frontend (Next.js)
- [ ] Autenticação funciona
- [ ] Dashboard carrega
- [ ] CRUD Imóveis funciona
- [ ] CRUD Leads funciona
- [ ] Sistema de temas funciona
- [ ] Vitrines públicas funcionam
- [ ] 20 templates renderizam corretamente

### Integrações
- [ ] OpenAI endpoints respondem
- [ ] WhatsApp webhook processa mensagens
- [ ] Transcrição de áudio funciona
- [ ] IA extrai dados corretamente
- [ ] Matching de imóveis funciona

### Multi-tenant
- [ ] Empresas isoladas corretamente
- [ ] Dados não vazam entre tenants
- [ ] Configurações específicas por empresa
- [ ] Custom domain detection funciona

---

## 🐛 Troubleshooting

### Problema: Containers não sobem
```powershell
docker compose down
docker compose up -d --force-recreate
docker compose logs -f directus
```

### Problema: Next.js não inicia
```powershell
cd nextjs
rm -rf .next
pnpm install
pnpm dev
```

### Problema: Permissões não aplicam
```powershell
# Verificar policy existe
docker compose exec database psql -U directus -d directus -c "SELECT * FROM directus_policies WHERE name LIKE '%Company%';"

# Aplicar manualmente via SQL
docker compose exec database psql -U directus -d directus -f /tmp/apply-permissions.sql
```

### Problema: OpenAI retorna 401
- Verificar chave API válida em `app_settings`
- Testar chave diretamente: https://platform.openai.com/api-keys

### Problema: Templates não carregam
- Verificar `storefront_template_id` está entre 1-20
- Verificar arquivo existe: `src/components/vitrine/templates/Template[X].tsx`
- Verificar console do navegador para erros

---

## 🎯 Próximos Passos Após Testes

1. **Exportar Permissions JSON**
   - Directus UI → Settings → Data Model → Export
   - Salvar em `directus/access/permissions.json`

2. **Commit Mudanças**
   ```powershell
   git add .
   git commit -m "feat: 20 storefront templates + WhatsApp AI integration + permissions"
   ```

3. **Testar em Staging/Produção**
   - Deploy no ambiente AWS conforme `DEPLOY_PRODUCAO_AWS.md`

4. **Documentar Resultados**
   - Atualizar `PLANO_CENTRAL.md` com resultados dos testes
   - Screenshot de cada template funcionando
   - Vídeo demo do WhatsApp AI em ação

---

**BOA SORTE NOS TESTES! 🚀**
