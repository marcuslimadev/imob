/**
 * Script para registrar collection app_settings com suporte multi-tenant
 * 
 * Esta collection armazena configurações específicas de cada empresa:
 * - Credenciais OpenAI
 * - Credenciais Twilio
 * - Configurações do assistente IA
 * - URLs de webhook
 */

import { createDirectus, rest, createItem, readItems } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055').with(rest());

async function createAppSettingsCollection() {
	try {
		console.log('🔧 Criando collection app_settings...');

		// Criar collection
		await fetch('http://localhost:8055/collections', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				collection: 'app_settings',
				meta: {
					collection: 'app_settings',
					icon: 'settings',
					note: 'Configurações por empresa (multi-tenant)',
					display_template: '{{company_id.name}} - Configurações',
					hidden: false,
					singleton: false,
					translations: null,
					archive_field: null,
					archive_app_filter: true,
					archive_value: null,
					unarchive_value: null,
					sort_field: null,
					accountability: 'all',
					color: null,
					item_duplication_fields: null,
					sort: 10,
					group: null,
					collapse: 'open'
				},
				schema: {
					name: 'app_settings'
				},
				fields: [
					{
						field: 'id',
						type: 'integer',
						schema: {
							is_primary_key: true,
							has_auto_increment: true,
							is_nullable: false
						},
						meta: {
							hidden: true,
							interface: 'input',
							readonly: true
						}
					},
					{
						field: 'company_id',
						type: 'integer',
						schema: {
							is_nullable: false,
							is_unique: true,
							foreign_key_table: 'companies',
							foreign_key_column: 'id'
						},
						meta: {
							interface: 'select-dropdown-m2o',
							display: 'related-values',
							display_options: {
								template: '{{name}}'
							},
							options: {
								template: '{{name}}'
							},
							required: true,
							note: 'Empresa dona destas configurações'
						}
					},
					{
						field: 'openai_api_key',
						type: 'string',
						schema: {
							max_length: 255,
							is_nullable: true
						},
						meta: {
							interface: 'input',
							options: {
								masked: true,
								placeholder: 'sk-...'
							},
							note: 'Chave API OpenAI (GPT + Whisper)',
							width: 'half'
						}
					},
					{
						field: 'openai_model',
						type: 'string',
						schema: {
							max_length: 50,
							default_value: 'gpt-4o-mini',
							is_nullable: true
						},
						meta: {
							interface: 'select-dropdown',
							options: {
								choices: [
									{ text: 'GPT-4o-mini (Recomendado)', value: 'gpt-4o-mini' },
									{ text: 'GPT-4o', value: 'gpt-4o' },
									{ text: 'GPT-4', value: 'gpt-4' },
									{ text: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' }
								]
							},
							note: 'Modelo OpenAI a usar',
							width: 'half'
						}
					},
					{
						field: 'ai_assistant_name',
						type: 'string',
						schema: {
							max_length: 100,
							default_value: 'Teresa',
							is_nullable: true
						},
						meta: {
							interface: 'input',
							options: {
								placeholder: 'Ex: Teresa, Ana, Roberto...'
							},
							note: 'Nome do assistente virtual',
							width: 'half'
						}
					},
					{
						field: 'twilio_account_sid',
						type: 'string',
						schema: {
							max_length: 255,
							is_nullable: true
						},
						meta: {
							interface: 'input',
							options: {
								masked: true,
								placeholder: 'AC...'
							},
							note: 'Twilio Account SID',
							width: 'half'
						}
					},
					{
						field: 'twilio_auth_token',
						type: 'string',
						schema: {
							max_length: 255,
							is_nullable: true
						},
						meta: {
							interface: 'input',
							options: {
								masked: true,
								placeholder: '***'
							},
							note: 'Twilio Auth Token',
							width: 'half'
						}
					},
					{
						field: 'twilio_whatsapp_number',
						type: 'string',
						schema: {
							max_length: 50,
							is_nullable: true
						},
						meta: {
							interface: 'input',
							options: {
								placeholder: 'whatsapp:+14155238886'
							},
							note: 'Número WhatsApp do Twilio',
							width: 'half'
						}
					},
					{
						field: 'webhook_url',
						type: 'string',
						schema: {
							max_length: 500,
							is_nullable: true
						},
						meta: {
							interface: 'input',
							options: {
								placeholder: 'https://seu-dominio.com/whatsapp'
							},
							note: 'URL do webhook (para configurar no Twilio)',
							readonly: true,
							width: 'full'
						}
					},
					{
						field: 'external_api_url',
						type: 'string',
						schema: {
							max_length: 500,
							is_nullable: true
						},
						meta: {
							interface: 'input',
							options: {
								placeholder: 'https://api-imoveis.com.br'
							},
							note: 'URL da API externa de imóveis (para sync)',
							width: 'half'
						}
					},
					{
						field: 'external_api_key',
						type: 'string',
						schema: {
							max_length: 255,
							is_nullable: true
						},
						meta: {
							interface: 'input',
							options: {
								masked: true,
								placeholder: 'API Key...'
							},
							note: 'Chave da API externa de imóveis',
							width: 'half'
						}
					},
					{
						field: 'is_active',
						type: 'boolean',
						schema: {
							default_value: true,
							is_nullable: false
						},
						meta: {
							interface: 'boolean',
							display: 'boolean',
							note: 'Empresa ativa (desativa WhatsApp automático)',
							width: 'half'
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
							special: ['date-created']
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
							special: ['date-updated']
						}
					}
				]
			})
		});

		console.log('✅ Collection app_settings criada com sucesso!');

		// Criar configurações de exemplo para a empresa Exclusiva
		console.log('\n📝 Criando configurações de exemplo...');

		// Buscar ID da empresa Exclusiva
		const companiesResponse = await fetch('http://localhost:8055/items/companies?filter[name][_eq]=Exclusiva Lar Imóveis');
		const companiesData = await companiesResponse.json();
		
		let companyId = null;
		if (companiesData.data && companiesData.data.length > 0) {
			companyId = companiesData.data[0].id;
			console.log(`✅ Empresa encontrada: Exclusiva Lar Imóveis (ID: ${companyId})`);
		} else {
			console.log('⚠️  Empresa Exclusiva não encontrada, criando...');
			
			// Criar empresa de exemplo
			const createCompanyResponse = await fetch('http://localhost:8055/items/companies', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: 'Exclusiva Lar Imóveis',
					cnpj: '12.345.678/0001-90',
					email: 'contato@exclusivalar.com.br',
					telefone: '(31) 99999-9999',
					is_active: true
				})
			});
			
			const newCompany = await createCompanyResponse.json();
			companyId = newCompany.data.id;
			console.log(`✅ Empresa criada: ID ${companyId}`);
		}

		// Criar app_settings para a empresa
		const settingsResponse = await fetch('http://localhost:8055/items/app_settings', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				company_id: companyId,
				openai_api_key: 'sk-YOUR_OPENAI_KEY_HERE',
				openai_model: 'gpt-4o-mini',
				ai_assistant_name: 'Teresa',
				twilio_account_sid: 'AC_YOUR_TWILIO_SID_HERE',
				twilio_auth_token: 'YOUR_TWILIO_TOKEN_HERE',
				twilio_whatsapp_number: 'whatsapp:+14155238886',
				webhook_url: 'http://localhost:8055/whatsapp',
				external_api_url: 'https://api.example.com',
				external_api_key: 'YOUR_EXTERNAL_API_KEY',
				is_active: true
			})
		});

		const settingsData = await settingsResponse.json();
		console.log('✅ Configurações criadas:', settingsData.data);

		console.log('\n🎉 Setup multi-tenant concluído!');
		console.log('\n📋 Próximos passos:');
		console.log('1. Acesse http://localhost:8055/admin/content/app_settings');
		console.log('2. Edite as configurações da empresa Exclusiva');
		console.log('3. Adicione suas chaves reais (OpenAI, Twilio)');
		console.log('4. Quando criar nova empresa cliente, crie também app_settings para ela');

	} catch (error) {
		console.error('❌ Erro ao criar app_settings:', error.message);
		if (error.response) {
			const errorData = await error.response.json();
			console.error('Detalhes:', errorData);
		}
	}
}

// Executar
createAppSettingsCollection();
