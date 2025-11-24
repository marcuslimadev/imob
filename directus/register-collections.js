/**
 * Script para registrar as collections customizadas do IMOBI no Directus
 * Execute com: node register-collections.js
 */

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'marcus@admin.com';
const ADMIN_PASSWORD = 'Teste@123';

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
                meta: schema.meta,
                schema: schema.schema
            },
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        console.log(`✅ Collection '${collectionName}' criada/atualizada`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 403) {
            console.log(`ℹ️  Collection '${collectionName}' já existe`);
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
        },
        schema: {
            name: 'conversas'
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
        },
        schema: {
            name: 'mensagens'
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
        },
        schema: {
            name: 'lead_property_matches'
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
        },
        schema: {
            name: 'atividades'
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
        },
        schema: {
            name: 'webhooks_log'
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
        },
        schema: {
            name: 'app_settings'
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
