import React, { useState } from 'react';
import { SectionCard, Input, Select, Button } from './ui';
import { FileCode, FolderOpen, Zap, List } from 'lucide-react';
import ProcessSelector from './ProcessSelector';

interface InjectorCardProps {
  targetProcess: string;
  setTargetProcess: (val: string) => void;
  dllPath: string;
  injectionMethod: string;
  setInjectionMethod: (val: string) => void;
  handleInject: () => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  fdpMode?: boolean;
}

const InjectorCard: React.FC<InjectorCardProps> = ({
  targetProcess,
  setTargetProcess,
  dllPath,
  injectionMethod,
  setInjectionMethod,
  handleInject,
  handleFileSelect,
  fileInputRef,
  fdpMode = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [processSelectorOpen, setProcessSelectorOpen] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.dll') || file.name.endsWith('.lib')) {
        // Create a synthetic event that matches the expected type
        const fileList = Object.assign(files, {
          item: (index: number) => files[index],
        });
        const fakeEvent = {
          target: { files: fileList },
          currentTarget: { files: fileList },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileSelect(fakeEvent);
      }
    }
  };

  return (
    <SectionCard title="Injection Hub" subtitle="Main Controls" className="h-full relative overflow-hidden flex-1">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--theme-primary)]/5 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col gap-6 relative z-10 h-full justify-center">

            {/* File Selection Area - Hidden when FDP Mode is active */}
            {!fdpMode && (
              <>
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".dll,.lib"
                />
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-all group cursor-pointer relative ${
                      isDragging
                        ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10'
                        : 'border-[#272735] bg-[#0c0c10] hover:border-[var(--theme-primary)]/30 hover:bg-[#0e0e14]'
                    }`}
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
              </>
            )}

            {/* FDP Mode Indicator */}
            {fdpMode && (
              <div className="border border-[var(--theme-primary)] rounded-xl p-10 flex flex-col items-center justify-center gap-4 bg-[var(--theme-primary)]/10 relative">
                <div className="absolute inset-0 bg-[var(--theme-primary)]/5 rounded-xl"></div>
                <div className="w-20 h-20 rounded-full bg-[#15151a] flex items-center justify-center border border-[var(--theme-primary)] shadow-xl relative z-10">
                    <FileCode size={32} className="text-[var(--theme-primary)]" />
                </div>
                <div className="text-center relative z-10">
                    <h3 className="text-zinc-200 font-medium text-lg">FDP Mode Active</h3>
                </div>
              </div>
            )}

            {/* Target Config */}
            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="relative">
                    <Input
                        label="Process Target"
                        value={targetProcess}
                        onChange={(e) => setTargetProcess(e.target.value)}
                        rightElement={
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setProcessSelectorOpen(true);
                                }}
                                className="p-1 hover:bg-[var(--theme-primary)]/10 rounded transition-colors"
                                title="Browse processes"
                            >
                                <List size={14} className="text-[var(--theme-primary)]"/>
                            </button>
                        }
                    />
                </div>
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

        {/* Process Selector Modal */}
        <ProcessSelector
          isOpen={processSelectorOpen}
          onClose={() => setProcessSelectorOpen(false)}
          onSelect={(processName) => setTargetProcess(processName)}
        />
    </SectionCard>
  );
};

export default InjectorCard;