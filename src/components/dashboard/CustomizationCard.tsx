import type { CSSProperties } from 'react';
import { Check, Gauge, Palette, Sparkles } from 'lucide-react';
import type { InterfacePreferences } from '../../types/product';
import { ACCENT_PRESETS, getAccentColor } from '../../utils/interfacePreferences';
import { BentoCard } from '../ui/BentoCard';
import { Button } from '../ui/Button';

interface CustomizationCardProps {
  preferences: InterfacePreferences;
  onCustomize: () => void;
}

export function CustomizationCard({ preferences, onCustomize }: CustomizationCardProps) {
  const accent = getAccentColor(preferences);
  const accentLabel = preferences.useCustomAccent
    ? 'Custom accent'
    : (ACCENT_PRESETS[preferences.accentKey as keyof typeof ACCENT_PRESETS]?.label ??
      'Portfolio purple');

  return (
    <BentoCard id="interface" className="area-custom" ariaLabel="Interface customization">
      <div className="ds-card-heading">
        <div>
          <p className="ds-overline">Personalization</p>
          <h2 className="ds-card-title">Interface</h2>
        </div>
        <div className="ds-icon-tile">
          <Palette aria-hidden="true" size={18} />
        </div>
      </div>

      <div
        className="ds-theme-preview"
        style={{ '--preview-accent': accent } as CSSProperties}
        aria-label="Live interface preview"
      >
        <div className="ds-preview-sidebar">
          <span className="active" />
          <span />
          <span />
        </div>
        <div className="ds-preview-content">
          <span className="ds-preview-kicker" />
          <strong>Palette.</strong>
          <div>
            <span />
            <span />
          </div>
          <span className="ds-preview-button">Preview</span>
        </div>
      </div>

      <div className="ds-preference-list">
        <div>
          <span className="ds-icon-tile ds-icon-tile-sm">
            <Sparkles size={14} />
          </span>
          <p>
            <strong>{accentLabel}</strong>
            <small>Accent · {accent.toUpperCase()}</small>
          </p>
          <span className="ds-color-dot" style={{ backgroundColor: accent }} />
        </div>
        <div>
          <span className="ds-icon-tile ds-icon-tile-sm">
            <Gauge size={14} />
          </span>
          <p>
            <strong>{preferences.density === 'compact' ? 'Compact' : 'Comfortable'}</strong>
            <small>Density · effects {preferences.effectsIntensity}%</small>
          </p>
          <Check size={15} className="ds-check" />
        </div>
      </div>

      <Button variant="secondary" size="md" onClick={onCustomize}>
        Customize interface
      </Button>
    </BentoCard>
  );
}
