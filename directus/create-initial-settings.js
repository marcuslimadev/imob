require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'marcus@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Teste@123';

async function createInitialSettings() {
  try {
    console.log('🔐 Fazendo login...');
    
    const loginResponse = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.data.access_token;
    console.log('✅ Login realizado!');

    // Buscar a primeira empresa (exclusiva)
    console.log('🏢 Buscando empresa...');
    const companiesResponse = await fetch(`${DIRECTUS_URL}/items/companies?limit=1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const companiesData = await companiesResponse.json();
    
    if (!companiesData.data || companiesData.data.length === 0) {
      console.error('❌ Nenhuma empresa encontrada! Execute seed-data.js primeiro.');
      return;
    }

    const company = companiesData.data[0];
    console.log(`✅ Empresa encontrada: ${company.name} (${company.id})`);

    // Verificar se já existe app_settings para essa empresa
    const existingResponse = await fetch(
      `${DIRECTUS_URL}/items/app_settings?filter[company_id][_eq]=${company.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const existingData = await existingResponse.json();

    if (existingData.data && existingData.data.length > 0) {
      console.log('⚠️  Configurações já existem para esta empresa. Atualizando...');
      
      const updateResponse = await fetch(
        `${DIRECTUS_URL}/items/app_settings/${existingData.data[0].id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            chavesnamao_token: 'd825c542e26df27c9fe696c391ee590f',
            xml_url: `http://localhost:4000/api/xml/imoveis`,
            updated_at: new Date().toISOString()
          })
        }
      );

      if (updateResponse.ok) {
        console.log('✅ Configurações atualizadas com sucesso!');
      } else {
        console.error('❌ Erro ao atualizar:', await updateResponse.text());
      }
      return;
    }

    // Criar novo app_settings
    console.log('📝 Criando configurações iniciais...');
    const createResponse = await fetch(`${DIRECTUS_URL}/items/app_settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        company_id: company.id,
        external_api_url: 'https://www.exclusivaimobiliaria.com.br',
        external_api_token: '$2y$10$Lcn1ct...',
        imobibrasil_url: 'https://www.exclusivaimobiliaria.com.br',
        imobibrasil_token: '$2y$10$Lcn1ct...',
        chavesnamao_token: 'd825c542e26df27c9fe696c391ee590f',
        xml_url: `http://localhost:4000/api/xml/imoveis`,
        twilio_account_sid: '',
        twilio_auth_token: '',
        twilio_whatsapp_number: '',
        openai_api_key: '',
        openai_model: 'gpt-4o-mini',
        clicksign_access_token: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ Erro ao criar settings:', errorText);
      return;
    }

    const createdSettings = await createResponse.json();
    console.log('✅ Configurações criadas com sucesso!');
    console.log('📊 ID:', createdSettings.data.id);
    console.log('🔑 Token Chaves na Mão:', createdSettings.data.chavesnamao_token);
    console.log('🌐 URL XML:', createdSettings.data.xml_url);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

createInitialSettings();
