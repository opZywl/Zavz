import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glassEffect?: boolean;
}

export function Card({
  children,
  className = '',
  hover = true,
  glassEffect = true,
  ...props
}: CardProps) {
  const baseClasses = 'rounded-xl p-6 transition-all duration-200';
  const glassClasses = glassEffect
    ? 'bg-white/5 backdrop-blur-md border border-white/10'
    : 'bg-[var(--color-card-bg)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={hover ? { scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' } : undefined}
      className={`${baseClasses} ${glassClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
