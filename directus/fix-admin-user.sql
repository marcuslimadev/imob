-- Remover role do admin e associar à super admin policy
UPDATE directus_users SET role = NULL WHERE email = 'admin@example.com';

UPDATE directus_access SET "user" = '23316b3a-aac1-4804-8945-3e1d47b6f7cd' 
WHERE policy = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

SELECT * FROM directus_access WHERE policy = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
