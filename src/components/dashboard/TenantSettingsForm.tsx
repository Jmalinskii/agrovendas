'use client';

import React, { useState } from 'react';
import { updateCompany } from '@/app/actions/companies';
import { IconSettings, IconCheck, IconLoader, IconBuilding } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { PlanBadge } from '@/components/super-admin/PlanBadge';

interface TenantSettingsFormProps {
  company: {
    id: string;
    name: string;
    document: string;
    email: string;
    phone: string | null;
    logoUrl: string | null;
    plan: string;
    maxUsers: number;
  };
  userName: string;
}

export function TenantSettingsForm({ company, userName }: TenantSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [logoPreview, setLogoPreview] = useState(company.logoUrl || '');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setSuccess(false);
    setErrors({});

    const formData = new FormData(e.currentTarget);

    const response = await updateCompany(company.id, undefined, formData);
    if (response && !response.success) {
      setErrors(response.errors || {});
      setMessage(response.message || null);
    } else {
      setSuccess(true);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <IconSettings size={24} className="text-emerald-400" />
          Configurações da Empresa
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Atualize as informações da sua empresa no sistema AgroVendas CRM.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold rounded-2xl">
          {message}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-2xl flex items-center gap-2">
          <IconCheck size={16} /> Configurações salvas com sucesso!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Formulário */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-5 glass-panel p-6 rounded-2xl border border-slate-900">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-3">
            <IconBuilding size={14} className="text-emerald-400" />
            Dados Corporativos
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">Razão Social / Nome Fantasia</label>
            <input type="text" name="name" required defaultValue={company.name}
              className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 text-sm outline-none" />
            {errors.name && <p className="text-xs text-rose-400">{errors.name[0]}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">CNPJ</label>
            <input type="text" name="document" required defaultValue={company.document}
              className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 text-sm outline-none" />
            {errors.document && <p className="text-xs text-rose-400">{errors.document[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">E-mail Corporativo</label>
              <input type="email" name="email" required defaultValue={company.email}
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 text-sm outline-none" />
              {errors.email && <p className="text-xs text-rose-400">{errors.email[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Telefone</label>
              <input type="text" name="phone" defaultValue={company.phone || ''}
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 text-sm outline-none" />
            </div>
          </div>

          {/* Logo URL com preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">URL da Logo</label>
            <input type="text" name="logoUrl"
              value={logoPreview}
              onChange={(e) => setLogoPreview(e.target.value)}
              placeholder="https://suaempresa.com/logo.png"
              className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 font-mono text-sm outline-none" />
            <p className="text-[10px] text-slate-500">Esta logo aparecerá na barra lateral do painel para todos os usuários da empresa.</p>
            {errors.logoUrl && <p className="text-xs text-rose-400">{errors.logoUrl[0]}</p>}
            {logoPreview && (
              <div className="mt-2 flex items-center gap-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Pré-visualização:</span>
                <div className="h-10 w-10 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                  <img src={logoPreview} alt="Preview da logo" className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-900 disabled:text-slate-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 inline-flex items-center gap-2 cursor-pointer">
              {loading ? <><IconLoader className="animate-spin" size={16} />Salvando...</> : 'Salvar Configurações'}
            </button>
          </div>
        </form>

        {/* Card de Plano */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-900 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-900 pb-3">Plano Atual</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300 font-semibold">Tier:</span>
              <PlanBadge plan={company.plan} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Limite de usuários:</span>
              <span className="text-sm font-bold text-slate-300">{company.maxUsers}</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-normal pt-2 border-t border-slate-900">
              Para alterar seu plano ou aumentar o limite de usuários, entre em contato com o suporte AgroVendas.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-900 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sessão Ativa</h3>
            <p className="text-sm font-semibold text-slate-200">{userName}</p>
            <p className="text-[10px] text-slate-500">Administrador da empresa</p>
          </div>
        </div>
      </div>
    </div>
  );
}
