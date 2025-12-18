const fetch = require('node-fetch');

async function setupAdminCompany() {
  const token = 'admin-static-token-imobi-2025';
  const directusUrl = 'http://localhost:8055';

  try {
    // Login
    const loginResp = await fetch(`${directusUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'd1r3ctu5'
      })
    });
    const loginData = await loginResp.json();
    const accessToken = loginData.data.access_token;
    console.log('✓ Login realizado');

    // Buscar usuário atual
    const meResp = await fetch(`${directusUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const userData = await meResp.json();
    const userId = userData.data.id;
    console.log('✓ Usuário encontrado:', userId);

    // Verificar se já existe company
    const companiesResp = await fetch(`${directusUrl}/items/companies?filter[domain][_eq]=localhost`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const companiesData = await companiesResp.json();
    
    let companyId;
    if (companiesData.data && companiesData.data.length > 0) {
      companyId = companiesData.data[0].id;
      console.log('✓ Company já existe:', companyId);
    } else {
      // Criar company
      const createCompanyResp = await fetch(`${directusUrl}/items/companies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Imobiliária Local',
          domain: 'localhost',
          subdomain: 'localhost',
          status: 'active',
          theme_key: 'bauhaus'
        })
      });
      const companyData = await createCompanyResp.json();
      companyId = companyData.data.id;
      console.log('✓ Company criada:', companyId);
    }

    // Atualizar usuário com company_id
    const updateUserResp = await fetch(`${directusUrl}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        company_id: companyId
      })
    });
    const updatedUser = await updateUserResp.json();
    console.log('✓ Usuário atualizado com company_id');

    // Criar alguns leads de teste
    console.log('\n📝 Criando dados de teste...');
    
    // Criar 3 leads
    for (let i = 1; i <= 3; i++) {
      const leadResp = await fetch(`${directusUrl}/items/leads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_id: companyId,
          name: `Cliente Teste ${i}`,
          phone: `+5511999${i.toString().padStart(6, '0')}`,
          email: `cliente${i}@teste.com`,
          source: 'whatsapp',
          status: 'novo'
        })
      });
      const lead = await leadResp.json();
      console.log(`✓ Lead ${i} criado:`, lead.data.id);

      // Criar conversa para o lead
      const convResp = await fetch(`${directusUrl}/items/conversas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_id: companyId,
          lead_id: lead.data.id,
          whatsapp_number: `+5511999${i.toString().padStart(6, '0')}`,
          status: 'ativo',
          last_message: `Olá, sou o Cliente ${i}. Gostaria de informações sobre imóveis.`,
          last_message_at: new Date().toISOString()
        })
      });
      const conversa = await convResp.json();
      console.log(`✓ Conversa ${i} criada:`, conversa.data.id);

      // Criar mensagens para a conversa
      const mensagens = [
        { content: `Olá, sou o Cliente ${i}`, direction: 'inbound' },
        { content: 'Olá! Como posso ajudar?', direction: 'outbound' },
        { content: 'Gostaria de ver apartamentos na região central', direction: 'inbound' },
        { content: 'Claro! Temos várias opções. Qual o seu orçamento?', direction: 'outbound' },
      ];

      for (const msg of mensagens) {
        await fetch(`${directusUrl}/items/mensagens`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conversa_id: conversa.data.id,
            content: msg.content,
            direction: msg.direction,
            status: 'sent',
            date_created: new Date().toISOString()
          })
        });
      }
      console.log(`✓ 4 mensagens criadas para conversa ${i}`);
    }

    console.log('\n✅ Setup completo!');
    console.log(`Company ID: ${companyId}`);
    console.log(`User ID: ${userId}`);
    console.log('\nAgora você pode fazer login com:');
    console.log('Email: admin@example.com');
    console.log('Password: d1r3ctu5');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

setupAdminCompany();
