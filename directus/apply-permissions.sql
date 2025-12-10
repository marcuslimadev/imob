-- Script SQL para aplicar permissões multi-tenant manualmente
-- Executar via psql ou interface do Directus

-- 1. Buscar IDs necessários
-- Buscar ID da role "Company Admin"
SELECT id, name FROM directus_roles WHERE name = 'Company Admin';

-- Buscar ID da policy associada
SELECT id, name FROM directus_policies WHERE name = 'Company Admin Policy';

-- 2. Deletar permissões antigas (opcional, para recomeçar limpo)
-- DELETE FROM directus_permissions WHERE policy = '<POLICY_ID_AQUI>';

-- 3. Inserir permissões multi-tenant
-- IMPORTANTE: Substituir <POLICY_ID> pelo ID retornado acima

-- Companies - apenas sua própria empresa
INSERT INTO directus_permissions (policy, collection, action, permissions, fields) VALUES
('<POLICY_ID>', 'companies', 'read', '{"id":{"_eq":"$CURRENT_USER.company_id"}}', '*'),
('<POLICY_ID>', 'companies', 'update', '{"id":{"_eq":"$CURRENT_USER.company_id"}}', '["nome_fantasia","email","telefone","logo","primary_color","secondary_color","custom_domain","storefront_template_id","theme_key"]');

-- Properties - CRUD completo filtrado por company_id
INSERT INTO directus_permissions (policy, collection, action, permissions, fields, presets) VALUES
('<POLICY_ID>', 'properties', 'create', '{}', '*', '{"company_id":"$CURRENT_USER.company_id"}'),
('<POLICY_ID>', 'properties', 'read', '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', '*', NULL),
('<POLICY_ID>', 'properties', 'update', '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', '*', NULL),
('<POLICY_ID>', 'properties', 'delete', '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', NULL, NULL);

-- Property Media
INSERT INTO directus_permissions (policy, collection, action, permissions, fields) VALUES
('<POLICY_ID>', 'property_media', 'create', '{}', '*'),
('<POLICY_ID>', 'property_media', 'read', '{}', '*'),
('<POLICY_ID>', 'property_media', 'delete', '{}', NULL);

-- Leads - CRUD completo
INSERT INTO directus_permissions (policy, collection, action, permissions, fields, presets) VALUES
('<POLICY_ID>', 'leads', 'create', '{}', '*', '{"company_id":"$CURRENT_USER.company_id"}'),
('<POLICY_ID>', 'leads', 'read', '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', '*', NULL),
('<POLICY_ID>', 'leads', 'update', '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', '*', NULL),
('<POLICY_ID>', 'leads', 'delete', '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', NULL, NULL);

-- Conversas - CRUD completo
INSERT INTO directus_permissions (policy, collection, action, permissions, fields, presets) VALUES
('<POLICY_ID>', 'conversas', 'create', '{}', '*', '{"company_id":"$CURRENT_USER.company_id"}'),
('<POLICY_ID>', 'conversas', 'read', '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', '*', NULL),
('<POLICY_ID>', 'conversas', 'update', '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', '*', NULL);

-- Mensagens
INSERT INTO directus_permissions (policy, collection, action, permissions, fields) VALUES
('<POLICY_ID>', 'mensagens', 'create', '{}', '*'),
('<POLICY_ID>', 'mensagens', 'read', '{}', '*');

-- Lead Activities
INSERT INTO directus_permissions (policy, collection, action, permissions, fields) VALUES
('<POLICY_ID>', 'lead_activities', 'create', '{}', '*'),
('<POLICY_ID>', 'lead_activities', 'read', '{}', '*');

-- Vistorias
INSERT INTO directus_permissions (policy, collection, action, permissions, fields, presets) VALUES
('<POLICY_ID>', 'vistorias', 'create', '{}', '*', '{"company_id":"$CURRENT_USER.company_id"}'),
('<POLICY_ID>', 'vistorias', 'read', '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', '*', NULL),
('<POLICY_ID>', 'vistorias', 'update', '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', '*', NULL),
('<POLICY_ID>', 'vistorias', 'delete', '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', NULL, NULL);

-- Vistoria Itens
INSERT INTO directus_permissions (policy, collection, action, permissions, fields) VALUES
('<POLICY_ID>', 'vistoria_itens', 'create', '{}', '*'),
('<POLICY_ID>', 'vistoria_itens', 'read', '{}', '*'),
('<POLICY_ID>', 'vistoria_itens', 'update', '{}', '*'),
('<POLICY_ID>', 'vistoria_itens', 'delete', '{}', NULL);

-- Vistoria Contestações
INSERT INTO directus_permissions (policy, collection, action, permissions, fields) VALUES
('<POLICY_ID>', 'vistoria_contestacoes', 'create', '{}', '*'),
('<POLICY_ID>', 'vistoria_contestacoes', 'read', '{}', '*'),
('<POLICY_ID>', 'vistoria_contestacoes', 'update', '{}', '*');

-- App Settings
INSERT INTO directus_permissions (policy, collection, action, permissions, fields) VALUES
('<POLICY_ID>', 'app_settings', 'read', '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', '*'),
('<POLICY_ID>', 'app_settings', 'update', '{"company_id":{"_eq":"$CURRENT_USER.company_id"}}', '*');

-- Directus Files - upload de imagens
INSERT INTO directus_permissions (policy, collection, action, permissions, fields) VALUES
('<POLICY_ID>', 'directus_files', 'create', '{}', '*'),
('<POLICY_ID>', 'directus_files', 'read', '{}', '*'),
('<POLICY_ID>', 'directus_files', 'update', '{}', '*'),
('<POLICY_ID>', 'directus_files', 'delete', '{}', NULL);

-- 4. Verificar permissões criadas
SELECT 
  p.collection,
  p.action,
  p.permissions,
  p.fields,
  p.presets
FROM directus_permissions p
WHERE p.policy = '<POLICY_ID>'
ORDER BY p.collection, p.action;
