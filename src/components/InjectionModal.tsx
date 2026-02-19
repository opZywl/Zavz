import React, { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { X, FileCode, Zap, CheckCircle } from './Icons';

type InjectionMode = 'manual' | 'fdp';

interface InjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInject: (mode: InjectionMode) => Promise<void>;
  dllPath: string;
  setDllPath: (path: string) => void;
  fdpMode: boolean;
  setFdpMode: (mode: boolean) => void;
}

type Step = 'select' | 'manual' | 'injecting' | 'success';

interface SelectedDll {
  name: string;
  path: string;
}

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
  const [activeMode, setActiveMode] = useState<InjectionMode | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedDll | null>(null);
  const [manualError, setManualError] = useState('');
  const [isPickingFile, setIsPickingFile] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logText, setLogText] = useState('Initializing...');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setActiveMode(null);
      setSelectedFile(null);
      setManualError('');
      setProgress(0);
      setLogText('Initializing...');
    }
  }, [isOpen]);

  useEffect(() => {
    if (step !== 'injecting') return;

    let cancelled = false;
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

    const runInjection = async () => {
      try {
        if (!activeMode) throw new Error('No injection mode selected.');
        await onInject(activeMode);

        if (!cancelled) {
          setProgress(100);
          setLogText('Finalizing injection...');
          setTimeout(() => {
            if (!cancelled) setStep('success');
          }, 800);
        }
      } catch {
        if (!cancelled) {
          setLogText('Injection failed!');
          setTimeout(() => {
            if (!cancelled) {
              setStep(activeMode === 'manual' ? 'manual' : 'select');
            }
          }, 1600);
        }
      } finally {
        clearInterval(progressInterval);
      }
    };

    runInjection();

    return () => {
      cancelled = true;
      clearInterval(progressInterval);
    };
  }, [activeMode, step]);

  const extractNativePath = (file: File): string | null => {
    const maybePath = (file as File & { path?: string }).path;
    if (!maybePath || maybePath.startsWith('C:\\fakepath\\')) {
      return null;
    }
    return maybePath;
  };

  const setManualDll = (path: string, name: string) => {
    setSelectedFile({ path, name });
    setDllPath(path);
    setManualError('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const nativePath = extractNativePath(file);

    if (!nativePath) {
      setSelectedFile(null);
      setDllPath('');
      setManualError('Absolute path unavailable. Use "Browse DLL" below.');
      return;
    }

    setManualDll(nativePath, file.name);
  };

  const handleBrowseDll = async () => {
    setIsPickingFile(true);
    setManualError('');
    try {
      const selectedPath = await invoke<string | null>('pick_dll_file');
      if (!selectedPath) return;

      const normalizedPath = selectedPath.replace(/\//g, '\\');
      const fileName = normalizedPath.split('\\').pop() || normalizedPath;
      setManualDll(normalizedPath, fileName);
    } catch {
      setManualError('Failed to open native picker. Try drag and drop.');
    } finally {
      setIsPickingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.files?.[0]) return;

    const droppedFile = e.dataTransfer.files[0];
    const nativePath = extractNativePath(droppedFile);

    if (!nativePath) {
      setManualError('Dropped file path is unavailable. Use "Browse DLL".');
      return;
    }

    setManualDll(nativePath, droppedFile.name);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="bg-[#18181b]/70 backdrop-blur-2xl w-[580px] min-h-[380px] rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col font-sans text-white border border-white/[0.08] relative"
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="flex-1 p-7 flex flex-col justify-center">
          {step === 'select' && (
            <div className="grid grid-cols-2 gap-4 h-full">
              <button
                onClick={() => {
                  setFdpMode(false);
                  setActiveMode('manual');
                  setManualError('');
                  setStep('manual');
                }}
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

              <button
                onClick={() => {
                  setFdpMode(true);
                  setActiveMode('fdp');
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

          {step === 'manual' && (
            <div className="h-full flex flex-col gap-5">
              {!selectedFile ? (
                <div className="flex-1 flex flex-col gap-4">
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

                  <button
                    onClick={handleBrowseDll}
                    disabled={isPickingFile}
                    className="px-5 py-2.5 bg-[var(--accent-600)] hover:bg-[var(--accent-500)] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
                  >
                    {isPickingFile ? 'Opening picker...' : 'Browse DLL (Native)'}
                  </button>

                  {manualError && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      {manualError}
                    </p>
                  )}
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
                      onClick={() => {
                        setSelectedFile(null);
                        setDllPath('');
                      }}
                      className="ml-2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setFdpMode(false);
                      setActiveMode('manual');
                      setStep('injecting');
                    }}
                    className="mt-2 px-8 py-3 bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white font-bold rounded-xl transition-all active:scale-[0.97] flex items-center gap-2"
                  >
                    <Zap size={16} fill="currentColor" />
                    Inject Payload
                  </button>
                </div>
              )}
            </div>
          )}

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
