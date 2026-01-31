import React from 'react';
import { Settings, Palette, Edit3, Zap, Monitor, X, Coffee, Share2, EyeOff, Play } from 'lucide-react';
import { ToggleSwitch, Input, ThemeColor, Button } from './ui';

interface SettingsCardProps {
  theme: ThemeColor;
  setTheme: (t: ThemeColor) => void;
  customColor: string;
  setCustomColor: (c: string) => void;
  DEFAULT_THEMES: Record<string, any>;
  autoClose: boolean;
  setAutoClose: (v: boolean) => void;
  jvmArgs: string;
  setJvmArgs: (v: string) => void;
  discordRpc: boolean;
  setDiscordRpc: (v: boolean) => void;
  streamerMode: boolean;
  setStreamerMode: (v: boolean) => void;
  onLaunchJvm?: () => void;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  theme,
  setTheme,
  customColor,
  setCustomColor,
  DEFAULT_THEMES,
  autoClose,
  setAutoClose,
  jvmArgs,
  setJvmArgs,
  discordRpc,
  setDiscordRpc,
  streamerMode,
  setStreamerMode,
  onLaunchJvm
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-[fade-in-up_0.3s_ease-out]">
        
        <div className="flex items-center gap-3 pb-4 border-b border-[#1F1F2E]">
            <Settings size={24} className="text-[var(--theme-primary)]" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Control Panel</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theme & Interface */}
            <div className="bg-[#0A0A0E] rounded-2xl border border-[#1F1F2E] p-6 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <Palette className="text-[var(--theme-primary)]" size={20} />
                    <h3 className="text-lg font-bold text-zinc-100">Interface Visualization</h3>
                </div>
                
                <div className="grid grid-cols-6 gap-3">
                    {(Object.keys(DEFAULT_THEMES) as ThemeColor[]).map((c) => (
                        <button 
                            key={c}
                            onClick={() => setTheme(c)}
                            className={`aspect-square rounded-xl border transition-all flex items-center justify-center relative group overflow-hidden ${theme === c ? 'border-white ring-2 ring-[var(--theme-primary)]/50' : 'border-[#1F1F2E] hover:border-zinc-500'}`}
                            style={{ backgroundColor: '#050508' }}
                        >
                            <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity" style={{ backgroundColor: DEFAULT_THEMES[c].primary }}></div>
                            {theme === c && <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white] relative z-10"></div>}
                        </button>
                    ))}
                    
                    {/* Custom Picker */}
                    <div className="relative col-span-1">
                        <button 
                            onClick={() => setTheme('custom')}
                            className={`w-full h-full aspect-square rounded-xl border transition-all flex items-center justify-center relative overflow-hidden group ${theme === 'custom' ? 'border-white ring-2 ring-white/50' : 'border-[#1F1F2E] hover:border-zinc-500'}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                            <input 
                                type="color" 
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                value={customColor}
                                onChange={(e) => {
                                    setCustomColor(e.target.value);
                                    setTheme('custom');
                                }}
                            />
                            <Edit3 size={16} className="text-white relative z-10 pointer-events-none" />
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-[#121215] rounded-xl border border-[#1F1F2E] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--theme-primary)]/20 flex items-center justify-center text-[var(--theme-primary)]">
                            <Zap size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-zinc-200">Current Palette</p>
                            <p className="text-xs text-zinc-500 font-mono">{theme === 'custom' ? customColor.toUpperCase() : DEFAULT_THEMES[theme].primary.toUpperCase()}</p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div className="w-8 h-8 rounded bg-[var(--theme-primary)] shadow-lg"></div>
                        <div className="w-8 h-8 rounded bg-[var(--theme-light)] opacity-50"></div>
                        <div className="w-8 h-8 rounded bg-[var(--theme-hover)] opacity-30"></div>
                    </div>
                </div>
            </div>

            {/* Application Settings */}
            <div className="space-y-6">
                <div className="bg-[#0A0A0E] rounded-2xl border border-[#1F1F2E] p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Monitor className="text-[var(--theme-primary)]" size={20} />
                        <h3 className="text-lg font-bold text-zinc-100">System Behavior</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Auto-Close */}
                        <div className="flex items-center justify-between p-3 bg-[#121215] rounded-xl border border-[#1F1F2E] group hover:border-zinc-700 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-500/10 text-red-400"><X size={18} /></div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-200">Auto-Close</p>
                                    <p className="text-xs text-zinc-500">Exit after injection</p>
                                </div>
                            </div>
                            <ToggleSwitch checked={autoClose} onChange={setAutoClose} />
                        </div>

                        {/* JVM Arguments */}
                        <div className="p-3 bg-[#121215] rounded-xl border border-[#1F1F2E] group hover:border-zinc-700 transition-colors space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400"><Coffee size={18} /></div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-200">JVM Arguments</p>
                                    <p className="text-xs text-zinc-500">Custom launch parameters</p>
                                </div>
                            </div>
                            <Input
                                value={jvmArgs}
                                onChange={(e) => setJvmArgs(e.target.value)}
                                className="text-xs font-mono bg-black/40 border-zinc-800"
                                placeholder="-Xmx4G -XX:+UseG1GC"
                                rightElement={<Edit3 size={12}/>}
                            />
                            {onLaunchJvm && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    fullWidth
                                    onClick={onLaunchJvm}
                                    className="text-xs"
                                >
                                    <Play size={12} />
                                    Launch Java with Arguments
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center justify-between p-3 bg-[#121215] rounded-xl border border-[#1F1F2E] group hover:border-zinc-700 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><Share2 size={18} /></div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-200">Discord RPC</p>
                                    <p className="text-xs text-zinc-500">Show status on profile</p>
                                </div>
                            </div>
                            <ToggleSwitch checked={discordRpc} onChange={setDiscordRpc} />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-[#121215] rounded-xl border border-[#1F1F2E] group hover:border-zinc-700 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400"><EyeOff size={18} /></div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-200">Streamer Mode</p>
                                    <p className="text-xs text-zinc-500">Hide sensitive info</p>
                                </div>
                            </div>
                            <ToggleSwitch checked={streamerMode} onChange={setStreamerMode} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SettingsCard;