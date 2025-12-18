/**
 * Configura roles/policies para separar backoffice (SaaS) do painel da imobiliária (frontend)
 * Roles criados:
 * - SaaS Admin: admin_access=true, app_access=true (você/time)
 * - SaaS Finance: app_access=true (financeiro/atendimento)
 * - Company Admin: app_access=false (usa só frontend)
 * - Corretor: app_access=false (usa só frontend)
 */

const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'd1r3ctu5';

async function auth() {
  console.log('🔑 Fazendo login como admin...');
  const loginResponse = await axios.post(`${DIRECTUS_URL}/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  const token = loginResponse.data.data.access_token;
  return { Authorization: `Bearer ${token}` };
}

async function ensureRole(headers, payload) {
  const rolesResp = await axios.get(`${DIRECTUS_URL}/roles`, { headers });
  const existing = rolesResp.data.data.find((r) => r.name === payload.name);
  if (existing) return existing;
  const created = await axios.post(`${DIRECTUS_URL}/roles`, payload, { headers });
  return created.data.data;
}

async function ensurePolicy(headers, payload) {
  const resp = await axios.get(`${DIRECTUS_URL}/policies`, {
    headers,
    params: { filter: { name: { _eq: payload.name } } },
  });
  const found = resp.data.data[0];
  if (found) return found;
  const created = await axios.post(`${DIRECTUS_URL}/policies`, payload, { headers });
  return created.data.data;
}

async function upsertPermission(headers, perm) {
  const existing = await axios.get(`${DIRECTUS_URL}/permissions`, {
    headers,
    params: { limit: -1 },
  });

  const match = existing.data.data.find(
    (p) =>
      p.policy === perm.policy &&
      p.collection === perm.collection &&
      p.action === perm.action
  );

  if (match) {
    await axios.patch(`${DIRECTUS_URL}/permissions/${match.id}`, perm, { headers });
  } else {
    await axios.post(`${DIRECTUS_URL}/permissions`, perm, { headers });
  }
}

async function setupRoles() {
  const headers = await auth();

  // Roles
  const saasAdmin = await ensureRole(headers, {
    name: 'SaaS Admin',
    description: 'Backoffice do produto (acesso total)',
    icon: 'shield',
    admin_access: true,
    app_access: true,
  });

  const saasFinance = await ensureRole(headers, {
    name: 'SaaS Finance',
    description: 'Financeiro/atendimento do SaaS',
    icon: 'attach_money',
    admin_access: false,
    app_access: true,
  });

  const companyAdmin = await ensureRole(headers, {
    name: 'Company Admin',
    description: 'Administrador da imobiliária (usa só frontend)',
    icon: 'business',
    admin_access: false,
    app_access: false,
  });

  const corretor = await ensureRole(headers, {
    name: 'Corretor',
    description: 'Corretor da imobiliária (usa só frontend)',
    icon: 'user',
    admin_access: false,
    app_access: false,
  });

  const publicPolicyResp = await axios.get(`${DIRECTUS_URL}/policies`, {
    headers,
    params: { filter: { name: { _eq: '$t:public_label' } } },
  });
  const publicPolicyId = publicPolicyResp.data.data[0]?.id;

  // Policies
  const saasAdminPolicy = await ensurePolicy(headers, {
    name: 'SaaS Admin Policy',
    icon: 'shield',
    description: 'Acesso total ao backoffice',
    admin_access: true,
    app_access: true,
    roles: [saasAdmin.id],
  });

  const saasFinancePolicy = await ensurePolicy(headers, {
    name: 'SaaS Finance Policy',
    icon: 'attach_money',
    description: 'Financeiro/atendimento SaaS',
    admin_access: false,
    app_access: true,
    roles: [saasFinance.id],
  });

  const companyAdminPolicy = await ensurePolicy(headers, {
    name: 'Company Admin Policy',
    icon: 'business',
    description: 'Acesso da imobiliária via API (frontend)',
    admin_access: false,
    app_access: false,
    roles: [companyAdmin.id],
  });

  const corretorPolicy = await ensurePolicy(headers, {
    name: 'Corretor Policy',
    icon: 'user',
    description: 'Corretor via API (frontend)',
    admin_access: false,
    app_access: false,
    roles: [corretor.id],
  });

  // Permissões Finance (backoffice parcial)
  const financePerms = [
    {
      policy: saasFinancePolicy.id,
      collection: 'companies',
      action: 'read',
      fields: ['*'],
    },
    {
      policy: saasFinancePolicy.id,
      collection: 'companies',
      action: 'update',
      fields: ['subscription_status', 'subscription_plan', 'subscription_expires_at', 'status', 'notes'],
    },
    {
      policy: saasFinancePolicy.id,
      collection: 'directus_users',
      action: 'read',
      fields: ['id', 'email', 'first_name', 'last_name', 'status', 'role', 'company_id'],
    },
    {
      policy: saasFinancePolicy.id,
      collection: 'directus_users',
      action: 'update',
      fields: ['status', 'company_id', 'role'],
    },
  ];

  // Permissões Company Admin (API)
  const adminPerms = [
    {
      policy: companyAdminPolicy.id,
      collection: 'companies',
      action: 'read',
      permissions: { id: { _eq: '$CURRENT_USER.company_id' } },
      fields: ['*'],
    },
    {
      policy: companyAdminPolicy.id,
      collection: 'companies',
      action: 'update',
      permissions: { id: { _eq: '$CURRENT_USER.company_id' } },
      fields: ['*'],
    },
    {
      policy: companyAdminPolicy.id,
      collection: 'properties',
      action: 'create',
      presets: { company_id: '$CURRENT_USER.company_id' },
      fields: ['*'],
    },
    {
      policy: companyAdminPolicy.id,
      collection: 'properties',
      action: 'read',
      permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
      fields: ['*'],
    },
    {
      policy: companyAdminPolicy.id,
      collection: 'properties',
      action: 'update',
      permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
      fields: ['*'],
    },
    {
      policy: companyAdminPolicy.id,
      collection: 'properties',
      action: 'delete',
      permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
    },
    {
      policy: companyAdminPolicy.id,
      collection: 'leads',
      action: 'create',
      presets: { company_id: '$CURRENT_USER.company_id' },
      fields: ['*'],
    },
    {
      policy: companyAdminPolicy.id,
      collection: 'leads',
      action: 'read',
      permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
      fields: ['*'],
    },
    {
      policy: companyAdminPolicy.id,
      collection: 'leads',
      action: 'update',
      permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
      fields: ['*'],
    },
    {
      policy: companyAdminPolicy.id,
      collection: 'lead_activities',
      action: 'create',
      presets: { company_id: '$CURRENT_USER.company_id' },
      fields: ['*'],
    },
    {
      policy: companyAdminPolicy.id,
      collection: 'lead_activities',
      action: 'read',
      permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
      fields: ['*'],
    },
    {
      policy: companyAdminPolicy.id,
      collection: 'lead_activities',
      action: 'update',
      permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
      fields: ['*'],
    },
    {
      policy: companyAdminPolicy.id,
      collection: 'property_media',
      action: 'create',
      presets: { company_id: '$CURRENT_USER.company_id' },
      fields: ['*'],
    },
    {
      policy: companyAdminPolicy.id,
      collection: 'property_media',
      action: 'read',
      permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
      fields: ['*'],
    },
    {
      policy: companyAdminPolicy.id,
      collection: 'property_media',
      action: 'delete',
      permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
    },
  ];

  // Permissões Corretor (API, mais restrito)
  const corretorPerms = [
    {
      policy: corretorPolicy.id,
      collection: 'companies',
      action: 'read',
      permissions: { id: { _eq: '$CURRENT_USER.company_id' } },
      fields: ['id', 'name', 'slug', 'primary_color', 'secondary_color', 'logo'],
    },
    {
      policy: corretorPolicy.id,
      collection: 'properties',
      action: 'read',
      permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
      fields: ['*'],
    },
    {
      policy: corretorPolicy.id,
      collection: 'leads',
      action: 'read',
      permissions: {
        _and: [
          { company_id: { _eq: '$CURRENT_USER.company_id' } },
          { assigned_to: { _eq: '$CURRENT_USER' } },
        ],
      },
      fields: ['*'],
    },
    {
      policy: corretorPolicy.id,
      collection: 'lead_activities',
      action: 'create',
      presets: { company_id: '$CURRENT_USER.company_id' },
      fields: ['*'],
    },
    {
      policy: corretorPolicy.id,
      collection: 'lead_activities',
      action: 'read',
      permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
      fields: ['*'],
    },
  ];

  // Pública (vitrine)
  const publicPerms = publicPolicyId
    ? [
        {
          policy: publicPolicyId,
          collection: 'properties',
          action: 'read',
          permissions: { status: { _eq: 'active' } },
          fields: ['id', 'title', 'city', 'state', 'price_sale', 'price_rent', 'cover_image', 'company_id'],
        },
        {
          policy: publicPolicyId,
          collection: 'companies',
          action: 'read',
          permissions: null,
          fields: ['id', 'name', 'slug', 'logo', 'primary_color', 'secondary_color'],
        },
      ]
    : [];

  console.log('🔧 Gravando permissões...');
  for (const perm of [...financePerms, ...adminPerms, ...corretorPerms, ...publicPerms]) {
    await upsertPermission(headers, perm);
  }

  console.log('✅ Roles e permissões aplicadas com separação backoffice vs. cliente.');
}

setupRoles().catch((err) => {
  console.error('Erro ao configurar roles:', err?.response?.data || err.message);
  process.exit(1);
});
