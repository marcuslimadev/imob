# IMOBI - CRM Multi-tenant para Imobiliárias

Sistema SaaS completo para gestão de imobiliárias com WhatsApp, IA e automação.

## 🏗️ Arquitetura Atual

**TUDO roda no Directus (porta 8055) - Sem Next.js separado!**

```
┌─────────────────────────────────────────┐
│      Directus (localhost:8055)          │
├─────────────────────────────────────────┤
│ ✅ Admin Nativo (/admin)                │
│ ✅ Módulo CRM Customizado (/crm)        │
│ ✅ 12 Collections (multi-tenant)        │
│ ✅ API REST completa                    │
│ ✅ PostgreSQL + PostGIS + Redis         │
└─────────────────────────────────────────┘
```

## 🚀 Como Usar

### 1. Iniciar o sistema

```powershell
cd directus
docker compose up -d
```

### 2. Acessar

- **URL**: http://localhost:8055
- **Login**: marcus@admin.com
- **Senha**: Teste@123

### 3. Usar o CRM

1. Clique no menu **"CRM"** (ícone 🏢)
2. Selecione a empresa no dropdown superior
3. Navegue entre:
   - **Dashboard**: Estatísticas + Funil de vendas
   - **Conversas**: Chat WhatsApp (em desenvolvimento)
   - **Leads**: Kanban drag-and-drop (em desenvolvimento)
   - **Imóveis**: Gerenciamento de propriedades (em desenvolvimento)

## Local Setup (with CLI)

Run this in your terminal:

```bash
npx directus-template-cli@latest init
```
