/**
 * Aplica permissões multi-tenant para todas as collections
 * Garante isolamento de dados por company_id
 */

const axios = require('axios');
require('dotenv').config();

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'marcus@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Teste@123';

async function login() {
  console.log('🔑 Fazendo login...');
  const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  return response.data.data.access_token;
}

async function getOrCreateRole(token, roleName, config) {
  const headers = { Authorization: `Bearer ${token}` };
  
  // Verificar se role existe
  const rolesResp = await axios.get(`${DIRECTUS_URL}/roles`, { headers });
  const existing = rolesResp.data.data.find((r) => r.name === roleName);
  
  if (existing) {
    console.log(`✅ Role '${roleName}' já existe (ID: ${existing.id})`);
    return existing;
  }
  
  // Criar role
  const created = await axios.post(`${DIRECTUS_URL}/roles`, {
    name: roleName,
    ...config
  }, { headers });
  
  console.log(`✅ Role '${roleName}' criada (ID: ${created.data.data.id})`);
  return created.data.data;
}

async function getOrCreatePolicy(token, policyName, roleId) {
  const headers = { Authorization: `Bearer ${token}` };
  
  // Verificar se policy existe
  const policiesResp = await axios.get(`${DIRECTUS_URL}/policies`, { 
    headers,
    params: { filter: { name: { _eq: policyName } } }
  });
  
  const existing = policiesResp.data.data[0];
  if (existing) {
    console.log(`✅ Policy '${policyName}' já existe (ID: ${existing.id})`);
    return existing.id;
  }
  
  // Criar policy e associar à role
  const created = await axios.post(`${DIRECTUS_URL}/policies`, {
    name: policyName,
    icon: 'verified_user',
    description: `Policy for ${policyName}`,
    admin_access: false,
    app_access: false,
    roles: [roleId]
  }, { headers });
  
  console.log(`✅ Policy '${policyName}' criada (ID: ${created.data.data.id})`);
  return created.data.data.id;
}

async function applyPermissions(token, policyId, permissions) {
  const headers = { Authorization: `Bearer ${token}` };
  
  for (const perm of permissions) {
    try {
      // Verificar se permissão já existe
      const existing = await axios.get(`${DIRECTUS_URL}/permissions`, {
        headers,
        params: {
          filter: {
            policy: { _eq: policyId },
            collection: { _eq: perm.collection },
            action: { _eq: perm.action }
          }
        }
      });
      
      if (existing.data.data.length > 0) {
        // Atualizar permissão existente
        await axios.patch(
          `${DIRECTUS_URL}/permissions/${existing.data.data[0].id}`,
          { ...perm, policy: policyId },
          { headers }
        );
        console.log(`  ✅ ${perm.collection} (${perm.action}) - atualizada`);
      } else {
        // Criar nova permissão
        await axios.post(
          `${DIRECTUS_URL}/permissions`,
          { ...perm, policy: policyId },
          { headers }
        );
        console.log(`  ✅ ${perm.collection} (${perm.action}) - criada`);
      }
    } catch (error) {
      console.error(`  ❌ Erro em ${perm.collection} (${perm.action}):`, error.response?.data?.errors?.[0]?.message || error.message);
    }
  }
}

async function main() {
  try {
    const token = await login();
    
    // 1. Criar/obter role Company Admin
    console.log('\n📋 Configurando role: Company Admin');
    const companyAdminRole = await getOrCreateRole(token, 'Company Admin', {
      description: 'Administrador da imobiliária',
      icon: 'business',
      admin_access: false,
      app_access: false
    });
    
    // 2. Criar/obter policy para a role
    const policyId = await getOrCreatePolicy(token, 'Company Admin Policy', companyAdminRole.id);
    
    console.log('\n🔐 Aplicando permissões...');
    
    const companyAdminPermissions = [
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
        fields: ['nome_fantasia', 'email', 'telefone', 'logo', 'primary_color', 'secondary_color', 'custom_domain']
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
    
    await applyPermissions(token, policyId, companyAdminPermissions);
    
    console.log('\n✅ Permissões aplicadas com sucesso!');
    console.log('\n📝 Próximo passo:');
    console.log('1. Acesse o Directus Admin: http://localhost:8055/admin');
    console.log('2. Vá em Settings → Data Model → Export');
    console.log('3. Salve o arquivo como directus/access/permissions.json');
    console.log('4. Commite o arquivo no repositório');
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    process.exit(1);
  }
}

main();
