-- Criar policy de admin
INSERT INTO directus_policies (id, name, icon, description, admin_access, app_access) 
VALUES ('abcd1234-5678-90ab-cdef-000000000000', 'Admin Access', 'admin_panel_settings', 'Full admin access', true, true) 
ON CONFLICT (id) DO UPDATE SET admin_access = true, app_access = true;

-- Associar policy ao usuário admin
INSERT INTO directus_access (id, policy, role, "user") 
VALUES (gen_random_uuid(), 'abcd1234-5678-90ab-cdef-000000000000', NULL, '9523b558-454c-4e6b-aac5-f207ad36beef')
ON CONFLICT DO NOTHING;
