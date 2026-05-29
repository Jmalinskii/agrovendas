'use server';

import { LoginFormSchema, type FormState } from '@/lib/definitions';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  // 1. Valida campos do formulário
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const validatedFields = LoginFormSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. Busca usuário no banco pelo e-mail
  let user;
  try {
    const data = await db.select().from(users).where(eq(users.email, validatedFields.data.email)).limit(1);
    user = data[0];
  } catch (error) {
    console.error('Erro de conexão ao autenticar:', error);
    return {
      message: 'Ocorreu um erro no servidor. Tente novamente mais tarde.',
    };
  }

  if (!user) {
    return {
      message: 'E-mail ou senha incorretos.',
    };
  }

  // 3. Compara hashes de senha com bcrypt
  const passwordMatch = await bcrypt.compare(validatedFields.data.password, user.password);

  if (!passwordMatch) {
    return {
      message: 'E-mail ou senha incorretos.',
    };
  }

  // 4. Cria sessão e redireciona
  await createSession(user.id);
  
  redirect('/dashboard');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
