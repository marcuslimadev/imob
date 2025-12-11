import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const DIRECTUS_URL = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('directus_token')?.value;

    if (!token) {

      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar usuário autenticado
    const userResponse = await fetch(`${DIRECTUS_URL}/users/me?fields=company_id`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userResponse.ok) {

      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
    }

    const userData = await userResponse.json();
    const companyId = userData.data.company_id;

    if (!companyId) {

      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 400 });
    }

    // Buscar configurações da empresa (campos usados na UI)
    const settingsResponse = await fetch(
      `${DIRECTUS_URL}/items/app_settings?filter[company_id][_eq]=${companyId}&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!settingsResponse.ok) {

      return NextResponse.json({
        external_api_url: '',
        external_api_token: '',
        imobibrasil_url: '',
        imobibrasil_token: '',
        chavesnamao_token: '',
        xml_url: '',
        twilio_account_sid: '',
        twilio_auth_token: '',
        twilio_whatsapp_number: '',
        openai_api_key: '',
        openai_model: 'gpt-4o-mini',
        clicksign_access_token: '',
      });
    }

    const settingsData = await settingsResponse.json();
    const settings = settingsData.data?.[0] || {};

    return NextResponse.json({
      external_api_url: settings.external_api_url || '',
      external_api_token: settings.external_api_token || '',
      imobibrasil_url: settings.imobibrasil_url || settings.external_api_url || '',
      imobibrasil_token: settings.imobibrasil_token || settings.external_api_token || '',
      chavesnamao_token: settings.chavesnamao_token || '',
      xml_url: settings.xml_url || '',
      twilio_account_sid: settings.twilio_account_sid || '',
      twilio_auth_token: settings.twilio_auth_token || '',
      twilio_whatsapp_number: settings.twilio_whatsapp_number || '',
      openai_api_key: settings.openai_api_key || '',
      openai_model: settings.openai_model || 'gpt-4o-mini',
      clicksign_access_token: settings.clicksign_access_token || '',
    });
  } catch (error: any) {
    console.error('[API /settings GET] Erro:', error);

    return NextResponse.json(
      { error: error.message || 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('directus_token')?.value;

    if (!token) {

      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar usuário autenticado
    const userResponse = await fetch(`${DIRECTUS_URL}/users/me?fields=company_id`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userResponse.ok) {

      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
    }

    const userData = await userResponse.json();
    const companyId = userData.data.company_id;

    if (!companyId) {

      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 400 });
    }

    const body = await request.json();
    const {
      external_api_url,
      external_api_token,
      imobibrasil_url,
      imobibrasil_token,
      chavesnamao_token,
      xml_url,
      twilio_account_sid,
      twilio_auth_token,
      twilio_whatsapp_number,
      openai_api_key,
      openai_model,
      clicksign_access_token,
    } = body;

    // Verificar se já existe configuração
    const existingResponse = await fetch(
      `${DIRECTUS_URL}/items/app_settings?filter[company_id][_eq]=${companyId}&limit=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const existingData = await existingResponse.json();
    const existing = existingData.data?.[0];

    let result;

    if (existing) {
      // Atualizar existente
      const updateResponse = await fetch(`${DIRECTUS_URL}/items/app_settings/${existing.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          external_api_url,
          external_api_token,
          imobibrasil_url: imobibrasil_url || external_api_url,
          imobibrasil_token: imobibrasil_token || external_api_token,
          chavesnamao_token,
          xml_url,
          twilio_account_sid,
          twilio_auth_token,
          twilio_whatsapp_number,
          openai_api_key,
          openai_model,
          clicksign_access_token,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.errors?.[0]?.message || 'Erro ao atualizar configurações');
      }

      result = await updateResponse.json();
    } else {
      // Criar novo
      const createResponse = await fetch(`${DIRECTUS_URL}/items/app_settings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: companyId,
          external_api_url,
          external_api_token,
          imobibrasil_url: imobibrasil_url || external_api_url,
          imobibrasil_token: imobibrasil_token || external_api_token,
          chavesnamao_token,
          xml_url,
          twilio_account_sid,
          twilio_auth_token,
          twilio_whatsapp_number,
          openai_api_key,
          openai_model,
          clicksign_access_token,
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.errors?.[0]?.message || 'Erro ao criar configurações');
      }

      result = await createResponse.json();
    }

    console.log('[API /settings POST] Configurações salvas:', { companyId, external_api_url });

    return NextResponse.json({
      success: true,
      message: 'Configurações salvas com sucesso',
      data: result.data,
    });
  } catch (error: any) {
    console.error('[API /settings POST] Erro:', error);

    return NextResponse.json(
      { error: error.message || 'Erro ao salvar configurações' },
      { status: 500 }
    );
  }
}
