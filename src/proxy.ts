import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

// Rotas protegidas que exigem login
const protectedRoutes = ['/dashboard'];
// Rotas públicas que não podem ser acessadas por usuários logados
const publicRoutes = ['/login'];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Verifica se a rota é protegida ou pública
  const isProtectedRoute = protectedRoutes.some(route => path === route || path.startsWith(route + '/'));
  const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith(route + '/'));

  // Obtém e decodifica a sessão do cookie
  const cookie = req.cookies.get('session')?.value;
  const session = await decrypt(cookie);

  // Redireciona para /login se tentar acessar rota protegida sem sessão
  if (isProtectedRoute && !session?.userId) {
    const loginUrl = new URL('/login', req.nextUrl);
    // Preserva o redirect original caso queira redirecionar de volta após login
    loginUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(loginUrl);
  }

  // Redireciona para /dashboard se tentar acessar rota pública estando logado
  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  // Redireciona a raiz "/" dependendo do estado
  if (path === '/') {
    if (session?.userId) {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    } else {
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }
  }

  return NextResponse.next();
}

// Configura o matcher do Proxy para rodar em todas as rotas exceto arquivos estáticos, imagens e APIs
export const config = {
  matcher: [
    /*
     * Intercepta todas as rotas exceto:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos gerados)
     * - _next/image (imagens otimizadas)
     * - favicon.ico, sitemap.xml, robots.txt (arquivos de SEO/favicon)
     * - imagens/ícones com extensões .png, .jpg, .svg, .ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)',
  ],
};
