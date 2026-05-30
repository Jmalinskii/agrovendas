import React from 'react';
import { CompanyForm } from '@/components/super-admin/CompanyForm';
import { requireRole } from '@/lib/dal';

export default async function SuperAdminNewCompany() {
  // Garantir segurança
  await requireRole(['SUPER_ADMIN']);

  return (
    <div className="max-w-4xl mx-auto">
      <CompanyForm />
    </div>
  );
}
