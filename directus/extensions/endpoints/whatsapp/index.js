/**
 * Directus Extension: WhatsApp Webhook Endpoint (Multi-Tenant)
 * Baseado no WhatsAppService do projeto /imobi/backend
 * Implementa o funil de atendimento conforme FUNIL_STAGES.md
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Baixar mídia da Twilio (com autenticação)
 */
async function downloadTwilioMedia(mediaUrl, accountSid, authToken, logger) {
	try {
		logger.info('🎤 Baixando áudio de: ' + mediaUrl);
		
		const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
		
		const response = await fetch(mediaUrl, {
			headers: {
				'Authorization': `Basic ${auth}`
			},
			redirect: 'follow'
		});
		
		if (!response.ok) {
			logger.error('Erro ao baixar mídia: HTTP ' + response.status);
			return { success: false, error: 'HTTP ' + response.status };
		}
		
		const arrayBuffer = await response.arrayBuffer();
		const data = Buffer.from(arrayBuffer);
		
		logger.info('✅ Áudio baixado: ' + data.length + ' bytes');
		return { success: true, data };
	} catch (error) {
		logger.error('Erro ao baixar mídia: ' + error.message);
		return { success: false, error: error.message };
	}
}

/**
 * Transcrever áudio usando OpenAI Whisper API
 */
async function transcribeAudio(audioBuffer, openaiApiKey, logger) {
	try {
		logger.info('🎙️ Iniciando transcrição com Whisper...');
		
		// Salvar temporariamente
		const tempPath = path.join(os.tmpdir(), `audio_${Date.now()}_${Math.random().toString(36).substring(7)}.ogg`);
		fs.writeFileSync(tempPath, audioBuffer);
		logger.info('💾 Áudio salvo em: ' + tempPath);
		
		// Criar FormData para Whisper API
		const formData = new FormData();
		const audioBlob = new Blob([audioBuffer], { type: 'audio/ogg' });
		formData.append('file', audioBlob, 'audio.ogg');
		formData.append('model', 'whisper-1');
		formData.append('language', 'pt');
		
		const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${openaiApiKey}`
			},
			body: formData
		});
		
		// Limpar arquivo temporário
		try { fs.unlinkSync(tempPath); } catch (e) {}
		
		if (!response.ok) {
			const errorText = await response.text();
			logger.error('Erro Whisper API: ' + response.status + ' - ' + errorText);
			return { success: false, error: 'Whisper API error: ' + response.status };
		}
		
		const result = await response.json();
		logger.info('✅ Transcrição concluída: "' + (result.text || '').substring(0, 100) + '..."');
		
		return { success: true, text: result.text || '' };
	} catch (error) {
		logger.error('Erro na transcrição: ' + error.message);
		return { success: false, error: error.message };
	}
}

/**
 * Buscar empresa pelo numero WhatsApp
 */
async function getCompanyByWhatsAppNumber(database, whatsappNumber) {
	try {
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

/**
 * Parser simples de application/x-www-form-urlencoded
 */
function parseUrlEncoded(str) {
	const result = {};
	if (!str) return result;
	str.split('&').forEach(pair => {
		const [key, value] = pair.split('=').map(s => decodeURIComponent(s.replace(/\+/g, ' ')));
		if (key) result[key] = value || '';
	});
	return result;
}

/**
 * Extrair primeiro nome do cliente
 */
function extractPreferredName(nome) {
	if (!nome) return null;
	const partes = nome.trim().split(/\s+/);
	return partes[0] || nome;
}

/**
 * Gerar mensagem de boas-vindas (primeira mensagem)
 */
function buildWelcomeMessage(assistantName, preferredName, companyName) {
	const saudacao = preferredName ? `Oi, *${preferredName}*!` : 'Olá!';
	const nomePergunta = preferredName 
		? `Posso te chamar de ${preferredName}? Se preferir outro nome, é só me avisar.`
		: 'Como posso te chamar para registrar direitinho no nosso atendimento?';

	return `${saudacao} Eu sou a ${assistantName}, da *${companyName}*. Vou te ajudar a encontrar o imóvel ideal. ${nomePergunta}

Me conta um pouco sobre o que você procura:
• Qual o valor que você tem em mente?
• Qual região você prefere?
• Quantos quartos você precisa?

Pode mandar texto ou áudio, como preferir. 😊`;
}

/**
 * Enviar mensagem via Twilio API
 */
async function sendTwilioMessage(company, toPhone, message, logger) {
	try {
		if (!company.twilio_account_sid || !company.twilio_auth_token) {
			logger.warn('Twilio nao configurado para empresa: ' + company.id);
			return { success: false, error: 'Twilio nao configurado' };
		}

		const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${company.twilio_account_sid}/Messages.json`;
		const auth = Buffer.from(`${company.twilio_account_sid}:${company.twilio_auth_token}`).toString('base64');

		const formData = new URLSearchParams();
		formData.append('From', `whatsapp:${company.twilio_whatsapp_number}`);
		formData.append('To', `whatsapp:+${toPhone}`);
		formData.append('Body', message);

		logger.info('Enviando mensagem Twilio para: +' + toPhone);

		const response = await fetch(twilioUrl, {
			method: 'POST',
			headers: {
				'Authorization': `Basic ${auth}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: formData.toString()
		});

		const result = await response.json();
		
		if (!response.ok) {
			logger.error('Erro Twilio: ' + JSON.stringify(result));
			return { success: false, error: result.message || 'Erro Twilio' };
		}

		logger.info('Mensagem enviada! SID: ' + result.sid);
		return { success: true, message_sid: result.sid };
	} catch (error) {
		logger.error('Erro ao enviar Twilio: ' + error.message);
		return { success: false, error: error.message };
	}
}

export default {
	id: 'whatsapp',
	handler: (router, { services, logger, database, getSchema }) => {
		const { ItemsService } = services;

		// Health check
		router.get('/health', (req, res) => {
			res.json({ status: 'ok', endpoint: 'whatsapp', timestamp: new Date().toISOString() });
		});

		/**
		 * Detectar origem do webhook (Twilio ou Evolution API)
		 */
		function detectWebhookSource(data) {
			if (data.MessageSid || data.AccountSid) return 'twilio';
			if (data.event || data.instance || data.data) return 'evolution';
			return 'unknown';
		}

	/**
	 * Normalizar dados do webhook para formato padrão
	 */
	function normalizeWebhookData(data, source) {
		if (source === 'twilio') {
			const numMedia = parseInt(data.NumMedia || '0', 10);
			const mediaUrl = numMedia > 0 ? (data.MediaUrl0 || null) : null;
			const mediaType = numMedia > 0 ? (data.MediaContentType0 || null) : null;
			
			// Detectar tipo de mensagem
			let messageType = 'text';
			if (mediaType) {
				if (mediaType.startsWith('audio/')) messageType = 'audio';
				else if (mediaType.startsWith('image/')) messageType = 'image';
				else if (mediaType.startsWith('video/')) messageType = 'video';
				else if (mediaType.includes('pdf') || mediaType.includes('document')) messageType = 'document';
			}
			
			return {
				from: data.From || null,
				to: data.To || null,
				message: data.Body || null,
				message_id: data.MessageSid || null,
				profile_name: data.ProfileName || 'Cliente',
				media_url: mediaUrl,
				media_type: mediaType,
				message_type: messageType,
				num_media: numMedia,
				source: 'twilio'
			};
		}
		
		if (source === 'evolution') {
			const messageData = data.data || {};
			const key = messageData.key || {};
			const message = messageData.message || {};
			const pushName = messageData.pushName || null;
			
			const messageText = message.conversation 
				|| (message.extendedTextMessage && message.extendedTextMessage.text)
				|| (message.imageMessage && message.imageMessage.caption)
				|| null;
			
			const remoteJid = key.remoteJid || '';
			const phone = remoteJid.replace(/[^0-9]/g, '');
			
			return {
				from: phone ? `whatsapp:+${phone}` : null,
				to: null,
				message: messageText,
				message_id: key.id || null,
				profile_name: pushName || 'Cliente',
				media_url: null,
				source: 'evolution'
			};
		}
		
		return {
			from: data.from || data.From || null,
			to: data.to || data.To || null,
			message: data.message || data.Body || data.text || null,
			message_id: data.id || data.MessageSid || null,
			profile_name: data.name || data.ProfileName || 'Cliente',
			media_url: null,
			source: 'unknown'
		};
	}

	// Webhook principal do Twilio
	router.post('/webhook', async (req, res) => {
		try {
			logger.info('=== WEBHOOK RECEBIDO v2.0 ===');
			logger.info('Content-Type: ' + (req.headers['content-type'] || 'NONE'));
			logger.info('req.body type: ' + typeof req.body);
			logger.info('req.body: ' + JSON.stringify(req.body || {}));
			
			// Tentar parsear body se vier vazio (Twilio manda x-www-form-urlencoded)
			let webhookData = req.body || {};
			if (Object.keys(webhookData).length === 0) {
				// Tentar ler raw body e parsear
				let rawBody = '';
				for await (const chunk of req) {
					rawBody += chunk.toString();
				}
				logger.info('Raw body: ' + rawBody.substring(0, 300));
				if (rawBody) {
					webhookData = parseUrlEncoded(rawBody);
				}
			}
			
			const source = detectWebhookSource(webhookData);
			
			logger.info('Source: ' + source);
			logger.info('Payload: ' + JSON.stringify(webhookData));
			
			const normalized = normalizeWebhookData(webhookData, source);
			
			logger.info('De: ' + normalized.from);
			logger.info('Nome: ' + normalized.profile_name);
			logger.info('Mensagem: ' + normalized.message);
			logger.info('Tipo: ' + normalized.message_type);
			logger.info('Mídia: ' + (normalized.media_url ? 'Sim' : 'Não'));
			
			// === TRANSCRIÇÃO DE ÁUDIO ===
			let transcription = null;
			if (normalized.message_type === 'audio' && normalized.media_url) {
				logger.info('🎤 Áudio detectado! Iniciando transcrição...');
				
				// Precisamos das credenciais da empresa para baixar mídia e transcrever
				const tempCompany = await getCompanyByWhatsAppNumber(database, normalized.to);
				if (tempCompany && tempCompany.openai_api_key) {
					// Baixar áudio da Twilio
					const audioData = await downloadTwilioMedia(
						normalized.media_url,
						tempCompany.twilio_account_sid,
						tempCompany.twilio_auth_token,
						logger
					);
					
					if (audioData.success) {
						// Transcrever com Whisper
						const transcriptionResult = await transcribeAudio(
							audioData.data,
							tempCompany.openai_api_key,
							logger
						);
						
						if (transcriptionResult.success) {
							transcription = transcriptionResult.text;
							logger.info('✅ Transcrição: "' + transcription + '"');
							
							// Usar transcrição como mensagem se não tiver texto
							if (!normalized.message && transcription) {
								normalized.message = transcription;
							}
						} else {
							logger.warn('⚠️ Transcrição falhou: ' + transcriptionResult.error);
							transcription = '[Áudio não pôde ser transcrito]';
						}
					} else {
						logger.warn('⚠️ Download de áudio falhou: ' + audioData.error);
						transcription = '[Áudio não pôde ser baixado]';
					}
				} else {
					logger.warn('⚠️ OpenAI API Key não configurada para empresa');
					transcription = '[Transcrição indisponível - API Key não configurada]';
				}
			}

			if (!normalized.to && !normalized.from) {
				logger.warn('Dados insuficientes no webhook');
				return res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
			}

			// Buscar empresa pelo numero WhatsApp
			const company = await getCompanyByWhatsAppNumber(database, normalized.to);
			if (!company) {
				logger.warn('Empresa nao encontrada para: ' + normalized.to);
				return res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
			}

			logger.info('Empresa: ' + (company.nome_fantasia || company.slug));

			const clientPhone = (normalized.from || '').replace('whatsapp:', '').replace(/\D/g, '');
			const schema = await getSchema();

			// Buscar ou criar conversa
			const conversasService = new ItemsService('conversas', { 
				schema, 
				accountability: { admin: true } 
			});

			const existingConversas = await conversasService.readByQuery({
				filter: {
					company_id: { _eq: company.id },
					telefone: { _eq: clientPhone },
					status: { _neq: 'finalizada' }
				},
				limit: 1
			});

			let conversa;
			let isNewConversation = false;
			
			if (existingConversas.length > 0) {
				conversa = existingConversas[0];
				logger.info('Conversa existente: ' + conversa.id);
			} else {
				isNewConversation = true;
				const conversaId = await conversasService.createOne({
					company_id: company.id,
					telefone: clientPhone,
					whatsapp_name: normalized.profile_name,
					canal: 'whatsapp',
					status: 'ativa',
					stage: 'boas_vindas',
					ultima_mensagem: normalized.message
				});
				conversa = await conversasService.readOne(conversaId);
				logger.info('Nova conversa criada: ' + conversaId);
			}

			// Salvar mensagem recebida
			const mensagensService = new ItemsService('mensagens', { 
				schema, 
				accountability: { admin: true } 
			});

			// Preparar dados da mensagem
			const messageData = {
				company_id: company.id,
				conversa_id: conversa.id,
				direction: 'inbound',
				content: normalized.message || transcription || '[Mídia sem texto]',
				message_type: normalized.message_type || 'text',
				message_sid: normalized.message_id,
				status: 'received'
			};
			
			// Adicionar campos de mídia se presentes
			if (normalized.media_url) {
				messageData.media_url = normalized.media_url;
			}
			if (transcription) {
				messageData.transcription = transcription;
			}
			
			await mensagensService.createOne(messageData);
			
			// Atualizar conversa
			const conversationMessage = transcription || normalized.message || '[Áudio]';
			await conversasService.updateOne(conversa.id, { 
				ultima_mensagem: conversationMessage,
				ultima_atividade: new Date().toISOString()
			});

			logger.info('Mensagem recebida salva! Tipo: ' + messageData.message_type);

			// === RESPOSTA AUTOMÁTICA ===
			// Se for nova conversa, enviar boas-vindas
			if (isNewConversation) {
				const assistantName = company.ai_assistant_name || 'Teresa';
				const companyName = company.nome_fantasia || 'Exclusiva Lar Imóveis';
				const preferredName = extractPreferredName(normalized.profile_name);
				
				const welcomeMessage = buildWelcomeMessage(assistantName, preferredName, companyName);
				
				// Enviar mensagem de boas-vindas
				const sendResult = await sendTwilioMessage(company, clientPhone, welcomeMessage, logger);
				
				if (sendResult.success) {
					// Salvar mensagem enviada
					await mensagensService.createOne({
						company_id: company.id,
						conversa_id: conversa.id,
						direction: 'outbound',
						content: welcomeMessage,
						message_type: 'text',
						message_sid: sendResult.message_sid,
						status: 'sent'
					});
					
					// Atualizar stage da conversa
					await conversasService.updateOne(conversa.id, {
						stage: 'coleta_dados',
						ultima_mensagem: welcomeMessage
					});
					
					logger.info('Boas-vindas enviadas com sucesso!');
				}
			}

			logger.info('Webhook processado com sucesso!');
			res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');

		} catch (error) {
			logger.error('❌ Erro webhook:', error.message);
			logger.error(error.stack);
			res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
		}
	});

	// Status callback
	router.post('/status', (req, res) => {
		logger.info('Status callback:', JSON.stringify(req.body));
		res.json({ ok: true });
	});

	// Enviar mensagem
	router.post('/send', async (req, res) => {
		try {
			const { company_id, to, message } = req.body;
			if (!company_id || !to || !message) {
				return res.status(400).json({ error: 'company_id, to e message obrigatorios' });
			}

			const company = await database
				.select('twilio_account_sid', 'twilio_auth_token', 'twilio_whatsapp_number')
				.from('companies')
				.where({ id: company_id })
				.first();

			if (!company?.twilio_account_sid) {
				return res.status(400).json({ error: 'Twilio nao configurado' });
			}

			const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${company.twilio_account_sid}/Messages.json`;
			const auth = Buffer.from(`${company.twilio_account_sid}:${company.twilio_auth_token}`).toString('base64');

			const formData = new URLSearchParams();
			formData.append('From', `whatsapp:${company.twilio_whatsapp_number}`);
			formData.append('To', `whatsapp:${to}`);
			formData.append('Body', message);

			const response = await fetch(twilioUrl, {
				method: 'POST',
				headers: {
					'Authorization': `Basic ${auth}`,
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: formData.toString()
			});

			const result = await response.json();
			if (!response.ok) {
				return res.status(400).json({ error: result.message });
			}

			res.json({ success: true, sid: result.sid });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	});
	}
};

