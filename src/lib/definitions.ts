import { z } from 'zod';
import type { User, NewUser, Company, NewCompany } from '../db/schema';

export const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }).trim(),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }).trim(),
});

export const CompanyFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome da empresa deve ter pelo menos 3 caracteres.' }).trim(),
  slug: z.string().min(3, { message: 'O slug deve ter pelo menos 3 caracteres.' }).regex(/^[a-z0-9-]+$/, { message: 'O slug deve conter apenas letras minúsculas, números e hífens.' }).trim(),
  document: z.string().min(14, { message: 'O CNPJ deve ter pelo menos 14 caracteres.' }).trim(), // CNPJ
  email: z.string().email({ message: 'Por favor, insira um e-mail de contato válido.' }).trim(),
  phone: z.string().optional(),
  plan: z.enum(['starter', 'basic', 'pro', 'enterprise'], { message: 'Selecione um plano válido.' }),
  adminName: z.string().min(3, { message: 'O nome do administrador deve ter pelo menos 3 caracteres.' }).trim(),
  adminEmail: z.string().email({ message: 'Por favor, insira um e-mail de administrador válido.' }).trim(),
  adminPassword: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }).trim(),
});

export const UpdateCompanySchema = z.object({
  name: z.string().min(3, { message: 'O nome da empresa deve ter pelo menos 3 caracteres.' }).trim(),
  document: z.string().min(14, { message: 'O CNPJ deve ter pelo menos 14 caracteres.' }).trim(),
  email: z.string().email({ message: 'Por favor, insira um e-mail de contato válido.' }).trim(),
  phone: z.string().optional(),
  logoUrl: z.string().url({ message: 'Insira uma URL de logo válida.' }).optional().or(z.literal('')),
});

export const UserFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }).trim(),
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }).trim(),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }).trim().optional().or(z.literal('')),
  role: z.enum(['COMPANY_ADMIN', 'COMPANY_USER'], { message: 'Selecione uma função válida.' }),
});

export type FormState<T = any> =
  | {
      errors?: {
        [K in keyof T]?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export interface SessionPayload {
  userId: string;
  companyId: string | null;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_USER';
  companySlug: string | null;
  expiresAt: Date;
  [key: string]: any;
}

export type { User, NewUser, Company, NewCompany };

