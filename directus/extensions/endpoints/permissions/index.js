/**
 * Extension endpoint para aplicar permissões multi-tenant
 * Executa com permissões de sistema
 */

module.exports = function registerEndpoint(router, { services, database }) {
  const { ItemsService, RolesService } = services;

  router.post('/setup-permissions', async (req, res) => {
    try {
      const { RolesService, PoliciesService, PermissionsService, UsersService } = services;
      const accountability = {
        admin: true,
        role: null,
        user: null,
      };

      console.log('🔐 Iniciando setup de permissões...');

      // 1. Buscar/criar role Company Admin
      const rolesService = new RolesService({ schema: req.schema, accountability });
      let companyAdminRole;
      
      try {
        const roles = await rolesService.readByQuery({
          filter: { name: { _eq: 'Company Admin' } },
          limit: 1
        });
        
        if (roles.length > 0) {
          companyAdminRole = roles[0];
          console.log(`✅ Role 'Company Admin' encontrada: ${companyAdminRole.id}`);
        } else {
          companyAdminRole = await rolesService.createOne({
            name: 'Company Admin',
            description: 'Administrador da imobiliária',
            icon: 'business',
            admin_access: false,
            app_access: false
          });
          console.log(`✅ Role 'Company Admin' criada: ${companyAdminRole}`);
        }
      } catch (error) {
        console.error('❌ Erro ao criar/buscar role:', error.message);
        throw error;
      }

      // 2. Buscar/criar policy
      const policiesService = new PoliciesService({ schema: req.schema, accountability });
      let policy;
      
      try {
        const policies = await policiesService.readByQuery({
          filter: { name: { _eq: 'Company Admin Policy' } },
          limit: 1
        });

        if (policies.length > 0) {
          policy = policies[0];
          console.log(`✅ Policy encontrada: ${policy.id}`);
        } else {
          policy = await policiesService.createOne({
            name: 'Company Admin Policy',
            description: 'Permissões de administrador da imobiliária',
            icon: 'admin_panel_settings',
            admin_access: false,
            app_access: false,
            roles: [typeof companyAdminRole === 'string' ? companyAdminRole : companyAdminRole.id]
          });
          console.log(`✅ Policy criada: ${policy}`);
        }
      } catch (error) {
        console.error('❌ Erro ao criar/buscar policy:', error.message);
        throw error;
      }

      const policyId = typeof policy === 'string' ? policy : policy.id;

      // 3. Aplicar permissões
      const permissionsService = new PermissionsService({ schema: req.schema, accountability });
      
      const permissions = [
        // Companies - apenas sua própria empresa
        {
          collection: 'companies',
          action: 'read',
          permissions: { id: { _eq: '$CURRENT_USER.company_id' } },
          fields: ['*']
        },
        {
          collection: 'companies',
          action: 'update',
          permissions: { id: { _eq: '$CURRENT_USER.company_id' } },
          fields: ['nome_fantasia', 'email', 'telefone', 'logo', 'primary_color', 'secondary_color', 'custom_domain', 'storefront_template_id', 'theme_key']
        },
        // Properties - CRUD completo filtrado por company_id
        {
          collection: 'properties',
          action: 'create',
          permissions: {},
          fields: ['*'],
          presets: { company_id: '$CURRENT_USER.company_id' }
        },
        {
          collection: 'properties',
          action: 'read',
          permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
          fields: ['*']
        },
        {
          collection: 'properties',
          action: 'update',
          permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
          fields: ['*']
        },
        {
          collection: 'properties',
          action: 'delete',
          permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } }
        },
        // Property Media
        {
          collection: 'property_media',
          action: 'create',
          permissions: {},
          fields: ['*']
        },
        {
          collection: 'property_media',
          action: 'read',
          permissions: {},
          fields: ['*']
        },
        {
          collection: 'property_media',
          action: 'delete',
          permissions: {}
        },
        // Leads - CRUD completo
        {
          collection: 'leads',
          action: 'create',
          permissions: {},
          fields: ['*'],
          presets: { company_id: '$CURRENT_USER.company_id' }
        },
        {
          collection: 'leads',
          action: 'read',
          permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
          fields: ['*']
        },
        {
          collection: 'leads',
          action: 'update',
          permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
          fields: ['*']
        },
        {
          collection: 'leads',
          action: 'delete',
          permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } }
        },
        // Conversas - CRUD completo
        {
          collection: 'conversas',
          action: 'create',
          permissions: {},
          fields: ['*'],
          presets: { company_id: '$CURRENT_USER.company_id' }
        },
        {
          collection: 'conversas',
          action: 'read',
          permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
          fields: ['*']
        },
        {
          collection: 'conversas',
          action: 'update',
          permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
          fields: ['*']
        },
        // Mensagens
        {
          collection: 'mensagens',
          action: 'create',
          permissions: {},
          fields: ['*']
        },
        {
          collection: 'mensagens',
          action: 'read',
          permissions: {},
          fields: ['*']
        },
        // Lead Activities
        {
          collection: 'lead_activities',
          action: 'create',
          permissions: {},
          fields: ['*']
        },
        {
          collection: 'lead_activities',
          action: 'read',
          permissions: {},
          fields: ['*']
        },
        // Vistorias
        {
          collection: 'vistorias',
          action: 'create',
          permissions: {},
          fields: ['*'],
          presets: { company_id: '$CURRENT_USER.company_id' }
        },
        {
          collection: 'vistorias',
          action: 'read',
          permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
          fields: ['*']
        },
        {
          collection: 'vistorias',
          action: 'update',
          permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
          fields: ['*']
        },
        {
          collection: 'vistorias',
          action: 'delete',
          permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } }
        },
        // Vistoria Itens
        {
          collection: 'vistoria_itens',
          action: 'create',
          permissions: {},
          fields: ['*']
        },
        {
          collection: 'vistoria_itens',
          action: 'read',
          permissions: {},
          fields: ['*']
        },
        {
          collection: 'vistoria_itens',
          action: 'update',
          permissions: {},
          fields: ['*']
        },
        {
          collection: 'vistoria_itens',
          action: 'delete',
          permissions: {}
        },
        // Vistoria Contestações
        {
          collection: 'vistoria_contestacoes',
          action: 'create',
          permissions: {},
          fields: ['*']
        },
        {
          collection: 'vistoria_contestacoes',
          action: 'read',
          permissions: {},
          fields: ['*']
        },
        {
          collection: 'vistoria_contestacoes',
          action: 'update',
          permissions: {},
          fields: ['*']
        },
        // App Settings - apenas leitura da própria empresa
        {
          collection: 'app_settings',
          action: 'read',
          permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
          fields: ['*']
        },
        {
          collection: 'app_settings',
          action: 'update',
          permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
          fields: ['*']
        },
        // Directus Files - upload de imagens
        {
          collection: 'directus_files',
          action: 'create',
          permissions: {},
          fields: ['*']
        },
        {
          collection: 'directus_files',
          action: 'read',
          permissions: {},
          fields: ['*']
        },
        {
          collection: 'directus_files',
          action: 'update',
          permissions: {},
          fields: ['*']
        },
        {
          collection: 'directus_files',
          action: 'delete',
          permissions: {}
        }
      ];

      let created = 0;
      let updated = 0;
      let errors = 0;

      for (const perm of permissions) {
        try {
          const existing = await permissionsService.readByQuery({
            filter: {
              policy: { _eq: policyId },
              collection: { _eq: perm.collection },
              action: { _eq: perm.action }
            },
            limit: 1
          });

          if (existing.length > 0) {
            await permissionsService.updateOne(existing[0].id, {
              ...perm,
              policy: policyId
            });
            updated++;
          } else {
            await permissionsService.createOne({
              ...perm,
              policy: policyId
            });
            created++;
          }
        } catch (error) {
          console.error(`  ❌ Erro em ${perm.collection} (${perm.action}):`, error.message);
          errors++;
        }
      }

      return res.json({
        success: true,
        message: 'Permissões aplicadas com sucesso',
        stats: {
          created,
          updated,
          errors,
          total: permissions.length
        },
        role: {
          id: typeof companyAdminRole === 'string' ? companyAdminRole : companyAdminRole.id,
          name: 'Company Admin'
        },
        policy: {
          id: policyId,
          name: 'Company Admin Policy'
        }
      });

    } catch (error) {
      console.error('❌ Erro geral:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  });
};
