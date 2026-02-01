import React from 'react';
import InjectorCard from './InjectorCard';
import { SectionCard, ToggleSwitch, Input, Button } from './ui';
import { Code2, X, Activity, Save } from 'lucide-react';

interface DashboardProps {
  // Injector Card Props
  targetProcess: string;
  setTargetProcess: (val: string) => void;
  dllPath: string;
  injectionMethod: string;
  setInjectionMethod: (val: string) => void;
  handleInject: () => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;

  // Preferences/Wrapper Props
  fdpMode: boolean;
  setFdpMode: (val: boolean) => void;
  clientWrapper: 'Lunar' | 'Badlion';
  handleClientWrapperChange: (wrapper: 'Lunar' | 'Badlion') => void;
  loadFdpJar: boolean;
  setLoadFdpJar: (val: boolean) => void;
  fdpPath: string;
  jarInputRef: React.RefObject<HTMLInputElement>;
  handleJarSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  watcherActive: boolean;
  setWatcherActive: (val: boolean) => void;
  handleSaveSettings: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  targetProcess,
  setTargetProcess,
  dllPath,
  injectionMethod,
  setInjectionMethod,
  handleInject,
  handleFileSelect,
  fileInputRef,
  fdpMode,
  setFdpMode,
  clientWrapper,
  handleClientWrapperChange,
  loadFdpJar,
  setLoadFdpJar,
  fdpPath,
  jarInputRef,
  handleJarSelect,
  watcherActive,
  setWatcherActive,
  handleSaveSettings
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col justify-center animate-[fade-in-up_0.3s_ease-out]">
        <div className="grid grid-cols-12 gap-6 h-full">
            {/* Injector Hub */}
            <div className="col-span-8 space-y-6 flex flex-col">
                <InjectorCard
                    targetProcess={targetProcess}
                    setTargetProcess={setTargetProcess}
                    dllPath={dllPath}
                    injectionMethod={injectionMethod}
                    setInjectionMethod={setInjectionMethod}
                    handleInject={handleInject}
                    handleFileSelect={handleFileSelect}
                    fileInputRef={fileInputRef}
                    fdpMode={fdpMode}
                />
            </div>

            {/* Quick Settings Sidebar */}
            <div className="col-span-4 space-y-6 flex flex-col">
                <SectionCard title="Preferences" subtitle="Wrapper" className="h-full flex-1">
                    <div className="space-y-6 h-full flex flex-col">
                        {/* FDP Mode Toggle */}
                        <div className="p-3 bg-[#15151a] rounded-xl border border-zinc-800 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                                    <Activity size={12} className="text-[var(--theme-primary)]"/> FDP Mode
                                </span>
                                <span className={`text-[10px] font-mono mt-0.5 ${fdpMode ? 'text-[var(--theme-light)]' : 'text-zinc-500'}`}>
                                    {fdpMode ? 'ACTIVE' : 'DISABLED'}
                                </span>
                            </div>
                            <ToggleSwitch checked={fdpMode} onChange={setFdpMode} />
                        </div>

                        {/* Client Wrapper */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Client Wrapper</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => handleClientWrapperChange('Lunar')}
                                    className={`p-3 rounded-lg border text-xs font-bold transition-all relative overflow-hidden ${clientWrapper === 'Lunar' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-light)]' : 'bg-[#15151a] border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Lunar Client
                                    {clientWrapper === 'Lunar' && <div className="absolute inset-0 bg-[var(--theme-primary)]/5"></div>}
                                </button>
                                <button 
                                    onClick={() => handleClientWrapperChange('Badlion')}
                                    className={`p-3 rounded-lg border text-xs font-bold transition-all relative overflow-hidden ${clientWrapper === 'Badlion' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-light)]' : 'bg-[#15151a] border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Badlion
                                    {clientWrapper === 'Badlion' && <div className="absolute inset-0 bg-[var(--theme-primary)]/5"></div>}
                                </button>
                            </div>
                        </div>

                        {/* Jar Path & FDP Logic */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Jar Path</label>
                                
                                {/* Load FDP JAR Switch positioned correctly beside the label area */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Load FDP JAR?</span>
                                    <ToggleSwitch checked={loadFdpJar} onChange={setLoadFdpJar} />
                                </div>
                            </div>
                            
                            <input 
                                type="file" 
                                className="hidden" 
                                ref={jarInputRef} 
                                onChange={handleJarSelect} 
                                accept=".jar"
                            />
                            <div onClick={() => loadFdpJar && jarInputRef.current?.click()}>
                                <Input 
                                    value={loadFdpJar ? fdpPath : "JAR DISABLED"}
                                    readOnly={true}
                                    disabled={!loadFdpJar}
                                    rightElement={loadFdpJar ? <Code2 size={14}/> : <X size={14} className="text-red-900"/>}
                                    className={`cursor-pointer ${!loadFdpJar ? "opacity-50 cursor-not-allowed bg-red-900/5 border-red-900/20 text-red-500/50" : "hover:border-[var(--theme-primary)]"}`}
                                />
                            </div>
                        </div>

                        {/* Process Watcher */}
                        <div className="p-3 bg-[#15151a] rounded-xl border border-zinc-800 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                                    <Activity size={12} className="text-[var(--theme-primary)]"/> Process Watcher
                                </span>
                                <span className={`text-[10px] font-mono mt-0.5 ${watcherActive ? 'text-[var(--theme-light)]' : 'text-zinc-500'}`}>
                                    {watcherActive ? 'STATUS: ACTIVE' : 'STATUS: STANDBY'}
                                </span>
                            </div>
                            <ToggleSwitch checked={watcherActive} onChange={setWatcherActive} />
                        </div>

                        <Button variant="secondary" fullWidth className="mt-auto" onClick={handleSaveSettings}>
                            <Save size={14} /> Save Configuration
                        </Button>
                    </div>
                </SectionCard>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;