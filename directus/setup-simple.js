#!/usr/bin/env node

/**
 * Setup Collections via Directus Admin Token
 * Usa variáveis de ambiente do próprio Directus
 */

const http = require('http');

const DIRECTUS_URL = process.env.PUBLIC_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'marcus@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Teste@123';

// Helper para fazer requests HTTP
function request(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, DIRECTUS_URL);
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function main() {
    console.log('🚀 Setup iMOBI - Criando Collections...\n');

    // 1. Login
    console.log('🔐 Fazendo login...');
    const loginRes = await request('POST', '/auth/login', {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
    });

    if (!loginRes.data?.access_token) {
        console.error('❌ Erro no login:', loginRes);
        process.exit(1);
    }

    const token = loginRes.data.access_token;
    console.log('✅ Login realizado!\n');

    // 2. Criar Collections
    const collections = [
        { collection: 'companies', meta: { collection: 'companies', icon: 'business', note: 'Empresas (Tenants)' } },
        { collection: 'properties', meta: { collection: 'properties', icon: 'home', note: 'Imóveis' } },
        { collection: 'property_media', meta: { collection: 'property_media', icon: 'photo_library', note: 'Fotos/Vídeos' } },
        { collection: 'leads', meta: { collection: 'leads', icon: 'person', note: 'Leads/Clientes' } },
        { collection: 'conversas', meta: { collection: 'conversas', icon: 'chat', note: 'Conversas WhatsApp' } },
        { collection: 'mensagens', meta: { collection: 'mensagens', icon: 'message', note: 'Mensagens' } },
        { collection: 'vistorias', meta: { collection: 'vistorias', icon: 'fact_check', note: 'Vistorias' } },
        { collection: 'app_settings', meta: { collection: 'app_settings', icon: 'settings', note: 'Configurações' } },
    ];

    console.log('📦 Criando collections...\n');

    for (const coll of collections) {
        try {
            await request('POST', '/collections', coll, token);
            console.log(`  ✅ ${coll.collection}`);
        } catch (err) {
            console.log(`  ℹ️  ${coll.collection} (já existe)`);
        }
    }

    console.log('\n✅ Setup concluído!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Acesse http://localhost:8055/admin');
    console.log('   2. Configure campos nas collections');
    console.log('   3. Ajuste permissões\n');
}

main().catch(err => {
    console.error('❌ Erro:', err.message);
    process.exit(1);
});
