import React from 'react';
import { db } from '@/db';
import { companies, users } from '@/db/schema';
import { eq, ne } from 'drizzle-orm';
import { requireRole } from '@/lib/dal';
import { redirect } from 'next/navigation';
import { CompanyUsersManager } from '@/components/super-admin/CompanyUsersManager';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SuperAdminCompanyUsersPage({ params }: PageProps) {
  await requireRole(['SUPER_ADMIN']);

  const { id } = await params;

  // Buscar empresa
  const companyData = await db
    .select()
    .from(companies)
    .where(eq(companies.id, id))
    .limit(1);

  const company = companyData[0];
  if (!company) {
    redirect('/super-admin/empresas');
  }

  // Buscar usuários da empresa (excluindo SUPER_ADMIN)
  const usersList = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.companyId, id))
    .orderBy(users.createdAt);

  return (
    <CompanyUsersManager
      company={{
        id: company.id,
        name: company.name,
        slug: company.slug,
        maxUsers: company.maxUsers,
      }}
      usersList={usersList}
    />
  );
}
