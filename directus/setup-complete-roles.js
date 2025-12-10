/**
 * Setup completo de Roles e Permissions para o SaaS Multi-Tenant
 * 
 * Roles criados:
 * - Platform Super Admin: Acesso total à plataforma
 * - SaaS Admin: Equipe de backoffice
 * - SaaS Finance: Financeiro/atendimento
 * - Tenant Admin (Company Admin): Administrador da imobiliária
 * - Agent (Corretor): Corretor com leads atribuídos
 * - Assistant: Suporte/atendente da imobiliária
 * - Viewer: Somente visualização
 * 
 * Execute: node setup-complete-roles.js
 */

const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'marcus@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Teste@123';

let headers = {};

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

async function ensureRole(payload) {
  const rolesResp = await axios.get(`${DIRECTUS_URL}/roles`, { headers });
  const existing = rolesResp.data.data.find((r) => r.name === payload.name);
  if (existing) {
    console.log(`  ℹ️  Role '${payload.name}' já existe`);
    return existing;
  }
  const created = await axios.post(`${DIRECTUS_URL}/roles`, payload, { headers });
  console.log(`  ✅ Role '${payload.name}' criada`);
  return created.data.data;
}

async function ensurePolicy(payload) {
  const resp = await axios.get(`${DIRECTUS_URL}/policies`, {
    headers,
    params: { filter: { name: { _eq: payload.name } } },
  });
  const found = resp.data.data[0];
  if (found) {
    console.log(`  ℹ️  Policy '${payload.name}' já existe`);
    return found;
  }
  const created = await axios.post(`${DIRECTUS_URL}/policies`, payload, { headers });
  console.log(`  ✅ Policy '${payload.name}' criada`);
  return created.data.data;
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
    } else {
      await axios.post(`${DIRECTUS_URL}/permissions`, perm, { headers });
    }
  } catch (error) {
    console.error(`  ❌ Erro na permission ${perm.collection}/${perm.action}:`, error.response?.data?.errors?.[0]?.message || error.message);
  }
}

// Collections que precisam de isolamento por tenant (company_id)
const TENANT_COLLECTIONS = [
  'properties',
  'property_media',
  'property_views',
  'leads',
  'lead_activities',
  'lead_property_matches',
  'conversas',
  'mensagens',
  'atividades',
  'app_settings',
  'webhooks_log',
  'vistorias',
  'vistoria_itens',
  'vistoria_solicitacoes',
  'vistoria_contestacoes',
  'documentos_assinatura',
  'documentos_signatarios',
  'contratos',
];

// Condition padrão para isolamento multi-tenant
const TENANT_CONDITION = { company_id: { _eq: '$CURRENT_USER.company_id' } };

async function setupRoles() {
  await auth();
  
  console.log('📋 Criando Roles...\n');

  // 1. Platform Super Admin (acesso total)
  const platformSuperAdmin = await ensureRole({
    name: 'Platform Super Admin',
    description: 'Acesso total à plataforma SaaS - gestão de todos os tenants',
    icon: 'admin_panel_settings',
    admin_access: true,
    app_access: true,
  });

  // 2. SaaS Admin (equipe de produto)
  const saasAdmin = await ensureRole({
    name: 'SaaS Admin',
    description: 'Backoffice do produto - suporte e operações',
    icon: 'shield',
    admin_access: true,
    app_access: true,
  });

  // 3. SaaS Finance
  const saasFinance = await ensureRole({
    name: 'SaaS Finance',
    description: 'Financeiro/atendimento do SaaS',
    icon: 'attach_money',
    admin_access: false,
    app_access: true,
  });

  // 4. Tenant Admin (Company Admin)
  const tenantAdmin = await ensureRole({
    name: 'Tenant Admin',
    description: 'Administrador da imobiliária - acesso completo ao tenant',
    icon: 'business',
    admin_access: false,
    app_access: false, // Usa só frontend/API
  });

  // 5. Agent (Corretor)
  const agent = await ensureRole({
    name: 'Agent',
    description: 'Corretor - acesso a leads atribuídos e imóveis',
    icon: 'real_estate_agent',
    admin_access: false,
    app_access: false,
  });

  // 6. Assistant
  const assistant = await ensureRole({
    name: 'Assistant',
    description: 'Assistente/atendente - suporte operacional limitado',
    icon: 'support_agent',
    admin_access: false,
    app_access: false,
  });

  // 7. Viewer
  const viewer = await ensureRole({
    name: 'Viewer',
    description: 'Somente visualização - relatórios e consultas',
    icon: 'visibility',
    admin_access: false,
    app_access: false,
  });

  console.log('\n📋 Criando Policies...\n');

  // Policies para cada role
  const tenantAdminPolicy = await ensurePolicy({
    name: 'Tenant Admin Policy',
    icon: 'business',
    description: 'Acesso completo ao tenant via API',
    admin_access: false,
    app_access: false,
    roles: [tenantAdmin.id],
  });

  const agentPolicy = await ensurePolicy({
    name: 'Agent Policy',
    icon: 'real_estate_agent',
    description: 'Corretor - leads atribuídos e imóveis',
    admin_access: false,
    app_access: false,
    roles: [agent.id],
  });

  const assistantPolicy = await ensurePolicy({
    name: 'Assistant Policy',
    icon: 'support_agent',
    description: 'Assistente - operacional limitado',
    admin_access: false,
    app_access: false,
    roles: [assistant.id],
  });

  const viewerPolicy = await ensurePolicy({
    name: 'Viewer Policy',
    icon: 'visibility',
    description: 'Somente leitura',
    admin_access: false,
    app_access: false,
    roles: [viewer.id],
  });

  console.log('\n📋 Configurando Permissions...\n');

  // =====================================================
  // TENANT ADMIN - Acesso completo ao próprio tenant
  // =====================================================
  console.log('  🔧 Tenant Admin permissions...');
  
  // Companies - só lê/edita a própria
  await upsertPermission({
    policy: tenantAdminPolicy.id,
    collection: 'companies',
    action: 'read',
    permissions: { id: { _eq: '$CURRENT_USER.company_id' } },
    fields: ['*'],
  });
  await upsertPermission({
    policy: tenantAdminPolicy.id,
    collection: 'companies',
    action: 'update',
    permissions: { id: { _eq: '$CURRENT_USER.company_id' } },
    fields: ['name', 'email', 'phone', 'address', 'city', 'state', 'zip_code', 'logo', 'primary_color', 'secondary_color', 'custom_domain', 'storefront_template_id'],
  });

  // Todas as collections tenant-scoped
  for (const collection of TENANT_COLLECTIONS) {
    // CREATE
    await upsertPermission({
      policy: tenantAdminPolicy.id,
      collection,
      action: 'create',
      presets: { company_id: '$CURRENT_USER.company_id' },
      fields: ['*'],
    });
    // READ
    await upsertPermission({
      policy: tenantAdminPolicy.id,
      collection,
      action: 'read',
      permissions: TENANT_CONDITION,
      fields: ['*'],
    });
    // UPDATE
    await upsertPermission({
      policy: tenantAdminPolicy.id,
      collection,
      action: 'update',
      permissions: TENANT_CONDITION,
      fields: ['*'],
    });
    // DELETE
    await upsertPermission({
      policy: tenantAdminPolicy.id,
      collection,
      action: 'delete',
      permissions: TENANT_CONDITION,
    });
  }

  // Directus Files - upload de imagens
  await upsertPermission({
    policy: tenantAdminPolicy.id,
    collection: 'directus_files',
    action: 'create',
    fields: ['*'],
  });
  await upsertPermission({
    policy: tenantAdminPolicy.id,
    collection: 'directus_files',
    action: 'read',
    fields: ['*'],
  });

  // =====================================================
  // AGENT - Corretor com acesso limitado
  // =====================================================
  console.log('  🔧 Agent permissions...');

  // Só lê a empresa
  await upsertPermission({
    policy: agentPolicy.id,
    collection: 'companies',
    action: 'read',
    permissions: { id: { _eq: '$CURRENT_USER.company_id' } },
    fields: ['id', 'name', 'slug', 'logo', 'primary_color'],
  });

  // Lê todos os imóveis do tenant
  await upsertPermission({
    policy: agentPolicy.id,
    collection: 'properties',
    action: 'read',
    permissions: TENANT_CONDITION,
    fields: ['*'],
  });

  // Leads - só os atribuídos a ele
  const agentLeadCondition = {
    _and: [
      { company_id: { _eq: '$CURRENT_USER.company_id' } },
      { assigned_to: { _eq: '$CURRENT_USER' } },
    ],
  };
  await upsertPermission({
    policy: agentPolicy.id,
    collection: 'leads',
    action: 'read',
    permissions: agentLeadCondition,
    fields: ['*'],
  });
  await upsertPermission({
    policy: agentPolicy.id,
    collection: 'leads',
    action: 'update',
    permissions: agentLeadCondition,
    fields: ['stage', 'status', 'notes', 'last_contact_at'],
  });

  // Cria atividades
  await upsertPermission({
    policy: agentPolicy.id,
    collection: 'lead_activities',
    action: 'create',
    presets: { company_id: '$CURRENT_USER.company_id', created_by: '$CURRENT_USER' },
    fields: ['*'],
  });
  await upsertPermission({
    policy: agentPolicy.id,
    collection: 'lead_activities',
    action: 'read',
    permissions: TENANT_CONDITION,
    fields: ['*'],
  });

  // Lê conversas
  await upsertPermission({
    policy: agentPolicy.id,
    collection: 'conversas',
    action: 'read',
    permissions: TENANT_CONDITION,
    fields: ['*'],
  });
  await upsertPermission({
    policy: agentPolicy.id,
    collection: 'mensagens',
    action: 'read',
    permissions: TENANT_CONDITION,
    fields: ['*'],
  });

  // =====================================================
  // ASSISTANT - Suporte operacional
  // =====================================================
  console.log('  🔧 Assistant permissions...');

  await upsertPermission({
    policy: assistantPolicy.id,
    collection: 'companies',
    action: 'read',
    permissions: { id: { _eq: '$CURRENT_USER.company_id' } },
    fields: ['id', 'name', 'slug'],
  });

  // Lê imóveis e leads
  for (const col of ['properties', 'leads', 'conversas', 'mensagens']) {
    await upsertPermission({
      policy: assistantPolicy.id,
      collection: col,
      action: 'read',
      permissions: TENANT_CONDITION,
      fields: ['*'],
    });
  }

  // Pode criar atividades
  await upsertPermission({
    policy: assistantPolicy.id,
    collection: 'lead_activities',
    action: 'create',
    presets: { company_id: '$CURRENT_USER.company_id' },
    fields: ['*'],
  });
  await upsertPermission({
    policy: assistantPolicy.id,
    collection: 'lead_activities',
    action: 'read',
    permissions: TENANT_CONDITION,
    fields: ['*'],
  });

  // =====================================================
  // VIEWER - Somente leitura
  // =====================================================
  console.log('  🔧 Viewer permissions...');

  await upsertPermission({
    policy: viewerPolicy.id,
    collection: 'companies',
    action: 'read',
    permissions: { id: { _eq: '$CURRENT_USER.company_id' } },
    fields: ['id', 'name', 'slug'],
  });

  for (const col of ['properties', 'leads', 'lead_activities', 'conversas', 'mensagens', 'atividades']) {
    await upsertPermission({
      policy: viewerPolicy.id,
      collection: col,
      action: 'read',
      permissions: TENANT_CONDITION,
      fields: ['*'],
    });
  }

  console.log('\n✅ Roles e Permissions configurados com sucesso!\n');
  console.log('📋 Roles disponíveis:');
  console.log('  - Platform Super Admin (admin total)');
  console.log('  - SaaS Admin (backoffice)');
  console.log('  - SaaS Finance (financeiro)');
  console.log('  - Tenant Admin (admin da imobiliária)');
  console.log('  - Agent (corretor)');
  console.log('  - Assistant (atendente)');
  console.log('  - Viewer (somente leitura)');
}

setupRoles().catch((err) => {
  console.error('❌ Erro:', err?.response?.data || err.message);
  process.exit(1);
});
