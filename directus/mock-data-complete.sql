-- Criar empresa "Imobiliária Exclusiva"
INSERT INTO companies (id, name, domain, subdomain, status, theme_key) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Imobiliária Exclusiva', 'exclusiva.local', 'exclusiva', 'active', 'bauhaus')
ON CONFLICT (id) DO NOTHING;

-- Criar 10 leads
INSERT INTO leads (id, company_id, name, phone, email, status) VALUES
('lead0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'João Silva', '+5511987654321', 'joao.silva@email.com', 'novo'),
('lead0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Maria Santos', '+5511987654322', 'maria.santos@email.com', 'em_atendimento'),
('lead0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Pedro Oliveira', '+5511987654323', 'pedro.oliveira@email.com', 'qualificado'),
('lead0004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Ana Costa', '+5511987654324', 'ana.costa@email.com', 'novo'),
('lead0005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Carlos Ferreira', '+5511987654325', 'carlos.ferreira@email.com', 'em_atendimento'),
('lead0006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Juliana Lima', '+5511987654326', 'juliana.lima@email.com', 'qualificado'),
('lead0007-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'Roberto Alves', '+5511987654327', 'roberto.alves@email.com', 'novo'),
('lead0008-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'Fernanda Souza', '+5511987654328', 'fernanda.souza@email.com', 'em_atendimento'),
('lead0009-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'Lucas Martins', '+5511987654329', 'lucas.martins@email.com', 'qualificado'),
('lead0010-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'Camila Rocha', '+5511987654330', 'camila.rocha@email.com', 'novo')
ON CONFLICT (id) DO NOTHING;

-- Criar 10 conversas (uma para cada lead)
INSERT INTO conversas (id, company_id, lead_id, whatsapp_number, status, last_message) VALUES
('conv0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'lead0001-0000-0000-0000-000000000001', '+5511987654321', 'ativa', 'Olá! Gostaria de mais informações sobre apartamentos.'),
('conv0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'lead0002-0000-0000-0000-000000000002', '+5511987654322', 'ativa', 'Obrigado pelas informações! Vou pensar e retorno.'),
('conv0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'lead0003-0000-0000-0000-000000000003', '+5511987654323', 'ativa', 'Posso agendar uma visita para amanhã?'),
('conv0004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'lead0004-0000-0000-0000-000000000004', '+5511987654324', 'ativa', 'Quanto fica o financiamento para este imóvel?'),
('conv0005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'lead0005-0000-0000-0000-000000000005', '+5511987654325', 'ativa', 'Estou interessado em casas na zona sul.'),
('conv0006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'lead0006-0000-0000-0000-000000000006', '+5511987654326', 'ativa', 'Podem enviar mais fotos?'),
('conv0007-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'lead0007-0000-0000-0000-000000000007', '+5511987654327', 'ativa', 'Qual o valor do condomínio?'),
('conv0008-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'lead0008-0000-0000-0000-000000000008', '+5511987654328', 'ativa', 'Aceita permuta?'),
('conv0009-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'lead0009-0000-0000-0000-000000000009', '+5511987654329', 'ativa', 'Já está disponível para mudança?'),
('conv0010-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'lead0010-0000-0000-0000-000000000010', '+5511987654330', 'ativa', 'Qual a documentação necessária?')
ON CONFLICT (id) DO NOTHING;

-- Criar 15 properties
INSERT INTO properties (id, company_id, title, description, property_type, bedrooms, area, price, location, status) VALUES
('prop0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Apartamento 2 Quartos Vila Mariana', 'Lindo apartamento reformado', 'apartamento', 2, 65, 450000, 'Vila Mariana, São Paulo', 'disponivel'),
('prop0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Casa 3 Quartos Pinheiros', 'Casa espaçosa com quintal', 'casa', 3, 120, 850000, 'Pinheiros, São Paulo', 'disponivel'),
('prop0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Studio Moema', 'Studio moderno mobiliado', 'studio', 1, 35, 280000, 'Moema, São Paulo', 'reservado'),
('prop0004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Cobertura 4 Quartos Itaim Bibi', 'Cobertura de luxo com vista', 'cobertura', 4, 220, 1500000, 'Itaim Bibi, São Paulo', 'disponivel'),
('prop0005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Apartamento 3 Quartos Perdizes', 'Ótima localização', 'apartamento', 3, 95, 650000, 'Perdizes, São Paulo', 'disponivel'),
('prop0006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Sobrado 4 Quartos Jardins', 'Sobrado amplo', 'sobrado', 4, 250, 1200000, 'Jardins, São Paulo', 'vendido'),
('prop0007-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'Apartamento 1 Quarto Consolação', 'Compacto e funcional', 'apartamento', 1, 45, 350000, 'Consolação, São Paulo', 'disponivel'),
('prop0008-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'Casa 2 Quartos Lapa', 'Casa aconchegante', 'casa', 2, 85, 520000, 'Lapa, São Paulo', 'disponivel'),
('prop0009-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'Apartamento 2 Quartos Bela Vista', 'Vista privilegiada', 'apartamento', 2, 70, 480000, 'Bela Vista, São Paulo', 'reservado'),
('prop0010-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'Cobertura 3 Quartos Moema', 'Acabamento de primeira', 'cobertura', 3, 180, 1100000, 'Moema, São Paulo', 'disponivel'),
('prop0011-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'Studio Higienópolis', 'Próximo ao metrô', 'studio', 1, 32, 290000, 'Higienópolis, São Paulo', 'disponivel'),
('prop0012-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', 'Casa 3 Quartos Butantã', 'Terreno amplo', 'casa', 3, 150, 720000, 'Butantã, São Paulo', 'disponivel'),
('prop0013-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111', 'Apartamento 2 Quartos Tatuapé', 'Prédio novo', 'apartamento', 2, 62, 420000, 'Tatuapé, São Paulo', 'disponivel'),
('prop0014-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111111', 'Sobrado 3 Quartos Saúde', 'Garagem para 3 carros', 'sobrado', 3, 200, 950000, 'Saúde, São Paulo', 'disponivel'),
('prop0015-0000-0000-0000-000000000015', '11111111-1111-1111-1111-111111111111', 'Apartamento 4 Quartos Paraíso', 'Família grande', 'apartamento', 4, 130, 780000, 'Paraíso, São Paulo', 'disponivel')
ON CONFLICT (id) DO NOTHING;

-- Criar mensagens para cada conversa (4 mensagens por conversa)
INSERT INTO mensagens (id, conversa_id, content, direction, status, timestamp) VALUES
-- Conversa 1
('msg00001-0000-0000-0000-000000000001', 'conv0001-0000-0000-0000-000000000001', 'Olá! Gostaria de mais informações sobre apartamentos.', 'inbound', 'read', NOW() - INTERVAL '2 hours'),
('msg00002-0000-0000-0000-000000000002', 'conv0001-0000-0000-0000-000000000001', 'Olá João! Temos várias opções disponíveis. Qual região você prefere?', 'outbound', 'delivered', NOW() - INTERVAL '1 hour 50 minutes'),
('msg00003-0000-0000-0000-000000000003', 'conv0001-0000-0000-0000-000000000001', 'Prefiro zona sul, Vila Mariana ou Moema.', 'inbound', 'read', NOW() - INTERVAL '1 hour 40 minutes'),
('msg00004-0000-0000-0000-000000000004', 'conv0001-0000-0000-0000-000000000001', 'Perfeito! Tenho um ap de 2 quartos na Vila Mariana por R$ 450 mil. Posso enviar fotos?', 'outbound', 'delivered', NOW() - INTERVAL '1 hour 30 minutes'),
-- Conversa 2
('msg00005-0000-0000-0000-000000000005', 'conv0002-0000-0000-0000-000000000002', 'Bom dia! Vi o anúncio da casa em Pinheiros.', 'inbound', 'read', NOW() - INTERVAL '3 hours'),
('msg00006-0000-0000-0000-000000000006', 'conv0002-0000-0000-0000-000000000002', 'Bom dia Maria! É uma casa linda, 3 quartos com quintal.', 'outbound', 'delivered', NOW() - INTERVAL '2 hours 50 minutes'),
('msg00007-0000-0000-0000-000000000007', 'conv0002-0000-0000-0000-000000000002', 'Qual o valor do IPTU?', 'inbound', 'read', NOW() - INTERVAL '2 hours 40 minutes'),
('msg00008-0000-0000-0000-000000000008', 'conv0002-0000-0000-0000-000000000002', 'O IPTU é de R$ 2.500 por ano. Obrigado pelas informações! Vou pensar e retorno.', 'outbound', 'delivered', NOW() - INTERVAL '2 hours 30 minutes')
ON CONFLICT (id) DO NOTHING;
