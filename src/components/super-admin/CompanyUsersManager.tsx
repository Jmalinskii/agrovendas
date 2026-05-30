'use client';

import React, { useState } from 'react';
import { createUser, toggleUserStatus } from '@/app/actions/users';
import { 
  IconUsers, 
  IconPlus, 
  IconArrowLeft, 
  IconShield, 
  IconCheck, 
  IconLoader, 
  IconToggleLeft,
  IconToggleRight,
  IconUser,
  IconLock,
  IconMail
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UsageBar } from './UsageBar';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

interface CompanyUsersManagerProps {
  company: {
    id: string;
    name: string;
    slug: string;
    maxUsers: number;
  };
  usersList: User[];
}

export function CompanyUsersManager({ company, usersList }: CompanyUsersManagerProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const userCount = usersList.length;
  const isLimitReached = userCount >= company.maxUsers;

  async function handleAddUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setSuccess(false);
    setErrors({});

    const formData = new FormData(event.currentTarget);

    try {
      const response = await createUser(company.id, undefined, formData);
      if (response && !response.success) {
        if (response.errors) {
          setErrors(response.errors);
        }
        if (response.message) {
          setMessage(response.message);
        }
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
        setShowAddForm(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setMessage('Erro ao tentar criar usuário. Tente novamente.');
      setLoading(false);
    }
  }

  async function handleToggleUser(userId: string) {
    setStatusLoadingId(userId);
    try {
      const response = await toggleUserStatus(userId, company.id);
      if (response && response.success) {
        router.refresh();
      } else {
        setMessage(response.message || 'Erro ao alterar status do usuário.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Falha de conexão.');
    } finally {
      setStatusLoadingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/super-admin/empresas"
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 hover:text-slate-100 text-slate-400 transition-all cursor-pointer"
          >
            <IconArrowLeft size={16} />
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100">Usuários de {company.name}</h2>
            <p className="text-xs text-slate-400">
              Gerencie quem acessa o painel de CRM da empresa <span className="font-mono text-emerald-400 font-bold">{company.slug}</span>.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setMessage(null);
            setErrors({});
            setSuccess(false);
          }}
          disabled={isLimitReached && !showAddForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-900 disabled:text-slate-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg cursor-pointer"
        >
          <IconPlus size={16} />
          Adicionar Usuário
        </button>
      </div>

      {isLimitReached && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-2xl">
          ⚠️ Limite máximo do plano de {company.maxUsers} usuários já foi atingido. Para cadastrar novos usuários, realize o upgrade do plano da empresa na tela de gerenciamento.
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

      {/* FORMULÁRIO DE ADIÇÃO INLINE */}
      {showAddForm && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-900 bg-slate-950/25 animate-slide-down">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <IconUser size={16} className="text-emerald-400" />
            Cadastrar Novo Usuário
          </h3>

          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Nome Completo</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Ex: Roberto Vendedor"
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2 text-slate-200 text-sm outline-none"
              />
              {errors.name && <p className="text-xs text-rose-400">{errors.name[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">E-mail (Login)</label>
              <input
                type="email"
                name="email"
                required
                placeholder="roberto@empresa.com.br"
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2 text-slate-200 text-sm outline-none"
              />
              {errors.email && <p className="text-xs text-rose-400">{errors.email[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Senha Temporária</label>
              <input
                type="password"
                name="password"
                required
                placeholder="Ex: user123"
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2 text-slate-200 text-sm outline-none"
              />
              {errors.password && <p className="text-xs text-rose-400">{errors.password[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Função no Sistema</label>
              <select
                name="role"
                required
                defaultValue="COMPANY_USER"
                className="w-full bg-slate-955 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 text-sm outline-none"
              >
                <option value="COMPANY_USER">Vendedor / Operador (Acesso restrito)</option>
                <option value="COMPANY_ADMIN">Administrador (Controle total da empresa)</option>
              </select>
              {errors.role && <p className="text-xs text-rose-400">{errors.role[0]}</p>}
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-455 border border-slate-800 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1"
              >
                {loading ? <IconLoader className="animate-spin" size={14} /> : null}
                Criar Conta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* METRICAS DE CONTRATO */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-900 bg-slate-950/10">
        <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-3">Limites de Usuário Contratados</h3>
        <UsageBar value={userCount} max={company.maxUsers} />
      </div>

      {/* TABELA DE USUARIOS */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800 bg-slate-950/40">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Usuário</th>
                <th className="py-3 px-4">Login</th>
                <th className="py-3 px-4">Função</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {usersList.map((user) => (
                <tr key={user.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="py-4 px-4 font-semibold text-slate-200">{user.name}</td>
                  <td className="py-4 px-4 font-mono text-xs text-slate-400">{user.email}</td>
                  <td className="py-4 px-4">
                    {user.role === 'COMPANY_ADMIN' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <IconShield size={10} />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                        Vendedor
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {user.isActive ? (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Ativo
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-655" />
                        Suspenso
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleUser(user.id)}
                      disabled={statusLoadingId === user.id}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 ${
                        user.isActive
                          ? 'text-rose-400 hover:text-rose-350'
                          : 'text-emerald-400 hover:text-emerald-350'
                      }`}
                    >
                      {statusLoadingId === user.id ? (
                        <IconLoader className="animate-spin" size={12} />
                      ) : user.isActive ? (
                        'Desativar'
                      ) : (
                        'Ativar'
                      )}
                    </button>
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
