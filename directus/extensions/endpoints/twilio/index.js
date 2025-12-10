/**
 * Directus Endpoint: Twilio (Multi-tenant)
 * CommonJS, usa fetch nativo do Node 18+
 */

const { getCompanySettings } = require('../../shared/company-settings.js');

module.exports = (router, { env, logger, database }) => {
	const DEFAULT_TWILIO_ACCOUNT_SID = env.TWILIO_ACCOUNT_SID;
	const DEFAULT_TWILIO_AUTH_TOKEN = env.TWILIO_AUTH_TOKEN;
	const DEFAULT_TWILIO_WHATSAPP_NUMBER =
		env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

	const getAuthHeader = (accountSid, authToken) => {
		const sid = accountSid || DEFAULT_TWILIO_ACCOUNT_SID;
		const token = authToken || DEFAULT_TWILIO_AUTH_TOKEN;
		const credentials = Buffer.from(`${sid}:${token}`).toString('base64');
		return `Basic ${credentials}`;
	};

	async function getCompanyTwilioConfig(companyId) {
		try {
			if (!companyId) {
				logger.warn('company_id ausente; usando configuracao padrao');
				return {
					accountSid: DEFAULT_TWILIO_ACCOUNT_SID,
					authToken: DEFAULT_TWILIO_AUTH_TOKEN,
					whatsappNumber: DEFAULT_TWILIO_WHATSAPP_NUMBER,
				};
			}

			const settings = await getCompanySettings({ database, logger }, companyId);

			return {
				accountSid: settings.twilio_account_sid || DEFAULT_TWILIO_ACCOUNT_SID,
				authToken: settings.twilio_auth_token || DEFAULT_TWILIO_AUTH_TOKEN,
				whatsappNumber: settings.twilio_whatsapp_number || DEFAULT_TWILIO_WHATSAPP_NUMBER,
			};
		} catch (error) {
			logger.error('Erro ao buscar configuracao Twilio', { error: error.message });
			return {
				accountSid: DEFAULT_TWILIO_ACCOUNT_SID,
				authToken: DEFAULT_TWILIO_AUTH_TOKEN,
				whatsappNumber: DEFAULT_TWILIO_WHATSAPP_NUMBER,
			};
		}
	}

	router.post('/send-message', async (req, res) => {
		try {
			const { company_id, to, message } = req.body;
			if (!to || !message) {
				return res.status(400).json({ success: false, error: 'to e message sao obrigatorios' });
			}

			const config = await getCompanyTwilioConfig(company_id);
			const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

			logger.info('Enviando mensagem WhatsApp', {
				company_id,
				from: config.whatsappNumber,
				to: formattedTo,
			});

			const body = new URLSearchParams({
				From: config.whatsappNumber,
				To: formattedTo,
				Body: message,
			});

			const response = await fetch(
				`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						Authorization: getAuthHeader(config.accountSid, config.authToken),
					},
					body,
				}
			);

			const data = await response.json();
			if (response.status === 201) {
				return res.json({ success: true, message_sid: data.sid, status: data.status, to: data.to, from: data.from });
			}

			logger.error('Falha ao enviar mensagem', { status: response.status, data });
			return res.status(response.status).json({ success: false, error: 'Failed to send message', details: data });
		} catch (error) {
			logger.error('Erro ao enviar mensagem', { error: error.message });
			return res.status(500).json({ success: false, error: error.message });
		}
	});

	router.post('/send-image', async (req, res) => {
		try {
			const { company_id, to, message, mediaUrl } = req.body;
			if (!to || !mediaUrl) {
				return res.status(400).json({ success: false, error: 'to e mediaUrl sao obrigatorios' });
			}

			const config = await getCompanyTwilioConfig(company_id);
			const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

			logger.info('Enviando imagem WhatsApp', {
				company_id,
				from: config.whatsappNumber,
				to: formattedTo,
				mediaUrl,
			});

			const body = new URLSearchParams({
				From: config.whatsappNumber,
				To: formattedTo,
				Body: message || '',
				MediaUrl: mediaUrl,
			});

			const response = await fetch(
				`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						Authorization: getAuthHeader(config.accountSid, config.authToken),
					},
					body,
				}
			);

			const data = await response.json();
			if (response.status === 201) {
				return res.json({ success: true, message_sid: data.sid, status: data.status, to: data.to, from: data.from, media_url: mediaUrl });
			}

			logger.error('Falha ao enviar imagem', { status: response.status, data });
			return res.status(response.status).json({ success: false, error: 'Failed to send image', details: data });
		} catch (error) {
			logger.error('Erro ao enviar imagem', { error: error.message });
			return res.status(500).json({ success: false, error: error.message });
		}
	});

	router.post('/download-media', async (req, res) => {
		try {
			const { company_id, mediaUrl } = req.body;
			if (!mediaUrl) {
				return res.status(400).json({ success: false, error: 'mediaUrl e obrigatorio' });
			}

			const config = await getCompanyTwilioConfig(company_id);
			logger.info('Download de midia Twilio', { company_id, mediaUrl });

			const response = await fetch(mediaUrl, {
				method: 'GET',
				headers: { Authorization: getAuthHeader(config.accountSid, config.authToken) },
			});

			if (!response.ok) {
				return res.status(response.status).json({ success: false, error: 'Failed to download media', details: response.statusText });
			}

			const buffer = Buffer.from(await response.arrayBuffer());
			const contentType = response.headers.get('content-type') || 'application/octet-stream';

			return res.json({
				success: true,
				data: buffer.toString('base64'),
				contentType,
				size: buffer.length,
			});
		} catch (error) {
			logger.error('Erro ao baixar midia', { error: error.message });
			return res.status(500).json({ success: false, error: error.message });
		}
	});

	router.get('/message-status/:messageSid', async (req, res) => {
		try {
			const { messageSid } = req.params;
			if (!messageSid) {
				return res.status(400).json({ success: false, error: 'messageSid e obrigatorio' });
			}

			const response = await fetch(
				`https://api.twilio.com/2010-04-01/Accounts/${DEFAULT_TWILIO_ACCOUNT_SID}/Messages/${messageSid}.json`,
				{ headers: { Authorization: getAuthHeader(DEFAULT_TWILIO_ACCOUNT_SID, DEFAULT_TWILIO_AUTH_TOKEN) } }
			);

			const data = await response.json();
			if (response.ok) {
				return res.json({
					success: true,
					sid: data.sid,
					status: data.status,
					to: data.to,
					from: data.from,
					dateSent: data.date_sent,
					errorCode: data.error_code,
					errorMessage: data.error_message,
				});
			}

			return res.status(response.status).json({ success: false, error: 'Failed to get message status', details: data });
		} catch (error) {
			logger.error('Erro ao consultar status', { error: error.message });
			return res.status(500).json({ success: false, error: error.message });
		}
	});
};
