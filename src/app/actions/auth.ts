'use server';

import { LoginFormSchema, type FormState } from '@/lib/definitions';
import { db } from '@/db';
import { users, companies } from '@/db/schema';
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

  // 2. Busca usuário + empresa no banco pelo e-mail
  let userRecord;
  try {
    const data = await db
      .select({
        user: users,
        company: companies,
      })
      .from(users)
      .leftJoin(companies, eq(users.companyId, companies.id))
      .where(eq(users.email, validatedFields.data.email))
      .limit(1);
    
    userRecord = data[0];
  } catch (error) {
    console.error('Erro de conexão ao autenticar:', error);
    return {
      message: 'Ocorreu um erro no servidor. Tente novamente mais tarde.',
    };
  }

  if (!userRecord || !userRecord.user) {
    return {
      message: 'E-mail ou senha incorretos.',
    };
  }

  const { user, company } = userRecord;

  // 3. Compara hashes de senha com bcrypt
  const passwordMatch = await bcrypt.compare(validatedFields.data.password, user.password);

  if (!passwordMatch) {
    return {
      message: 'E-mail ou senha incorretos.',
    };
  }

  // 4. Valida se usuário está ativo
  if (!user.isActive) {
    return {
      message: 'Acesso recusado. Seu usuário está desativado.',
    };
  }

  // 5. Valida se a empresa está ativa (se não for SUPER_ADMIN)
  if (user.role !== 'SUPER_ADMIN') {
    if (!company) {
      return {
        message: 'Erro interno: Empresa não encontrada para este usuário.',
      };
    }
    if (!company.isActive) {
      return {
        message: 'Acesso suspenso. Sua empresa está inativa ou possui pendências financeiras. Entre em contato com o suporte.',
      };
    }
  }

  // 6. Cria sessão e redireciona
  const companyId = company?.id || null;
  const companySlug = company?.slug || null;
  const userRole = user.role as 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_USER';

  await createSession(user.id, companyId, userRole, companySlug);
  
  if (userRole === 'SUPER_ADMIN') {
    redirect('/super-admin');
  } else if (companySlug) {
    redirect(`/${companySlug}/dashboard`);
  } else {
    redirect('/login');
  }
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
