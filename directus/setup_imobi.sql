-- Setup IMOBI Multi-Tenant Database
-- Criação das collections customizadas para o sistema imobiliário

-- 1. Tabela de Empresas/Imobiliárias (Multi-tenant principal)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_created UUID,
    user_updated UUID,
    
    -- Dados da empresa
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    cnpj VARCHAR(18),
    email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Personalização visual
    logo UUID, -- FK para directus_files
    primary_color VARCHAR(7) DEFAULT '#6644FF',
    secondary_color VARCHAR(7) DEFAULT '#4F46E5',
    custom_domain VARCHAR(255),
    
    -- Assinatura e cobrança
    subscription_status VARCHAR(20) DEFAULT 'trial', -- trial, active, suspended, cancelled
    subscription_plan VARCHAR(50) DEFAULT 'standard',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    status VARCHAR(20) DEFAULT 'active' -- active, inactive, suspended
);

-- 2. Tabela de Imóveis (Properties)
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_created UUID,
    user_updated UUID,
    
    -- Multi-tenant
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Informações básicas
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50), -- apartment, house, commercial, land, farm
    transaction_type VARCHAR(20), -- sale, rent, both
    
    -- Localização
    address VARCHAR(255),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Características
    bedrooms INTEGER,
    bathrooms INTEGER,
    suites INTEGER,
    parking_spaces INTEGER,
    area_total DECIMAL(10, 2),
    area_built DECIMAL(10, 2),
    
    -- Valores
    price_sale DECIMAL(12, 2),
    price_rent DECIMAL(10, 2),
    price_condo DECIMAL(10, 2),
    price_iptu DECIMAL(10, 2),
    
    -- Extras
    amenities JSONB, -- piscina, churrasqueira, etc
    featured BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'available' -- available, rented, sold, reserved
);

CREATE INDEX idx_properties_company ON properties(company_id);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_transaction ON properties(transaction_type);
CREATE INDEX idx_properties_featured ON properties(featured);

-- 3. Tabela de Mídias dos Imóveis
CREATE TABLE IF NOT EXISTS property_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Relacionamentos
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    directus_file UUID, -- FK para directus_files
    
    -- Metadados
    is_cover BOOLEAN DEFAULT false,
    caption TEXT,
    sort INTEGER DEFAULT 0
);

CREATE INDEX idx_property_media_property ON property_media(property_id);

-- 4. Tabela de Leads
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_created UUID,
    user_updated UUID,
    
    -- Multi-tenant
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Dados pessoais
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    cpf VARCHAR(14),
    
    -- Interesse
    interest_type VARCHAR(20), -- buy, rent
    budget_min DECIMAL(12, 2),
    budget_max DECIMAL(12, 2),
    preferred_neighborhoods TEXT[], -- array de bairros
    bedrooms_min INTEGER,
    property_types TEXT[], -- tipos de imóvel de interesse
    
    -- Gestão
    lead_source VARCHAR(50), -- website, facebook, olx, referral, walk-in
    lead_score INTEGER DEFAULT 0, -- 0-100
    stage VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, visiting, negotiating, won, lost
    assigned_to UUID, -- FK para directus_users
    
    -- Extras
    tags TEXT[],
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' -- active, inactive, converted
);

CREATE INDEX idx_leads_company ON leads(company_id);
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);

-- 5. Tabela de Atividades dos Leads
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_created UUID,
    
    -- Relacionamentos
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Atividade
    activity_type VARCHAR(50) NOT NULL, -- call, email, whatsapp, visit, note
    subject VARCHAR(255),
    description TEXT,
    
    -- Agendamento
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending' -- pending, completed, cancelled
);

CREATE INDEX idx_lead_activities_lead ON lead_activities(lead_id);

-- 6. Tabela de Visualizações de Imóveis (Analytics)
CREATE TABLE IF NOT EXISTS property_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Relacionamentos
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Rastreamento
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    duration_seconds INTEGER
);

CREATE INDEX idx_property_views_property ON property_views(property_id);
CREATE INDEX idx_property_views_date ON property_views(date_created);

-- Inserir empresa exemplo: Imobiliária Exclusiva
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
    subscription_expires_at
) VALUES (
    gen_random_uuid(),
    'Imobiliária Exclusiva',
    'exclusiva',
    '12.345.678/0001-90',
    'contato@exclusiva.com.br',
    '(31) 3333-4444',
    '#2563EB',
    '#1E40AF',
    'active',
    'standard',
    CURRENT_TIMESTAMP + INTERVAL '1 year'
) ON CONFLICT (slug) DO NOTHING;

-- Pegar o ID da empresa para usar nos próximos inserts
DO $$
DECLARE
    company_uuid UUID;
BEGIN
    SELECT id INTO company_uuid FROM companies WHERE slug = 'exclusiva';
    
    -- Inserir imóveis exemplo
    INSERT INTO properties (
        company_id,
        title,
        description,
        property_type,
        transaction_type,
        address,
        neighborhood,
        city,
        state,
        zip_code,
        bedrooms,
        bathrooms,
        suites,
        parking_spaces,
        area_total,
        area_built,
        price_sale,
        price_rent,
        featured,
        status
    ) VALUES 
    (
        company_uuid,
        'Apartamento Luxo no Belvedere',
        'Apartamento de alto padrão com vista panorâmica, acabamento premium e localização privilegiada.',
        'apartment',
        'sale',
        'Rua dos Timbiras, 2500',
        'Belvedere',
        'Belo Horizonte',
        'MG',
        '30140-000',
        4,
        3,
        2,
        3,
        180.50,
        165.00,
        1850000.00,
        NULL,
        true,
        'available'
    ),
    (
        company_uuid,
        'Casa Moderna na Pampulha',
        'Casa contemporânea com área de lazer completa, piscina aquecida e acabamento de primeira linha.',
        'house',
        'both',
        'Avenida Otacílio Negrão de Lima, 3000',
        'Pampulha',
        'Belo Horizonte',
        'MG',
        '31365-450',
        5,
        4,
        3,
        4,
        450.00,
        380.00,
        2500000.00,
        12000.00,
        true,
        'available'
    );
    
    -- Inserir leads exemplo
    INSERT INTO leads (
        company_id,
        name,
        email,
        phone,
        cpf,
        interest_type,
        budget_min,
        budget_max,
        preferred_neighborhoods,
        bedrooms_min,
        property_types,
        lead_source,
        lead_score,
        stage,
        status
    ) VALUES
    (
        company_uuid,
        'João Silva',
        'joao.silva@email.com',
        '(31) 98888-7777',
        '123.456.789-00',
        'buy',
        800000.00,
        1500000.00,
        ARRAY['Belvedere', 'Savassi', 'Lourdes'],
        3,
        ARRAY['apartment'],
        'website',
        75,
        'qualified',
        'active'
    ),
    (
        company_uuid,
        'Maria Santos',
        'maria.santos@email.com',
        '(31) 97777-6666',
        '987.654.321-00',
        'rent',
        5000.00,
        10000.00,
        ARRAY['Pampulha', 'Castelo'],
        4,
        ARRAY['house', 'apartment'],
        'facebook',
        60,
        'contacted',
        'active'
    );
END $$;

-- Mensagem de conclusão
DO $$
BEGIN
    RAISE NOTICE 'IMOBI Database Setup Completo!';
    RAISE NOTICE 'Empresa criada: Imobiliária Exclusiva (slug: exclusiva)';
    RAISE NOTICE 'Imóveis de exemplo: 2';
    RAISE NOTICE 'Leads de exemplo: 2';
END $$;
