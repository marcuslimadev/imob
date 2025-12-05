import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { directusServer } from '@/lib/directus/client';
import { readItems } from '@directus/sdk';

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
  
  if (isProtectedRoute && pathname !== '/login') {
    // Directus SDK with cookie authentication uses 'directus_refresh_token'
    const authToken = request.cookies.get('directus_refresh_token')?.value;
    
    if (!authToken) {
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
  const response = NextResponse.next();
  
  if (companyId && companySlug) {
    response.headers.set('x-company-id', companyId);
    response.headers.set('x-company-slug', companySlug);
  }
  
  // 6. Redirecionar para página de erro se não encontrou company (exceto homepage e páginas estáticas)
  if (!companyId && pathname !== '/' && pathname !== '/home' && !pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url));
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
