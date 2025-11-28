# Mapeamento de Dados: Exclusiva (Lumen) -> iMOBI (Directus)

Este documento registra o mapeamento entre as tabelas do sistema legado e as novas collections do Directus.

## 1. Companies (Multi-tenancy)
| Lumen (Table: companies) | Directus (Collection: companies) | Tipo | Notas |
| ------------------------ | -------------------------------- | ---- | ----- |
| id                       | id                               | uuid | Primary Key |
| name                     | name                             | string | |
| email                    | email                            | string | |
| phone                    | phone                            | string | |
| document                 | document                         | string | CNPJ/CPF |
| plan                     | plan                             | string | Enum: free, pro, enterprise |
| status                   | status                           | string | Enum: active, inactive |
| settings                 | settings                         | json | Configurações de whitelabel, cores, etc. |

## 2. Properties (Imóveis)
| Lumen (Table: imo_properties) | Directus (Collection: properties) | Tipo | Notas |
| ----------------------------- | --------------------------------- | ---- | ----- |
| id                            | id                                | uuid | Primary Key |
| company_id                    | company                           | M2O  | Relacionamento com companies |
| code                          | code                              | string | Código de referência |
| title                         | title                             | string | |
| description                   | description                       | text | |
| type                          | type                              | string | Enum: apartment, house, land, commercial |
| status                        | status                            | string | Enum: active, sold, rented, inactive |
| price                         | price                             | decimal | Valor de venda |
| price_rent                    | price_rent                        | decimal | Valor de locação |
| bedrooms                      | bedrooms                          | integer | |
| bathrooms                     | bathrooms                         | integer | |
| suites                        | suites                            | integer | |
| parking                       | parking                           | integer | Vagas |
| area_total                    | area_total                        | float | |
| area_private                  | area_private                      | float | |
| address_zip                   | address_zip                       | string | CEP |
| address_street                | address_street                    | string | |
| address_number                | address_number                    | string | |
| address_neighborhood          | address_neighborhood              | string | Bairro |
| address_city                  | address_city                      | string | |
| address_state                 | address_state                     | string | |
| features                      | features                          | json | Lista de características (piscina, churrasqueira...) |
| created_at                    | date_created                      | timestamp | |
| updated_at                    | date_updated                      | timestamp | |

## 3. Leads
| Lumen (Table: leads) | Directus (Collection: leads) | Tipo | Notas |
| -------------------- | ---------------------------- | ---- | ----- |
| id                   | id                           | uuid | Primary Key |
| company_id           | company                      | M2O  | Relacionamento com companies |
| name                 | name                         | string | |
| email                | email                        | string | |
| phone                | phone                        | string | |
| origin               | origin                       | string | Enum: site, whatsapp, portal, indication |
| status               | status                       | string | Enum: new, in_progress, visit, proposal, closed, lost |
| notes                | notes                        | text | |
| assigned_to          | assigned_to                  | M2O  | Relacionamento com directus_users |
| last_activity        | last_activity                | timestamp | |

## 4. Matches (Recomendações)
| Lumen (Table: matches) | Directus (Collection: lead_matches) | Tipo | Notas |
| ---------------------- | ----------------------------------- | ---- | ----- |
| id                     | id                                  | uuid | Primary Key |
| lead_id                | lead                                | M2O  | Relacionamento com leads |
| property_id            | property                            | M2O  | Relacionamento com properties |
| score                  | score                               | integer | 0-100 |
| reasons                | reasons                             | json | Motivos do match (IA) |
| created_at             | date_created                        | timestamp | |

## 5. Attachments (Fotos/Arquivos)
| Lumen (Table: attachments) | Directus (Collection: directus_files) | Tipo | Notas |
| -------------------------- | ------------------------------------- | ---- | ----- |
| id                         | id                                    | uuid | Usar ID original se possível ou mapear |
| path/url                   | filename_disk                         | string | Arquivo físico |
| property_id                | folder                                | uuid | Organizar em pastas por imóvel? Ou usar campo custom |

*Nota: Para properties, usar um campo O2M `gallery` apontando para `directus_files` ou uma tabela intermediária `property_files` se precisar de ordem/metadados extras.*
