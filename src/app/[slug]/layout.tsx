import React from 'react';
import { getUser, requireRole } from '@/lib/dal';
import { logout } from '@/app/actions/auth';
import {
  IconPlant,
  IconLayoutDashboard,
  IconUsers,
  IconReceipt2,
  IconSettings,
  IconLogout,
  IconBuildingWarehouse,
  IconUserCircle,
  IconTractor,
} from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { slug } = await params;

  // Exige autenticação como usuário de empresa
  await requireRole(['COMPANY_ADMIN', 'COMPANY_USER']);

  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // Verificação extra de segurança: o slug na URL deve bater com a empresa do usuário
  if (user.companySlug !== slug) {
    redirect('/login');
  }

  const menuItems = [
    {
      name: 'Dashboard',
      icon: <IconLayoutDashboard size={20} />,
      href: `/${slug}/dashboard`,
    },
    {
      name: 'Fazendas & Clientes',
      icon: <IconTractor size={20} />,
      href: `/${slug}/fazendas`,
    },
    {
      name: 'Vendas & Negócios',
      icon: <IconReceipt2 size={20} />,
      href: `/${slug}/vendas`,
    },
    {
      name: 'Estoque & Insumos',
      icon: <IconBuildingWarehouse size={20} />,
      href: `/${slug}/estoque`,
    },
  ];

  // Itens restritos a administradores da empresa
  const adminMenuItems =
    user.role === 'COMPANY_ADMIN'
      ? [
          {
            name: 'Usuários',
            icon: <IconUsers size={20} />,
            href: `/${slug}/usuarios`,
          },
          {
            name: 'Configurações',
            icon: <IconSettings size={20} />,
            href: `/${slug}/configuracoes`,
          },
        ]
      : [];

  const allMenuItems = [...menuItems, ...adminMenuItems];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col md:flex-row relative">
      {/* Background blurs */}
      <div className="absolute top-0 right-0 w-[40%] h-[30%] rounded-full bg-emerald-950/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[30%] rounded-full bg-amber-950/5 blur-[100px] pointer-events-none" />

      {/* SIDEBAR */}
      <aside className="w-full md:w-64 glass-panel border-r border-slate-900 flex flex-col justify-between shrink-0 z-20">
        <div className="p-6">
          {/* Logo da empresa ou logo padrão */}
          <div className="flex flex-col gap-4 mb-8">
            {user.companyLogo ? (
              <div className="space-y-3">
                <div className="h-14 w-full flex items-center justify-start rounded-xl bg-slate-950/20 border border-slate-900/60 p-2 overflow-hidden shrink-0">
                  <img
                    src={user.companyLogo}
                    alt={`Logo ${user.companyName}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0 px-1">
                  <span className="text-sm font-bold tracking-tight text-slate-100 truncate block">
                    {user.companyName}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block">
                    CRM Agrícola
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-emerald-600/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                  <IconPlant size={20} />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold tracking-tight text-slate-100 truncate block">
                    {user.companyName || 'AgroVendas'}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block">
                    CRM Agrícola
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Menu */}
          <nav className="space-y-1">
            {allMenuItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent hover:border-slate-800/40"
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-6 border-t border-slate-900 flex flex-col gap-4 bg-slate-950/20">
          {/* Plan badge */}
          {user.plan && (
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-600 uppercase tracking-wider font-bold">Plano</span>
              <span
                className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  user.plan === 'enterprise'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : user.plan === 'pro'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : user.plan === 'basic'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                }`}
              >
                {user.plan}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400">
              <IconUserCircle size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate lowercase">
                {user.role === 'COMPANY_ADMIN' ? 'administrador' : 'vendedor'}
              </p>
            </div>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-slate-900/80 hover:bg-rose-950/20 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 text-slate-400 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer"
            >
              <IconLogout size={16} />
              Sair da Conta
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 z-10 overflow-y-auto max-h-screen">
        {/* Topbar */}
        <header className="glass-panel border-b border-slate-900/40 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-100">
              {user.companyName || 'Painel Operacional'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-medium text-slate-400">Bem-vindo,</span>
              <span className="text-xs font-bold text-slate-200">{user.name}</span>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div className="text-xs px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold rounded-full">
              Safra Ativa
            </div>
          </div>
        </header>

        {/* Content body */}
        <div className="flex-1 p-6 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
