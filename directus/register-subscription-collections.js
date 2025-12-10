/**
 * Registra collections de Subscription (Planos e Assinaturas SaaS)
 * 
 * Collections:
 * - subscription_plans: Planos disponíveis (Free, Starter, Pro, Enterprise)
 * - tenant_subscriptions: Assinaturas dos tenants
 * 
 * Execute: node register-subscription-collections.js
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

async function ensureCollection(name, payload) {
  try {
    await axios.get(`${DIRECTUS_URL}/collections/${name}`, { headers });
    console.log(`  ℹ️  Collection '${name}' já existe`);
    return true;
  } catch (e) {
    if (e.response?.status === 403) {
      console.log(`  ℹ️  Collection '${name}' já existe (403)`);
      return true;
    }
    await axios.post(`${DIRECTUS_URL}/collections`, payload, { headers });
    console.log(`  ✅ Collection '${name}' criada`);
    return false;
  }
}

async function ensureField(collection, field, payload) {
  try {
    await axios.get(`${DIRECTUS_URL}/fields/${collection}/${field}`, { headers });
    return;
  } catch (e) {
    if (e.response?.status !== 404) return;
    await axios.post(`${DIRECTUS_URL}/fields/${collection}`, payload, { headers });
    console.log(`    ✅ Field '${collection}.${field}' criado`);
  }
}

async function setupSubscriptions() {
  await auth();
  
  console.log('📋 Criando Collections de Subscription...\n');

  // =====================================================
  // SUBSCRIPTION_PLANS - Planos disponíveis
  // =====================================================
  await ensureCollection('subscription_plans', {
    collection: 'subscription_plans',
    meta: {
      collection: 'subscription_plans',
      icon: 'local_offer',
      note: 'Planos de assinatura do SaaS',
      display_template: '{{name}}',
      archive_field: 'status',
      archive_value: 'archived',
      unarchive_value: 'active',
      sort_field: 'sort',
      singleton: false,
      translations: null,
    },
    schema: {},
  });

  // Fields para subscription_plans
  const planFields = [
    {
      field: 'id',
      type: 'uuid',
      meta: { special: ['uuid'], interface: 'input', readonly: true, hidden: true },
      schema: { is_primary_key: true, has_auto_increment: false },
    },
    {
      field: 'status',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: { choices: [{ text: 'Ativo', value: 'active' }, { text: 'Arquivado', value: 'archived' }] },
        width: 'half',
      },
      schema: { default_value: 'active' },
    },
    {
      field: 'sort',
      type: 'integer',
      meta: { interface: 'input', hidden: true },
      schema: {},
    },
    {
      field: 'name',
      type: 'string',
      meta: { interface: 'input', width: 'half', required: true },
      schema: { is_nullable: false },
    },
    {
      field: 'slug',
      type: 'string',
      meta: { interface: 'input', width: 'half' },
      schema: { is_unique: true },
    },
    {
      field: 'description',
      type: 'text',
      meta: { interface: 'input-multiline', width: 'full' },
      schema: {},
    },
    {
      field: 'price_monthly',
      type: 'decimal',
      meta: { interface: 'input', width: 'half', note: 'Preço mensal em BRL' },
      schema: { numeric_precision: 10, numeric_scale: 2, default_value: 0 },
    },
    {
      field: 'price_yearly',
      type: 'decimal',
      meta: { interface: 'input', width: 'half', note: 'Preço anual em BRL' },
      schema: { numeric_precision: 10, numeric_scale: 2, default_value: 0 },
    },
    {
      field: 'trial_days',
      type: 'integer',
      meta: { interface: 'input', width: 'half', note: 'Dias de trial gratuito' },
      schema: { default_value: 14 },
    },
    {
      field: 'features',
      type: 'json',
      meta: { interface: 'input-code', options: { language: 'json' }, width: 'full', note: 'Lista de features do plano' },
      schema: {},
    },
    // Limites do plano
    {
      field: 'max_properties',
      type: 'integer',
      meta: { interface: 'input', width: 'half', note: 'Máximo de imóveis (null = ilimitado)' },
      schema: {},
    },
    {
      field: 'max_users',
      type: 'integer',
      meta: { interface: 'input', width: 'half', note: 'Máximo de usuários' },
      schema: {},
    },
    {
      field: 'max_leads',
      type: 'integer',
      meta: { interface: 'input', width: 'half', note: 'Máximo de leads/mês (null = ilimitado)' },
      schema: {},
    },
    {
      field: 'whatsapp_enabled',
      type: 'boolean',
      meta: { interface: 'boolean', width: 'half' },
      schema: { default_value: false },
    },
    {
      field: 'ai_enabled',
      type: 'boolean',
      meta: { interface: 'boolean', width: 'half', note: 'Automações com IA' },
      schema: { default_value: false },
    },
    {
      field: 'custom_domain_enabled',
      type: 'boolean',
      meta: { interface: 'boolean', width: 'half', note: 'Domínio personalizado' },
      schema: { default_value: false },
    },
    {
      field: 'api_access_enabled',
      type: 'boolean',
      meta: { interface: 'boolean', width: 'half', note: 'Acesso à API' },
      schema: { default_value: false },
    },
    {
      field: 'date_created',
      type: 'timestamp',
      meta: { special: ['date-created'], interface: 'datetime', readonly: true, width: 'half' },
      schema: {},
    },
    {
      field: 'date_updated',
      type: 'timestamp',
      meta: { special: ['date-updated'], interface: 'datetime', readonly: true, width: 'half' },
      schema: {},
    },
  ];

  for (const f of planFields) {
    await ensureField('subscription_plans', f.field, f);
  }

  // =====================================================
  // TENANT_SUBSCRIPTIONS - Assinaturas dos tenants
  // =====================================================
  await ensureCollection('tenant_subscriptions', {
    collection: 'tenant_subscriptions',
    meta: {
      collection: 'tenant_subscriptions',
      icon: 'receipt_long',
      note: 'Assinaturas das imobiliárias',
      display_template: '{{company_id.name}} - {{plan_id.name}}',
      singleton: false,
    },
    schema: {},
  });

  const subscriptionFields = [
    {
      field: 'id',
      type: 'uuid',
      meta: { special: ['uuid'], interface: 'input', readonly: true, hidden: true },
      schema: { is_primary_key: true, has_auto_increment: false },
    },
    {
      field: 'status',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: {
          choices: [
            { text: 'Trial', value: 'trial' },
            { text: 'Ativa', value: 'active' },
            { text: 'Pendente', value: 'pending' },
            { text: 'Cancelada', value: 'cancelled' },
            { text: 'Expirada', value: 'expired' },
            { text: 'Suspensa', value: 'suspended' },
          ],
        },
      },
      schema: { default_value: 'trial' },
    },
    {
      field: 'company_id',
      type: 'uuid',
      meta: {
        interface: 'select-dropdown-m2o',
        special: ['m2o'],
        width: 'half',
        required: true,
      },
      schema: { is_nullable: false, foreign_key_table: 'companies', foreign_key_column: 'id' },
    },
    {
      field: 'plan_id',
      type: 'uuid',
      meta: {
        interface: 'select-dropdown-m2o',
        special: ['m2o'],
        width: 'half',
        required: true,
      },
      schema: { is_nullable: false, foreign_key_table: 'subscription_plans', foreign_key_column: 'id' },
    },
    {
      field: 'billing_cycle',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: { choices: [{ text: 'Mensal', value: 'monthly' }, { text: 'Anual', value: 'yearly' }] },
      },
      schema: { default_value: 'monthly' },
    },
    {
      field: 'current_period_start',
      type: 'date',
      meta: { interface: 'datetime', width: 'half' },
      schema: {},
    },
    {
      field: 'current_period_end',
      type: 'date',
      meta: { interface: 'datetime', width: 'half' },
      schema: {},
    },
    {
      field: 'trial_ends_at',
      type: 'timestamp',
      meta: { interface: 'datetime', width: 'half', note: 'Data fim do trial' },
      schema: {},
    },
    {
      field: 'cancelled_at',
      type: 'timestamp',
      meta: { interface: 'datetime', width: 'half' },
      schema: {},
    },
    // Integração com gateway de pagamento
    {
      field: 'payment_gateway',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: { choices: [{ text: 'Mercado Pago', value: 'mercadopago' }, { text: 'Asaas', value: 'asaas' }] },
      },
      schema: {},
    },
    {
      field: 'gateway_subscription_id',
      type: 'string',
      meta: { interface: 'input', width: 'half', note: 'ID da assinatura no gateway' },
      schema: {},
    },
    {
      field: 'gateway_customer_id',
      type: 'string',
      meta: { interface: 'input', width: 'half', note: 'ID do cliente no gateway' },
      schema: {},
    },
    // Histórico
    {
      field: 'date_created',
      type: 'timestamp',
      meta: { special: ['date-created'], interface: 'datetime', readonly: true, width: 'half' },
      schema: {},
    },
    {
      field: 'date_updated',
      type: 'timestamp',
      meta: { special: ['date-updated'], interface: 'datetime', readonly: true, width: 'half' },
      schema: {},
    },
    {
      field: 'user_created',
      type: 'uuid',
      meta: { special: ['user-created'], interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      schema: {},
    },
  ];

  for (const f of subscriptionFields) {
    await ensureField('tenant_subscriptions', f.field, f);
  }

  console.log('\n📋 Seeding planos padrão...\n');

  // Seed dos planos padrão
  const defaultPlans = [
    {
      name: 'Free',
      slug: 'free',
      description: 'Plano gratuito para começar',
      price_monthly: 0,
      price_yearly: 0,
      trial_days: 0,
      max_properties: 10,
      max_users: 2,
      max_leads: 50,
      whatsapp_enabled: false,
      ai_enabled: false,
      custom_domain_enabled: false,
      api_access_enabled: false,
      features: JSON.stringify(['Até 10 imóveis', 'Até 2 usuários', 'Até 50 leads/mês', 'Suporte por email']),
    },
    {
      name: 'Starter',
      slug: 'starter',
      description: 'Ideal para imobiliárias pequenas',
      price_monthly: 99,
      price_yearly: 990,
      trial_days: 14,
      max_properties: 50,
      max_users: 5,
      max_leads: 200,
      whatsapp_enabled: true,
      ai_enabled: false,
      custom_domain_enabled: false,
      api_access_enabled: false,
      features: JSON.stringify(['Até 50 imóveis', 'Até 5 usuários', 'Até 200 leads/mês', 'WhatsApp integrado', 'Suporte prioritário']),
    },
    {
      name: 'Pro',
      slug: 'pro',
      description: 'Para imobiliárias em crescimento',
      price_monthly: 249,
      price_yearly: 2490,
      trial_days: 14,
      max_properties: 200,
      max_users: 15,
      max_leads: null, // ilimitado
      whatsapp_enabled: true,
      ai_enabled: true,
      custom_domain_enabled: true,
      api_access_enabled: false,
      features: JSON.stringify(['Até 200 imóveis', 'Até 15 usuários', 'Leads ilimitados', 'WhatsApp + IA', 'Domínio personalizado', 'Relatórios avançados']),
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Solução completa para grandes imobiliárias',
      price_monthly: 599,
      price_yearly: 5990,
      trial_days: 30,
      max_properties: null, // ilimitado
      max_users: null, // ilimitado
      max_leads: null,
      whatsapp_enabled: true,
      ai_enabled: true,
      custom_domain_enabled: true,
      api_access_enabled: true,
      features: JSON.stringify(['Imóveis ilimitados', 'Usuários ilimitados', 'Leads ilimitados', 'WhatsApp + IA avançada', 'Domínio personalizado', 'API completa', 'Suporte dedicado', 'Onboarding personalizado']),
    },
  ];

  for (const plan of defaultPlans) {
    try {
      const existing = await axios.get(`${DIRECTUS_URL}/items/subscription_plans`, {
        headers,
        params: { filter: { slug: { _eq: plan.slug } } },
      });
      if (existing.data.data.length > 0) {
        console.log(`  ℹ️  Plano '${plan.name}' já existe`);
        continue;
      }
      await axios.post(`${DIRECTUS_URL}/items/subscription_plans`, plan, { headers });
      console.log(`  ✅ Plano '${plan.name}' criado`);
    } catch (e) {
      console.error(`  ❌ Erro ao criar plano '${plan.name}':`, e.response?.data?.errors?.[0]?.message || e.message);
    }
  }

  console.log('\n✅ Collections de Subscription configuradas!\n');
}

setupSubscriptions().catch((err) => {
  console.error('❌ Erro:', err?.response?.data || err.message);
  process.exit(1);
});
