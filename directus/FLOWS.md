# Directus Flows - Automações

Este diretório contém as automações (flows) do Directus para o sistema iMOBI.

## 📋 Flows Implementados

### 1. **Sincronização Automática de Imóveis** 🔄
- **Trigger**: Cron job diário às 3h da manhã
- **Descrição**: Sincroniza imóveis de todas as empresas ativas com a API externa
- **Operações**:
  1. Busca todas as empresas ativas
  2. Para cada empresa, chama o endpoint `/property-sync/full`
  3. Registra resultados (sucesso/erro)
  4. Envia notificação de conclusão por email

**Configurações**:
```javascript
cron: '0 3 * * *' // 3h da manhã todos os dias
```

**Alterar horário**:
- Edite a propriedade `options.cron` no flow
- Formato: minuto hora dia mês dia-da-semana
- Exemplos:
  - `0 */6 * * *` = A cada 6 horas
  - `0 0 * * 0` = Todo domingo à meia-noite
  - `0 8,12,18 * * *` = Às 8h, 12h e 18h

---

### 2. **Atualizar Status de Mensagens WhatsApp** 📱
- **Trigger**: Webhook (callback do Twilio)
- **Descrição**: Atualiza o status das mensagens (enviado, entregue, lido, falhou)
- **Operações**:
  1. Extrai `MessageSid` e `MessageStatus` do webhook
  2. Busca a mensagem no banco pelo `message_sid`
  3. Atualiza o status
  4. Registra log da atualização

**Configuração no Twilio**:
1. Acesse o Twilio Console
2. Vá em Messaging > Settings > WhatsApp Settings
3. Configure a URL de callback:
   ```
   https://seu-dominio.com/flows/trigger/<flow-webhook-id>
   ```
4. Método: POST
5. Eventos: Message Status

**Possíveis Status**:
- `sent` - Enviado ao Twilio
- `delivered` - Entregue ao dispositivo
- `read` - Lido pelo destinatário
- `failed` - Falha no envio
- `undelivered` - Não entregue

---

### 3. **Lead Scoring Automático** 📊
- **Trigger**: Event hook (quando um lead é atualizado)
- **Descrição**: Calcula automaticamente o score de um lead baseado em diversos fatores
- **Operações**:
  1. Calcula score baseado em:
     - Stage atual (10-100 pontos)
     - Orçamento definido (+10 pontos)
     - Email cadastrado (+5 pontos)
     - Interação recente (+15 pontos últimos 7 dias, +5 até 30 dias)
  2. Atualiza campo `score` do lead
  3. Se score ≥ 70, notifica equipe de vendas (lead quente 🔥)

**Score por Stage**:
| Stage | Pontos |
|-------|--------|
| Lead Novo | 10 |
| Primeiro Contato | 15 |
| Coleta de Dados | 20 |
| Qualificação | 30 |
| Refinamento de Critérios | 35 |
| Envio de Imóveis | 40 |
| Interesse Demonstrado | 50 |
| Agendamento de Visita | 60 |
| Visita Realizada | 70 |
| Negociação | 80 |
| Proposta Enviada | 85 |
| Análise de Crédito | 90 |
| Documentação | 95 |
| Fechamento | 100 |
| Pós-Venda | 100 |
| Perdido | 0 |
| Inativo | 5 |

**Customizar cálculo**:
Edite a operação `calculate_score` para ajustar os critérios de pontuação.

---

### 4. **Backup Automático de Collections** 💾
- **Trigger**: Cron job diário às 2h da manhã
- **Descrição**: Faz backup de todas as collections críticas em arquivos JSON
- **Operações**:
  1. Exporta collections: `companies`, `leads`, `conversas`, `mensagens`, `imoveis`
  2. Salva em `directus/backups/YYYY-MM-DD/*.json`
  3. Remove backups com mais de 30 dias
  4. Envia notificação de conclusão

**Collections Incluídas**:
- `companies` - Empresas cadastradas
- `leads` - Leads e clientes
- `conversas` - Conversas WhatsApp
- `mensagens` - Histórico de mensagens
- `imoveis` - Catálogo de imóveis

**Configurações**:
```javascript
cron: '0 2 * * *' // 2h da manhã todos os dias
retentionDays: 30 // Manter últimos 30 dias
```

**Restaurar backup**:
```bash
# Navegar até o diretório do backup
cd directus/backups/2025-11-26

# Para cada collection, importar via API ou diretamente no banco
# Exemplo com curl:
curl -X POST http://localhost:8055/items/leads \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d @leads.json
```

---

## 🚀 Como Instalar os Flows

### Pré-requisitos
1. Directus rodando em `http://localhost:8055`
2. Token de admin do Directus

### Passo 1: Obter Token de Admin
```bash
# Fazer login no Directus
curl -X POST http://localhost:8055/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "sua-senha"
  }'

# Copiar o "access_token" da resposta
```

### Passo 2: Configurar o Script
```javascript
// Editar register-flows.js
const ADMIN_TOKEN = 'SEU_TOKEN_AQUI';

// Configurar emails de notificação
const ADMIN_EMAIL = 'admin@example.com';
const SALES_EMAIL = 'vendas@example.com';
```

### Passo 3: Executar o Script
```bash
cd directus
node register-flows.js
```

### Passo 4: Verificar no Directus Studio
1. Acesse `http://localhost:8055/admin`
2. Vá em **Settings > Flows**
3. Verifique se os 4 flows foram criados
4. Clique em cada flow para ver as operações

---

## 🔧 Gerenciamento de Flows

### Ativar/Desativar Flow
```javascript
// Via API
await directus.request(
  updateItem('directus_flows', 'flow-id', {
    status: 'active', // ou 'inactive'
  })
);
```

### Testar Flow Manualmente
1. Acesse o flow no Directus Studio
2. Clique em **Run** (botão de play)
3. Veja os logs na aba **Logs**

### Ver Execuções Anteriores
1. Acesse **Activity Log** no Directus
2. Filtre por collection: `directus_flows`
3. Veja histórico de execuções com timestamps

### Editar Operações
1. Clique no flow
2. Arraste os blocos para reordenar
3. Clique em um bloco para editar
4. Salve as alterações

---

## 📊 Monitoramento

### Logs de Flows
Os flows registram logs automaticamente em:
- **Console do Directus**: Logs em tempo real
- **Activity Log**: Histórico persistido
- **Notificações**: Emails configurados

### Verificar Última Execução
```javascript
// Via API
const flows = await directus.request(
  readItems('directus_flows', {
    fields: ['id', 'name', 'date_created', 'operations.name'],
  })
);
```

### Métricas Úteis
- **Sincronização de imóveis**: Verificar quantas empresas foram processadas
- **Status de mensagens**: Verificar taxa de entrega/leitura
- **Lead scoring**: Verificar quantos leads quentes foram detectados
- **Backups**: Verificar tamanho dos arquivos gerados

---

## ⚠️ Troubleshooting

### Flow não executa
1. Verificar status: deve estar `active`
2. Verificar cron syntax (se for schedule trigger)
3. Verificar logs no console do Directus
4. Verificar permissões do token usado

### Notificações não chegam
1. Configurar SMTP no Directus:
   ```env
   EMAIL_FROM="noreply@example.com"
   EMAIL_TRANSPORT="smtp"
   EMAIL_SMTP_HOST="smtp.example.com"
   EMAIL_SMTP_PORT="587"
   EMAIL_SMTP_USER="user@example.com"
   EMAIL_SMTP_PASSWORD="password"
   ```
2. Reiniciar Directus após configurar SMTP

### Webhook do Twilio não funciona
1. Verificar URL está acessível publicamente (não localhost)
2. Usar ngrok para testar localmente:
   ```bash
   ngrok http 8055
   # Usar URL do ngrok no Twilio
   ```
3. Verificar logs do Twilio para erros

### Backup falha
1. Verificar permissões de escrita em `directus/backups/`
2. Verificar espaço em disco
3. Verificar se as collections existem

---

## 🔐 Segurança

### Boas Práticas
1. **Nunca commitar tokens** no Git (use `.env`)
2. **Limitar permissões** dos tokens usados nos flows
3. **Criptografar backups** se contiverem dados sensíveis
4. **Usar HTTPS** para webhooks em produção
5. **Rotacionar tokens** periodicamente

### Permissões Necessárias
- Flow 1 (Sync): Read em `companies`, Create/Update em `imoveis`
- Flow 2 (Status): Update em `mensagens`
- Flow 3 (Scoring): Read/Update em `leads`, Send notifications
- Flow 4 (Backup): Read em todas as collections

---

## 📝 Customização

### Adicionar Novo Flow
1. Duplicar estrutura de um flow existente
2. Definir trigger apropriado
3. Criar operações necessárias
4. Adicionar ao array `flows` em `register-flows.js`
5. Executar script de registro

### Exemplo: Flow de Aniversário
```javascript
const flowBirthday = {
  name: 'Mensagem de Aniversário',
  icon: 'cake',
  color: '#E91E63',
  status: 'active',
  trigger: 'schedule',
  options: {
    cron: '0 9 * * *', // 9h todos os dias
  },
};

const operationsBirthday = [
  {
    name: 'Buscar Aniversariantes',
    key: 'get_birthdays',
    type: 'item-read',
    options: {
      collection: 'leads',
      query: {
        filter: {
          // WHERE DAY(data_nascimento) = DAY(NOW()) AND MONTH(data_nascimento) = MONTH(NOW())
          _and: [
            { data_nascimento: { _nnull: true } },
          ],
        },
      },
    },
  },
  // ... mais operações
];
```

---

## 📚 Recursos Adicionais

- [Documentação Oficial do Directus Flows](https://docs.directus.io/app/flows.html)
- [Cron Syntax](https://crontab.guru/)
- [Twilio Status Callbacks](https://www.twilio.com/docs/usage/webhooks/messaging-webhooks)
- [Node.js Async/Await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)

---

**Status**: 85% - Flows implementados e documentados. Pendente: configurar SMTP e testar em produção.
