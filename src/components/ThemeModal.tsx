import { useEffect, useState } from 'react';
import { Check, Gauge, Monitor, RotateCcw, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import type { InterfacePreferences } from '../types/product';
import { DEFAULT_INTERFACE_PREFERENCES } from '../utils/interfacePreferences';
import { Button } from './ui/Button';

interface ThemeModalProps {
  isOpen: boolean;
  value: InterfacePreferences;
  onClose: () => void;
  onPreview: (value: InterfacePreferences) => void;
  onSave: (value: InterfacePreferences) => void;
}

export function ThemeModal({ isOpen, value, onClose, onPreview, onSave }: ThemeModalProps) {
  const [draft, setDraft] = useState<InterfacePreferences>(value);

  useEffect(() => {
    if (isOpen) setDraft(value);
  }, [isOpen, value]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      onPreview(value);
      onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPreview, value]);

  if (!isOpen) return null;

  const updateDraft = (next: InterfacePreferences) => {
    const portfolioDraft = {
      ...next,
      appearance: 'ink' as const,
      accentKey: 'mono',
      customAccent: '#f8f8fa',
      useCustomAccent: false,
    };
    setDraft(portfolioDraft);
    onPreview(portfolioDraft);
  };
  const patchDraft = (patch: Partial<InterfacePreferences>) => updateDraft({ ...draft, ...patch });
  const cancel = () => {
    onPreview(value);
    onClose();
  };

  return (
    <div className="ds-modal-backdrop" role="presentation" onMouseDown={cancel}>
      <div
        className="ds-modal ds-customization-modal ds-monochrome-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="interface-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="ds-modal-header">
          <div className="ds-title-with-icon">
            <SlidersHorizontal size={18} />
            <div>
              <p className="ds-overline">Portfolio system</p>
              <h2 id="interface-title">Customize interface</h2>
            </div>
          </div>
          <button type="button" className="ds-icon-button" onClick={cancel} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="ds-customization-body">
          <section className="ds-settings-section">
            <div className="ds-settings-section-title">
              <Monitor size={15} />
              <div>
                <strong>Portfolio dark</strong>
                <span>The application always uses the portfolio surface palette.</span>
              </div>
            </div>
            <div className="ds-segmented" aria-label="Active dark appearance">
              <button type="button" className="active" aria-pressed="true">
                <span className="ds-appearance-swatch ink" />
                <span>
                  <strong>Portfolio ink</strong>
                  <small>Graphite surface with neutral depth</small>
                </span>
                <Check size={14} />
              </button>
            </div>
          </section>

          <section className="ds-settings-section ds-settings-controls">
            <div className="ds-control-row">
              <div className="ds-settings-section-title">
                <Sparkles size={15} />
                <div>
                  <strong>Microinteractions</strong>
                  <span>Short transitions and loading feedback.</span>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={draft.animations}
                className={`ds-switch ${draft.animations ? 'active' : ''}`}
                onClick={() => patchDraft({ animations: !draft.animations })}
              >
                <span />
              </button>
            </div>

            <label className="ds-range-row">
              <span>
                <Gauge size={15} />
                <span>
                  <strong>Surface depth</strong>
                  <small>Controls neutral shadow and texture.</small>
                </span>
              </span>
              <output>{draft.effectsIntensity}%</output>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={Math.min(50, draft.effectsIntensity)}
                onChange={(event) => patchDraft({ effectsIntensity: Number(event.target.value) })}
              />
            </label>

            <div className="ds-density-row">
              <div>
                <strong>Interface density</strong>
                <span>Compact is optimized for the desktop window.</span>
              </div>
              <div className="ds-mini-segmented">
                {(['compact', 'comfortable'] as const).map((density) => (
                  <button
                    key={density}
                    type="button"
                    className={draft.density === density ? 'active' : ''}
                    onClick={() => patchDraft({ density })}
                  >
                    {density === 'compact' ? 'Compact' : 'Comfortable'}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section
            className="ds-live-preview ds-monochrome-preview"
            aria-label="Monochrome palette"
          >
            <div>
              <span className="ds-overline">Palette</span>
              <strong>Black. Graphite. White.</strong>
              <p>The visual identity remains fully dark with white reserved for active elements.</p>
            </div>
            <div className="ds-neutral-swatches" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
          </section>
        </div>

        <footer className="ds-modal-footer">
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw size={14} />}
            onClick={() => updateDraft(DEFAULT_INTERFACE_PREFERENCES)}
          >
            Restore defaults
          </Button>
          <div>
            <Button variant="secondary" size="md" onClick={cancel}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={() => onSave(draft)}>
              Save changes
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
