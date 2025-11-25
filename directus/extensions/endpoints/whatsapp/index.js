/**
 * Directus Extension: WhatsApp Webhook Endpoint
 * Migrado de: backend/app/Http/Controllers/WebhookController.php
 * 
 * Endpoints disponíveis:
 * - POST /whatsapp - Receber webhooks do Twilio/Evolution API
 * - POST /whatsapp/status - Status callbacks do Twilio
 */

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
			logger.info('👤 Nome:', normalizedData.profile_name || 'N/A');
			logger.info('💬 Mensagem:', normalizedData.message || '[mídia]');
			logger.info('🆔 Message ID:', normalizedData.message_id || 'N/A');
			logger.info('🔖 Origem:', source);
			logger.info('📦 Payload completo:', webhookData);
			logger.info('─────────────────────────────────────────────────────────────────');

			// Processar mensagem via WhatsApp Service
			const result = await processIncomingMessage(normalizedData, { services, logger, database });

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
	 * Processar mensagem recebida
	 * (Simplificação da lógica do WhatsAppService)
	 */
	async function processIncomingMessage(webhookData, { services, logger, database }) {
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

			if (!from) {
				return { success: false, error: 'Número de origem não identificado' };
			}

			// Limpar telefone
			const telefone = from.replace('whatsapp:', '');

			// 1. Obter ou criar conversa
			const conversasService = new ItemsService('conversas', { schema: req.schema });
			
			let conversa = await conversasService.readByQuery({
				filter: {
					telefone: { _eq: telefone },
					status: { _neq: 'finalizada' }
				},
				limit: 1
			});

			if (!conversa || conversa.length === 0) {
				// Criar nova conversa
				const novaConversa = await conversasService.createOne({
					telefone,
					whatsapp_name: profileName,
					status: 'ativa',
					stage: 'boas_vindas',
					iniciada_em: new Date()
				});

				conversa = [novaConversa];
				logger.info('Nova conversa criada', { id: novaConversa.id, telefone });
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
				
				const assistantName = process.env.AI_ASSISTANT_NAME || 'Teresa';
				const welcomeMessage = `Olá! Sou ${assistantName}, atendente virtual da Exclusiva Lar Imóveis! 👋

Como posso te ajudar hoje? 😊`;

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

			// 6. Processar mensagem regular com IA
			logger.info('📨 Processando mensagem regular com IA...');
			
			// TODO: Implementar processamento completo com OpenAI
			// Por enquanto, resposta simples
			const simpleResponse = `Recebi sua mensagem: "${finalBody}". O processamento completo com IA está em desenvolvimento!`;

			// Enviar via Twilio
			await fetch(`${process.env.PUBLIC_URL}/twilio/send-message`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					to: telefone,
					message: simpleResponse
				})
			});

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
