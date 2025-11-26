/**
 * Helper para buscar configurações multi-tenant
 * Usado pelas extensões para obter chaves API específicas da empresa
 */

/**
 * Busca configurações da empresa por company_id
 * @param {Object} services - Serviços do Directus (database, schema, etc)
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Object>} - Configurações da empresa
 */
export async function getCompanySettings(services, companyId) {
	const { database } = services;
	
	try {
		const settings = await database
			.select('*')
			.from('app_settings')
			.where({ company_id: companyId, is_active: true })
			.first();

		if (!settings) {
			throw new Error(`Configurações não encontradas para empresa ${companyId}`);
		}

		return settings;
	} catch (error) {
		console.error('[getCompanySettings] Erro:', error.message);
		throw error;
	}
}

/**
 * Busca configurações da empresa por ID do usuário
 * Útil quando recebe request autenticado
 * @param {Object} services - Serviços do Directus
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} - Configurações da empresa do usuário
 */
export async function getCompanySettingsByUser(services, userId) {
	const { database } = services;
	
	try {
		// Buscar company_id do usuário
		const user = await database
			.select('company_id')
			.from('directus_users')
			.where({ id: userId })
			.first();

		if (!user || !user.company_id) {
			throw new Error(`Usuário ${userId} não tem empresa associada`);
		}

		return await getCompanySettings(services, user.company_id);
	} catch (error) {
		console.error('[getCompanySettingsByUser] Erro:', error.message);
		throw error;
	}
}

/**
 * Busca configurações da empresa por telefone do WhatsApp
 * Útil para webhooks que recebem mensagens
 * @param {Object} services - Serviços do Directus
 * @param {string} whatsappNumber - Número do WhatsApp (formato: whatsapp:+...)
 * @returns {Promise<Object>} - Configurações da empresa
 */
export async function getCompanySettingsByWhatsApp(services, whatsappNumber) {
	const { database } = services;
	
	try {
		const settings = await database
			.select('*')
			.from('app_settings')
			.where({ 
				twilio_whatsapp_number: whatsappNumber,
				is_active: true 
			})
			.first();

		if (!settings) {
			// Tentar sem o prefixo whatsapp:
			const cleanNumber = whatsappNumber.replace('whatsapp:', '');
			const altSettings = await database
				.select('*')
				.from('app_settings')
				.where({ is_active: true })
				.whereRaw(`twilio_whatsapp_number LIKE ?`, [`%${cleanNumber}%`])
				.first();
			
			if (!altSettings) {
				throw new Error(`Configurações não encontradas para WhatsApp ${whatsappNumber}`);
			}
			
			return altSettings;
		}

		return settings;
	} catch (error) {
		console.error('[getCompanySettingsByWhatsApp] Erro:', error.message);
		throw error;
	}
}

/**
 * Busca configurações da empresa por CNPJ
 * @param {Object} services - Serviços do Directus
 * @param {string} cnpj - CNPJ da empresa
 * @returns {Promise<Object>} - Configurações da empresa
 */
export async function getCompanySettingsByCNPJ(services, cnpj) {
	const { database } = services;
	
	try {
		// Primeiro busca a empresa
		const company = await database
			.select('id')
			.from('companies')
			.where({ cnpj, status: 'active' })
			.first();

		if (!company) {
			throw new Error(`Empresa não encontrada para CNPJ ${cnpj}`);
		}

		return await getCompanySettings(services, company.id);
	} catch (error) {
		console.error('[getCompanySettingsByCNPJ] Erro:', error.message);
		throw error;
	}
}

/**
 * Lista todas empresas ativas com suas configurações
 * @param {Object} services - Serviços do Directus
 * @returns {Promise<Array>} - Lista de empresas com configurações
 */
export async function listActiveCompaniesWithSettings(services) {
	const { database } = services;
	
	try {
		const results = await database
			.select(
				'companies.id as company_id',
				'companies.name as company_name',
				'companies.cnpj',
				'app_settings.*'
			)
			.from('companies')
			.innerJoin('app_settings', 'companies.id', 'app_settings.company_id')
			.where({ 
				'companies.status': 'active',
				'app_settings.is_active': true
			});

		return results;
	} catch (error) {
		console.error('[listActiveCompaniesWithSettings] Erro:', error.message);
		throw error;
	}
}

/**
 * Valida se empresa tem todas configurações necessárias
 * @param {Object} settings - Configurações da empresa
 * @returns {Object} - { valid: boolean, missing: string[] }
 */
export function validateCompanySettings(settings) {
	const required = [
		'openai_api_key',
		'openai_model',
		'ai_assistant_name',
		'twilio_account_sid',
		'twilio_auth_token',
		'twilio_whatsapp_number'
	];

	const missing = [];
	
	for (const field of required) {
		if (!settings[field] || settings[field] === '' || settings[field].includes('YOUR_')) {
			missing.push(field);
		}
	}

	return {
		valid: missing.length === 0,
		missing
	};
}
