'use client';

import React, { useState, useEffect } from 'react';
import { createCompany } from '@/app/actions/companies';
import { 
  IconBuilding, 
  IconUser, 
  IconLock, 
  IconArrowLeft, 
  IconCircleCheck, 
  IconLoader 
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function CompanyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});
  
  const [companyName, setCompanyName] = useState('');
  const [slug, setSlug] = useState('');

  // Auto-gerar slug a partir do nome da empresa
  useEffect(() => {
    const generatedSlug = companyName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais inválidos
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Evita múltiplos hífens seguidos
      .trim();
    setSlug(generatedSlug);
  }, [companyName]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    // Forçar o slug gerado na state
    formData.set('slug', slug);

    try {
      const response = await createCompany(undefined, formData);
      if (response && !response.success) {
        if (response.errors) {
          setErrors(response.errors);
        }
        if (response.message) {
          setMessage(response.message);
        }
        setLoading(false);
      } else {
        // Redirecionamento feito pela Server Action
        router.push('/super-admin/empresas');
      }
    } catch (error) {
      console.error(error);
      setMessage('Erro ao tentar cadastrar empresa. Verifique sua conexão.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Back button and header */}
      <div className="flex items-center gap-3">
        <Link
          href="/super-admin/empresas"
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 hover:text-slate-100 text-slate-400 transition-all cursor-pointer"
        >
          <IconArrowLeft size={16} />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">Registrar Nova Empresa</h2>
          <p className="text-xs text-slate-400">Insira as informações da empresa e do usuário administrador principal.</p>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold rounded-2xl flex items-center gap-2 animate-shake">
          <span className="h-2 w-2 bg-rose-500 rounded-full animate-ping" />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* BLOCO 1: DADOS DA EMPRESA */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-900 space-y-5 bg-slate-950/20">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
            <div className="p-1.5 bg-emerald-600/15 border border-emerald-500/25 rounded-lg text-emerald-400">
              <IconBuilding size={16} />
            </div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Dados Corporativos</h3>
          </div>

          {/* Nome da Empresa */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">Nome da Empresa</label>
            <input
              type="text"
              name="name"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex: AgroComercial Imperial Ltda"
              className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-650 text-sm outline-none transition-all"
            />
            {errors.name && <p className="text-xs text-rose-400 font-medium">{errors.name[0]}</p>}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">Slug do Tenant (Endereço da URL)</label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-slate-500 text-sm select-none font-mono">agrovendas.com.br/</span>
              <input
                type="text"
                name="slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="agrocomercial-imperial"
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl pl-[140px] pr-4 py-2.5 text-slate-200 placeholder-slate-600 font-mono text-sm outline-none transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Auto-gerado. Deve ser único e conter apenas letras minúsculas, números e hífens.</p>
            {errors.slug && <p className="text-xs text-rose-400 font-medium">{errors.slug[0]}</p>}
          </div>

          {/* CNPJ / Documento */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">CNPJ / Documento</label>
            <input
              type="text"
              name="document"
              required
              placeholder="00.000.000/0001-00"
              className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-650 text-sm outline-none transition-all"
            />
            {errors.document && <p className="text-xs text-rose-400 font-medium">{errors.document[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* E-mail de Contato */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">E-mail de Contato</label>
              <input
                type="email"
                name="email"
                required
                placeholder="contato@empresa.com.br"
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-650 text-sm outline-none transition-all"
              />
              {errors.email && <p className="text-xs text-rose-400 font-medium">{errors.email[0]}</p>}
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Telefone</label>
              <input
                type="text"
                name="phone"
                placeholder="(00) 00000-0000"
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-650 text-sm outline-none transition-all"
              />
              {errors.phone && <p className="text-xs text-rose-400 font-medium">{errors.phone[0]}</p>}
            </div>
          </div>

          {/* Plano Comercial */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">Plano Contratado</label>
            <select
              name="plan"
              required
              defaultValue="starter"
              className="w-full bg-slate-955 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 text-sm outline-none transition-all"
            >
              <option value="starter" className="bg-slate-950">Starter (Limite: 3 usuários)</option>
              <option value="basic" className="bg-slate-950">Basic (Limite: 10 usuários)</option>
              <option value="pro" className="bg-slate-950">Pro (Limite: 25 usuários)</option>
              <option value="enterprise" className="bg-slate-950">Enterprise (Limite: 100 usuários)</option>
            </select>
            {errors.plan && <p className="text-xs text-rose-400 font-medium">{errors.plan[0]}</p>}
          </div>
        </div>

        {/* BLOCO 2: DADOS DO USUÁRIO ADMINISTRADOR */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-900 space-y-5 bg-slate-950/20">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
            <div className="p-1.5 bg-emerald-600/15 border border-emerald-500/25 rounded-lg text-emerald-400">
              <IconUser size={16} />
            </div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Conta Administradora</h3>
          </div>

          {/* Nome do Admin */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">Nome Completo</label>
            <input
              type="text"
              name="adminName"
              required
              placeholder="Ex: Carlos Roberto Silva"
              className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-650 text-sm outline-none transition-all"
            />
            {errors.adminName && <p className="text-xs text-rose-400 font-medium">{errors.adminName[0]}</p>}
          </div>

          {/* E-mail do Admin */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">E-mail do Administrador (Login)</label>
            <input
              type="email"
              name="adminEmail"
              required
              placeholder="admin@empresa.com.br"
              className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-650 text-sm outline-none transition-all"
            />
            <p className="text-[10px] text-slate-500 font-medium">Este e-mail será utilizado para acessar o painel desta empresa.</p>
            {errors.adminEmail && <p className="text-xs text-rose-400 font-medium">{errors.adminEmail[0]}</p>}
          </div>

          {/* Senha do Admin */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">Senha de Acesso</label>
            <div className="relative">
              <input
                type="password"
                name="adminPassword"
                required
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-650 text-sm outline-none transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">A senha deve ter pelo menos 6 caracteres.</p>
            {errors.adminPassword && <p className="text-xs text-rose-400 font-medium">{errors.adminPassword[0]}</p>}
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col justify-end h-full">
            <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-xl flex gap-2">
              <IconCircleCheck className="text-emerald-400 shrink-0" size={16} />
              <p className="text-[11px] text-slate-400 leading-normal">
                Esta ação criará simultaneamente a empresa e a conta do administrador com a role <strong className="text-emerald-400 font-semibold">COMPANY_ADMIN</strong> vinculada.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 border-t border-slate-900 pt-6">
        <Link
          href="/super-admin/empresas"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-900 disabled:text-slate-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-950/20 inline-flex items-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <IconLoader className="animate-spin" size={18} />
              Criando Empresa...
            </>
          ) : (
            'Registrar Empresa'
          )}
        </button>
      </div>
    </form>
  );
}
