import React from 'react';

interface PlanBadgeProps {
  plan: 'starter' | 'basic' | 'pro' | 'enterprise' | string;
}

export function PlanBadge({ plan }: PlanBadgeProps) {
  const planSlug = plan.toLowerCase();

  let styles = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  let displayName = 'Starter';

  if (planSlug === 'basic') {
    styles = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    displayName = 'Basic';
  } else if (planSlug === 'pro') {
    styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    displayName = 'Pro';
  } else if (planSlug === 'enterprise') {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.05)]';
    displayName = 'Enterprise';
  }

  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${styles}`}>
      {displayName}
    </span>
  );
}
