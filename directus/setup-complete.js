const { createDirectus, rest, staticToken, readUsers } = require('@directus/sdk');

const directus = createDirectus('http://localhost:8055')
  .with(staticToken('imobi_admin_token_2025'))
  .with(rest());

async function createCompanyAndUser() {
  try {
    console.log('🏢 Criando empresa de teste...\n');
    
    // Criar empresa
    const { createItems } = require('@directus/sdk');
    const company = await directus.request(
      createItems('companies', {
        name: 'iMOBI Demonstração',
        slug: 'imobi-demo',
        subdomain: 'demo',
        status: 'active'
      })
    );
    
    console.log('✅ Empresa criada:');
    console.log('  - ID:', company.id);
    console.log('  - Nome:', company.name);
    console.log('  - Subdomínio:', company.subdomain);
    
    // Criar usuário vinculado à empresa
    const { createUser } = require('@directus/sdk');
    const user = await directus.request(
      createUser({
        email: 'admin@imobi.com',
        password: 'admin123',
        role: 'e4650a77-fa9d-4301-b43b-a79fed5cfd0a', // Administrator
        first_name: 'Admin',
        last_name: 'iMOBI',
        status: 'active',
        company_id: company.id
      })
    );
    
    console.log('\n✅ Usuário criado:');
    console.log('  - ID:', user.id);
    console.log('  - Email:', user.email);
    console.log('  - Empresa:', company.name);
    
    console.log('\n📝 Credenciais para login:');
    console.log('   URL: http://localhost:4000/login');
    console.log('   Email: admin@imobi.com');
    console.log('   Senha: admin123');
    
  } catch (error) {
    console.error('❌ Erro:', error.errors || error.message);
    if (error.errors) {
      console.error('Detalhes:', JSON.stringify(error.errors, null, 2));
    }
  }
}

createCompanyAndUser();
