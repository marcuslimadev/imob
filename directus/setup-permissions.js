/**
 * Setup de Permissions Multi-Tenant para iMOBI SaaS
 * Adiciona permissões com isolamento por company_id
 * 
 * Execute: node setup-permissions.js
 */

const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'marcus@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Teste@123';

let headers = {};

// Collections que precisam de isolamento por tenant (company_id)
const TENANT_COLLECTIONS = [
  'properties',
  'property_media',
  'property_views',
  'leads',
  'lead_activities',
  'conversas',
  'mensagens',
  'atividades',
  'app_settings',
  'vistorias',
  'vistoria_itens',
  'vistoria_solicitacoes',
  'vistoria_contestacoes',
  'documentos_assinatura',
  'documentos_signatarios',
];

// Condition padrão para isolamento multi-tenant
const TENANT_CONDITION = { company_id: { _eq: '$CURRENT_USER.company_id' } };

async function auth() {
  console.log('🔑 Fazendo login como admin...');
  const loginResponse = await axios.post(`${DIRECTUS_URL}/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  const token = loginResponse.data.data.access_token;
  headers = { Authorization: `Bearer ${token}` };
  console.log('✅ Login realizado!\n');
}

async function getPolicyId(policyName) {
  const resp = await axios.get(`${DIRECTUS_URL}/policies`, {
    headers,
    params: { filter: { name: { _eq: policyName } } },
  });
  return resp.data.data[0]?.id;
}

async function upsertPermission(perm) {
  try {
    const existing = await axios.get(`${DIRECTUS_URL}/permissions`, {
      headers,
      params: {
        filter: {
          policy: { _eq: perm.policy },
          collection: { _eq: perm.collection },
          action: { _eq: perm.action }
        }
      },
    });

    const match = existing.data.data[0];

    if (match) {
      await axios.patch(`${DIRECTUS_URL}/permissions/${match.id}`, perm, { headers });
      return 'updated';
    } else {
      await axios.post(`${DIRECTUS_URL}/permissions`, perm, { headers });
      return 'created';
    }
  } catch (error) {
    console.error(`    ❌ Erro: ${perm.collection}/${perm.action}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    return 'error';
  }
}

async function setupTenantAdminPermissions(policyId) {
  console.log('\n📋 Tenant Admin - Permissions Multi-Tenant...\n');

  // Companies - só lê/edita a própria
  console.log('  📁 companies...');
  await upsertPermission({
    policy: policyId,
    collection: 'companies',
    action: 'read',
    permissions: { id: { _eq: '$CURRENT_USER.company_id' } },
    fields: ['*'],
  });
  await upsertPermission({
    policy: policyId,
    collection: 'companies',
    action: 'update',
    permissions: { id: { _eq: '$CURRENT_USER.company_id' } },
    fields: ['name', 'email', 'phone', 'address', 'city', 'state', 'zip_code', 'logo', 'primary_color', 'secondary_color', 'custom_domain', 'storefront_template_id'],
  });

  // Collections com isolamento por company_id
  for (const collection of TENANT_COLLECTIONS) {
    console.log(`  📁 ${collection}...`);
    
    // READ
    await upsertPermission({
      policy: policyId,
      collection,
      action: 'read',
      permissions: TENANT_CONDITION,
      fields: ['*'],
    });

    // CREATE (preset company_id)
    await upsertPermission({
      policy: policyId,
      collection,
      action: 'create',
      presets: { company_id: '$CURRENT_USER.company_id' },
      fields: ['*'],
    });

    // UPDATE
    await upsertPermission({
      policy: policyId,
      collection,
      action: 'update',
      permissions: TENANT_CONDITION,
      fields: ['*'],
    });

    // DELETE
    await upsertPermission({
      policy: policyId,
      collection,
      action: 'delete',
      permissions: TENANT_CONDITION,
    });
  }

  // Files - sem isolamento mas com acesso
  console.log('  📁 directus_files...');
  await upsertPermission({
    policy: policyId,
    collection: 'directus_files',
    action: 'read',
    permissions: {},
    fields: ['*'],
  });
  await upsertPermission({
    policy: policyId,
    collection: 'directus_files',
    action: 'create',
    permissions: {},
    fields: ['*'],
  });
}

async function setupAgentPermissions(policyId) {
  console.log('\n📋 Agent - Permissions (Read-only + Leads atribuídos)...\n');

  // Properties - read only (todos do tenant)
  console.log('  📁 properties (read)...');
  await upsertPermission({
    policy: policyId,
    collection: 'properties',
    action: 'read',
    permissions: TENANT_CONDITION,
    fields: ['*'],
  });

  // Leads - só atribuídos ao agente
  console.log('  📁 leads (assigned)...');
  const agentLeadCondition = {
    _and: [
      { company_id: { _eq: '$CURRENT_USER.company_id' } },
      { assigned_to: { _eq: '$CURRENT_USER.id' } }
    ]
  };

  await upsertPermission({
    policy: policyId,
    collection: 'leads',
    action: 'read',
    permissions: agentLeadCondition,
    fields: ['*'],
  });
  await upsertPermission({
    policy: policyId,
    collection: 'leads',
    action: 'update',
    permissions: agentLeadCondition,
    fields: ['status', 'notes', 'last_contact'],
  });

  // Conversas - só dos seus leads
  console.log('  📁 conversas (assigned leads)...');
  await upsertPermission({
    policy: policyId,
    collection: 'conversas',
    action: 'read',
    permissions: TENANT_CONDITION,
    fields: ['*'],
  });

  // Files - read only
  await upsertPermission({
    policy: policyId,
    collection: 'directus_files',
    action: 'read',
    permissions: {},
    fields: ['*'],
  });
}

async function setupViewerPermissions(policyId) {
  console.log('\n📋 Viewer - Permissions (Read-only)...\n');

  const readOnlyCollections = [
    'companies',
    'properties',
    'leads',
    'vistorias',
    'documentos_assinatura',
  ];

  for (const collection of readOnlyCollections) {
    console.log(`  📁 ${collection} (read)...`);
    
    const condition = collection === 'companies' 
      ? { id: { _eq: '$CURRENT_USER.company_id' } }
      : TENANT_CONDITION;

    await upsertPermission({
      policy: policyId,
      collection,
      action: 'read',
      permissions: condition,
      fields: ['*'],
    });
  }
}

async function main() {
  try {
    await auth();

    // Tenant Admin
    const tenantAdminPolicyId = await getPolicyId('Tenant Admin Policy');
    if (tenantAdminPolicyId) {
      await setupTenantAdminPermissions(tenantAdminPolicyId);
      console.log('\n✅ Tenant Admin permissions configuradas!\n');
    } else {
      console.log('⚠️ Tenant Admin Policy não encontrada');
    }

    // Agent
    const agentPolicyId = await getPolicyId('Agent Policy');
    if (agentPolicyId) {
      await setupAgentPermissions(agentPolicyId);
      console.log('✅ Agent permissions configuradas!\n');
    } else {
      console.log('⚠️ Agent Policy não encontrada');
    }

    // Viewer
    const viewerPolicyId = await getPolicyId('Viewer Policy');
    if (viewerPolicyId) {
      await setupViewerPermissions(viewerPolicyId);
      console.log('✅ Viewer permissions configuradas!\n');
    } else {
      console.log('⚠️ Viewer Policy não encontrada');
    }

    console.log('🎉 Setup de permissions concluído!');

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    process.exit(1);
  }
}

main();
