
-- 1) Confere se o usuário existe
SELECT id AS user_id, email
FROM directus_users
WHERE email = :'target_email';

-- 2) Garante que ele tenha alguma policy com admin_access=true (preferindo "Super Admin Policy")
WITH u AS (
  SELECT id
  FROM directus_users
  WHERE email = :'target_email'
),
p AS (
  SELECT id
  FROM directus_policies
  WHERE admin_access = TRUE
  ORDER BY (name = 'Super Admin Policy') DESC, name
  LIMIT 1
)
INSERT INTO directus_access (id, "user", policy, sort)
SELECT gen_random_uuid(), u.id, p.id, 1
FROM u
CROSS JOIN p
WHERE NOT EXISTS (
  SELECT 1
  FROM directus_access a
  WHERE a."user" = u.id
    AND a.policy = p.id
);

-- 3) Confirma quais policies admin o usuário tem
SELECT u.email, p.name AS policy_name, p.admin_access, p.app_access
FROM directus_access a
JOIN directus_users u ON u.id = a."user"
JOIN directus_policies p ON p.id = a.policy
WHERE u.email = :'target_email'
  AND p.admin_access = TRUE
ORDER BY p.name;
