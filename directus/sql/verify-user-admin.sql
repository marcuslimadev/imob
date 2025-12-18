-- Verifica se um usuário tem admin_access/app_access via policies
-- Uso:
--   psql "postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require" -v target_email='admin@imobi.com.br' -f verify-user-admin.sql
--   psql -U directus -d directus -v target_email='admin@example.com' -f verify-user-admin.sql

-- 1) Usuário
SELECT u.id AS user_id, u.email, u.status, u.role
FROM directus_users u
WHERE u.email = :'target_email';

-- 2) Policies ligadas DIRETAMENTE ao usuário (directus_access.user)
SELECT p.id AS policy_id, p.name AS policy_name, p.admin_access, p.app_access
FROM directus_access a
JOIN directus_users u ON u.id = a."user"
JOIN directus_policies p ON p.id = a.policy
WHERE u.email = :'target_email'
ORDER BY p.admin_access DESC, p.name;

-- 3) Policies herdadas via ROLE (directus_access.role)
SELECT r.name AS role_name, p.name AS policy_name, p.admin_access, p.app_access
FROM directus_access a
JOIN directus_roles r ON r.id = a.role
JOIN directus_policies p ON p.id = a.policy
WHERE r.id = (
  SELECT role FROM directus_users WHERE email = :'target_email'
)
ORDER BY p.admin_access DESC, p.name;
