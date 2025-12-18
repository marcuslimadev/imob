/**
 * Script para criar primeiro usuário admin via conexão direta ao banco
 * Usa as mesmas credenciais do RDS de produção
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createFirstAdmin() {
  // Estas são as credenciais do RDS (você precisa confirmar)
  const client = new Client({
    host: process.env.DB_HOST || 'production-imobi-db.c9qzx8y4z5w6.sa-east-1.rds.amazonaws.com',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'directus',
    user: process.env.DB_USER || 'directus_admin',
    password: process.env.DB_PASSWORD // NECESSÁRIO!
  });

  try {
    console.log('🔌 Conectando ao RDS de produção...');
    await client.connect();
    console.log('✅ Conectado!\n');

    // 1. Verificar se já existem usuários
    const usersCheck = await client.query('SELECT COUNT(*) as count FROM directus_users');
    if (parseInt(usersCheck.rows[0].count) > 0) {
      console.log('⚠️  Já existem usuários no sistema!');
      console.log(`Total de usuários: ${usersCheck.rows[0].count}`);
      
      const users = await client.query('SELECT id, email, status FROM directus_users LIMIT 5');
      console.log('\nUsuários existentes:');
      users.rows.forEach(u => console.log(`  - ${u.email} (${u.status})`));
      
      await client.end();
      return;
    }

    // 2. Buscar role de Administrator
    console.log('🔍 Buscando role de administrador...');
    const roleResult = await client.query(
      'SELECT id, name FROM directus_roles WHERE admin_access = true LIMIT 1'
    );
    
    if (roleResult.rows.length === 0) {
      throw new Error('Role de administrador não encontrada!');
    }
    
    const adminRole = roleResult.rows[0];
    console.log(`✅ Role encontrada: ${adminRole.name} (${adminRole.id})`);

    // 3. Buscar primeira empresa (opcional)
    const companyResult = await client.query('SELECT id, name FROM companies LIMIT 1');
    const companyId = companyResult.rows[0]?.id || null;
    
    if (companyId) {
      console.log(`✅ Empresa encontrada: ${companyResult.rows[0].name} (${companyId})`);
    }

    // 4. Gerar hash da senha
    console.log('\n🔐 Gerando hash da senha...');
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    console.log('✅ Hash gerado');

    // 5. Criar usuário
    console.log('\n👤 Criando usuário admin...');
    const userId = uuidv4();
    
    await client.query(`
      INSERT INTO directus_users (
        id, email, password, first_name, last_name, role, company_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      userId,
      'admin@imobi.com',
      passwordHash,
      'Admin',
      'Sistema',
      adminRole.id,
      companyId,
      'active'
    ]);

    console.log('✅ Usuário criado com sucesso!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 CREDENCIAIS DE ACESSO:');
    console.log('═══════════════════════════════════════');
    console.log('Email:    admin@imobi.com');
    console.log('Senha:    Admin123!');
    console.log('Role:     ' + adminRole.name);
    if (companyId) {
      console.log('Empresa:  ' + companyResult.rows[0].name);
    }
    console.log('═══════════════════════════════════════\n');

    await client.end();
    console.log('✅ Pronto! Você já pode fazer login no sistema.');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Verifique se:');
      console.log('  1. O RDS está acessível (security group)');
      console.log('  2. As credenciais estão corretas');
      console.log('  3. O host/porta estão corretos');
    }
    await client.end();
    process.exit(1);
  }
}

// Verificar se as dependências estão instaladas
const missingDeps = [];
try { require('pg'); } catch { missingDeps.push('pg'); }
try { require('bcryptjs'); } catch { missingDeps.push('bcryptjs'); }
try { require('uuid'); } catch { missingDeps.push('uuid'); }

if (missingDeps.length > 0) {
  console.log('❌ Dependências faltando. Execute:');
  console.log(`npm install ${missingDeps.join(' ')}`);
  process.exit(1);
}

// Verificar se a senha do DB foi fornecida
if (!process.env.DB_PASSWORD) {
  console.log('❌ Variável DB_PASSWORD não definida!');
  console.log('\nUso:');
  console.log('DB_PASSWORD=sua_senha node create-admin-direct.js');
  console.log('\nOu defina no .env:');
  console.log('DB_PASSWORD=sua_senha_rds');
  process.exit(1);
}

createFirstAdmin();
