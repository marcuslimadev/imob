-- Script para criar as tabelas físicas no PostgreSQL
-- Execute via psql conectando ao RDS

-- Companies (Tenants/Imobiliárias)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    razao_social VARCHAR(255),
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(20),
    slug VARCHAR(100) UNIQUE,
    custom_domain VARCHAR(255),
    logo_url TEXT,
    primary_color VARCHAR(20),
    telefone VARCHAR(50),
    email VARCHAR(255),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(50),
    cep VARCHAR(20),
    twilio_account_sid VARCHAR(255),
    twilio_auth_token VARCHAR(255),
    twilio_whatsapp_number VARCHAR(50),
    openai_api_key VARCHAR(255),
    openai_model VARCHAR(50) DEFAULT 'gpt-4o-mini',
    asaas_api_key VARCHAR(255),
    clicksign_access_token VARCHAR(255),
    external_api_url TEXT,
    external_api_key VARCHAR(255),
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    subscription_status VARCHAR(50) DEFAULT 'active',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    theme_key VARCHAR(50) DEFAULT 'bauhaus'
);

-- Properties (Imóveis)
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    company_id UUID REFERENCES companies(id),
    codigo_imovel VARCHAR(50),
    titulo VARCHAR(255),
    descricao TEXT,
    tipo VARCHAR(50),
    finalidade VARCHAR(50),
    preco DECIMAL(15,2),
    condominio DECIMAL(15,2),
    iptu DECIMAL(15,2),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(50),
    cep VARCHAR(20),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    area_total DECIMAL(10,2),
    area_construida DECIMAL(10,2),
    quartos INTEGER,
    suites INTEGER,
    banheiros INTEGER,
    vagas_garagem INTEGER,
    caracteristicas JSONB,
    disponivel BOOLEAN DEFAULT true,
    destaque BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    external_id VARCHAR(255),
    external_data JSONB,
    sync_status VARCHAR(50),
    last_sync_at TIMESTAMP WITH TIME ZONE
);

-- Property Media (Fotos/Vídeos)
CREATE TABLE IF NOT EXISTS property_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    tipo VARCHAR(50),
    url TEXT,
    ordem INTEGER DEFAULT 0,
    descricao VARCHAR(255)
);

-- Leads (Clientes/Interessados)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    company_id UUID REFERENCES companies(id),
    nome VARCHAR(255),
    email VARCHAR(255),
    telefone VARCHAR(50),
    whatsapp VARCHAR(50),
    origem VARCHAR(100),
    stage VARCHAR(50) DEFAULT 'novo',
    whatsapp_name VARCHAR(255),
    whatsapp_profile_pic TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER DEFAULT 0,
    tipo_imovel_interesse VARCHAR(50),
    finalidade_interesse VARCHAR(50),
    orcamento_min DECIMAL(15,2),
    orcamento_max DECIMAL(15,2),
    cidades_interesse JSONB,
    quartos_min INTEGER,
    vagas_min INTEGER,
    ai_diagnostic TEXT,
    ai_score INTEGER,
    ai_tags JSONB,
    renda_familiar DECIMAL(15,2),
    aprovacao_financiamento VARCHAR(50),
    valor_entrada DECIMAL(15,2),
    person_type VARCHAR(20) DEFAULT 'pf',
    cpf VARCHAR(20),
    rg VARCHAR(30),
    rg_issuer VARCHAR(20),
    rg_issue_date DATE,
    cnh VARCHAR(30),
    cnpj VARCHAR(20),
    company_name VARCHAR(255),
    trade_name VARCHAR(255),
    zip_code VARCHAR(20),
    street VARCHAR(255),
    number VARCHAR(20),
    complement VARCHAR(100),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(50),
    interest_type VARCHAR(50),
    budget_min DECIMAL(15,2),
    budget_max DECIMAL(15,2),
    preferred_neighborhoods JSONB,
    notes TEXT,
    observacoes TEXT,
    responsavel_id UUID REFERENCES directus_users(id)
);

-- Lead Activities (Histórico de interações)
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    company_id UUID REFERENCES companies(id),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    tipo VARCHAR(100),
    descricao TEXT,
    user_id UUID REFERENCES directus_users(id)
);

-- Property Views (Visualizações)
CREATE TABLE IF NOT EXISTS property_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    company_id UUID REFERENCES companies(id),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id),
    ip_address VARCHAR(50),
    user_agent TEXT
);

-- Conversas (WhatsApp)
CREATE TABLE IF NOT EXISTS conversas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    company_id UUID REFERENCES companies(id),
    lead_id UUID REFERENCES leads(id),
    telefone VARCHAR(50),
    whatsapp_name VARCHAR(255),
    whatsapp_profile_pic TEXT,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER DEFAULT 0,
    archived BOOLEAN DEFAULT false
);

-- Mensagens (WhatsApp)
CREATE TABLE IF NOT EXISTS mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    conversa_id UUID REFERENCES conversas(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),
    twilio_sid VARCHAR(100),
    direction VARCHAR(20),
    content TEXT,
    media_url TEXT,
    media_type VARCHAR(50),
    message_status VARCHAR(50),
    read_at TIMESTAMP WITH TIME ZONE,
    transcription TEXT,
    sent_by_user_id UUID REFERENCES directus_users(id)
);

-- Lead Property Matches (IA)
CREATE TABLE IF NOT EXISTS lead_property_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    company_id UUID REFERENCES companies(id),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    match_score INTEGER,
    match_reasons JSONB,
    sent_to_lead BOOLEAN DEFAULT false,
    lead_feedback VARCHAR(50)
);

-- Atividades (Log geral)
CREATE TABLE IF NOT EXISTS atividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    company_id UUID REFERENCES companies(id),
    tipo VARCHAR(100),
    descricao TEXT,
    lead_id UUID REFERENCES leads(id),
    property_id UUID REFERENCES properties(id),
    user_id UUID REFERENCES directus_users(id),
    metadata JSONB
);

-- Webhooks Log
CREATE TABLE IF NOT EXISTS webhooks_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    company_id UUID REFERENCES companies(id),
    service VARCHAR(100),
    event_type VARCHAR(100),
    payload JSONB,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- App Settings
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    company_id UUID REFERENCES companies(id),
    chave VARCHAR(255),
    valor TEXT,
    tipo VARCHAR(50),
    descricao TEXT,
    external_api_url TEXT,
    external_api_token TEXT
);

-- Logs
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    level VARCHAR(20),
    message TEXT,
    context JSONB,
    source VARCHAR(100)
);

-- Job Status
CREATE TABLE IF NOT EXISTS job_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    job_id VARCHAR(255) UNIQUE,
    job_status VARCHAR(50),
    progress INTEGER DEFAULT 0,
    total INTEGER,
    result JSONB,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Contratos
CREATE TABLE IF NOT EXISTS contratos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    company_id UUID REFERENCES companies(id),
    imovel_id UUID REFERENCES properties(id),
    lead_id UUID REFERENCES leads(id),
    tipo VARCHAR(50),
    contrato_status VARCHAR(50) DEFAULT 'rascunho',
    valor DECIMAL(15,2),
    data_inicio DATE,
    data_fim DATE,
    observacoes TEXT
);

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    name VARCHAR(100),
    description TEXT,
    price DECIMAL(10,2),
    billing_period VARCHAR(50),
    max_properties INTEGER,
    max_users INTEGER,
    features JSONB,
    active BOOLEAN DEFAULT true
);

-- Tenant Subscriptions
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    company_id UUID REFERENCES companies(id),
    plan_id UUID REFERENCES subscription_plans(id),
    subscription_status VARCHAR(50) DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Vistorias
CREATE TABLE IF NOT EXISTS vistorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    company_id UUID REFERENCES companies(id),
    imovel_id UUID REFERENCES properties(id),
    contrato_id UUID REFERENCES contratos(id),
    tipo VARCHAR(50),
    vistoria_status VARCHAR(50) DEFAULT 'agendada',
    data_agendada TIMESTAMP WITH TIME ZONE,
    data_realizada TIMESTAMP WITH TIME ZONE,
    observacoes TEXT
);

-- Vistoria Itens
CREATE TABLE IF NOT EXISTS vistoria_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    vistoria_id UUID REFERENCES vistorias(id) ON DELETE CASCADE,
    comodo VARCHAR(100),
    item VARCHAR(255),
    estado VARCHAR(50),
    observacoes TEXT,
    fotos JSONB
);

-- Documentos Assinatura
CREATE TABLE IF NOT EXISTS documentos_assinatura (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    company_id UUID REFERENCES companies(id),
    assunto VARCHAR(255),
    documento_status VARCHAR(50) DEFAULT 'rascunho',
    documento_url TEXT,
    clicksign_document_key VARCHAR(255),
    data_envio TIMESTAMP WITH TIME ZONE,
    data_conclusao TIMESTAMP WITH TIME ZONE
);

-- Documentos Signatarios
CREATE TABLE IF NOT EXISTS documentos_signatarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(255) DEFAULT 'published',
    user_created UUID REFERENCES directus_users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_updated UUID REFERENCES directus_users(id),
    date_updated TIMESTAMP WITH TIME ZONE,
    documento_id UUID REFERENCES documentos_assinatura(id) ON DELETE CASCADE,
    nome VARCHAR(255),
    email VARCHAR(255),
    cpf VARCHAR(20),
    signatario_status VARCHAR(50) DEFAULT 'pendente',
    data_assinatura TIMESTAMP WITH TIME ZONE
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_properties_company ON properties(company_id);
CREATE INDEX IF NOT EXISTS idx_properties_tipo ON properties(tipo);
CREATE INDEX IF NOT EXISTS idx_properties_cidade ON properties(cidade);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_conversas_company ON conversas(company_id);
CREATE INDEX IF NOT EXISTS idx_conversas_lead ON conversas(lead_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_conversa ON mensagens(conversa_id);
CREATE INDEX IF NOT EXISTS idx_atividades_company ON atividades(company_id);
CREATE INDEX IF NOT EXISTS idx_contratos_company ON contratos(company_id);
