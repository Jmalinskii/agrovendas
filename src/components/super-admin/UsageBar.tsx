import React from 'react';

interface UsageBarProps {
  value: number;
  max: number;
}

export function UsageBar({ value, max }: UsageBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const isFull = value >= max;
  const isWarning = value >= max * 0.8;

  let barColor = 'bg-emerald-500';
  let textColor = 'text-slate-400';

  if (isFull) {
    barColor = 'bg-rose-500 animate-pulse';
    textColor = 'text-rose-400 font-semibold';
  } else if (isWarning) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-400 font-semibold';
  }

  return (
    <div className="space-y-1.5 w-full min-w-[120px]">
      <div className="flex justify-between items-center text-xs">
        <span className={`${textColor}`}>
          {value} / {max} <span className="text-[10px] text-slate-500 uppercase">usuários</span>
        </span>
        <span className="font-bold text-slate-500">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/65">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
