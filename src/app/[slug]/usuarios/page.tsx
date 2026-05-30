import React from 'react';
import { getUser, requireRole } from '@/lib/dal';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { TenantUsersManager } from '@/components/dashboard/TenantUsersManager';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TenantUsersPage({ params }: PageProps) {
  const { slug } = await params;

  // Apenas COMPANY_ADMIN pode acessar esta página
  await requireRole(['COMPANY_ADMIN']);

  const user = await getUser();
  if (!user || !user.companyId) {
    redirect('/login');
  }

  // Garantia extra de segurança: slug da URL deve bater com a empresa do usuário
  if (user.companySlug !== slug) {
    redirect('/login');
  }

  // Buscar todos os usuários da empresa
  const usersList = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.companyId, user.companyId))
    .orderBy(users.createdAt);

  return (
    <TenantUsersManager
      companyId={user.companyId}
      companyName={user.companyName || 'sua empresa'}
      maxUsers={user.maxUsers || 3}
      usersList={usersList}
      isAdmin={user.role === 'COMPANY_ADMIN'}
    />
  );
}
