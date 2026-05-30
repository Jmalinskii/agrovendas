import React from 'react';
import { db } from '@/db';
import { companies, users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { PlanBadge } from '@/components/super-admin/PlanBadge';
import { UsageBar } from '@/components/super-admin/UsageBar';
import { 
  IconPlus, 
  IconBuilding, 
  IconUsers, 
  IconMail, 
  IconPhone, 
  IconExternalLink 
} from '@tabler/icons-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function SuperAdminCompanies() {
  // Buscar todas as empresas + contagem de usuários agregada
  const companyList = await db
    .select({
      id: companies.id,
      name: companies.name,
      slug: companies.slug,
      email: companies.email,
      phone: companies.phone,
      plan: companies.plan,
      maxUsers: companies.maxUsers,
      isActive: companies.isActive,
      createdAt: companies.createdAt,
      userCount: sql<number>`count(${users.id})::int`,
    })
    .from(companies)
    .leftJoin(users, eq(companies.id, users.companyId))
    .groupBy(companies.id)
    .orderBy(sql`${companies.createdAt} DESC`);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Gerenciar Empresas</h2>
          <p className="text-sm text-slate-400">Gerencie planos, status de pagamento, limites e usuários das empresas do CRM.</p>
        </div>
        <Link
          href="/super-admin/empresas/nova"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-950/20 cursor-pointer"
        >
          <IconPlus size={18} />
          Registrar Empresa
        </Link>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-900">
        {companyList.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            <IconBuilding className="mx-auto mb-3 text-slate-600" size={36} />
            Nenhuma empresa registrada ainda. Comece registrando a primeira!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800 bg-slate-950/40">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Empresa</th>
                  <th className="py-3 px-4">Contatos</th>
                  <th className="py-3 px-4">Plano</th>
                  <th className="py-3 px-4">Usuários Contratados</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {companyList.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-900/30 transition-colors">
                    {/* Empresa Column */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-200 text-base">{company.name}</div>
                      <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        slug: <span className="text-emerald-400 font-bold">{company.slug}</span>
                      </div>
                    </td>

                    {/* Contatos Column */}
                    <td className="py-4 px-4 space-y-1">
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <IconMail size={14} className="text-slate-500" />
                        {company.email}
                      </div>
                      {company.phone && (
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <IconPhone size={14} className="text-slate-500" />
                          {company.phone}
                        </div>
                      )}
                    </td>

                    {/* Plano Column */}
                    <td className="py-4 px-4">
                      <PlanBadge plan={company.plan} />
                    </td>

                    {/* Usuários Column */}
                    <td className="py-4 px-4">
                      <UsageBar value={company.userCount} max={company.maxUsers} />
                    </td>

                    {/* Status Column */}
                    <td className="py-4 px-4">
                      {company.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Ativa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                          Suspensa
                        </span>
                      )}
                    </td>

                    {/* Ações Column */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <Link
                          href={`/super-admin/empresas/${company.id}/usuarios`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition-all"
                        >
                          <IconUsers size={14} />
                          Usuários
                        </Link>
                        <Link
                          href={`/super-admin/empresas/${company.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-emerald-400 bg-slate-900 hover:bg-emerald-950/10 border border-slate-800 hover:border-emerald-500/20 px-3 py-1.5 rounded-xl transition-all"
                        >
                          Gerenciar
                          <IconExternalLink size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
