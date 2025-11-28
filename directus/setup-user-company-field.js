/**
 * Adiciona campo company_id em directus_users (CommonJS)
 */

const {
  createDirectus,
  rest,
  authentication,
  createField,
  readFields
} = require('@directus/sdk');

const client = createDirectus(process.env.DIRECTUS_URL || 'http://localhost:8055')
  .with(authentication())
  .with(rest());

async function setupUserCompanyField() {
  console.log('🔑 Autenticando no Directus...');
  await client.login({
    email: process.env.ADMIN_EMAIL || 'marcus@admin.com',
    password: process.env.ADMIN_PASSWORD || 'Teste@123'
  });
  console.log('✅ Autenticado\n');

  console.log('🔍 Verificando se company_id já existe em directus_users...');
  const existingFields = await client.request(readFields('directus_users'));
  const companyField = existingFields.find((f) => f.field === 'company_id');

  if (companyField) {
    console.log('ℹ️  Campo company_id já existe. Nada a fazer.');
    return;
  }

  console.log('🛠️  Criando campo company_id...');
  await client.request(
    createField('directus_users', {
      field: 'company_id',
      type: 'integer',
      meta: {
        interface: 'select-dropdown-m2o',
        display: 'related-values',
        options: { template: '{{name}}' }
      },
      schema: {
        foreign_key_table: 'companies',
        foreign_key_column: 'id'
      }
    })
  );

  console.log('✅ Campo company_id criado em directus_users.');
}

setupUserCompanyField().catch((err) => {
  console.error('Erro ao configurar campo company_id:', err?.errors || err.message);
  process.exit(1);
});
