import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_DESIGN_THEME } from '@/lib/design-themes';
import { createDirectus, rest, authentication } from '@directus/sdk';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

const DESIGN_THEME_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('[API /auth/login] Tentando login para:', email);

    // Fazer login direto na API do Directus
    const response = await fetch(`${directusUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      console.error('[API /auth/login] Falha no login, status:', response.status);
      throw new Error('Credenciais inválidas');
    }

    const result = await response.json();
    console.log('[API /auth/login] Login bem-sucedido');

    // Criar response com os cookies
    const apiResponse = NextResponse.json({
      success: true,
      user: { email }
    });

    // Definir cookie de autenticação
    if (result.data?.access_token) {
      apiResponse.cookies.set('directus_token', result.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: '/',
      });
      console.log('[API /auth/login] Cookie access_token definido');
    }

    if (result.data?.refresh_token) {
      apiResponse.cookies.set('directus_refresh_token', result.data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: '/',
      });
      console.log('[API /auth/login] Cookie refresh_token definido');
    }

    let companyTheme: string | null = null;

    if (result.data?.access_token) {
      try {
        const meResponse = await fetch(`${directusUrl}/users/me?fields=company_id.theme_key`, {
          headers: {
            'Authorization': `Bearer ${result.data.access_token}`
          }
        });

        if (meResponse.ok) {
          const meData = await meResponse.json();
          companyTheme = meData?.data?.company_id?.theme_key || null;
        }
      } catch (error) {
        console.warn('[API /auth/login] Falha ao obter tema da empresa', error);
      }
    }

    apiResponse.cookies.set('design-theme', companyTheme || DEFAULT_DESIGN_THEME, DESIGN_THEME_COOKIE_OPTIONS);

    return apiResponse;
  } catch (error: any) {
    console.error('[API /auth/login] Erro:', error);

    return NextResponse.json(
      { success: false, error: error.message || 'Credenciais inválidas' },
      { status: 401 }
    );
  }
}
