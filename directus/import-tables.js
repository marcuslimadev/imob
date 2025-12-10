/**
 * Script para importar tabelas existentes do PostgreSQL para o Directus
 * Cria a metadata necessária para que as collections apareçam no admin
 */

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'marcus@admin.com';
const ADMIN_PASSWORD = 'Teste@123';

let accessToken = null;

async function login() {
  try {
    const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    accessToken = response.data.data.access_token;
    console.log('✅ Login realizado com sucesso');
    return accessToken;
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error.response?.data || error.message);
    throw error;
  }
}

// Listar tabelas do banco que não estão no Directus
async function getUnmanagedTables() {
  try {
    const response = await axios.get(
      `${DIRECTUS_URL}/collections`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    console.log('\n📋 Collections atualmente no Directus:');
    response.data.data.forEach(col => {
      console.log(`  - ${col.collection}`);
    });
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Erro ao listar collections:', error.response?.data || error.message);
    return [];
  }
}

// Importar uma tabela como collection
async function importTable(tableName, meta = {}) {
  try {
    const payload = {
      collection: tableName,
      meta: {
        collection: tableName,
        icon: meta.icon || 'table',
        note: meta.note || '',
        display_template: meta.display_template || null,
        hidden: meta.hidden || false,
        singleton: false,
        translations: null,
        archive_field: null,
        archive_app_filter: true,
        archive_value: null,
        unarchive_value: null,
        sort_field: meta.sort_field || null,
        accountability: 'all',
        color: meta.color || null,
        item_duplication_fields: null,
        sort: meta.sort || null,
        group: null,
        collapse: 'open',
        ...meta
      }
    };

    await axios.post(
      `${DIRECTUS_URL}/collections`,
      payload,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    console.log(`✅ Tabela '${tableName}' importada como collection`);
    return true;
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
      console.log(`ℹ️  Collection '${tableName}' já existe`);
      return false;
    }
    console.error(`❌ Erro ao importar '${tableName}':`, error.response?.data?.errors?.[0]?.message || error.message);
    return false;
  }
}

const tables = [
  { name: 'companies', meta: { icon: 'business', note: 'Imobiliárias cadastradas', color: '#2563EB', sort: 1 } },
  { name: 'properties', meta: { icon: 'home', note: 'Imóveis cadastrados', color: '#10B981', sort: 2 } },
  { name: 'property_media', meta: { icon: 'photo_library', note: 'Fotos e vídeos dos imóveis', hidden: true, sort: 3 } },
  { name: 'leads', meta: { icon: 'people', note: 'Leads e clientes potenciais', color: '#F59E0B', sort: 4 } },
  { name: 'lead_activities', meta: { icon: 'event_note', note: 'Histórico de atividades', hidden: true, sort: 5 } },
  { name: 'property_views', meta: { icon: 'visibility', note: 'Analytics de visualizações', hidden: true, sort: 6 } },
  { name: 'conversas', meta: { icon: 'chat', note: 'Conversas WhatsApp', color: '#8B5CF6', sort: 7 } },
  { name: 'mensagens', meta: { icon: 'message', note: 'Mensagens WhatsApp', hidden: true, sort: 8 } },
  { name: 'lead_property_matches', meta: { icon: 'link', note: 'Matches IA (lead x imóvel)', color: '#EC4899', sort: 9 } },
  { name: 'atividades', meta: { icon: 'history', note: 'Log de atividades', color: '#6366F1', sort: 10 } },
  { name: 'webhooks_log', meta: { icon: 'webhook', note: 'Log de webhooks', color: '#14B8A6', sort: 11 } },
  { name: 'app_settings', meta: { icon: 'settings', note: 'Configurações por empresa', color: '#64748B', sort: 12 } }
];

async function main() {
  console.log('🚀 Importando tabelas do PostgreSQL para Directus...\n');
  
  await login();
  
  console.log('\n📊 Collections existentes:');
  await getUnmanagedTables();
  
  console.log('\n🔄 Importando tabelas...\n');
  
  for (const table of tables) {
    await importTable(table.name, table.meta);
  }
  
  console.log('\n✅ Processo concluído!');
  console.log('\n📝 Atualize a página do Directus: http://localhost:8055/admin/content');
}

main();
