import React, { useState, useEffect, useRef } from 'react';
import { X, FileCode, Zap, CheckCircle } from './Icons';

interface InjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInject: () => Promise<void>;
  dllPath: string;
  setDllPath: (path: string) => void;
  fdpMode: boolean;
  setFdpMode: (mode: boolean) => void;
}

type Step = 'select' | 'manual' | 'injecting' | 'success';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const InjectionModal: React.FC<InjectionModalProps> = ({ isOpen, onClose, onInject, dllPath: _dllPath, setDllPath, fdpMode: _fdpMode, setFdpMode }) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<Step>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [logText, setLogText] = useState('Initializing...');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedFile(null);
      setProgress(0);
      setLogText('Initializing...');
    }
  }, [isOpen]);

  // Real injection with progress animation
  useEffect(() => {
    if (step === 'injecting') {
      let cancelled = false;

      const runInjection = async () => {
        // Animate progress while real injection runs
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) return 90; // Hold at 90% until real injection completes
            const increment = Math.random() * 2 + 0.5;
            const newProgress = prev + increment;
            if (newProgress > 10 && newProgress < 30) setLogText('Scanning process memory...');
            if (newProgress > 30 && newProgress < 50) setLogText('Allocating memory space...');
            if (newProgress > 50 && newProgress < 70) setLogText('Writing payload...');
            if (newProgress > 70) setLogText('Hijacking threads...');
            return Math.min(newProgress, 90);
          });
        }, 50);

        try {
          await onInject();
          clearInterval(progressInterval);
          if (!cancelled) {
            setProgress(100);
            setLogText('Finalizing injection...');
            setTimeout(() => { if (!cancelled) setStep('success'); }, 800);
          }
        } catch {
          clearInterval(progressInterval);
          if (!cancelled) {
            setLogText('Injection failed!');
            setTimeout(() => { if (!cancelled) setStep('select'); }, 2000);
          }
        }
      };

      runInjection();
      return () => { cancelled = true; };
    }
  }, [step]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Set real DLL path for injection
      const filePath = (file as any).path || file.name;
      setDllPath(filePath);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-[#0f0f11] w-[600px] min-h-[400px] rounded-2xl border border-white/10 shadow-2xl flex flex-col relative overflow-hidden ring-1 ring-white/5" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header (Hidden during injection for immersion, or kept minimal) */}
        {step !== 'injecting' && step !== 'success' && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="text-white font-bold text-lg">
                    {step === 'select' && 'Select Injection Mode'}
                    {step === 'manual' && 'Manual Injection'}
                </h2>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>
        )}

        {/* Content Area */}
        <div className="flex-1 p-8 flex flex-col justify-center">
            
            {/* STEP 1: MODE SELECTION */}
            {step === 'select' && (
                <div className="grid grid-cols-2 gap-6 h-full">
                    
                    {/* Manual Mode */}
                    <button 
                        onClick={() => setStep('manual')}
                        className="group relative bg-[#18181b] hover:bg-[#202023] rounded-xl p-6 flex flex-col items-center justify-center gap-4 border border-white/5 hover:border-[var(--accent-500)] transition-all duration-300"
                    >
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <FileCode size={32} className="text-blue-500" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-white font-bold text-lg">Manual Mode</h3>
                            <p className="text-gray-500 text-xs mt-2">Select your own .dll file manually</p>
                        </div>
                    </button>

                    {/* FDP Mode */}
                    <button
                        onClick={() => { setFdpMode(true); setStep('injecting'); }}
                        className="group relative bg-[#18181b] hover:bg-[#202023] rounded-xl p-6 flex flex-col items-center justify-center gap-4 border border-white/5 hover:border-[var(--accent-500)] transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-500)]/0 to-[var(--accent-500)]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
                        <div className="w-16 h-16 rounded-full bg-[var(--accent-500-20)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_var(--accent-shadow)]">
                            <Zap size={32} className="text-[var(--accent-500)]" fill="currentColor" />
                        </div>
                        <div className="text-center relative z-10">
                            <h3 className="text-white font-bold text-lg">FDP Mode</h3>
                            <p className="text-gray-500 text-xs mt-2">Auto-inject optimal configuration</p>
                        </div>
                    </button>
                </div>
            )}

            {/* STEP 2: MANUAL UPLOAD */}
            {step === 'manual' && (
                <div className="h-full flex flex-col gap-6">
                    
                    {!selectedFile ? (
                        <div 
                            className="flex-1 border-2 border-dashed border-white/10 hover:border-[var(--accent-500)] bg-[#121214] rounded-xl flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer group"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input 
                                type="file" 
                                className="hidden" 
                                ref={fileInputRef} 
                                accept=".dll,.lib" 
                                onChange={handleFileSelect}
                            />
                            <div className="w-16 h-16 rounded-full bg-[#18181b] group-hover:bg-[#202023] flex items-center justify-center transition-colors">
                                <FileCode size={28} className="text-[var(--accent-500)]" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-white font-bold text-lg group-hover:text-[var(--accent-400)] transition-colors">Click to select DLL or Drag & Drop</h3>
                                <p className="text-gray-500 text-sm mt-1">Supported formats: .dll, .lib</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-in zoom-in-95 duration-200">
                             <div className="w-20 h-20 rounded-2xl bg-[#18181b] border border-white/10 flex items-center justify-center shadow-2xl relative">
                                 <FileCode size={40} className="text-[var(--accent-500)]" />
                                 <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#0f0f11]">
                                     <CheckCircle size={14} className="text-white" />
                                 </div>
                             </div>
                             
                             <div className="bg-[#18181b] border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3 max-w-full">
                                 <div className="w-2 h-2 rounded-full bg-[var(--accent-500)] animate-pulse"></div>
                                 <span className="font-mono text-sm text-gray-300 truncate max-w-[300px]">{selectedFile.name}</span>
                                 <button 
                                    onClick={() => setSelectedFile(null)}
                                    className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
                                 >
                                     <X size={16} />
                                 </button>
                             </div>

                             <button 
                                onClick={() => setStep('injecting')}
                                className="mt-4 px-10 py-3 bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white font-bold rounded-lg shadow-[0_4px_20px_var(--accent-shadow)] hover:shadow-[0_6px_24px_var(--accent-shadow)] transition-all transform active:scale-95 flex items-center gap-2"
                             >
                                 <Zap size={18} fill="currentColor" />
                                 Inject Payload
                             </button>
                        </div>
                    )}
                </div>
            )}

            {/* STEP 3: INJECTING (ANIMATION) */}
            {step === 'injecting' && (
                <div className="h-full flex flex-col items-center justify-center text-center relative">
                    
                    {/* Central Spinner / Icon */}
                    <div className="relative mb-8">
                        {/* Rotating ring */}
                        <div className="w-24 h-24 rounded-full border-4 border-white/5 border-t-[var(--accent-500)] border-r-[var(--accent-500)] animate-spin" style={{ animationDuration: '1.5s' }}></div>
                        
                        {/* Static Inner */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Zap size={32} className="text-white opacity-80" fill="currentColor" />
                        </div>
                    </div>

                    <div className="space-y-2 mb-12 animate-pulse">
                        <span className="text-[10px] font-black tracking-[0.2em] text-[var(--accent-400)] uppercase">System Override</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Injecting Payload</h2>
                        <p className="text-sm text-gray-500 font-mono">{logText}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md">
                        <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#18181b] rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[var(--accent-500)] shadow-[0_0_10px_var(--accent-500)] transition-all duration-100 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                </div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 'success' && (
                 <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                     <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                         <CheckCircle size={48} className="text-green-500" />
                     </div>
                     <h2 className="text-3xl font-bold text-white mb-2">Injection Successful</h2>
                     <p className="text-gray-400 text-sm mb-8">The payload has been successfully injected into the target process.</p>
                     
                     <button 
                        onClick={onClose}
                        className="px-8 py-2.5 bg-[#18181b] hover:bg-[#202023] border border-white/10 hover:border-white/20 text-white font-bold rounded-lg transition-all"
                     >
                         Close Window
                     </button>
                 </div>
            )}

        </div>
      </div>
    </div>
  );
};
