import React from 'react';
import { Palette, X, Check, Sliders, Droplet } from './Icons';

export interface ThemeColors {
  [key: number]: string;
}

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  setTheme: (theme: string) => void;
  themes: Record<string, ThemeColors>;
  customHex: string;
  setCustomHex: (hex: string) => void;
  isCustom: boolean;
  setIsCustom: (isCustom: boolean) => void;
  glowEnabled: boolean;
  setGlowEnabled: (v: boolean) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  setTheme,
  themes,
  customHex,
  setCustomHex,
  isCustom,
  setIsCustom,
  glowEnabled,
  setGlowEnabled,
}) => {
  if (!isOpen) return null;

  const activeColor = isCustom ? customHex : themes[currentTheme][500];

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${checked ? 'bg-[var(--accent-500)]' : 'bg-[#3f3f46]'}`}
    >
      <div
        className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${checked ? 'right-1' : 'left-1'}`}
      ></div>
    </button>
  );

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-[#0f0f11]/95 w-[550px] rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans text-white border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#141416]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-500-20)] flex items-center justify-center text-[var(--accent-500)]">
              <Palette size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Interface Customization</h2>
              <p className="text-xs text-gray-500">Personalize your injection experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors hover:bg-white/5 p-2 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Section: Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Color Presets
              </label>
              {isCustom && (
                <button
                  onClick={() => setIsCustom(false)}
                  className="text-[10px] text-[var(--accent-400)] hover:underline flex items-center gap-1"
                >
                  <Check size={10} /> Restore Preset
                </button>
              )}
            </div>

            <div className="grid grid-cols-5 gap-3">
              {Object.keys(themes).map((themeKey) => {
                const theme = themes[themeKey];
                const isActive = !isCustom && currentTheme === themeKey;
                const isGradient = themeKey === 'gradient';

                return (
                  <button
                    key={themeKey}
                    onClick={() => {
                      setTheme(themeKey);
                      setIsCustom(false);
                    }}
                    className={`
                                group relative w-full h-12 rounded-xl transition-all duration-300 flex items-center justify-center overflow-hidden
                                ${isActive ? 'ring-2 ring-[var(--accent-400)] ring-offset-2 ring-offset-[#0f0f11] scale-95' : 'hover:scale-105 border border-white/10 hover:border-white/30'}
                              `}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: isGradient
                          ? 'linear-gradient(135deg, #f43f5e, #eab308)'
                          : theme[500],
                      }}
                    />
                    {isActive && (
                      <div className="relative z-10 bg-black/20 p-1 rounded-full backdrop-blur-sm">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Custom Hue & Preview */}
          <div className="grid grid-cols-2 gap-4">
            {/* Custom Hue Input */}
            <div className="col-span-1 space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders size={12} /> Custom Hue
              </label>

              <div className="p-4 bg-[#141416] border border-white/5 rounded-xl flex flex-col items-center justify-center gap-4 relative overflow-hidden group">
                <div className="w-full h-8 rounded-lg relative overflow-hidden shadow-inner ring-1 ring-white/10">
                  {/* Rainbow Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-80" />

                  <input
                    type="color"
                    value={
                      isCustom
                        ? customHex
                        : themes[currentTheme]
                          ? themes[currentTheme][500]
                          : '#ef4444'
                    }
                    onChange={(e) => {
                      setIsCustom(true);
                      setCustomHex(e.target.value);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </div>

                <div className="flex items-center gap-2 bg-[#0a0a0c] px-3 py-1.5 rounded-lg border border-white/10 w-full">
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ background: activeColor }}
                  ></div>
                  <input
                    type="text"
                    value={activeColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                        setIsCustom(true);
                        setCustomHex(val);
                      }
                    }}
                    maxLength={7}
                    className="text-xs font-mono text-gray-300 uppercase flex-1 text-center bg-transparent focus:outline-none focus:text-white"
                  />
                  <Droplet size={12} className="text-gray-500 shrink-0" />
                </div>
              </div>
            </div>

            {/* Preview Box */}
            <div className="col-span-1 space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Live Preview
              </label>
              <div className="h-[106px] bg-[#141416] border border-white/5 rounded-xl p-4 flex flex-col justify-center items-center gap-3 relative overflow-hidden">
                {/* Background glow based on active color */}
                {glowEnabled && (
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full blur-[40px] opacity-20 pointer-events-none transition-colors duration-300"
                    style={{ background: activeColor }}
                  />
                )}

                <button
                  className={`relative px-6 py-2 rounded-lg text-xs font-bold text-white transition-all duration-300 flex items-center gap-2 ${glowEnabled ? 'shadow-lg' : ''}`}
                  style={{ backgroundColor: activeColor }}
                >
                  Active Button
                  <Check size={12} />
                </button>

                <div className="flex gap-2">
                  <div className="w-16 h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: '60%', background: activeColor }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Glow Effect Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#141416] border border-white/5 rounded-xl">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-200">Glow Effect</span>
              <span className="text-[10px] text-gray-500 mt-0.5">
                Colored shadow on buttons and main card
              </span>
            </div>
            <ToggleSwitch checked={glowEnabled} onChange={() => setGlowEnabled(!glowEnabled)} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 mt-auto border-t border-white/5 bg-[#141416] flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-500 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white hover:bg-gray-200 text-black text-xs font-bold rounded-lg transition-colors shadow-lg"
          >
            Apply Theme
          </button>
        </div>
      </div>
    </div>
  );
};
