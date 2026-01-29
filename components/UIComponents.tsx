
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Search, X } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "Search...", className }) => {
  return (
    <div className={cn("relative w-full", className)}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-3.5 w-3.5 text-slate-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full h-11 pl-9 pr-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-[13px] font-black text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue transition-all uppercase italic"
        placeholder={placeholder}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 active-scale"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'gold' | 'neon' | 'electric';
  size?: 'sm' | 'md' | 'lg';
}

export const Button3D: React.FC<Button3DProps> = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    electric: "bg-brand-blue text-white shadow-highlight",
    secondary: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200",
    danger: "bg-rose-500 text-white",
    success: "bg-emerald-500 text-white",
    gold: "bg-brand-orange text-white shadow-orange",
    neon: "bg-cyan-500 text-white",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-[9px] rounded-lg tracking-wider uppercase h-9",
    md: "px-5 py-2.5 text-[10px] rounded-xl tracking-wider uppercase h-12",
    lg: "px-7 py-3.5 text-[11px] rounded-2xl tracking-widest uppercase h-14",
  };

  return (
    <button
      className={cn(
        "relative transition-all duration-200 active:scale-[0.96] flex items-center justify-center disabled:opacity-50 disabled:grayscale font-black",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={cn("bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden transition-all duration-300 shadow-premium", className)}
    >
      {children}
    </div>
  );
};

export const Input3D: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <input 
      className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue transition-all text-[13px] font-black shadow-sm"
      {...props} 
    />
  );
};
