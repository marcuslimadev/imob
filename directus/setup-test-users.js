const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'marcus@admin.com';
const ADMIN_PASSWORD = 'Teste@123';

async function setupTestUsers() {
  try {
    console.log('🔐 Fazendo login como admin...');
    const loginResponse = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    const token = loginResponse.data.data.access_token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login realizado com sucesso!\n');

    // 1. Verificar se as companies existem
    console.log('📊 Verificando companies...');
    const companiesResponse = await axios.get(`${DIRECTUS_URL}/items/companies`, { headers });
    const companies = companiesResponse.data.data;
    
    if (companies.length === 0) {
      console.log('❌ Nenhuma company encontrada. Criando companies de teste...');
      
      const company1 = await axios.post(`${DIRECTUS_URL}/items/companies`, {
        name: 'Imobiliária Exemplo',
        slug: 'imobiliaria-exemplo',
        status: 'active'
      }, { headers });
      
      const company2 = await axios.post(`${DIRECTUS_URL}/items/companies`, {
        name: 'Imóveis Premium',
        slug: 'imoveis-premium',
        status: 'active'
      }, { headers });
      
      companies.push(company1.data.data, company2.data.data);
      console.log('✅ Companies criadas!\n');
    } else {
      console.log(`✅ ${companies.length} companies encontradas\n`);
    }

    // 2. Verificar roles existentes
    console.log('👥 Verificando roles...');
    const rolesResponse = await axios.get(`${DIRECTUS_URL}/roles`, { headers });
    const roles = rolesResponse.data.data;
    
    const adminRole = roles.find(r => r.name === 'Admin Imobiliária');
    const userRole = roles.find(r => r.name === 'Usuário Imobiliária');
    
    if (!adminRole || !userRole) {
      console.log('❌ Roles não encontradas. Execute setup-roles.js primeiro!');
      return;
    }
    
    console.log(`✅ Roles encontradas: ${adminRole.name}, ${userRole.name}\n`);

    // 3. Criar usuários de teste
    console.log('👤 Criando usuários de teste...');
    
    const testUsers = [
      {
        email: 'admin@imobiliaria1.com',
        password: 'admin123',
        first_name: 'Admin',
        last_name: 'Imobiliária 1',
        role: adminRole.id,
        company_id: companies[0].id,
        status: 'active'
      },
      {
        email: 'user@imobiliaria1.com',
        password: 'user123',
        first_name: 'Usuário',
        last_name: 'Imobiliária 1',
        role: userRole.id,
        company_id: companies[0].id,
        status: 'active'
      },
      {
        email: 'admin@imobiliaria2.com',
        password: 'admin123',
        first_name: 'Admin',
        last_name: 'Imobiliária 2',
        role: adminRole.id,
        company_id: companies.length > 1 ? companies[1].id : companies[0].id,
        status: 'active'
      }
    ];

    for (const userData of testUsers) {
      try {
        // Verificar se o usuário já existe
        const existingUsers = await axios.get(`${DIRECTUS_URL}/users?filter[email][_eq]=${userData.email}`, { headers });
        
        if (existingUsers.data.data.length > 0) {
          console.log(`⚠️  Usuário ${userData.email} já existe`);
          continue;
        }

        await axios.post(`${DIRECTUS_URL}/users`, userData, { headers });
        console.log(`✅ Usuário criado: ${userData.email} (${userData.first_name} ${userData.last_name})`);
      } catch (error) {
        console.error(`❌ Erro ao criar usuário ${userData.email}:`, error.response?.data || error.message);
      }
    }

    console.log('\n✅ Setup de usuários de teste concluído!');
    console.log('\n📋 Credenciais de teste:');
    console.log('Admin Imobiliária 1: admin@imobiliaria1.com / admin123');
    console.log('Usuário Imobiliária 1: user@imobiliaria1.com / user123');
    console.log('Admin Imobiliária 2: admin@imobiliaria2.com / admin123');

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    process.exit(1);
  }
}

setupTestUsers();
