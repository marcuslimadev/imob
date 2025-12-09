import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_DESIGN_THEME } from '@/lib/design-themes';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

const CLEAR_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 0,
  path: '/',
};

const DESIGN_THEME_CLEAR_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 0,
  path: '/',
};

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('directus_refresh_token')?.value;
  const accessToken = request.cookies.get('directus_token')?.value;
  const response = NextResponse.json({ success: true });

  try {
    if (refreshToken) {
      await fetch(`${directusUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }
  } catch (error) {
    console.warn('[API /auth/logout] Falha ao invalidar sessão no Directus', error);
  }

  response.cookies.set('directus_token', '', CLEAR_OPTIONS);
  response.cookies.set('directus_refresh_token', '', CLEAR_OPTIONS);
  response.cookies.set('design-theme', DEFAULT_DESIGN_THEME, {
    ...DESIGN_THEME_CLEAR_OPTIONS,
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
