import React, { useState } from 'react';
import { X, Folder, ExternalLink, ChevronDown, Check, Activity, Terminal, List } from 'lucide-react';
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
  onSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, targetProcess, setTargetProcess, injectionMethod, setInjectionMethod, jvmArgs, setJvmArgs, watcherActive, onWatcherToggle, onSave }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'General' | 'Preferences'>('General');

  // General State (local UI)
  const [jvmDistribution, setJvmDistribution] = useState('Automatic');
  const [memory, setMemory] = useState(4096);
  const [jvmArgsEnabled, setJvmArgsEnabled] = useState(true);
  const [keepRunning, setKeepRunning] = useState(false);

  // Method display mapping
  const methodDisplayMap: Record<string, string> = {
    'Standard': 'Standard (LoadLibrary)',
    'Manual': 'Manual Map (Stealth)',
    'Thread Hijack': 'Thread Hijacking (Existing Thread)',
    'Reflective': 'Reflective Loader (Self-Mapping)',
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
      "Standard (LoadLibrary)",
      "Manual Map (Stealth)",
      "Thread Hijacking (Existing Thread)",
      "Reflective Loader (Self-Mapping)"
  ];

  // Reusable Toggle Component for consistency
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
      <button 
        onClick={onChange}
        className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${checked ? 'bg-[var(--accent-500)]' : 'bg-[#3f3f46]'}`}
      >
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${checked ? 'right-1' : 'left-1'}`}></div>
      </button>
  );

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#0f0f11]/95 w-[600px] rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans text-white border border-white/10" 
        onClick={(e) => {
            e.stopPropagation();
            setIsMethodDropdownOpen(false);
        }}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
            <h2 className="text-xl font-medium">Settings</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-6 border-b border-white/10">
            <button 
                onClick={() => setActiveTab('General')}
                className={`pb-3 px-8 text-sm font-medium transition-colors border-b-2 ${activeTab === 'General' ? 'border-[var(--accent-500)] text-white' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
            >
                General
            </button>
            <button 
                 onClick={() => setActiveTab('Preferences')}
                 className={`pb-3 px-8 text-sm font-medium transition-colors border-b-2 ${activeTab === 'Preferences' ? 'border-[var(--accent-500)] text-white' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
            >
                Preferences
            </button>
        </div>

        {/* Content - General */}
        {activeTab === 'General' && (
            <div className="p-6 space-y-6">
                
                {/* JVM Distribution */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">JVM Distribution</label>
                    <div className="relative">
                        <select 
                            value={jvmDistribution}
                            onChange={(e) => setJvmDistribution(e.target.value)}
                            className="w-full bg-[#18181b] border border-white/10 rounded-md px-3 py-2 text-sm text-gray-300 appearance-none focus:outline-none focus:border-[var(--accent-500)] cursor-pointer"
                        >
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                            <option value="Custom">Custom</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Data Location */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Data Location</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            defaultValue="C:\Users\yzy\AppData\Roaming\CCBlueX\LiquidLauncher"
                            className="flex-1 bg-[#18181b] border border-white/10 rounded-md px-3 py-2 text-sm text-gray-400 focus:outline-none font-mono truncate"
                            readOnly
                        />
                        <button className="text-gray-400 hover:text-white">
                            <Folder size={20} />
                        </button>
                         <button className="text-gray-400 hover:text-white">
                            <ExternalLink size={20} />
                        </button>
                    </div>
                </div>

                {/* Memory Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-200">Memory</label>
                        <span className="text-sm text-gray-200 font-medium">{memory} MB</span>
                    </div>
                    <input 
                        type="range" 
                        min="1024" 
                        max="16384" 
                        step="1024"
                        value={memory}
                        onChange={(e) => setMemory(parseInt(e.target.value))}
                        className="w-full h-1 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-[var(--accent-500)]"
                    />
                </div>

                {/* JVM Arguments */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-200">JVM Arguments</label>
                        <ToggleSwitch checked={jvmArgsEnabled} onChange={() => setJvmArgsEnabled(!jvmArgsEnabled)} />
                    </div>
                    <input
                        type="text"
                        value={jvmArgs}
                        onChange={(e) => setJvmArgs(e.target.value)}
                        disabled={!jvmArgsEnabled}
                        className={`w-full bg-[#18181b] border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent-500)] font-mono transition-opacity ${!jvmArgsEnabled ? 'opacity-50 text-gray-500 cursor-not-allowed' : 'text-gray-300'}`}
                    />
                </div>

                {/* Keep Launcher Running */}
                <div className="flex items-center gap-3 pt-2">
                     <ToggleSwitch checked={keepRunning} onChange={() => setKeepRunning(!keepRunning)} />
                     <span className="text-sm text-gray-200 font-medium">Keep launcher running</span>
                </div>

                {/* Buttons */}
                <div className="space-y-3 pt-4">
                    <button
                        onClick={() => { onSave(); onClose(); }}
                        className="w-full bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white font-bold py-2.5 rounded-md transition-colors text-sm"
                    >
                        Save Configuration
                    </button>
                     <button className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold py-2.5 rounded-md transition-colors text-sm">
                        Reset Configs Default
                    </button>
                </div>
            </div>
        )}

        {/* Content - Preferences */}
        {activeTab === 'Preferences' && (
             <div className="p-6 space-y-6">
                
                {/* Process Target Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        Process Target
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-[#0f0f11] border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-white flex items-center">
                           {targetProcess}
                        </div>
                        <button 
                            onClick={() => setIsProcessSelectorOpen(true)}
                            className="bg-[#18181b] hover:bg-[#27272a] border border-white/10 hover:border-[var(--accent-500)] text-[var(--accent-500)] w-12 rounded-lg flex items-center justify-center transition-all shadow-lg active:scale-95"
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {/* Injection Method */}
                <div className="space-y-2 relative z-20">
                    <label className="text-sm font-medium text-gray-200">Injection Method</label>
                    <div className="relative">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMethodDropdownOpen(!isMethodDropdownOpen);
                            }}
                            className="w-full bg-[#18181b] border border-white/10 rounded-md px-3 py-2.5 text-sm text-gray-300 flex items-center justify-between hover:bg-[#27272a] transition-colors focus:border-[var(--accent-500)] outline-none"
                        >
                            <span className="font-medium text-[var(--accent-400)]">{displayMethod}</span>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isMethodDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isMethodDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[#18181b] border border-white/10 rounded-md shadow-xl overflow-hidden py-1 z-30 animate-in fade-in slide-in-from-top-1 duration-150">
                                {injectionMethods.map((method) => (
                                    <button
                                        key={method}
                                        onClick={() => {
                                            setInjectionMethod(methodReverseMap[method] || method);
                                            setIsMethodDropdownOpen(false);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-[#27272a] hover:text-white flex items-center justify-between group transition-colors"
                                    >
                                        <span>{method}</span>
                                        {displayMethod === method && <Check size={14} className="text-[var(--accent-500)]" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Process Watcher */}
                <div className={`
                    relative overflow-hidden rounded-xl border transition-all duration-300
                    ${watcherActive ? 'bg-[var(--accent-500-20)] border-[var(--accent-500)]' : 'bg-[#18181b] border-white/10'}
                `}>
                    <div className="p-4 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg transition-colors ${watcherActive ? 'bg-[var(--accent-500)] text-white' : 'bg-[#27272a] text-gray-400'}`}>
                                <Activity size={20} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className={`text-sm font-bold transition-colors ${watcherActive ? 'text-white' : 'text-gray-300'}`}>Process Watcher</h3>
                                <p className="text-[10px] uppercase font-bold tracking-wider mt-0.5 opacity-80">
                                    {watcherActive ? <span className="text-[var(--accent-400)]">System Active</span> : <span className="text-gray-500">System Standby</span>}
                                </p>
                            </div>
                        </div>

                        <ToggleSwitch checked={watcherActive} onChange={() => onWatcherToggle(!watcherActive)} />
                    </div>

                    {watcherActive && (
                         <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[var(--accent-500)] opacity-20 blur-[50px] rounded-full pointer-events-none"></div>
                    )}
                </div>

                {/* Enable System Log */}
                 <div className="flex items-center justify-between p-3 rounded-lg bg-[#18181b]/50 border border-white/5 hover:border-white/10 transition-colors">
                     <div className="flex items-center gap-3">
                        <Terminal size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-200 font-medium">Enable System Log</span>
                     </div>
                     <ToggleSwitch checked={systemLog} onChange={() => setSystemLog(!systemLog)} />
                </div>

             </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 mt-auto border-t border-white/5 bg-[#0f0f11]">
             <span className="text-xs text-gray-500 font-medium">Zavz Injector</span>
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