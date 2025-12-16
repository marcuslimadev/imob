/**
 * Helper para buscar configuracoes multi-tenant (ESM)
 * As credenciais estao armazenadas diretamente na collection companies
 */

export async function getCompanySettings(database, companyId) {
	try {
		const company = await database
			.select('*')
			.from('companies')
			.where({ id: companyId })
			.first();

		return company || {};
	} catch (error) {
		console.error('Erro ao buscar company settings', error.message);
		return {};
	}
}

/**
 * Buscar empresa pelo numero WhatsApp
 * Usado pelos webhooks do Twilio para identificar o tenant
 */
export async function getCompanyByWhatsAppNumber(database, whatsappNumber) {
	try {
		// Normalizar numero (remover whatsapp: prefix e espacos)
		const normalizedNumber = whatsappNumber
			.replace('whatsapp:', '')
			.replace(/\s/g, '')
			.replace(/[^+\d]/g, '');

		const company = await database
			.select('*')
			.from('companies')
			.where('twilio_whatsapp_number', 'like', `%${normalizedNumber.slice(-8)}%`)
			.first();

		return company || null;
	} catch (error) {
		console.error('Erro ao buscar company por WhatsApp', error.message);
		return null;
	}
}
