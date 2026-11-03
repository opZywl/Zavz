import { useEffect } from 'react';
import { ArrowUpRight, Sparkles, X } from 'lucide-react';
import { ZavzLogo } from './Icons';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/StatusBadge';
import { openExternal } from '../utils/openExternal';
import { URLRegistry } from '../utils/urlRegistry';

interface UpdateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
}

export function UpdateAlertModal({ isOpen, onClose, version }: UpdateAlertModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="ds-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="ds-modal ds-update-alert-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-alert-title"
      >
        <header className="ds-modal-header">
          <div>
            <p className="ds-overline">Release channel</p>
            <h2 id="update-alert-title">Update available</h2>
          </div>
          <button className="ds-icon-button" onClick={onClose} aria-label="Close update alert">
            <X size={16} />
          </button>
        </header>

        <div className="ds-update-alert-body">
          <div className="ds-update-alert-logo">
            <ZavzLogo />
          </div>
          <StatusBadge tone="accent">
            <Sparkles size={12} /> {version}
          </StatusBadge>
          <h3>A newer ZAVZ release is ready.</h3>
          <p>Open the verified GitHub release page to review changes before installing.</p>
        </div>

        <footer className="ds-modal-footer">
          <span />
          <div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Later
            </Button>
            <Button
              size="sm"
              icon={<ArrowUpRight size={14} />}
              onClick={() => {
                void openExternal(URLRegistry.GITHUB);
                onClose();
              }}
            >
              Open releases
            </Button>
          </div>
        </footer>
      </section>
    </div>
  );
}
