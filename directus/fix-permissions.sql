-- Dar permissões totais para usuário admin (sem role) em todas as collections

-- Obter o ID do usuário admin
\set admin_user_id '23316b3a-aac1-4804-8945-3e1d47b6f7cd'

-- Criar uma policy admin se não existir
INSERT INTO directus_policies (id, name, icon, description, admin_access, app_access) 
VALUES ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Super Admin Policy', 'verified', 'Full system access', true, true)
ON CONFLICT (id) DO UPDATE SET admin_access = true, app_access = true;

-- Associar policy ao usuário admin
INSERT INTO directus_access (id, policy, role, "user") 
VALUES (gen_random_uuid(), 'ffffffff-ffff-ffff-ffff-ffffffffffff', NULL, '23316b3a-aac1-4804-8945-3e1d47b6f7cd')
ON CONFLICT DO NOTHING;

-- Criar permissões completas para esta policy em todas as collections importantes
DO $$
DECLARE
    collection_name TEXT;
    policy_id UUID := 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    action_name TEXT;
BEGIN
    FOREACH collection_name IN ARRAY ARRAY['companies', 'leads', 'properties', 'conversas', 'mensagens', 'directus_users', 'directus_roles', 'directus_permissions', 'directus_fields', 'directus_collections']
    LOOP
        FOREACH action_name IN ARRAY ARRAY['create', 'read', 'update', 'delete']
        LOOP
            INSERT INTO directus_permissions (policy, collection, action, permissions, validation, presets, fields)
            VALUES (
                policy_id,
                collection_name,
                action_name,
                '{}',
                NULL,
                NULL,
                '*'
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

\echo 'Permissões criadas com sucesso!'
