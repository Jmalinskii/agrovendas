import React from 'react';
import { db } from '@/db';
import { companies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CompanyEditForm } from '@/components/super-admin/CompanyEditForm';
import { requireRole } from '@/lib/dal';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SuperAdminEditCompanyPage({ params }: PageProps) {
  await requireRole(['SUPER_ADMIN']);

  const { id } = await params;

  const data = await db
    .select()
    .from(companies)
    .where(eq(companies.id, id))
    .limit(1);

  const company = data[0];

  if (!company) {
    redirect('/super-admin/empresas');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <CompanyEditForm company={company} />
    </div>
  );
}
