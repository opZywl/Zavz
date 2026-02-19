import React, { useState } from 'react';
import { X, ChevronDown, Check, Activity, Terminal, List, Play, Eye, Power } from './Icons';
import { ProcessSelectionModal } from './ProcessSelectionModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProcess: string;
  setTargetProcess: (p: string) => void;
  injectionMethod: string;
  setInjectionMethod: (m: string) => void;
  jvmArgs: string;
  setJvmArgs: (args: string) => void;
  watcherActive: boolean;
  onWatcherToggle: (enabled: boolean) => void;
  autoClose: boolean;
  setAutoClose: (v: boolean) => void;
  streamerMode: boolean;
  setStreamerMode: (v: boolean) => void;
  discordRpc: boolean;
  setDiscordRpc: (v: boolean) => void;
  onSave: () => void;
  onLaunchJvm: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  targetProcess,
  setTargetProcess,
  injectionMethod,
  setInjectionMethod,
  jvmArgs,
  setJvmArgs,
  watcherActive,
  onWatcherToggle,
  autoClose,
  setAutoClose,
  streamerMode,
  setStreamerMode,
  discordRpc,
  setDiscordRpc,
  onSave,
  onLaunchJvm,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'General' | 'Preferences'>('General');

  // General State (local UI)
  const [jvmDistribution, setJvmDistribution] = useState('Automatic');
  const [memory, setMemory] = useState(4096);
  const [jvmArgsEnabled, setJvmArgsEnabled] = useState(true);

  // Method display mapping
  const methodDisplayMap: Record<string, string> = {
    Standard: 'Standard (LoadLibrary)',
    Manual: 'Manual Map (Stealth)',
    'Thread Hijack': 'Thread Hijacking (Existing Thread)',
    Reflective: 'Reflective Loader (Self-Mapping)',
  };
  const methodReverseMap: Record<string, string> = {
    'Standard (LoadLibrary)': 'Standard',
    'Manual Map (Stealth)': 'Manual',
    'Thread Hijacking (Existing Thread)': 'Thread Hijack',
    'Reflective Loader (Self-Mapping)': 'Reflective',
  };
  const displayMethod = methodDisplayMap[injectionMethod] || injectionMethod;

  // UI State
  const [systemLog, setSystemLog] = useState(false);
  const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);
  const [isProcessSelectorOpen, setIsProcessSelectorOpen] = useState(false);

  const injectionMethods = [
    'Standard (LoadLibrary)',
    'Manual Map (Stealth)',
    'Thread Hijacking (Existing Thread)',
    'Reflective Loader (Self-Mapping)',
  ];

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${checked ? 'bg-[var(--accent-500)]' : 'bg-white/10'}`}
    >
      <div
        className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${checked ? 'right-1' : 'left-1'}`}
      ></div>
    </button>
  );

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="bg-[#18181b]/70 backdrop-blur-2xl w-[560px] max-h-[80vh] rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col font-sans text-white border border-white/[0.08]"
        onClick={(e) => {
          e.stopPropagation();
          setIsMethodDropdownOpen(false);
        }}
      >
        {/* Header - Clean like LiquidLauncher */}
        <div className="flex items-center justify-between px-7 py-5 shrink-0">
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs - Centered like LiquidLauncher */}
        <div className="flex items-center justify-center gap-0 px-7 shrink-0">
          <button
            onClick={() => setActiveTab('General')}
            className={`pb-3 px-10 text-sm font-medium transition-colors border-b-2 ${activeTab === 'General' ? 'border-[var(--accent-500)] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('Preferences')}
            className={`pb-3 px-10 text-sm font-medium transition-colors border-b-2 ${activeTab === 'Preferences' ? 'border-[var(--accent-500)] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            Preferences
          </button>
        </div>
        <div className="h-[1px] bg-white/[0.06] mx-7"></div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Content - General */}
          {activeTab === 'General' && (
            <div className="p-7 space-y-5">
              {/* JVM Distribution */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">JVM Distribution</label>
                <div className="relative">
                  <select
                    value={jvmDistribution}
                    onChange={(e) => setJvmDistribution(e.target.value)}
                    className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-gray-200 appearance-none focus:outline-none focus:border-[var(--accent-500)]/50 cursor-pointer transition-colors"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="Custom">Custom</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                </div>
              </div>

              {/* Memory Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-300">Memory</label>
                  <span className="text-sm text-gray-200 font-semibold">{memory} MB</span>
                </div>
                <input
                  type="range"
                  min="1024"
                  max="16384"
                  step="1024"
                  value={memory}
                  onChange={(e) => setMemory(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/[0.06] rounded-full appearance-none cursor-pointer accent-[var(--accent-500)]"
                />
              </div>

              {/* JVM Arguments */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-300">JVM Arguments</label>
                  <ToggleSwitch
                    checked={jvmArgsEnabled}
                    onChange={() => setJvmArgsEnabled(!jvmArgsEnabled)}
                  />
                </div>
                <input
                  type="text"
                  value={jvmArgs}
                  onChange={(e) => setJvmArgs(e.target.value)}
                  disabled={!jvmArgsEnabled}
                  className={`w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent-500)]/50 font-mono transition-all ${!jvmArgsEnabled ? 'opacity-40 text-gray-500 cursor-not-allowed' : 'text-gray-200'}`}
                />
              </div>

              {/* Launch JVM Button */}
              <button
                onClick={onLaunchJvm}
                className="w-full flex items-center justify-center gap-2 bg-black/20 hover:bg-black/30 border border-white/[0.08] hover:border-[var(--accent-500)]/30 text-gray-200 hover:text-white font-semibold py-3 rounded-xl transition-all text-sm"
              >
                <Play size={14} className="text-[var(--accent-500)]" />
                Launch Java with Arguments
              </button>

              {/* Toggle Options */}
              <div className="space-y-1">
                {/* Auto-Close After Injection */}
                <div className="flex items-center justify-between p-3.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <Power size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-300 font-medium">
                      Auto-close after injection
                    </span>
                  </div>
                  <ToggleSwitch checked={autoClose} onChange={() => setAutoClose(!autoClose)} />
                </div>

                {/* Streamer Mode */}
                <div className="flex items-center justify-between p-3.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <Eye size={16} className="text-gray-500" />
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-300 font-medium">Streamer Mode</span>
                      <span className="text-[10px] text-gray-600">Hide sensitive information</span>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={streamerMode}
                    onChange={() => setStreamerMode(!streamerMode)}
                  />
                </div>

                {/* Discord RPC */}
                <div className="flex items-center justify-between p-3.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <img
                      src="/img/icon/social/icon-discord.svg"
                      alt="Discord"
                      className="w-4 h-4 opacity-40"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-300 font-medium">
                        Discord Rich Presence
                      </span>
                      <span className="text-[10px] text-gray-600">
                        Show status on Discord profile
                      </span>
                    </div>
                  </div>
                  <ToggleSwitch checked={discordRpc} onChange={() => setDiscordRpc(!discordRpc)} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => {
                    onSave();
                    onClose();
                  }}
                  className="w-full bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  Save Configuration
                </button>
                <button className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold py-3 rounded-xl transition-colors text-sm">
                  Clear Data
                </button>
              </div>
            </div>
          )}

          {/* Content - Preferences */}
          {activeTab === 'Preferences' && (
            <div className="p-7 space-y-5">
              {/* Process Target Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Process Target</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={targetProcess}
                    onChange={(e) => setTargetProcess(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-gray-200 focus:outline-none focus:border-[var(--accent-500)]/50 transition-colors"
                    placeholder="javaw.exe"
                  />
                  <button
                    onClick={() => setIsProcessSelectorOpen(true)}
                    className="bg-black/20 hover:bg-black/30 border border-white/[0.08] hover:border-[var(--accent-500)]/30 text-[var(--accent-500)] w-12 rounded-xl flex items-center justify-center transition-all active:scale-95"
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>

              {/* Injection Method */}
              <div className="space-y-2 relative z-20">
                <label className="text-sm font-medium text-gray-300">Injection Method</label>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMethodDropdownOpen(!isMethodDropdownOpen);
                    }}
                    className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-gray-200 flex items-center justify-between hover:bg-black/30 transition-colors focus:border-[var(--accent-500)]/50 outline-none"
                  >
                    <span className="font-medium text-[var(--accent-400)]">{displayMethod}</span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform duration-200 ${isMethodDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isMethodDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e22]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden py-1 z-30">
                      {injectionMethods.map((method) => (
                        <button
                          key={method}
                          onClick={() => {
                            setInjectionMethod(methodReverseMap[method] || method);
                            setIsMethodDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/[0.04] hover:text-white flex items-center justify-between transition-colors"
                        >
                          <span>{method}</span>
                          {displayMethod === method && (
                            <Check size={14} className="text-[var(--accent-500)]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Process Watcher */}
              <div
                className={`
                    relative overflow-hidden rounded-xl border transition-all duration-300
                    ${watcherActive ? 'bg-[var(--accent-500)]/10 border-[var(--accent-500)]/30' : 'bg-black/20 border-white/[0.08]'}
                `}
              >
                <div className="p-4 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg transition-colors ${watcherActive ? 'bg-[var(--accent-500)] text-white' : 'bg-white/5 text-gray-500'}`}
                    >
                      <Activity size={18} />
                    </div>
                    <div className="flex flex-col">
                      <h3
                        className={`text-sm font-semibold transition-colors ${watcherActive ? 'text-white' : 'text-gray-300'}`}
                      >
                        Process Watcher
                      </h3>
                      <p className="text-[10px] uppercase font-bold tracking-wider mt-0.5">
                        {watcherActive ? (
                          <span className="text-[var(--accent-400)]">System Active</span>
                        ) : (
                          <span className="text-gray-600">System Standby</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <ToggleSwitch
                    checked={watcherActive}
                    onChange={() => onWatcherToggle(!watcherActive)}
                  />
                </div>

                {watcherActive && (
                  <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[var(--accent-500)] opacity-10 blur-[50px] rounded-full pointer-events-none"></div>
                )}
              </div>

              {/* Enable System Log */}
              <div className="flex items-center justify-between p-3.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <Terminal size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-300 font-medium">Enable System Log</span>
                </div>
                <ToggleSwitch checked={systemLog} onChange={() => setSystemLog(!systemLog)} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 shrink-0 border-t border-white/[0.06]">
          <span className="text-xs text-gray-600 font-medium">by Zywl</span>
        </div>

        <ProcessSelectionModal
          isOpen={isProcessSelectorOpen}
          onClose={() => setIsProcessSelectorOpen(false)}
          onSelect={(proc) => setTargetProcess(proc)}
        />
      </div>
    </div>
  );
};
