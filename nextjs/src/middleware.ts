import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { directusServer } from '@/lib/directus/client';
import { readItems } from '@directus/sdk';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
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
  const hostname = request.headers.get('host') || '';
  let companySlug: string | null = null;
  let companyId: string | null = null;
  
  // 1. Tentar detectar por subdomínio (slug.imobi.com.br)
  if (hostname.includes('.imobi.com.br') && !hostname.startsWith('www.')) {
    companySlug = hostname.split('.')[0];
  }
  // 2. Para desenvolvimento local, aceitar slug via query param (?company=exclusiva)
  else if (hostname.includes('localhost')) {
    const url = new URL(request.url);
    companySlug = url.searchParams.get('company');
  }
  
  // 3. Buscar company no Directus
  if (companySlug) {
    try {
      const companies = await directusServer.request(
        readItems('companies', {
          filter: {
            slug: { _eq: companySlug },
            status: { _eq: 'active' }
          },
          limit: 1
        })
      );
      
      if (companies.length > 0) {
        companyId = companies[0].id;
      }
    } catch (error) {
      console.error('Erro ao buscar company:', error);
    }
  }
  
  // 4. Se não encontrou por slug, tentar por custom domain
  if (!companyId && !hostname.includes('localhost') && !hostname.includes('.imobi.com.br')) {
    try {
      const companies = await directusServer.request(
        readItems('companies', {
          filter: {
            custom_domain: { _eq: hostname },
            status: { _eq: 'active' }
          },
          limit: 1
        })
      );
      
      if (companies.length > 0) {
        companyId = companies[0].id;
        companySlug = companies[0].slug;
      }
    } catch (error) {
      console.error('Erro ao buscar company por custom domain:', error);
    }
  }
  
  // 5. Injetar company no header para uso nos componentes
  if (companyId && companySlug) {
    response.headers.set('x-company-id', companyId);
    response.headers.set('x-company-slug', companySlug);
  }
  
  // 6. Para rotas /empresa, não exigir company_id (será detectado após login)
  // Para outras rotas, redirecionar se não tiver company
  if (!companyId && 
      pathname !== '/login' && 
      pathname !== '/home' && 
      !pathname.startsWith('/admin') && 
      !pathname.startsWith('/empresa')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
