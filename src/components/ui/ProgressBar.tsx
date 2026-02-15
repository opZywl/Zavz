import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  color?: string;
}

export function ProgressBar({ value, className = '', showLabel = false, color }: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: color || 'var(--color-primary)',
          }}
        />
      </div>
      {showLabel && <div className="mt-1 text-xs text-white/60 text-right">{clampedValue}%</div>}
    </div>
  );
}
