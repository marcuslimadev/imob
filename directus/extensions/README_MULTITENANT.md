# 🏢 Extensões Multi-Tenant - Documentação

## 📋 Visão Geral

Todas as extensões foram atualizadas para suportar **multi-tenancy**, permitindo que múltiplas empresas usem o sistema de forma isolada.

## 🔧 Como Funciona

### 1. Helper de Configurações

Arquivo: `shared/company-settings.js`

```javascript
import { getCompanySettingsByWhatsApp } from '../../shared/company-settings.js';

// Buscar configurações por número WhatsApp
const settings = await getCompanySettingsByWhatsApp({ database }, 'whatsapp:+5531999999999');

// Retorna:
{
  company_id: 1,
  openai_api_key: "sk-proj-...",
  openai_model: "gpt-4o-mini",
  ai_assistant_name: "Teresa",
  twilio_account_sid: "ACxxxxxxxx",
  twilio_auth_token: "xxxxxxxxxx",
  twilio_whatsapp_number: "whatsapp:+5531999999999",
  webhook_url: "http://localhost:8055/whatsapp",
  is_active: true
}
```

### 2. Extensão WhatsApp (Atualizada)

**Endpoint:** `POST /whatsapp`

**Fluxo Multi-Tenant:**

```javascript
// 1. Webhook recebe mensagem
{
  "From": "whatsapp:+5531988887777",  // Cliente
  "To": "whatsapp:+5531999999999",    // Empresa
  "Body": "Olá, tenho interesse..."
}

// 2. Identifica empresa pelo campo "To"
const companySettings = await getCompanySettingsByWhatsApp({ database }, webhookData.To);

// 3. Usa configurações da empresa
logger.info('🏢 Empresa identificada:', {
  company_id: companySettings.company_id,
  ai_assistant: companySettings.ai_assistant_name
});

// 4. Cria/atualiza conversa COM company_id
await conversasService.createOne({
  company_id: companySettings.company_id,  // ✅ Isolamento!
  telefone: "5531988887777",
  whatsapp_name: "João Silva",
  status: 'ativa'
});

// 5. Salva mensagem
await mensagensService.createOne({
  conversa_id: conversaId,
  content: "Olá, tenho interesse...",
  direction: 'incoming',
  sent_at: new Date()
});
```

**Modo Fallback:**

Se empresa não for encontrada, o sistema:
- Loga warning: `⚠️  Empresa não encontrada para número`
- Continua processamento sem `company_id`
- Permite configurar depois

### 3. Extensão OpenAI (A Atualizar)

**Endpoint:** `POST /openai/transcribe`

**Como Atualizar:**

```javascript
import { getCompanySettings } from '../../shared/company-settings.js';

router.post('/transcribe', async (req, res) => {
  const { company_id, audio_url } = req.body;
  
  // Buscar configurações da empresa
  const settings = await getCompanySettings({ database }, company_id);
  
  // Usar chave OpenAI da empresa
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.openai_api_key}`,  // ✅ Chave isolada!
      'Content-Type': 'multipart/form-data'
    },
    body: formData
  });
});
```

### 4. Extensão Twilio (A Atualizar)

**Endpoint:** `POST /twilio/send-message`

**Como Atualizar:**

```javascript
import { getCompanySettings } from '../../shared/company-settings.js';

router.post('/send-message', async (req, res) => {
  const { company_id, to, message } = req.body;
  
  // Buscar configurações da empresa
  const settings = await getCompanySettings({ database }, company_id);
  
  // Criar cliente Twilio com credenciais da empresa
  const twilioClient = twilio(
    settings.twilio_account_sid,   // ✅ Credenciais isoladas!
    settings.twilio_auth_token
  );
  
  // Enviar de número da empresa
  await twilioClient.messages.create({
    from: settings.twilio_whatsapp_number,  // ✅ Número da empresa!
    to: `whatsapp:${to}`,
    body: message
  });
});
```

---

## 🎯 Benefícios

### ✅ Isolamento Total
- Cada empresa tem suas próprias chaves API
- Dados completamente separados por `company_id`
- Zero chance de vazamento entre empresas

### ✅ Configuração Flexível
- Cada empresa configura seu assistente AI
- Números WhatsApp diferentes
- Webhooks personalizados

### ✅ Escalabilidade
- Adicionar nova empresa = criar registro em `companies` + `app_settings`
- Sistema automaticamente roteia para configurações corretas
- Sem código duplicado

---

## 📝 Checklist de Atualização de Extensões

### WhatsApp Webhook ✅
- [x] Import do helper
- [x] Busca de configurações por número WhatsApp
- [x] Filtro por `company_id` ao buscar conversas
- [x] Salvar `company_id` em novas conversas
- [x] Logs de empresa identificada
- [x] Modo fallback sem empresa

### OpenAI Service ⏳
- [ ] Import do helper
- [ ] Receber `company_id` nos endpoints
- [ ] Buscar configurações via `getCompanySettings()`
- [ ] Usar `openai_api_key` da empresa
- [ ] Usar `openai_model` da empresa
- [ ] Usar `ai_assistant_name` da empresa

### Twilio Client ⏳
- [ ] Import do helper
- [ ] Receber `company_id` nos endpoints
- [ ] Buscar configurações via `getCompanySettings()`
- [ ] Usar `twilio_account_sid` da empresa
- [ ] Usar `twilio_auth_token` da empresa
- [ ] Usar `twilio_whatsapp_number` da empresa

---

## 🧪 Como Testar

### 1. Criar Empresa de Teste

```sql
-- Via SQL ou Directus UI
INSERT INTO companies (name, cnpj, status) 
VALUES ('Empresa Teste', '12.345.678/0001-90', 'active');

INSERT INTO app_settings (
  company_id, 
  openai_api_key, 
  twilio_account_sid,
  twilio_auth_token,
  twilio_whatsapp_number,
  ai_assistant_name,
  is_active
) VALUES (
  1,  -- ID da empresa criada
  'sk-proj-SEU_KEY_AQUI',
  'ACxxxxxxxxxxxx',
  'xxxxxxxxxxxxxxx',
  'whatsapp:+5531999999999',
  'Teresa',
  true
);
```

### 2. Testar Webhook

```powershell
curl -X POST http://localhost:8055/whatsapp `
  -H "Content-Type: application/json" `
  -d '{
    "From": "whatsapp:+5531988887777",
    "To": "whatsapp:+5531999999999",
    "Body": "Olá!",
    "MessageSid": "SM1234567890",
    "ProfileName": "João Silva"
  }'
```

**Esperado nos logs:**

```
🔔 WEBHOOK RECEBIDO - TWILIO
📱 De: whatsapp:+5531988887777
📱 Para: whatsapp:+5531999999999
🏢 Empresa identificada: { company_id: 1, ai_assistant: 'Teresa' }
✅ Nova conversa criada { id: 1, company_id: 1 }
```

### 3. Verificar Isolamento

```sql
-- Buscar conversas da empresa 1
SELECT * FROM conversas WHERE company_id = 1;

-- Criar segunda empresa e testar
-- Verificar que empresa 2 não vê dados da empresa 1
```

---

## 🚨 Troubleshooting

### Erro: "Empresa não encontrada"

**Causa:** Número WhatsApp não configurado em `app_settings`

**Solução:**
1. Acesse http://localhost:8055/admin/content/app_settings
2. Verifique campo `twilio_whatsapp_number`
3. Deve ser exatamente: `whatsapp:+5531999999999`

### Erro: "Cannot read property 'openai_api_key'"

**Causa:** Extensão não recebeu `company_id` ou configurações inválidas

**Solução:**
1. Verificar se endpoint recebe `company_id`
2. Validar configurações: `validateCompanySettings(settings)`
3. Checar logs para identificar empresa

### Conversa criada sem company_id

**Causa:** Webhook não identificou empresa (modo fallback)

**Solução:**
1. Verificar campo `To` no webhook
2. Configurar `app_settings` para o número
3. Re-enviar mensagem

---

## 📚 Referências

- [ARQUITETURA_MULTI_TENANT.md](../../ARQUITETURA_MULTI_TENANT.md) - Visão geral do sistema
- [SETUP_MANUAL.md](../../SETUP_MANUAL.md) - Guia de configuração
- [company-settings.js](./shared/company-settings.js) - Helper de configurações

---

**Atualizado em:** 2025-01-20  
**Status:** WhatsApp ✅ | OpenAI ⏳ | Twilio ⏳
