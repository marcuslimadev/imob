-- Associa company_id ao usuário (se o campo existir em directus_users)
-- Uso:
--   psql "postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require" \
--     -v target_email='contato@exclusivalarimoveis.com.br' \
--     -v company_name_like='%Exclusiva%' \
--     -f set-user-company.sql

-- 1) Confirma que o campo existe
SELECT column_name
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name='directus_users'
  AND column_name='company_id';

-- 2) Confere usuário e empresa alvo
SELECT id AS user_id, email
FROM directus_users
WHERE email = :'target_email';

SELECT id AS company_id, name
FROM companies
WHERE name ILIKE :'company_name_like'
ORDER BY name
LIMIT 10;

-- 3) Atualiza
UPDATE directus_users
SET company_id = (
  SELECT id
  FROM companies
  WHERE name ILIKE :'company_name_like'
  ORDER BY name
  LIMIT 1
)
WHERE email = :'target_email';

-- 4) Confirma
SELECT email, company_id
FROM directus_users
WHERE email = :'target_email';
