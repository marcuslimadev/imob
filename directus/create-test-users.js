/**
 * Cria usuários de teste para multi-tenant (Company Admin + Corretor)
 */

const {
  createDirectus,
  rest,
  authentication,
  createUser,
  readUsers,
  readRoles,
  updateUser,
  readItems
} = require('@directus/sdk');

const client = createDirectus(process.env.DIRECTUS_URL || 'http://localhost:8055')
  .with(authentication())
  .with(rest());

async function createTestUsers() {
  console.log('🔑 Autenticando no Directus...');
  await client.login({
    email: process.env.ADMIN_EMAIL || 'marcus@admin.com',
    password: process.env.ADMIN_PASSWORD || 'Teste@123'
  });
  console.log('✅ Autenticado\n');

  console.log('🔍 Buscando roles...');
  const roles = await client.request(readRoles());
  const saasAdminRole = roles.find((r) => r.name === 'SaaS Admin');
  const saasFinanceRole = roles.find((r) => r.name === 'SaaS Finance');
  const companyAdminRole = roles.find((r) => r.name === 'Company Admin');
  const corretorRole = roles.find((r) => r.name === 'Corretor');

  if (!saasAdminRole || !companyAdminRole || !corretorRole) {
    throw new Error('Roles não encontradas. Execute setup-roles.js primeiro.');
  }

  console.log('✅ Roles encontradas:', {
    saasAdmin: saasAdminRole.id,
    saasFinance: saasFinanceRole?.id,
    companyAdmin: companyAdminRole.id,
    corretor: corretorRole.id
  });

  const existingUsers = await client.request(readUsers());
  const companies = await client.request(readItems('companies', { limit: 10 }));
  const targetCompany =
    companies.find((c) => c.slug?.includes('exclus')) ||
    companies[0];

  if (!targetCompany) {
    throw new Error('Nenhuma company encontrada para vincular aos usuários de teste.');
  }

  const companyId = targetCompany.id;

  // Atualiza superadmin (SaaS) com role SaaS Admin e company_id para filtros
  const superAdminUser = existingUsers.find((u) => u.email === 'marcus@admin.com');
  if (superAdminUser) {
    try {
      await client.request(
        updateUser(superAdminUser.id, {
          company_id: companyId,
          role: saasAdminRole.id
        })
      );
      console.log('✅ SuperAdmin vinculado à company e role SaaS Admin');
    } catch (err) {
      console.log('ℹ️  Não foi possível atualizar SuperAdmin:', err.message);
    }
  }

  // Usuário SaaS Finance (opcional)
  const financeUser = existingUsers.find((u) => u.email === 'finance@imobi.com');
  if (!financeUser && saasFinanceRole) {
    await client.request(
      createUser({
        email: 'finance@imobi.com',
        first_name: 'Finance',
        last_name: 'SaaS',
        password: 'Teste@123',
        role: saasFinanceRole.id,
        status: 'active'
      })
    );
    console.log('✅ Usuário SaaS Finance criado (finance@imobi.com)');
  }

  const adminUser = existingUsers.find((u) => u.email === 'admin@exclusiva.com');
  const corretorUser = existingUsers.find((u) => u.email === 'corretor@exclusiva.com');

  if (adminUser) {
    await client.request(
      updateUser(adminUser.id, {
        role: companyAdminRole.id,
        company_id: companyId,
        status: 'active'
      })
    );
    console.log('✅ Usuário admin@exclusiva.com atualizado');
  } else {
    const newAdmin = await client.request(
      createUser({
        email: 'admin@exclusiva.com',
        first_name: 'Admin',
        last_name: 'Exclusiva',
        password: 'Teste@123',
        role: companyAdminRole.id,
        company_id: companyId,
        status: 'active'
      })
    );
    console.log('✅ Usuário Company Admin criado:', newAdmin.id);
  }

  if (corretorUser) {
    await client.request(
      updateUser(corretorUser.id, {
        role: corretorRole.id,
        company_id: companyId,
        status: 'active'
      })
    );
    console.log('✅ Usuário corretor@exclusiva.com atualizado');
  } else {
    const newCorretor = await client.request(
      createUser({
        email: 'corretor@exclusiva.com',
        first_name: 'Carlos',
        last_name: 'Vendedor',
        password: 'Teste@123',
        role: corretorRole.id,
        company_id: companyId,
        status: 'active'
      })
    );
    console.log('✅ Usuário Corretor criado:', newCorretor.id);
  }

  console.log('\nCredenciais de teste prontas:');
  console.log('- SaaS Admin: marcus@admin.com / Teste@123');
  if (saasFinanceRole) console.log('- SaaS Finance: finance@imobi.com / Teste@123');
  console.log('- Company Admin: admin@exclusiva.com / Teste@123');
  console.log('- Corretor: corretor@exclusiva.com / Teste@123');
  console.log(`- Empresa alvo: ${companyId}`);
}

createTestUsers().catch((err) => {
  console.error('Erro ao criar usuários de teste:', err?.errors || err.message);
  process.exit(1);
});
