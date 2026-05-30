import 'server-only';
import { cookies } from 'next/headers';
import { decrypt } from './session';
import { db } from '../db';
import { users, companies } from '../db/schema';
import { eq } from 'drizzle-orm';
import { cache } from 'react';
import { redirect } from 'next/navigation';

export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return {
      isAuth: false,
      userId: null,
      companyId: null,
      role: null,
      companySlug: null,
    };
  }

  return {
    isAuth: true,
    userId: session.userId as string,
    companyId: session.companyId as string | null,
    role: session.role as 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_USER',
    companySlug: session.companySlug as string | null,
  };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session.isAuth || !session.userId) return null;

  try {
    const data = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        companyId: users.companyId,
        createdAt: users.createdAt,
        companyName: companies.name,
        companySlug: companies.slug,
        companyLogo: companies.logoUrl,
        companyActive: companies.isActive,
        plan: companies.plan,
        maxUsers: companies.maxUsers,
      })
      .from(users)
      .leftJoin(companies, eq(users.companyId, companies.id))
      .where(eq(users.id, session.userId))
      .limit(1);

    const user = data[0];
    if (!user) return null;

    return user;
  } catch (error) {
    console.error('Falha ao buscar usuário no DAL:', error);
    return null;
  }
});

export async function requireRole(allowedRoles: ('SUPER_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_USER')[]) {
  const session = await verifySession();
  if (!session.isAuth) {
    redirect('/login');
  }

  if (!allowedRoles.includes(session.role!)) {
    // Redireciona de forma amigável dependendo do role real do usuário
    if (session.role === 'SUPER_ADMIN') {
      redirect('/super-admin');
    } else if (session.companySlug) {
      redirect(`/${session.companySlug}/dashboard`);
    } else {
      redirect('/login');
    }
  }

  // Se o usuário pertence a uma empresa, verifica se ela está ativa
  if (session.companyId) {
    await requireActiveCompany();
  }

  return session;
}

export async function requireActiveCompany() {
  const session = await verifySession();
  if (!session.isAuth || !session.companyId) return;

  const data = await db
    .select({ isActive: companies.isActive })
    .from(companies)
    .where(eq(companies.id, session.companyId))
    .limit(1);

  const company = data[0];
  if (!company || !company.isActive) {
    // Apaga a sessão ativa se a empresa estiver bloqueada
    const cookieStore = await cookies();
    cookieStore.delete('session');
    redirect('/login?error=blocked');
  }
}

