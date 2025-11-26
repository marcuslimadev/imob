import { createDirectus, rest, createItem, readItems } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055').with(rest());

const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE'; // TODO: Substituir pelo token real

/**
 * Flow 1: Sincronização Automática de Imóveis
 * Cron job que roda diariamente às 3h da manhã para todas as empresas
 */
const flowPropertySync = {
  name: 'Sincronização Automática de Imóveis',
  icon: 'sync',
  color: '#2196F3',
  status: 'active',
  trigger: 'schedule', // Cron trigger
  accountability: 'all',
  options: {
    cron: '0 3 * * *', // 3h da manhã todos os dias
  },
};

const operationsPropertySync = [
  {
    name: 'Buscar Todas as Empresas',
    key: 'get_companies',
    type: 'item-read',
    position_x: 5,
    position_y: 5,
    options: {
      collection: 'companies',
      query: {
        filter: {
          status: { _eq: 'active' },
        },
        fields: ['id', 'name'],
        limit: -1,
      },
    },
  },
  {
    name: 'Para Cada Empresa',
    key: 'loop_companies',
    type: 'exec',
    position_x: 5,
    position_y: 10,
    options: {
      code: `
module.exports = async function(data) {
  const companies = data.$trigger.body || data.get_companies;
  const results = [];
  
  for (const company of companies) {
    try {
      // Fazer requisição ao endpoint de sincronização
      const response = await fetch(\`http://localhost:8055/property-sync/full\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: company.id,
        }),
      });
      
      const result = await response.json();
      results.push({
        company_id: company.id,
        company_name: company.name,
        success: true,
        data: result,
      });
      
      console.log(\`✅ Sincronização concluída para \${company.name}\`);
    } catch (error) {
      results.push({
        company_id: company.id,
        company_name: company.name,
        success: false,
        error: error.message,
      });
      
      console.error(\`❌ Erro na sincronização para \${company.name}:\`, error);
    }
  }
  
  return results;
};
      `,
    },
  },
  {
    name: 'Enviar Notificação de Conclusão',
    key: 'send_notification',
    type: 'notification',
    position_x: 5,
    position_y: 15,
    options: {
      recipient: 'admin@example.com', // TODO: Configurar email do admin
      subject: 'Sincronização de Imóveis Concluída',
      message: `A sincronização automática de imóveis foi executada.
      
Resultados: {{$last.length}} empresas processadas.
Data: {{$now}}

Verifique os logs para mais detalhes.`,
    },
  },
];

/**
 * Flow 2: Atualização de Status de Mensagens WhatsApp
 * Webhook acionado por callbacks do Twilio
 */
const flowWhatsAppStatus = {
  name: 'Atualizar Status de Mensagens WhatsApp',
  icon: 'message',
  color: '#25D366',
  status: 'active',
  trigger: 'webhook', // Webhook trigger
  accountability: 'all',
  options: {
    method: 'POST',
    return: '$last',
  },
};

const operationsWhatsAppStatus = [
  {
    name: 'Extrair Message SID',
    key: 'extract_sid',
    type: 'exec',
    position_x: 5,
    position_y: 5,
    options: {
      code: `
module.exports = async function(data) {
  const body = data.$trigger.body;
  
  return {
    message_sid: body.MessageSid,
    status: body.MessageStatus, // sent, delivered, read, failed
    error_code: body.ErrorCode,
    error_message: body.ErrorMessage,
  };
};
      `,
    },
  },
  {
    name: 'Atualizar Mensagem',
    key: 'update_message',
    type: 'item-update',
    position_x: 5,
    position_y: 10,
    options: {
      collection: 'mensagens',
      query: {
        filter: {
          message_sid: { _eq: '{{extract_sid.message_sid}}' },
        },
      },
      payload: {
        status: '{{extract_sid.status}}',
        error_code: '{{extract_sid.error_code}}',
        error_message: '{{extract_sid.error_message}}',
      },
    },
  },
  {
    name: 'Log de Atualização',
    key: 'log_update',
    type: 'log',
    position_x: 5,
    position_y: 15,
    options: {
      message: 'Mensagem {{extract_sid.message_sid}} atualizada para status: {{extract_sid.status}}',
    },
  },
];

/**
 * Flow 3: Lead Scoring Automático
 * Acionado quando um lead é atualizado
 */
const flowLeadScoring = {
  name: 'Lead Scoring Automático',
  icon: 'trending_up',
  color: '#FF9800',
  status: 'active',
  trigger: 'event', // Event hook
  accountability: 'all',
  options: {
    type: 'action',
    scope: ['items.update'],
    collections: ['leads'],
  },
};

const operationsLeadScoring = [
  {
    name: 'Calcular Score',
    key: 'calculate_score',
    type: 'exec',
    position_x: 5,
    position_y: 5,
    options: {
      code: `
module.exports = async function(data) {
  const lead = data.$trigger.payload;
  let score = 0;
  
  // Pontuação por stage (mais avançado = maior score)
  const stageScores = {
    lead_novo: 10,
    primeiro_contato: 15,
    coleta_dados: 20,
    qualificacao: 30,
    refinamento_criterios: 35,
    envio_imoveis: 40,
    interesse_demonstrado: 50,
    agendamento_visita: 60,
    visita_realizada: 70,
    negociacao: 80,
    proposta_enviada: 85,
    analise_credito: 90,
    documentacao: 95,
    fechamento: 100,
    pos_venda: 100,
    perdido: 0,
    inativo: 5,
  };
  
  score += stageScores[lead.stage] || 0;
  
  // Bônus por ter orçamento definido
  if (lead.orcamento_minimo && lead.orcamento_maximo) {
    score += 10;
  }
  
  // Bônus por ter email
  if (lead.email) {
    score += 5;
  }
  
  // Bônus por interações recentes (últimos 7 dias)
  const lastInteraction = new Date(lead.updated_at);
  const daysSinceInteraction = (new Date() - lastInteraction) / (1000 * 60 * 60 * 24);
  if (daysSinceInteraction <= 7) {
    score += 15;
  } else if (daysSinceInteraction <= 30) {
    score += 5;
  }
  
  // Normalizar score (0-100)
  score = Math.min(100, Math.max(0, score));
  
  return {
    lead_id: lead.id,
    score: Math.round(score),
    calculated_at: new Date().toISOString(),
  };
};
      `,
    },
  },
  {
    name: 'Atualizar Score do Lead',
    key: 'update_score',
    type: 'item-update',
    position_x: 5,
    position_y: 10,
    options: {
      collection: 'leads',
      key: '{{calculate_score.lead_id}}',
      payload: {
        score: '{{calculate_score.score}}',
        score_updated_at: '{{calculate_score.calculated_at}}',
      },
    },
  },
  {
    name: 'Verificar Lead Quente',
    key: 'check_hot_lead',
    type: 'condition',
    position_x: 5,
    position_y: 15,
    options: {
      filter: {
        _and: [
          {
            'calculate_score.score': { _gte: 70 },
          },
        ],
      },
    },
  },
  {
    name: 'Notificar Lead Quente',
    key: 'notify_hot_lead',
    type: 'notification',
    position_x: 10,
    position_y: 20,
    options: {
      recipient: 'vendas@example.com', // TODO: Configurar email da equipe
      subject: '🔥 Lead Quente Detectado',
      message: `Um lead com alta probabilidade de conversão foi identificado!

Lead: {{$trigger.payload.name}}
Telefone: {{$trigger.payload.phone}}
Score: {{calculate_score.score}}/100
Stage: {{$trigger.payload.stage}}

Acesse o CRM para mais detalhes.`,
    },
  },
];

/**
 * Flow 4: Backup Automático de Collections
 * Cron job diário às 2h da manhã
 */
const flowBackup = {
  name: 'Backup Automático de Collections',
  icon: 'backup',
  color: '#4CAF50',
  status: 'active',
  trigger: 'schedule',
  accountability: 'all',
  options: {
    cron: '0 2 * * *', // 2h da manhã todos os dias
  },
};

const operationsBackup = [
  {
    name: 'Exportar Collections',
    key: 'export_collections',
    type: 'exec',
    position_x: 5,
    position_y: 5,
    options: {
      code: `
const fs = require('fs');
const path = require('path');

module.exports = async function(data) {
  const collections = ['companies', 'leads', 'conversas', 'mensagens', 'imoveis'];
  const backupDir = path.join(__dirname, '..', '..', 'backups', new Date().toISOString().split('T')[0]);
  
  // Criar diretório de backup
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const results = [];
  
  for (const collection of collections) {
    try {
      // Buscar todos os itens da collection
      const items = await data.$accountability.database(collection).select('*');
      
      // Salvar em arquivo JSON
      const filePath = path.join(backupDir, \`\${collection}.json\`);
      fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
      
      results.push({
        collection,
        count: items.length,
        file: filePath,
        success: true,
      });
      
      console.log(\`✅ Backup de \${collection}: \${items.length} itens\`);
    } catch (error) {
      results.push({
        collection,
        success: false,
        error: error.message,
      });
      
      console.error(\`❌ Erro no backup de \${collection}:\`, error);
    }
  }
  
  return {
    backup_date: new Date().toISOString(),
    backup_dir: backupDir,
    results,
  };
};
      `,
    },
  },
  {
    name: 'Limpar Backups Antigos',
    key: 'cleanup_old_backups',
    type: 'exec',
    position_x: 5,
    position_y: 10,
    options: {
      code: `
const fs = require('fs');
const path = require('path');

module.exports = async function(data) {
  const backupsDir = path.join(__dirname, '..', '..', 'backups');
  const retentionDays = 30; // Manter backups dos últimos 30 dias
  
  try {
    const folders = fs.readdirSync(backupsDir);
    const now = new Date();
    let deletedCount = 0;
    
    for (const folder of folders) {
      const folderPath = path.join(backupsDir, folder);
      const stats = fs.statSync(folderPath);
      
      if (stats.isDirectory()) {
        const daysDiff = (now - stats.mtime) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > retentionDays) {
          fs.rmSync(folderPath, { recursive: true, force: true });
          deletedCount++;
          console.log(\`🗑️ Backup removido: \${folder}\`);
        }
      }
    }
    
    return {
      deleted_count: deletedCount,
      retention_days: retentionDays,
    };
  } catch (error) {
    console.error('❌ Erro ao limpar backups antigos:', error);
    return {
      error: error.message,
    };
  }
};
      `,
    },
  },
  {
    name: 'Notificar Backup Concluído',
    key: 'notify_backup',
    type: 'notification',
    position_x: 5,
    position_y: 15,
    options: {
      recipient: 'admin@example.com',
      subject: 'Backup Automático Concluído',
      message: `Backup automático executado com sucesso!

Data: {{export_collections.backup_date}}
Diretório: {{export_collections.backup_dir}}
Collections: {{export_collections.results.length}}

Backups antigos removidos: {{cleanup_old_backups.deleted_count}}`,
    },
  },
];

/**
 * Função principal para registrar todos os flows
 */
async function registerFlows() {
  console.log('🚀 Iniciando registro de Flows no Directus...\n');

  const flows = [
    { flow: flowPropertySync, operations: operationsPropertySync },
    { flow: flowWhatsAppStatus, operations: operationsWhatsAppStatus },
    { flow: flowLeadScoring, operations: operationsLeadScoring },
    { flow: flowBackup, operations: operationsBackup },
  ];

  for (const { flow, operations } of flows) {
    try {
      console.log(`📋 Criando flow: ${flow.name}...`);

      // Criar o flow
      const createdFlow = await directus.request(
        createItem('directus_flows', flow, {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
          },
        })
      );

      console.log(`✅ Flow criado: ${createdFlow.id}`);

      // Criar as operações vinculadas ao flow
      for (const operation of operations) {
        const operationData = {
          ...operation,
          flow: createdFlow.id,
        };

        await directus.request(
          createItem('directus_operations', operationData, {
            headers: {
              Authorization: `Bearer ${ADMIN_TOKEN}`,
            },
          })
        );

        console.log(`  ✅ Operação criada: ${operation.name}`);
      }

      console.log('');
    } catch (error) {
      console.error(`❌ Erro ao criar flow ${flow.name}:`, error.message);
      console.log('');
    }
  }

  console.log('✅ Registro de Flows concluído!\n');
  console.log('📌 Próximos passos:');
  console.log('1. Substituir ADMIN_TOKEN pelo token real');
  console.log('2. Configurar emails de notificação');
  console.log('3. Ajustar horários dos cron jobs se necessário');
  console.log('4. Testar cada flow individualmente no Directus Studio');
  console.log('5. Configurar webhook URL do Twilio para callbacks de status\n');
}

// Executar
registerFlows();
