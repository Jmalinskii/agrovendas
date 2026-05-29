import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string[];
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}: InputProps) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-slate-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`w-full bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 transition-all duration-200 text-sm ${
            icon ? 'pl-11' : 'pl-4.5'
          } pr-4.5 py-3 ${error ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && error.length > 0 && (
        <span className="text-xs text-rose-400 font-medium mt-0.5">
          {error[0]}
        </span>
      )}
    </div>
  );
}
