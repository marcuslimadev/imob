import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const DIRECTUS_URL = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('directus_token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar dados do usuário para pegar company_id
    const userResponse = await fetch(`${DIRECTUS_URL}/users/me?fields=id,email,company_id`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Falha ao autenticar' }, { status: 401 });
    }

    const userData = await userResponse.json();
    const companyId = userData.data.company_id;

    if (!companyId) {
      return NextResponse.json({ error: 'Usuário não tem empresa associada' }, { status: 400 });
    }

    console.log('[API /import-properties] Iniciando importação para company:', companyId);

    // Buscar configurações da empresa (API externa)
    const settingsResponse = await fetch(`${DIRECTUS_URL}/items/app_settings?filter[company_id][_eq]=${companyId}&limit=1`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const settingsData = await settingsResponse.json();
    const settings = settingsData.data?.[0];

    if (!settings?.external_api_url || !settings?.external_api_token) {
      return NextResponse.json({ 
        error: 'Configure a API externa em Configurações primeiro',
        details: 'É necessário configurar external_api_url e external_api_token'
      }, { status: 400 });
    }

    console.log('[API /import-properties] Usando API:', settings.external_api_url);

    // Fazer requisição para API externa - Exclusiva Lar Imóveis
    const token = String(settings.external_api_token || '').trim();
    const baseRaw = settings.imobibrasil_url || settings.external_api_url || '';
    const trimmed = baseRaw.replace(/\/+$/, '');
    const hasApp = /\/api\/v1\/app$/i.test(trimmed);

    // Priorizar o endpoint confirmado (GET + header token) e a URL configurada
    const candidates = [
      'https://www.exclusivalarimoveis.com.br/api/v1/app/imovel/lista',
      hasApp ? `${trimmed}/imovel/lista` : `${trimmed}/api/v1/app/imovel/lista`,
      trimmed
    ].filter(Boolean);

    console.log('[API /import-properties] URLs candidatas:', candidates, 'baseRaw:', baseRaw);
    console.log('[API /import-properties] Token:', settings.external_api_token.substring(0, 20) + '...');
    
    let externalResponse: Response | null = null;
    let lastErrorText = '';
    const attemptLogs: Array<{ url: string; headers: string[]; status: number; body?: string; ok: boolean }> = [];

    // Tentativas: header token, query token, bearer, com/sem query de paginação
    type Attempt = { url: string; headers: Record<string, string> };

    const buildAttempts = (baseUrl: string): Attempt[] => {
      const safeUrl = baseUrl.replace(/\/+$/, '');
      return [
        { url: safeUrl, headers: { token } },
        { url: `${safeUrl}?token=${encodeURIComponent(token)}`, headers: {} },
        { url: `${safeUrl}?token=${encodeURIComponent(token)}&status=ativos&pagina=1&limite=100`, headers: {} },
        { url: safeUrl, headers: { Authorization: `Bearer ${token}` } }
      ];
    };

    for (const apiUrl of candidates) {
      const attempts = buildAttempts(apiUrl);

      for (const attempt of attempts) {
        const resp = await fetch(attempt.url, {
          method: 'GET',
          headers: attempt.headers,
        });

        if (resp.ok) {
          externalResponse = resp;
          attemptLogs.push({ url: attempt.url, headers: Object.keys(attempt.headers), status: resp.status, ok: true });
          console.log('[API /import-properties] URL ok:', attempt.url, 'headers:', Object.keys(attempt.headers));
          break;
        }

        lastErrorText = await resp.text();
        attemptLogs.push({ url: attempt.url, headers: Object.keys(attempt.headers), status: resp.status, body: lastErrorText?.slice(0, 500), ok: false });
        console.warn('[API /import-properties] Tentativa falhou:', attempt.url, 'status:', resp.status, 'body:', lastErrorText);
      }

      if (externalResponse) break;
    }

    if (!externalResponse) {
      return NextResponse.json({
        error: 'Falha ao conectar com API externa',
        status: 502,
        details: lastErrorText || 'Todas as URLs candidatas retornaram erro',
        attempts: attemptLogs
      }, { status: 502 });
    }

    const externalData = await externalResponse.json();
    const properties =
      externalData?.resultSet?.data ||
      externalData?.data?.imoveis ||
      externalData?.data ||
      externalData?.imoveis ||
      externalData;

    if (!Array.isArray(properties)) {

      return NextResponse.json({
        error: 'Formato de resposta inválido da API externa',
        received: typeof properties
      }, { status: 400 });
    }

    console.log(`[API /import-properties] Encontrados ${properties.length} imóveis`);

    let imported = 0;
    let updated = 0;
    let errors = 0;
    let imagesImported = 0;

    // Importar cada imóvel
    for (const property of properties) {
      try {
        const codigoImovel = property.codigoImovel || property.id || property.codigo;
        
        // FASE 2: Buscar detalhes completos do imóvel
        console.log(`[API /import-properties] Buscando detalhes do imóvel ${codigoImovel}...`);
        
        const detailsUrl = `https://www.exclusivalarimoveis.com.br/api/v1/app/imovel/dados/${codigoImovel}`;
        const detailsResponse = await fetch(detailsUrl, {
          method: 'GET',
          headers: { token }
        });

        if (!detailsResponse.ok) {
          console.warn(`[API /import-properties] Falha ao buscar detalhes do imóvel ${codigoImovel}, usando dados básicos`);
          throw new Error('Detalhes não disponíveis');
        }

        const detailsData = await detailsResponse.json();
        const details = detailsData.resultSet;

        // Verificar se imóvel já existe (por external_id)
        const existingResponse = await fetch(
          `${DIRECTUS_URL}/items/properties?filter[external_id][_eq]=${codigoImovel}&filter[company_id][_eq]=${companyId}&fields=id&limit=1`,
          { headers: { 'Authorization': `Bearer ${authToken}` } }
        );

        const existingData = await existingResponse.json();
        const existing = existingData.data?.[0];

        // Mapear finalidade
        const finalidadeMap: Record<string, string> = {
          'Venda': 'venda',
          'Locação': 'locacao',
          'Locacao': 'locacao',
          'Venda/Locação': 'ambos',
          'Venda/Locacao': 'ambos'
        };
        const finalidade = finalidadeMap[details.finalidadeImovel] || 'venda';

        // Montar dados completos do imóvel
        const propertyData = {
          company_id: companyId,
          external_id: codigoImovel.toString(),
          codigo: details.referenciaImovel || null,
          titulo: details.referenciaImovel || `Imóvel ${codigoImovel}`,
          descricao: details.descricaoImovel || null,
          tipo: details.descricaoTipoImovel || null,
          finalidade,
          valor_venda: details.finalidadeImovel === 'Venda' || details.finalidadeImovel === 'Venda/Locação' ? details.valorEsperado : null,
          valor_locacao: details.finalidadeImovel === 'Locação' || details.finalidadeImovel === 'Venda/Locação' ? details.valorEsperado : null,
          endereco: details.endereco?.logradouro || null,
          numero: details.endereco?.numero || null,
          complemento: details.endereco?.complemento || null,
          bairro: details.endereco?.bairro || null,
          cidade: details.endereco?.cidade || null,
          estado: details.endereco?.estado || null,
          cep: details.endereco?.cep || null,
          area_total: details.area?.total?.valor ? parseFloat(details.area.total.valor.replace(',', '.')) : null,
          area_construida: details.area?.construida?.valor ? parseFloat(details.area.construida.valor.replace(',', '.')) : null,
          area_terreno: details.area?.terreno?.valor ? parseFloat(details.area.terreno.valor.replace(',', '.')) : null,
          area_privativa: details.area?.privativa?.valor ? parseFloat(details.area.privativa.valor.replace(',', '.')) : null,
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
          date_updated: new Date().toISOString()
        } as any;

        let propertyId: string;

        if (existing) {
          // Atualizar imóvel existente
          await fetch(`${DIRECTUS_URL}/items/properties/${existing.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(propertyData)
          });
          propertyId = existing.id;
          updated++;
          console.log(`[API /import-properties] Imóvel ${codigoImovel} atualizado`);
        } else {
          // Criar novo imóvel
          const createResponse = await fetch(`${DIRECTUS_URL}/items/properties`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(propertyData)
          });
          const createData = await createResponse.json();
          propertyId = createData.data.id;
          imported++;
          console.log(`[API /import-properties] Imóvel ${codigoImovel} criado com ID ${propertyId}`);
        }

        // FASE 3: Importar imagens
        if (details.imagens && Array.isArray(details.imagens) && details.imagens.length > 0) {
          console.log(`[API /import-properties] Importando ${details.imagens.length} imagens do imóvel ${codigoImovel}...`);
          
          // Limpar imagens antigas se for atualização
          if (existing) {
            await fetch(`${DIRECTUS_URL}/items/property_media?filter[property_id][_eq]=${propertyId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${authToken}` }
            });
          }

          for (let i = 0; i < details.imagens.length; i++) {
            const imagem = details.imagens[i];
            try {
              await fetch(`${DIRECTUS_URL}/items/property_media`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  property_id: propertyId,
                  url: imagem.url,
                  ordem: i + 1,
                  destaque: imagem.destaque || false,
                  tipo: 'foto'
                })
              });
              imagesImported++;
            } catch (imgError) {
              console.error(`[API /import-properties] Erro ao importar imagem ${i + 1} do imóvel ${codigoImovel}:`, imgError);
            }
          }
        }

      } catch (error) {
        console.error('[API /import-properties] Erro ao processar imóvel:', error);
        errors++;
      }
    }

    console.log(`[API /import-properties] Concluído: ${imported} novos, ${updated} atualizados, ${errors} erros, ${imagesImported} imagens`);

    return NextResponse.json({
      success: true,
      total: properties.length,
      imported,
      updated,
      errors,
      imagesImported,
      message: `Importação concluída! ${imported} novos imóveis, ${updated} atualizados, ${imagesImported} imagens importadas.`,
      attempts: attemptLogs
    });

  } catch (error: any) {
    console.error('[API /import-properties] Erro geral:', error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao importar imóveis'
    }, { status: 500 });
  }
}
