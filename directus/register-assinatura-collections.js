/**
 * Registra collections de Assinatura Eletrônica
 * 
 * Collections:
 * - documentos_assinatura: Documentos para assinatura
 * - documentos_signatarios: Signatários de cada documento
 * 
 * Integração: ClickSign
 * 
 * Execute: node register-assinatura-collections.js
 */

const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'marcus@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Teste@123';

let headers = {};

async function auth() {
  console.log('🔑 Fazendo login como admin...');
  const loginResponse = await axios.post(`${DIRECTUS_URL}/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  const token = loginResponse.data.data.access_token;
  headers = { Authorization: `Bearer ${token}` };
  console.log('✅ Login realizado!\n');
}

async function ensureCollection(name, payload) {
  try {
    await axios.get(`${DIRECTUS_URL}/collections/${name}`, { headers });
    console.log(`  ℹ️  Collection '${name}' já existe`);
    return true;
  } catch (e) {
    if (e.response?.status === 403) {
      console.log(`  ℹ️  Collection '${name}' já existe (403)`);
      return true;
    }
    await axios.post(`${DIRECTUS_URL}/collections`, payload, { headers });
    console.log(`  ✅ Collection '${name}' criada`);
    return false;
  }
}

async function ensureField(collection, field, payload) {
  try {
    await axios.get(`${DIRECTUS_URL}/fields/${collection}/${field}`, { headers });
    return;
  } catch (e) {
    if (e.response?.status !== 404) return;
    await axios.post(`${DIRECTUS_URL}/fields/${collection}`, payload, { headers });
    console.log(`    ✅ Field '${collection}.${field}' criado`);
  }
}

async function setupAssinaturas() {
  await auth();
  
  console.log('📋 Criando Collections de Assinatura Eletrônica...\n');

  // =====================================================
  // DOCUMENTOS_ASSINATURA - Documentos para assinatura
  // =====================================================
  await ensureCollection('documentos_assinatura', {
    collection: 'documentos_assinatura',
    meta: {
      collection: 'documentos_assinatura',
      icon: 'draw',
      note: 'Documentos para assinatura eletrônica',
      display_template: '{{codigo}} - {{assunto}}',
      singleton: false,
    },
    schema: {},
  });

  const documentoFields = [
    {
      field: 'id',
      type: 'uuid',
      meta: { special: ['uuid'], interface: 'input', readonly: true, hidden: true },
      schema: { is_primary_key: true },
    },
    {
      field: 'company_id',
      type: 'uuid',
      meta: { interface: 'select-dropdown-m2o', special: ['m2o'], hidden: true, required: true },
      schema: { foreign_key_table: 'companies', foreign_key_column: 'id' },
    },
    {
      field: 'codigo',
      type: 'string',
      meta: { interface: 'input', width: 'half', readonly: true, note: 'Código automático' },
      schema: {},
    },
    {
      field: 'assunto',
      type: 'string',
      meta: { interface: 'input', width: 'half', required: true },
      schema: {},
    },
    {
      field: 'descricao',
      type: 'text',
      meta: { interface: 'input-multiline', width: 'full' },
      schema: {},
    },
    {
      field: 'status',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: {
          choices: [
            { text: 'Rascunho', value: 'draft' },
            { text: 'Enviado', value: 'sent' },
            { text: 'Pendente', value: 'pending' },
            { text: 'Parcialmente Assinado', value: 'partial' },
            { text: 'Assinado', value: 'signed' },
            { text: 'Cancelado', value: 'cancelled' },
            { text: 'Expirado', value: 'expired' },
          ],
        },
      },
      schema: { default_value: 'draft' },
    },
    {
      field: 'tipo',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: {
          choices: [
            { text: 'Contrato de Locação', value: 'locacao' },
            { text: 'Contrato de Venda', value: 'venda' },
            { text: 'Aditivo', value: 'aditivo' },
            { text: 'Distrato', value: 'distrato' },
            { text: 'Procuração', value: 'procuracao' },
            { text: 'Ficha Cadastral', value: 'ficha_cadastral' },
            { text: 'Vistoria', value: 'vistoria' },
            { text: 'Outro', value: 'outro' },
          ],
        },
      },
      schema: {},
    },
    // Relacionamentos
    {
      field: 'property_id',
      type: 'uuid',
      meta: { interface: 'select-dropdown-m2o', special: ['m2o'], width: 'half', note: 'Imóvel relacionado' },
      schema: { foreign_key_table: 'properties', foreign_key_column: 'id' },
    },
    {
      field: 'lead_id',
      type: 'uuid',
      meta: { interface: 'select-dropdown-m2o', special: ['m2o'], width: 'half', note: 'Cliente relacionado' },
      schema: { foreign_key_table: 'leads', foreign_key_column: 'id' },
    },
    // Arquivo
    {
      field: 'documento_original',
      type: 'uuid',
      meta: { interface: 'file', special: ['file'], width: 'half', note: 'PDF original' },
      schema: { foreign_key_table: 'directus_files', foreign_key_column: 'id' },
    },
    {
      field: 'documento_assinado',
      type: 'uuid',
      meta: { interface: 'file', special: ['file'], width: 'half', note: 'PDF assinado (gerado pelo ClickSign)' },
      schema: { foreign_key_table: 'directus_files', foreign_key_column: 'id' },
    },
    // Integração ClickSign
    {
      field: 'clicksign_document_key',
      type: 'string',
      meta: { interface: 'input', width: 'half', note: 'Key do documento no ClickSign' },
      schema: {},
    },
    {
      field: 'clicksign_status',
      type: 'string',
      meta: { interface: 'input', width: 'half', readonly: true },
      schema: {},
    },
    // Datas
    {
      field: 'data_envio',
      type: 'timestamp',
      meta: { interface: 'datetime', width: 'half' },
      schema: {},
    },
    {
      field: 'data_limite',
      type: 'date',
      meta: { interface: 'datetime', width: 'half', note: 'Data limite para assinatura' },
      schema: {},
    },
    {
      field: 'data_conclusao',
      type: 'timestamp',
      meta: { interface: 'datetime', width: 'half' },
      schema: {},
    },
    // Metadados
    {
      field: 'date_created',
      type: 'timestamp',
      meta: { special: ['date-created'], interface: 'datetime', readonly: true, width: 'half' },
      schema: {},
    },
    {
      field: 'date_updated',
      type: 'timestamp',
      meta: { special: ['date-updated'], interface: 'datetime', readonly: true, width: 'half' },
      schema: {},
    },
    {
      field: 'user_created',
      type: 'uuid',
      meta: { special: ['user-created'], interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      schema: {},
    },
  ];

  for (const f of documentoFields) {
    await ensureField('documentos_assinatura', f.field, f);
  }

  // =====================================================
  // DOCUMENTOS_SIGNATARIOS - Signatários de documentos
  // =====================================================
  await ensureCollection('documentos_signatarios', {
    collection: 'documentos_signatarios',
    meta: {
      collection: 'documentos_signatarios',
      icon: 'person',
      note: 'Signatários de documentos',
      display_template: '{{nome}} - {{email}}',
      singleton: false,
    },
    schema: {},
  });

  const signatarioFields = [
    {
      field: 'id',
      type: 'uuid',
      meta: { special: ['uuid'], interface: 'input', readonly: true, hidden: true },
      schema: { is_primary_key: true },
    },
    {
      field: 'company_id',
      type: 'uuid',
      meta: { interface: 'select-dropdown-m2o', special: ['m2o'], hidden: true },
      schema: { foreign_key_table: 'companies', foreign_key_column: 'id' },
    },
    {
      field: 'documento_id',
      type: 'uuid',
      meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true },
      schema: { foreign_key_table: 'documentos_assinatura', foreign_key_column: 'id' },
    },
    {
      field: 'nome',
      type: 'string',
      meta: { interface: 'input', width: 'half', required: true },
      schema: {},
    },
    {
      field: 'email',
      type: 'string',
      meta: { interface: 'input', width: 'half', required: true },
      schema: {},
    },
    {
      field: 'cpf',
      type: 'string',
      meta: { interface: 'input', width: 'half' },
      schema: {},
    },
    {
      field: 'telefone',
      type: 'string',
      meta: { interface: 'input', width: 'half' },
      schema: {},
    },
    {
      field: 'papel',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: {
          choices: [
            { text: 'Locador', value: 'locador' },
            { text: 'Locatário', value: 'locatario' },
            { text: 'Comprador', value: 'comprador' },
            { text: 'Vendedor', value: 'vendedor' },
            { text: 'Fiador', value: 'fiador' },
            { text: 'Testemunha', value: 'testemunha' },
            { text: 'Representante', value: 'representante' },
            { text: 'Outro', value: 'outro' },
          ],
        },
      },
      schema: {},
    },
    {
      field: 'ordem',
      type: 'integer',
      meta: { interface: 'input', width: 'half', note: 'Ordem de assinatura' },
      schema: { default_value: 1 },
    },
    {
      field: 'status',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: {
          choices: [
            { text: 'Aguardando', value: 'waiting' },
            { text: 'Notificado', value: 'notified' },
            { text: 'Visualizado', value: 'viewed' },
            { text: 'Assinado', value: 'signed' },
            { text: 'Recusado', value: 'refused' },
          ],
        },
      },
      schema: { default_value: 'waiting' },
    },
    // ClickSign
    {
      field: 'clicksign_signer_key',
      type: 'string',
      meta: { interface: 'input', width: 'half', note: 'Key do signatário no ClickSign' },
      schema: {},
    },
    {
      field: 'clicksign_request_signature_key',
      type: 'string',
      meta: { interface: 'input', width: 'half', note: 'Key da solicitação de assinatura' },
      schema: {},
    },
    // Datas
    {
      field: 'data_notificacao',
      type: 'timestamp',
      meta: { interface: 'datetime', width: 'half' },
      schema: {},
    },
    {
      field: 'data_visualizacao',
      type: 'timestamp',
      meta: { interface: 'datetime', width: 'half' },
      schema: {},
    },
    {
      field: 'data_assinatura',
      type: 'timestamp',
      meta: { interface: 'datetime', width: 'half' },
      schema: {},
    },
    // IP e device
    {
      field: 'ip_assinatura',
      type: 'string',
      meta: { interface: 'input', width: 'half', readonly: true },
      schema: {},
    },
    // Metadados
    {
      field: 'date_created',
      type: 'timestamp',
      meta: { special: ['date-created'], interface: 'datetime', readonly: true, hidden: true },
      schema: {},
    },
  ];

  for (const f of signatarioFields) {
    await ensureField('documentos_signatarios', f.field, f);
  }

  console.log('\n✅ Collections de Assinatura Eletrônica configuradas!\n');
}

setupAssinaturas().catch((err) => {
  console.error('❌ Erro:', err?.response?.data || err.message);
  process.exit(1);
});
