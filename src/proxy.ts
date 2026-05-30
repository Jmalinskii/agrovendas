import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

// Rotas públicas que não exigem login
const publicRoutes = ['/login'];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Ignorar arquivos estáticos, favicon, apis etc.
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('.') ||
    path === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get('session')?.value;
  const session = await decrypt(cookie);

  const isPublicRoute = publicRoutes.includes(path);

  // 1. Não autenticado tentando acessar rota privada
  if (!session?.userId && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // 2. Autenticado tentando acessar rota de login (pública)
  if (session?.userId && isPublicRoute) {
    if (session.role === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/super-admin', req.nextUrl));
    } else if (session.companySlug) {
      return NextResponse.redirect(new URL(`/${session.companySlug}/dashboard`, req.nextUrl));
    }
  }

  // 3. Rota Raiz "/" redireciona conforme o role
  if (path === '/') {
    if (session?.role === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/super-admin', req.nextUrl));
    } else if (session?.companySlug) {
      return NextResponse.redirect(new URL(`/${session.companySlug}/dashboard`, req.nextUrl));
    }
  }

  // 4. Proteção de Rotas "/super-admin"
  if (path.startsWith('/super-admin')) {
    if (session?.role !== 'SUPER_ADMIN') {
      // Redireciona usuário da empresa para o dashboard dela
      if (session?.companySlug) {
        return NextResponse.redirect(new URL(`/${session.companySlug}/dashboard`, req.nextUrl));
      }
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }
  }

  // 5. Proteção de Rotas "/[slug]"
  // Extrai o primeiro segmento do path como slug (por exemplo, "/agrodemo/dashboard" -> "agrodemo")
  const pathSegments = path.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];

  // Se o primeiro segmento existir e não for super-admin ou login
  if (firstSegment && firstSegment !== 'super-admin' && firstSegment !== 'login') {
    // É uma rota de tenant (empresa)
    if (session?.role === 'SUPER_ADMIN') {
      // O super-admin é mantido na área administrativa
      return NextResponse.redirect(new URL('/super-admin', req.nextUrl));
    }

    if (session?.companySlug !== firstSegment) {
      // Tentativa de acessar outra empresa
      if (session?.companySlug) {
        return NextResponse.redirect(new URL(`/${session.companySlug}/dashboard`, req.nextUrl));
      }
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }
  }

  return NextResponse.next();
}

// Configurar o matcher para rodar em todas as rotas exceto estáticos
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
