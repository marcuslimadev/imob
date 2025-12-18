/**
 * Setup do Directus em PRODUÇÃO
 * 
 * Este script configura o Directus em https://lojadaesquina.store com:
 * - Collections do iMOBI
 * - Campos necessários
 * - Permissões do admin
 * - Dados mock para teste
 */

const axios = require('axios');
const { randomUUID } = require('crypto');

// CONFIGURAÇÃO - PRODUÇÃO
const DIRECTUS_URL = 'https://lojadaesquina.store';
const ADMIN_EMAIL = 'admin@lojadaesquina.store'; // TROCAR se necessário
const ADMIN_PASSWORD = 'seu_password_admin_aqui'; // TROCAR

let authToken = '';

async function login() {
  console.log('🔐 Fazendo login no Directus de produção...');
  try {
    const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    authToken = response.data.data.access_token;
    console.log('✓ Login bem-sucedido!\n');
    return authToken;
  } catch (error) {
    console.error('❌ ERRO no login:', error.response?.data || error.message);
    console.error('\n⚠️ VERIFIQUE:');
    console.error('1. Email admin:', ADMIN_EMAIL);
    console.error('2. Password está correto?');
    console.error('3. Directus está acessível em:', DIRECTUS_URL);
    process.exit(1);
  }
}

async function checkCollectionExists(collectionName) {
  try {
    const response = await axios.get(
      `${DIRECTUS_URL}/collections/${collectionName}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    return true;
  } catch (error) {
    if (error.response?.status === 403) {
      return true; // Collection exists mas sem permissão
    }
    return false;
  }
}

async function createCollection(name, icon, fields) {
  console.log(`📦 Criando collection: ${name}`);
  
  const exists = await checkCollectionExists(name);
  if (exists) {
    console.log(`   ⚠️ Collection ${name} já existe, pulando...`);
    return;
  }

  try {
    await axios.post(
      `${DIRECTUS_URL}/collections`,
      {
        collection: name,
        meta: { icon },
        schema: { name },
        fields: fields.map(f => ({
          field: f.field,
          type: f.type,
          schema: f.schema || {},
          meta: f.meta || {},
        })),
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log(`   ✓ Collection ${name} criada com sucesso!`);
  } catch (error) {
    console.error(`   ❌ Erro ao criar ${name}:`, error.response?.data || error.message);
  }
}

async function addTimestampFields(collectionName) {
  console.log(`📅 Adicionando timestamps em: ${collectionName}`);
  
  try {
    // created_at
    await axios.post(
      `${DIRECTUS_URL}/fields/${collectionName}`,
      {
        field: 'created_at',
        type: 'timestamp',
        schema: { is_nullable: true },
        meta: { interface: 'datetime', special: ['date-created'], readonly: true },
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    // updated_at
    await axios.post(
      `${DIRECTUS_URL}/fields/${collectionName}`,
      {
        field: 'updated_at',
        type: 'timestamp',
        schema: { is_nullable: true },
        meta: { interface: 'datetime', special: ['date-updated'], readonly: true },
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    console.log(`   ✓ Timestamps adicionados`);
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log(`   ⚠️ Timestamps já existem`);
    } else {
      console.error(`   ❌ Erro:`, error.response?.data || error.message);
    }
  }
}

async function setupPermissions() {
  console.log('\n🔑 Configurando permissões...');
  
  try {
    // Buscar policy do admin
    const policiesResponse = await axios.get(
      `${DIRECTUS_URL}/policies`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const adminPolicy = policiesResponse.data.data.find(p => 
      p.name === 'Administrator' || p.admin_access === true
    );
    
    if (!adminPolicy) {
      console.error('   ❌ Policy de admin não encontrada!');
      return;
    }
    
    console.log(`   ✓ Policy encontrada: ${adminPolicy.name} (${adminPolicy.id})`);
    
    // Atualizar todas as permissões para usar fields='*'
    const permissionsResponse = await axios.get(
      `${DIRECTUS_URL}/permissions?filter[policy][_eq]=${adminPolicy.id}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const permissions = permissionsResponse.data.data;
    console.log(`   📋 Encontradas ${permissions.length} permissões`);
    
    for (const perm of permissions) {
      if (perm.fields !== '*') {
        await axios.patch(
          `${DIRECTUS_URL}/permissions/${perm.id}`,
          { fields: '*' },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      }
    }
    
    console.log(`   ✓ Permissões atualizadas para fields='*'`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
  }
}

async function createMockData() {
  console.log('\n📝 Criando dados mock...');
  
  try {
    // 1. Criar company
    console.log('   1/5 Criando empresa...');
    const companyId = randomUUID();
    await axios.post(
      `${DIRECTUS_URL}/items/companies`,
      {
        id: companyId,
        name: 'Imobiliária Exclusiva (Produção)',
        domain: 'socimob.com.br',
        subdomain: 'exclusiva',
        status: 'active',
        theme_key: 'bauhaus',
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('   ✓ Empresa criada');
    
    // 2. Criar 5 leads
    console.log('   2/5 Criando leads...');
    const leadIds = [];
    const leadNames = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Ferreira'];
    
    for (const name of leadNames) {
      const leadId = randomUUID();
      leadIds.push(leadId);
      await axios.post(
        `${DIRECTUS_URL}/items/leads`,
        {
          id: leadId,
          company_id: companyId,
          name,
          phone: `+5511${Math.floor(90000000 + Math.random() * 10000000)}`,
          email: name.toLowerCase().replace(' ', '.') + '@email.com',
          status: ['novo', 'contatado', 'ganho'][Math.floor(Math.random() * 3)],
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
    }
    console.log(`   ✓ ${leadIds.length} leads criados`);
    
    // 3. Criar 5 properties
    console.log('   3/5 Criando imóveis...');
    const properties = [
      { title: 'Apartamento 2 Quartos Centro', type: 'apartment', bedrooms: 2, area: 65, price: 350000 },
      { title: 'Casa 3 Quartos Jardim Europa', type: 'house', bedrooms: 3, area: 120, price: 850000 },
      { title: 'Studio Moderno Pinheiros', type: 'studio', bedrooms: 1, area: 35, price: 280000 },
      { title: 'Cobertura Duplex Vila Madalena', type: 'penthouse', bedrooms: 4, area: 180, price: 1500000 },
      { title: 'Apartamento 1 Quarto Moema', type: 'apartment', bedrooms: 1, area: 45, price: 320000 },
    ];
    
    for (const prop of properties) {
      await axios.post(
        `${DIRECTUS_URL}/items/properties`,
        {
          id: randomUUID(),
          company_id: companyId,
          title: prop.title,
          description: `${prop.title} - Excelente localização`,
          property_type: prop.type,
          bedrooms: prop.bedrooms,
          area: prop.area,
          price: prop.price,
          location: 'São Paulo, SP',
          status: 'available',
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
    }
    console.log(`   ✓ ${properties.length} imóveis criados`);
    
    // 4. Criar 3 conversas
    console.log('   4/5 Criando conversas...');
    const conversaIds = [];
    for (let i = 0; i < 3; i++) {
      const conversaId = randomUUID();
      conversaIds.push(conversaId);
      await axios.post(
        `${DIRECTUS_URL}/items/conversas`,
        {
          id: conversaId,
          company_id: companyId,
          lead_id: leadIds[i],
          whatsapp_number: `+5511${Math.floor(90000000 + Math.random() * 10000000)}`,
          status: 'active',
          last_message: 'Última mensagem da conversa',
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
    }
    console.log(`   ✓ ${conversaIds.length} conversas criadas`);
    
    // 5. Criar mensagens
    console.log('   5/5 Criando mensagens...');
    let msgCount = 0;
    for (const conversaId of conversaIds) {
      for (let i = 0; i < 3; i++) {
        await axios.post(
          `${DIRECTUS_URL}/items/mensagens`,
          {
            id: randomUUID(),
            conversa_id: conversaId,
            content: `Mensagem de teste ${i + 1}`,
            direction: i % 2 === 0 ? 'inbound' : 'outbound',
            status: 'sent',
            timestamp: new Date().toISOString(),
          },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        msgCount++;
      }
    }
    console.log(`   ✓ ${msgCount} mensagens criadas`);
    
    console.log('\n✅ Dados mock criados com sucesso!');
    console.log(`\n📊 Resumo:`);
    console.log(`   • 1 empresa`);
    console.log(`   • ${leadIds.length} leads`);
    console.log(`   • ${properties.length} imóveis`);
    console.log(`   • ${conversaIds.length} conversas`);
    console.log(`   • ${msgCount} mensagens`);
    
  } catch (error) {
    console.error('   ❌ Erro ao criar mock data:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  🚀 SETUP DIRECTUS PRODUÇÃO - iMOBI');
  console.log('═══════════════════════════════════════════════\n');
  console.log(`URL: ${DIRECTUS_URL}`);
  console.log(`Admin: ${ADMIN_EMAIL}\n`);
  
  // 1. Login
  await login();
  
  // 2. Criar collections
  console.log('📦 Criando collections...\n');
  
  await createCollection('companies', 'business', [
    { field: 'id', type: 'uuid', schema: { is_primary_key: true, has_auto_increment: false } },
    { field: 'name', type: 'string', schema: { max_length: 255 } },
    { field: 'domain', type: 'string', schema: { max_length: 255, is_unique: true } },
    { field: 'subdomain', type: 'string', schema: { max_length: 100 } },
    { field: 'status', type: 'string', schema: { max_length: 50, default_value: 'active' } },
    { field: 'theme_key', type: 'string', schema: { max_length: 50 } },
  ]);
  
  await createCollection('leads', 'person', [
    { field: 'id', type: 'uuid', schema: { is_primary_key: true, has_auto_increment: false } },
    { field: 'company_id', type: 'uuid' },
    { field: 'name', type: 'string', schema: { max_length: 255 } },
    { field: 'phone', type: 'string', schema: { max_length: 50 } },
    { field: 'email', type: 'string', schema: { max_length: 255 } },
    { field: 'status', type: 'string', schema: { max_length: 50, default_value: 'novo' } },
  ]);
  
  await createCollection('properties', 'home', [
    { field: 'id', type: 'uuid', schema: { is_primary_key: true, has_auto_increment: false } },
    { field: 'company_id', type: 'uuid' },
    { field: 'title', type: 'string', schema: { max_length: 255 } },
    { field: 'description', type: 'text' },
    { field: 'property_type', type: 'string', schema: { max_length: 50 } },
    { field: 'bedrooms', type: 'integer' },
    { field: 'area', type: 'decimal', schema: { numeric_precision: 10, numeric_scale: 2 } },
    { field: 'price', type: 'decimal', schema: { numeric_precision: 15, numeric_scale: 2 } },
    { field: 'location', type: 'string', schema: { max_length: 255 } },
    { field: 'status', type: 'string', schema: { max_length: 50, default_value: 'available' } },
  ]);
  
  await createCollection('conversas', 'chat', [
    { field: 'id', type: 'uuid', schema: { is_primary_key: true, has_auto_increment: false } },
    { field: 'company_id', type: 'uuid' },
    { field: 'lead_id', type: 'uuid' },
    { field: 'whatsapp_number', type: 'string', schema: { max_length: 50 } },
    { field: 'status', type: 'string', schema: { max_length: 50, default_value: 'active' } },
    { field: 'last_message', type: 'text' },
  ]);
  
  await createCollection('mensagens', 'message', [
    { field: 'id', type: 'uuid', schema: { is_primary_key: true, has_auto_increment: false } },
    { field: 'conversa_id', type: 'uuid' },
    { field: 'content', type: 'text' },
    { field: 'direction', type: 'string', schema: { max_length: 50 } },
    { field: 'status', type: 'string', schema: { max_length: 50 } },
    { field: 'timestamp', type: 'timestamp' },
  ]);
  
  // 3. Adicionar timestamps
  console.log('\n📅 Adicionando campos de timestamp...\n');
  const collections = ['companies', 'leads', 'properties', 'conversas', 'mensagens'];
  for (const coll of collections) {
    await addTimestampFields(coll);
  }
  
  // 4. Configurar permissões
  await setupPermissions();
  
  // 5. Criar dados mock
  await createMockData();
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('  ✅ SETUP CONCLUÍDO COM SUCESSO!');
  console.log('═══════════════════════════════════════════════\n');
  console.log('Próximos passos:');
  console.log('1. Teste o backend: https://lojadaesquina.store/server/health');
  console.log('2. Teste o login no frontend: https://socimob.com.br/login');
  console.log('3. Credenciais admin: admin@example.com / d1r3ctu5');
}

main().catch(error => {
  console.error('\n❌ ERRO FATAL:', error);
  process.exit(1);
});
