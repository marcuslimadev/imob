/**
 * Script para criar collection Companies no Directus
 * Este script cria a estrutura de empresas para multi-tenancy
 */

import fetch from 'node-fetch';

const DIRECTUS_URL = 'http://localhost:8055';

async function createCompaniesCollection() {
	try {
		console.log('🔧 Criando collection companies...');

		// Criar collection
		await fetch(`${DIRECTUS_URL}/collections`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				collection: 'companies',
				meta: {
					collection: 'companies',
					icon: 'business',
					note: 'Empresas clientes do sistema (multi-tenant)',
					display_template: '{{name}}',
					hidden: false,
					singleton: false,
					translations: null,
					archive_field: 'status',
					archive_value: 'archived',
					unarchive_value: 'active',
					sort_field: null
				},
				schema: {
					name: 'companies'
				},
				fields: [
					{
						field: 'id',
						type: 'integer',
						schema: {
							is_primary_key: true,
							has_auto_increment: true
						},
						meta: {
							interface: 'input',
							readonly: true,
							hidden: true
						}
					},
					{
						field: 'name',
						type: 'string',
						schema: {
							is_nullable: false,
							is_unique: false
						},
						meta: {
							interface: 'input',
							display: 'raw',
							required: true,
							width: 'full',
							translations: [
								{
									language: 'pt-BR',
									translation: 'Nome'
								}
							]
						}
					},
					{
						field: 'cnpj',
						type: 'string',
						schema: {
							is_nullable: true,
							is_unique: true
						},
						meta: {
							interface: 'input',
							width: 'half',
							note: 'CNPJ da empresa (opcional, mas recomendado)',
							translations: [
								{
									language: 'pt-BR',
									translation: 'CNPJ'
								}
							]
						}
					},
					{
						field: 'email',
						type: 'string',
						schema: {
							is_nullable: true
						},
						meta: {
							interface: 'input',
							width: 'half',
							display: 'formatted-value',
							display_options: {
								format: true
							},
							translations: [
								{
									language: 'pt-BR',
									translation: 'Email'
								}
							]
						}
					},
					{
						field: 'telefone',
						type: 'string',
						schema: {
							is_nullable: true
						},
						meta: {
							interface: 'input',
							width: 'half',
							translations: [
								{
									language: 'pt-BR',
									translation: 'Telefone'
								}
							]
						}
					},
					{
						field: 'endereco',
						type: 'text',
						schema: {
							is_nullable: true
						},
						meta: {
							interface: 'input-multiline',
							width: 'full',
							translations: [
								{
									language: 'pt-BR',
									translation: 'Endereço'
								}
							]
						}
					},
					{
						field: 'logo',
						type: 'uuid',
						schema: {
							is_nullable: true
						},
						meta: {
							interface: 'file-image',
							width: 'half',
							special: ['file'],
							translations: [
								{
									language: 'pt-BR',
									translation: 'Logo'
								}
							]
						}
					},
					{
						field: 'status',
						type: 'string',
						schema: {
							is_nullable: false,
							default_value: 'active'
						},
						meta: {
							interface: 'select-dropdown',
							width: 'half',
							options: {
								choices: [
									{ text: 'Ativo', value: 'active' },
									{ text: 'Inativo', value: 'inactive' },
									{ text: 'Arquivado', value: 'archived' }
								]
							},
							display: 'labels',
							display_options: {
								choices: [
									{ text: 'Ativo', value: 'active', foreground: '#FFFFFF', background: 'var(--theme--primary)' },
									{ text: 'Inativo', value: 'inactive', foreground: '#FFFFFF', background: 'var(--theme--warning)' },
									{ text: 'Arquivado', value: 'archived', foreground: '#FFFFFF', background: 'var(--theme--danger)' }
								]
							},
							translations: [
								{
									language: 'pt-BR',
									translation: 'Status'
								}
							]
						}
					},
					{
						field: 'created_at',
						type: 'timestamp',
						schema: {
							is_nullable: true
						},
						meta: {
							interface: 'datetime',
							readonly: true,
							hidden: true,
							special: ['date-created'],
							width: 'half'
						}
					},
					{
						field: 'updated_at',
						type: 'timestamp',
						schema: {
							is_nullable: true
						},
						meta: {
							interface: 'datetime',
							readonly: true,
							hidden: true,
							special: ['date-updated'],
							width: 'half'
						}
					}
				]
			})
		});

		console.log('✅ Collection companies criada com sucesso!');

		// Criar empresa de exemplo: Exclusiva Lar Imóveis
		console.log('\n📝 Criando empresa de exemplo...');

		const createCompanyResponse = await fetch(`${DIRECTUS_URL}/items/companies`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: 'Exclusiva Lar Imóveis',
				cnpj: '12.345.678/0001-90',
				email: 'contato@exclusivalar.com.br',
				telefone: '(31) 99999-9999',
				endereco: 'Belo Horizonte, MG',
				status: 'active'
			})
		});

		const newCompany = await createCompanyResponse.json();
		
		if (!createCompanyResponse.ok || !newCompany.data) {
			console.error('❌ Erro ao criar empresa:', newCompany);
			throw new Error('Falha ao criar empresa');
		}
		
		const companyId = newCompany.data.id;
		console.log(`✅ Empresa criada: ${newCompany.data.name} (ID: ${companyId})`);

		// Criar app_settings para a empresa
		console.log('\n🔧 Criando configurações para empresa...');

		const settingsResponse = await fetch(`${DIRECTUS_URL}/items/app_settings`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				company_id: companyId,
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
		});

		const settingsData = await settingsResponse.json();
		console.log('✅ Configurações criadas!');

		console.log('\n🎉 Setup multi-tenant concluído!');
		console.log('\n📋 Recursos criados:');
		console.log(`- Collection: companies`);
		console.log(`- Collection: app_settings (já existente)`);
		console.log(`- Empresa: ${newCompany.data.name} (ID: ${companyId})`);
		console.log(`- Configurações: ID ${settingsData.data.id}`);
		
		console.log('\n📝 Próximos passos:');
		console.log('1. Acesse http://localhost:8055/admin/content/companies');
		console.log('2. Acesse http://localhost:8055/admin/content/app_settings');
		console.log('3. Edite as configurações da Exclusiva Lar Imóveis');
		console.log('4. Adicione suas chaves reais (OpenAI, Twilio) nas variáveis de ambiente ou diretamente');
		console.log('5. Quando criar nova empresa cliente:');
		console.log('   - Adicione em companies');
		console.log('   - Crie app_settings para ela');
		console.log('   - Crie usuário vinculado à empresa');

	} catch (error) {
		console.error('❌ Erro:', error.message);
		if (error.response) {
			const errorData = await error.response.json();
			console.error('Detalhes:', JSON.stringify(errorData, null, 2));
		}
	}
}

// Executar
createCompaniesCollection();
