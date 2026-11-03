import type { InterfacePreferences } from '../types/product';

export const INTERFACE_PREFERENCES_KEY = 'zavz-interface-preferences-v2';

export const ACCENT_PRESETS = {
  mono: { label: 'Portfolio monochrome', value: '#f8f8fa' },
} as const;

export const DEFAULT_INTERFACE_PREFERENCES: InterfacePreferences = {
  appearance: 'ink',
  accentKey: 'mono',
  customAccent: '#f8f8fa',
  useCustomAccent: false,
  animations: true,
  effectsIntensity: 20,
  density: 'compact',
};

export function isHexColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}

export function getAccentColor(preferences: InterfacePreferences): string {
  void preferences;
  return ACCENT_PRESETS.mono.value;
}

export function loadInterfacePreferences(): InterfacePreferences {
  try {
    const value = localStorage.getItem(INTERFACE_PREFERENCES_KEY);
    if (!value) return DEFAULT_INTERFACE_PREFERENCES;
    const parsed = JSON.parse(value) as Partial<InterfacePreferences>;
    return {
      appearance: 'ink',
      accentKey:
        typeof parsed.accentKey === 'string' && parsed.accentKey in ACCENT_PRESETS
          ? parsed.accentKey
          : DEFAULT_INTERFACE_PREFERENCES.accentKey,
      customAccent:
        typeof parsed.customAccent === 'string' && isHexColor(parsed.customAccent)
          ? parsed.customAccent
          : DEFAULT_INTERFACE_PREFERENCES.customAccent,
      useCustomAccent: parsed.useCustomAccent === true,
      animations: parsed.animations !== false,
      effectsIntensity:
        typeof parsed.effectsIntensity === 'number'
          ? Math.min(100, Math.max(0, parsed.effectsIntensity))
          : DEFAULT_INTERFACE_PREFERENCES.effectsIntensity,
      density: parsed.density === 'comfortable' ? 'comfortable' : 'compact',
    };
  } catch {
    return DEFAULT_INTERFACE_PREFERENCES;
  }
}

export function saveInterfacePreferences(preferences: InterfacePreferences): void {
  localStorage.setItem(INTERFACE_PREFERENCES_KEY, JSON.stringify(preferences));
}
