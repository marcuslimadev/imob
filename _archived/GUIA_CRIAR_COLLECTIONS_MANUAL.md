# 📘 Guia Completo: Criar Collections do IMOBI Manualmente

## 🎯 Objetivo
Criar todas as collections (tabelas) do sistema IMOBI Multi-tenant no Directus manualmente através da interface administrativa.

---

## 📋 Collection 1: Companies (Imobiliárias)

### Passo 1: Criar a Collection
1. Acesse: **Settings** (⚙️) → **Data Model**
2. Clique em **"Create Collection"** (botão +)
3. Preencha:
   - **Collection Name**: `companies`
   - **Type**: `Standard` (não marcar singleton)
   - **Icon**: `business` 
   - **Color**: `#2563EB` (azul)
   - **Note**: `Imobiliárias cadastradas no sistema (Multi-tenant)`

### Passo 2: Criar os Campos (Fields)

#### Campo: id (PK)
- **Já vem criado automaticamente** ✅

#### Campo: status
- **Já vem criado automaticamente** ✅

#### Campo: date_created
- **Já vem criado automaticamente** ✅

#### Campo: date_updated
- **Já vem criado automaticamente** ✅

#### Campo: name (Nome da Imobiliária)
- Clique em **"Create Field"**
- **Type**: `String` (Input)
- **Field**: `name`
- **Interface**: `Input`
- **Schema**:
  - Required: `✓` (marcar)
  - Max Length: `255`
- **Display**: 
  - Name: `Nome da Imobiliária`
  - Placeholder: `Ex: Imobiliária Exclusiva`

#### Campo: slug (Identificador único)
- **Type**: `String` (Input)
- **Field**: `slug`
- **Interface**: `Slug`
- **Schema**:
  - Required: `✓`
  - Unique: `✓` (marcar)
  - Max Length: `100`
- **Display**:
  - Name: `Slug`
  - Template: `{{name}}` (gera automaticamente do nome)
  - Placeholder: `exclusiva`

#### Campo: cnpj
- **Type**: `String` (Input)
- **Field**: `cnpj`
- **Interface**: `Input`
- **Schema**:
  - Max Length: `18`
- **Display**:
  - Name: `CNPJ`
  - Placeholder: `00.000.000/0000-00`
  - Format: `Masked` com máscara `##.###.###/####-##`

#### Campo: email
- **Type**: `String` (Input)
- **Field**: `email`
- **Interface**: `Input`
- **Schema**:
  - Max Length: `255`
- **Display**:
  - Name: `E-mail`
  - Type: `email`

#### Campo: phone
- **Type**: `String` (Input)
- **Field**: `phone`
- **Interface**: `Input`
- **Schema**:
  - Max Length: `20`
- **Display**:
  - Name: `Telefone`
  - Placeholder: `(00) 00000-0000`

#### Campo: logo (Logotipo)
- **Type**: `File` (Image)
- **Field**: `logo`
- **Interface**: `File Image`
- **Relationship**: Many-to-One com `directus_files`
- **Display**:
  - Name: `Logotipo`
  - Accept: `image/*`

#### Campo: primary_color
- **Type**: `String` (Input)
- **Field**: `primary_color`
- **Interface**: `Color`
- **Schema**:
  - Default Value: `#6644FF`
  - Max Length: `7`
- **Display**:
  - Name: `Cor Primária`

#### Campo: secondary_color
- **Type**: `String` (Input)
- **Field**: `secondary_color`
- **Interface**: `Color`
- **Schema**:
  - Default Value: `#4F46E5`
  - Max Length: `7`
- **Display**:
  - Name: `Cor Secundária`

#### Campo: custom_domain
- **Type**: `String` (Input)
- **Field**: `custom_domain`
- **Interface**: `Input`
- **Schema**:
  - Max Length: `255`
  - Unique: `✓`
- **Display**:
  - Name: `Domínio Personalizado`
  - Placeholder: `imoveis.exclusiva.com.br`

#### Campo: subscription_status
- **Type**: `String` (Dropdown)
- **Field**: `subscription_status`
- **Interface**: `Select Dropdown`
- **Schema**:
  - Default Value: `trial`
- **Display**:
  - Name: `Status da Assinatura`
  - Choices:
    ```
    trial = Trial (Período de Testes)
    active = Ativo
    suspended = Suspenso
    cancelled = Cancelado
    ```

#### Campo: subscription_plan
- **Type**: `String` (Dropdown)
- **Field**: `subscription_plan`
- **Interface**: `Select Dropdown`
- **Schema**:
  - Default Value: `standard`
- **Display**:
  - Name: `Plano de Assinatura`
  - Choices:
    ```
    standard = Padrão (R$ 759/mês)
    ```

#### Campo: subscription_expires_at
- **Type**: `Timestamp` (Datetime)
- **Field**: `subscription_expires_at`
- **Interface**: `Datetime`
- **Display**:
  - Name: `Data de Expiração da Assinatura`
  - Include Seconds: `não`

### Passo 3: Configurar Display Template
1. Volte em **Settings** → **Data Model** → **companies**
2. Clique em **"Advanced"**
3. Em **Display Template**, coloque: `{{name}}`

---

## 📋 Collection 2: Properties (Imóveis)

### Passo 1: Criar a Collection
1. **Settings** → **Data Model** → **Create Collection**
2. Preencha:
   - **Collection Name**: `properties`
   - **Type**: `Standard`
   - **Icon**: `home`
   - **Color**: `#10B981` (verde)
   - **Note**: `Imóveis cadastrados no sistema`

### Passo 2: Criar os Campos

#### Campo: company_id (Relação com Imobiliária) ⭐ IMPORTANTE
- **Type**: `Many to One Relationship`
- **Field**: `company_id`
- **Related Collection**: `companies`
- **Display**:
  - Name: `Imobiliária`
  - Required: `✓`
- **Interface**: `Select Dropdown (Related Values)`
- **Display Template**: `{{name}}`

#### Campo: title
- **Type**: `String` (Input)
- **Field**: `title`
- **Schema**:
  - Required: `✓`
  - Max Length: `255`
- **Display**:
  - Name: `Título do Imóvel`
  - Placeholder: `Ex: Apartamento Luxo no Belvedere`

#### Campo: description
- **Type**: `Text` (Textarea)
- **Field**: `description`
- **Interface**: `Textarea`
- **Display**:
  - Name: `Descrição Completa`
  - Rows: `5`

#### Campo: property_type
- **Type**: `String` (Dropdown)
- **Field**: `property_type`
- **Interface**: `Select Dropdown`
- **Display**:
  - Name: `Tipo de Imóvel`
  - Choices:
    ```
    apartment = Apartamento
    house = Casa
    commercial = Comercial
    land = Terreno
    farm = Fazenda/Chácara
    penthouse = Cobertura
    studio = Studio/Kitnet
    ```

#### Campo: transaction_type
- **Type**: `String` (Dropdown)
- **Field**: `transaction_type`
- **Interface**: `Select Dropdown`
- **Display**:
  - Name: `Tipo de Transação`
  - Choices:
    ```
    sale = Venda
    rent = Aluguel
    both = Venda e Aluguel
    ```

#### Campo: address
- **Type**: `String` (Input)
- **Field**: `address`
- **Schema**: Max Length: `255`
- **Display**:
  - Name: `Endereço Completo`
  - Placeholder: `Rua, número`

#### Campo: neighborhood
- **Type**: `String` (Input)
- **Field**: `neighborhood`
- **Schema**: Max Length: `100`
- **Display**:
  - Name: `Bairro`

#### Campo: city
- **Type**: `String` (Input)
- **Field**: `city`
- **Schema**: Max Length: `100`
- **Display**:
  - Name: `Cidade`
  - Placeholder: `Belo Horizonte`

#### Campo: state
- **Type**: `String` (Dropdown)
- **Field**: `state`
- **Interface**: `Select Dropdown`
- **Schema**: Max Length: `2`
- **Display**:
  - Name: `Estado (UF)`
  - Choices:
    ```
    AC = Acre
    AL = Alagoas
    AP = Amapá
    AM = Amazonas
    BA = Bahia
    CE = Ceará
    DF = Distrito Federal
    ES = Espírito Santo
    GO = Goiás
    MA = Maranhão
    MT = Mato Grosso
    MS = Mato Grosso do Sul
    MG = Minas Gerais
    PA = Pará
    PB = Paraíba
    PR = Paraná
    PE = Pernambuco
    PI = Piauí
    RJ = Rio de Janeiro
    RN = Rio Grande do Norte
    RS = Rio Grande do Sul
    RO = Rondônia
    RR = Roraima
    SC = Santa Catarina
    SP = São Paulo
    SE = Sergipe
    TO = Tocantins
    ```

#### Campo: zip_code
- **Type**: `String` (Input)
- **Field**: `zip_code`
- **Schema**: Max Length: `10`
- **Display**:
  - Name: `CEP`
  - Placeholder: `00000-000`

#### Campo: latitude
- **Type**: `Float` (Decimal)
- **Field**: `latitude`
- **Display**:
  - Name: `Latitude`
  - Precision: `10,8`

#### Campo: longitude
- **Type**: `Float` (Decimal)
- **Field**: `longitude`
- **Display**:
  - Name: `Longitude`
  - Precision: `11,8`

#### Campo: bedrooms
- **Type**: `Integer` (Number)
- **Field**: `bedrooms`
- **Display**:
  - Name: `Quartos`
  - Placeholder: `3`

#### Campo: bathrooms
- **Type**: `Integer` (Number)
- **Field**: `bathrooms`
- **Display**:
  - Name: `Banheiros`

#### Campo: suites
- **Type**: `Integer` (Number)
- **Field**: `suites`
- **Display**:
  - Name: `Suítes`

#### Campo: parking_spaces
- **Type**: `Integer` (Number)
- **Field**: `parking_spaces`
- **Display**:
  - Name: `Vagas de Garagem`

#### Campo: area_total
- **Type**: `Float` (Decimal)
- **Field**: `area_total`
- **Display**:
  - Name: `Área Total (m²)`
  - Precision: `10,2`
  - Suffix: ` m²`

#### Campo: area_built
- **Type**: `Float` (Decimal)
- **Field**: `area_built`
- **Display**:
  - Name: `Área Construída (m²)`
  - Precision: `10,2`
  - Suffix: ` m²`

#### Campo: price_sale
- **Type**: `Float` (Decimal)
- **Field**: `price_sale`
- **Display**:
  - Name: `Preço de Venda`
  - Precision: `12,2`
  - Prefix: `R$ `

#### Campo: price_rent
- **Type**: `Float` (Decimal)
- **Field**: `price_rent`
- **Display**:
  - Name: `Preço de Aluguel`
  - Precision: `10,2`
  - Prefix: `R$ `

#### Campo: price_condo
- **Type**: `Float` (Decimal)
- **Field**: `price_condo`
- **Display**:
  - Name: `Valor do Condomínio`
  - Precision: `10,2`
  - Prefix: `R$ `

#### Campo: price_iptu
- **Type**: `Float` (Decimal)
- **Field**: `price_iptu`
- **Display**:
  - Name: `Valor do IPTU`
  - Precision: `10,2`
  - Prefix: `R$ `

#### Campo: amenities
- **Type**: `JSON` (Code)
- **Field**: `amenities`
- **Interface**: `Code` ou `Tags`
- **Display**:
  - Name: `Diferenciais/Amenidades`
  - Language: `JSON`

**Exemplo de JSON:**
```json
{
  "piscina": true,
  "churrasqueira": true,
  "salao_festas": true,
  "academia": false,
  "playground": true,
  "seguranca_24h": true
}
```

#### Campo: featured
- **Type**: `Boolean` (Toggle)
- **Field**: `featured`
- **Schema**: Default Value: `false`
- **Display**:
  - Name: `Imóvel em Destaque?`
  - Label: `Sim, destacar este imóvel`

#### Campo: views_count
- **Type**: `Integer` (Number)
- **Field**: `views_count`
- **Schema**: Default Value: `0`
- **Display**:
  - Name: `Número de Visualizações`
  - Read Only: `✓` (somente leitura)

### Passo 3: Display Template
- **Display Template**: `{{title}}`

---

## 📋 Collection 3: Property Media (Fotos e Vídeos)

### Passo 1: Criar a Collection
1. **Settings** → **Data Model** → **Create Collection**
2. Preencha:
   - **Collection Name**: `property_media`
   - **Type**: `Standard`
   - **Icon**: `photo_library`
   - **Color**: `#8B5CF6` (roxo)
   - **Note**: `Fotos e vídeos dos imóveis`
   - **Hidden**: `✓` (marcar - collection auxiliar)

### Passo 2: Criar os Campos

#### Campo: property_id (Relação com Imóvel)
- **Type**: `Many to One Relationship`
- **Field**: `property_id`
- **Related Collection**: `properties`
- **Display**:
  - Name: `Imóvel`
  - Required: `✓`

#### Campo: directus_file
- **Type**: `File` (Image/Video)
- **Field**: `directus_file`
- **Interface**: `File`
- **Relationship**: Many-to-One com `directus_files`
- **Display**:
  - Name: `Arquivo (Foto ou Vídeo)`
  - Accept: `image/*, video/*`

#### Campo: is_cover
- **Type**: `Boolean` (Toggle)
- **Field**: `is_cover`
- **Schema**: Default Value: `false`
- **Display**:
  - Name: `Foto de Capa?`
  - Label: `Usar como foto principal`

#### Campo: caption
- **Type**: `Text` (Textarea)
- **Field**: `caption`
- **Display**:
  - Name: `Legenda`
  - Placeholder: `Descrição da foto/vídeo`

#### Campo: sort
- **Type**: `Integer` (Number)
- **Field**: `sort`
- **Schema**: Default Value: `0`
- **Display**:
  - Name: `Ordem de Exibição`

### Passo 3: Configurar na Collection Properties
1. Volte em **properties**
2. Crie um campo de relacionamento reverso:
   - **Field**: `media`
   - **Type**: `One to Many Relationship`
   - **Related Collection**: `property_media`
   - **Foreign Key**: `property_id`
   - **Interface**: `List (O2M)`
   - **Name**: `Fotos e Vídeos`

---

## 📋 Collection 4: Leads (Clientes Potenciais)

### Passo 1: Criar a Collection
1. **Settings** → **Data Model** → **Create Collection**
2. Preencha:
   - **Collection Name**: `leads`
   - **Type**: `Standard`
   - **Icon**: `people`
   - **Color**: `#F59E0B` (laranja)
   - **Note**: `Leads e clientes em potencial`

### Passo 2: Criar os Campos

#### Campo: company_id
- **Type**: `Many to One Relationship`
- **Field**: `company_id`
- **Related Collection**: `companies`
- **Display**:
  - Name: `Imobiliária`
  - Required: `✓`

#### Campo: name
- **Type**: `String` (Input)
- **Field**: `name`
- **Schema**:
  - Required: `✓`
  - Max Length: `255`
- **Display**:
  - Name: `Nome Completo`

#### Campo: email
- **Type**: `String` (Input)
- **Field**: `email`
- **Schema**: Max Length: `255`
- **Display**:
  - Name: `E-mail`
  - Type: `email`

#### Campo: phone
- **Type**: `String` (Input)
- **Field**: `phone`
- **Schema**: Max Length: `20`
- **Display**:
  - Name: `Telefone`
  - Placeholder: `(00) 00000-0000`

#### Campo: cpf
- **Type**: `String` (Input)
- **Field**: `cpf`
- **Schema**: Max Length: `14`
- **Display**:
  - Name: `CPF`
  - Placeholder: `000.000.000-00`

#### Campo: interest_type
- **Type**: `String` (Dropdown)
- **Field**: `interest_type`
- **Interface**: `Select Dropdown`
- **Display**:
  - Name: `Tipo de Interesse`
  - Choices:
    ```
    buy = Comprar
    rent = Alugar
    ```

#### Campo: budget_min
- **Type**: `Float` (Decimal)
- **Field**: `budget_min`
- **Display**:
  - Name: `Orçamento Mínimo`
  - Precision: `12,2`
  - Prefix: `R$ `

#### Campo: budget_max
- **Type**: `Float` (Decimal)
- **Field**: `budget_max`
- **Display**:
  - Name: `Orçamento Máximo`
  - Precision: `12,2`
  - Prefix: `R$ `

#### Campo: preferred_neighborhoods
- **Type**: `JSON` (Tags)
- **Field**: `preferred_neighborhoods`
- **Interface**: `Tags`
- **Display**:
  - Name: `Bairros de Preferência`
  - Placeholder: `Digite e pressione Enter`

**Exemplo:** `["Belvedere", "Savassi", "Lourdes"]`

#### Campo: bedrooms_min
- **Type**: `Integer` (Number)
- **Field**: `bedrooms_min`
- **Display**:
  - Name: `Mínimo de Quartos`

#### Campo: property_types
- **Type**: `JSON` (Tags)
- **Field**: `property_types`
- **Interface**: `Tags`
- **Display**:
  - Name: `Tipos de Imóvel de Interesse`

**Exemplo:** `["apartment", "house"]`

#### Campo: lead_source
- **Type**: `String` (Dropdown)
- **Field**: `lead_source`
- **Interface**: `Select Dropdown`
- **Display**:
  - Name: `Origem do Lead`
  - Choices:
    ```
    website = Site
    facebook = Facebook
    instagram = Instagram
    google = Google Ads
    olx = OLX
    referral = Indicação
    walk-in = Visita Presencial
    phone = Telefone
    whatsapp = WhatsApp
    ```

#### Campo: lead_score
- **Type**: `Integer` (Slider)
- **Field**: `lead_score`
- **Schema**: Default Value: `0`
- **Display**:
  - Name: `Pontuação do Lead (0-100)`
  - Min: `0`
  - Max: `100`
  - Step: `5`

#### Campo: stage
- **Type**: `String` (Dropdown)
- **Field**: `stage`
- **Interface**: `Select Dropdown`
- **Schema**: Default Value: `new`
- **Display**:
  - Name: `Estágio do Funil`
  - Choices:
    ```
    new = Novo
    contacted = Contatado
    qualified = Qualificado
    visiting = Agendou Visita
    negotiating = Em Negociação
    won = Convertido (Ganho)
    lost = Perdido
    ```

#### Campo: assigned_to
- **Type**: `Many to One Relationship`
- **Field**: `assigned_to`
- **Related Collection**: `directus_users`
- **Display**:
  - Name: `Corretor Responsável`
  - Template: `{{first_name}} {{last_name}}`

#### Campo: tags
- **Type**: `JSON` (Tags)
- **Field**: `tags`
- **Interface**: `Tags`
- **Display**:
  - Name: `Tags/Etiquetas`

**Exemplo:** `["urgente", "investidor", "primeira-compra"]`

#### Campo: notes
- **Type**: `Text` (Textarea)
- **Field**: `notes`
- **Interface**: `Textarea (Rich Text WYSIWYG)`
- **Display**:
  - Name: `Observações`
  - Rows: `5`

### Passo 3: Display Template
- **Display Template**: `{{name}} - {{email}}`

---

## 📋 Collection 5: Lead Activities (Histórico)

### Passo 1: Criar a Collection
1. **Settings** → **Data Model** → **Create Collection**
2. Preencha:
   - **Collection Name**: `lead_activities`
   - **Type**: `Standard`
   - **Icon**: `event_note`
   - **Color**: `#EC4899` (rosa)
   - **Note**: `Histórico de atividades e interações com leads`
   - **Hidden**: `✓` (marcar)

### Passo 2: Criar os Campos

#### Campo: lead_id
- **Type**: `Many to One Relationship`
- **Field**: `lead_id`
- **Related Collection**: `leads`
- **Display**:
  - Name: `Lead`
  - Required: `✓`

#### Campo: activity_type
- **Type**: `String` (Dropdown)
- **Field**: `activity_type`
- **Interface**: `Select Dropdown`
- **Schema**: Required: `✓`
- **Display**:
  - Name: `Tipo de Atividade`
  - Choices:
    ```
    call = Ligação
    email = E-mail
    whatsapp = WhatsApp
    visit = Visita ao Imóvel
    meeting = Reunião
    note = Anotação
    ```

#### Campo: subject
- **Type**: `String` (Input)
- **Field**: `subject`
- **Schema**: Max Length: `255`
- **Display**:
  - Name: `Assunto`
  - Placeholder: `Ex: Primeira visita agendada`

#### Campo: description
- **Type**: `Text` (Textarea)
- **Field**: `description`
- **Display**:
  - Name: `Descrição Detalhada`

#### Campo: scheduled_at
- **Type**: `Timestamp` (Datetime)
- **Field**: `scheduled_at`
- **Display**:
  - Name: `Data/Hora Agendada`

#### Campo: completed_at
- **Type**: `Timestamp` (Datetime)
- **Field**: `completed_at`
- **Display**:
  - Name: `Data/Hora de Conclusão`

#### Campo: status
- **Type**: `String` (Dropdown)
- **Field**: `status`
- **Interface**: `Select Dropdown`
- **Schema**: Default Value: `pending`
- **Display**:
  - Name: `Status`
  - Choices:
    ```
    pending = Pendente
    completed = Concluído
    cancelled = Cancelado
    ```

### Passo 3: Configurar na Collection Leads
1. Volte em **leads**
2. Crie campo de relacionamento reverso:
   - **Field**: `activities`
   - **Type**: `One to Many Relationship`
   - **Related Collection**: `lead_activities`
   - **Foreign Key**: `lead_id`
   - **Interface**: `List (O2M)`
   - **Name**: `Histórico de Atividades`

---

## 📋 Collection 6: Property Views (Analytics)

### Passo 1: Criar a Collection
1. **Settings** → **Data Model** → **Create Collection**
2. Preencha:
   - **Collection Name**: `property_views`
   - **Type**: `Standard`
   - **Icon**: `visibility`
   - **Color**: `#6366F1` (índigo)
   - **Note**: `Rastreamento de visualizações de imóveis (Analytics)`
   - **Hidden**: `✓` (marcar)

### Passo 2: Criar os Campos

#### Campo: property_id
- **Type**: `Many to One Relationship`
- **Field**: `property_id`
- **Related Collection**: `properties`
- **Display**:
  - Name: `Imóvel Visualizado`
  - Required: `✓`

#### Campo: ip_address
- **Type**: `String` (Input)
- **Field**: `ip_address`
- **Schema**: Max Length: `45`
- **Display**:
  - Name: `Endereço IP`

#### Campo: user_agent
- **Type**: `Text` (Textarea)
- **Field**: `user_agent`
- **Display**:
  - Name: `User Agent (Navegador)`

#### Campo: referrer
- **Type**: `Text` (Textarea)
- **Field**: `referrer`
- **Display**:
  - Name: `Referrer (De onde veio)`

#### Campo: duration_seconds
- **Type**: `Integer` (Number)
- **Field**: `duration_seconds`
- **Display**:
  - Name: `Duração da Visita (segundos)`

---

## 🎉 Finalização

### Checklist de Verificação:
- [ ] Collection `companies` criada com todos os campos
- [ ] Collection `properties` criada com todos os campos
- [ ] Collection `property_media` criada com relacionamento
- [ ] Collection `leads` criada com todos os campos
- [ ] Collection `lead_activities` criada com relacionamento
- [ ] Collection `property_views` criada
- [ ] Relacionamentos configurados corretamente
- [ ] Display templates configurados
- [ ] Ícones e cores definidos

### Criar Dados de Exemplo:

#### 1. Criar primeira empresa (Imobiliária Exclusiva):
1. Vá em **Content** → **Companies**
2. Clique em **"Create Item"**
3. Preencha:
   - Name: `Imobiliária Exclusiva`
   - Slug: `exclusiva`
   - CNPJ: `12.345.678/0001-90`
   - Email: `contato@exclusiva.com.br`
   - Phone: `(31) 3333-4444`
   - Primary Color: `#2563EB`
   - Secondary Color: `#1E40AF`
   - Subscription Status: `active`
   - Subscription Plan: `standard`

#### 2. Criar imóveis de exemplo:
1. Vá em **Content** → **Properties**
2. Clique em **"Create Item"**
3. Exemplo 1:
   - Company: `Imobiliária Exclusiva`
   - Title: `Apartamento Luxo no Belvedere`
   - Property Type: `apartment`
   - Transaction Type: `sale`
   - Bedrooms: `4`
   - Bathrooms: `3`
   - Price Sale: `1850000.00`
   - Featured: `✓`

#### 3. Criar leads de exemplo:
1. Vá em **Content** → **Leads**
2. Exemplo:
   - Company: `Imobiliária Exclusiva`
   - Name: `João Silva`
   - Email: `joao.silva@email.com`
   - Phone: `(31) 98888-7777`
   - Interest Type: `buy`
   - Stage: `qualified`

---

## 🔐 Próximo Passo: Configurar Permissões

Após criar todas as collections, você precisa:
1. Criar roles (Imobiliária, Corretor)
2. Configurar permissões multi-tenant
3. Criar usuários

Veja o arquivo **COMO_USAR.md** para detalhes sobre permissões!

---

**Tempo estimado**: 60-90 minutos para criar todas as collections manualmente.
