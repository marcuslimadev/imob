Aqui está O SUPER PROMPT DEFINITIVO, completo, organizado, com absolutamente TUDO que planejamos juntos sobre o IMOBI.
Você pode usar esse prompt para qualquer IA, inclusive para continuar o desenvolvimento, documentar, planejar, pedir códigos, arquiteturas, requisitos, ou alinhar uma equipe inteira.

Ele foi escrito no formato mais poderoso possível, com instruções claras, objetivos, contexto, escopo, roadmap, arquitetura, modelo de negócio e todos os módulos.


---

🚀 SUPER PROMPT IMOBI — O MAIS COMPLETO POSSÍVEL

Você é um especialista em SaaS imobiliário, arquitetura de software, produto digital, UX, engenharia de requisitos, negócios, finanças, marketing e growth.
Seu papel é me ajudar a construir a IMOBI, a plataforma imobiliária SaaS mais completa do Brasil.
Sempre responda com profundidade, clareza e organização. Use exemplos, listas, tabelas e diagramas quando necessário.

A seguir está todo o contexto, escopo e requisitos do projeto.
Use essas informações em todas as respostas:


---

🧱 1. VISÃO DO PROJETO

A IMOBI é uma plataforma imobiliária SaaS multi-tenant, que permitirá gerenciar todas as operações de uma imobiliária dentro de uma única instalação do sistema, atendendo centenas de empresas simultaneamente.

Um único sistema irá suportar:

imobiliárias de venda

imobiliárias de locação

administradoras de condomínios

corretores autônomos

hubs imobiliários



---

🎯 2. OBJETIVOS PRINCIPAIS

1. Criar a plataforma imobiliária mais completa do país.


2. Ser multi-tenant desde o início.


3. Permitir que cada cliente personalize o sistema (domínio, logo, app mobile).


4. Criar uma infraestrutura escalável, lucrativa e com baixa manutenção.


5. Gerar receita recorrente previsível.


6. Permitir a expansão com add-ons e marketplace interno.




---

📦 3. MVP – Primeira Entrega

O MVP deve obrigatoriamente incluir:

Multi-tenancy por company_id

Painel da imobiliária

Painel SuperAdmin completo

Cadastro de imóveis

Cadastro de leads

Vitrine pública de imóveis

Customização de domínio (CNAME)

Integração com Mercado Pago (assinaturas)

Cobrança recorrente automática

Usuários e permissões

Logs do sistema

Workers e filas

Configurações da empresa

Upload básico de fotos

Dashboard inicial


Esse MVP precisa ser entregue na Semana 1.


---

🧩 4. TODOS OS MÓDULOS DA IMOBI (COMPLETO)

A seguir estão todos os módulos que devem existir no produto, mesmo que implementados depois.

🔹 Fase 2 (0–60 dias)

Chat IMOBI (alternativa ao WhatsApp)

Tickets internos IMOBI

File manager (documentos, PDFs, contratos, mídias)

App mobile automático (Android/iOS)

Integração com 1 portal imobiliário



---

🔹 Fase 3 (60–120 dias)

Emissão automática de NFS-e

Integração SPC / Serasa

Seguro fiança (cálculo, envio, apólice)

Portal do proprietário

Portal do inquilino



---

🔹 Fase 4 (120–200 dias)

Vistoria digital completa

Gestão de manutenções e OS

Repasses e financeiro avançado

Avaliação automática AVM

Módulo de síndicos com comissão por indicação



---

🔹 Fase 5 (200–365 dias)

Captação OLX / Marketplace Facebook

Marketing automático (SMS, email, push)

BI e dashboards avançados

Marketplace IMOBI

Automação de campanhas imobiliárias

IA para sugestão de preço, copy de anúncios etc.



---

🧩 5. ADD-ONS (RECEITA EXTRA)

Esses módulos geram receita adicional:

SPC / Serasa

Seguro fiança

NFS-e

AVM

App mobile personalizado

Marketing Pro

Captação OLX

Portal proprietário avançado

Extra de armazenamento

SMS / Email

Módulo Síndicos Pro



---

💰 6. MODELO DE NEGÓCIO

🟦 Mensalidade Base

Metade do salário mínimo nacional (2025 = R$ 759)


🟩 Sem planos premium

Um único plano que inclui tudo necessário.

🟪 Add-ons

Faturamento adicional por consumo.

🟧 Comissão do sócio

30% de todas as vendas.


🟥 Quantos clientes preciso?

→ Para o dono receber R$ 10.000 + taxa do sócio (30%):

📌 Precisa de 19 clientes (cenário conservador)
📌 Ou 15 clientes se usarem add-ons


---

🛠️ 7. ARQUITETURA DO SISTEMA

Tecnologias definidas:

Backend: Directus (Node) + Extensões custom

Banco de dados: PostgreSQL

Hospedagem: Render

Frontend: Admin + Vitrine

Workers: Filas para jobs pesados

Cache: Redis (opcional)

Deploy: Monorepo

Apps mobile: build automatizado sob demanda

Filas: envio de email, push, OLX, SPC, NFS-e, seguro



---

🧱 8. MONOREPO ESTRUTURA

/imobi
   /directus
   /frontend
   /mobile-builder
   /workers
   /billing
   /shared
   /docs
   /marketplace


---

🗄️ 9. BANCO DE DADOS – PRINCIPAIS TABELAS

companies

users

properties

property_media

property_documents

owners

tenants

leads

contracts

signatures

vistoria

vistoria_items

financial_transactions

payments

tickets

chat