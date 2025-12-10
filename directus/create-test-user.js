const { createDirectus, rest, staticToken, createUser, readRoles } = require('@directus/sdk');

const directus = createDirectus('http://localhost:8055')
  .with(staticToken('imobi_admin_token_2025'))
  .with(rest());

async function createTestUser() {
  try {
    // Primeiro, listar as roles disponíveis
    console.log('📋 Buscando roles disponíveis...');
    const roles = await directus.request(readRoles());
    console.log('Roles encontradas:', roles.map(r => ({ id: r.id, name: r.name })));
    
    // Pegar o ID da primeira role (geralmente Administrator)
    const adminRole = roles.find(r => r.name === 'Administrator') || roles[0];
    console.log(`\n🎯 Usando role: ${adminRole.name} (${adminRole.id})`);
    
    // Criar usuário de teste
    const user = await directus.request(
      createUser({
        email: 'admin@imobi.com',
        password: 'admin123',
        role: adminRole.id,
        first_name: 'Admin',
        last_name: 'iMOBI',
        status: 'active'
      })
    );
    
    console.log('\n✅ Usuário criado com sucesso!');
    console.log('📧 Email: admin@imobi.com');
    console.log('🔑 Senha: admin123');
    console.log('👤 ID:', user.id);
    
  } catch (error) {
    if (error.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
      console.log('\nℹ️  Usuário já existe!');
      console.log('📧 Email: admin@imobi.com');
      console.log('🔑 Senha: admin123');
    } else {
      console.error('\n❌ Erro ao criar usuário:', error.errors || error.message);
    }
  }
}

createTestUser();
