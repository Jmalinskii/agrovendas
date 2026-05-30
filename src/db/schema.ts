import { pgTable, uuid, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  document: text('document').notNull(), // CNPJ
  email: text('email').notNull(),
  phone: text('phone'),
  logoUrl: text('logo_url'),
  plan: text('plan').notNull().default('starter'), // 'starter' | 'basic' | 'pro' | 'enterprise'
  maxUsers: integer('max_users').notNull().default(3),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }), // NULL = SUPER_ADMIN
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // bcrypt hash
  role: text('role').notNull().default('COMPANY_USER'), // 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_USER'
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

