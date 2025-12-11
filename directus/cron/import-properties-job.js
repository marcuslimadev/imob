/**
 * Cron Job - Importação Automática de Imóveis
 * Roda de 4 em 4 horas para sincronizar com API externa
 * 
 * Uso: node directus/cron/import-properties-job.js
 * ou adicione ao crontab: 0 HORA * * * cd /path/to/project && node directus/cron/import-properties-job.js
 */

// Configurações
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'marcus@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Teste@123';
const COMPANY_ID = process.env.COMPANY_ID || 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';

// Logger
function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data);
}

// Função de importação
async function runImport() {
  const startTime = Date.now();
  log('info', '🚀 Iniciando importação automática de imóveis...');

  try {
    // 1. Login no Directus
    log('info', 'Fazendo login no Directus...');
    const loginResponse = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error('Falha no login do Directus');
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.access_token;
    log('info', '✅ Login realizado com sucesso');

    // 2. Buscar configurações da empresa
    log('info', `Buscando configurações da empresa ${COMPANY_ID}...`);
    const settingsResponse = await fetch(
      `${DIRECTUS_URL}/items/app_settings?filter[company_id][_eq]=${COMPANY_ID}&limit=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const settingsData = await settingsResponse.json();
    const settings = settingsData.data?.[0];

    if (!settings?.external_api_url || !settings?.external_api_token) {
      throw new Error('Configurações da API externa não encontradas');
    }

    log('info', `API Externa: ${settings.external_api_url}`);

    // 3. Buscar lista de imóveis
    log('info', 'Buscando lista de imóveis da API externa...');
    const listUrl = 'https://www.exclusivalarimoveis.com.br/api/v1/app/imovel/lista';
    const listResponse = await fetch(listUrl, {
      headers: { token: settings.external_api_token },
    });

    if (!listResponse.ok) {
      throw new Error(`API externa retornou erro: ${listResponse.status}`);
    }

    const listData = await listResponse.json();
    const properties = listData.resultSet?.data || [];
    log('info', `✅ Encontrados ${properties.length} imóveis`);

    let imported = 0;
    let updated = 0;
    let errors = 0;
    let imagesImported = 0;

    // 4. Processar cada imóvel
    for (const property of properties) {
      try {
        const codigoImovel = property.codigoImovel || property.id;

        // Buscar detalhes
        const detailsUrl = `https://www.exclusivalarimoveis.com.br/api/v1/app/imovel/dados/${codigoImovel}`;
        const detailsResponse = await fetch(detailsUrl, {
          headers: { token: settings.external_api_token },
        });

        if (!detailsResponse.ok) {
          log('warn', `Falha ao buscar detalhes do imóvel ${codigoImovel}`);
          errors++;
          continue;
        }

        const detailsData = await detailsResponse.json();
        const details = detailsData.resultSet;

        // Verificar se já existe
        const existingResponse = await fetch(
          `${DIRECTUS_URL}/items/properties?filter[external_id][_eq]=${codigoImovel}&filter[company_id][_eq]=${COMPANY_ID}&fields=id&limit=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const existingData = await existingResponse.json();
        const existing = existingData.data?.[0];

        // Mapear finalidade
        const finalidadeMap = {
          Venda: 'venda',
          Locação: 'locacao',
          Locacao: 'locacao',
          'Venda/Locação': 'ambos',
          'Venda/Locacao': 'ambos',
        };
        const finalidade = finalidadeMap[details.finalidadeImovel] || 'venda';

        // Montar dados
        const propertyData = {
          company_id: COMPANY_ID,
          external_id: codigoImovel.toString(),
          codigo: details.referenciaImovel || null,
          titulo: details.referenciaImovel || `Imóvel ${codigoImovel}`,
          descricao: details.descricaoImovel || null,
          tipo: details.descricaoTipoImovel || null,
          finalidade,
          valor_venda:
            details.finalidadeImovel === 'Venda' ||
            details.finalidadeImovel === 'Venda/Locação'
              ? details.valorEsperado
              : null,
          valor_locacao:
            details.finalidadeImovel === 'Locação' ||
            details.finalidadeImovel === 'Venda/Locação'
              ? details.valorEsperado
              : null,
          endereco: details.endereco?.logradouro || null,
          numero: details.endereco?.numero || null,
          complemento: details.endereco?.complemento || null,
          bairro: details.endereco?.bairro || null,
          cidade: details.endereco?.cidade || null,
          estado: details.endereco?.estado || null,
          cep: details.endereco?.cep || null,
          area_total: details.area?.total?.valor
            ? parseFloat(details.area.total.valor.replace(',', '.'))
            : null,
          area_construida: details.area?.construida?.valor
            ? parseFloat(details.area.construida.valor.replace(',', '.'))
            : null,
          area_terreno: details.area?.terreno?.valor
            ? parseFloat(details.area.terreno.valor.replace(',', '.'))
            : null,
          area_privativa: details.area?.privativa?.valor
            ? parseFloat(details.area.privativa.valor.replace(',', '.'))
            : null,
          quartos: details.dormitorios || null,
          suites: details.suites || null,
          banheiros: details.banheiros || null,
          vagas_garagem: details.garagem || null,
          ano_construcao: details.anoConstrucao || null,
          mobiliado: details.mobiliado || false,
          aceita_permuta: details.permuta || false,
          aceita_financiamento: details.aceitaFinanciamento || false,
          condominio: details.nomeCondominio || null,
          valor_condominio: details.valorCondominio || null,
          valor_iptu: details.valorIPTU || null,
          status: details.exibirImovel ? 'ativo' : 'inativo',
          video_url: details.video || null,
          tour_virtual_url: details.tourVirtual || null,
          date_updated: new Date().toISOString(),
        };

        let propertyId;

        if (existing) {
          // Atualizar
          await fetch(`${DIRECTUS_URL}/items/properties/${existing.id}`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(propertyData),
          });
          propertyId = existing.id;
          updated++;
        } else {
          // Criar
          const createResponse = await fetch(`${DIRECTUS_URL}/items/properties`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(propertyData),
          });
          const createData = await createResponse.json();
          propertyId = createData.data.id;
          imported++;
        }

        // Importar imagens
        if (details.imagens && Array.isArray(details.imagens) && details.imagens.length > 0) {
          // Limpar imagens antigas
          if (existing) {
            await fetch(
              `${DIRECTUS_URL}/items/property_media?filter[property_id][_eq]=${propertyId}`,
              {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          }

          for (let i = 0; i < details.imagens.length; i++) {
            const imagem = details.imagens[i];
            try {
              await fetch(`${DIRECTUS_URL}/items/property_media`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  property_id: propertyId,
                  url: imagem.url,
                  ordem: i + 1,
                  destaque: imagem.destaque || false,
                  tipo: 'foto',
                }),
              });
              imagesImported++;
            } catch (imgError) {
              log('error', `Erro ao importar imagem ${i + 1} do imóvel ${codigoImovel}`);
            }
          }
        }
      } catch (error) {
        log('error', `Erro ao processar imóvel: ${error.message}`);
        errors++;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log('info', '✅ Importação concluída!', {
      duration: `${duration}s`,
      imported,
      updated,
      imagesImported,
      errors,
    });
  } catch (error) {
    log('error', '❌ Erro na importação', { error: error.message });
    throw error;
  }
}

// Se executado diretamente, roda uma vez
if (require.main === module) {
  log('info', '📋 Executando importação única...');
  runImport()
    .then(() => {
      log('info', '✅ Importação finalizada');
      process.exit(0);
    })
    .catch((error) => {
      log('error', '❌ Falha na importação', { error: error.message });
      process.exit(1);
    });
}

// Exportar para uso em cron scheduler
module.exports = { runImport };
