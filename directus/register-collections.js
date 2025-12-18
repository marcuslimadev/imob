/**
 * Script para registrar as collections customizadas do IMOBI no Directus
 * Execute com: node register-collections.js
 */

const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'd1r3ctu5';

let accessToken = '';

// Fazer login
async function login() {
    try {
        const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        accessToken = response.data.data.access_token;
        console.log('✅ Login realizado com sucesso!');
        return accessToken;
    } catch (error) {
        console.error('❌ Erro no login:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Criar collection no Directus
async function createCollection(collectionName, schema) {
    try {
        const response = await axios.post(
            `${DIRECTUS_URL}/collections`,
            {
                collection: collectionName,
                meta: schema.meta
            },
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        console.log(`✅ Collection '${collectionName}' registrada no Directus`);
        return response.data;
    } catch (error) {
        if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
            console.log(`ℹ️  Collection '${collectionName}' já existe, atualizando metadata...`);
            // Tentar atualizar a metadata
            try {
                await axios.patch(
                    `${DIRECTUS_URL}/collections/${collectionName}`,
                    { meta: schema.meta },
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                console.log(`✅ Metadata da collection '${collectionName}' atualizada`);
            } catch (updateError) {
                console.error(`❌ Erro ao atualizar metadata:`, updateError.response?.data || updateError.message);
            }
        } else {
            console.error(`❌ Erro ao criar collection '${collectionName}':`, error.response?.data || error.message);
        }
    }
}

// Criar fields para uma collection
async function createFields(collectionName, fields) {
    for (const field of fields) {
        try {
            await axios.post(
                `${DIRECTUS_URL}/fields/${collectionName}`,
                field,
                {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
            );
            console.log(`  ✅ Field '${field.field}' criado em '${collectionName}'`);
        } catch (error) {
            if (error.response?.status === 403) {
                console.log(`  ℹ️  Field '${field.field}' já existe`);
            } else {
                console.error(`  ❌ Erro ao criar field '${field.field}':`, error.response?.data?.errors?.[0]?.message || error.message);
            }
        }
    }
}

// Definições das collections
const collections = {
    companies: {
        meta: {
            collection: 'companies',
            icon: 'business',
            note: 'Empresas imobiliárias (Multi-tenant)',
            display_template: '{{nome_fantasia}} - {{slug}}',
            hidden: false,
            singleton: false,
            accountability: 'all',
            color: '#3B82F6',
            sort: 1
        }
    },
    properties: {
        meta: {
            collection: 'properties',
            icon: 'home',
            note: 'Imóveis cadastrados',
            display_template: '{{tipo}} - {{cidade}}/{{estado}}',
            hidden: false,
            singleton: false,
            accountability: 'all',
            color: '#10B981',
            sort: 2
        }
    },
    property_media: {
        meta: {
            collection: 'property_media',
            icon: 'photo_library',
            note: 'Fotos e vídeos dos imóveis',
            display_template: '{{tipo}}: {{url}}',
            hidden: true,
            singleton: false,
            sort: 3
        }
    },
    leads: {
        meta: {
            collection: 'leads',
            icon: 'person',
            note: 'Leads e clientes',
            display_template: '{{nome}} - {{telefone}}',
            hidden: false,
            singleton: false,
            accountability: 'all',
            color: '#F59E0B',
            sort: 4
        }
    },
    lead_activities: {
        meta: {
            collection: 'lead_activities',
            icon: 'event_note',
            note: 'Atividades e interações com leads',
            display_template: '{{tipo}}: {{descricao}}',
            hidden: true,
            singleton: false,
            sort: 5
        }
    },
    property_views: {
        meta: {
            collection: 'property_views',
            icon: 'visibility',
            note: 'Visualizações de imóveis',
            display_template: 'Lead {{lead_id}} viu {{property_id}}',
            hidden: true,
            singleton: false,
            sort: 6
        }
    },
    conversas: {
        meta: {
            collection: 'conversas',
            icon: 'chat',
            note: 'Conversas WhatsApp com leads',
            display_template: '{{whatsapp_name}} - {{telefone}}',
            hidden: false,
            singleton: false,
            accountability: 'all',
            color: '#8B5CF6',
            sort: 7
        }
    },
    mensagens: {
        meta: {
            collection: 'mensagens',
            icon: 'message',
            note: 'Mensagens individuais do WhatsApp',
            display_template: '{{direction}}: {{content}}',
            hidden: true,
            singleton: false,
            sort: 8
        }
    },
    lead_property_matches: {
        meta: {
            collection: 'lead_property_matches',
            icon: 'link',
            note: 'Matches automáticos entre leads e imóveis (IA)',
            display_template: 'Score: {{match_score}}%',
            hidden: false,
            singleton: false,
            accountability: 'all',
            color: '#EC4899',
            sort: 9
        }
    },
    atividades: {
        meta: {
            collection: 'atividades',
            icon: 'history',
            note: 'Log de atividades do sistema',
            display_template: '{{tipo}}: {{descricao}}',
            hidden: false,
            singleton: false,
            accountability: 'all',
            color: '#6366F1',
            sort: 10
        }
    },
    webhooks_log: {
        meta: {
            collection: 'webhooks_log',
            icon: 'webhook',
            note: 'Log de webhooks recebidos (Twilio, Asaas, ClickSign)',
            display_template: '{{service}}: {{event_type}}',
            hidden: false,
            singleton: false,
            accountability: 'all',
            color: '#14B8A6',
            sort: 11
        }
    },
    app_settings: {
        meta: {
            collection: 'app_settings',
            icon: 'settings',
            note: 'Configurações personalizadas por empresa',
            display_template: '{{chave}}: {{valor}}',
            hidden: false,
            singleton: false,
            accountability: 'all',
            color: '#64748B',
            sort: 12
        }
    },
    logs: {
        meta: {
            collection: 'logs',
            icon: 'bug_report',
            note: 'System logs',
            display_template: '{{timestamp}} - {{level}} - {{message}}',
            hidden: false,
            singleton: false,
            accountability: 'all',
            color: '#EF4444',
            sort: 99
        }
    },
    job_status: {
        meta: {
            collection: 'job_status',
            icon: 'pending_actions',
            note: 'Background job status tracking',
            display_template: '{{job_id}} - {{status}}',
            hidden: false,
            singleton: false,
            accountability: 'all',
            color: '#F59E0B',
            sort: 100
        }
    },
    contratos: {
        meta: {
            collection: 'contratos',
            icon: 'description',
            note: 'Contratos de locação e venda',
            display_template: '{{tipo}} - {{imovel_id}}',
            hidden: false,
            singleton: false,
            accountability: 'all',
            color: '#0EA5E9',
            sort: 13
        }
    },
    subscription_plans: {
        meta: {
            collection: 'subscription_plans',
            icon: 'credit_card',
            note: 'Planos de assinatura SaaS',
            display_template: '{{name}} - R$ {{price}}',
            hidden: false,
            singleton: false,
            accountability: 'all',
            color: '#06B6D4',
            sort: 97
        }
    },
    tenant_subscriptions: {
        meta: {
            collection: 'tenant_subscriptions',
            icon: 'receipt',
            note: 'Assinaturas dos tenants',
            display_template: '{{company_id}} - {{status}}',
            hidden: false,
            singleton: false,
            accountability: 'all',
            color: '#0891B2',
            sort: 98
        }
    },
    vistorias: {
        meta: {
            collection: 'vistorias',
            icon: 'fact_check',
            note: 'Vistorias de entrada/saída',
            display_template: '{{tipo}} - {{imovel_id}}',
            hidden: false,
            singleton: false,
            accountability: 'all',
            color: '#A855F7',
            sort: 14
        }
    },
    vistoria_itens: {
        meta: {
            collection: 'vistoria_itens',
            icon: 'checklist',
            note: 'Itens verificados na vistoria',
            display_template: '{{comodo}} - {{item}}',
            hidden: true,
            singleton: false,
            sort: 15
        }
    },
    documentos_assinatura: {
        meta: {
            collection: 'documentos_assinatura',
            icon: 'draw',
            note: 'Documentos para assinatura eletrônica',
            display_template: '{{assunto}} - {{status}}',
            hidden: false,
            singleton: false,
            accountability: 'all',
            color: '#D946EF',
            sort: 16
        }
    },
    documentos_signatarios: {
        meta: {
            collection: 'documentos_signatarios',
            icon: 'person_add',
            note: 'Signatários dos documentos',
            display_template: '{{nome}} - {{status}}',
            hidden: true,
            singleton: false,
            sort: 17
        }
    }
};

async function main() {
    console.log('🚀 Iniciando registro das collections do IMOBI...\n');
    
    await login();
    
    // Criar/atualizar collections
    for (const [name, config] of Object.entries(collections)) {
        await createCollection(name, config);
    }
    
    console.log('\n✅ Processo concluído!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Acesse http://localhost:8055');
    console.log('2. Faça login com marcus@admin.com / Teste@123');
    console.log('3. Vá em Settings → Data Model');
    console.log('4. Configure as permissões para cada role');
    console.log('5. As collections já devem aparecer no menu lateral!');
}

main().catch(console.error);
