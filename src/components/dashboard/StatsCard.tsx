'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between h-full transition-all duration-300 relative overflow-hidden group"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-500 pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        <div className="p-3 bg-slate-900/80 text-emerald-400 rounded-xl border border-slate-800/80 group-hover:border-emerald-500/20 group-hover:bg-emerald-950/20 group-hover:text-emerald-300 transition-all duration-300">
          {icon}
        </div>
      </div>

      <div>
        <h3 className="text-3xl font-bold text-slate-100 tracking-tight mb-1 group-hover:text-white transition-colors duration-300">
          {value}
        </h3>
        
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                trend.isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
          {description && (
            <span className="text-xs text-slate-400/80 font-medium">
              {description}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
