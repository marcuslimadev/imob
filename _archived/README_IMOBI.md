# 🏢 IMOBI - Plataforma SaaS Imobiliária Multi-Tenant

A plataforma imobiliária SaaS mais completa do Brasil, desenvolvida para atender imobiliárias de venda, locação, administradoras de condomínios, corretores autônomos e hubs imobiliários.

## 🎯 Visão Geral

A IMOBI é uma plataforma multi-tenant que permite gerenciar todas as operações de uma imobiliária dentro de uma única instalação do sistema, atendendo centenas de empresas simultaneamente.

### Características Principais

- ✅ **Multi-tenant** desde o início
- ✅ **Personalização completa** (domínio, logo, app mobile)
- ✅ **Infraestrutura escalável** e lucrativa
- ✅ **Receita recorrente** previsível
- ✅ **Add-ons e marketplace** interno

## 🛠️ Stack Tecnológica

- **Backend:** Directus (Node.js) + Extensões customizadas
- **Banco de Dados:** PostgreSQL
- **Frontend:** Next.js (App Router)
- **Hospedagem:** Render
- **Cache:** Redis (opcional)
- **Workers:** Filas para jobs pesados

## 📦 Estrutura do Projeto

```
/imobi
├── /directus          # Backend Directus + Extensões
├── /nextjs            # Frontend Next.js
├── /workers           # Processamento de filas
├── /billing           # Sistema de cobrança
├── /shared            # Código compartilhado
└── /docs              # Documentação
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- pnpm (recomendado)

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd imobi
```

2. Configure o ambiente do Directus:
```bash
cd directus
cp .env.example .env
# Edite o .env com suas configurações
```

3. Inicie os serviços com Docker:
```bash
docker compose up -d
```

4. Configure o frontend Next.js:
```bash
cd ../nextjs
pnpm install
cp .env.example .env.local
# Configure as variáveis de ambiente
```

5. Inicie o servidor de desenvolvimento:
```bash
pnpm dev
```

### Acesso

- **Directus Admin:** http://localhost:8055
  - Email: `marcus@admin.com`
  - Senha: `Teste@123`
- **Frontend Next.js:** http://localhost:3000

## 📋 MVP - Primeira Entrega

O MVP inclui:

- [x] Multi-tenancy por company_id
- [x] Painel da imobiliária
- [x] Painel SuperAdmin completo
- [x] Cadastro de imóveis
- [x] Cadastro de leads
- [x] Vitrine pública de imóveis
- [ ] Escolha entre 20 templates prontos para o site de vendas/aluguel
- [x] Customização de domínio (CNAME)
- [ ] Integração com Mercado Pago (assinaturas)
- [ ] Cobrança recorrente automática
- [x] Usuários e permissões
- [x] Logs do sistema
- [ ] Workers e filas
- [x] Configurações da empresa
- [x] Upload básico de fotos
- [x] Dashboard inicial

## 💰 Modelo de Negócio

- **Mensalidade Base:** R$ 759,00 (metade do salário mínimo)
- **Plano Único:** Inclui todos os recursos essenciais
- **Add-ons:** Receita adicional por consumo
  - SPC / Serasa
  - Seguro fiança
  - NFS-e
  - AVM (Avaliação automática)
  - App mobile personalizado
  - Marketing Pro
  - Portal do proprietário avançado

## 📅 Roadmap

### Fase 1 - MVP (0-30 dias)
- Sistema base multi-tenant
- Gestão de imóveis e leads
- Vitrine pública
- Painel administrativo

### Fase 2 (30-60 dias)
- Chat IMOBI
- Tickets internos
- File manager
- App mobile automático
- Integração com portal imobiliário

### Fase 3 (60-120 dias)
- Emissão automática de NFS-e
- Integração SPC / Serasa
- Seguro fiança
- Portal do proprietário
- Portal do inquilino

### Fase 4 (120-200 dias)
- Vistoria digital completa
- Gestão de manutenções e OS
- Repasses e financeiro avançado
- Avaliação automática AVM
- Módulo de síndicos

### Fase 5 (200-365 dias)
- Captação OLX / Marketplace Facebook
- Marketing automático
- BI e dashboards avançados
- Marketplace IMOBI
- IA para sugestão de preço

## 📄 Licença

Todos os direitos reservados.

## 👥 Contribuindo

Este é um projeto privado. Para contribuir, entre em contato com a equipe de desenvolvimento.

---

**IMOBI** - A plataforma imobiliária que cresce com você 🚀
