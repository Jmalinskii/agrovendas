'use client';

import React, { useState } from 'react';
import { createUser, toggleUserStatus } from '@/app/actions/users';
import {
  IconUsers,
  IconPlus,
  IconShield,
  IconLoader,
  IconUser,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { UsageBar } from '@/components/super-admin/UsageBar';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface TenantUsersManagerProps {
  companyId: string;
  companyName: string;
  maxUsers: number;
  usersList: User[];
  isAdmin: boolean;
}

export function TenantUsersManager({
  companyId,
  companyName,
  maxUsers,
  usersList,
  isAdmin,
}: TenantUsersManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const isLimitReached = usersList.length >= maxUsers;

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setSuccess(false);
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const response = await createUser(companyId, undefined, formData);
    if (response && !response.success) {
      setErrors(response.errors || {});
      setMessage(response.message || null);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setShowForm(false);
      router.refresh();
    }
  }

  async function handleToggle(userId: string) {
    setStatusLoadingId(userId);
    const response = await toggleUserStatus(userId, companyId);
    if (!response.success) setMessage(response.message || 'Erro ao alterar status.');
    else router.refresh();
    setStatusLoadingId(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Usuários do Sistema</h2>
          <p className="text-sm text-slate-400">
            Gerencie quem acessa o CRM de <span className="font-semibold text-slate-300">{companyName}</span>.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setShowForm(!showForm); setMessage(null); setErrors({}); }}
            disabled={isLimitReached}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-900 disabled:text-slate-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg cursor-pointer"
          >
            <IconPlus size={16} />
            Adicionar Usuário
          </button>
        )}
      </div>

      {isLimitReached && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-2xl">
          ⚠️ Limite máximo de {maxUsers} usuários do seu plano foi atingido. Entre em contato para fazer upgrade.
        </div>
      )}

      {message && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold rounded-2xl">
          {message}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-2xl">
          Usuário adicionado com sucesso!
        </div>
      )}

      {/* Barra de uso */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-900">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Limite de Usuários Contratados</h3>
        <UsageBar value={usersList.length} max={maxUsers} />
      </div>

      {/* Formulário inline */}
      {showForm && isAdmin && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-900 bg-slate-950/25">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <IconUser size={16} className="text-emerald-400" />
            Novo Usuário
          </h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Nome Completo</label>
              <input type="text" name="name" required placeholder="Ex: João Silva"
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-slate-200 text-sm outline-none" />
              {errors.name && <p className="text-xs text-rose-400">{errors.name[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">E-mail</label>
              <input type="email" name="email" required placeholder="joao@empresa.com.br"
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-slate-200 text-sm outline-none" />
              {errors.email && <p className="text-xs text-rose-400">{errors.email[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Senha Temporária</label>
              <input type="password" name="password" required placeholder="••••••"
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-slate-200 text-sm outline-none" />
              {errors.password && <p className="text-xs text-rose-400">{errors.password[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Função</label>
              <select name="role" required defaultValue="COMPANY_USER"
                className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/50 rounded-xl px-4 py-2.5 text-slate-200 text-sm outline-none">
                <option value="COMPANY_USER">Vendedor / Operador</option>
                <option value="COMPANY_ADMIN">Administrador</option>
              </select>
              {errors.role && <p className="text-xs text-rose-400">{errors.role[0]}</p>}
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold rounded-xl">
                Cancelar
              </button>
              <button type="submit" disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1">
                {loading ? <IconLoader className="animate-spin" size={14} /> : null}
                Criar Conta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Função</th>
                <th className="py-3 px-4">Status</th>
                {isAdmin && <th className="py-3 px-4 text-right">Ação</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="py-4 px-4 font-semibold text-slate-200">{u.name}</td>
                  <td className="py-4 px-4 font-mono text-xs text-slate-400">{u.email}</td>
                  <td className="py-4 px-4">
                    {u.role === 'COMPANY_ADMIN' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <IconShield size={10} /> Admin
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                        Vendedor
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {u.isActive ? (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Ativo
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-600" /> Suspenso
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleToggle(u.id)}
                        disabled={statusLoadingId === u.id}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer bg-slate-900 border border-slate-800 hover:bg-slate-800 ${u.isActive ? 'text-rose-400' : 'text-emerald-400'}`}
                      >
                        {statusLoadingId === u.id ? <IconLoader className="animate-spin" size={12} /> : u.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
