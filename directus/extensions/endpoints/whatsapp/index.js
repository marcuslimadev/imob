/**
 * Directus Extension: WhatsApp Webhook Endpoint (Multi-Tenant)
 * Migrado de: backend/app/Http/Controllers/WebhookController.php
 * 
 * Endpoints disponíveis:
 * - POST /whatsapp - Receber webhooks do Twilio/Evolution API
 * - POST /whatsapp/status - Status callbacks do Twilio
 * 
 * Multi-Tenant:
 * - Identifica empresa pelo campo 'To' (número WhatsApp da empresa)
 * - Busca configurações em app_settings
 * - Isola dados por company_id
 */

import { getCompanySettingsByWhatsApp } from '../../shared/company-settings.js';

export default (router, { services, logger, database }) => {
	const { ItemsService } = services;

	/**
	 * POST /whatsapp
	 * Receber mensagens do WhatsApp (Twilio ou Evolution API)
	 */
	router.post('/', async (req, res) => {
		try {
			const webhookData = req.body;

			// Detectar origem do webhook
			const source = detectWebhookSource(webhookData);

			logger.info('╔════════════════════════════════════════════════════════════════╗');
			logger.info('║           🔔 WEBHOOK RECEBIDO - ' + source.toUpperCase() + '                    ║');
			logger.info('╚════════════════════════════════════════════════════════════════╝');

			// Normalizar dados
			const normalizedData = normalizeWebhookData(webhookData, source);

			logger.info('📱 De:', normalizedData.from || 'N/A');
			logger.info('📱 Para:', normalizedData.to || 'N/A');
			logger.info('👤 Nome:', normalizedData.profile_name || 'N/A');
			logger.info('💬 Mensagem:', normalizedData.message || '[mídia]');
			logger.info('🆔 Message ID:', normalizedData.message_id || 'N/A');
			logger.info('🔖 Origem:', source);
			logger.info('─────────────────────────────────────────────────────────────────');

			// 🏢 MULTI-TENANT: Identificar empresa pelo número WhatsApp
			let companySettings = null;
			if (normalizedData.to) {
				try {
					companySettings = await getCompanySettingsByWhatsApp({ database }, normalizedData.to);
					logger.info('🏢 Empresa identificada:', {
						company_id: companySettings.company_id,
						ai_assistant: companySettings.ai_assistant_name
					});
				} catch (error) {
					logger.warn('⚠️  Empresa não encontrada para número:', normalizedData.to);
					logger.warn('💡 Configure app_settings para este número WhatsApp');
					// Continua sem empresa (modo fallback)
				}
			}

			// Processar mensagem via WhatsApp Service
			const result = await processIncomingMessage(normalizedData, companySettings, { services, logger, database, req });

			logger.info('╔════════════════════════════════════════════════════════════════╗');
			logger.info('║           ✅ WEBHOOK PROCESSADO COM SUCESSO                   ║');
			logger.info('╚════════════════════════════════════════════════════════════════╝');
			logger.info('📊 Resultado:', result);
			logger.info('═════════════════════════════════════════════════════════════════');

			return res.json({
				success: true,
				message: 'Processado',
				result
			});

		} catch (error) {
			logger.error('ERRO NO WEBHOOK', {
				error: error.message,
				stack: error.stack,
				payload: req.body
			});

			// Retornar 200 para evitar reenvio do Twilio
			return res.json({
				success: false,
				error: 'Falha ao processar webhook: ' + error.message
			});
		}
	});

	/**
	 * POST /whatsapp/status
	 * Status callback do Twilio
	 */
	router.post('/status', async (req, res) => {
		try {
			const statusData = req.body;

			logger.info('Status callback recebido', statusData);

			// Atualizar status da mensagem no banco
			if (statusData.MessageSid && statusData.MessageStatus) {
				const mensagensService = new ItemsService('mensagens', { schema: req.schema, accountability: req.accountability });
				
				const mensagens = await mensagensService.readByQuery({
					filter: {
						message_sid: { _eq: statusData.MessageSid }
					}
				});

				if (mensagens.length > 0) {
					await mensagensService.updateOne(mensagens[0].id, {
						status: statusData.MessageStatus
					});

					logger.info('✅ Status da mensagem atualizado', {
						message_sid: statusData.MessageSid,
						status: statusData.MessageStatus
					});
				}
			}

			return res.send('OK');

		} catch (error) {
			logger.error('❌ Erro ao processar status callback', {
				error: error.message,
				stack: error.stack
			});

			return res.send('OK'); // Sempre retornar OK para Twilio
		}
	});

	/**
	 * Detectar origem do webhook (Twilio ou Evolution API)
	 */
	function detectWebhookSource(data) {
		// Twilio tem campos específicos como MessageSid, AccountSid
		if (data.MessageSid || data.AccountSid) {
			return 'twilio';
		}

		// Evolution API tem campos como event, instance, data
		if (data.event || data.instance || data.data) {
			return 'evolution';
		}

		return 'unknown';
	}

	/**
	 * Normalizar dados do webhook para formato padrão
	 */
	function normalizeWebhookData(data, source) {
		if (source === 'twilio') {
			return {
				from: data.From || null,
				to: data.To || null,
				message: data.Body || null,
				message_id: data.MessageSid || null,
				profile_name: data.ProfileName || null,
				media_url: data.MediaUrl0 || null,
				media_type: data.MediaContentType0 || null,
				location: {
					city: data.FromCity || null,
					state: data.FromState || null,
					country: data.FromCountry || null,
					latitude: data.Latitude || null,
					longitude: data.Longitude || null
				},
				source: 'twilio',
				raw: data
			};
		}

		if (source === 'evolution') {
			const messageData = data.data || {};
			const key = messageData.key || {};
			const message = messageData.message || {};
			const pushName = messageData.pushName || null;

			// Extrair texto da mensagem
			const messageText = message.conversation 
				|| message.extendedTextMessage?.text
				|| message.imageMessage?.caption
				|| message.videoMessage?.caption
				|| null;

			return {
				from: 'whatsapp:+' + (key.remoteJid || '').replace(/[^0-9]/g, ''),
				to: null,
				message: messageText,
				message_id: key.id || null,
				profile_name: pushName,
				media_url: null,
				media_type: null,
				location: null,
				source: 'evolution',
				raw: data
			};
		}

		// Formato desconhecido
		return {
			from: data.from || data.From || null,
			to: data.to || data.To || null,
			message: data.message || data.Body || data.text || null,
			message_id: data.id || data.MessageSid || null,
			profile_name: data.name || data.ProfileName || null,
			media_url: null,
			media_type: null,
			location: null,
			source: 'unknown',
			raw: data
		};
	}

	/**
	 * Processar mensagem recebida (Multi-Tenant)
	 * @param {Object} webhookData - Dados normalizados do webhook
	 * @param {Object} companySettings - Configurações da empresa (app_settings)
	 * @param {Object} context - { services, logger, database, req }
	 */
	async function processIncomingMessage(webhookData, companySettings, { services, logger, database, req }) {
		const { ItemsService } = services;

		try {
			logger.info('🔄 Processando mensagem...');

			// Extrair dados normalizados
			const from = webhookData.from;
			const body = webhookData.message || '';
			const messageSid = webhookData.message_id;
			const mediaUrl = webhookData.media_url;
			const mediaType = webhookData.media_type;
			const profileName = webhookData.profile_name;
			const location = webhookData.location || {};
			const companyId = companySettings?.company_id || null;

			if (!from) {
				return { success: false, error: 'Número de origem não identificado' };
			}

			// Limpar telefone
			const telefone = from.replace('whatsapp:', '');

			// 1. Obter ou criar conversa (COM FILTRO POR EMPRESA)
			const conversasService = new ItemsService('conversas', { schema: req.schema });
			
			const conversaFilter = {
				telefone: { _eq: telefone },
				status: { _neq: 'finalizada' }
			};
			
			// Se temos empresa, filtrar por ela
			if (companyId) {
				conversaFilter.company_id = { _eq: companyId };
			}
			
			let conversa = await conversasService.readByQuery({
				filter: conversaFilter,
				limit: 1
			});

			if (!conversa || conversa.length === 0) {
				// Criar nova conversa (COM company_id)
				const conversaData = {
					telefone,
					whatsapp_name: profileName,
					status: 'ativa',
					stage: 'boas_vindas',
					iniciada_em: new Date()
				};
				
				// Adicionar company_id se disponível
				if (companyId) {
					conversaData.company_id = companyId;
				}
				
				const novaConversa = await conversasService.createOne(conversaData);

				conversa = [novaConversa];
				logger.info('✅ Nova conversa criada', { 
					id: novaConversa.id, 
					telefone,
					company_id: companyId || 'sem empresa'
				});
			} else {
				conversa = conversa[0];
				
				// Atualizar whatsapp_name se mudou
				if (profileName && conversa.whatsapp_name !== profileName) {
					await conversasService.updateOne(conversa.id, {
						whatsapp_name: profileName,
						ultima_atividade: new Date()
					});
				}
			}

			const conversaId = Array.isArray(conversa) ? conversa[0].id : conversa.id;

			// 2. Detectar tipo de mensagem
			let messageType = 'text';
			if (mediaUrl) {
				if (mediaType?.includes('audio')) messageType = 'audio';
				else if (mediaType?.includes('image')) messageType = 'image';
				else if (mediaType?.includes('video')) messageType = 'video';
				else messageType = 'document';
			}

			// 3. Salvar mensagem recebida
			const mensagensService = new ItemsService('mensagens', { schema: req.schema });
			
			const mensagem = await mensagensService.createOne({
				conversa_id: conversaId,
				message_sid: messageSid,
				direction: 'incoming',
				message_type: messageType,
				content: body,
				media_url: mediaUrl,
				status: 'received',
				sent_at: new Date()
			});

			logger.info('✅ Mensagem salva no banco', { id: mensagem.id, type: messageType });

			// 4. Se for áudio, enviar feedback e processar
			let finalBody = body;
			if (messageType === 'audio' && mediaUrl) {
				logger.info('🎤 Áudio detectado, enviando feedback...');
				
				// TODO: Implementar transcrição via OpenAI endpoint
				// Por enquanto, apenas feedback
				const feedbackMsg = "🎤 Recebi seu áudio! Vou ouvir agora e já te respondo... ⏳";
				
				// Enviar via Twilio endpoint
				await fetch(`${process.env.PUBLIC_URL}/twilio/send-message`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						to: telefone,
						message: feedbackMsg
					})
				});

				// Salvar feedback
				await mensagensService.createOne({
					conversa_id: conversaId,
					direction: 'outgoing',
					message_type: 'text',
					content: feedbackMsg,
					status: 'sent',
					sent_at: new Date()
				});

				// TODO: Transcrever áudio
				finalBody = '[Áudio - transcrição em desenvolvimento]';
			}

			// 5. Verificar se é primeira mensagem
			const totalMensagens = await mensagensService.readByQuery({
				filter: { conversa_id: { _eq: conversaId } },
				aggregate: { count: '*' }
			});

			const count = totalMensagens[0]?.count || 0;
			const isFirstMessage = count <= (messageType === 'audio' ? 2 : 1);

			if (isFirstMessage) {
				logger.info('👋 Primeira mensagem detectada, enviando boas-vindas...');
				
				const assistantName = companySettings.assistant_name || 'Teresa';
				const preferredName = profileName?.split(' ')[0] || 'visitante';
				const welcomeMessage = buildGenericWelcomeMessage(assistantName, preferredName);

				// Enviar via Twilio
				await fetch(`${process.env.PUBLIC_URL}/twilio/send-message`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						to: telefone,
						message: welcomeMessage
					})
				});

				// Salvar mensagem
				await mensagensService.createOne({
					conversa_id: conversaId,
					direction: 'outgoing',
					message_type: 'text',
					content: welcomeMessage,
					status: 'sent',
					sent_at: new Date()
				});

				// Criar lead
				const leadsService = new ItemsService('leads', { schema: req.schema });
				const lead = await leadsService.createOne({
					company_id: company.id,
					nome: profileName || 'Visitante',
					telefone,
					whatsapp_name: profileName,
					localizacao: location.city ? `${location.city}, ${location.state}` : null,
					status: 'novo',
					origem: 'whatsapp',
					primeira_interacao: new Date(),
					ultima_interacao: new Date()
				});

				// Vincular lead à conversa
				await conversasService.updateOne(conversaId, {
					lead_id: lead.id,
					stage: 'coleta_dados'
				});

				return {
					success: true,
					message: 'Primeira mensagem processada',
					lead_id: lead.id
				};
			}

			// 6. Extrair dados do lead
			logger.info('📊 Extraindo dados da mensagem...');
			
			const leadsService = new ItemsService('leads', { schema: req.schema });
			const conversaAtual = await conversasService.readOne(conversaId, {
				fields: ['lead_id', 'stage']
			});

			if (conversaAtual?.lead_id) {
				const leadAtual = await leadsService.readOne(conversaAtual.lead_id);
				const updates = {};

				// Extrair CPF
				if (!leadAtual.cpf) {
					const cpf = extractCpfFromMessage(finalBody);
					if (cpf) updates.cpf = cpf;
				}

				// Extrair email
				if (!leadAtual.email) {
					const email = extractEmailFromMessage(finalBody);
					if (email) updates.email = email;
				}

				// Extrair orçamento
				if (!leadAtual.orcamento_min || !leadAtual.orcamento_max) {
					const orcamento = extractOrcamentoFromMessage(finalBody);
					if (orcamento) {
						if (orcamento.min) updates.orcamento_min = orcamento.min;
						if (orcamento.max) updates.orcamento_max = orcamento.max;
					}
				}

				// Extrair renda mensal
				if (!leadAtual.renda_mensal) {
					const renda = extractRendaMensalFromMessage(finalBody);
					if (renda) updates.renda_mensal = renda;
				}

				// Atualizar última interação
				updates.ultima_interacao = new Date();

				// Aplicar updates
				if (Object.keys(updates).length > 1) {
					await leadsService.updateOne(conversaAtual.lead_id, updates);
					logger.info(`✅ Lead atualizado com ${Object.keys(updates).length} campos`);
				}

				// Recarregar lead com dados atualizados
				const leadAtualizado = await leadsService.readOne(conversaAtual.lead_id);

				// 7. Verificar se pode fazer matching de imóveis
				if (hasEnoughDataForMatching(leadAtualizado)) {
					logger.info('🏠 Critérios suficientes, buscando imóveis...');

					const propertiesService = new ItemsService('properties', { schema: req.schema });
					const matchQuery = buildPropertyMatchQuery(leadAtualizado);
					
					// Adicionar filtro de company_id
					matchQuery._and.push({ company_id: { _eq: company.id } });

					const properties = await propertiesService.readByQuery({
						filter: matchQuery,
						limit: 5,
						fields: ['id', 'titulo', 'tipo', 'preco', 'quartos', 'banheiros', 'area_total', 'cidade', 'bairro', 'descricao']
					});

					if (properties.length > 0) {
						// Calcular scores e ordenar
						const scoredProperties = properties
							.map(prop => ({
								...prop,
								score: calculateMatchScore(prop, leadAtualizado)
							}))
							.sort((a, b) => b.score - a.score);

						// Enviar top 3
						const topProperties = scoredProperties.slice(0, 3);
						logger.info(`📤 Enviando ${topProperties.length} imóveis compatíveis`);

						for (const property of topProperties) {
							const propertyMessage = buildPropertyPreviewMessage(property);

							await fetch(`${process.env.PUBLIC_URL}/twilio/send-message`, {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									to: telefone,
									message: propertyMessage,
									company_id: company.id
								})
							});

							await mensagensService.createOne({
								conversa_id: conversaId,
								direction: 'outgoing',
								message_type: 'text',
								content: propertyMessage,
								status: 'sent',
								sent_at: new Date()
							});

							// Pequeno delay entre mensagens
							await new Promise(resolve => setTimeout(resolve, 1000));
						}

						// Atualizar stage para apresentacao
						await conversasService.updateOne(conversaId, {
							stage: 'apresentacao'
						});
					} else {
						// Nenhum imóvel encontrado
						const noMatchMsg = buildNoMatchMessage(leadAtualizado);

						await fetch(`${process.env.PUBLIC_URL}/twilio/send-message`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								to: telefone,
								message: noMatchMsg,
								company_id: company.id
							})
						});

						await mensagensService.createOne({
							conversa_id: conversaId,
							direction: 'outgoing',
							message_type: 'text',
							content: noMatchMsg,
							status: 'sent',
							sent_at: new Date()
						});

						// Atualizar stage para sem_match
						await conversasService.updateOne(conversaId, {
							stage: 'sem_match'
						});
					}
				} else {
					// Ainda coletando dados
					logger.info('📝 Ainda coletando informações do lead...');
					
					// TODO: Resposta com IA solicitando mais informações
					const collectingResponse = `Entendi! Pode me contar mais sobre o que você procura? Por exemplo:\n\n• Qual o seu orçamento?\n• Prefere alguma região específica?\n• Quantos quartos precisa?`;

					await fetch(`${process.env.PUBLIC_URL}/twilio/send-message`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							to: telefone,
							message: collectingResponse,
							company_id: company.id
						})
					});

					await mensagensService.createOne({
						conversa_id: conversaId,
						direction: 'outgoing',
						message_type: 'text',
						content: collectingResponse,
						status: 'sent',
						sent_at: new Date()
					});
				}
			}

			// Salvar resposta
			await mensagensService.createOne({
				conversa_id: conversaId,
				direction: 'outgoing',
				message_type: 'text',
				content: simpleResponse,
				status: 'sent',
				sent_at: new Date()
			});

			return {
				success: true,
				message: 'Mensagem processada',
				ai_response: simpleResponse
			};

		} catch (error) {
			logger.error('❌ Erro ao processar mensagem', {
				error: error.message,
				stack: error.stack
			});

			return {
				success: false,
				error: 'Falha ao processar mensagem: ' + error.message
			};
		}
	}
};
