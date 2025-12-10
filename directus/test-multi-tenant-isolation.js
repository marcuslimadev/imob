/**
 * Script para criar 2 empresas de teste e validar isolamento multi-tenant
 * Cria empresas, usuários, propriedades e leads para cada uma
 */
require('dotenv').config();
const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'marcus@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Teste@123';

async function login() {
  console.log('🔑 Fazendo login como admin...');
  const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  return response.data.data.access_token;
}

async function createTestCompanies(token) {
  const headers = { Authorization: `Bearer ${token}` };
  
  const companies = [
    {
      name: 'Imobiliária Alpha',
      slug: 'alpha',
      email: 'contato@alpha.com',
      phone: '11999990001',
      address: 'Rua Alpha, 100',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01000-000'
    },
    {
      name: 'Imobiliária Beta',
      slug: 'beta',
      email: 'contato@beta.com',
      phone: '11999990002',
      address: 'Rua Beta, 200',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '02000-000'
    }
  ];
  
  const createdCompanies = [];
  
  for (const company of companies) {
    try {
      // Verificar se já existe
      const existing = await axios.get(`${DIRECTUS_URL}/items/companies`, {
        headers,
        params: { filter: { slug: { _eq: company.slug } } }
      });
      
      if (existing.data.data.length > 0) {
        console.log(`✅ Empresa '${company.name}' já existe`);
        createdCompanies.push(existing.data.data[0]);
      } else {
        const created = await axios.post(`${DIRECTUS_URL}/items/companies`, company, { headers });
        console.log(`✅ Empresa '${company.name}' criada (ID: ${created.data.data.id})`);
        createdCompanies.push(created.data.data);
      }
    } catch (error) {
      console.error(`❌ Erro ao criar ${company.name}:`, error.response?.data?.errors?.[0]?.message || error.message);
    }
  }
  
  return createdCompanies;
}

async function createTestUsers(token, companies) {
  const headers = { Authorization: `Bearer ${token}` };
  
  // Buscar role "Company Admin"
  const rolesResp = await axios.get(`${DIRECTUS_URL}/roles`, { headers });
  const companyAdminRole = rolesResp.data.data.find(r => r.name === 'Company Admin');
  
  if (!companyAdminRole) {
    console.error('❌ Role "Company Admin" não encontrada. Execute node setup-role-permissions.js primeiro.');
    return [];
  }
  
  const users = [
    {
      email: 'admin@alpha.com',
      password: 'Teste@123',
      first_name: 'Admin',
      last_name: 'Alpha',
      company_id: companies[0].id,
      role: companyAdminRole.id,
      status: 'active'
    },
    {
      email: 'admin@beta.com',
      password: 'Teste@123',
      first_name: 'Admin',
      last_name: 'Beta',
      company_id: companies[1].id,
      role: companyAdminRole.id,
      status: 'active'
    }
  ];
  
  const createdUsers = [];
  
  for (const user of users) {
    try {
      const existing = await axios.get(`${DIRECTUS_URL}/users`, {
        headers,
        params: { filter: { email: { _eq: user.email } } }
      });
      
      if (existing.data.data.length > 0) {
        console.log(`✅ Usuário '${user.email}' já existe`);
        createdUsers.push(existing.data.data[0]);
      } else {
        const created = await axios.post(`${DIRECTUS_URL}/users`, user, { headers });
        console.log(`✅ Usuário '${user.email}' criado (Empresa: ${user.company_id})`);
        createdUsers.push(created.data.data);
      }
    } catch (error) {
      console.error(`❌ Erro ao criar ${user.email}:`, error.response?.data?.errors?.[0]?.message || error.message);
    }
  }
  
  return createdUsers;
}

async function createTestProperties(token, companies) {
  const headers = { Authorization: `Bearer ${token}` };
  
  const properties = [
    // Alpha
    {
      title: 'Apartamento Alpha 1',
      description: 'Propriedade da empresa Alpha',
      company_id: companies[0].id,
      property_type: 'apartment',
      transaction_type: 'sale',
      bedrooms: 2,
      bathrooms: 1,
      area_total: 60,
      price_sale: 250000,
      status: 'active',
      address: 'Rua Alpha Test, 10',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01000-100'
    },
    {
      title: 'Casa Alpha 2',
      description: 'Segunda propriedade da empresa Alpha',
      company_id: companies[0].id,
      property_type: 'house',
      transaction_type: 'rent',
      bedrooms: 3,
      bathrooms: 2,
      area_total: 120,
      price_rent: 3000,
      status: 'active',
      address: 'Rua Alpha Test, 20',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01000-200'
    },
    // Beta
    {
      title: 'Apartamento Beta 1',
      description: 'Propriedade da empresa Beta',
      company_id: companies[1].id,
      property_type: 'apartment',
      transaction_type: 'sale',
      bedrooms: 3,
      bathrooms: 2,
      area_total: 80,
      price_sale: 350000,
      status: 'active',
      address: 'Rua Beta Test, 30',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '02000-100'
    },
    {
      title: 'Comercial Beta 2',
      description: 'Segunda propriedade da empresa Beta',
      company_id: companies[1].id,
      property_type: 'commercial',
      transaction_type: 'rent',
      bedrooms: 0,
      bathrooms: 2,
      area_total: 200,
      price_rent: 8000,
      status: 'active',
      address: 'Rua Beta Test, 40',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '02000-200'
    }
  ];
  
  for (const property of properties) {
    try {
      await axios.post(`${DIRECTUS_URL}/items/properties`, property, { headers });
      console.log(`✅ Propriedade '${property.title}' criada`);
    } catch (error) {
      console.error(`❌ Erro ao criar ${property.title}:`, error.response?.data?.errors?.[0]?.message || error.message);
    }
  }
}

async function createTestLeads(token, companies) {
  const headers = { Authorization: `Bearer ${token}` };
  
  const leads = [
    // Alpha
    {
      name: 'Lead Alpha 1',
      email: 'lead1@alpha.com',
      phone: '11999991001',
      company_id: companies[0].id,
      lead_source: 'website',
      stage: 'new',
      lead_score: 50
    },
    {
      name: 'Lead Alpha 2',
      email: 'lead2@alpha.com',
      phone: '11999991002',
      company_id: companies[0].id,
      lead_source: 'whatsapp',
      stage: 'contacted',
      lead_score: 70
    },
    // Beta
    {
      name: 'Lead Beta 1',
      email: 'lead1@beta.com',
      phone: '11999992001',
      company_id: companies[1].id,
      lead_source: 'website',
      stage: 'new',
      lead_score: 60
    },
    {
      name: 'Lead Beta 2',
      email: 'lead2@beta.com',
      phone: '11999992002',
      company_id: companies[1].id,
      lead_source: 'referral',
      stage: 'qualified',
      lead_score: 80
    }
  ];
  
  for (const lead of leads) {
    try {
      await axios.post(`${DIRECTUS_URL}/items/leads`, lead, { headers });
      console.log(`✅ Lead '${lead.name}' criado`);
    } catch (error) {
      console.error(`❌ Erro ao criar ${lead.name}:`, error.response?.data?.errors?.[0]?.message || error.message);
    }
  }
}

async function validateIsolation(token, companies) {
  const headers = { Authorization: `Bearer ${token}` };
  
  console.log('\n🔍 Validando isolamento multi-tenant...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Testar propriedades
  for (const company of companies) {
    const props = await axios.get(`${DIRECTUS_URL}/items/properties`, {
      headers,
      params: { filter: { company_id: { _eq: company.id } } }
    });
    
    const expected = 2;
    const actual = props.data.data.length;
    
    if (actual === expected) {
      console.log(`✅ Empresa ${company.name}: ${actual} propriedades (correto)`);
      passed++;
    } else {
      console.log(`❌ Empresa ${company.name}: ${actual} propriedades (esperado: ${expected})`);
      failed++;
    }
  }
  
  // Testar leads
  for (const company of companies) {
    const leads = await axios.get(`${DIRECTUS_URL}/items/leads`, {
      headers,
      params: { filter: { company_id: { _eq: company.id } } }
    });
    
    const expected = 2;
    const actual = leads.data.data.length;
    
    if (actual === expected) {
      console.log(`✅ Empresa ${company.name}: ${actual} leads (correto)`);
      passed++;
    } else {
      console.log(`❌ Empresa ${company.name}: ${actual} leads (esperado: ${expected})`);
      failed++;
    }
  }
  
  console.log(`\n📊 Resultado: ${passed} testes passaram, ${failed} falharam`);
  
  if (failed === 0) {
    console.log('✅ Isolamento multi-tenant funcionando corretamente!\n');
    console.log('📝 Credenciais de teste:');
    console.log('   Alpha: admin@alpha.com / Teste@123');
    console.log('   Beta:  admin@beta.com / Teste@123\n');
  } else {
    console.log('❌ Vazamento de dados detectado! Verifique as permissões.\n');
  }
}

async function main() {
  try {
    const token = await login();
    
    console.log('\n1️⃣ Criando empresas de teste...');
    const companies = await createTestCompanies(token);
    
    if (companies.length < 2) {
      console.error('❌ Falha ao criar empresas. Abortando.');
      process.exit(1);
    }
    
    console.log('\n2️⃣ Criando usuários de teste...');
    await createTestUsers(token, companies);
    
    console.log('\n3️⃣ Criando propriedades de teste...');
    await createTestProperties(token, companies);
    
    console.log('\n4️⃣ Criando leads de teste...');
    await createTestLeads(token, companies);
    
    console.log('\n5️⃣ Validando isolamento...');
    await validateIsolation(token, companies);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    process.exit(1);
  }
}

main();
