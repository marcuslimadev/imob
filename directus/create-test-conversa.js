const fetch = require('node-fetch');

async function createTestConversa() {
  const token = 'admin-static-token-imobi-2025';
  const directusUrl = 'http://localhost:8055';

  try {
    // Buscar company
    const companyResp = await fetch(`${directusUrl}/items/companies?filter[domain][_eq]=lojadaesquina.store`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const companyData = await companyResp.json();
    console.log('Company:', JSON.stringify(companyData, null, 2));

    if (!companyData.data?.[0]) {
      console.error('Company não encontrada');
      return;
    }

    const companyId = companyData.data[0].id;

    // Criar lead primeiro
    const leadResp = await fetch(`${directusUrl}/items/leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        company_id: companyId,
        name: 'João Silva',
        phone: '+5511999999999',
        email: 'joao@example.com',
        source: 'whatsapp'
      })
    });
    const lead = await leadResp.json();
    console.log('Lead criado:', JSON.stringify(lead, null, 2));

    if (lead.data?.id) {
      // Criar conversa
      const convResp = await fetch(`${directusUrl}/items/conversas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_id: companyId,
          lead_id: lead.data.id,
          whatsapp_number: '+5511999999999',
          status: 'ativo',
          last_message: 'Olá, gostaria de informações sobre imóveis',
          last_message_at: new Date().toISOString()
        })
      });
      const conversa = await convResp.json();
      console.log('Conversa criada:', JSON.stringify(conversa, null, 2));

      if (conversa.data?.id) {
        // Criar algumas mensagens
        for (let i = 0; i < 3; i++) {
          const msgResp = await fetch(`${directusUrl}/items/mensagens`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              conversa_id: conversa.data.id,
              content: i === 0 ? 'Olá, gostaria de informações' : (i === 1 ? 'Tenho interesse em apartamentos' : 'Na região central'),
              direction: i % 2 === 0 ? 'inbound' : 'outbound',
              status: 'sent'
            })
          });
          const msg = await msgResp.json();
          console.log(`Mensagem ${i + 1} criada:`, msg.data?.id);
        }
      }
    }

  } catch (error) {
    console.error('Erro:', error);
  }
}

createTestConversa();
