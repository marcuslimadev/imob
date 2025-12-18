/**
 * Script para criar conversas e mensagens de teste
 * Uso: node seed-conversas.js
 */

import { createDirectus, rest, staticToken, createItem, readItems } from '@directus/sdk';

const ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || 'admin-static-token-imobi-2025';

const client = createDirectus('https://lojadaesquina.store')
    .with(staticToken(ADMIN_TOKEN))
    .with(rest());

async function seedConversas() {
    try {
        console.log('🔐 Usando token de acesso...');

        // Buscar empresa existente
        console.log('\n📝 Buscando empresa...');
        const companies = await client.request(readItems('companies', { limit: 1 }));

        if (!companies || companies.length === 0) {
            console.error('❌ Nenhuma empresa encontrada. Execute seed-data.js primeiro.');
            return;
        }

        const company = companies[0];
        console.log(`✅ Empresa encontrada: ${company.name} (ID: ${company.id})`);

        // Buscar ou criar lead de teste
        console.log('\n📝 Buscando/criando lead de teste...');
        let leads = await client.request(
            readItems('leads', {
                filter: { company_id: { _eq: company.id } },
                limit: 1
            })
        );

        let lead;
        if (!leads || leads.length === 0) {
            console.log('Criando lead de teste...');
            lead = await client.request(
                createItem('leads', {
                    company_id: company.id,
                    name: 'João Silva',
                    email: 'joao.silva@example.com',
                    phone: '31999887766',
                    status: 'active',
                    stage: 'lead'
                })
            );
            console.log(`✅ Lead criado: ${lead.name} (ID: ${lead.id})`);
        } else {
            lead = leads[0];
            console.log(`✅ Lead encontrado: ${lead.name} (ID: ${lead.id})`);
        }

        // Criar conversas de teste
        console.log('\n💬 Criando conversas de teste...');

        const conversa1 = await client.request(
            createItem('conversas', {
                company_id: company.id,
                lead_id: lead.id,
                whatsapp_number: '+5531999887766',
                status: 'active',
                last_message: 'Olá! Gostaria de saber mais sobre os imóveis disponíveis.',
                last_message_at: new Date().toISOString(),
                unread_count: 2
            })
        );
        console.log(`✅ Conversa 1 criada (ID: ${conversa1.id})`);

        const conversa2 = await client.request(
            createItem('conversas', {
                company_id: company.id,
                whatsapp_number: '+5531988776655',
                status: 'active',
                last_message: 'Bom dia! Tenho interesse em alugar um apartamento.',
                last_message_at: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
                unread_count: 0
            })
        );
        console.log(`✅ Conversa 2 criada (ID: ${conversa2.id})`);

        // Criar mensagens para conversa 1
        console.log('\n📨 Criando mensagens de teste...');

        await client.request(
            createItem('mensagens', {
                conversa_id: conversa1.id,
                content: 'Olá! Gostaria de saber mais sobre os imóveis disponíveis.',
                direction: 'inbound',
                status: 'delivered',
                date_created: new Date(Date.now() - 600000).toISOString() // 10 min atrás
            })
        );

        await client.request(
            createItem('mensagens', {
                conversa_id: conversa1.id,
                content: 'Olá João! Temos várias opções disponíveis. Você procura para compra ou aluguel?',
                direction: 'outbound',
                status: 'read',
                date_created: new Date(Date.now() - 540000).toISOString() // 9 min atrás
            })
        );

        await client.request(
            createItem('mensagens', {
                conversa_id: conversa1.id,
                content: 'Estou procurando para compra, um apartamento de 2 quartos.',
                direction: 'inbound',
                status: 'delivered',
                date_created: new Date(Date.now() - 300000).toISOString() // 5 min atrás
            })
        );

        // Criar mensagens para conversa 2
        await client.request(
            createItem('mensagens', {
                conversa_id: conversa2.id,
                content: 'Bom dia! Tenho interesse em alugar um apartamento.',
                direction: 'inbound',
                status: 'delivered',
                date_created: new Date(Date.now() - 3600000).toISOString() // 1 hora atrás
            })
        );

        await client.request(
            createItem('mensagens', {
                conversa_id: conversa2.id,
                content: 'Bom dia! Qual região você prefere?',
                direction: 'outbound',
                status: 'delivered',
                date_created: new Date(Date.now() - 3540000).toISOString() // 59 min atrás
            })
        );

        console.log('✅ Mensagens criadas');

        console.log('\n🎉 Dados de teste criados com sucesso!');
        console.log('\n📋 Recursos criados:');
        console.log(`- 2 conversas`);
        console.log(`- 5 mensagens`);
        console.log(`\n📝 Próximos passos:`);
        console.log('1. Acesse https://lojadaesquina.store/empresa/conversas');
        console.log('2. Faça login com suas credenciais');
        console.log('3. Verifique se as conversas aparecem');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        if (error.errors) {
            console.error('Detalhes:', error.errors);
        }
    }
}

seedConversas();
