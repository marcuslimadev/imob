/**
 * Script para registrar todos os campos customizados das collections do IMOBI
 * Execute com: node register-fields.js
 */

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'marcus@admin.com';
const ADMIN_PASSWORD = 'Teste@123';

let accessToken = '';

// Fazer login
async function login() {
    try {
        const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        accessToken = response.data.data.access_token;
        console.log('✅ Login realizado com sucesso!\n');
        return accessToken;
    } catch (error) {
        console.error('❌ Erro no login:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Criar field
async function createField(collectionName, fieldData) {
    try {
        await axios.post(
            `${DIRECTUS_URL}/fields/${collectionName}`,
            fieldData,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        console.log(`  ✅ ${fieldData.field}`);
    } catch (error) {
        if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
            console.log(`  ℹ️  ${fieldData.field} (já existe)`);
        } else {
            console.log(`  ❌ ${fieldData.field}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
        }
    }
}

// Definições dos campos por collection
const fieldsDefinitions = {
    companies: [
        { field: 'razao_social', type: 'string', meta: { interface: 'input', width: 'half', required: true, note: 'Razão social da empresa' } },
        { field: 'nome_fantasia', type: 'string', meta: { interface: 'input', width: 'half', required: true, note: 'Nome fantasia' } },
        { field: 'cnpj', type: 'string', meta: { interface: 'input', width: 'half', note: 'CNPJ da empresa' } },
        { field: 'slug', type: 'string', meta: { interface: 'input', width: 'half', required: true, note: 'Slug para subdomínio (exclusiva.imobi.com.br)' } },
        { field: 'custom_domain', type: 'string', meta: { interface: 'input', width: 'full', note: 'Domínio customizado (opcional)' } },
        { field: 'logo_url', type: 'string', meta: { interface: 'input', width: 'half', note: 'URL do logo' } },
        { field: 'primary_color', type: 'string', meta: { interface: 'input', width: 'half', note: 'Cor primária da marca (#HEX)' } },
        { field: 'telefone', type: 'string', meta: { interface: 'input', width: 'half', note: 'Telefone principal' } },
        { field: 'email', type: 'string', meta: { interface: 'input', width: 'half', note: 'Email de contato' } },
        { field: 'endereco', type: 'text', meta: { interface: 'input-multiline', width: 'full', note: 'Endereço completo' } },
        { field: 'cidade', type: 'string', meta: { interface: 'input', width: 'half' } },
        { field: 'estado', type: 'string', meta: { interface: 'input', width: 'half' } },
        { field: 'cep', type: 'string', meta: { interface: 'input', width: 'half' } },
        
        // Integrações
        { field: 'twilio_account_sid', type: 'string', meta: { interface: 'input', width: 'half', note: 'Twilio Account SID' } },
        { field: 'twilio_auth_token', type: 'string', meta: { interface: 'input', width: 'half', note: 'Twilio Auth Token' } },
        { field: 'twilio_whatsapp_number', type: 'string', meta: { interface: 'input', width: 'half', note: 'Número WhatsApp (formato: whatsapp:+5511999999999)' } },
        { field: 'openai_api_key', type: 'string', meta: { interface: 'input', width: 'half', note: 'OpenAI API Key' } },
        { field: 'openai_model', type: 'string', meta: { interface: 'input', width: 'half', note: 'Modelo OpenAI (ex: gpt-4o-mini)' } },
        { field: 'asaas_api_key', type: 'string', meta: { interface: 'input', width: 'half', note: 'Asaas API Key (pagamentos)' } },
        { field: 'clicksign_access_token', type: 'string', meta: { interface: 'input', width: 'half', note: 'ClickSign Access Token (assinaturas)' } },
        { field: 'external_api_url', type: 'string', meta: { interface: 'input', width: 'half', note: 'URL da API externa de imóveis' } },
        { field: 'external_api_key', type: 'string', meta: { interface: 'input', width: 'half', note: 'Chave da API externa' } },
        
        // Configurações
        { field: 'subscription_plan', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { text: 'Básico', value: 'basic' },
            { text: 'Pro', value: 'pro' },
            { text: 'Enterprise', value: 'enterprise' }
        ] } } },
        { field: 'subscription_status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { text: 'Ativo', value: 'active' },
            { text: 'Suspenso', value: 'suspended' },
            { text: 'Cancelado', value: 'cancelled' }
        ] } } },
        { field: 'trial_ends_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half', note: 'Data de término do trial' } },
        { field: 'theme_key', type: 'string', meta: { interface: 'select-dropdown', width: 'half', note: 'Tema visual da interface', options: { choices: [
            { text: 'Bauhaus', value: 'bauhaus' },
            { text: 'Ulm', value: 'ulm' },
            { text: 'Cranbrook', value: 'cranbrook' },
            { text: 'RCA', value: 'rca' },
            { text: 'RISD', value: 'risd' },
            { text: 'IIT', value: 'iit' },
            { text: 'Pratt', value: 'pratt' },
            { text: 'Parsons', value: 'parsons' },
            { text: 'Swiss Style', value: 'swiss' },
            { text: 'VKhUTEMAS', value: 'vkhutemas' }
        ] } } },
    ],
    
    properties: [
        { field: 'company_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half', required: true, note: 'Empresa dona do imóvel' } },
        { field: 'codigo_imovel', type: 'string', meta: { interface: 'input', width: 'half', note: 'Código único do imóvel' } },
        { field: 'titulo', type: 'string', meta: { interface: 'input', width: 'full', required: true, note: 'Título do anúncio' } },
        { field: 'descricao', type: 'text', meta: { interface: 'input-rich-text-html', width: 'full', note: 'Descrição completa (HTML)' } },
        { field: 'tipo', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { text: 'Casa', value: 'casa' },
            { text: 'Apartamento', value: 'apartamento' },
            { text: 'Terreno', value: 'terreno' },
            { text: 'Comercial', value: 'comercial' },
            { text: 'Rural', value: 'rural' }
        ] } } },
        { field: 'finalidade', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { text: 'Venda', value: 'venda' },
            { text: 'Aluguel', value: 'aluguel' },
            { text: 'Temporada', value: 'temporada' }
        ] } } },
        { field: 'preco', type: 'decimal', meta: { interface: 'input', width: 'half', note: 'Preço de venda/aluguel' } },
        { field: 'condominio', type: 'decimal', meta: { interface: 'input', width: 'half', note: 'Valor do condomínio' } },
        { field: 'iptu', type: 'decimal', meta: { interface: 'input', width: 'half', note: 'Valor do IPTU anual' } },
        
        // Localização
        { field: 'endereco', type: 'string', meta: { interface: 'input', width: 'full' } },
        { field: 'numero', type: 'string', meta: { interface: 'input', width: 'half' } },
        { field: 'complemento', type: 'string', meta: { interface: 'input', width: 'half' } },
        { field: 'bairro', type: 'string', meta: { interface: 'input', width: 'half' } },
        { field: 'cidade', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
        { field: 'estado', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
        { field: 'cep', type: 'string', meta: { interface: 'input', width: 'half' } },
        { field: 'latitude', type: 'decimal', meta: { interface: 'input', width: 'half' } },
        { field: 'longitude', type: 'decimal', meta: { interface: 'input', width: 'half' } },
        
        // Características
        { field: 'area_total', type: 'decimal', meta: { interface: 'input', width: 'half', note: 'Área total em m²' } },
        { field: 'area_construida', type: 'decimal', meta: { interface: 'input', width: 'half', note: 'Área construída em m²' } },
        { field: 'quartos', type: 'integer', meta: { interface: 'input', width: 'half' } },
        { field: 'suites', type: 'integer', meta: { interface: 'input', width: 'half' } },
        { field: 'banheiros', type: 'integer', meta: { interface: 'input', width: 'half' } },
        { field: 'vagas_garagem', type: 'integer', meta: { interface: 'input', width: 'half' } },
        { field: 'caracteristicas', type: 'json', meta: { interface: 'input-code', width: 'full', note: 'JSON com características extras' } },
        
        // Status e metadata
        { field: 'disponivel', type: 'boolean', meta: { interface: 'boolean', width: 'half' } },
        { field: 'destaque', type: 'boolean', meta: { interface: 'boolean', width: 'half', note: 'Destacar no site' } },
        { field: 'views_count', type: 'integer', meta: { interface: 'input', width: 'half', readonly: true } },
        { field: 'external_id', type: 'string', meta: { interface: 'input', width: 'half', note: 'ID na API externa' } },
        { field: 'external_data', type: 'json', meta: { interface: 'input-code', width: 'full', note: 'Dados originais da API externa' } },
        { field: 'sync_status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { text: 'Sincronizado', value: 'synced' },
            { text: 'Pendente', value: 'pending' },
            { text: 'Erro', value: 'error' }
        ] } } },
        { field: 'last_sync_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half', readonly: true } },
    ],
    
    leads: [
        { field: 'company_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half', required: true } },
        { field: 'nome', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
        { field: 'email', type: 'string', meta: { interface: 'input', width: 'half' } },
        { field: 'telefone', type: 'string', meta: { interface: 'input', width: 'half' } },
        { field: 'whatsapp', type: 'string', meta: { interface: 'input', width: 'half', note: 'Formato: +5511999999999' } },
        { field: 'origem', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { text: 'WhatsApp', value: 'whatsapp' },
            { text: 'Site', value: 'site' },
            { text: 'Facebook', value: 'facebook' },
            { text: 'Instagram', value: 'instagram' },
            { text: 'Indicação', value: 'indicacao' },
            { text: 'Telefone', value: 'telefone' }
        ] } } },
        { field: 'stage', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { text: 'Novo', value: 'novo' },
            { text: 'Contato', value: 'contato' },
            { text: 'Qualificado', value: 'qualificado' },
            { text: 'Proposta', value: 'proposta' },
            { text: 'Negociação', value: 'negociacao' },
            { text: 'Fechado', value: 'fechado' },
            { text: 'Perdido', value: 'perdido' }
        ] } } },
        
        // WhatsApp
        { field: 'whatsapp_name', type: 'string', meta: { interface: 'input', width: 'half', readonly: true } },
        { field: 'whatsapp_profile_pic', type: 'string', meta: { interface: 'input', width: 'half', readonly: true } },
        { field: 'last_message_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half', readonly: true } },
        { field: 'unread_count', type: 'integer', meta: { interface: 'input', width: 'half', readonly: true } },
        
        // Preferências
        { field: 'tipo_imovel_interesse', type: 'json', meta: { interface: 'input-code', width: 'full', note: 'Array: ["casa", "apartamento"]' } },
        { field: 'finalidade_interesse', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { text: 'Comprar', value: 'venda' },
            { text: 'Alugar', value: 'aluguel' },
            { text: 'Temporada', value: 'temporada' }
        ] } } },
        { field: 'orcamento_min', type: 'decimal', meta: { interface: 'input', width: 'half' } },
        { field: 'orcamento_max', type: 'decimal', meta: { interface: 'input', width: 'half' } },
        { field: 'cidades_interesse', type: 'json', meta: { interface: 'input-code', width: 'full', note: 'Array de cidades' } },
        { field: 'quartos_min', type: 'integer', meta: { interface: 'input', width: 'half' } },
        { field: 'vagas_min', type: 'integer', meta: { interface: 'input', width: 'half' } },
        
        // IA / Diagnóstico
        { field: 'ai_diagnostic', type: 'json', meta: { interface: 'input-code', width: 'full', note: 'Diagnóstico gerado pela IA' } },
        { field: 'ai_score', type: 'integer', meta: { interface: 'input', width: 'half', note: 'Score de qualificação (0-100)' } },
        { field: 'ai_tags', type: 'json', meta: { interface: 'input-code', width: 'full', note: 'Tags automáticas da IA' } },
        
        // Financeiro
        { field: 'renda_familiar', type: 'decimal', meta: { interface: 'input', width: 'half' } },
        { field: 'aprovacao_financiamento', type: 'boolean', meta: { interface: 'boolean', width: 'half' } },
        { field: 'valor_entrada', type: 'decimal', meta: { interface: 'input', width: 'half' } },
        
        // Pessoa Física/Jurídica
        { field: 'person_type', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { text: 'Pessoa Física', value: 'individual' },
            { text: 'Pessoa Jurídica', value: 'company' }
        ] } } },
        { field: 'cpf', type: 'string', meta: { interface: 'input', width: 'half', note: 'CPF da pessoa física' } },
        { field: 'rg', type: 'string', meta: { interface: 'input', width: 'half', note: 'RG' } },
        { field: 'rg_issuer', type: 'string', meta: { interface: 'input', width: 'half', note: 'Órgão expedidor (ex: SSP-SP)' } },
        { field: 'rg_issue_date', type: 'date', meta: { interface: 'datetime', width: 'half', note: 'Data de expedição' } },
        { field: 'cnh', type: 'string', meta: { interface: 'input', width: 'half', note: 'CNH' } },
        { field: 'cnpj', type: 'string', meta: { interface: 'input', width: 'half', note: 'CNPJ da pessoa jurídica' } },
        { field: 'company_name', type: 'string', meta: { interface: 'input', width: 'half', note: 'Razão social' } },
        { field: 'trade_name', type: 'string', meta: { interface: 'input', width: 'half', note: 'Nome fantasia' } },
        
        // Endereço
        { field: 'zip_code', type: 'string', meta: { interface: 'input', width: 'half', note: 'CEP' } },
        { field: 'street', type: 'string', meta: { interface: 'input', width: 'full', note: 'Logradouro' } },
        { field: 'number', type: 'string', meta: { interface: 'input', width: 'half', note: 'Número' } },
        { field: 'complement', type: 'string', meta: { interface: 'input', width: 'half', note: 'Complemento' } },
        { field: 'neighborhood', type: 'string', meta: { interface: 'input', width: 'half', note: 'Bairro' } },
        { field: 'city', type: 'string', meta: { interface: 'input', width: 'half', note: 'Cidade' } },
        { field: 'state', type: 'string', meta: { interface: 'input', width: 'half', note: 'Estado (UF)' } },
        
        // Preferências (ajustados)
        { field: 'interest_type', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { text: 'Comprar', value: 'buy' },
            { text: 'Alugar', value: 'rent' },
            { text: 'Vender', value: 'sell' },
            { text: 'Comprar e Vender', value: 'both' }
        ] } } },
        { field: 'budget_min', type: 'decimal', meta: { interface: 'input', width: 'half', note: 'Orçamento mínimo' } },
        { field: 'budget_max', type: 'decimal', meta: { interface: 'input', width: 'half', note: 'Orçamento máximo' } },
        { field: 'preferred_neighborhoods', type: 'string', meta: { interface: 'input', width: 'full', note: 'Bairros de interesse (separados por vírgula)' } },
        { field: 'notes', type: 'text', meta: { interface: 'input-multiline', width: 'full', note: 'Observações gerais' } },
        
        // Outras
        { field: 'observacoes', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
        { field: 'responsavel_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half', note: 'Corretor responsável' } },
    ],
    
    conversas: [
        { field: 'company_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half', required: true } },
        { field: 'lead_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half' } },
        { field: 'telefone', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
        { field: 'whatsapp_name', type: 'string', meta: { interface: 'input', width: 'half' } },
        { field: 'whatsapp_profile_pic', type: 'string', meta: { interface: 'input', width: 'full' } },
        { field: 'last_message', type: 'text', meta: { interface: 'input-multiline', width: 'full', readonly: true } },
        { field: 'last_message_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half', readonly: true } },
        { field: 'unread_count', type: 'integer', meta: { interface: 'input', width: 'half' } },
        { field: 'archived', type: 'boolean', meta: { interface: 'boolean', width: 'half' } },
    ],
    
    mensagens: [
        { field: 'conversa_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half', required: true } },
        { field: 'company_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half', required: true } },
        { field: 'twilio_sid', type: 'string', meta: { interface: 'input', width: 'half' } },
        { field: 'direction', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { text: 'Recebida', value: 'inbound' },
            { text: 'Enviada', value: 'outbound' }
        ] } } },
        { field: 'content', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
        { field: 'media_url', type: 'string', meta: { interface: 'input', width: 'full' } },
        { field: 'media_type', type: 'string', meta: { interface: 'input', width: 'half' } },
        { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { text: 'Enviando', value: 'queued' },
            { text: 'Enviada', value: 'sent' },
            { text: 'Entregue', value: 'delivered' },
            { text: 'Lida', value: 'read' },
            { text: 'Falha', value: 'failed' }
        ] } } },
        { field: 'read_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half' } },
        { field: 'transcription', type: 'text', meta: { interface: 'input-multiline', width: 'full', note: 'Transcrição de áudio (Whisper)' } },
        { field: 'sent_by_user_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half' } },
    ],
    
    lead_property_matches: [
        { field: 'company_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half', required: true } },
        { field: 'lead_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half', required: true } },
        { field: 'property_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half', required: true } },
        { field: 'match_score', type: 'integer', meta: { interface: 'input', width: 'half', note: 'Score 0-100' } },
        { field: 'match_reasons', type: 'json', meta: { interface: 'input-code', width: 'full', note: 'Motivos do match' } },
        { field: 'sent_to_lead', type: 'boolean', meta: { interface: 'boolean', width: 'half' } },
        { field: 'lead_feedback', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { text: 'Interessado', value: 'interested' },
            { text: 'Não interessado', value: 'not_interested' },
            { text: 'Já visitou', value: 'visited' }
        ] } } },
    ],
    
    atividades: [
        { field: 'company_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half', required: true } },
        { field: 'tipo', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { text: 'Lead criado', value: 'lead_created' },
            { text: 'Mensagem enviada', value: 'message_sent' },
            { text: 'Imóvel enviado', value: 'property_sent' },
            { text: 'Stage alterado', value: 'stage_changed' },
            { text: 'IA executada', value: 'ai_diagnostic' }
        ] } } },
        { field: 'descricao', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
        { field: 'lead_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half' } },
        { field: 'property_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half' } },
        { field: 'user_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half' } },
        { field: 'metadata', type: 'json', meta: { interface: 'input-code', width: 'full' } },
    ],
    
    webhooks_log: [
        { field: 'company_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half', required: true } },
        { field: 'service', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { text: 'Twilio', value: 'twilio' },
            { text: 'Asaas', value: 'asaas' },
            { text: 'ClickSign', value: 'clicksign' }
        ] } } },
        { field: 'event_type', type: 'string', meta: { interface: 'input', width: 'half' } },
        { field: 'payload', type: 'json', meta: { interface: 'input-code', width: 'full' } },
        { field: 'processed', type: 'boolean', meta: { interface: 'boolean', width: 'half' } },
        { field: 'processed_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half' } },
        { field: 'error_message', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
    ],
    
    app_settings: [
        { field: 'company_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half', required: true } },
        { field: 'chave', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
        { field: 'valor', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
        { field: 'tipo', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { text: 'String', value: 'string' },
            { text: 'Número', value: 'number' },
            { text: 'Boolean', value: 'boolean' },
            { text: 'JSON', value: 'json' }
        ] } } },
        { field: 'descricao', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
        
        // Campos específicos para integração com API externa
        { field: 'external_api_url', type: 'string', meta: { interface: 'input', width: 'half', note: 'URL base da API externa (ex: https://www.exclusivalarimoveis.com.br)' } },
        { field: 'external_api_token', type: 'string', meta: { interface: 'input', width: 'half', note: 'Token de autenticação da API externa' } },
    ],
    
    logs: [
        { field: 'timestamp', type: 'timestamp', meta: { interface: 'datetime', width: 'half', readonly: true } },
        { field: 'level', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [ { text: 'Info', value: 'info' }, { text: 'Warn', value: 'warn' }, { text: 'Error', value: 'error' } ] } } },
        { field: 'message', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
        { field: 'context', type: 'json', meta: { interface: 'input-code', width: 'full', options: { language: 'json' } } },
        { field: 'source', type: 'string', meta: { interface: 'input', width: 'half' } },
    ],

    job_status: [
        { field: 'job_id', type: 'string', meta: { interface: 'input', width: 'half' } },
        { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [ { text: 'Pending', value: 'pending' }, { text: 'Processing', value: 'processing' }, { text: 'Completed', value: 'completed' }, { text: 'Failed', value: 'failed' } ] } } },
        { field: 'progress', type: 'integer', meta: { interface: 'input', width: 'half' } },
        { field: 'total', type: 'integer', meta: { interface: 'input', width: 'half' } },
        { field: 'result', type: 'json', meta: { interface: 'input-code', width: 'full', options: { language: 'json' } } },
        { field: 'error', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
        { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half', readonly: true } },
        { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half', readonly: true } },
    ],
};

async function main() {
    console.log('🚀 Registrando campos customizados do IMOBI...\n');
    
    await login();
    
    for (const [collectionName, fields] of Object.entries(fieldsDefinitions)) {
        console.log(`📋 Collection: ${collectionName}`);
        for (const field of fields) {
            await createField(collectionName, field);
        }
        console.log('');
    }
    
    console.log('✅ Todos os campos foram registrados!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Acesse http://localhost:8055/admin/settings/data-model');
    console.log('2. Revise os campos de cada collection');
    console.log('3. Configure relacionamentos (M2O, O2M)');
    console.log('4. Comece a inserir dados!');
}

main().catch(console.error);
