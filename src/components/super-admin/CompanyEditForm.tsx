'use client';

import React, { useState } from 'react';
import { updateCompany, toggleCompanyStatus } from '@/app/actions/companies';
import { 
  IconBuilding, 
  IconArrowLeft, 
  IconShield, 
  IconCheck, 
  IconAlertTriangle, 
  IconLoader, 
  IconUsers 
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CompanyEditFormProps {
  company: {
    id: string;
    name: string;
    slug: string;
    document: string;
    email: string;
    phone: string | null;
    logoUrl: string | null;
    plan: string;
    maxUsers: number;
    isActive: boolean;
  };
}

export function CompanyEditForm({ company }: CompanyEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<any>({});
  
  const [isActive, setIsActive] = useState(company.isActive);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setSuccess(false);
    setErrors({});

    const formData = new FormData(event.currentTarget);

    try {
      const response = await updateCompany(company.id, undefined, formData);
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
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setMessage('Erro ao tentar salvar alterações. Tente novamente.');
      setLoading(false);
    }
  }

  async function handleToggleStatus() {
    setStatusLoading(true);
    setMessage(null);
    setSuccess(false);

    try {
      const response = await toggleCompanyStatus(company.id);
      if (response && response.success) {
        setIsActive(!isActive);
        router.refresh();
      } else {
        setMessage(response.message || 'Erro ao alterar status da empresa.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Falha ao tentar executar alteração de status.');
    } finally {
      setStatusLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
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
            <h2 className="text-xl font-bold tracking-tight text-slate-100">{company.name}</h2>
            <p className="text-xs text-slate-400 font-mono">
              Slug da URL: <span className="text-emerald-400 font-semibold">{company.slug}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/super-admin/empresas/${company.id}/usuarios`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-355 border border-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <IconUsers size={16} />
            Gerenciar Usuários ({company.maxUsers} max)
          </Link>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold rounded-2xl flex items-center gap-2">
          <span className="h-2 w-2 bg-rose-500 rounded-full animate-ping" />
          {message}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-2xl flex items-center gap-2">
          <IconCheck size={18} />
          Alterações salvas com sucesso!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FORMULÁRIO DE EDIÇÃO */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-900 space-y-5 bg-slate-950/20">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
              <IconBuilding size={16} className="text-emerald-400" />
              Editar Dados Gerais
            </h3>

            {/* Nome da Empresa */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Razão Social / Nome Fantasia</label>
              <input
                type="text"
                name="name"
                required
                defaultValue={company.name}
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 text-sm outline-none transition-all"
              />
              {errors.name && <p className="text-xs text-rose-400 font-medium">{errors.name[0]}</p>}
            </div>

            {/* CNPJ / Documento */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">CNPJ</label>
              <input
                type="text"
                name="document"
                required
                defaultValue={company.document}
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 text-sm outline-none transition-all"
              />
              {errors.document && <p className="text-xs text-rose-400 font-medium">{errors.document[0]}</p>}
            </div>

            {/* Logo URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">URL da Logo da Empresa</label>
              <input
                type="text"
                name="logoUrl"
                defaultValue={company.logoUrl || ''}
                placeholder="Ex: https://image.com/logo.png"
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 text-sm outline-none transition-all font-mono"
              />
              {errors.logoUrl && <p className="text-xs text-rose-400 font-medium">{errors.logoUrl[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* E-mail */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 block">E-mail Corporativo</label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={company.email}
                  className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 text-sm outline-none transition-all"
                />
                {errors.email && <p className="text-xs text-rose-400 font-medium">{errors.email[0]}</p>}
              </div>

              {/* Telefone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 block">Telefone Comercial</label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={company.phone || ''}
                  className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 text-sm outline-none transition-all"
                />
                {errors.phone && <p className="text-xs text-rose-400 font-medium">{errors.phone[0]}</p>}
              </div>
            </div>

            {/* Plano */}
            <div className="space-y-1.5 border-t border-slate-900 pt-4">
              <label className="text-xs font-semibold text-slate-400 block">Plano Atual</label>
              <select
                name="plan"
                required
                defaultValue={company.plan}
                className="w-full bg-slate-955 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 text-sm outline-none transition-all"
              >
                <option value="starter">Starter (Limite: 3 usuários)</option>
                <option value="basic">Basic (Limite: 10 usuários)</option>
                <option value="pro">Pro (Limite: 25 usuários)</option>
                <option value="enterprise">Enterprise (Limite: 100 usuários)</option>
              </select>
              {errors.plan && <p className="text-xs text-rose-400 font-medium">{errors.plan[0]}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-900 disabled:text-slate-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-950/20 inline-flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <IconLoader className="animate-spin" size={18} />
                  Salvando Alterações...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </form>

        {/* PAINEL DE CONTROLE LATERAL: PLANO & BLOQUEIO */}
        <div className="space-y-6">
          {/* CARD DE STATUS */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-900 space-y-4 bg-slate-950/20">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-3">
              <IconShield size={16} className="text-amber-400" />
              Controle de Status
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Acesso Geral:</span>
                {isActive ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Ativo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 animate-pulse">
                    Bloqueado
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 leading-normal">
                Ao bloquear esta empresa, todos os seus usuários vinculados perderão acesso imediato ao sistema com a mensagem de suspensão.
              </p>

              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={statusLoading}
                className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl border transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 border-rose-500/20'
                    : 'bg-emerald-950/20 hover:bg-emerald-900/40 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {statusLoading ? (
                  <IconLoader className="animate-spin" size={14} />
                ) : isActive ? (
                  <>
                    <IconAlertTriangle size={14} />
                    Bloquear Empresa
                  </>
                ) : (
                  <>
                    <IconCheck size={14} />
                    Reativar Empresa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
