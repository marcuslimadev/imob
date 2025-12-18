/**
 * Setup completo Directus - Cria collections, tabelas e dados mock
 */

const axios = require('axios');
const { randomUUID } = require('crypto');

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'd1r3ctu5';

let headers = {};

async function login() {
  console.log('🔐 Login...');
  const res = await axios.post(`${DIRECTUS_URL}/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  headers = { Authorization: `Bearer ${res.data.data.access_token}` };
  console.log('✅ Logado\n');
}

async function createCollection(name, fields, icon = 'box') {
  console.log(`📦 ${name}`);
  try {
    await axios.post(`${DIRECTUS_URL}/collections`, {
      collection: name,
      meta: { icon },
      schema: { name },
      fields: fields.map(f => ({ field: f.field, type: f.type, schema: f.schema || {} })),
    }, { headers });
    console.log(`   ✅ Criado`);
  } catch (e) {
    const msg = e.response?.data?.errors?.[0]?.message || e.message;
    if (msg.includes('exists')) console.log(`   ⚠️  Já existe`);
    else console.log(`   ❌ ${msg}`);
  }
}

async function createItem(coll, data) {
  try {
    const res = await axios.post(`${DIRECTUS_URL}/items/${coll}`, data, { headers });
    return res.data.data;
  } catch (e) {
    console.log(`   ❌ ${e.response?.data?.errors?.[0]?.message || e.message}`);
    return null;
  }
}

async function main() {
  console.log('\n🚀 SETUP DIRECTUS\n' + '='.repeat(50) + '\n');

  await login();

  // Schema
  console.log('📚 SCHEMA\n');
  await createCollection('companies', [
    { field: 'id', type: 'uuid', schema: { is_primary_key: true } },
    { field: 'name', type: 'string', schema: { max_length: 255 } },
    { field: 'domain', type: 'string', schema: { max_length: 255 } },
    { field: 'subdomain', type: 'string', schema: { max_length: 100 } },
    { field: 'status', type: 'string', schema: { max_length: 50, default_value: 'active' } },
    { field: 'theme_key', type: 'string', schema: { max_length: 50 } },
  ], 'business');

  await createCollection('leads', [
    { field: 'id', type: 'uuid', schema: { is_primary_key: true } },
    { field: 'company_id', type: 'uuid' },
    { field: 'name', type: 'string', schema: { max_length: 255 } },
    { field: 'phone', type: 'string', schema: { max_length: 50 } },
    { field: 'email', type: 'string', schema: { max_length: 255 } },
    { field: 'status', type: 'string', schema: { max_length: 50 } },
  ], 'person');

  await createCollection('properties', [
    { field: 'id', type: 'uuid', schema: { is_primary_key: true } },
    { field: 'company_id', type: 'uuid' },
    { field: 'title', type: 'string', schema: { max_length: 255 } },
    { field: 'description', type: 'text' },
    { field: 'property_type', type: 'string', schema: { max_length: 50 } },
    { field: 'bedrooms', type: 'integer' },
    { field: 'area', type: 'decimal', schema: { numeric_precision: 10, numeric_scale: 2 } },
    { field: 'price', type: 'decimal', schema: { numeric_precision: 12, numeric_scale: 2 } },
    { field: 'location', type: 'string', schema: { max_length: 255 } },
    { field: 'status', type: 'string', schema: { max_length: 50 } },
  ], 'home');

  await createCollection('conversas', [
    { field: 'id', type: 'uuid', schema: { is_primary_key: true } },
    { field: 'company_id', type: 'uuid' },
    { field: 'lead_id', type: 'uuid' },
    { field: 'whatsapp_number', type: 'string', schema: { max_length: 50 } },
    { field: 'status', type: 'string', schema: { max_length: 50 } },
    { field: 'last_message', type: 'text' },
  ], 'chat');

  await createCollection('mensagens', [
    { field: 'id', type: 'uuid', schema: { is_primary_key: true } },
    { field: 'conversa_id', type: 'uuid' },
    { field: 'content', type: 'text' },
    { field: 'direction', type: 'string', schema: { max_length: 20 } },
    { field: 'status', type: 'string', schema: { max_length: 50 } },
    { field: 'timestamp', type: 'timestamp' },
  ], 'message');

  console.log('\n🎭 DADOS MOCK\n');

  // Empresa
  console.log('1. Empresa');
  const company = await createItem('companies', {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Imobiliária Exclusiva',
    domain: 'exclusiva.local',
    subdomain: 'exclusiva',
    status: 'active',
    theme_key: 'bauhaus',
  });
  if (!company) return;
  const cid = company.id;

  // Leads
  console.log('2. Leads');
  const leadData = [
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
  const st = ['novo', 'em_atendimento', 'qualificado'];
  for (let i = 0; i < leadData.length; i++) {
    const l = await createItem('leads', { id: randomUUID(), company_id: cid, ...leadData[i], status: st[i % 3] });
    if (l) leads.push(l);
  }
  console.log(`   ✅ ${leads.length} criados`);

  // Properties
  console.log('3. Properties');
  const props = [
    { title: 'Ap 2Q Vila Mariana', type: 'apartamento', bed: 2, area: 65, price: 450000, loc: 'Vila Mariana' },
    { title: 'Casa 3Q Pinheiros', type: 'casa', bed: 3, area: 120, price: 850000, loc: 'Pinheiros' },
    { title: 'Studio Moema', type: 'studio', bed: 1, area: 35, price: 280000, loc: 'Moema' },
    { title: 'Cobertura 4Q Itaim', type: 'cobertura', bed: 4, area: 220, price: 1500000, loc: 'Itaim Bibi' },
    { title: 'Ap 3Q Perdizes', type: 'apartamento', bed: 3, area: 95, price: 650000, loc: 'Perdizes' },
    { title: 'Sobrado 4Q Jardins', type: 'sobrado', bed: 4, area: 250, price: 1200000, loc: 'Jardins' },
    { title: 'Ap 1Q Consolação', type: 'apartamento', bed: 1, area: 45, price: 350000, loc: 'Consolação' },
    { title: 'Casa 2Q Lapa', type: 'casa', bed: 2, area: 85, price: 520000, loc: 'Lapa' },
    { title: 'Ap 2Q Bela Vista', type: 'apartamento', bed: 2, area: 70, price: 480000, loc: 'Bela Vista' },
    { title: 'Cobertura 3Q Moema', type: 'cobertura', bed: 3, area: 180, price: 1100000, loc: 'Moema' },
    { title: 'Studio Higienópolis', type: 'studio', bed: 1, area: 32, price: 290000, loc: 'Higienópolis' },
    { title: 'Casa 3Q Butantã', type: 'casa', bed: 3, area: 150, price: 720000, loc: 'Butantã' },
    { title: 'Ap 2Q Tatuapé', type: 'apartamento', bed: 2, area: 62, price: 420000, loc: 'Tatuapé' },
    { title: 'Sobrado 3Q Saúde', type: 'sobrado', bed: 3, area: 200, price: 950000, loc: 'Saúde' },
    { title: 'Ap 4Q Paraíso', type: 'apartamento', bed: 4, area: 130, price: 780000, loc: 'Paraíso' },
  ];
  const pst = ['disponivel', 'reservado', 'vendido'];
  let pc = 0;
  for (let i = 0; i < props.length; i++) {
    const p = await createItem('properties', {
      id: randomUUID(),
      company_id: cid,
      title: props[i].title,
      description: `Excelente ${props[i].type}`,
      property_type: props[i].type,
      bedrooms: props[i].bed,
      area: props[i].area,
      price: props[i].price,
      location: props[i].loc,
      status: pst[i % 3],
    });
    if (p) pc++;
  }
  console.log(`   ✅ ${pc} criados`);

  // Conversas
  console.log('4. Conversas');
  const topics = [
    'Olá! Gostaria de informações.',
    'Vi o anúncio da casa.',
    'Posso agendar visita?',
    'Quanto fica o financiamento?',
    'Interesse em casas.',
    'Podem enviar fotos?',
    'Valor do condomínio?',
    'Aceita permuta?',
    'Disponível para mudança?',
    'Documentação necessária?',
  ];
  let cc = 0;
  for (let i = 0; i < Math.min(leads.length, topics.length); i++) {
    const conv = await createItem('conversas', {
      id: randomUUID(),
      company_id: cid,
      lead_id: leads[i].id,
      whatsapp_number: leads[i].phone,
      status: 'ativa',
      last_message: topics[i],
    });
    if (conv) {
      cc++;
      await createItem('mensagens', { id: randomUUID(), conversa_id: conv.id, content: topics[i], direction: 'inbound', status: 'read', timestamp: new Date(Date.now() - 2 * 3600000).toISOString() });
      await createItem('mensagens', { id: randomUUID(), conversa_id: conv.id, content: 'Olá! Como posso ajudar?', direction: 'outbound', status: 'delivered', timestamp: new Date(Date.now() - 1.5 * 3600000).toISOString() });
      await createItem('mensagens', { id: randomUUID(), conversa_id: conv.id, content: 'Quero mais detalhes.', direction: 'inbound', status: 'read', timestamp: new Date(Date.now() - 1 * 3600000).toISOString() });
      await createItem('mensagens', { id: randomUUID(), conversa_id: conv.id, content: 'Vou te enviar as informações!', direction: 'outbound', status: 'delivered', timestamp: new Date(Date.now() - 0.5 * 3600000).toISOString() });
    }
  }
  console.log(`   ✅ ${cc} conversas com mensagens`);

  console.log('\n' + '='.repeat(50));
  console.log('\n✅ PRONTO!\n');
  console.log('📊 Resumo:');
  console.log(`   • 1 empresa`);
  console.log(`   • ${leads.length} leads`);
  console.log(`   • ${pc} properties`);
  console.log(`   • ${cc} conversas`);
  console.log(`   • ${cc * 4} mensagens`);
  console.log('\n🌐 http://localhost:4000/login');
  console.log('🔑 admin@example.com / d1r3ctu5\n');
}

main().catch(e => {
  console.error('\n❌ ERRO:', e.message);
  process.exit(1);
});
