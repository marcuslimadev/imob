/**
 * Script para popular dados iniciais com autenticação
 */

import { createDirectus, rest, staticToken, createItem } from '@directus/sdk';

// Use seu token estático do Directus (crie em Settings > Access Tokens)
const ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || 'YOUR_ADMIN_TOKEN_HERE';

const client = createDirectus('http://localhost:8055')
	.with(staticToken(ADMIN_TOKEN))
	.with(rest());

async function seedData() {
	try {
		console.log('🔐 Usando token de acesso...');

		// Criar empresa Exclusiva
		console.log('\n📝 Criando empresa Exclusiva Lar Imóveis...');
		const company = await client.request(
			createItem('companies', {
				name: 'Exclusiva Lar Imóveis',
				cnpj: '12.345.678/0001-90',
				email: 'contato@exclusivalar.com.br',
				telefone: '(31) 99999-9999',
				endereco: 'Belo Horizonte, MG',
				status: 'active'
			})
		);
		console.log(`✅ Empresa criada: ${company.name} (ID: ${company.id})`);

		// Criar app_settings para empresa
		console.log('\n🔧 Criando configurações...');
		const settings = await client.request(
			createItem('app_settings', {
				company_id: company.id,
				openai_api_key: process.env.OPENAI_API_KEY || 'sk-YOUR_OPENAI_KEY_HERE',
				openai_model: 'gpt-4o-mini',
				ai_assistant_name: 'Teresa',
				twilio_account_sid: process.env.TWILIO_ACCOUNT_SID || 'AC_YOUR_TWILIO_SID_HERE',
				twilio_auth_token: process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_TOKEN_HERE',
				twilio_whatsapp_number: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
				webhook_url: 'http://localhost:8055/whatsapp',
				external_api_url: 'https://api.example.com',
				external_api_key: 'YOUR_EXTERNAL_API_KEY',
				is_active: true
			})
		);
		console.log(`✅ Configurações criadas (ID: ${settings.id})`);

		console.log('\n🎉 Dados iniciais criados com sucesso!');
		console.log('\n📋 Recursos criados:');
		console.log(`- Empresa: ${company.name} (ID: ${company.id})`);
		console.log(`- Configurações: ID ${settings.id}`);
		
		console.log('\n📝 Próximos passos:');
		console.log('1. Acesse http://localhost:8055/admin/content/companies');
		console.log('2. Acesse http://localhost:8055/admin/content/app_settings');
		console.log('3. Edite as configurações e adicione suas chaves reais');
		console.log('4. Configure as variáveis de ambiente no .env');

	} catch (error) {
		console.error('❌ Erro:', error.message);
		if (error.errors) {
			console.error('Detalhes:', error.errors);
		}
	}
}

seedData();
