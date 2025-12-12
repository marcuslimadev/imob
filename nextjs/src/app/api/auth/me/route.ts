import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_DESIGN_THEME } from '@/lib/design-themes';

const DESIGN_THEME_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
};

const directusUrl = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

export async function GET(request: NextRequest) {
  try {
    let token = request.cookies.get('directus_token')?.value;
    const refreshToken = request.cookies.get('directus_refresh_token')?.value;

    const authCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/'
    };

    const cookieUpdates: Array<{ name: string; value: string; options: any }> = [];

    if (!token && refreshToken) {
      try {
        const refreshResponse = await fetch(`${directusUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (refreshResponse.ok) {
          const refreshJson = await refreshResponse.json();
          const renewedAccess = refreshJson?.data?.access_token || null;
          const renewedRefresh = refreshJson?.data?.refresh_token || refreshToken;

          if (renewedAccess) {
            token = renewedAccess;
            cookieUpdates.push({
              name: 'directus_token',
              value: renewedAccess,
              options: { ...authCookieOptions, maxAge: 60 * 60 * 24 * 7 }
            });

            cookieUpdates.push({
              name: 'directus_refresh_token',
              value: renewedRefresh,
              options: { ...authCookieOptions, maxAge: 60 * 60 * 24 * 30 }
            });
          }
        }
      } catch (refreshError) {
        console.warn('[API /auth/me] Falha ao renovar token', refreshError);
      }
    }

    console.log('[API /auth/me] Token presente:', !!token);

    if (!token) {

      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Buscar dados do usuário via API incluindo empresa para refletir tema e preferências
    const response = await fetch(`${directusUrl}/users/me?fields=*,company_id.*`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('[API /auth/me] Falha ao buscar usuário, status:', response.status);

      return NextResponse.json({ user: null }, { status: 401 });
    }

    const result = await response.json();
    console.log('[API /auth/me] Usuário encontrado:', result.data?.email, 'ID:', result.data?.id);
    console.log('[API /auth/me] Company:', result.data?.company_id);

    if (!result.data) {
      console.error('[API /auth/me] result.data está undefined!');
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const companyTheme = typeof result.data?.company_id === 'object'
      ? result.data.company_id?.theme_key
      : null;

    const responseWithTheme = NextResponse.json({ user: result.data });

    cookieUpdates.forEach(update => {
      responseWithTheme.cookies.set(update.name, update.value, update.options);
    });

    responseWithTheme.cookies.set(
      'design-theme',
      companyTheme || DEFAULT_DESIGN_THEME,
      DESIGN_THEME_COOKIE_OPTIONS
    );

    return responseWithTheme;
  } catch (error: any) {
    console.error('[API /auth/me] Erro:', error);

    return NextResponse.json({ user: null }, { status: 401 });
  }
}
