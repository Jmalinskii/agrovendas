'use server';

import { CompanyFormSchema, UpdateCompanySchema, type FormState } from '@/lib/definitions';
import { db } from '@/db';
import { companies, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const PLAN_USER_LIMITS = {
  starter: 3,
  basic: 10,
  pro: 25,
  enterprise: 100,
};

export async function createCompany(state: FormState, formData: FormData): Promise<FormState> {
  // 1. Validar campos
  const rawFields = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    document: formData.get('document') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string || undefined,
    plan: formData.get('plan') as string,
    adminName: formData.get('adminName') as string,
    adminEmail: formData.get('adminEmail') as string,
    adminPassword: formData.get('adminPassword') as string,
  };

  const validatedFields = CompanyFormSchema.safeParse(rawFields);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const data = validatedFields.data;

  // 2. Verificar duplicados (slug da empresa e email do administrador)
  try {
    const existingCompany = await db.select().from(companies).where(eq(companies.slug, data.slug)).limit(1);
    if (existingCompany[0]) {
      return {
        errors: { slug: ['Este slug já está em uso por outra empresa.'] },
        success: false,
      };
    }

    const existingUser = await db.select().from(users).where(eq(users.email, data.adminEmail)).limit(1);
    if (existingUser[0]) {
      return {
        errors: { adminEmail: ['Este e-mail já está em uso por outro usuário.'] },
        success: false,
      };
    }
  } catch (error) {
    console.error('Erro de conexão ao verificar duplicados:', error);
    return {
      message: 'Falha de conexão com o banco de dados. Tente novamente.',
      success: false,
    };
  }

  // 3. Executar transação de criação
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash(data.adminPassword, salt);
    const maxUsers = PLAN_USER_LIMITS[data.plan];

    await db.transaction(async (tx) => {
      // a. Criar a empresa
      const [newCompany] = await tx.insert(companies).values({
        name: data.name,
        slug: data.slug,
        document: data.document,
        email: data.email,
        phone: data.phone,
        plan: data.plan,
        maxUsers: maxUsers,
        isActive: true,
      }).returning();

      // b. Criar o administrador principal
      await tx.insert(users).values({
        companyId: newCompany.id,
        name: data.adminName,
        email: data.adminEmail,
        password: hashedAdminPassword,
        role: 'COMPANY_ADMIN',
        isActive: true,
      });
    });

  } catch (error) {
    console.error('Erro ao registrar empresa:', error);
    return {
      message: 'Erro interno ao cadastrar empresa. Certifique-se de preencher todos os dados corretamente.',
      success: false,
    };
  }

  revalidatePath('/super-admin/empresas');
  redirect('/super-admin/empresas');
}

export async function updateCompany(id: string, state: FormState, formData: FormData): Promise<FormState> {
  const rawFields = {
    name: formData.get('name') as string,
    document: formData.get('document') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string || undefined,
    logoUrl: formData.get('logoUrl') as string || undefined,
  };

  const validatedFields = UpdateCompanySchema.safeParse(rawFields);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const data = validatedFields.data;

  try {
    // Buscar o plano atual e limites para preservar, ou atualizar outros dados
    const plan = formData.get('plan') as string;
    const updateData: any = {
      name: data.name,
      document: data.document,
      email: data.email,
      phone: data.phone,
      logoUrl: data.logoUrl || null,
      updatedAt: new Date(),
    };

    // Permite atualização de plano se informada no formData
    if (plan && ['starter', 'basic', 'pro', 'enterprise'].includes(plan)) {
      updateData.plan = plan;
      updateData.maxUsers = PLAN_USER_LIMITS[plan as keyof typeof PLAN_USER_LIMITS];
    }

    await db.update(companies)
      .set(updateData)
      .where(eq(companies.id, id));

  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    return {
      message: 'Falha ao salvar alterações da empresa.',
      success: false,
    };
  }

  revalidatePath('/super-admin/empresas');
  revalidatePath(`/super-admin/empresas/${id}`);
  return { success: true };
}

export async function toggleCompanyStatus(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const data = await db.select({ isActive: companies.isActive }).from(companies).where(eq(companies.id, id)).limit(1);
    const company = data[0];

    if (!company) {
      return { success: false, message: 'Empresa não encontrada.' };
    }

    const nextStatus = !company.isActive;

    await db.update(companies)
      .set({ isActive: nextStatus, updatedAt: new Date() })
      .where(eq(companies.id, id));

    revalidatePath('/super-admin/empresas');
    revalidatePath(`/super-admin/empresas/${id}`);
    revalidatePath('/super-admin');
    return { success: true };
  } catch (error) {
    console.error('Erro ao alterar status da empresa:', error);
    return { success: false, message: 'Não foi possível alterar o status da empresa.' };
  }
}
