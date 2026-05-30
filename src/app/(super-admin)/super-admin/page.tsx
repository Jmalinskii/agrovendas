import React from 'react';
import { db } from '@/db';
import { companies, users } from '@/db/schema';
import { eq, sql, ne } from 'drizzle-orm';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { 
  IconBuilding, 
  IconCircleCheck, 
  IconAlertTriangle, 
  IconUsers, 
  IconPlus, 
  IconBuildingWarehouse 
} from '@tabler/icons-react';
import Link from 'next/link';

export const revalidate = 0; // Evita cache agressivo no dashboard de admin

export default async function SuperAdminDashboard() {
  // 1. Buscar métricas do banco de dados
  const [companiesCountRes] = await db.select({ count: sql<number>`count(*)` }).from(companies);
  const totalCompanies = Number(companiesCountRes?.count || 0);

  const [activeCountRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(companies)
    .where(eq(companies.isActive, true));
  const activeCompanies = Number(activeCountRes?.count || 0);

  const blockedCompanies = totalCompanies - activeCompanies;

  const [usersCountRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(ne(users.role, 'SUPER_ADMIN'));
  const totalUsers = Number(usersCountRes?.count || 0);

  // 2. Buscar últimas 5 empresas cadastradas
  const recentCompanies = await db
    .select()
    .from(companies)
    .orderBy(sql`${companies.createdAt} DESC`)
    .limit(5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Visão Geral da Plataforma</h2>
          <p className="text-sm text-slate-400">Acompanhe a saúde das empresas clientes e o crescimento da plataforma.</p>
        </div>
        <Link
          href="/super-admin/empresas/nova"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-950/20 cursor-pointer"
        >
          <IconPlus size={18} />
          Cadastrar Empresa
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Empresas"
          value={String(totalCompanies)}
          description="Empresas registradas"
          icon={<IconBuilding size={20} />}
        />
        <StatsCard
          title="Empresas Ativas"
          value={String(activeCompanies)}
          description="Operando normalmente"
          icon={<IconCircleCheck className="text-emerald-400" size={20} />}
        />
        <StatsCard
          title="Empresas Suspensas"
          value={String(blockedCompanies)}
          description="Inadimplentes ou bloqueadas"
          icon={<IconAlertTriangle className={blockedCompanies > 0 ? "text-amber-400" : "text-slate-500"} size={20} />}
        />
        <StatsCard
          title="Usuários Ativos"
          value={String(totalUsers)}
          description="Vendedores e admins clientes"
          icon={<IconUsers size={20} />}
        />
      </div>

      {/* Bottom Layout - Recent Activity & Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recentes */}
        <div className="xl:col-span-2 glass-panel p-6 rounded-2xl border border-slate-900">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-md font-bold text-slate-200">Empresas Recém-Cadastradas</h3>
            <Link href="/super-admin/empresas" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-all">
              Ver Todas →
            </Link>
          </div>

          {recentCompanies.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Nenhuma empresa cadastrada no sistema até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800 bg-slate-950/40">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">Empresa</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Plano</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 rounded-r-xl text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 bg-slate-950/10">
                  {recentCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-4 font-semibold text-slate-200">{company.name}</td>
                      <td className="py-4 px-4 font-mono text-xs text-slate-400">{company.slug}</td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          company.plan === 'enterprise'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : company.plan === 'pro'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : company.plan === 'basic'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {company.plan}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {company.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Ativa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                            Suspensa
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/super-admin/empresas/${company.id}`}
                          className="text-xs font-bold text-slate-400 hover:text-emerald-400 bg-slate-900 hover:bg-slate-800 border border-slate-850 px-3 py-1.5 rounded-xl transition-all"
                        >
                          Gerenciar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-slate-200 mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <Link
                href="/super-admin/empresas/nova"
                className="flex items-center gap-3 p-3.5 bg-slate-950/40 hover:bg-emerald-950/15 border border-slate-900 hover:border-emerald-500/20 rounded-xl transition-all duration-200 text-slate-300 hover:text-emerald-300 group"
              >
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all">
                  <IconPlus size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Nova Empresa</h4>
                  <p className="text-xs text-slate-500">Registrar e criar primeiro admin.</p>
                </div>
              </Link>

              <Link
                href="/super-admin/empresas"
                className="flex items-center gap-3 p-3.5 bg-slate-950/40 hover:bg-slate-900/60 border border-slate-900 hover:border-slate-800 rounded-xl transition-all duration-200 text-slate-300 hover:text-slate-200 group"
              >
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 group-hover:text-slate-300 transition-all">
                  <IconBuildingWarehouse size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Ver Todas as Empresas</h4>
                  <p className="text-xs text-slate-500">Mudar planos, ver usuários e faturamento.</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 mt-6 bg-slate-950/20 rounded-xl p-3 text-center border border-slate-900">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block mb-1">Status do Sistema</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              Operacional (Neon DB)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
