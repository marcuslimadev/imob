-- Seed de planos de assinatura
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, max_properties, max_users, max_leads, max_whatsapp_messages, storage_limit_mb, features, is_active, is_default, trial_days)
VALUES
  ('Free', 'free', 'Plano gratuito para começar', 0, 0, 10, 2, 50, 100, 256, '["10 imóveis","2 usuários","50 leads","100 msgs WhatsApp/mês"]'::jsonb, true, true, 0),
  ('Starter', 'starter', 'Ideal para pequenas imobiliárias', 97, 970, 50, 5, 200, 500, 1024, '["50 imóveis","5 usuários","200 leads","500 msgs/mês","Suporte email"]'::jsonb, true, false, 14),
  ('Pro', 'pro', 'Para imobiliárias em crescimento', 197, 1970, 200, 15, 1000, 2000, 5120, '["200 imóveis","15 usuários","1000 leads","2000 msgs/mês","Suporte prioritário"]'::jsonb, true, false, 14),
  ('Enterprise', 'enterprise', 'Solução completa para grandes operações', 497, 4970, -1, -1, -1, -1, 51200, '["Imóveis ilimitados","Usuários ilimitados","Leads ilimitados","Suporte dedicado"]'::jsonb, true, false, 30)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features;
