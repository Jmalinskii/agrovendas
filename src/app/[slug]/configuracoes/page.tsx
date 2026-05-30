import React from 'react';
import { getUser, requireRole } from '@/lib/dal';
import { db } from '@/db';
import { companies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { TenantSettingsForm } from '@/components/dashboard/TenantSettingsForm';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TenantSettingsPage({ params }: PageProps) {
  const { slug } = await params;

  // Apenas COMPANY_ADMIN pode acessar configurações
  await requireRole(['COMPANY_ADMIN']);

  const user = await getUser();
  if (!user || !user.companyId) {
    redirect('/login');
  }

  if (user.companySlug !== slug) {
    redirect('/login');
  }

  // Buscar dados da empresa
  const companyData = await db
    .select()
    .from(companies)
    .where(eq(companies.id, user.companyId))
    .limit(1);

  const company = companyData[0];
  if (!company) {
    redirect('/login');
  }

  return (
    <TenantSettingsForm
      company={{
        id: company.id,
        name: company.name,
        document: company.document,
        email: company.email,
        phone: company.phone,
        logoUrl: company.logoUrl,
        plan: company.plan,
        maxUsers: company.maxUsers,
      }}
      userName={user.name}
    />
  );
}
