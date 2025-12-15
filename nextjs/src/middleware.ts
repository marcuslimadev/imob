import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware roda no edge - usa URL interna se disponível
const directusUrl = process.env.DIRECTUS_INTERNAL_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false, // HTTP por enquanto
  sameSite: 'lax' as const,
  path: '/'
};

async function refreshAccessToken(refreshToken: string) {
  try {
    const refreshResponse = await fetch(`${directusUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!refreshResponse.ok) {
      return null;
    }

    const json = await refreshResponse.json();
    const accessToken = json?.data?.access_token;
    const newRefresh = json?.data?.refresh_token || refreshToken;

    if (!accessToken) {
      return null;
    }

    return { accessToken, refreshToken: newRefresh };
  } catch (error) {
    console.error('[middleware] Falha ao renovar sessão Directus', error);
    
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ignorar arquivos estáticos e API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // Verificar autenticação para rotas protegidas
  const protectedRoutes = ['/empresa', '/admin', '/leads', '/conversas'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  const response = NextResponse.next();

  if (isProtectedRoute && pathname !== '/login') {
    const accessToken = request.cookies.get('directus_token')?.value;
    const refreshToken = request.cookies.get('directus_refresh_token')?.value;

    if (!accessToken && refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken);

      if (refreshed?.accessToken) {
        response.cookies.set('directus_token', refreshed.accessToken, {
          ...AUTH_COOKIE_OPTIONS,
          maxAge: 60 * 60 * 24 * 7
        });

        response.cookies.set('directus_refresh_token', refreshed.refreshToken, {
          ...AUTH_COOKIE_OPTIONS,
          maxAge: 60 * 60 * 24 * 30
        });
      }
    }

    const finalAccessToken = accessToken || response.cookies.get('directus_token')?.value;

    if (!finalAccessToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);

      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Detectar company por subdomínio ou custom domain
  // SIMPLIFICADO: Por enquanto não fazer queries ao Directus no middleware
  // A detecção de company será feita após login no AuthContext
  const hostname = request.headers.get('host') || '';
  
  // Headers informativos apenas
  if (hostname.includes('.imobi.com.br') && !hostname.startsWith('www.')) {
    const companySlug = hostname.split('.')[0];
    response.headers.set('x-company-slug', companySlug);
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
