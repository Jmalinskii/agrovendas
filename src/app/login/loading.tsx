import React from 'react';

export default function LoginLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#030712]">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse">
          Carregando AgroVendas...
        </p>
      </div>
    </div>
  );
}
