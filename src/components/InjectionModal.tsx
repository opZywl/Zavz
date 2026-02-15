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
export const InjectionModal: React.FC<InjectionModalProps> = ({
  isOpen,
  onClose,
  onInject,
  dllPath: _dllPath,
  setDllPath,
  fdpMode: _fdpMode,
  setFdpMode,
}) => {
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
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) return 90;
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
            setTimeout(() => {
              if (!cancelled) setStep('success');
            }, 800);
          }
        } catch {
          clearInterval(progressInterval);
          if (!cancelled) {
            setLogText('Injection failed!');
            setTimeout(() => {
              if (!cancelled) setStep('select');
            }, 2000);
          }
        }
      };

      runInjection();
      return () => {
        cancelled = true;
      };
    }
  }, [step]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
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
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="bg-[#18181b]/70 backdrop-blur-2xl w-[580px] min-h-[380px] rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col font-sans text-white border border-white/[0.08] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {step !== 'injecting' && step !== 'success' && (
          <div className="flex items-center justify-between px-7 py-5 shrink-0">
            <h2
              className="text-xl font-semibold tracking-tight"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {step === 'select' && 'Select Injection Mode'}
              {step === 'manual' && 'Manual Injection'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {step !== 'injecting' && step !== 'success' && (
          <div className="h-[1px] bg-white/[0.06] mx-7"></div>
        )}

        {/* Content Area */}
        <div className="flex-1 p-7 flex flex-col justify-center">
          {/* STEP 1: MODE SELECTION */}
          {step === 'select' && (
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Manual Mode */}
              <button
                onClick={() => setStep('manual')}
                className="group relative bg-black/20 hover:bg-black/30 rounded-xl p-6 flex flex-col items-center justify-center gap-4 border border-white/[0.06] hover:border-[var(--accent-500)]/30 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FileCode size={28} className="text-blue-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-white font-semibold text-base">Manual Mode</h3>
                  <p className="text-gray-500 text-[11px] mt-1.5">Select your own .dll file</p>
                </div>
              </button>

              {/* FDP Mode */}
              <button
                onClick={() => {
                  setFdpMode(true);
                  setStep('injecting');
                }}
                className="group relative bg-black/20 hover:bg-black/30 rounded-xl p-6 flex flex-col items-center justify-center gap-4 border border-white/[0.06] hover:border-[var(--accent-500)]/30 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-500)]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap size={28} className="text-[var(--accent-500)]" fill="currentColor" />
                </div>
                <div className="text-center">
                  <h3 className="text-white font-semibold text-base">FDP Mode</h3>
                  <p className="text-gray-500 text-[11px] mt-1.5">Auto-inject optimal config</p>
                </div>
              </button>
            </div>
          )}

          {/* STEP 2: MANUAL UPLOAD */}
          {step === 'manual' && (
            <div className="h-full flex flex-col gap-5">
              {!selectedFile ? (
                <div
                  className="flex-1 border-2 border-dashed border-white/[0.08] hover:border-[var(--accent-500)]/40 bg-black/10 rounded-xl flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer group"
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
                  <div className="w-14 h-14 rounded-2xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                    <FileCode size={24} className="text-[var(--accent-500)]" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-white font-semibold text-base group-hover:text-[var(--accent-400)] transition-colors">
                      Click to select DLL or Drag & Drop
                    </h3>
                    <p className="text-gray-600 text-xs mt-1">Supported formats: .dll, .lib</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/[0.08] flex items-center justify-center relative">
                    <FileCode size={32} className="text-[var(--accent-500)]" />
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#18181b]">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  </div>

                  <div className="bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 flex items-center gap-3 max-w-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-500)] animate-pulse"></div>
                    <span className="font-mono text-sm text-gray-300 truncate max-w-[280px]">
                      {selectedFile.name}
                    </span>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="ml-2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => setStep('injecting')}
                    className="mt-2 px-8 py-3 bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white font-bold rounded-xl transition-all active:scale-[0.97] flex items-center gap-2"
                  >
                    <Zap size={16} fill="currentColor" />
                    Inject Payload
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: INJECTING */}
          {step === 'injecting' && (
            <div className="h-full flex flex-col items-center justify-center text-center relative">
              <div className="relative mb-8">
                <div
                  className="w-20 h-20 rounded-full border-[3px] border-white/5 border-t-[var(--accent-500)] border-r-[var(--accent-500)] animate-spin"
                  style={{ animationDuration: '1.5s' }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap size={28} className="text-white opacity-80" fill="currentColor" />
                </div>
              </div>

              <div className="space-y-2 mb-10">
                <span className="text-[10px] font-black tracking-[0.2em] text-[var(--accent-400)] uppercase">
                  System Override
                </span>
                <h2
                  className="text-2xl font-bold text-white tracking-tight"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Injecting Payload
                </h2>
                <p className="text-sm text-gray-500 font-mono">{logText}</p>
              </div>

              <div className="w-full max-w-sm">
                <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-2 uppercase tracking-wider">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent-500)] transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'success' && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/20">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h2
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Injection Successful
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                The payload has been successfully injected into the target process.
              </p>

              <button
                onClick={onClose}
                className="px-8 py-2.5 bg-black/20 hover:bg-black/30 border border-white/[0.08] hover:border-white/[0.12] text-white font-semibold rounded-xl transition-all"
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
