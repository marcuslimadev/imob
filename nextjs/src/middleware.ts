import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirect root to /home
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }
  
  // Ignorar arquivos estáticos e API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // Rotas públicas que não requerem autenticação
  const publicRoutes = ['/login', '/vitrine', '/imoveis', '/home'];
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith('/imoveis/') ||
    pathname.startsWith('/empresa/')  // Todas as rotas /empresa/* são públicas
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar autenticação apenas para rotas administrativas específicas
  const protectedRoutes = ['/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  const response = NextResponse.next();

  if (isProtectedRoute && pathname !== '/login') {
    const accessToken = request.cookies.get('directus_token')?.value;

    // Se não tem token, redireciona para login
    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Headers informativos apenas
  const hostname = request.headers.get('host') || '';
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
