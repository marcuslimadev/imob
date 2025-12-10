# 🚀 Como Executar os Scripts do Directus

## Situação Atual

Os scripts de configuração do Directus (`register-collections.js`, `register-fields.js`, etc.) precisam ser executados, mas **não precisam de Node.js instalado localmente** - eles rodam via Docker.

## ✅ Solução: Executar via NPM no Container

### Passo 1: Garantir que o Docker está rodando

```powershell
cd d:\IMob\directus
docker compose ps
```

Se não estiver rodando:
```powershell
docker compose up -d
```

### Passo 2: Copiar scripts para dentro do container

```powershell
# Copiar register-collections.js
docker cp register-collections.js directus-cms-template-directus-1:/tmp/

# Copiar register-fields.js  
docker cp register-fields.js directus-cms-template-directus-1:/tmp/

# Copiar setup-role-permissions.js
docker cp setup-role-permissions.js directus-cms-template-directus-1:/tmp/
```

### Passo 3: Executar os scripts dentro do container

```powershell
# 1. Criar collections (incluindo pessoa_contatos)
docker exec -it directus-cms-template-directus-1 node /tmp/register-collections.js

# 2. Criar fields (incluindo edificio_condominio e fields de pessoa_contatos)
docker exec -it directus-cms-template-directus-1 node /tmp/register-fields.js

# 3. Aplicar permissões multi-tenant
docker exec -it directus-cms-template-directus-1 node /tmp/setup-role-permissions.js
```

## ✅ Alternativa Mais Simples: Via Interface do Directus

Se preferir, você pode criar manualmente via interface web:

### 1. Acessar Directus Admin
http://localhost:8055/admin
- Login: marcus@admin.com
- Senha: Teste@123

### 2. Criar Collection `pessoa_contatos`

**Settings → Data Model → Create Collection**

- **Collection Name:** pessoa_contatos
- **Icon:** contact_phone
- **Note:** Múltiplos contatos por pessoa/lead

**Adicionar Fields:**
1. **lead_id** (Many to One → leads)
2. **tipo** (Dropdown: celular, fixo, whatsapp, email, outro)
3. **contato** (Input - required)
4. **descricao** (Input)
5. **principal** (Boolean)

### 3. Adicionar campo em properties

**Data Model → properties → Create Field**

- **Field:** edificio_condominio
- **Type:** String
- **Interface:** Input
- **Width:** Half
- **Note:** Nome do edifício ou condomínio

### 4. Adicionar campo em companies

**Data Model → companies → Create Field**

- **Field:** storefront_template_id
- **Type:** Integer
- **Interface:** Dropdown
- **Choices:** 1 a 20
- **Note:** Template da vitrine pública

## 📊 Verificar se funcionou

Após executar os scripts ou criar manualmente:

1. Acesse http://localhost:8055/admin
2. No menu lateral, você deve ver "Pessoa Contatos"
3. Em Properties, ao editar um imóvel, deve aparecer o campo "Edifício/Condomínio"
4. Em Companies, deve aparecer o campo "Storefront Template ID"

## ⚠️ Observação sobre Node.js

Você estava **100% correto**: não precisa instalar Node.js localmente. Tudo roda dentro do Docker. Os comandos acima copiam os scripts para dentro do container e executam lá.
