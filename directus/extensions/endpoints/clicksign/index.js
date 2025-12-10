/**
 * ClickSign Integration Endpoint
 * 
 * Endpoints para assinatura eletrônica via ClickSign
 * 
 * POST /clicksign/upload - Upload documento para assinatura
 * POST /clicksign/add-signer - Adiciona signatário
 * POST /clicksign/send - Envia para assinatura
 * POST /clicksign/webhook - Webhook para status updates
 * GET /clicksign/status/:documentId - Status do documento
 */

const axios = require('axios');
const FormData = require('form-data');
const { getCompanySettings } = require('../../shared/company-settings.js');

const CLICKSIGN_API_URL = 'https://app.clicksign.com/api/v1';

module.exports = (router, { env, logger, services, database }) => {
  const { ItemsService, FilesService } = services;

  /**
   * Helper: Get ClickSign config for company
   */
  async function getClickSignConfig(companyId, schema) {
    const settingsService = new ItemsService('app_settings', {
      knex: database,
      schema,
      accountability: { admin: true }
    });

    const settings = await settingsService.readByQuery({
      filter: { company_id: { _eq: companyId } },
      limit: 1
    });

    if (!settings[0]?.clicksign_access_token) {
      throw new Error('ClickSign não configurado para esta empresa');
    }

    return {
      accessToken: settings[0].clicksign_access_token,
    };
  }

  /**
   * POST /clicksign/upload
   * 
   * Faz upload de documento para o ClickSign
   */
  router.post('/upload', async (req, res) => {
    try {
      const { company_id, documento_id, file_id } = req.body;

      if (!company_id || !documento_id || !file_id) {
        return res.status(400).json({
          success: false,
          error: 'company_id, documento_id e file_id são obrigatórios'
        });
      }

      const config = await getClickSignConfig(company_id, req.schema);

      // Busca o arquivo no Directus
      const filesService = new FilesService({
        knex: database,
        schema: req.schema,
        accountability: { admin: true }
      });

      const file = await filesService.readOne(file_id);
      if (!file) {
        return res.status(404).json({
          success: false,
          error: 'Arquivo não encontrado'
        });
      }

      // Faz upload para ClickSign
      const uploadResponse = await axios.post(
        `${CLICKSIGN_API_URL}/documents?access_token=${config.accessToken}`,
        {
          document: {
            path: `/${file.filename_download}`,
            content_base64: 'data:application/pdf;base64,...', // TODO: Get actual file content
            deadline_at: null,
            auto_close: true,
            locale: 'pt-BR',
            sequence_enabled: true,
          }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const documentKey = uploadResponse.data.document.key;

      // Atualiza o documento no Directus
      const docsService = new ItemsService('documentos_assinatura', {
        knex: database,
        schema: req.schema,
        accountability: { admin: true }
      });

      await docsService.updateOne(documento_id, {
        clicksign_document_key: documentKey,
        clicksign_status: 'uploaded',
        status: 'pending',
      });

      logger.info(`[ClickSign] Documento uploaded: ${documentKey}`);

      return res.json({
        success: true,
        data: {
          document_key: documentKey,
        }
      });

    } catch (error) {
      logger.error('[ClickSign Upload] Erro:', error.response?.data || error.message);
      return res.status(500).json({
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      });
    }
  });

  /**
   * POST /clicksign/add-signer
   * 
   * Adiciona signatário ao documento
   */
  router.post('/add-signer', async (req, res) => {
    try {
      const { 
        company_id, 
        document_key, 
        signatario_id,
        email, 
        name, 
        cpf,
        phone,
        sign_as = 'sign' // sign, approve, acknowledge, witness
      } = req.body;

      if (!company_id || !document_key || !email || !name) {
        return res.status(400).json({
          success: false,
          error: 'company_id, document_key, email e name são obrigatórios'
        });
      }

      const config = await getClickSignConfig(company_id, req.schema);

      // 1. Cria o signatário no ClickSign
      const signerResponse = await axios.post(
        `${CLICKSIGN_API_URL}/signers?access_token=${config.accessToken}`,
        {
          signer: {
            email,
            phone_number: phone,
            auths: ['email'],
            name,
            documentation: cpf,
            birthday: null,
            has_documentation: !!cpf,
            selfie_enabled: false,
            handwritten_enabled: false,
            official_document_enabled: false,
            liveness_enabled: false,
          }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const signerKey = signerResponse.data.signer.key;

      // 2. Adiciona signatário ao documento
      const addSignerResponse = await axios.post(
        `${CLICKSIGN_API_URL}/lists?access_token=${config.accessToken}`,
        {
          list: {
            document_key: document_key,
            signer_key: signerKey,
            sign_as: sign_as,
          }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const requestSignatureKey = addSignerResponse.data.list.request_signature_key;

      // 3. Atualiza signatário no Directus
      if (signatario_id) {
        const signatariosService = new ItemsService('documentos_signatarios', {
          knex: database,
          schema: req.schema,
          accountability: { admin: true }
        });

        await signatariosService.updateOne(signatario_id, {
          clicksign_signer_key: signerKey,
          clicksign_request_signature_key: requestSignatureKey,
          status: 'notified',
          data_notificacao: new Date().toISOString(),
        });
      }

      logger.info(`[ClickSign] Signatário adicionado: ${signerKey}`);

      return res.json({
        success: true,
        data: {
          signer_key: signerKey,
          request_signature_key: requestSignatureKey,
        }
      });

    } catch (error) {
      logger.error('[ClickSign Add Signer] Erro:', error.response?.data || error.message);
      return res.status(500).json({
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      });
    }
  });

  /**
   * POST /clicksign/send
   * 
   * Envia notificação para signatários
   */
  router.post('/send', async (req, res) => {
    try {
      const { company_id, request_signature_key, message } = req.body;

      if (!company_id || !request_signature_key) {
        return res.status(400).json({
          success: false,
          error: 'company_id e request_signature_key são obrigatórios'
        });
      }

      const config = await getClickSignConfig(company_id, req.schema);

      const response = await axios.post(
        `${CLICKSIGN_API_URL}/notifications?access_token=${config.accessToken}`,
        {
          request_signature_key,
          message: message || 'Por favor, assine o documento.'
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      logger.info(`[ClickSign] Notificação enviada: ${request_signature_key}`);

      return res.json({
        success: true,
        data: response.data
      });

    } catch (error) {
      logger.error('[ClickSign Send] Erro:', error.response?.data || error.message);
      return res.status(500).json({
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message
      });
    }
  });

  /**
   * POST /clicksign/webhook
   * 
   * Recebe webhooks do ClickSign
   */
  router.post('/webhook', async (req, res) => {
    try {
      const event = req.body;
      
      logger.info('[ClickSign Webhook] Evento recebido:', JSON.stringify(event));

      const eventName = event.event?.name;
      const documentKey = event.document?.key;
      const signerKey = event.signer?.key;

      if (!documentKey) {
        return res.status(200).json({ received: true });
      }

      // Busca o documento pelo clicksign_document_key
      const docsService = new ItemsService('documentos_assinatura', {
        knex: database,
        schema: req.schema,
        accountability: { admin: true }
      });

      const docs = await docsService.readByQuery({
        filter: { clicksign_document_key: { _eq: documentKey } },
        limit: 1
      });

      if (docs.length === 0) {
        logger.warn(`[ClickSign Webhook] Documento não encontrado: ${documentKey}`);
        return res.status(200).json({ received: true });
      }

      const doc = docs[0];

      // Processa eventos
      switch (eventName) {
        case 'auto_close':
        case 'close':
          // Documento foi fechado (todos assinaram)
          await docsService.updateOne(doc.id, {
            status: 'signed',
            clicksign_status: 'closed',
            data_conclusao: new Date().toISOString(),
          });
          logger.info(`[ClickSign] Documento fechado: ${doc.id}`);
          break;

        case 'sign':
          // Alguém assinou
          if (signerKey) {
            const signatariosService = new ItemsService('documentos_signatarios', {
              knex: database,
              schema: req.schema,
              accountability: { admin: true }
            });

            const signatarios = await signatariosService.readByQuery({
              filter: { clicksign_signer_key: { _eq: signerKey } },
              limit: 1
            });

            if (signatarios.length > 0) {
              await signatariosService.updateOne(signatarios[0].id, {
                status: 'signed',
                data_assinatura: new Date().toISOString(),
                ip_assinatura: event.signer?.ip || null,
              });
            }

            // Verifica se há assinaturas pendentes
            const pendingCount = await signatariosService.readByQuery({
              filter: {
                documento_id: { _eq: doc.id },
                status: { _neq: 'signed' }
              },
              aggregate: { count: '*' }
            });

            if (pendingCount[0]?.count === 0) {
              await docsService.updateOne(doc.id, { status: 'signed' });
            } else {
              await docsService.updateOne(doc.id, { status: 'partial' });
            }
          }
          break;

        case 'cancel':
          await docsService.updateOne(doc.id, {
            status: 'cancelled',
            clicksign_status: 'cancelled',
          });
          break;

        case 'deadline':
          await docsService.updateOne(doc.id, {
            status: 'expired',
            clicksign_status: 'expired',
          });
          break;
      }

      return res.status(200).json({ received: true });

    } catch (error) {
      logger.error('[ClickSign Webhook] Erro:', error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /clicksign/status/:documentId
   * 
   * Retorna status do documento no ClickSign
   */
  router.get('/status/:documentId', async (req, res) => {
    try {
      const { documentId } = req.params;
      const { company_id } = req.query;

      if (!company_id) {
        return res.status(400).json({
          success: false,
          error: 'company_id é obrigatório'
        });
      }

      // Busca documento
      const docsService = new ItemsService('documentos_assinatura', {
        knex: database,
        schema: req.schema,
        accountability: { admin: true }
      });

      const doc = await docsService.readOne(documentId, {
        fields: ['*'],
      });

      if (!doc || doc.company_id !== company_id) {
        return res.status(404).json({
          success: false,
          error: 'Documento não encontrado'
        });
      }

      // Busca signatários
      const signatariosService = new ItemsService('documentos_signatarios', {
        knex: database,
        schema: req.schema,
        accountability: { admin: true }
      });

      const signatarios = await signatariosService.readByQuery({
        filter: { documento_id: { _eq: documentId } },
        sort: ['ordem'],
      });

      return res.json({
        success: true,
        data: {
          documento: {
            id: doc.id,
            codigo: doc.codigo,
            assunto: doc.assunto,
            status: doc.status,
            clicksign_status: doc.clicksign_status,
            data_envio: doc.data_envio,
            data_conclusao: doc.data_conclusao,
          },
          signatarios: signatarios.map(s => ({
            id: s.id,
            nome: s.nome,
            email: s.email,
            papel: s.papel,
            status: s.status,
            data_assinatura: s.data_assinatura,
          })),
        }
      });

    } catch (error) {
      logger.error('[ClickSign Status] Erro:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
};
