const { createDirectus, authentication, rest, login, readMe } = require('@directus/sdk');

const directus = createDirectus('http://localhost:8055')
  .with(authentication('json', { credentials: 'include' }))
  .with(rest({ credentials: 'include' }));

async function testLogin() {
  console.log('🔐 Testando login...\n');
  
  try {
    // Fazer login com sintaxe correta - objeto com email e password
    console.log('📧 Email: admin@imobi.com');
    console.log('🔑 Senha: admin123\n');
    
    const loginResult = await directus.request(
      login({
        email: 'admin@imobi.com',
        password: 'admin123'
      })
    );
    
    console.log('✅ Login bem-sucedido!');
    console.log('🎫 Resultado:', JSON.stringify(loginResult, null, 2));
    
    // Aguardar um pouco para o token ser processado
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Buscar dados do usuário
    console.log('\n👤 Buscando dados do usuário...');
    const me = await directus.request(
      readMe({
        fields: ['*']
      })
    );
    
    console.log('\n✅ Dados do usuário recebidos:');
    console.log('  - ID:', me.id);
    console.log('  - Email:', me.email);
    console.log('  - Nome:', me.first_name, me.last_name);
    console.log('  - Role:', me.role);
    console.log('  - Status:', me.status);
    
    console.log('\n✅ Sistema de autenticação funcionando perfeitamente!');
    console.log('\n📝 Use estas credenciais no frontend:');
    console.log('   URL: http://localhost:4000/login');
    console.log('   Email: admin@imobi.com');
    console.log('   Senha: admin123');
    
  } catch (error) {
    console.error('\n❌ Erro:', error.errors?.[0]?.message || error.message);
    if (error.errors) {
      console.error('🔧 Detalhes:', JSON.stringify(error.errors, null, 2));
    }
  }
}

testLogin();
