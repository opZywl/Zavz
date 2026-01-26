import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';

// --- Shared Types ---
export type LogType = 'info' | 'success' | 'error' | 'warning' | 'system';

export interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: LogType;
}

export type ThemeColor = 'blue' | 'purple' | 'emerald' | 'red' | 'amber' | 'custom';
export type Tab = 'dashboard' | 'settings' | 'about';

// --- Colors & Styles ---
// Theme: Dynamic via CSS Variables
// Variables expected: --theme-primary, --theme-hover, --theme-dim

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'glass';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  size = 'md',
  className = '', 
  isLoading = false,
  ...props 
}) => {
  const baseStyles = "rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
    xl: "px-10 py-5 text-lg font-bold tracking-wide"
  };

  const variants = {
    primary: "bg-[var(--theme-primary)] hover:bg-[var(--theme-hover)] text-white shadow-[0_0_20px_var(--theme-glow)] border border-[var(--theme-primary)]/50",
    secondary: "bg-[#18181b] hover:bg-[#202025] text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:text-white",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/40",
    ghost: "bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white",
    outline: "bg-transparent border border-zinc-800 text-zinc-400 hover:text-white hover:border-[var(--theme-primary)]/50 hover:bg-[var(--theme-primary)]/5",
    glass: "bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
  };

  return (
    <button 
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin absolute" />}
      <span className={isLoading ? 'opacity-0' : 'opacity-100 flex items-center gap-2'}>{children}</span>
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, rightElement, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">{label}</label>}
      <div className="relative group">
        <input 
          className={`w-full bg-[#050508] border border-[#1F1F2E] text-zinc-200 text-sm rounded-lg px-4 py-3 outline-none focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)]/50 transition-all font-mono placeholder-zinc-700 group-hover:border-zinc-700/80 shadow-inner disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[var(--theme-primary)] transition-colors">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
};

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <div 
      className="flex items-center justify-between w-full cursor-pointer group select-none py-2 px-1 hover:bg-white/5 rounded transition-colors"
      onClick={() => onChange(!checked)}
    >
      <span className={`text-sm font-medium transition-colors ${checked ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
        {label}
      </span>
      <div className={`w-5 h-5 rounded flex items-center justify-center transition-all duration-300 shadow-sm ${checked ? 'bg-[var(--theme-primary)] text-white shadow-[0_0_10px_var(--theme-glow)]' : 'bg-[#121215] border border-zinc-800'}`}>
        {checked && <Check size={12} strokeWidth={4} />}
      </div>
    </div>
  );
};

interface ToggleSwitchProps {
    label?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}
  
export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange }) => {
    return (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChange(!checked)}>
             <div className={`w-11 h-6 rounded-full relative transition-all duration-300 ease-in-out border ${checked ? 'bg-[var(--theme-primary)]/20 border-[var(--theme-primary)]' : 'bg-[#0f0f12] border-zinc-800'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-md transition-all duration-300 ease-out ${checked ? 'left-[22px] bg-[var(--theme-light)] shadow-[0_0_8px_var(--theme-glow)]' : 'left-1 bg-zinc-600'}`} />
            </div>
            {label && <span className={`text-xs font-medium ${checked ? 'text-[var(--theme-light)]' : 'text-zinc-500'}`}>{label}</span>}
        </div>
    )
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ label, value, onChange, options, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || value;

  return (
    <div className={`flex flex-col gap-2 w-full relative z-30 ${className}`} ref={ref}>
      {label && <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-[#050508] border text-left text-zinc-200 text-sm rounded-lg px-4 py-3 outline-none transition-all duration-300 font-mono shadow-inner flex justify-between items-center group ${isOpen ? 'border-[var(--theme-primary)] ring-1 ring-[var(--theme-primary)]/50' : 'border-[#1F1F2E] hover:border-zinc-700'}`}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown size={16} className={`text-zinc-600 transition-transform duration-300 group-hover:text-zinc-400 ${isOpen ? 'rotate-180 text-[var(--theme-primary)]' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        <div className={`absolute top-full left-0 right-0 mt-2 bg-[#0c0c10] border border-[#1F1F2E] rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 transition-all duration-300 ease-out origin-top transform ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
             <div className="p-1.5 max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => {
                            onChange(opt.value);
                            setIsOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between group relative overflow-hidden ${value === opt.value ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]' : 'text-zinc-400 hover:bg-[#15151a] hover:text-zinc-200'}`}
                    >
                        <span className="relative z-10">{opt.label}</span>
                        {value === opt.value && (
                           <div className="relative z-10 p-0.5 bg-[var(--theme-primary)] rounded-full shadow-[0_0_8px_var(--theme-glow)]">
                             <Check size={10} className="text-white" strokeWidth={3} />
                           </div>
                        )}
                        {/* Hover Effect */}
                        {value !== opt.value && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                    </button>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
};

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, subtitle, children, rightAction, className = '', noPadding = false }) => {
  return (
    <div className={`bg-[#0A0A0E] border border-[#1F1F2E] rounded-xl overflow-hidden flex flex-col shadow-xl ${className}`}>
      <div className="px-6 py-4 border-b border-[#1F1F2E] flex justify-between items-center bg-[#0d0d12]">
        <div className="flex flex-col">
            {subtitle && <span className="text-[10px] font-bold text-[var(--theme-primary)] uppercase tracking-widest mb-0.5 flex items-center gap-1.5 before:content-[''] before:w-1.5 before:h-1.5 before:bg-[var(--theme-primary)] before:rounded-full">{subtitle}</span>}
            <h3 className="text-zinc-100 font-bold text-lg leading-none tracking-tight">{title}</h3>
        </div>
        {rightAction}
      </div>
      <div className={`${noPadding ? 'p-0' : 'p-6'} flex-1`}>
        {children}
      </div>
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'error' | 'info' | 'warning' | 'purple' }> = ({ children, variant = 'info' }) => {
    const styles = {
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
        error: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
        info: 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border-[var(--theme-primary)]/20 shadow-[0_0_10px_var(--theme-glow)]',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
        purple: 'bg-violet-500/10 text-violet-400 border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]'
    }
    return (
        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${styles[variant]} backdrop-blur-sm`}>
            {children}
        </span>
    )
}