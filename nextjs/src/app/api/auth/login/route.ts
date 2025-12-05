import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, rest, authentication } from '@directus/sdk';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

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

    return apiResponse;
  } catch (error: any) {
    console.error('[API /auth/login] Erro:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Credenciais inválidas' },
      { status: 401 }
    );
  }
}
