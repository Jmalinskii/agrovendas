'use server';

import { UserFormSchema, type FormState } from '@/lib/definitions';
import { db } from '@/db';
import { users, companies } from '@/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function createUser(
  companyId: string,
  state: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Validar campos
  const rawFields = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    role: formData.get('role') as string,
  };

  const validatedFields = UserFormSchema.safeParse(rawFields);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const data = validatedFields.data;

  if (!data.password) {
    return {
      errors: { password: ['A senha é obrigatória para novos usuários.'] },
      success: false,
    };
  }

  try {
    // 2. Verificar limite de usuários contratados pela empresa
    const companyQuery = await db
      .select({ maxUsers: companies.maxUsers, name: companies.name })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);
    
    const company = companyQuery[0];
    if (!company) {
      return {
        message: 'Empresa não encontrada.',
        success: false,
      };
    }

    const [userCountRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.companyId, companyId));
    
    const currentUserCount = Number(userCountRes?.count || 0);

    if (currentUserCount >= company.maxUsers) {
      return {
        message: `Limite de usuários atingido para a empresa ${company.name} (${company.maxUsers} contratados). Solicite um upgrade de plano.`,
        success: false,
      };
    }

    // 3. Verificar se email já existe
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser[0]) {
      return {
        errors: { email: ['Este e-mail já está cadastrado no sistema.'] },
        success: false,
      };
    }

    // 4. Criptografar senha e criar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    await db.insert(users).values({
      companyId: companyId,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role as 'COMPANY_ADMIN' | 'COMPANY_USER',
      isActive: true,
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return {
      message: 'Ocorreu um erro interno ao tentar registrar o usuário.',
      success: false,
    };
  }

  revalidatePath(`/super-admin/empresas/${companyId}/usuarios`);
  revalidatePath(`/[slug]/usuarios`);
  return { success: true };
}

export async function updateUser(
  id: string,
  companyId: string | null,
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const rawFields = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    role: formData.get('role') as string,
  };

  // Tornar password opcional durante a edição
  const validatedFields = UserFormSchema.omit({ password: true }).safeParse(rawFields);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const data = validatedFields.data;

  try {
    // Verificar se e-mail já está em uso por outro id
    const emailConflict = await db
      .select()
      .from(users)
      .where(and(eq(users.email, data.email), sql`${users.id} != ${id}`))
      .limit(1);

    if (emailConflict[0]) {
      return {
        errors: { email: ['Este e-mail já está em uso por outro usuário.'] },
        success: false,
      };
    }

    const updateData: any = {
      name: data.name,
      email: data.email,
      role: data.role,
      updatedAt: new Date(),
    };

    // Senha opcional
    const newPassword = formData.get('password') as string;
    if (newPassword && newPassword.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, id));

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return {
      message: 'Falha ao atualizar dados do usuário.',
      success: false,
    };
  }

  if (companyId) {
    revalidatePath(`/super-admin/empresas/${companyId}/usuarios`);
    revalidatePath(`/[slug]/usuarios`);
  }
  return { success: true };
}

export async function toggleUserStatus(
  id: string,
  companyId: string | null
): Promise<{ success: boolean; message?: string }> {
  try {
    const data = await db.select({ isActive: users.isActive }).from(users).where(eq(users.id, id)).limit(1);
    const user = data[0];

    if (!user) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    const nextStatus = !user.isActive;

    await db.update(users)
      .set({ isActive: nextStatus, updatedAt: new Date() })
      .where(eq(users.id, id));

    if (companyId) {
      revalidatePath(`/super-admin/empresas/${companyId}/usuarios`);
      revalidatePath(`/[slug]/usuarios`);
    }
    return { success: true };
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    return { success: false, message: 'Não foi possível alterar o status do usuário.' };
  }
}
