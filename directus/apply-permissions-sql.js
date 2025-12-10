/**
 * Aplica permissões multi-tenant via SQL direto no PostgreSQL
 * Mais confiável que tentar criar via API Directus
 */

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_DATABASE || 'directus',
  user: process.env.DB_USER || 'directus',
  password: process.env.DB_PASSWORD || 'directus',
});

async function main() {
  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL\n');

    // 1. Buscar policy ID (mesmo ID da role em Directus 11)
    const policyResult = await client.query(`
      SELECT id, name
      FROM directus_policies
      WHERE name = 'Company Admin'
      LIMIT 1
    `);

    if (policyResult.rows.length === 0) {
      console.log('❌ Policy "Company Admin" não encontrada.');
      console.log('Tentando criar...\n');
      
      // Buscar role
      const roleResult = await client.query(`
        SELECT id FROM directus_roles WHERE name = 'Company Admin' LIMIT 1
      `);
      
      if (roleResult.rows.length === 0) {
        console.log('❌ Role "Company Admin" também não encontrada.');
        console.log('Execute primeiro: docker compose exec directus node register-collections.js\n');
        return;
      }
      
      const roleId = roleResult.rows[0].id;
      
      // Criar policy com mesmo ID da role
      await client.query(`
        INSERT INTO directus_policies (id, name, icon, description, admin_access, app_access)
        VALUES ($1, 'Company Admin', 'business', 'Admin da imobiliária', false, false)
        ON CONFLICT (id) DO NOTHING
      `, [roleId]);
      
      console.log(`✅ Policy criada: ${roleId}\n`);
      var policyId = roleId;
    } else {
      var policyId = policyResult.rows[0].id;
      console.log(`✅ Policy encontrada: ${policyResult.rows[0].name}`);
      console.log(`   ID: ${policyId}\n`);
    }

    // 2. Deletar permissões antigas
    const deleteResult = await client.query(`
      DELETE FROM directus_permissions WHERE policy = $1
    `, [policyId]);
    console.log(`🗑️  ${deleteResult.rowCount} permissões antigas deletadas\n`);

    // 3. Inserir novas permissões
    const permissions = [
      // Companies
      { collection: 'companies', action: 'read', permissions: '{"id":{"_eq":"$CURRENT_USER.company_id"}}', fields: '*' },
      { collection: 'companies', action: 'update', permissions: '{"id":{"_eq":"$CURRENT_USER.company_id"}}', fields: '["nome_fantasia","email","telefone","logo","primary_color","secondary_color","custom_domain","storefront_template_id","theme_key"]' },
      
      // Properties
      { collection: 'properties', action: 'create', permissions: '{}', fields: '*', presets: '{"company_id":"$CURRENT_USER.company_id"}' },
      { collection: 'properties', action: 'read', permissions: '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', fields: '*' },
      { collection: 'properties', action: 'update', permissions: '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', fields: '*' },
      { collection: 'properties', action: 'delete', permissions: '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', fields: null },
      
      // Property Media
      { collection: 'property_media', action: 'create', permissions: '{}', fields: '*' },
      { collection: 'property_media', action: 'read', permissions: '{}', fields: '*' },
      { collection: 'property_media', action: 'delete', permissions: '{}', fields: null },
      
      // Leads
      { collection: 'leads', action: 'create', permissions: '{}', fields: '*', presets: '{"company_id":"$CURRENT_USER.company_id"}' },
      { collection: 'leads', action: 'read', permissions: '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', fields: '*' },
      { collection: 'leads', action: 'update', permissions: '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', fields: '*' },
      { collection: 'leads', action: 'delete', permissions: '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', fields: null },
      
      // Conversas
      { collection: 'conversas', action: 'create', permissions: '{}', fields: '*', presets: '{"company_id":"$CURRENT_USER.company_id"}' },
      { collection: 'conversas', action: 'read', permissions: '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', fields: '*' },
      { collection: 'conversas', action: 'update', permissions: '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', fields: '*' },
      
      // Mensagens
      { collection: 'mensagens', action: 'create', permissions: '{}', fields: '*' },
      { collection: 'mensagens', action: 'read', permissions: '{}', fields: '*' },
      
      // Lead Activities
      { collection: 'lead_activities', action: 'create', permissions: '{}', fields: '*' },
      { collection: 'lead_activities', action: 'read', permissions: '{}', fields: '*' },
      
      // Vistorias
      { collection: 'vistorias', action: 'create', permissions: '{}', fields: '*', presets: '{"company_id":"$CURRENT_USER.company_id"}' },
      { collection: 'vistorias', action: 'read', permissions: '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', fields: '*' },
      { collection: 'vistorias', action: 'update', permissions: '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', fields: '*' },
      { collection: 'vistorias', action: 'delete', permissions: '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', fields: null },
      
      // Vistoria Itens
      { collection: 'vistoria_itens', action: 'create', permissions: '{}', fields: '*' },
      { collection: 'vistoria_itens', action: 'read', permissions: '{}', fields: '*' },
      { collection: 'vistoria_itens', action: 'update', permissions: '{}', fields: '*' },
      { collection: 'vistoria_itens', action: 'delete', permissions: '{}', fields: null },
      
      // Vistoria Contestações
      { collection: 'vistoria_contestacoes', action: 'create', permissions: '{}', fields: '*' },
      { collection: 'vistoria_contestacoes', action: 'read', permissions: '{}', fields: '*' },
      { collection: 'vistoria_contestacoes', action: 'update', permissions: '{}', fields: '*' },
      
      // App Settings
      { collection: 'app_settings', action: 'read', permissions: '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', fields: '*' },
      { collection: 'app_settings', action: 'update', permissions: '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', fields: '*' },
      
      // Directus Files
      { collection: 'directus_files', action: 'create', permissions: '{}', fields: '*' },
      { collection: 'directus_files', action: 'read', permissions: '{}', fields: '*' },
      { collection: 'directus_files', action: 'update', permissions: '{}', fields: '*' },
      { collection: 'directus_files', action: 'delete', permissions: '{}', fields: null },
    ];

    console.log('📝 Inserindo permissões...\n');
    let created = 0;

    for (const perm of permissions) {
      try {
        await client.query(`
          INSERT INTO directus_permissions (policy, collection, action, permissions, fields, presets)
          VALUES ($1, $2, $3, $4::jsonb, $5, $6::jsonb)
        `, [
          policyId,
          perm.collection,
          perm.action,
          perm.permissions,
          perm.fields,
          perm.presets || null
        ]);
        console.log(`  ✅ ${perm.collection}.${perm.action}`);
        created++;
      } catch (error) {
        console.error(`  ❌ ${perm.collection}.${perm.action}: ${error.message}`);
      }
    }

    console.log(`\n✅ ${created}/${permissions.length} permissões criadas!\n`);

    // 4. Verificar resultado
    const verifyResult = await client.query(`
      SELECT collection, action, permissions, fields, presets
      FROM directus_permissions
      WHERE policy = $1
      ORDER BY collection, action
    `, [policyId]);

    console.log('📊 Permissões aplicadas:\n');
    console.table(verifyResult.rows.map(r => ({
      collection: r.collection,
      action: r.action,
      has_filter: r.permissions && Object.keys(r.permissions).length > 0 ? '✓' : '-',
      has_presets: r.presets && Object.keys(r.presets).length > 0 ? '✓' : '-'
    })));

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

main();
