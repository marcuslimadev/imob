import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const DIRECTUS_URL =
  process.env.DIRECTUS_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_DIRECTUS_URL ||
  'http://localhost:8055';

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('directus_token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar dados do usuário para pegar company_id
    const userResponse = await fetch(`${DIRECTUS_URL}/users/me?fields=id,email,company_id,role`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!userResponse.ok) {
      const body = await safeJson(userResponse);
      const directusMessage = body?.errors?.[0]?.message;

      // 401/403 aqui normalmente indica token inválido ou role sem acesso
      return NextResponse.json(
        {
          error: 'Falha ao autenticar',
          status: userResponse.status,
          details: directusMessage
        },
        { status: userResponse.status === 403 ? 403 : 401 }
      );
    }

    const userData = await safeJson(userResponse);
    if (!userData?.data) {
      return NextResponse.json({ error: 'Resposta inválida do Directus (users/me)' }, { status: 502 });
    }
    const companyId = userData.data.company_id;

    if (!companyId) {
      return NextResponse.json({ error: 'Usuário não tem empresa associada' }, { status: 400 });
    }

    console.log('[API /import-properties] Iniciando importação para company:', companyId);

    // Buscar configurações da empresa (API externa)
    const settingsResponse = await fetch(`${DIRECTUS_URL}/items/app_settings?filter[company_id][_eq]=${companyId}&limit=1`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!settingsResponse.ok) {
      const body = await safeJson(settingsResponse);
      const directusMessage = body?.errors?.[0]?.message;

      if (settingsResponse.status === 403) {
        return NextResponse.json(
          {
            error: 'Sem permissão para ler as configurações da empresa (app_settings)',
            details: directusMessage || 'Verifique a role/permissões do usuário no Directus.'
          },
          { status: 403 }
        );
      }

      return NextResponse.json({
        error: 'Falha ao buscar configurações da empresa',
        status: settingsResponse.status,
        details: directusMessage
      }, { status: 502 });
    }

    const settingsData = await safeJson(settingsResponse);
    if (!settingsData?.data) {
      return NextResponse.json({
        error: 'Resposta inválida do Directus (app_settings)'
      }, { status: 502 });
    }
    const settings = settingsData.data?.[0];

    if (!settings?.external_api_url || !settings?.external_api_token) {
      return NextResponse.json({ 
        error: 'Configure a API externa em Configurações primeiro',
        details: 'É necessário configurar external_api_url e external_api_token'
      }, { status: 400 });
    }

    console.log('[API /import-properties] Usando API:', settings.external_api_url);

    // Fazer requisição para API externa - Exclusiva Lar Imóveis
    // Endpoint correto: /api/v1/imovel/lista (não /app/imovel/lista)
    const baseUrl = settings.external_api_url.replace(/\/+$/, ''); // Remove trailing slashes
    const apiUrl = `${baseUrl}/api/v1/imovel/lista`;
    
    console.log('[API /import-properties] URL construída:', apiUrl);
    
    const externalResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'token': settings.external_api_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'ativos',
        pagina: 1,
        limite: 100
      })
    });

    if (!externalResponse.ok) {
      console.error('[API /import-properties] Erro na API externa:', externalResponse.status);

      return NextResponse.json({
        error: 'Falha ao conectar com API externa',
        status: externalResponse.status
      }, { status: 502 });
    }

    const externalData = await safeJson(externalResponse);
    if (!externalData) {
      return NextResponse.json({
        error: 'Falha ao ler resposta JSON da API externa'
      }, { status: 502 });
    }
    const properties = externalData.data || externalData.imoveis || externalData;

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

    // Importar cada imóvel
    for (const property of properties) {
      try {
        // Verificar se imóvel já existe (por external_id)
        const existingResponse = await fetch(
          `${DIRECTUS_URL}/items/properties?filter[external_id][_eq]=${property.id}&filter[company_id][_eq]=${companyId}&limit=1`,
          { headers: { 'Authorization': `Bearer ${authToken}` } }
        );

        if (!existingResponse.ok) {
          const body = await safeJson(existingResponse);
          const directusMessage = body?.errors?.[0]?.message;

          if (existingResponse.status === 403) {
            return NextResponse.json(
              {
                error: 'Sem permissão para consultar imóveis (properties)',
                details: directusMessage || 'Verifique a role/permissões do usuário no Directus.'
              },
              { status: 403 }
            );
          }

          throw new Error(
            `Falha ao consultar imóveis no Directus (status ${existingResponse.status})${directusMessage ? `: ${directusMessage}` : ''}`
          );
        }

        const existingData = await safeJson(existingResponse);
        if (!existingData) {
          throw new Error('Falha ao ler resposta do Directus (properties lookup)');
        }
        const existing = existingData.data?.[0];

        const propertyData = {
          company_id: companyId,
          external_id: property.id?.toString(),
          title: property.title || property.name,
          description: property.description,
          property_type: property.type || 'apartment',
          transaction_type: property.transaction_type || 'sale',
          price_sale: property.price_sale || property.price,
          price_rent: property.price_rent,
          price_condo: property.condo_fee,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          suites: property.suites,
          parking_spaces: property.parking_spaces || property.garages,
          area_total: property.area_total || property.total_area,
          area_built: property.area_built || property.built_area,
          address: property.address,
          neighborhood: property.neighborhood,
          city: property.city,
          state: property.state,
          zip_code: property.zip_code || property.cep,
          latitude: property.latitude,
          longitude: property.longitude,
          status: 'active',
          date_updated: new Date().toISOString()
        };

        if (existing) {
          // Atualizar imóvel existente
          const updateResponse = await fetch(`${DIRECTUS_URL}/items/properties/${existing.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(propertyData)
          });

          if (!updateResponse.ok) {
            const body = await safeJson(updateResponse);
            const directusMessage = body?.errors?.[0]?.message;

            if (updateResponse.status === 403) {
              return NextResponse.json(
                {
                  error: 'Sem permissão para atualizar imóveis (properties)',
                  details: directusMessage || 'Verifique a role/permissões do usuário no Directus.'
                },
                { status: 403 }
              );
            }

            throw new Error(
              `Falha ao atualizar imóvel no Directus (status ${updateResponse.status})${directusMessage ? `: ${directusMessage}` : ''}`
            );
          }
          updated++;
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

          if (!createResponse.ok) {
            const body = await safeJson(createResponse);
            const directusMessage = body?.errors?.[0]?.message;

            if (createResponse.status === 403) {
              return NextResponse.json(
                {
                  error: 'Sem permissão para criar imóveis (properties)',
                  details: directusMessage || 'Verifique a role/permissões do usuário no Directus.'
                },
                { status: 403 }
              );
            }

            throw new Error(
              `Falha ao criar imóvel no Directus (status ${createResponse.status})${directusMessage ? `: ${directusMessage}` : ''}`
            );
          }
          imported++;
        }
      } catch (error) {
        console.error('[API /import-properties] Erro ao processar imóvel:', error);
        errors++;
      }
    }

    console.log(`[API /import-properties] Concluído: ${imported} novos, ${updated} atualizados, ${errors} erros`);

    return NextResponse.json({
      success: true,
      total: properties.length,
      imported,
      updated,
      errors,
      message: `Importação concluída! ${imported} novos imóveis, ${updated} atualizados.`
    });

  } catch (error: any) {
    console.error('[API /import-properties] Erro geral:', error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao importar imóveis'
    }, { status: 500 });
  }
}
