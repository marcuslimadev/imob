/**
 * Helper para buscar configuracoes multi-tenant (CommonJS)
 */

async function getCompanySettings(services, companyId) {
	const { database, logger } = services;
	try {
		const settings = await database
			.select('*')
			.from('app_settings')
			.where({ company_id: companyId, is_active: true })
			.first();

		return settings || {};
	} catch (error) {
		logger?.error?.('Erro ao buscar app_settings', { error: error.message });
		return {};
	}
}

module.exports = { getCompanySettings };
