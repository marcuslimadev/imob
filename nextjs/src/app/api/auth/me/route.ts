import { NextRequest, NextResponse } from 'next/server';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('directus_token')?.value;

    console.log('[API /auth/me] Token presente:', !!token);

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Buscar dados do usuário via API
    const response = await fetch(`${directusUrl}/users/me?fields=*`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('[API /auth/me] Falha ao buscar usuário, status:', response.status);
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const result = await response.json();
    console.log('[API /auth/me] Usuário encontrado:', result.data?.email);

    return NextResponse.json({ user: result.data });
  } catch (error: any) {
    console.error('[API /auth/me] Erro:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
