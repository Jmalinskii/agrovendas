import React from 'react';
import { getUser } from '@/lib/dal';
import { redirect } from 'next/navigation';
import { StatsCard } from '@/components/dashboard/StatsCard';
import {
  IconCurrencyDollar,
  IconUsers,
  IconPackage,
  IconFileInvoice,
  IconClock,
  IconCheck,
  IconTractor,
} from '@tabler/icons-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TenantDashboardPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // Estatísticas simuladas — serão substituídas por dados reais nas próximas fases
  const stats = [
    {
      title: 'Faturamento de Vendas',
      value: 'R$ 142.500,00',
      description: 'em relação ao mês passado',
      icon: <IconCurrencyDollar size={24} />,
      trend: { value: '12.4%', isPositive: true },
    },
    {
      title: 'Fazendas Cadastradas',
      value: '48 clientes',
      description: 'produtores registrados',
      icon: <IconTractor size={24} />,
      trend: { value: '8.1%', isPositive: true },
    },
    {
      title: 'Insumos Despachados',
      value: '94.2%',
      description: 'taxa de sucesso de entrega',
      icon: <IconPackage size={24} />,
      trend: { value: '2.5%', isPositive: true },
    },
    {
      title: 'Negociações em Aberto',
      value: '12 pendentes',
      description: 'redução nas pendências',
      icon: <IconFileInvoice size={24} />,
      trend: { value: '4.3%', isPositive: false },
    },
  ];

  const deals = [
    {
      produtor: 'Carlos Alberto Silveira',
      fazenda: 'Fazenda Sol Nascente',
      cultivo: 'Soja Premium (Fidelidade)',
      valor: 'R$ 45.000,00',
      status: 'Em Negociação',
      statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      iconStatus: <IconClock size={14} />,
    },
    {
      produtor: 'Cooperativa AgroNorte',
      fazenda: 'Polo Industrial Norte',
      cultivo: 'Fertilizantes NPK Especial',
      valor: 'R$ 78.200,00',
      status: 'Proposta Enviada',
      statusColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      iconStatus: <IconClock size={14} />,
    },
    {
      produtor: 'Mariana de Souza Santos',
      fazenda: 'Sítio Vista Alegre',
      cultivo: 'Sementes de Milho Híbrido',
      valor: 'R$ 19.300,00',
      status: 'Fechado',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      iconStatus: <IconCheck size={14} />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">
          Olá, <span className="text-emerald-400">{user.name.split(' ')[0]}</span>!
        </h2>
        <p className="text-slate-400 text-sm">
          Resumo operacional de{' '}
          <span className="text-slate-300 font-semibold">{user.companyName}</span> — vendas e insumos agrícolas.
        </p>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard
            key={idx}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Tabela de Negociações */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Negociações Recentes</h3>
            <p className="text-xs text-slate-400 mt-1">
              Status de propostas e vendas ativas no campo.
            </p>
          </div>
          <button className="text-xs font-semibold px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/30 hover:text-emerald-400 transition-all duration-200">
            Ver todas
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Produtor / Fazenda</th>
                <th className="py-3.5 px-4">Cultivo / Insumo</th>
                <th className="py-3.5 px-4 text-right">Valor estimado</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60">
              {deals.map((deal, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-900/20 transition-all duration-200 group"
                >
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-200 group-hover:text-white transition-colors duration-200">
                      {deal.produtor}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{deal.fazenda}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-300">{deal.cultivo}</td>
                  <td className="py-4 px-4 text-right font-bold text-slate-200 group-hover:text-white">
                    {deal.valor}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${deal.statusColor}`}
                      >
                        {deal.iconStatus}
                        {deal.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
