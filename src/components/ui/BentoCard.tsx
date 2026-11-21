import React from 'react';

interface BentoCardProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  title?: string;
  overline?: string;
  action?: React.ReactNode;
  interactive?: boolean;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  id,
  className = '',
  title,
  overline,
  action,
  interactive = false,
  style,
  ariaLabel,
}) => {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-label={ariaLabel}
      className={`ds-bento-card ${interactive ? 'ds-bento-card-interactive' : ''} ${className}`}
      style={style}
    >
      {(title || overline || action) && (
        <div className="ds-card-heading">
          <div className="min-w-0">
            {overline && <p className="ds-overline">{overline}</p>}
            {title && <h2 className="ds-card-title">{title}</h2>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
};
