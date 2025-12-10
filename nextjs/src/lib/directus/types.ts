/**
 * Tipos TypeScript para as collections do Directus (IMOBI)
 */

export interface DirectusUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  location?: string;
  title?: string;
  description?: string;
  tags?: string[];
  avatar?: string;
  language?: string;
  theme?: string;
  tfa_secret?: string;
  status: 'active' | 'suspended' | 'deleted';
  role?: string;
  token?: string;
  last_access?: string;
  last_page?: string;
}

export interface Company {
  id: string;
  status: 'active' | 'suspended' | 'cancelled';
  user_created?: string;
  date_created?: string;
  user_updated?: string;
  date_updated?: string;
  
  // Dados básicos
  razao_social: string;
  nome_fantasia: string;
  cnpj?: string;
  slug: string; // subdomínio (exclusiva.imobi.com.br)
  custom_domain?: string; // domínio customizado
  
  // Branding
  logo_url?: string;
  primary_color?: string;
  
  // Contato
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  
  // Integrações Twilio
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_whatsapp_number?: string; // formato: whatsapp:+5511999999999
  
  // Integrações OpenAI
  openai_api_key?: string;
  openai_model?: string; // ex: gpt-4o-mini
  
  // Integrações Asaas (pagamentos)
  asaas_api_key?: string;
  
  // Integrações ClickSign (assinaturas digitais)
  clicksign_access_token?: string;
  
  // API Externa de Imóveis
  external_api_url?: string;
  external_api_key?: string;
  
  // Assinatura
  subscription_plan?: 'basic' | 'pro' | 'enterprise';
  subscription_status?: 'active' | 'suspended' | 'cancelled';
  trial_ends_at?: string;
}

export interface Property {
  id: string;
  status: 'published' | 'draft' | 'archived';
  user_created?: string;
  date_created?: string;
  user_updated?: string;
  date_updated?: string;
  
  company_id: string;
  company?: Company;
  
  // Dados básicos
  codigo_imovel?: string;
  titulo: string;
  descricao?: string; // HTML
  tipo: 'casa' | 'apartamento' | 'terreno' | 'comercial' | 'rural';
  finalidade: 'venda' | 'aluguel' | 'temporada';
  
  // Valores
  preco?: number;
  condominio?: number;
  iptu?: number;
  
  // Localização
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  
  // Características
  area_total?: number;
  area_construida?: number;
  quartos?: number;
  suites?: number;
  banheiros?: number;
  vagas_garagem?: number;
  caracteristicas?: Record<string, any>; // JSON com extras
  
  // Status e metadata
  disponivel?: boolean;
  destaque?: boolean;
  views_count?: number;
  
  // Sincronização com API externa
  external_id?: string;
  external_data?: Record<string, any>;
  sync_status?: 'synced' | 'pending' | 'error';
  last_sync_at?: string;
  
  // Relacionamentos
  media?: PropertyMedia[];
  views?: PropertyView[];
  matches?: LeadPropertyMatch[];
}

export interface PropertyMedia {
  id: string;
  status: 'published' | 'draft' | 'archived';
  property_id: string;
  property?: Property;
  tipo: 'foto' | 'video' | 'tour_virtual';
  url: string;
  thumbnail_url?: string;
  ordem?: number;
  descricao?: string;
}

export interface Lead {
  id: string;
  status: 'active' | 'archived';
  user_created?: string;
  date_created?: string;
  user_updated?: string;
  date_updated?: string;
  
  company_id: string;
  company?: Company;
  
  // Dados básicos
  nome: string;
  email?: string;
  telefone?: string;
  whatsapp?: string; // formato: +5511999999999
  origem?: 'whatsapp' | 'site' | 'facebook' | 'instagram' | 'indicacao' | 'telefone';
  stage: 'novo' | 'contato' | 'qualificado' | 'proposta' | 'negociacao' | 'fechado' | 'perdido';
  
  // WhatsApp
  whatsapp_name?: string;
  whatsapp_profile_pic?: string;
  last_message_at?: string;
  unread_count?: number;
  
  // Preferências de imóvel
  tipo_imovel_interesse?: string[]; // ["casa", "apartamento"]
  finalidade_interesse?: 'venda' | 'aluguel' | 'temporada';
  orcamento_min?: number;
  orcamento_max?: number;
  cidades_interesse?: string[];
  quartos_min?: number;
  vagas_min?: number;
  
  // IA / Diagnóstico
  ai_diagnostic?: Record<string, any>;
  ai_score?: number; // 0-100
  ai_tags?: string[];
  
  // Financeiro
  renda_familiar?: number;
  aprovacao_financiamento?: boolean;
  valor_entrada?: number;
  
  // Outras
  observacoes?: string;
  responsavel_id?: string;
  responsavel?: DirectusUser;
  
  // Relacionamentos
  conversas?: Conversa[];
  activities?: LeadActivity[];
  property_views?: PropertyView[];
  matches?: LeadPropertyMatch[];
}

export interface LeadActivity {
  id: string;
  date_created?: string;
  user_created?: string;
  
  lead_id: string;
  lead?: Lead;
  tipo: 'chamada' | 'email' | 'whatsapp' | 'visita' | 'proposta' | 'follow_up' | 'nota';
  descricao?: string;
  agendado_para?: string;
  concluido?: boolean;
}

export interface PropertyView {
  id: string;
  date_created?: string;
  
  lead_id: string;
  lead?: Lead;
  property_id: string;
  property?: Property;
  origem?: 'site' | 'whatsapp' | 'email';
}

export interface Conversa {
  id: string;
  status: 'active' | 'archived';
  date_created?: string;
  date_updated?: string;
  
  company_id: string;
  company?: Company;
  lead_id?: string;
  lead?: Lead;
  
  telefone: string; // formato: +5511999999999
  whatsapp_name?: string;
  whatsapp_profile_pic?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  archived?: boolean;
  
  // Relacionamentos
  mensagens?: Mensagem[];
}

export interface Mensagem {
  id: string;
  date_created?: string;
  
  conversa_id: string;
  conversa?: Conversa;
  company_id: string;
  
  twilio_sid?: string;
  direction: 'inbound' | 'outbound';
  content?: string;
  media_url?: string;
  media_type?: string;
  status?: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  read_at?: string;
  transcription?: string; // Whisper transcription para áudios
  sent_by_user_id?: string;
  sent_by?: DirectusUser;
}

export interface LeadPropertyMatch {
  id: string;
  date_created?: string;
  
  company_id: string;
  lead_id: string;
  lead?: Lead;
  property_id: string;
  property?: Property;
  
  match_score?: number; // 0-100
  match_reasons?: Record<string, any>; // JSON com motivos do match
  sent_to_lead?: boolean;
  lead_feedback?: 'interested' | 'not_interested' | 'visited';
}

export interface Atividade {
  id: string;
  date_created?: string;
  
  company_id: string;
  tipo: 'lead_created' | 'message_sent' | 'property_sent' | 'stage_changed' | 'ai_diagnostic';
  descricao?: string;
  lead_id?: string;
  lead?: Lead;
  property_id?: string;
  property?: Property;
  user_id?: string;
  user?: DirectusUser;
  metadata?: Record<string, any>;
}

export interface WebhookLog {
  id: string;
  date_created?: string;
  
  company_id: string;
  service: 'twilio' | 'asaas' | 'clicksign';
  event_type?: string;
  payload?: Record<string, any>;
  processed?: boolean;
  processed_at?: string;
  error_message?: string;
}

export interface AppSetting {
  id: string;
  date_created?: string;
  date_updated?: string;
  
  company_id: string;
  chave: string;
  valor?: string;
  tipo?: 'string' | 'number' | 'boolean' | 'json';
  descricao?: string;
}

/**
 * Schema completo para o SDK do Directus
 */
export interface Schema {
  directus_users: DirectusUser[];
  companies: Company[];
  properties: Property[];
  property_media: PropertyMedia[];
  leads: Lead[];
  lead_activities: LeadActivity[];
  property_views: PropertyView[];
  conversas: Conversa[];
  mensagens: Mensagem[];
  lead_property_matches: LeadPropertyMatch[];
  atividades: Atividade[];
  webhooks_log: WebhookLog[];
  app_settings: AppSetting[];
}
