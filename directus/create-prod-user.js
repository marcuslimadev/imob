/**
 * Script para criar usuário admin via API do Directus em produção
 * Executa via endpoint /users do Directus
 */

const DIRECTUS_URL = 'http://production-imobi-alb-1837293727.sa-east-1.elb.amazonaws.com';

async function createAdminUser() {
  console.log('🔐 Criando usuário admin no Directus de produção...\n');

  // Primeiro, precisamos fazer login com um usuário admin existente
  // ou usar um token estático
  
  // Vamos tentar criar via endpoint público de users (se permitido)
  // Caso contrário, precisaremos de acesso direto ao container

  console.log('❌ AVISO: Este backend em produção não tem usuários criados ainda!\n');
  console.log('📝 Para criar o primeiro usuário admin, você precisa:');
  console.log('\n1️⃣  Conectar no container do Directus via ECS:');
  console.log('   aws ecs execute-command --cluster production-imobi-cluster \\');
  console.log('     --task <TASK_ID> \\');
  console.log('     --container directus \\');
  console.log('     --interactive --command "/bin/sh"');
  console.log('\n2️⃣  Dentro do container, executar:');
  console.log('   npx directus users create --email admin@imobi.com --password Admin@123 --role administrator');
  console.log('\n3️⃣  OU criar via SQL direto no RDS (se tiver acesso):');
  console.log('   -- Primeiro obter hash da senha');
  console.log('   -- Depois inserir na tabela directus_users');
  console.log('\n4️⃣  OU usar o Directus Studio local conectado ao RDS de produção');
  console.log('\n📌 SOLUÇÃO MAIS RÁPIDA:');
  console.log('   Executar os scripts de setup no ambiente de produção:');
  console.log('   - create-test-users.js');
  console.log('   - Conectado ao ALB de produção');
}

createAdminUser();
