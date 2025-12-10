-- ==========================================
-- SCRIPT RÁPIDO: Criar apenas a Imobiliária Exclusiva
-- Execute este script UMA VEZ no banco PostgreSQL
-- ==========================================

-- Inserir Imobiliária Exclusiva
INSERT INTO companies (
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
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone;

-- Buscar ID da empresa para usar nos próximos inserts
DO $$
DECLARE
    company_uuid UUID;
BEGIN
    SELECT id INTO company_uuid FROM companies WHERE slug = 'exclusiva';
    
    -- Inserir 2 imóveis de exemplo
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
        bedrooms,
        bathrooms,
        suites,
        parking_spaces,
        area_total,
        area_built,
        price_sale,
        price_rent,
        featured
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
        4,
        3,
        2,
        3,
        180.50,
        165.00,
        1850000.00,
        NULL,
        true
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
        5,
        4,
        3,
        4,
        450.00,
        380.00,
        2500000.00,
        12000.00,
        true
    )
    ON CONFLICT DO NOTHING;
    
    -- Inserir 2 leads de exemplo
    INSERT INTO leads (
        company_id,
        name,
        email,
        phone,
        interest_type,
        budget_min,
        budget_max,
        lead_source,
        lead_score,
        stage
    ) VALUES
    (
        company_uuid,
        'João Silva',
        'joao.silva@email.com',
        '(31) 98888-7777',
        'buy',
        800000.00,
        1500000.00,
        'website',
        75,
        'qualified'
    ),
    (
        company_uuid,
        'Maria Santos',
        'maria.santos@email.com',
        '(31) 97777-6666',
        'rent',
        5000.00,
        10000.00,
        'facebook',
        60,
        'contacted'
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✅ Imobiliária Exclusiva criada com sucesso!';
    RAISE NOTICE '✅ 2 imóveis cadastrados';
    RAISE NOTICE '✅ 2 leads cadastrados';
END $$;
