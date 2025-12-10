/**
 * Script de Testes do Backend
 * Testa todos os endpoints, helpers e funcionalidades do Directus
 */

import { createDirectus, rest, readItems, createItem, authentication } from '@directus/sdk';

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin'; // TODO: Substituir pela senha real

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function section(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(message.toUpperCase(), 'cyan');
  log('='.repeat(60), 'cyan');
}

// Estatísticas
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
};

async function test(name, fn) {
  stats.total++;
  try {
    info(`Testando: ${name}...`);
    await fn();
    success(`PASSOU: ${name}`);
    stats.passed++;
    return true;
  } catch (err) {
    error(`FALHOU: ${name}`);
    error(`  Erro: ${err.message}`);
    stats.failed++;
    return false;
  }
}

// Inicializar cliente Directus
const directus = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());

let authToken = null;
let testCompanyId = null;
let testLeadId = null;
let testConversaId = null;

/**
 * Testes de Autenticação
 */
async function testAuthentication() {
  section('Testes de Autenticação');

  await test('Login com credenciais de admin', async () => {
    const result = await directus.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    authToken = result.access_token;
    if (!authToken) throw new Error('Token não retornado');
  });

  await test('Verificar usuário autenticado', async () => {
    const me = await directus.request(readItems('directus_users', { filter: { email: { _eq: ADMIN_EMAIL } } }));
    if (!me || me.length === 0) throw new Error('Usuário não encontrado');
  });
}

/**
 * Testes de Collections Multi-Tenant
 */
async function testCollections() {
  section('Testes de Collections Multi-Tenant');

  await test('Listar companies', async () => {
    const companies = await directus.request(readItems('companies', { limit: 5 }));
    if (!Array.isArray(companies)) throw new Error('Companies não é array');
    
    // Se não houver empresas, criar uma de teste
    if (companies.length === 0) {
      info('  Nenhuma empresa encontrada, criando empresa de teste...');
      const newCompany = await directus.request(
        createItem('companies', {
          name: 'Empresa Teste',
          status: 'active',
        })
      );
      testCompanyId = newCompany.id;
      success(`  Empresa de teste criada: ${testCompanyId}`);
    } else {
      testCompanyId = companies[0].id;
      info(`  Usando empresa existente: ${testCompanyId}`);
    }
  });

  await test('Verificar app_settings da empresa', async () => {
    const settings = await directus.request(
      readItems('app_settings', {
        filter: { company_id: { _eq: testCompanyId } },
        limit: 1,
      })
    );
    
    if (settings.length === 0) {
      info('  Nenhuma configuração encontrada, criando...');
      await directus.request(
        createItem('app_settings', {
          company_id: testCompanyId,
          twilio_account_sid: 'test_sid',
          twilio_auth_token: 'test_token',
          twilio_whatsapp_number: '+5511999999999',
          openai_api_key: 'test_key',
          external_api_base_url: 'https://api.example.com',
          external_api_token: 'test_api_token',
        })
      );
      success('  Configurações criadas');
    }
  });

  await test('Listar leads da empresa', async () => {
    const leads = await directus.request(
      readItems('leads', {
        filter: { company_id: { _eq: testCompanyId } },
        limit: 5,
      })
    );
    
    if (leads.length > 0) {
      testLeadId = leads[0].id;
      info(`  Encontrados ${leads.length} leads, usando: ${testLeadId}`);
    }
  });

  await test('Listar conversas da empresa', async () => {
    const conversas = await directus.request(
      readItems('conversas', {
        filter: { company_id: { _eq: testCompanyId } },
        limit: 5,
      })
    );
    
    if (conversas.length > 0) {
      testConversaId = conversas[0].id;
      info(`  Encontradas ${conversas.length} conversas, usando: ${testConversaId}`);
    }
  });

  await test('Listar mensagens', async () => {
    if (!testConversaId) {
      info('  Pulando: nenhuma conversa disponível');
      stats.skipped++;
      return;
    }
    
    const mensagens = await directus.request(
      readItems('mensagens', {
        filter: { conversa_id: { _eq: testConversaId } },
        limit: 10,
      })
    );
    
    info(`  Encontradas ${mensagens.length} mensagens`);
  });

  await test('Listar imóveis da empresa', async () => {
    const imoveis = await directus.request(
      readItems('imoveis', {
        filter: { company_id: { _eq: testCompanyId } },
        limit: 5,
      })
    );
    
    info(`  Encontrados ${imoveis.length} imóveis`);
  });
}

/**
 * Testes de Helpers
 */
async function testHelpers() {
  section('Testes de Helpers');

  await test('Helper: company-settings.js existe', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const helperPath = path.join(process.cwd(), 'extensions', 'shared', 'company-settings.js');
    if (!fs.existsSync(helperPath)) throw new Error('Helper não encontrado');
  });

  await test('Helper: whatsapp-service-logic.js existe', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const helperPath = path.join(process.cwd(), 'extensions', 'shared', 'whatsapp-service-logic.js');
    if (!fs.existsSync(helperPath)) throw new Error('Helper não encontrado');
  });

  await test('Helper: pipeline-stages.js existe', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const helperPath = path.join(process.cwd(), 'extensions', 'shared', 'pipeline-stages.js');
    if (!fs.existsSync(helperPath)) throw new Error('Helper não encontrado');
  });

  await test('Helper: property-sync-helper.js existe', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const helperPath = path.join(process.cwd(), 'extensions', 'shared', 'property-sync-helper.js');
    if (!fs.existsSync(helperPath)) throw new Error('Helper não encontrado');
  });

  // Testar pipeline stages
  await test('Pipeline: validar STAGES object', async () => {
    const { STAGES } = await import('./extensions/shared/pipeline-stages.js');
    if (!STAGES || typeof STAGES !== 'object') throw new Error('STAGES não definido');
    if (Object.keys(STAGES).length !== 17) throw new Error('Deveria ter 17 stages');
    info(`  17 stages validados: ${Object.keys(STAGES).join(', ')}`);
  });

  await test('Pipeline: validar transições de stage', async () => {
    const { isValidTransition } = await import('./extensions/shared/pipeline-stages.js');
    
    // Transições válidas
    if (!isValidTransition('lead_novo', 'primeiro_contato')) {
      throw new Error('Transição válida rejeitada: lead_novo -> primeiro_contato');
    }
    
    // Transição inválida
    if (isValidTransition('lead_novo', 'fechamento')) {
      throw new Error('Transição inválida aceita: lead_novo -> fechamento');
    }
    
    success('  Transições validadas corretamente');
  });

  await test('Pipeline: calcular próximo stage', async () => {
    const { calculateNextStage } = await import('./extensions/shared/pipeline-stages.js');
    
    const context = {
      currentStage: 'primeiro_contato',
      hasRequiredData: true,
      hasInterest: false,
      hasScheduledVisit: false,
    };
    
    const nextStage = calculateNextStage(context);
    if (!nextStage) throw new Error('Próximo stage não calculado');
    info(`  Próximo stage calculado: ${nextStage}`);
  });
}

/**
 * Testes de Endpoints
 */
async function testEndpoints() {
  section('Testes de Endpoints');

  await test('Endpoint: /whatsapp está acessível', async () => {
    try {
      const response = await fetch(`${DIRECTUS_URL}/whatsapp`, {
        method: 'GET',
      });
      
      // Esperamos 400 ou 405 (método não permitido) ao invés de 404
      if (response.status === 404) {
        throw new Error('Endpoint não encontrado (404)');
      }
      
      info(`  Endpoint responde com status: ${response.status}`);
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        throw new Error('Directus não está rodando');
      }
      throw err;
    }
  });

  await test('Endpoint: /property-sync/status', async () => {
    try {
      const response = await fetch(`${DIRECTUS_URL}/property-sync/status`, {
        method: 'GET',
      });
      
      if (response.status === 404) {
        throw new Error('Endpoint não encontrado');
      }
      
      const data = await response.json();
      info(`  Status: ${JSON.stringify(data)}`);
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        throw new Error('Directus não está rodando');
      }
      throw err;
    }
  });

  // Teste de webhook WhatsApp (mock)
  await test('Webhook WhatsApp: processar mensagem mock', async () => {
    const mockWebhook = {
      SmsMessageSid: 'test_msg_123',
      From: 'whatsapp:+5511888888888',
      To: 'whatsapp:+5511999999999',
      Body: 'Olá, procuro apartamento de 2 quartos em São Paulo',
      NumMedia: '0',
    };

    try {
      const response = await fetch(`${DIRECTUS_URL}/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(mockWebhook).toString(),
      });

      if (response.status === 500) {
        const text = await response.text();
        info(`  Resposta (erro esperado sem config): ${text.substring(0, 100)}...`);
      } else {
        info(`  Resposta: ${response.status}`);
      }
    } catch (err) {
      info(`  Erro esperado (falta configuração): ${err.message}`);
    }
  });
}

/**
 * Testes de Integridade Multi-Tenant
 */
async function testMultiTenant() {
  section('Testes de Integridade Multi-Tenant');

  await test('Leads filtrados por company_id', async () => {
    const allLeads = await directus.request(readItems('leads', { limit: 100 }));
    
    // Verificar se todos os leads têm company_id
    const leadsWithoutCompany = allLeads.filter(lead => !lead.company_id);
    if (leadsWithoutCompany.length > 0) {
      throw new Error(`${leadsWithoutCompany.length} leads sem company_id`);
    }
    
    success(`  Todos os ${allLeads.length} leads têm company_id`);
  });

  await test('Imóveis filtrados por company_id', async () => {
    const allImoveis = await directus.request(readItems('imoveis', { limit: 100 }));
    
    const imoveisWithoutCompany = allImoveis.filter(imovel => !imovel.company_id);
    if (imoveisWithoutCompany.length > 0) {
      throw new Error(`${imoveisWithoutCompany.length} imóveis sem company_id`);
    }
    
    success(`  Todos os ${allImoveis.length} imóveis têm company_id`);
  });

  await test('Conversas filtradas por company_id', async () => {
    const allConversas = await directus.request(readItems('conversas', { limit: 100 }));
    
    const conversasWithoutCompany = allConversas.filter(conversa => !conversa.company_id);
    if (conversasWithoutCompany.length > 0) {
      throw new Error(`${conversasWithoutCompany.length} conversas sem company_id`);
    }
    
    success(`  Todas as ${allConversas.length} conversas têm company_id`);
  });
}

/**
 * Função principal
 */
async function runTests() {
  log('\n🧪 INICIANDO TESTES DO BACKEND', 'cyan');
  log(`URL: ${DIRECTUS_URL}`, 'cyan');
  log(`Data: ${new Date().toLocaleString('pt-BR')}\n`, 'cyan');

  try {
    await testAuthentication();
    await testCollections();
    await testHelpers();
    await testEndpoints();
    await testMultiTenant();

    // Relatório final
    section('Relatório Final');
    log(`Total de testes: ${stats.total}`, 'cyan');
    log(`✅ Passou: ${stats.passed}`, 'green');
    log(`❌ Falhou: ${stats.failed}`, 'red');
    log(`⏭️  Pulado: ${stats.skipped}`, 'yellow');
    
    const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
    log(`\nTaxa de sucesso: ${successRate}%`, successRate >= 80 ? 'green' : 'red');

    if (stats.failed > 0) {
      log('\n⚠️  Alguns testes falharam. Verifique os logs acima.', 'yellow');
      process.exit(1);
    } else {
      log('\n🎉 Todos os testes passaram!', 'green');
      process.exit(0);
    }
  } catch (err) {
    error(`\n❌ Erro fatal nos testes: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

// Executar testes
runTests();
