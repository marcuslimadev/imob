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
 * Processar mensagem com OpenAI GPT e gerar resposta
 * Baseado no OpenAIService.php do projeto legado
 */
async function processMessageWithAI(message, conversationHistory, company, isFromAudio, logger, lead = null) {
	try {
		if (!company.openai_api_key) {
			logger.warn('OpenAI API Key não configurada');
			return { success: false, error: 'OpenAI não configurada' };
		}

		const assistantName = company.ai_assistant_name || 'Teresa';
		const companyName = company.nome_fantasia || 'Exclusiva Lar Imóveis';
		
		const audioInstruction = isFromAudio
			? "\n- O cliente acabou de enviar um ÁUDIO que foi transcrito. Responda de forma natural, mostrando que você OUVIU e ENTENDEU o que ele disse. Use expressões como 'Entendi!', 'Certo!', 'Perfeito!' para confirmar que você ouviu."
			: "";

		// Montar contexto de dados faltantes do lead
		let dadosFaltantes = [];
		if (lead) {
			if (!lead.budget_min && !lead.budget_max) dadosFaltantes.push('orçamento');
			if (!lead.localizacao) dadosFaltantes.push('localização/bairro');
			if (!lead.quartos) dadosFaltantes.push('quantidade de quartos');
			if (!lead.email) dadosFaltantes.push('email');
			if (!lead.cpf) dadosFaltantes.push('CPF');
		}
		
		const dataCollectionContext = dadosFaltantes.length > 0
			? `\n\n⚠️ DADOS FALTANTES DO CLIENTE: ${dadosFaltantes.slice(0, 3).join(', ')}\n⚠️ Pergunte SUTILMENTE por UM desses dados ao final da resposta.`
			: '';

		const systemPrompt = `Você é ${assistantName}, atendente virtual da ${companyName}, uma imobiliária especializada.

Seu objetivo é:
- Ser cordial, profissional mas CASUAL e leve na conversa
- Coletar dados importantes de forma SUTIL (orçamento, localização, quartos, CPF, renda, email)
- SEMPRE terminar sua resposta perguntando por UM dado ou preferência
- Manter tom conversacional e amigável${audioInstruction}
${dataCollectionContext}

REGRAS CRÍTICAS:
- Respostas curtas e diretas (máximo 3-4 linhas)
- SEMPRE termine com uma pergunta sobre preferências ou dados
- Seja SUTIL: não diga "preciso" ou "é obrigatório", diga "pra te ajudar melhor"
- Se cliente informar CPF, confirme: 'Perfeito! CPF registrado ✅'
- Se cliente informar renda, confirme: 'Ótimo! Renda registrada ✅'
- Se cliente informar orçamento, confirme o valor entendido
- Use emojis com moderação 😊

EXEMPLOS DE ABORDAGEM:
- "Entendi! E qual região você prefere morar? 😊"
- "Perfeito! E qual seria seu orçamento aproximado?"
- "Show! Quantos quartos você precisa no mínimo?"`;

		const userPrompt = conversationHistory 
			? `Histórico:\n${conversationHistory}\n\nCliente: ${message}\n\nResponda:`
			: `Cliente: ${message}\n\nResponda:`;

		logger.info('🤖 Chamando OpenAI GPT...');

		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${company.openai_api_key}`
			},
			body: JSON.stringify({
				model: 'gpt-4o-mini',
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt }
				],
				temperature: 0.7,
				max_tokens: 300
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			logger.error('Erro OpenAI GPT: ' + response.status + ' - ' + errorText);
			return { success: false, error: 'OpenAI error: ' + response.status };
		}

		const result = await response.json();
		const content = result.choices?.[0]?.message?.content?.trim() || '';

		logger.info('✅ Resposta GPT: "' + content.substring(0, 100) + '..."');

		return { success: true, content };
	} catch (error) {
		logger.error('Erro ao processar com IA: ' + error.message);
		return { success: false, error: error.message };
	}
}

/**
 * Buscar histórico da conversa
 */
async function getConversationHistory(mensagensService, conversaId, limit = 10) {
	try {
		const messages = await mensagensService.readByQuery({
			filter: { conversa_id: { _eq: conversaId } },
			sort: ['-date_created'],
			limit: limit
		});

		// Inverter para ordem cronológica
		const sorted = messages.reverse();
		
		return sorted.map(m => {
			const prefix = m.direction === 'inbound' ? 'Cliente' : 'Assistente';
			return `${prefix}: ${m.content}`;
		}).join('\n');
	} catch (error) {
		return '';
	}
}

/**
 * Extrair CPF da mensagem (11 dígitos)
 */
function extractCpf(message) {
	const match = message.match(/(\d{11})|(\d{3}[\.\s]?\d{3}[\.\s]?\d{3}[\-\s]?\d{2})/);
	if (match) {
		const cpf = (match[1] || match[2]).replace(/\D/g, '');
		return cpf.length === 11 ? cpf : null;
	}
	return null;
}

/**
 * Extrair email da mensagem
 */
function extractEmail(message) {
	const match = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
	return match ? match[0].toLowerCase() : null;
}

/**
 * Extrair orçamento da mensagem
 */
function extractOrcamento(message) {
	const lower = message.toLowerCase();
	let budgetMin = null;
	let budgetMax = null;
	
	// Padrão "de X a/até Y" ou "entre X e Y"
	const rangeMatch = lower.match(/(?:de|entre)[\s:]*(?:r\$)?[\s]*([\d.,]+[\s]?(?:mil(?:hão|hões)?|k)?)\s*(?:a|até|e)\s*(?:r\$)?[\s]*([\d.,]+[\s]?(?:mil(?:hão|hões)?|k)?)/);
	if (rangeMatch) {
		budgetMin = parseMoneyValue(rangeMatch[1]);
		budgetMax = parseMoneyValue(rangeMatch[2]);
	} else {
		// "até X" ou "máximo X"
		const maxMatch = lower.match(/(?:até|máximo|max)[\s:]*(?:r\$)?[\s]*([\d.,]+[\s]?(?:mil(?:hão|hões)?|k)?)/);
		if (maxMatch) {
			budgetMax = parseMoneyValue(maxMatch[1]);
		}
	}
	
	return { budgetMin, budgetMax };
}

/**
 * Converter valor monetário para número
 */
function parseMoneyValue(value) {
	if (!value) return null;
	value = value.toLowerCase().trim();
	
	// "1.5 milhão" -> 1500000
	if (value.includes('milh')) {
		const num = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
		return num * 1000000;
	}
	// "500 mil" ou "500k" -> 500000
	if (value.includes('mil') || value.includes('k')) {
		const num = parseFloat(value.replace(/[^\d]/g, ''));
		return num * 1000;
	}
	// Número direto
	const clean = value.replace(/[^\d]/g, '');
	return clean ? parseInt(clean, 10) : null;
}

/**
 * Extrair quantidade de quartos
 */
function extractQuartos(message) {
	const match = message.match(/(\d+)\s*(?:quarto|dormitório|suite|suíte)/i);
	return match ? parseInt(match[1], 10) : null;
}

/**
 * Extrair localização/bairro
 */
function extractLocalizacao(message) {
	const lower = message.toLowerCase();
	// Bairros conhecidos de BH
	const bairros = ['savassi', 'funcionários', 'lourdes', 'sion', 'buritis', 'pampulha', 'centro', 'serra', 'santo agostinho', 'cidade nova', 'belvedere', 'mangabeiras'];
	for (const bairro of bairros) {
		if (lower.includes(bairro)) {
			return bairro.charAt(0).toUpperCase() + bairro.slice(1);
		}
	}
	
	// Padrão "bairro X"
	const bairroMatch = message.match(/bairro\s+([^\.,\n\r\(\)]{2,30})/i);
	if (bairroMatch) {
		return bairroMatch[1].trim();
	}
	
	return null;
}

/**
 * Detectar próximo stage baseado na mensagem e contexto
 * Conforme FUNIL_STAGES.md
 */
function detectNextStage(currentStage, message, leadData) {
	const lower = message.toLowerCase();
	
	// Keywords por intenção
	const keywords = {
		orcamento: ['reais', 'r$', 'mil', 'milhão', 'valor', 'orçamento', 'investir', 'pagar', 'custo'],
		localizacao: ['bairro', 'região', 'zona', 'perto', 'próximo', 'localização', 'onde', 'área'],
		preferencias: ['quarto', 'suite', 'suíte', 'vaga', 'garagem', 'elevador', 'piscina', 'academia'],
		interesse: ['código', 'ref', 'referência', 'gostei', 'interessante', 'quero ver', 'me interesso'],
		agendamento: ['agendar', 'visita', 'visitar', 'quando posso', 'horário', 'disponível', 'amanhã', 'hoje']
	};
	
	const containsKeyword = (category) => keywords[category].some(k => lower.includes(k));
	
	// Fluxo de progressão
	switch (currentStage) {
		case 'boas_vindas':
			return 'coleta_dados';
			
		case 'coleta_dados':
		case 'aguardando_info':
			// Tem dados suficientes? -> matching
			if ((leadData?.budget_min || leadData?.budget_max) && (leadData?.localizacao || leadData?.quartos)) {
				return 'matching';
			}
			if (containsKeyword('orcamento') || containsKeyword('localizacao') || containsKeyword('preferencias')) {
				return 'coleta_dados'; // Continua coletando
			}
			return 'aguardando_info';
			
		case 'matching':
		case 'apresentacao':
			if (containsKeyword('interesse')) return 'interesse';
			if (containsKeyword('agendamento')) return 'agendamento';
			return currentStage;
			
		case 'interesse':
			if (containsKeyword('agendamento')) return 'agendamento';
			return 'interesse';
			
		case 'sem_match':
			return 'refinamento';
			
		case 'refinamento':
			return 'coleta_dados';
	}
	
	return currentStage;
}

/**
 * Atualizar dados do lead a partir da mensagem
 */
async function extractAndUpdateLeadData(leadsService, lead, message, logger) {
	if (!lead || !message) return lead;
	
	const updates = {};
	
	// CPF
	const cpf = extractCpf(message);
	if (cpf && !lead.cpf) {
		updates.cpf = cpf;
		logger.info('📝 CPF extraído: ' + cpf);
	}
	
	// Email
	const email = extractEmail(message);
	if (email && !lead.email) {
		updates.email = email;
		logger.info('📝 Email extraído: ' + email);
	}
	
	// Orçamento
	const { budgetMin, budgetMax } = extractOrcamento(message);
	if (budgetMin && !lead.budget_min) {
		updates.budget_min = budgetMin;
		logger.info('📝 Budget mín extraído: ' + budgetMin);
	}
	if (budgetMax && !lead.budget_max) {
		updates.budget_max = budgetMax;
		logger.info('📝 Budget máx extraído: ' + budgetMax);
	}
	
	// Quartos
	const quartos = extractQuartos(message);
	if (quartos && !lead.quartos) {
		updates.quartos = quartos;
		logger.info('📝 Quartos extraído: ' + quartos);
	}
	
	// Localização
	const localizacao = extractLocalizacao(message);
	if (localizacao && !lead.localizacao) {
		updates.localizacao = localizacao;
		logger.info('📝 Localização extraída: ' + localizacao);
	}
	
	// Aplicar updates
	if (Object.keys(updates).length > 0) {
		await leadsService.updateOne(lead.id, updates);
		Object.assign(lead, updates);
		logger.info('✅ Lead atualizado com ' + Object.keys(updates).length + ' campo(s)');
	}
	
	return lead;
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
			let lead = null;
			
			// Service de leads
			const leadsService = new ItemsService('leads', { 
				schema, 
				accountability: { admin: true } 
			});
			
			if (existingConversas.length > 0) {
				conversa = existingConversas[0];
				logger.info('Conversa existente: ' + conversa.id);
				
				// Buscar lead vinculado se existir
				if (conversa.lead_id) {
					try {
						lead = await leadsService.readOne(conversa.lead_id);
					} catch (e) {
						logger.warn('Lead não encontrado: ' + conversa.lead_id);
					}
				}
			} else {
				isNewConversation = true;
				
				// Criar lead primeiro
				const leadId = await leadsService.createOne({
					company_id: company.id,
					name: normalized.profile_name || 'Cliente WhatsApp',
					phone: clientPhone,
					status: 'new'
				});
				lead = await leadsService.readOne(leadId);
				logger.info('Novo lead criado: ' + leadId);
				
				// Criar conversa vinculada ao lead
				const conversaId = await conversasService.createOne({
					company_id: company.id,
					telefone: clientPhone,
					whatsapp_name: normalized.profile_name,
					lead_id: leadId,  // Vincular ao lead
					canal: 'whatsapp',
					status: 'ativa',
					stage: 'boas_vindas',
					ultima_mensagem: normalized.message
				});
				conversa = await conversasService.readOne(conversaId);
				logger.info('Nova conversa criada: ' + conversaId + ' vinculada ao lead: ' + leadId);
			}
			
			// Se conversa existe mas não tem lead, criar e vincular
			if (!conversa.lead_id) {
				const leadId = await leadsService.createOne({
					company_id: company.id,
					name: normalized.profile_name || conversa.whatsapp_name || 'Cliente WhatsApp',
					phone: clientPhone,
					status: 'new'
				});
				lead = await leadsService.readOne(leadId);
				
				await conversasService.updateOne(conversa.id, { lead_id: leadId });
				conversa.lead_id = leadId;
				logger.info('Lead criado e vinculado à conversa existente: ' + leadId);
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

			// === EXTRAIR E ATUALIZAR DADOS DO LEAD ===
			const messageContent = transcription || normalized.message || '';
			if (lead && messageContent.trim()) {
				lead = await extractAndUpdateLeadData(leadsService, lead, messageContent, logger);
			}

			// === DETECTAR E ATUALIZAR STAGE ===
			const currentStage = conversa.stage || 'boas_vindas';
			const newStage = detectNextStage(currentStage, messageContent, lead);
			if (newStage !== currentStage) {
				await conversasService.updateOne(conversa.id, { stage: newStage });
				conversa.stage = newStage;
				logger.info('📊 Stage atualizado: ' + currentStage + ' → ' + newStage);
			}

			// === RESPOSTA AUTOMÁTICA ===
			const assistantName = company.ai_assistant_name || 'Teresa';
			const companyName = company.nome_fantasia || 'Exclusiva Lar Imóveis';
			const preferredName = extractPreferredName(normalized.profile_name);
			const isFromAudio = normalized.message_type === 'audio';
			
			let responseMessage = null;
			
			// Se for nova conversa, enviar boas-vindas
			if (isNewConversation) {
				responseMessage = buildWelcomeMessage(assistantName, preferredName, companyName);
				logger.info('📨 Enviando boas-vindas...');
			} else if (messageContent && messageContent.trim()) {
				// Conversa existente - processar com IA
				
				// Enviar feedback imediato se for áudio
				if (isFromAudio) {
					const feedbackMsg = "🎤 Recebi seu áudio! Vou processar e já te respondo... ⏳";
					await sendTwilioMessage(company, clientPhone, feedbackMsg, logger);
					await mensagensService.createOne({
						company_id: company.id,
						conversa_id: conversa.id,
						direction: 'outbound',
						content: feedbackMsg,
						message_type: 'text',
						status: 'sent'
					});
				}
				
				// Buscar histórico
				const history = await getConversationHistory(mensagensService, conversa.id, 10);
				
				// Processar com IA (passando dados do lead para contexto)
				logger.info('🤖 Processando com IA... Stage: ' + conversa.stage);
				const aiResult = await processMessageWithAI(
					messageContent,
					history,
					company,
					isFromAudio,
					logger,
					lead // Passar dados do lead
				);
				
				if (aiResult.success && aiResult.content) {
					responseMessage = aiResult.content;
				} else {
					// Fallback se IA falhar
					logger.warn('⚠️ IA falhou, usando resposta padrão');
					responseMessage = `Entendi! ${isFromAudio ? 'Ouvi seu áudio. ' : ''}Um momento que vou verificar as melhores opções pra você. 😊`;
				}
			}
			
			// Enviar resposta se houver
			if (responseMessage) {
				const sendResult = await sendTwilioMessage(company, clientPhone, responseMessage, logger);
				
				if (sendResult.success) {
					// Salvar mensagem enviada
					await mensagensService.createOne({
						company_id: company.id,
						conversa_id: conversa.id,
						direction: 'outbound',
						content: responseMessage,
						message_type: 'text',
						message_sid: sendResult.message_sid,
						status: 'sent'
					});
					
					// Atualizar conversa com stage correto
					await conversasService.updateOne(conversa.id, {
						stage: isNewConversation ? 'coleta_dados' : conversa.stage,
						ultima_mensagem: responseMessage,
						ultima_atividade: new Date().toISOString()
					});
					
					logger.info('✅ Resposta enviada com sucesso!');
				} else {
					logger.error('❌ Falha ao enviar resposta: ' + sendResult.error);
				}
			}

			logger.info('Webhook processado com sucesso!');
			res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');

		} catch (error) {
			logger.error('❌ Erro webhook:', error?.message || error);
			logger.error('Stack:', error?.stack || 'N/A');
			console.error('ERRO COMPLETO:', error);
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

