const { createDirectus, rest, staticToken, readUsers, updateUser, deleteUser } = require('@directus/sdk');

const directus = createDirectus('http://localhost:8055')
  .with(staticToken('imobi_admin_token_2025'))
  .with(rest());

async function fixUser() {
  try {
    console.log('🔍 Buscando usuário admin@imobi.com...\n');
    
    // Buscar usuário
    const users = await directus.request(
      readUsers({
        filter: { email: { _eq: 'admin@imobi.com' } },
        fields: ['*']
      })
    );
    
    if (users.length === 0) {
      console.log('❌ Usuário não encontrado!');
      return;
    }
    
    const user = users[0];
    console.log('✅ Usuário encontrado:');
    console.log('  - ID:', user.id);
    console.log('  - Email:', user.email);
    console.log('  - Nome:', user.first_name, user.last_name);
    console.log('  - Status:', user.status);
    console.log('  - Role:', user.role);
    
    // Deletar e recriar usuário
    console.log('\n🗑️  Deletando usuário antigo...');
    await directus.request(deleteUser(user.id));
    console.log('✅ Usuário deletado!');
    
    // Recriar com senha correta
    console.log('\n👤 Criando novo usuário...');
    const { createUser } = require('@directus/sdk');
    const newUser = await directus.request(
      createUser({
        email: 'admin@imobi.com',
        password: 'admin123',
        role: 'e4650a77-fa9d-4301-b43b-a79fed5cfd0a', // Administrator
        first_name: 'Admin',
        last_name: 'iMOBI',
        status: 'active'
      })
    );
    
    console.log('✅ Novo usuário criado com sucesso!');
    console.log('\n📝 Credenciais:');
    console.log('   Email: admin@imobi.com');
    console.log('   Senha: admin123');
    console.log('   ID:', newUser.id);
    
  } catch (error) {
    console.error('❌ Erro:', error.errors || error.message);
  }
}

fixUser();
