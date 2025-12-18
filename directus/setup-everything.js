/**
 * Script completo para configurar Directus do zero via API
 * Cria collections, fields, permissões e dados mock
 */

const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'd1r3ctu5';

let headers = {};

async function login() {
  console.log('🔐 Fazendo login...');
  const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  const token = response.data.data.access_token;
  headers = { Authorization: `Bearer ${token}` };
  console.log('✅ Login realizado\n');
}

async function createCollection(collection, schema) {
  console.log(`📦 Criando collection: ${collection}`);
  try {
    await axios.post(`${DIRECTUS_URL}/collections`, {
      collection,
      meta: {
        collection,
        icon: schema.icon || 'box',
        note: schema.note || '',
        display_template: null,
        hidden: false,
        singleton: false,
        translations: null,
        archive_field: null,
        archive_app_filter: true,
        archive_value: null,
        unarchive_value: null,
        sort_field: null,
        accountability: 'all',
        color: null,
        item_duplication_fields: null,
        sort: 1,
        group: null,
        collapse: 'open',
      },
      schema: {
        name: collection,
      },
    }, { headers });
    console.log(`   ✅ Collection '${collection}' criada`);
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
      console.log(`   ⚠️  Collection '${collection}' já existe`);
    } else {
      console.log(`   ❌ Erro: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }
}

async function createField(collection, field, schema) {
  try {
    await axios.post(`${DIRECTUS_URL}/fields/${collection}`, {
      field,
      type: schema.type,
      schema: schema.schema || {},
      meta: schema.meta || {},
    }, { headers });
    console.log(`   ✓ ${field}`);
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
      console.log(`   ⚠️  ${field} (já existe)`);
    } else {
      console.log(`   ❌ ${field}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }
}

async function createItem(collection, data) {
  try {
    const response = await axios.post(`${DIRECTUS_URL}/items/${collection}`, data, { headers });
    return response.data.data;
  } catch (error) {
    console.log(`   ❌ Erro ao criar item: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    return null;
  }
}

async function setupCollections() {
  console.log('\n📚 CRIANDO COLLECTIONS\n');

  // 1. Companies
  await createCollection('companies', { icon: 'business', note: 'Empresas multi-tenant' });
  console.log('   Criando campos...');
  await createField('companies', 'name', { type: 'string', schema: { max_length: 255 } });
  await createField('companies', 'domain', { type: 'string', schema: { max_length: 255 } });
  await createField('companies', 'subdomain', { type: 'string', schema: { max_length: 100 } });
  await createField('companies', 'status', { type: 'string', schema: { default_value: 'active', max_length: 50 } });
  await createField('companies', 'theme_key', { type: 'string', schema: { max_length: 50 } });

  // 2. Leads
  await createCollection('leads', { icon: 'person', note: 'Leads/Contatos' });
  console.log('   Criando campos...');
  await createField('leads', 'company_id', { type: 'uuid', schema: {} });
  await createField('leads', 'name', { type: 'string', schema: { max_length: 255 } });
  await createField('leads', 'phone', { type: 'string', schema: { max_length: 50 } });
  await createField('leads', 'email', { type: 'string', schema: { max_length: 255 } });
  await createField('leads', 'status', { type: 'string', schema: { max_length: 50 } });

  // 3. Properties
  await createCollection('properties', { icon: 'home', note: 'Imóveis' });
  console.log('   Criando campos...');
  await createField('properties', 'company_id', { type: 'uuid', schema: {} });
  await createField('properties', 'title', { type: 'string', schema: { max_length: 255 } });
  await createField('properties', 'description', { type: 'text', schema: {} });
  await createField('properties', 'property_type', { type: 'string', schema: { max_length: 50 } });
  await createField('properties', 'bedrooms', { type: 'integer', schema: {} });
  await createField('properties', 'area', { type: 'decimal', schema: { numeric_precision: 10, numeric_scale: 2 } });
  await createField('properties', 'price', { type: 'decimal', schema: { numeric_precision: 12, numeric_scale: 2 } });
  await createField('properties', 'location', { type: 'string', schema: { max_length: 255 } });
  await createField('properties', 'status', { type: 'string', schema: { max_length: 50 } });

  // 4. Conversas
  await createCollection('conversas', { icon: 'chat', note: 'Conversas WhatsApp' });
  console.log('   Criando campos...');
  await createField('conversas', 'company_id', { type: 'uuid', schema: {} });
  await createField('conversas', 'lead_id', { type: 'uuid', schema: {} });
  await createField('conversas', 'whatsapp_number', { type: 'string', schema: { max_length: 50 } });
  await createField('conversas', 'status', { type: 'string', schema: { max_length: 50 } });
  await createField('conversas', 'last_message', { type: 'text', schema: {} });

  // 5. Mensagens
  await createCollection('mensagens', { icon: 'message', note: 'Mensagens das conversas' });
  console.log('   Criando campos...');
  await createField('mensagens', 'conversa_id', { type: 'uuid', schema: {} });
  await createField('mensagens', 'content', { type: 'text', schema: {} });
  await createField('mensagens', 'direction', { type: 'string', schema: { max_length: 20 } });
  await createField('mensagens', 'status', { type: 'string', schema: { max_length: 50 } });
  await createField('mensagens', 'timestamp', { type: 'timestamp', schema: {} });

  console.log('\n✅ Collections criadas!\n');
}

async function setupPermissions() {
  console.log('🔒 CONFIGURANDO PERMISSÕES\n');

  try {
    // Obter o role do admin
    const rolesResponse = await axios.get(`${DIRECTUS_URL}/roles`, { headers });
    const adminRole = rolesResponse.data.data.find(r => r.admin_access);

    if (!adminRole) {
      console.log('⚠️  Usuário sem role (admin total), pulando permissões');
      return;
    }

    const collections = ['companies', 'leads', 'properties', 'conversas', 'mensagens'];

    for (const collection of collections) {
      console.log(`   Configurando: ${collection}`);
      const permissionData = {
        role: adminRole.id,
        collection,
        action: 'read',
        permissions: {},
        validation: {},
        presets: {},
        fields: ['*'],
      };

      for (const action of ['create', 'read', 'update', 'delete']) {
        try {
          await axios.post(`${DIRECTUS_URL}/permissions`, { ...permissionData, action }, { headers });
        } catch (err) {
          // Ignora se já existe
        }
      }
    }

    console.log('\n✅ Permissões configuradas!\n');
  } catch (error) {
    console.log(`⚠️  Erro ao configurar permissões: ${error.message}`);
  }
}

async function createMockData() {
  console.log('🎭 CRIANDO DADOS MOCK\n');

  // 1. Criar empresa
  console.log('1. Criando empresa...');
  const company = await createItem('companies', {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Imobiliária Exclusiva',
    domain: 'exclusiva.local',
    subdomain: 'exclusiva',
    status: 'active',
    theme_key: 'bauhaus',
  });

  if (!company) {
    console.log('❌ Falha ao criar empresa. Abortando...');
    return;
  }

  const companyId = company.id;
  console.log(`   ✅ Empresa criada: ${companyId}\n`);

  // 2. Criar leads
  console.log('2. Criando 10 leads...');
  const leadNames = [
    { name: 'João Silva', phone: '+5511987654321', email: 'joao.silva@email.com' },
    { name: 'Maria Santos', phone: '+5511987654322', email: 'maria.santos@email.com' },
    { name: 'Pedro Oliveira', phone: '+5511987654323', email: 'pedro.oliveira@email.com' },
    { name: 'Ana Costa', phone: '+5511987654324', email: 'ana.costa@email.com' },
    { name: 'Carlos Ferreira', phone: '+5511987654325', email: 'carlos.ferreira@email.com' },
    { name: 'Juliana Lima', phone: '+5511987654326', email: 'juliana.lima@email.com' },
    { name: 'Roberto Alves', phone: '+5511987654327', email: 'roberto.alves@email.com' },
    { name: 'Fernanda Souza', phone: '+5511987654328', email: 'fernanda.souza@email.com' },
    { name: 'Lucas Martins', phone: '+5511987654329', email: 'lucas.martins@email.com' },
    { name: 'Camila Rocha', phone: '+5511987654330', email: 'camila.rocha@email.com' },
  ];

  const leads = [];
  const statuses = ['novo', 'em_atendimento', 'qualificado'];

  for (let i = 0; i < leadNames.length; i++) {
    const lead = await createItem('leads', {
      company_id: companyId,
      name: leadNames[i].name,
      phone: leadNames[i].phone,
      email: leadNames[i].email,
      status: statuses[i % 3],
    });
    if (lead) leads.push(lead);
  }
  console.log(`   ✅ ${leads.length} leads criados\n`);

  // 3. Criar properties
  console.log('3. Criando 15 properties...');
  const properties = [
    { title: 'Apartamento 2 Quartos Vila Mariana', type: 'apartamento', bedrooms: 2, area: 65, price: 450000, location: 'Vila Mariana, São Paulo' },
    { title: 'Casa 3 Quartos Pinheiros', type: 'casa', bedrooms: 3, area: 120, price: 850000, location: 'Pinheiros, São Paulo' },
    { title: 'Studio Moema', type: 'studio', bedrooms: 1, area: 35, price: 280000, location: 'Moema, São Paulo' },
    { title: 'Cobertura 4 Quartos Itaim Bibi', type: 'cobertura', bedrooms: 4, area: 220, price: 1500000, location: 'Itaim Bibi, São Paulo' },
    { title: 'Apartamento 3 Quartos Perdizes', type: 'apartamento', bedrooms: 3, area: 95, price: 650000, location: 'Perdizes, São Paulo' },
    { title: 'Sobrado 4 Quartos Jardins', type: 'sobrado', bedrooms: 4, area: 250, price: 1200000, location: 'Jardins, São Paulo' },
    { title: 'Apartamento 1 Quarto Consolação', type: 'apartamento', bedrooms: 1, area: 45, price: 350000, location: 'Consolação, São Paulo' },
    { title: 'Casa 2 Quartos Lapa', type: 'casa', bedrooms: 2, area: 85, price: 520000, location: 'Lapa, São Paulo' },
    { title: 'Apartamento 2 Quartos Bela Vista', type: 'apartamento', bedrooms: 2, area: 70, price: 480000, location: 'Bela Vista, São Paulo' },
    { title: 'Cobertura 3 Quartos Moema', type: 'cobertura', bedrooms: 3, area: 180, price: 1100000, location: 'Moema, São Paulo' },
    { title: 'Studio Higienópolis', type: 'studio', bedrooms: 1, area: 32, price: 290000, location: 'Higienópolis, São Paulo' },
    { title: 'Casa 3 Quartos Butantã', type: 'casa', bedrooms: 3, area: 150, price: 720000, location: 'Butantã, São Paulo' },
    { title: 'Apartamento 2 Quartos Tatuapé', type: 'apartamento', bedrooms: 2, area: 62, price: 420000, location: 'Tatuapé, São Paulo' },
    { title: 'Sobrado 3 Quartos Saúde', type: 'sobrado', bedrooms: 3, area: 200, price: 950000, location: 'Saúde, São Paulo' },
    { title: 'Apartamento 4 Quartos Paraíso', type: 'apartamento', bedrooms: 4, area: 130, price: 780000, location: 'Paraíso, São Paulo' },
  ];

  const propStatuses = ['disponivel', 'reservado', 'vendido'];
  let propCount = 0;

  for (let i = 0; i < properties.length; i++) {
    const prop = await createItem('properties', {
      company_id: companyId,
      title: properties[i].title,
      description: `Excelente ${properties[i].type} com ${properties[i].bedrooms} quartos`,
      property_type: properties[i].type,
      bedrooms: properties[i].bedrooms,
      area: properties[i].area,
      price: properties[i].price,
      location: properties[i].location,
      status: propStatuses[i % 3],
    });
    if (prop) propCount++;
  }
  console.log(`   ✅ ${propCount} properties criados\n`);

  // 4. Criar conversas e mensagens
  console.log('4. Criando conversas e mensagens...');
  const conversationTopics = [
    'Olá! Gostaria de mais informações sobre apartamentos.',
    'Obrigado pelas informações! Vou pensar e retorno.',
    'Posso agendar uma visita para amanhã?',
    'Quanto fica o financiamento para este imóvel?',
    'Estou interessado em casas na zona sul.',
    'Podem enviar mais fotos?',
    'Qual o valor do condomínio?',
    'Aceita permuta?',
    'Já está disponível para mudança?',
    'Qual a documentação necessária?',
  ];

  for (let i = 0; i < leads.length && i < conversationTopics.length; i++) {
    const conversa = await createItem('conversas', {
      company_id: companyId,
      lead_id: leads[i].id,
      whatsapp_number: leads[i].phone,
      status: 'ativa',
      last_message: conversationTopics[i],
    });

    if (conversa) {
      // Criar 4 mensagens por conversa
      await createItem('mensagens', {
        conversa_id: conversa.id,
        content: conversationTopics[i],
        direction: 'inbound',
        status: 'read',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      });

      await createItem('mensagens', {
        conversa_id: conversa.id,
        content: 'Olá! Obrigado pelo contato. Como posso ajudar?',
        direction: 'outbound',
        status: 'delivered',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      });

      await createItem('mensagens', {
        conversa_id: conversa.id,
        content: 'Vocês têm opções na zona sul?',
        direction: 'inbound',
        status: 'read',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      });

      await createItem('mensagens', {
        conversa_id: conversa.id,
        content: 'Sim! Temos várias opções. Vou te enviar algumas sugestões.',
        direction: 'outbound',
        status: 'delivered',
        timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
      });
    }
  }
  console.log(`   ✅ ${leads.length} conversas criadas com 4 mensagens cada\n`);

  console.log('🎉 DADOS MOCK CRIADOS COM SUCESSO!\n');
}

async function main() {
  try {
    console.log('\n🚀 SETUP COMPLETO DO DIRECTUS\n');
    console.log('=' .repeat(50) + '\n');

    await login();
    await setupCollections();
    await setupPermissions();
    await createMockData();

    console.log('=' .repeat(50));
    console.log('\n✅ TUDO PRONTO!\n');
    console.log('📋 Resumo:');
    console.log('   - 1 empresa criada');
    console.log('   - 10 leads criados');
    console.log('   - 15 properties criados');
    console.log('   - 10 conversas criadas');
    console.log('   - 40 mensagens criadas\n');
    console.log('🌐 Acesse: http://localhost:4000/login');
    console.log('🔑 Login: admin@example.com / d1r3ctu5\n');
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    if (error.response) {
      console.error('Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();
