import React from 'react';
import { getUser, requireRole } from '@/lib/dal';
import { logout } from '@/app/actions/auth';
import { 
  IconPlant, 
  IconLayoutDashboard, 
  IconBuilding, 
  IconLogout, 
  IconUserCircle 
} from '@tabler/icons-react';
import Link from 'next/link';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Garante acesso apenas para SUPER_ADMIN
  const session = await requireRole(['SUPER_ADMIN']);
  const user = await getUser();

  if (!user) return null;

  const menuItems = [
    { name: 'Dashboard', icon: <IconLayoutDashboard size={20} />, href: '/super-admin' },
    { name: 'Empresas & Clientes', icon: <IconBuilding size={20} />, href: '/super-admin/empresas' },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col md:flex-row relative">
      {/* Background blurs */}
      <div className="absolute top-0 right-0 w-[40%] h-[30%] rounded-full bg-emerald-950/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[30%] rounded-full bg-amber-950/5 blur-[100px] pointer-events-none" />

      {/* SIDEBAR */}
      <aside className="w-full md:w-64 glass-panel border-r border-slate-900 flex flex-col justify-between shrink-0 z-20">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="p-1.5 bg-emerald-600/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <IconPlant size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-100">
              Agro<span className="text-emerald-500 font-semibold">Vendas</span>
              <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-bold -mt-0.5">SUPER ADMIN</span>
            </span>
          </div>

          {/* Menu */}
          <nav className="space-y-1.5">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-6 border-t border-slate-900 flex flex-col gap-4 bg-slate-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400">
              <IconUserCircle size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider text-[9px]">PROVEDOR</p>
            </div>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-slate-900/80 hover:bg-rose-950/20 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 text-slate-400 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer"
            >
              <IconLogout size={16} />
              Sair do Painel
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 z-10 overflow-y-auto max-h-screen">
        {/* Topbar */}
        <header className="glass-panel border-b border-slate-900/40 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-100">Portal de Controle</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold rounded-full">
              Modo Provedor
            </div>
          </div>
        </header>

        {/* Content body */}
        <div className="flex-1 p-6 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
