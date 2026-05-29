import 'server-only';
import { cookies } from 'next/headers';
import { decrypt } from './session';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { cache } from 'react';

export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return { isAuth: false, userId: null };
  }

  return { isAuth: true, userId: session.userId as string };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session.isAuth || !session.userId) return null;

  try {
    const data = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    const user = data[0];

    if (!user) return null;

    // Retorna dados seguros do usuário (sem senha)
    const { password, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    console.error('Falha ao buscar usuário no DAL:', error);
    return null;
  }
});
