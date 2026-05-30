'use client';

import React, { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconMail, IconLock, IconPlant, IconTrendingUp } from '@tabler/icons-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  // Use React 19 useActionState hook with our Server Action
  const [state, formAction, isPending] = useActionState(login, undefined);

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#030712] relative overflow-hidden p-6 md:p-12 lg:p-16">
      {/* Background Image for entire screen (visible integrated texture) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.32] pointer-events-none"
        style={{ backgroundImage: 'url("/agro_meeting_bg.png")' }}
      />
      {/* Dark gradient overlay across the whole screen for supreme readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/90 pointer-events-none" />

      {/* Background glowing spheres */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-950/20 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-950/10 blur-[120px] pointer-events-none z-0" />

      {/* HEADER - Centered Logo */}
      <div className="w-full flex justify-center z-10 mb-8 md:mb-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-600/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <IconPlant size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-100">
            Agro<span className="text-emerald-500 font-semibold">Vendas</span>
          </span>
        </div>
      </div>

      {/* MAIN CONTENT - Centered content container */}
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24 z-10 my-auto py-8">
        {/* LEFT SIDE - Branding and agro aesthetic details */}
        <div className="w-full md:w-1/2 max-w-md flex flex-col justify-center space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full inline-flex items-center gap-1.5 uppercase tracking-wider w-fit">
              <IconTrendingUp size={12} /> Próxima Geração de CRM
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Cultive relacionamentos. <br />
              <span className="bg-gradient-to-r from-emerald-400 to-amber-500 bg-clip-text text-transparent">
                Colha resultados.
              </span>
            </h1>
            <p className="text-slate-400 leading-relaxed text-sm lg:text-base">
              A plataforma inteligente que integra inteligência de vendas, gestão de safra e fidelidade de clientes agrícolas. Simplifique as negociações do campo à colheita.
            </p>
          </motion.div>
        </div>

        {/* RIGHT SIDE - Form and Glass Container */}
        <div className="w-full md:w-1/2 max-w-md flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full glass-panel p-8 sm:p-10 rounded-3xl"
          >
            <div className="flex flex-col items-center mb-8 text-center md:items-start md:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                Acesse sua conta
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Bem-vindo ao AgroVendas. Por favor, insira suas credenciais.
              </p>
            </div>

            <form action={formAction} className="space-y-6">
              {state?.message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2"
                >
                  <span>⚠️</span> {state.message}
                </motion.div>
              )}

              <Input
                id="email"
                name="email"
                type="email"
                label="Endereço de E-mail"
                placeholder="seu-email@provedor.com"
                icon={<IconMail size={18} />}
                error={state?.errors?.email}
                autoComplete="email"
                required
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Senha de Acesso"
                placeholder="••••••••"
                icon={<IconLock size={18} />}
                error={state?.errors?.password}
                autoComplete="current-password"
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded bg-slate-900 border-slate-800 text-emerald-600 focus:ring-0 focus:ring-offset-0"
                  />
                  Lembrar deste dispositivo
                </label>
                <a href="#" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                  Esqueceu a senha?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-base shadow-emerald-950/40"
                isLoading={isPending}
              >
                Entrar no Sistema
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* FOOTER - Centered footer */}
      <div className="w-full flex justify-center z-10 mt-8 md:mt-0">
        <p className="text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} AgroVendas CRM. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
