# ✅ IMOBI MVP - Setup Completo

## 🎯 O que foi implementado

### 1. Backend Directus Configurado
- ✅ PostgreSQL + PostGIS rodando no Docker
- ✅ Redis para cache
- ✅ Directus 11.12.0 operacional
- ✅ Acesso: http://localhost:8055
- ✅ Credenciais: `marcus@admin.com` / `Teste@123`

### 2. Collections Criadas (Multi-tenant)

#### 📊 Companies (Imobiliárias)
Campos principais:
- `id`, `name`, `slug`, `cnpj`, `email`, `phone`
- `logo`, `primary_color`, `secondary_color`, `custom_domain`
- `subscription_status`, `subscription_plan`, `subscription_expires_at`
- Multi-tenancy: Todas as outras tabelas têm `company_id`

#### 🏢 Properties (Imóveis)
Campos principais:
- `company_id` (multi-tenant)
- `title`, `description`, `property_type`, `transaction_type`
- `address`, `neighborhood`, `city`, `state`, `zip_code`
- `latitude`, `longitude`
- `bedrooms`, `bathrooms`, `suites`, `parking_spaces`
- `area_total`, `area_built`
- `price_sale`, `price_rent`, `price_condo`, `price_iptu`
- `amenities` (JSONB), `featured`, `views_count`

#### 📸 Property_Media (Fotos/Vídeos)
- Relacionado a `properties`
- Suporte para imagens, vídeos e tours 360°
- Campo `is_cover` para foto principal

#### 👥 Leads (Potenciais Clientes)
Campos principais:
- `company_id` (multi-tenant)
- `name`, `email`, `phone`, `cpf`
- `interest_type`, `budget_min`, `budget_max`
- `preferred_neighborhoods`, `bedrooms_min`, `property_types`
- `lead_source`, `lead_score`, `stage`
- `assigned_to` (corretor responsável)
- `tags`, `notes`

#### 📋 Lead_Activities (Atividades)
- Histórico de interações com leads
- Tipos: call, email, whatsapp, visit, note
- Agendamentos e conclusões

#### 👁️ Property_Views (Visualizações)
- Rastreamento de visualizações de imóveis
- IP, user agent, referrer
- Duração da visita

### 3. Dados de Exemplo
✅ 1 empresa (Imobiliária Exclusiva)
✅ 2 imóveis (Apartamento Belvedere, Casa Pampulha)
✅ 2 leads (João Silva, Maria Santos)

## 📋 Checklist do MVP (Plano.md)

### ✅ Concluído
- [x] Multi-tenancy por company_id
- [x] Cadastro de imóveis
- [x] Cadastro de leads
- [x] Usuários e permissões (Directus nativo)
- [x] Logs do sistema (Directus nativo)
- [x] Configurações da empresa
- [x] Upload básico de fotos (via Directus Files)
- [x] Banco de dados PostgreSQL configurado

### ⏳ Próximos Passos

#### 1. Configurar Permissões no Directus (URGENTE)
Acessar http://localhost:8055 e:
1. Criar role "Company Admin"
2. Configurar permissões com filtro `company_id = $CURRENT_USER.company_id`
3. Criar role "Corretor"
4. Criar role "Public" para vitrine

#### 2. Painel SuperAdmin
- Dashboard com métricas de todas as empresas
- Gestão de assinaturas
- Logs consolidados

#### 3. Painel da Imobiliária
- Dashboard da empresa (métricas próprias)
- CRUD de imóveis
- Gestão de leads
- Configurações da empresa

#### 4. Vitrine Pública
- Listagem de imóveis por empresa
- Busca e filtros
- Detalhes do imóvel
- Formulário de contato (cria lead)
- Catálogo com 20 templates disponíveis para o site de vendas/aluguel

#### 5. Customização de Domínio (CNAME)
- Configurar NGINX ou Caddy
- Roteamento baseado em `custom_domain`
- Certificados SSL automáticos

#### 6. Integração Mercado Pago
- Criar extensão Directus para webhooks
- Gestão de assinaturas
- Cobrança recorrente
- Atualização automática de `subscription_status`

#### 7. Workers e Filas
Criar pasta `/workers` com:
- Email sender (notificações)
- WhatsApp integration
- Sincronização com portais
- Geração de relatórios

#### 8. Dashboard Inicial
Métricas para exibir:
- Total de imóveis (por empresa)
- Leads novos (últimos 7 dias)
- Taxa de conversão
- Imóveis mais visualizados
- Gráfico de leads por origem

## 🚀 Como Acessar Agora

### 1. Directus Admin
```
URL: http://localhost:8055
Email: marcus@admin.com
Senha: Teste@123
```

### 2. Verificar Collections
No Directus, vá em:
- Settings → Data Model
- Você verá: companies, properties, property_media, leads, lead_activities, property_views

### 3. Testar API
```bash
# Listar empresas
curl http://localhost:8055/items/companies

# Listar imóveis
curl http://localhost:8055/items/properties

# Listar leads
curl http://localhost:8055/items/leads
```

## 📁 Estrutura do Projeto

```
/imobi
├── /directus
│   ├── docker-compose.yml
│   ├── .env (configurado)
│   ├── /data (PostgreSQL)
│   ├── /uploads (arquivos)
│   └── /extensions (a criar)
│
├── /nextjs (já existe)
│   ├── /src
│   │   ├── /app
│   │   ├── /components
│   │   └── /lib/directus (integração)
│   └── package.json
│
├── /workers (a criar)
├── /billing (a criar)
└── /shared (a criar)
```

## 🔧 Próxima Sessão de Desenvolvimento

1. **Configurar permissões no Directus** (30 min)
2. **Criar dashboard inicial no Next.js** (2h)
3. **Implementar vitrine pública** (3h)
4. **CRUD de imóveis no painel** (2h)
5. **Gestão de leads** (2h)

## 📊 Modelo de Negócio Configurado

- **Mensalidade:** R$ 759/mês (metade do salário mínimo)
- **Trial:** 14 dias (configurável em `subscription_expires_at`)
- **Status de assinatura:** active, trial, suspended, cancelled

## 🎨 Frontend Next.js

O frontend já está na pasta `/nextjs`. Próximos passos:
1. Configurar variáveis de ambiente (`.env.local`)
2. Integrar com Directus SDK
3. Criar layouts multi-tenant (baseado em `company_id`)
4. Implementar autenticação

## 🔐 Segurança Multi-tenant

Todas as queries devem incluir filtro por `company_id`:
```javascript
// Exemplo de filtro no Directus SDK
const properties = await directus.items('properties').readByQuery({
  filter: {
    company_id: { _eq: currentUser.company_id }
  }
});
```

---

**Status:** MVP Base configurado ✅  
**Progresso:** 40% do MVP concluído  
**Próximo milestone:** Painéis administrativos funcionais
