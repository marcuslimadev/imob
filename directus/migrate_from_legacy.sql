-- =============================================
-- MIGRAÇÃO DO SISTEMA LEGADO PARA SAAS
-- Data: 24/11/2025
-- Origem: Exclusiva Lar CRM (PostgreSQL)
-- Destino: IMOBI SaaS Multi-Tenant (Directus)
-- =============================================

-- =============================================
-- ETAPA 1: EXPANDIR COLLECTION COMPANIES
-- =============================================

-- Adicionar campos de integração Twilio
ALTER TABLE companies ADD COLUMN IF NOT EXISTS twilio_account_sid VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS twilio_auth_token VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS twilio_phone_number VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS twilio_webhook_url VARCHAR(500);

-- Adicionar campos de integração OpenAI
ALTER TABLE companies ADD COLUMN IF NOT EXISTS openai_api_key VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS openai_model VARCHAR(100) DEFAULT 'gpt-4o-mini';

-- Adicionar campos de integração Asaas
ALTER TABLE companies ADD COLUMN IF NOT EXISTS asaas_api_key VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS asaas_webhook_url VARCHAR(500);

-- Adicionar campos de integração ClickSign
ALTER TABLE companies ADD COLUMN IF NOT EXISTS clicksign_api_token VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS clicksign_webhook_url VARCHAR(500);

-- Adicionar campos de API Externa de Imóveis
ALTER TABLE companies ADD COLUMN IF NOT EXISTS external_property_api_url VARCHAR(500);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS external_property_api_token TEXT;

-- =============================================
-- ETAPA 2: EXPANDIR COLLECTION LEADS
-- =============================================

-- Dados Cadastrais (WhatsApp)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_name VARCHAR(150);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS profile_pic_url VARCHAR(500);

-- Dados Financeiros
ALTER TABLE leads ADD COLUMN IF NOT EXISTS renda_mensal DECIMAL(15,2);

-- Dados Pessoais
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estado_civil VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS composicao_familiar VARCHAR(150);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS profissao VARCHAR(150);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fonte_renda VARCHAR(100);

-- Dados de Financiamento
ALTER TABLE leads ADD COLUMN IF NOT EXISTS financiamento_status VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS prazo_compra VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS objetivo_compra VARCHAR(100);

-- Preferências Detalhadas
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferencia_lazer TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferencia_seguranca TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS caracteristicas_desejadas TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS observacoes_cliente TEXT;

-- Diagnóstico IA (OpenAI)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diagnostico_ia TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diagnostico_status VARCHAR(20) DEFAULT 'pendente';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diagnostico_gerado_em TIMESTAMP;

-- Timestamps adicionais
ALTER TABLE leads ADD COLUMN IF NOT EXISTS primeira_interacao TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ultima_interacao TIMESTAMP;

-- =============================================
-- ETAPA 3: EXPANDIR COLLECTION PROPERTIES
-- =============================================

-- Códigos de referência
ALTER TABLE properties ADD COLUMN IF NOT EXISTS codigo_imovel VARCHAR(100) UNIQUE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS referencia_imovel VARCHAR(100);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Localização detalhada
ALTER TABLE properties ADD COLUMN IF NOT EXISTS numero VARCHAR(20);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS complemento VARCHAR(100);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS logradouro VARCHAR(255);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS cep VARCHAR(15);

-- Condomínio
ALTER TABLE properties ADD COLUMN IF NOT EXISTS em_condominio BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS nome_condominio VARCHAR(255);

-- Características extras
ALTER TABLE properties ADD COLUMN IF NOT EXISTS area_terreno DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS caracteristicas JSONB;

-- Controle
ALTER TABLE properties ADD COLUMN IF NOT EXISTS aceita_financiamento BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS exclusividade BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_sync TIMESTAMP;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS api_data JSONB;

-- =============================================
-- ETAPA 4: CRIAR COLLECTION CONVERSAS
-- =============================================

CREATE TABLE IF NOT EXISTS conversas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Dados do contato
    telefone VARCHAR(20) NOT NULL,
    whatsapp_name VARCHAR(100),
    profile_pic VARCHAR(255),
    
    -- Relacionamentos
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    corretor_id UUID REFERENCES directus_users(id) ON DELETE SET NULL,
    
    -- Status da conversa
    status VARCHAR(50) DEFAULT 'ativa',
    stage VARCHAR(50),
    
    -- Contexto IA
    contexto_conversa TEXT,
    ultima_mensagem TEXT,
    
    -- Timestamps
    iniciada_em TIMESTAMP DEFAULT NOW(),
    ultima_atividade TIMESTAMP DEFAULT NOW(),
    finalizada_em TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversas_company ON conversas(company_id);
CREATE INDEX idx_conversas_telefone ON conversas(telefone);
CREATE INDEX idx_conversas_lead ON conversas(lead_id);
CREATE INDEX idx_conversas_status ON conversas(status);
CREATE INDEX idx_conversas_atividade ON conversas(ultima_atividade DESC);

-- =============================================
-- ETAPA 5: CRIAR COLLECTION MENSAGENS
-- =============================================

CREATE TABLE IF NOT EXISTS mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversa_id UUID NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
    
    -- Dados Twilio
    message_sid VARCHAR(100),
    direction VARCHAR(20) NOT NULL, -- incoming, outgoing
    message_type VARCHAR(20) DEFAULT 'text', -- text, audio, image, document
    
    -- Conteúdo
    content TEXT,
    media_url VARCHAR(500),
    transcription TEXT, -- Whisper transcription
    
    -- Status
    status VARCHAR(20),
    error_message TEXT,
    
    -- Timestamps
    sent_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mensagens_conversa ON mensagens(conversa_id);
CREATE INDEX idx_mensagens_sid ON mensagens(message_sid);
CREATE INDEX idx_mensagens_direction ON mensagens(direction);
CREATE INDEX idx_mensagens_sent ON mensagens(sent_at DESC);

-- =============================================
-- ETAPA 6: CRIAR COLLECTION LEAD_PROPERTY_MATCHES
-- =============================================

CREATE TABLE IF NOT EXISTS lead_property_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relacionamentos
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    conversa_id UUID REFERENCES conversas(id) ON DELETE SET NULL,
    
    -- Score de compatibilidade (calculado pela IA)
    match_score DECIMAL(5,2) DEFAULT 0.00,
    
    -- PDF enviado
    pdf_sent BOOLEAN DEFAULT FALSE,
    pdf_sent_at TIMESTAMP,
    pdf_path VARCHAR(500),
    
    -- Interação do lead
    visualizado BOOLEAN DEFAULT FALSE,
    interesse VARCHAR(20), -- baixo, medio, alto
    feedback TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_matches_lead ON lead_property_matches(lead_id);
CREATE INDEX idx_matches_property ON lead_property_matches(property_id);
CREATE INDEX idx_matches_score ON lead_property_matches(match_score DESC);

-- =============================================
-- ETAPA 7: CRIAR COLLECTION ATIVIDADES
-- =============================================

CREATE TABLE IF NOT EXISTS atividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Multi-tenant
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Relacionamentos
    user_id UUID REFERENCES directus_users(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    
    -- Dados da atividade
    tipo VARCHAR(50) NOT NULL,
    descricao TEXT,
    dados JSONB,
    ip_address VARCHAR(45),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_atividades_company ON atividades(company_id);
CREATE INDEX idx_atividades_user ON atividades(user_id);
CREATE INDEX idx_atividades_tipo ON atividades(tipo);
CREATE INDEX idx_atividades_created ON atividades(created_at DESC);

-- =============================================
-- ETAPA 8: CRIAR COLLECTION WEBHOOKS_LOG
-- =============================================

CREATE TABLE IF NOT EXISTS webhooks_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Dados do webhook
    service VARCHAR(50) NOT NULL, -- twilio, asaas, clicksign
    event_type VARCHAR(100) NOT NULL,
    payload JSONB,
    
    -- Processamento
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    error_message TEXT,
    
    received_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhooks_company ON webhooks_log(company_id);
CREATE INDEX idx_webhooks_service ON webhooks_log(service);
CREATE INDEX idx_webhooks_processed ON webhooks_log(processed);
CREATE INDEX idx_webhooks_received ON webhooks_log(received_at DESC);

-- =============================================
-- ETAPA 9: CRIAR COLLECTION APP_SETTINGS
-- =============================================

CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Configuração
    chave VARCHAR(150) NOT NULL,
    valor TEXT,
    tipo VARCHAR(50) DEFAULT 'string',
    descricao VARCHAR(255),
    categoria VARCHAR(100),
    editavel BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(company_id, chave)
);

CREATE INDEX idx_settings_company ON app_settings(company_id);
CREATE INDEX idx_settings_chave ON app_settings(chave);
CREATE INDEX idx_settings_categoria ON app_settings(categoria);

-- =============================================
-- ETAPA 10: CRIAR PRIMEIRA COMPANY (EXCLUSIVA)
-- =============================================

INSERT INTO companies (
    id,
    name,
    slug,
    cnpj,
    email,
    phone,
    primary_color,
    secondary_color,
    subscription_status,
    subscription_plan,
    subscription_starts_at,
    subscription_expires_at,
    monthly_price,
    
    -- Integrações
    twilio_account_sid,
    twilio_auth_token,
    twilio_phone_number,
    twilio_webhook_url,
    
    openai_api_key,
    openai_model,
    
    external_property_api_url,
    external_property_api_token,
    
    created_at
) VALUES (
    gen_random_uuid(),
    'Imobiliária Exclusiva Lar',
    'exclusiva',
    '00.000.000/0001-00',
    'contato@exclusivalarimoveis.com.br',
    '+55 31 7334-1150',
    '#1E3A8A',
    '#F59E0B',
    'active',
    'professional',
    NOW(),
    NOW() + INTERVAL '365 days',
    759.00,
    
    -- Twilio (preencher com dados reais)
    'SEU_TWILIO_ACCOUNT_SID',
    'SEU_TWILIO_AUTH_TOKEN',
    '+5531733411150',
    'https://api.imobi.com.br/webhooks/twilio/{company_id}',
    
    -- OpenAI (preencher com dados reais)
    'SEU_OPENAI_API_KEY',
    'gpt-4o-mini',
    
    -- API Externa
    'https://www.exclusivalarimoveis.com.br/api/v1/app/imovel',
    '$2y$10$Lcn1ct.wEfBonZldcjuVQ.pD5p8gBRNrPlHjVwruaG5HAui2XCG9O',
    
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- COMENTÁRIOS FINAIS
-- =============================================

-- PRÓXIMOS PASSOS:
-- 1. Executar este SQL no banco Directus
-- 2. Registrar collections no Directus (via UI ou API)
-- 3. Migrar dados existentes do PostgreSQL legado
-- 4. Implementar webhooks multi-tenant
-- 5. Portar frontend Vue → Next.js

-- COMANDOS PARA EXECUTAR:
-- cat migrate_from_legacy.sql | docker exec -i directus-cms-template-database-1 psql -U directus -d directus
