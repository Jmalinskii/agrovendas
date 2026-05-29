import { z } from 'zod';
import type { User, NewUser } from '../db/schema';

export const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }).trim(),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }).trim(),
});

export type FormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export interface SessionPayload {
  userId: string;
  expiresAt: Date;
  [key: string]: any;
}

export type { User, NewUser };
