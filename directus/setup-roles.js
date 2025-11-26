/**
 * Script para configurar Roles Multi-tenant no Directus
 * Baseado em DIRECTUS_ROLES_SETUP.md
 * 
 * Este script cria as roles:
 * - Company Admin: Administrador de uma imobiliária
 * - Corretor: Corretor/vendedor de uma imobiliária
 * - Public: Acesso público para vitrine de imóveis
 * 
 * Execute com: node setup-roles.js
 */

const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'marcus@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Teste@123';

let accessToken = '';

// Fazer login
async function login() {
	try {
		const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
			email: ADMIN_EMAIL,
			password: ADMIN_PASSWORD,
		});
		accessToken = response.data.data.access_token;
		console.log('✅ Login realizado com sucesso!');
		return accessToken;
	} catch (error) {
		console.error('❌ Erro no login:', error.response?.data || error.message);
		process.exit(1);
	}
}

// Headers com autenticação
function getHeaders() {
	return {
		Authorization: `Bearer ${accessToken}`,
		'Content-Type': 'application/json',
	};
}

// Criar role
async function createRole(roleData) {
	try {
		const response = await axios.post(`${DIRECTUS_URL}/roles`, roleData, { headers: getHeaders() });
		console.log(`✅ Role '${roleData.name}' criada com sucesso! ID: ${response.data.data.id}`);
		return response.data.data;
	} catch (error) {
		if (error.response?.status === 400 && error.response?.data?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
			console.log(`ℹ️  Role '${roleData.name}' já existe, buscando...`);
			const roles = await axios.get(`${DIRECTUS_URL}/roles`, { headers: getHeaders() });
			const existingRole = roles.data.data.find((r) => r.name === roleData.name);
			if (existingRole) {
				console.log(`✅ Role '${roleData.name}' encontrada. ID: ${existingRole.id}`);
				return existingRole;
			}
		}
		console.error(`❌ Erro ao criar role '${roleData.name}':`, error.response?.data || error.message);
		return null;
	}
}

// Criar permissões para uma role
async function createPermission(permission) {
	try {
		const response = await axios.post(`${DIRECTUS_URL}/permissions`, permission, { headers: getHeaders() });
		console.log(`  ✅ Permissão ${permission.action} em '${permission.collection}' criada`);
		return response.data.data;
	} catch (error) {
		if (error.response?.status === 400) {
			console.log(`  ℹ️  Permissão ${permission.action} em '${permission.collection}' já existe ou não pode ser criada`);
		} else {
			console.error(
				`  ❌ Erro ao criar permissão ${permission.action} em '${permission.collection}':`,
				error.response?.data?.errors?.[0]?.message || error.message
			);
		}
		return null;
	}
}

// Deletar permissões existentes de uma role (para recriar)
async function deleteRolePermissions(roleId) {
	try {
		const response = await axios.get(`${DIRECTUS_URL}/permissions?filter[role][_eq]=${roleId}`, { headers: getHeaders() });
		const permissions = response.data.data;
		
		for (const permission of permissions) {
			await axios.delete(`${DIRECTUS_URL}/permissions/${permission.id}`, { headers: getHeaders() });
		}
		console.log(`  ✅ ${permissions.length} permissões antigas removidas`);
	} catch (error) {
		console.log(`  ℹ️  Nenhuma permissão anterior encontrada`);
	}
}

// Verificar/criar campo company_id em directus_users
async function ensureCompanyIdField() {
	try {
		// Verificar se o campo já existe
		const response = await axios.get(`${DIRECTUS_URL}/fields/directus_users`, { headers: getHeaders() });
		const fields = response.data.data;
		const companyIdField = fields.find((f) => f.field === 'company_id');

		if (companyIdField) {
			console.log('ℹ️  Campo company_id já existe em directus_users');
			return;
		}

		// Criar campo company_id
		await axios.post(
			`${DIRECTUS_URL}/fields/directus_users`,
			{
				field: 'company_id',
				type: 'integer',
				meta: {
					interface: 'select-dropdown-m2o',
					special: ['m2o'],
					required: false,
					options: {
						template: '{{name}}',
					},
					display: 'related-values',
					display_options: {
						template: '{{name}}',
					},
					note: 'Empresa do usuário (multi-tenant)',
				},
				schema: {
					is_nullable: true,
					foreign_key_table: 'companies',
					foreign_key_column: 'id',
				},
			},
			{ headers: getHeaders() }
		);
		console.log('✅ Campo company_id adicionado em directus_users');
	} catch (error) {
		console.error('❌ Erro ao verificar/criar campo company_id:', error.response?.data || error.message);
	}
}

// Criar usuário de teste
async function createTestUser(userData) {
	try {
		const response = await axios.post(`${DIRECTUS_URL}/users`, userData, { headers: getHeaders() });
		console.log(`✅ Usuário '${userData.email}' criado com sucesso!`);
		return response.data.data;
	} catch (error) {
		if (error.response?.data?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
			console.log(`ℹ️  Usuário '${userData.email}' já existe`);
			return null;
		}
		console.error(`❌ Erro ao criar usuário '${userData.email}':`, error.response?.data || error.message);
		return null;
	}
}

// Obter ID de uma empresa pelo slug
async function getCompanyId(slug) {
	try {
		const response = await axios.get(`${DIRECTUS_URL}/items/companies?filter[slug][_eq]=${slug}`, { headers: getHeaders() });
		if (response.data.data && response.data.data.length > 0) {
			return response.data.data[0].id;
		}
		return null;
	} catch (error) {
		console.log(`ℹ️  Empresa '${slug}' não encontrada`);
		return null;
	}
}

// ==========================================
// Definição das Roles e Permissões
// ==========================================

// Role: Company Admin
const companyAdminPermissions = (roleId) => [
	// companies - leitura e atualização apenas da própria empresa
	{
		role: roleId,
		collection: 'companies',
		action: 'read',
		permissions: { id: { _eq: '$CURRENT_USER.company_id' } },
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'companies',
		action: 'update',
		permissions: { id: { _eq: '$CURRENT_USER.company_id' } },
		fields: ['name', 'cnpj', 'email', 'telefone', 'endereco', 'logo', 'slug', 'custom_domain', 'primary_color', 'secondary_color', 'whatsapp_number', 'creci'],
	},

	// properties - CRUD completo filtrado por company_id
	{
		role: roleId,
		collection: 'properties',
		action: 'create',
		permissions: {},
		fields: ['*'],
		presets: { company_id: '$CURRENT_USER.company_id' },
	},
	{
		role: roleId,
		collection: 'properties',
		action: 'read',
		permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'properties',
		action: 'update',
		permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'properties',
		action: 'delete',
		permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
	},

	// leads - CRUD completo filtrado por company_id
	{
		role: roleId,
		collection: 'leads',
		action: 'create',
		permissions: {},
		fields: ['*'],
		presets: { company_id: '$CURRENT_USER.company_id' },
	},
	{
		role: roleId,
		collection: 'leads',
		action: 'read',
		permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'leads',
		action: 'update',
		permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'leads',
		action: 'delete',
		permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
	},

	// property_media - Acesso total
	{
		role: roleId,
		collection: 'property_media',
		action: 'create',
		permissions: {},
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'property_media',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'property_media',
		action: 'update',
		permissions: {},
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'property_media',
		action: 'delete',
		permissions: {},
	},

	// lead_activities - Acesso total
	{
		role: roleId,
		collection: 'lead_activities',
		action: 'create',
		permissions: {},
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'lead_activities',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'lead_activities',
		action: 'update',
		permissions: {},
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'lead_activities',
		action: 'delete',
		permissions: {},
	},

	// directus_files - Upload e gerenciamento de arquivos próprios
	{
		role: roleId,
		collection: 'directus_files',
		action: 'create',
		permissions: {},
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'directus_files',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'directus_files',
		action: 'update',
		permissions: { uploaded_by: { _eq: '$CURRENT_USER' } },
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'directus_files',
		action: 'delete',
		permissions: { uploaded_by: { _eq: '$CURRENT_USER' } },
	},

	// directus_users - Gerenciar usuários da empresa
	{
		role: roleId,
		collection: 'directus_users',
		action: 'read',
		permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
		fields: ['id', 'email', 'first_name', 'last_name', 'role', 'company_id', 'status', 'avatar'],
	},
	{
		role: roleId,
		collection: 'directus_users',
		action: 'create',
		permissions: {},
		fields: ['email', 'first_name', 'last_name', 'password', 'role', 'company_id', 'status', 'avatar'],
		presets: { company_id: '$CURRENT_USER.company_id' },
	},
	{
		role: roleId,
		collection: 'directus_users',
		action: 'update',
		permissions: {
			_and: [{ company_id: { _eq: '$CURRENT_USER.company_id' } }, { id: { _neq: '$CURRENT_USER' } }],
		},
		fields: ['email', 'first_name', 'last_name', 'password', 'status', 'avatar'],
	},

	// conversas - Acesso às conversas da empresa
	{
		role: roleId,
		collection: 'conversas',
		action: 'create',
		permissions: {},
		fields: ['*'],
		presets: { company_id: '$CURRENT_USER.company_id' },
	},
	{
		role: roleId,
		collection: 'conversas',
		action: 'read',
		permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'conversas',
		action: 'update',
		permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
		fields: ['*'],
	},

	// mensagens - Acesso às mensagens da empresa
	{
		role: roleId,
		collection: 'mensagens',
		action: 'create',
		permissions: {},
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'mensagens',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},

	// app_settings - Configurações da empresa
	{
		role: roleId,
		collection: 'app_settings',
		action: 'read',
		permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'app_settings',
		action: 'update',
		permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
		fields: ['*'],
	},

	// property_views - Leitura das visualizações
	{
		role: roleId,
		collection: 'property_views',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},
];

// Role: Corretor
const corretorPermissions = (roleId) => [
	// properties - Somente leitura
	{
		role: roleId,
		collection: 'properties',
		action: 'read',
		permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
		fields: ['*'],
	},

	// leads - CRUD filtrado por company_id e assigned_to
	{
		role: roleId,
		collection: 'leads',
		action: 'create',
		permissions: {},
		fields: ['*'],
		presets: { company_id: '$CURRENT_USER.company_id', assigned_to: '$CURRENT_USER' },
	},
	{
		role: roleId,
		collection: 'leads',
		action: 'read',
		permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'leads',
		action: 'update',
		permissions: { assigned_to: { _eq: '$CURRENT_USER' } },
		fields: ['*'],
	},

	// lead_activities - Criar e ler, atualizar apenas as próprias
	{
		role: roleId,
		collection: 'lead_activities',
		action: 'create',
		permissions: {},
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'lead_activities',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'lead_activities',
		action: 'update',
		permissions: { created_by: { _eq: '$CURRENT_USER' } },
		fields: ['*'],
	},

	// property_media - Somente leitura
	{
		role: roleId,
		collection: 'property_media',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},

	// directus_files - Leitura e upload
	{
		role: roleId,
		collection: 'directus_files',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},
	{
		role: roleId,
		collection: 'directus_files',
		action: 'create',
		permissions: {},
		fields: ['*'],
	},

	// directus_users - Ver apenas si mesmo
	{
		role: roleId,
		collection: 'directus_users',
		action: 'read',
		permissions: { id: { _eq: '$CURRENT_USER' } },
		fields: ['id', 'email', 'first_name', 'last_name', 'role', 'company_id', 'status', 'avatar'],
	},

	// companies - Leitura apenas da própria empresa
	{
		role: roleId,
		collection: 'companies',
		action: 'read',
		permissions: { id: { _eq: '$CURRENT_USER.company_id' } },
		fields: ['id', 'name', 'slug', 'logo', 'primary_color', 'secondary_color', 'whatsapp_number'],
	},

	// conversas - Acesso às conversas da empresa
	{
		role: roleId,
		collection: 'conversas',
		action: 'read',
		permissions: { company_id: { _eq: '$CURRENT_USER.company_id' } },
		fields: ['*'],
	},

	// mensagens - Leitura das mensagens
	{
		role: roleId,
		collection: 'mensagens',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},
];

// Role: Public - Será configurada como a role pública do Directus
const publicPermissions = [
	// properties - Somente leitura de imóveis ativos
	{
		role: null, // null = public role
		collection: 'properties',
		action: 'read',
		permissions: { status: { _eq: 'active' } },
		fields: [
			'id',
			'title',
			'description',
			'property_type',
			'transaction_type',
			'price_sale',
			'price_rent',
			'bedrooms',
			'bathrooms',
			'area_total',
			'area_built',
			'city',
			'state',
			'neighborhood',
			'featured',
			'company_id',
		],
	},

	// property_media - Leitura das mídias
	{
		role: null,
		collection: 'property_media',
		action: 'read',
		permissions: {},
		fields: ['id', 'property_id', 'directus_file', 'sort', 'is_cover'],
	},

	// leads - Apenas criação (formulário de contato)
	{
		role: null,
		collection: 'leads',
		action: 'create',
		permissions: {},
		fields: ['name', 'email', 'phone', 'message', 'interest_type', 'property_id', 'company_id', 'budget_min', 'budget_max', 'source'],
	},

	// property_views - Criar visualizações (tracking)
	{
		role: null,
		collection: 'property_views',
		action: 'create',
		permissions: {},
		fields: ['property_id', 'lead_id', 'ip_address', 'user_agent'],
	},

	// companies - Leitura de empresas ativas
	{
		role: null,
		collection: 'companies',
		action: 'read',
		permissions: { status: { _eq: 'active' } },
		fields: ['id', 'name', 'email', 'telefone', 'logo', 'endereco', 'slug', 'custom_domain', 'primary_color', 'secondary_color', 'whatsapp_number'],
	},

	// directus_files - Leitura de arquivos públicos
	{
		role: null,
		collection: 'directus_files',
		action: 'read',
		permissions: {},
		fields: ['id', 'title', 'type', 'width', 'height'],
	},
];

// ==========================================
// Função Principal
// ==========================================

async function main() {
	console.log('🚀 Iniciando configuração de Roles Multi-tenant...\n');
	console.log(`📍 Directus URL: ${DIRECTUS_URL}`);
	console.log(`📧 Admin Email: ${ADMIN_EMAIL}\n`);

	await login();

	// 1. Garantir que o campo company_id existe em directus_users
	console.log('\n📋 Verificando campo company_id em directus_users...');
	await ensureCompanyIdField();

	// 2. Criar Role: Company Admin
	console.log('\n📋 Criando Role: Company Admin...');
	const companyAdminRole = await createRole({
		name: 'Company Admin',
		icon: 'business',
		description: 'Administrador de uma imobiliária - Acesso completo aos dados da própria empresa',
		admin_access: false,
		app_access: true,
	});

	if (companyAdminRole) {
		console.log('  Configurando permissões para Company Admin...');
		await deleteRolePermissions(companyAdminRole.id);
		for (const permission of companyAdminPermissions(companyAdminRole.id)) {
			await createPermission(permission);
		}
	}

	// 3. Criar Role: Corretor
	console.log('\n📋 Criando Role: Corretor...');
	const corretorRole = await createRole({
		name: 'Corretor',
		icon: 'person',
		description: 'Corretor/vendedor de imobiliária - Leitura de imóveis e gerenciamento de leads',
		admin_access: false,
		app_access: true,
	});

	if (corretorRole) {
		console.log('  Configurando permissões para Corretor...');
		await deleteRolePermissions(corretorRole.id);
		for (const permission of corretorPermissions(corretorRole.id)) {
			await createPermission(permission);
		}
	}

	// 4. Configurar permissões públicas
	console.log('\n📋 Configurando permissões públicas...');
	for (const permission of publicPermissions) {
		await createPermission(permission);
	}

	// 5. Criar usuários de teste
	console.log('\n📋 Criando usuários de teste...');

	// Buscar ID da empresa Exclusiva
	let companyId = await getCompanyId('exclusiva');
	if (!companyId) {
		// Tentar criar a empresa se não existir
		console.log('  Criando empresa de teste...');
		try {
			const companyResponse = await axios.post(
				`${DIRECTUS_URL}/items/companies`,
				{
					name: 'Imobiliária Exclusiva',
					slug: 'exclusiva',
					email: 'contato@exclusiva.com.br',
					telefone: '(31) 99999-9999',
					status: 'active',
				},
				{ headers: getHeaders() }
			);
			companyId = companyResponse.data.data.id;
			console.log(`  ✅ Empresa criada com ID: ${companyId}`);
		} catch (error) {
			console.log('  ℹ️  Não foi possível criar empresa de teste');
		}
	}

	if (companyId && companyAdminRole) {
		// Criar Company Admin de teste
		await createTestUser({
			email: 'admin@exclusiva.com',
			password: 'Teste@123',
			first_name: 'Admin',
			last_name: 'Exclusiva',
			role: companyAdminRole.id,
			company_id: companyId,
			status: 'active',
		});
	}

	if (companyId && corretorRole) {
		// Criar Corretor de teste
		await createTestUser({
			email: 'corretor@exclusiva.com',
			password: 'Teste@123',
			first_name: 'Carlos',
			last_name: 'Vendedor',
			role: corretorRole.id,
			company_id: companyId,
			status: 'active',
		});
	}

	// Resumo final
	console.log('\n' + '='.repeat(60));
	console.log('✅ Configuração de Roles concluída!');
	console.log('='.repeat(60));

	console.log('\n📋 Roles criadas:');
	console.log('  1. Company Admin - Administrador de imobiliária');
	console.log('  2. Corretor - Vendedor de imobiliária');
	console.log('  3. Public - Acesso público configurado');

	console.log('\n📝 Usuários de teste:');
	console.log('  • admin@exclusiva.com / Teste@123 (Company Admin)');
	console.log('  • corretor@exclusiva.com / Teste@123 (Corretor)');

	console.log('\n🔐 Permissões configuradas por role:');
	console.log('  Company Admin:');
	console.log('    - CRUD completo em properties, leads (filtrado por company_id)');
	console.log('    - Gerenciamento de usuários da empresa');
	console.log('    - Upload de arquivos');
	console.log('  Corretor:');
	console.log('    - Leitura de imóveis');
	console.log('    - CRUD de leads (atribuídos a ele)');
	console.log('    - Registro de atividades');
	console.log('  Public:');
	console.log('    - Leitura de imóveis ativos');
	console.log('    - Criação de leads (formulário de contato)');

	console.log('\n🧪 Para testar:');
	console.log('  1. Acesse http://localhost:8055 e faça login com admin@exclusiva.com');
	console.log('  2. Verifique se só vê dados da empresa Exclusiva');
	console.log('  3. Acesse a API pública: http://localhost:8055/items/properties');
	console.log('  4. Teste o formulário de contato no frontend\n');
}

main().catch(console.error);
