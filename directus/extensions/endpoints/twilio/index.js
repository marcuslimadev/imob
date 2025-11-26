/**
 * Directus Extension: Twilio Client (Multi-Tenant)
 * Migrado de: backend/app/Services/TwilioService.php
 * 
 * Endpoints disponíveis:
 * - POST /twilio/send-message - Enviar mensagem WhatsApp
 * - POST /twilio/send-image - Enviar imagem WhatsApp
 * - POST /twilio/download-media - Baixar mídia do Twilio
 * 
 * Multi-Tenant:
 * - Todos endpoints recebem company_id
 * - Usa credenciais Twilio específicas da empresa
 * - Usa número WhatsApp configurado pela empresa
 */

import fetch from 'node-fetch';
import { getCompanySettings } from '../../shared/company-settings.js';

export default (router, { env, logger, database }) => {
	// Fallback para variáveis de ambiente (desenvolvimento)
	const DEFAULT_TWILIO_ACCOUNT_SID = env.TWILIO_ACCOUNT_SID;
	const DEFAULT_TWILIO_AUTH_TOKEN = env.TWILIO_AUTH_TOKEN;
	const DEFAULT_TWILIO_WHATSAPP_NUMBER = env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

	/**
	 * Buscar configurações Twilio da empresa
	 * @param {number} companyId - ID da empresa
	 * @returns {Object} - { accountSid, authToken, whatsappNumber }
	 */
	async function getCompanyTwilioConfig(companyId) {
		try {
			if (!companyId) {
				logger.warn('⚠️  company_id não fornecido, usando configurações padrão');
				return {
					accountSid: DEFAULT_TWILIO_ACCOUNT_SID,
					authToken: DEFAULT_TWILIO_AUTH_TOKEN,
					whatsappNumber: DEFAULT_TWILIO_WHATSAPP_NUMBER
				};
			}

			const settings = await getCompanySettings({ database }, companyId);
			
			logger.info('🏢 Usando configurações Twilio da empresa', {
				company_id: companyId,
				whatsapp_number: settings.twilio_whatsapp_number
			});

			return {
				accountSid: settings.twilio_account_sid,
				authToken: settings.twilio_auth_token,
				whatsappNumber: settings.twilio_whatsapp_number
			};
		} catch (error) {
			logger.error('❌ Erro ao buscar configurações da empresa:', error.message);
			logger.warn('⚠️  Usando configurações padrão (fallback)');
			
			return {
				accountSid: DEFAULT_TWILIO_ACCOUNT_SID,
				authToken: DEFAULT_TWILIO_AUTH_TOKEN,
				whatsappNumber: DEFAULT_TWILIO_WHATSAPP_NUMBER
			};
		}
	}

	/**
	 * Enviar credenciais Base64 para autenticação
	 */
	const getAuthHeader = (accountSid, authToken) => {
		const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
		return `Basic ${credentials}`;
	};

	/**
	 * POST /twilio/send-message
	 * Enviar mensagem de texto WhatsApp
	 * 
	 * Body: {
	 *   company_id: number,
	 *   to: string (formato: whatsapp:+5511999999999),
	 *   message: string
	 * }
	 */
	router.post('/send-message', async (req, res) => {
		try {
			const { company_id, to, message } = req.body;

			if (!to || !message) {
				return res.status(400).json({
					success: false,
					error: 'to e message são obrigatórios'
				});
			}

			// Buscar configurações da empresa
			const config = await getCompanyTwilioConfig(company_id);

			// Garantir formato whatsapp:+55...
			const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

			logger.info('📤 Enviando mensagem WhatsApp', {
				company_id,
				from: config.whatsappNumber,
				to: formattedTo,
				messageLength: message.length
			});

			const urlEncodedData = new URLSearchParams({
				From: config.whatsappNumber,  // ✅ Número da empresa
				To: formattedTo,
				Body: message
			});

			const response = await fetch(
				`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Authorization': getAuthHeader(config.accountSid, config.authToken)  // ✅ Credenciais da empresa
					},
					body: urlEncodedData
				}
			);

			const data = await response.json();

			if (response.status === 201) {
				logger.info('✅ Mensagem enviada com sucesso', {
					company_id,
					messageSid: data.sid,
					status: data.status
				});

				return res.json({
					success: true,
					message_sid: data.sid,
					status: data.status,
					to: data.to,
					from: data.from
				});
			}

			logger.error('❌ Falha ao enviar mensagem', {
				company_id,
				status: response.status,
				error: data
			});

			return res.status(response.status).json({
				success: false,
				error: 'Failed to send message',
				details: data
			});

		} catch (error) {
			logger.error('❌ Erro ao enviar mensagem', {
				error: error.message,
				stack: error.stack
			});

			return res.status(500).json({
				success: false,
				error: error.message
			});
		}
	});

	/**
	 * POST /twilio/send-image
	 * Enviar mensagem com imagem WhatsApp
	 * 
	 * Body: {
	 *   to: string,
	 *   message: string,
	 *   mediaUrl: string (URL pública da imagem)
	 * }
	 */
	router.post('/send-image', async (req, res) => {
		try {
			const { to, message, mediaUrl } = req.body;

			if (!to || !mediaUrl) {
				return res.status(400).json({
					success: false,
					error: 'to e mediaUrl são obrigatórios'
				});
			}

			const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

			logger.info('📤 Enviando imagem WhatsApp', {
				to: formattedTo,
				mediaUrl
			});

			const urlEncodedData = new URLSearchParams({
				From: TWILIO_WHATSAPP_NUMBER,
				To: formattedTo,
				Body: message || '',
				MediaUrl: mediaUrl
			});

			const response = await fetch(
				`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Authorization': getAuthHeader()
					},
					body: urlEncodedData
				}
			);

			const data = await response.json();

			if (response.status === 201) {
				logger.info('✅ Imagem enviada com sucesso', {
					messageSid: data.sid,
					status: data.status
				});

				return res.json({
					success: true,
					message_sid: data.sid,
					status: data.status,
					to: data.to,
					from: data.from,
					media_url: mediaUrl
				});
			}

			logger.error('❌ Falha ao enviar imagem', {
				status: response.status,
				error: data
			});

			return res.status(response.status).json({
				success: false,
				error: 'Failed to send image',
				details: data
			});

		} catch (error) {
			logger.error('❌ Erro ao enviar imagem', {
				error: error.message,
				stack: error.stack
			});

			return res.status(500).json({
				success: false,
				error: error.message
			});
		}
	});

	/**
	 * POST /twilio/download-media
	 * Baixar mídia (áudio, imagem, vídeo, documento) do Twilio
	 * 
	 * Body: {
	 *   mediaUrl: string (URL do Twilio)
	 * }
	 */
	router.post('/download-media', async (req, res) => {
		try {
			const { mediaUrl } = req.body;

			if (!mediaUrl) {
				return res.status(400).json({
					success: false,
					error: 'mediaUrl é obrigatório'
				});
			}

			logger.info('📥 Baixando mídia do Twilio', {
				mediaUrl
			});

			const response = await fetch(mediaUrl, {
				method: 'GET',
				headers: {
					'Authorization': getAuthHeader()
				}
			});

			if (response.ok) {
				const buffer = await response.buffer();
				const contentType = response.headers.get('content-type') || 'application/octet-stream';

				logger.info('✅ Mídia baixada com sucesso', {
					size: buffer.length,
					contentType
				});

				// Retornar como base64 para facilitar armazenamento
				return res.json({
					success: true,
					data: buffer.toString('base64'),
					contentType,
					size: buffer.length
				});
			}

			logger.error('❌ Falha ao baixar mídia', {
				status: response.status,
				statusText: response.statusText
			});

			return res.status(response.status).json({
				success: false,
				error: 'Failed to download media',
				details: response.statusText
			});

		} catch (error) {
			logger.error('❌ Erro ao baixar mídia', {
				error: error.message,
				stack: error.stack
			});

			return res.status(500).json({
				success: false,
				error: error.message
			});
		}
	});

	/**
	 * GET /twilio/message-status/:messageSid
	 * Consultar status de uma mensagem enviada
	 * 
	 * Params: messageSid
	 */
	router.get('/message-status/:messageSid', async (req, res) => {
		try {
			const { messageSid } = req.params;

			if (!messageSid) {
				return res.status(400).json({
					success: false,
					error: 'messageSid é obrigatório'
				});
			}

			logger.info('🔍 Consultando status da mensagem', {
				messageSid
			});

			const response = await fetch(
				`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages/${messageSid}.json`,
				{
					method: 'GET',
					headers: {
						'Authorization': getAuthHeader()
					}
				}
			);

			const data = await response.json();

			if (response.ok) {
				logger.info('✅ Status consultado com sucesso', {
					messageSid,
					status: data.status
				});

				return res.json({
					success: true,
					sid: data.sid,
					status: data.status,
					to: data.to,
					from: data.from,
					dateSent: data.date_sent,
					errorCode: data.error_code,
					errorMessage: data.error_message
				});
			}

			logger.error('❌ Falha ao consultar status', {
				status: response.status,
				error: data
			});

			return res.status(response.status).json({
				success: false,
				error: 'Failed to get message status',
				details: data
			});

		} catch (error) {
			logger.error('❌ Erro ao consultar status', {
				error: error.message,
				stack: error.stack
			});

			return res.status(500).json({
				success: false,
				error: error.message
			});
		}
	});
};
