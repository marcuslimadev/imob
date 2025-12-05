/**
 * Tenant Onboarding Endpoint
 * 
 * Endpoints para criação e gestão de tenants (imobiliárias)
 * 
 * POST /tenants/onboard - Cria novo tenant + admin user + subscription trial
 * GET /tenants/:id/stats - Estatísticas do tenant
 * POST /tenants/:id/upgrade - Upgrade de plano
 */

const crypto = require('crypto');
const { getCompanySettings, getCompanySettingsById } = require('../../shared/company-settings.js');

module.exports = (router, { env, logger, services, database }) => {
  const { ItemsService, UsersService, RolesService, MailService } = services;

  /**
   * POST /tenants/onboard
   * 
   * Cria um novo tenant com:
   * - Company (imobiliária)
   * - Admin user
   * - App settings
   * - Subscription trial
   */
  router.post('/onboard', async (req, res) => {
    try {
      const { 
        company_name,
        company_email,
        company_phone,
        admin_name,
        admin_email,
        admin_password,
        plan_slug = 'starter' // Default: Starter com trial
      } = req.body;

      // Validações
      if (!company_name || !admin_email || !admin_password) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: company_name, admin_email, admin_password'
        });
      }

      // Gera slug único
      const baseSlug = company_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      let slug = baseSlug;
      let counter = 1;

      // Verifica se slug já existe
      const companiesService = new ItemsService('companies', { 
        knex: database, 
        schema: req.schema,
        accountability: { admin: true }
      });

      while (true) {
        const existing = await companiesService.readByQuery({
          filter: { slug: { _eq: slug } },
          limit: 1
        });
        if (existing.length === 0) break;
        slug = `${baseSlug}-${counter++}`;
      }

      logger.info(`[Onboard] Criando tenant: ${company_name} (${slug})`);

      // 1. Cria a company
      const companyId = await companiesService.createOne({
        name: company_name,
        slug: slug,
        email: company_email || admin_email,
        phone: company_phone,
        status: 'active',
        date_created: new Date().toISOString(),
      });

      logger.info(`[Onboard] Company criada: ${companyId}`);

      // 2. Cria app_settings para a company
      const settingsService = new ItemsService('app_settings', {
        knex: database,
        schema: req.schema,
        accountability: { admin: true }
      });

      await settingsService.createOne({
        company_id: companyId,
        openai_model: 'gpt-4o-mini',
        date_created: new Date().toISOString(),
      });

      // 3. Busca o role "Tenant Admin"
      const rolesService = new RolesService({
        knex: database,
        schema: req.schema,
        accountability: { admin: true }
      });

      const roles = await rolesService.readByQuery({
        filter: { name: { _eq: 'Tenant Admin' } },
        limit: 1
      });

      const tenantAdminRoleId = roles[0]?.id;
      if (!tenantAdminRoleId) {
        logger.warn('[Onboard] Role "Tenant Admin" não encontrado - usando role padrão');
      }

      // 4. Cria o admin user
      const usersService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: { admin: true }
      });

      const userId = await usersService.createOne({
        email: admin_email,
        password: admin_password,
        first_name: admin_name?.split(' ')[0] || 'Admin',
        last_name: admin_name?.split(' ').slice(1).join(' ') || '',
        role: tenantAdminRoleId,
        company_id: companyId,
        status: 'active',
      });

      logger.info(`[Onboard] Admin user criado: ${userId}`);

      // 5. Busca o plano e cria subscription
      const plansService = new ItemsService('subscription_plans', {
        knex: database,
        schema: req.schema,
        accountability: { admin: true }
      });

      const plans = await plansService.readByQuery({
        filter: { slug: { _eq: plan_slug } },
        limit: 1
      });

      if (plans.length > 0) {
        const plan = plans[0];
        const subscriptionsService = new ItemsService('tenant_subscriptions', {
          knex: database,
          schema: req.schema,
          accountability: { admin: true }
        });

        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + (plan.trial_days || 14));

        await subscriptionsService.createOne({
          company_id: companyId,
          plan_id: plan.id,
          status: 'trial',
          billing_cycle: 'monthly',
          current_period_start: new Date().toISOString(),
          current_period_end: trialEndsAt.toISOString(),
          trial_ends_at: trialEndsAt.toISOString(),
        });

        logger.info(`[Onboard] Subscription trial criada: ${plan.name}`);
      }

      // 6. Envia email de boas-vindas (opcional)
      try {
        const mailService = new MailService({ schema: req.schema });
        await mailService.send({
          to: admin_email,
          subject: `Bem-vindo ao iMOBI - ${company_name}`,
          template: {
            name: 'welcome',
            data: {
              company_name,
              admin_email,
              login_url: `https://${slug}.imobi.com.br/login`,
            }
          }
        });
      } catch (mailError) {
        logger.warn('[Onboard] Erro ao enviar email de boas-vindas:', mailError.message);
      }

      return res.json({
        success: true,
        data: {
          company: {
            id: companyId,
            name: company_name,
            slug: slug,
          },
          user: {
            id: userId,
            email: admin_email,
          },
          login_url: `https://${slug}.imobi.com.br/login`,
          panel_url: `https://${slug}.imobi.com.br/empresa/dashboard`,
        }
      });

    } catch (error) {
      logger.error('[Onboard] Erro:', error);

      // Trata erros conhecidos
      if (error.message?.includes('unique') || error.code === '23505') {
        return res.status(400).json({
          success: false,
          error: 'Email já cadastrado ou slug duplicado'
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /tenants/:id/stats
   * 
   * Retorna estatísticas do tenant (para dashboard admin)
   */
  router.get('/:id/stats', async (req, res) => {
    try {
      const { id } = req.params;

      const filter = { company_id: { _eq: id } };

      // Properties
      const propertiesService = new ItemsService('properties', {
        knex: database,
        schema: req.schema,
        accountability: { admin: true }
      });
      const propertiesCount = await propertiesService.readByQuery({
        filter,
        aggregate: { count: '*' }
      });

      // Leads
      const leadsService = new ItemsService('leads', {
        knex: database,
        schema: req.schema,
        accountability: { admin: true }
      });
      const leadsCount = await leadsService.readByQuery({
        filter,
        aggregate: { count: '*' }
      });

      // Leads do mês
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const leadsThisMonth = await leadsService.readByQuery({
        filter: {
          _and: [
            { company_id: { _eq: id } },
            { date_created: { _gte: startOfMonth.toISOString() } }
          ]
        },
        aggregate: { count: '*' }
      });

      // Conversas ativas
      const conversasService = new ItemsService('conversas', {
        knex: database,
        schema: req.schema,
        accountability: { admin: true }
      });
      const activeConversations = await conversasService.readByQuery({
        filter: {
          _and: [
            { company_id: { _eq: id } },
            { status: { _eq: 'active' } }
          ]
        },
        aggregate: { count: '*' }
      });

      // Users da company
      const usersService = new UsersService({
        knex: database,
        schema: req.schema,
        accountability: { admin: true }
      });
      const usersCount = await usersService.readByQuery({
        filter: { company_id: { _eq: id } },
        aggregate: { count: '*' }
      });

      return res.json({
        success: true,
        data: {
          properties: propertiesCount[0]?.count || 0,
          leads: leadsCount[0]?.count || 0,
          leads_this_month: leadsThisMonth[0]?.count || 0,
          active_conversations: activeConversations[0]?.count || 0,
          users: usersCount[0]?.count || 0,
        }
      });

    } catch (error) {
      logger.error('[Stats] Erro:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /tenants/:id/upgrade
   * 
   * Faz upgrade do plano do tenant
   */
  router.post('/:id/upgrade', async (req, res) => {
    try {
      const { id } = req.params;
      const { plan_slug, payment_gateway, gateway_subscription_id, gateway_customer_id } = req.body;

      if (!plan_slug) {
        return res.status(400).json({
          success: false,
          error: 'plan_slug é obrigatório'
        });
      }

      // Busca o novo plano
      const plansService = new ItemsService('subscription_plans', {
        knex: database,
        schema: req.schema,
        accountability: { admin: true }
      });

      const plans = await plansService.readByQuery({
        filter: { slug: { _eq: plan_slug } },
        limit: 1
      });

      if (plans.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Plano não encontrado'
        });
      }

      const plan = plans[0];

      // Busca subscription atual
      const subscriptionsService = new ItemsService('tenant_subscriptions', {
        knex: database,
        schema: req.schema,
        accountability: { admin: true }
      });

      const currentSubs = await subscriptionsService.readByQuery({
        filter: { 
          company_id: { _eq: id },
          status: { _in: ['trial', 'active'] }
        },
        limit: 1
      });

      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      if (currentSubs.length > 0) {
        // Atualiza subscription existente
        await subscriptionsService.updateOne(currentSubs[0].id, {
          plan_id: plan.id,
          status: 'active',
          payment_gateway,
          gateway_subscription_id,
          gateway_customer_id,
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
          trial_ends_at: null,
        });
      } else {
        // Cria nova subscription
        await subscriptionsService.createOne({
          company_id: id,
          plan_id: plan.id,
          status: 'active',
          billing_cycle: 'monthly',
          payment_gateway,
          gateway_subscription_id,
          gateway_customer_id,
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
        });
      }

      logger.info(`[Upgrade] Tenant ${id} upgrade para plano ${plan.name}`);

      return res.json({
        success: true,
        data: {
          plan: {
            id: plan.id,
            name: plan.name,
            slug: plan.slug,
          },
          status: 'active',
          period_end: periodEnd.toISOString(),
        }
      });

    } catch (error) {
      logger.error('[Upgrade] Erro:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
};
