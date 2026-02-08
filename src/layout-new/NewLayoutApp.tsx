import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { resolveResource } from '@tauri-apps/api/path';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Header } from './components/Header';
import { UpdateCard } from './components/UpdateCard';
import { NewsCard } from './components/NewsCard';
import { InjectionModal } from './components/InjectionModal';
import { ClientSelectionModal } from './components/ClientSelectionModal';
import { SettingsModal } from './components/SettingsModal';
import { VersionModal } from './components/VersionModal';
import { ThemeModal } from './components/ThemeModal';
import { GithubIcon, DiscordIcon, YoutubeIcon, ZIcon } from './components/Icons';
import { Zap, Shield, Newspaper, ArrowRight, Terminal, ChevronUp, Minus, Maximize2, X } from 'lucide-react';
import type { LogType, LogEntry } from '../components/ui';

// ---- Theme system (shared with v1) ----
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const darkenHex = (hex: string, amount: number): string => {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const lightenHex = (hex: string, amount: number): string => {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export interface ThemeColors {
  [key: number]: string;
}

const THEME_PRESETS: Record<string, ThemeColors> = {
  red: { 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
  blue: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
  purple: { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
  emerald: { 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857' },
  amber: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
  rose: { 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c' },
  cyan: { 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490' },
  gradient: { 400: '#f87171', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c' },
};

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  imageUrl?: string;
  linkText: string;
}

const NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    title: 'Enhanced Memory Protection',
    description: 'New anti-detection bypass system with advanced memory cloaking.',
    category: 'Security',
    date: '07/02/2026',
    linkText: 'Learn More',
  },
  {
    id: '2',
    title: 'New Theme Engine',
    description: 'Fully customizable interface with live preview and custom colors.',
    category: 'Interface',
    date: '06/02/2026',
    linkText: 'Customize',
  },
  {
    id: '3',
    title: 'FDP Client Update',
    description: 'Latest FDP integration with improved stability and performance.',
    category: 'Platform',
    date: '05/02/2026',
    linkText: 'Update Now',
  },
];

interface NewLayoutAppProps {
  onSwitchLayout: () => void;
}

const NewLayoutApp: React.FC<NewLayoutAppProps> = ({ onSwitchLayout }) => {
  // --- State ---
  const [theme, setTheme] = useState('red');
  const [customHex, setCustomHex] = useState('#ef4444');
  const [isCustomTheme, setIsCustomTheme] = useState(false);

  // Injection state
  const [targetProcess, setTargetProcess] = useState('javaw.exe');
  const [dllPath, setDllPath] = useState('native.dll');
  const [injectionMethod, setInjectionMethod] = useState('Standard');
  const [fdpMode, setFdpMode] = useState(false);
  const [fdpPath, setFdpPath] = useState('release.jar');

  // Settings
  const [jvmArgs, setJvmArgs] = useState('-Xmx4G -XX:+UseG1GC -noverify');
  const [autoClose, setAutoClose] = useState(false);
  const [watcherActive, setWatcherActive] = useState(false);

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [consoleOpen, setConsoleOpen] = useState(false);

  // Modals
  const [injectionModalOpen, setInjectionModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  // Window (used internally by maximize toggle)

  // --- Helpers ---
  const addLog = (message: string, type: LogType = 'info') => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-GB', { hour12: false });
    const id = Math.random().toString(36).substr(2, 9);
    setLogs(prev => [...prev, { id, time: timeString, message, type }]);
  };

  const getActiveColor = () => {
    if (isCustomTheme) return customHex;
    return THEME_PRESETS[theme]?.[500] || '#ef4444';
  };

  // --- CSS Variables for the accent system ---
  const accentColor = getActiveColor();
  const accentStyles = {
    '--accent-400': isCustomTheme ? lightenHex(customHex, 30) : (THEME_PRESETS[theme]?.[400] || '#f87171'),
    '--accent-500': accentColor,
    '--accent-600': isCustomTheme ? darkenHex(customHex, 20) : (THEME_PRESETS[theme]?.[600] || '#dc2626'),
    '--accent-700': isCustomTheme ? darkenHex(customHex, 40) : (THEME_PRESETS[theme]?.[700] || '#b91c1c'),
    '--accent-100': lightenHex(accentColor, 80),
    '--accent-shadow': hexToRgba(accentColor, 0.4),
    '--accent-shadow-light': hexToRgba(accentColor, 0.15),
    '--accent-500-20': hexToRgba(accentColor, 0.2),
    '--accent-500-30': hexToRgba(accentColor, 0.3),
    // Also set --theme-* for v1 component compatibility
    '--theme-primary': accentColor,
    '--theme-hover': isCustomTheme ? darkenHex(customHex, 20) : (THEME_PRESETS[theme]?.[600] || '#dc2626'),
    '--theme-light': isCustomTheme ? lightenHex(customHex, 30) : (THEME_PRESETS[theme]?.[400] || '#f87171'),
    '--theme-glow': hexToRgba(accentColor, 0.5),
  } as React.CSSProperties;

  // --- Effects ---
  useEffect(() => {
    if (logs.length === 0) {
      addLog('YZY Injector v2 initialized', 'system');
      addLog('New layout loaded successfully', 'success');

      invoke<any>('get_settings')
        .then((settings) => {
          if (settings.jvmArgs) setJvmArgs(settings.jvmArgs);
          if (settings.injectionMethod) {
            const methodMap: Record<string, string> = {
              'standard': 'Standard',
              'manual_map': 'Manual',
              'thread_hijack': 'Thread Hijack',
              'reflective': 'Reflective'
            };
            setInjectionMethod(methodMap[settings.injectionMethod] || 'Standard');
          }
          if (settings.autoClose !== undefined) setAutoClose(settings.autoClose);
          if (settings.fdpJarPath) setFdpPath(settings.fdpJarPath);
          addLog('Settings loaded from backend', 'success');
        })
        .catch(() => {
          addLog('Using default settings', 'info');
        });
    }

    const unlisten1 = listen<string>('watcher-status', (event) => {
      addLog(event.payload, 'system');
    });
    const unlisten2 = listen<string>('injection-log', (event) => {
      addLog(event.payload, 'info');
    });

    return () => {
      unlisten1.then(fn => fn());
      unlisten2.then(fn => fn());
    };
  }, []);

  useEffect(() => {
    if (fdpMode) {
      resolveResource('native.dll')
        .then((resourcePath) => {
          setDllPath(resourcePath);
          addLog('FDP Mode activated - native.dll loaded', 'system');
        })
        .catch(() => {
          setDllPath('src/load/native.dll');
          addLog('FDP Mode activated (dev fallback)', 'system');
        });
    }
  }, [fdpMode]);

  // --- Handlers ---
  const handleInject = async () => {
    if (!dllPath) {
      addLog('No DLL selected. Aborting.', 'error');
      return;
    }

    addLog(`Initiating injection on ${targetProcess}...`, 'system');

    const methodMap: Record<string, string> = {
      'Standard': 'standard',
      'Standard (LoadLibrary)': 'standard',
      'Manual': 'manual_map',
      'Manual Map (Stealth)': 'manual_map',
      'Thread Hijack': 'thread_hijack',
      'Thread Hijacking (Existing Thread)': 'thread_hijack',
      'Reflective': 'reflective',
      'Reflective Loader (Self-Mapping)': 'reflective',
    };

    try {
      const result = await invoke<string>('inject_dll', {
        request: {
          target: targetProcess,
          dllPath: dllPath,
          method: methodMap[injectionMethod] || 'standard'
        }
      });
      addLog(result, 'success');
      addLog('Payload executed successfully.', 'info');

      if (autoClose) {
        addLog('Auto-close in 3s...', 'warning');
        setTimeout(async () => {
          try {
            await getCurrentWindow().close();
          } catch (e) {
            console.error('Close failed:', e);
          }
        }, 3000);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`Injection failed: ${errorMsg}`, 'error');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const methodMap: Record<string, string> = {
        'Standard': 'standard',
        'Standard (LoadLibrary)': 'standard',
        'Manual': 'manual_map',
        'Manual Map (Stealth)': 'manual_map',
        'Thread Hijack': 'thread_hijack',
        'Thread Hijacking (Existing Thread)': 'thread_hijack',
        'Reflective': 'reflective',
        'Reflective Loader (Self-Mapping)': 'reflective',
      };

      await invoke('save_settings', {
        settings: {
          jvmArgs,
          injectionMethod: methodMap[injectionMethod] || 'standard',
          autoClose,
          randomWindowTitle: false,
          fdpJarPath: fdpPath,
          fdpWrapper: 'lunar'
        }
      });
      addLog('Settings saved successfully!', 'success');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`Failed to save settings: ${errorMsg}`, 'error');
    }
  };

  const handleWatcherToggle = async (enabled: boolean) => {
    setWatcherActive(enabled);
    if (enabled) {
      if (!dllPath) {
        addLog('Cannot start watcher: No DLL selected', 'error');
        setWatcherActive(false);
        return;
      }
      try {
        const methodMap: Record<string, string> = {
          'Standard': 'standard', 'Manual': 'manual_map',
          'Thread Hijack': 'thread_hijack', 'Reflective': 'reflective',
        };
        const result = await invoke<string>('start_watcher', {
          request: { target: targetProcess, dllPath, method: methodMap[injectionMethod] || 'standard' }
        });
        addLog(result, 'success');
      } catch (error) {
        addLog(`Watcher failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
        setWatcherActive(false);
      }
    } else {
      try {
        const result = await invoke<string>('stop_watcher');
        addLog(result, 'warning');
      } catch (error) {
        addLog(`Watcher stop failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
      }
    }
  };

  // Window controls
  const handleMinimize = async () => {
    try { await getCurrentWindow().minimize(); } catch {}
  };
  const handleMaximize = async () => {
    try {
      const win = getCurrentWindow();
      await win.toggleMaximize();
    } catch {}
  };
  const handleClose = async () => {
    try { await getCurrentWindow().close(); } catch {}
  };
  const handleDrag = async (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    try { await getCurrentWindow().startDragging(); } catch {}
  };

  return (
    <div
      className="h-screen w-screen flex flex-col bg-[#0a0a0c] text-white font-sans overflow-hidden"
      style={accentStyles}
    >
      {/* Custom TopBar for v2 */}
      <div
        className="h-10 px-4 flex items-center justify-between bg-[#0a0a0c] border-b border-white/5 shrink-0 z-50"
        onMouseDown={handleDrag}
        style={{ userSelect: 'none' }}
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <span className="text-xs font-bold text-gray-500 tracking-wider">ZAVZ INJECTOR</span>
          <span className="text-[10px] text-gray-600 font-mono">v2.0</span>
        </div>
        <div className="flex items-center gap-1" onMouseDown={e => e.stopPropagation()}>
          <button onClick={onSwitchLayout} className="px-2 py-1 text-[10px] font-bold text-gray-500 hover:text-[var(--accent-500)] hover:bg-white/5 rounded transition-all mr-2 uppercase tracking-wider" title="Switch to Classic Layout">
            Classic
          </button>
          <button onClick={handleMinimize} className="p-1.5 hover:bg-white/5 rounded text-gray-500 hover:text-white transition-colors" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <Minus size={14} />
          </button>
          <button onClick={handleMaximize} className="p-1.5 hover:bg-white/5 rounded text-gray-500 hover:text-white transition-colors" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <Maximize2 size={14} />
          </button>
          <button onClick={handleClose} className="p-1.5 hover:bg-red-500/10 rounded text-gray-500 hover:text-red-400 transition-colors" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Header */}
      <Header onOpenSettings={() => setSettingsModalOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-10 pb-8 custom-scrollbar">
        {/* Top Row: Update Card + Quick Actions */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2">
            <UpdateCard />
          </div>
          <div className="flex flex-col gap-3">
            {/* Quick Inject Button */}
            <button
              onClick={() => setInjectionModalOpen(true)}
              className="flex-1 bg-[var(--accent-600)] hover:bg-[var(--accent-500)] rounded-xl p-4 flex items-center gap-3 transition-all shadow-lg shadow-[var(--accent-shadow)] hover:shadow-[0_6px_24px_var(--accent-shadow)] active:scale-[0.98] group"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap size={20} className="text-white" fill="currentColor" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-sm">Inject Now</h3>
                <p className="text-white/60 text-xs">Start injection process</p>
              </div>
            </button>
            {/* Client Selection Button */}
            <button
              onClick={() => setClientModalOpen(true)}
              className="flex-1 bg-[#18181b] hover:bg-[#202023] border border-white/5 hover:border-[var(--accent-500)] rounded-xl p-4 flex items-center gap-3 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-500-20)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield size={20} className="text-[var(--accent-500)]" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-sm">Select Client</h3>
                <p className="text-gray-500 text-xs">Lunar Client</p>
              </div>
            </button>
          </div>
        </div>

        {/* News Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Newspaper size={16} className="text-[var(--accent-500)]" />
              <h2 className="text-white font-bold text-lg">Latest Updates</h2>
            </div>
            <button
              onClick={() => setThemeModalOpen(true)}
              className="text-xs text-gray-500 hover:text-[var(--accent-500)] transition-colors flex items-center gap-1"
            >
              Customize Theme <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {NEWS_ITEMS.map(item => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Version Config + Social */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <button
              onClick={() => setVersionModalOpen(true)}
              className="w-full bg-[#18181b] hover:bg-[#202023] border border-white/5 hover:border-[var(--accent-500)] rounded-xl p-5 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-500-20)] flex items-center justify-center">
                  <Terminal size={20} className="text-[var(--accent-500)]" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-bold text-sm">Client Configuration</h3>
                  <p className="text-gray-500 text-xs mt-0.5">JAR: {fdpPath}</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-500 group-hover:text-[var(--accent-500)] group-hover:translate-x-1 transition-all" />
            </button>
          </div>
          <div className="bg-[#18181b] border border-white/5 rounded-xl p-5 flex items-center justify-center gap-4">
            <a href="https://github.com/opZywl" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
              <GithubIcon className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-[#5865F2] transition-colors">
              <DiscordIcon className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-red-500 transition-colors">
              <YoutubeIcon className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-[var(--accent-500)] transition-colors">
              <ZIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Console Log Panel */}
      <div className={`shrink-0 border-t border-white/5 bg-[#0f0f11] transition-all duration-300 ${consoleOpen ? 'h-48' : 'h-8'}`}>
        <button
          onClick={() => setConsoleOpen(!consoleOpen)}
          className="w-full h-8 px-4 flex items-center justify-between text-gray-500 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <Terminal size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">System Log</span>
            <span className="text-[10px] text-gray-600 font-mono">{logs.length} entries</span>
          </div>
          <ChevronUp size={12} className={`transition-transform ${consoleOpen ? '' : 'rotate-180'}`} />
        </button>
        {consoleOpen && (
          <div className="h-[calc(100%-2rem)] overflow-y-auto px-4 pb-2 font-mono text-xs custom-scrollbar">
            {logs.map(log => (
              <div key={log.id} className="flex gap-2 py-0.5">
                <span className="text-gray-600 shrink-0">[{log.time}]</span>
                <span className={
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'warning' ? 'text-amber-400' :
                  log.type === 'system' ? 'text-[var(--accent-400)]' :
                  'text-gray-400'
                }>{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <InjectionModal
        isOpen={injectionModalOpen}
        onClose={() => setInjectionModalOpen(false)}
        onInject={handleInject}
        dllPath={dllPath}
        setDllPath={setDllPath}
        fdpMode={fdpMode}
        setFdpMode={setFdpMode}
      />
      <ClientSelectionModal
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
      />
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        targetProcess={targetProcess}
        setTargetProcess={setTargetProcess}
        injectionMethod={injectionMethod}
        setInjectionMethod={setInjectionMethod}
        jvmArgs={jvmArgs}
        setJvmArgs={setJvmArgs}
        watcherActive={watcherActive}
        onWatcherToggle={handleWatcherToggle}
        onSave={handleSaveSettings}
      />
      <VersionModal
        isOpen={versionModalOpen}
        onClose={() => setVersionModalOpen(false)}
        fdpPath={fdpPath}
        setFdpPath={setFdpPath}
      />
      <ThemeModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        currentTheme={theme}
        setTheme={setTheme}
        themes={THEME_PRESETS}
        customHex={customHex}
        setCustomHex={setCustomHex}
        isCustom={isCustomTheme}
        setIsCustom={setIsCustomTheme}
      />
    </div>
  );
};

export default NewLayoutApp;
