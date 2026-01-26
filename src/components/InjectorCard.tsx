import React from 'react';
import { SectionCard, Input, Select, Button } from './ui';
import { FileCode, FolderOpen, Layers, Zap } from 'lucide-react';

interface InjectorCardProps {
  targetProcess: string;
  setTargetProcess: (val: string) => void;
  dllPath: string;
  injectionMethod: string;
  setInjectionMethod: (val: string) => void;
  handleInject: () => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const InjectorCard: React.FC<InjectorCardProps> = ({
  targetProcess,
  setTargetProcess,
  dllPath,
  injectionMethod,
  setInjectionMethod,
  handleInject,
  handleFileSelect,
  fileInputRef
}) => {
  return (
    <SectionCard title="Injection Hub" subtitle="Main Controls" className="h-full relative overflow-hidden flex-1">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--theme-primary)]/5 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="flex flex-col gap-6 relative z-10 h-full justify-center">
            
            {/* File Selection Area */}
            <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept=".dll,.lib"
            />
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-[#272735] bg-[#0c0c10] rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-all hover:border-[var(--theme-primary)]/30 hover:bg-[#0e0e14] group cursor-pointer relative"
            >
                <div className="absolute inset-0 bg-[var(--theme-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                <div className="w-20 h-20 rounded-full bg-[#15151a] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-zinc-800 shadow-xl group-hover:border-[var(--theme-primary)]/50 relative z-10">
                    <FileCode size={32} className="text-[var(--theme-primary)]" />
                </div>
                <div className="text-center relative z-10">
                    <h3 className="text-zinc-200 font-medium text-lg">Click to select DLL or Drag & Drop</h3>
                    <p className="text-zinc-500 text-sm mt-1">Supported formats: .dll, .lib</p>
                </div>
                <div className="px-5 py-2.5 bg-[#15151a] rounded-lg border border-zinc-800 flex items-center gap-3 relative z-10 mt-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] shadow-[0_0_8px_var(--theme-glow)] animate-pulse"></div>
                    <span className="text-sm font-mono text-zinc-300">{dllPath}</span>
                    <button className="text-zinc-600 hover:text-white transition-colors ml-2"><FolderOpen size={14}/></button>
                </div>
            </div>

            {/* Target Config */}
            <div className="grid grid-cols-2 gap-4 mt-4">
                <Input 
                    label="Process Target" 
                    value={targetProcess} 
                    onChange={(e) => setTargetProcess(e.target.value)} 
                    rightElement={<Layers size={14}/>}
                />
                <Select 
                    label="Method" 
                    options={[
                        {value: 'Standard', label: 'Standard (LoadLibrary)'},
                        {value: 'Manual', label: 'Manual Map (Stealth)'},
                        {value: 'Kernel', label: 'Kernel Injection (Ring0)'}
                    ]} 
                    value={injectionMethod}
                    onChange={(val) => setInjectionMethod(val)}
                />
            </div>

            {/* Big Button */}
            <Button 
                variant="primary" 
                size="xl" 
                fullWidth 
                className="mt-6 shadow-2xl"
                onClick={handleInject}
            >
                <Zap className="mr-2" fill="currentColor" />
                INITIALIZE INJECTION
            </Button>

        </div>
    </SectionCard>
  );
};

export default InjectorCard;