import React from 'react';

export type StatusTone = 'neutral' | 'accent' | 'ok' | 'error' | 'warn';

const toneClass: Record<StatusTone, string> = {
  neutral: 'ds-badge',
  accent: 'ds-badge-accent',
  ok: 'ds-badge-ok',
  error: 'ds-badge border-red-500/25 bg-red-500/10 text-red-300',
  warn: 'ds-badge border-amber-500/25 bg-amber-500/10 text-amber-200',
};

export const StatusBadge: React.FC<{
  tone?: StatusTone;
  children: React.ReactNode;
  pulse?: boolean;
}> = ({ tone = 'neutral', children, pulse }) => (
  <span className={toneClass[tone]}>
    {pulse && (
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
    )}
    {children}
  </span>
);
