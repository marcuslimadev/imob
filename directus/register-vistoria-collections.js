/**
 * Registra collections de Vistoria (Inspeção de Imóveis)
 * 
 * Collections:
 * - vistorias: Vistorias de imóveis (entrada/saída)
 * - vistoria_solicitacoes: Solicitações de vistoria
 * - vistoria_itens: Itens inspecionados (cômodos, fotos)
 * - vistoria_contestacoes: Contestações/divergências
 * 
 * Execute: node register-vistoria-collections.js
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

async function setupVistorias() {
  await auth();
  
  console.log('📋 Criando Collections de Vistoria...\n');

  // =====================================================
  // VISTORIAS - Vistorias principais
  // =====================================================
  await ensureCollection('vistorias', {
    collection: 'vistorias',
    meta: {
      collection: 'vistorias',
      icon: 'fact_check',
      note: 'Vistorias de imóveis (entrada/saída)',
      display_template: '{{codigo}} - {{property_id.title}}',
      singleton: false,
    },
    schema: {},
  });

  const vistoriaFields = [
    {
      field: 'id',
      type: 'uuid',
      meta: { special: ['uuid'], interface: 'input', readonly: true, hidden: true },
      schema: { is_primary_key: true },
    },
    {
      field: 'company_id',
      type: 'uuid',
      meta: { interface: 'select-dropdown-m2o', special: ['m2o'], width: 'half', required: true, hidden: true },
      schema: { foreign_key_table: 'companies', foreign_key_column: 'id' },
    },
    {
      field: 'codigo',
      type: 'string',
      meta: { interface: 'input', width: 'half', readonly: true, note: 'Código automático' },
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
            { text: 'Solicitada', value: 'solicitada' },
            { text: 'Designada', value: 'designada' },
            { text: 'Em Andamento', value: 'em_andamento' },
            { text: 'Concluída', value: 'concluida' },
            { text: 'Cancelada', value: 'cancelada' },
          ],
        },
      },
      schema: { default_value: 'solicitada' },
    },
    {
      field: 'tipo',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: {
          choices: [
            { text: 'Entrada', value: 'entrada' },
            { text: 'Saída', value: 'saida' },
            { text: 'Periódica', value: 'periodica' },
          ],
        },
      },
      schema: { default_value: 'entrada' },
    },
    {
      field: 'property_id',
      type: 'uuid',
      meta: { interface: 'select-dropdown-m2o', special: ['m2o'], width: 'half', required: true },
      schema: { foreign_key_table: 'properties', foreign_key_column: 'id' },
    },
    {
      field: 'lead_id',
      type: 'uuid',
      meta: { interface: 'select-dropdown-m2o', special: ['m2o'], width: 'half', note: 'Cliente/Locatário' },
      schema: { foreign_key_table: 'leads', foreign_key_column: 'id' },
    },
    {
      field: 'vistoriador_id',
      type: 'uuid',
      meta: { interface: 'select-dropdown-m2o', special: ['m2o'], width: 'half', note: 'Usuário designado' },
      schema: { foreign_key_table: 'directus_users', foreign_key_column: 'id' },
    },
    {
      field: 'data_agendada',
      type: 'timestamp',
      meta: { interface: 'datetime', width: 'half' },
      schema: {},
    },
    {
      field: 'data_realizada',
      type: 'timestamp',
      meta: { interface: 'datetime', width: 'half' },
      schema: {},
    },
    {
      field: 'tempo_estimado',
      type: 'integer',
      meta: { interface: 'input', width: 'half', note: 'Minutos estimados' },
      schema: { default_value: 60 },
    },
    {
      field: 'observacoes',
      type: 'text',
      meta: { interface: 'input-multiline', width: 'full' },
      schema: {},
    },
    // Timestamps
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

  for (const f of vistoriaFields) {
    await ensureField('vistorias', f.field, f);
  }

  // =====================================================
  // VISTORIA_SOLICITACOES - Solicitações de vistoria
  // =====================================================
  await ensureCollection('vistoria_solicitacoes', {
    collection: 'vistoria_solicitacoes',
    meta: {
      collection: 'vistoria_solicitacoes',
      icon: 'assignment',
      note: 'Solicitações de vistoria (Kanban)',
      singleton: false,
    },
    schema: {},
  });

  const solicitacaoFields = [
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
      field: 'vistoria_id',
      type: 'uuid',
      meta: { interface: 'select-dropdown-m2o', special: ['m2o'] },
      schema: { foreign_key_table: 'vistorias', foreign_key_column: 'id' },
    },
    {
      field: 'status_kanban',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: {
          choices: [
            { text: 'Backlog', value: 'backlog' },
            { text: 'Agendada', value: 'agendada' },
            { text: 'Em Execução', value: 'em_execucao' },
            { text: 'Revisão', value: 'revisao' },
            { text: 'Concluída', value: 'concluida' },
          ],
        },
      },
      schema: { default_value: 'backlog' },
    },
    {
      field: 'prioridade',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: {
          choices: [
            { text: 'Baixa', value: 'baixa' },
            { text: 'Normal', value: 'normal' },
            { text: 'Alta', value: 'alta' },
            { text: 'Urgente', value: 'urgente' },
          ],
        },
      },
      schema: { default_value: 'normal' },
    },
    {
      field: 'solicitante_nome',
      type: 'string',
      meta: { interface: 'input', width: 'half' },
      schema: {},
    },
    {
      field: 'solicitante_telefone',
      type: 'string',
      meta: { interface: 'input', width: 'half' },
      schema: {},
    },
    {
      field: 'data_preferencial',
      type: 'date',
      meta: { interface: 'datetime', width: 'half' },
      schema: {},
    },
    {
      field: 'notas',
      type: 'text',
      meta: { interface: 'input-multiline', width: 'full' },
      schema: {},
    },
    {
      field: 'date_created',
      type: 'timestamp',
      meta: { special: ['date-created'], interface: 'datetime', readonly: true },
      schema: {},
    },
  ];

  for (const f of solicitacaoFields) {
    await ensureField('vistoria_solicitacoes', f.field, f);
  }

  // =====================================================
  // VISTORIA_ITENS - Itens inspecionados
  // =====================================================
  await ensureCollection('vistoria_itens', {
    collection: 'vistoria_itens',
    meta: {
      collection: 'vistoria_itens',
      icon: 'room',
      note: 'Itens inspecionados (cômodos, fotos)',
      singleton: false,
    },
    schema: {},
  });

  const itemFields = [
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
      field: 'vistoria_id',
      type: 'uuid',
      meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true },
      schema: { foreign_key_table: 'vistorias', foreign_key_column: 'id' },
    },
    {
      field: 'comodo',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: {
          choices: [
            { text: 'Sala de Estar', value: 'sala_estar' },
            { text: 'Sala de Jantar', value: 'sala_jantar' },
            { text: 'Cozinha', value: 'cozinha' },
            { text: 'Quarto 1', value: 'quarto_1' },
            { text: 'Quarto 2', value: 'quarto_2' },
            { text: 'Quarto 3', value: 'quarto_3' },
            { text: 'Banheiro Social', value: 'banheiro_social' },
            { text: 'Banheiro Suíte', value: 'banheiro_suite' },
            { text: 'Área de Serviço', value: 'area_servico' },
            { text: 'Varanda', value: 'varanda' },
            { text: 'Garagem', value: 'garagem' },
            { text: 'Área Externa', value: 'area_externa' },
            { text: 'Outro', value: 'outro' },
          ],
        },
      },
      schema: {},
    },
    {
      field: 'item',
      type: 'string',
      meta: { interface: 'input', width: 'half', note: 'Ex: Piso, Parede, Teto, Porta, etc.' },
      schema: {},
    },
    {
      field: 'estado',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: {
          choices: [
            { text: 'Excelente', value: 'excelente' },
            { text: 'Bom', value: 'bom' },
            { text: 'Regular', value: 'regular' },
            { text: 'Ruim', value: 'ruim' },
            { text: 'Não Aplicável', value: 'na' },
          ],
        },
      },
      schema: { default_value: 'bom' },
    },
    {
      field: 'descricao',
      type: 'text',
      meta: { interface: 'input-multiline', width: 'full' },
      schema: {},
    },
    {
      field: 'fotos',
      type: 'json',
      meta: { interface: 'files', special: ['files'], width: 'full', note: 'Fotos do item' },
      schema: {},
    },
    {
      field: 'videos',
      type: 'json',
      meta: { interface: 'files', special: ['files'], width: 'full', note: 'Vídeos do item' },
      schema: {},
    },
    {
      field: 'sort',
      type: 'integer',
      meta: { interface: 'input', hidden: true },
      schema: {},
    },
  ];

  for (const f of itemFields) {
    await ensureField('vistoria_itens', f.field, f);
  }

  // =====================================================
  // VISTORIA_CONTESTACOES - Contestações/Divergências
  // =====================================================
  await ensureCollection('vistoria_contestacoes', {
    collection: 'vistoria_contestacoes',
    meta: {
      collection: 'vistoria_contestacoes',
      icon: 'warning',
      note: 'Contestações de vistorias',
      singleton: false,
    },
    schema: {},
  });

  const contestacaoFields = [
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
      field: 'vistoria_id',
      type: 'uuid',
      meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true },
      schema: { foreign_key_table: 'vistorias', foreign_key_column: 'id' },
    },
    {
      field: 'vistoria_item_id',
      type: 'uuid',
      meta: { interface: 'select-dropdown-m2o', special: ['m2o'] },
      schema: { foreign_key_table: 'vistoria_itens', foreign_key_column: 'id' },
    },
    {
      field: 'status',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: {
          choices: [
            { text: 'Apontada', value: 'apontada' },
            { text: 'Em Análise', value: 'em_analise' },
            { text: 'Aceita', value: 'aceita' },
            { text: 'Rejeitada', value: 'rejeitada' },
            { text: 'Finalizada', value: 'finalizada' },
          ],
        },
      },
      schema: { default_value: 'apontada' },
    },
    {
      field: 'tipo',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: {
          choices: [
            { text: 'Dano Preexistente', value: 'dano_preexistente' },
            { text: 'Divergência de Estado', value: 'divergencia_estado' },
            { text: 'Item Faltante', value: 'item_faltante' },
            { text: 'Outro', value: 'outro' },
          ],
        },
      },
      schema: {},
    },
    {
      field: 'descricao',
      type: 'text',
      meta: { interface: 'input-multiline', width: 'full', required: true },
      schema: {},
    },
    {
      field: 'resposta',
      type: 'text',
      meta: { interface: 'input-multiline', width: 'full', note: 'Resposta da imobiliária' },
      schema: {},
    },
    {
      field: 'fotos',
      type: 'json',
      meta: { interface: 'files', special: ['files'], width: 'full' },
      schema: {},
    },
    {
      field: 'valor_estimado',
      type: 'decimal',
      meta: { interface: 'input', width: 'half', note: 'Valor do reparo/dano' },
      schema: { numeric_precision: 10, numeric_scale: 2 },
    },
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
  ];

  for (const f of contestacaoFields) {
    await ensureField('vistoria_contestacoes', f.field, f);
  }

  console.log('\n✅ Collections de Vistoria configuradas!\n');
}

setupVistorias().catch((err) => {
  console.error('❌ Erro:', err?.response?.data || err.message);
  process.exit(1);
});
