import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { resolveResource } from '@tauri-apps/api/path';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Header } from './components/Header';
import { NewsCard } from './components/NewsCard';
import { InjectionModal } from './components/InjectionModal';
import { ClientSelectionModal } from './components/ClientSelectionModal';
import { SettingsModal } from './components/SettingsModal';
import { VersionModal } from './components/VersionModal';
import { ThemeModal } from './components/ThemeModal';
import { ZIcon, GithubIcon, DiscordIcon, TwitterIcon, YoutubeIcon, InjectorIcon, MinecraftIcon } from './components/Icons';
import { ExternalLink, ChevronDown } from 'lucide-react';
import type { LogType, LogEntry } from '../components/ui';

// ---- Theme system ----
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

// News items matching the reference design
const NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    title: 'FDPCLIENT',
    description: 'b16 released changelog. Check out the new features and improvements.',
    category: 'Client',
    date: '18/11/2025',
    imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&h=300&fit=crop',
    linkText: 'Download',
  },
  {
    id: '2',
    title: 'Interface Customization is Live',
    description: 'Customize your injector experience with our new dynamic theming engine. Click to edit.',
    category: 'Interface',
    date: '24/18/2025',
    linkText: 'Customize',
  },
  {
    id: '3',
    title: 'ZavzProxy is Expanding',
    description: '15 global locations and over 40k unique IPs used monthly!',
    category: 'Proxy',
    date: '24/18/2025',
    linkText: 'Read more',
  },
  {
    id: '4',
    title: 'The New Zavz Website is Live!',
    description: 'We finally gave the Zavz website a fresh new look. Hope you like it!',
    category: 'Website',
    date: '09/05/2025',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop',
    linkText: 'Visit Site',
  },
  {
    id: '5',
    title: 'New Injection Method',
    description: 'Thread hijacking injection method now available for advanced users.',
    category: 'Update',
    date: '08/02/2026',
    linkText: 'Learn More',
  },
  {
    id: '6',
    title: 'Bedwars Auto-Play',
    description: 'New automation script for Bedwars gameplay with smart pathfinding.',
    category: 'Script',
    date: '07/02/2026',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
    linkText: 'Try Now',
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

  // Modals
  const [injectionModalOpen, setInjectionModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);

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

  // --- CSS Variables for accent system ---
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
    '--theme-primary': accentColor,
    '--theme-hover': isCustomTheme ? darkenHex(customHex, 20) : (THEME_PRESETS[theme]?.[600] || '#dc2626'),
    '--theme-light': isCustomTheme ? lightenHex(customHex, 30) : (THEME_PRESETS[theme]?.[400] || '#f87171'),
    '--theme-glow': hexToRgba(accentColor, 0.5),
  } as React.CSSProperties;

  // --- Effects ---
  useEffect(() => {
    if (logs.length === 0) {
      addLog('YZY Injector v2 initialized', 'system');

      invoke<any>('get_settings')
        .then((settings) => {
          if (settings.jvmArgs) setJvmArgs(settings.jvmArgs);
          if (settings.injectionMethod) {
            const methodMap: Record<string, string> = {
              'standard': 'Standard', 'manual_map': 'Manual',
              'thread_hijack': 'Thread Hijack', 'reflective': 'Reflective'
            };
            setInjectionMethod(methodMap[settings.injectionMethod] || 'Standard');
          }
          if (settings.autoClose !== undefined) setAutoClose(settings.autoClose);
          if (settings.fdpJarPath) setFdpPath(settings.fdpJarPath);
        })
        .catch(() => {});
    }

    const unlisten1 = listen<string>('watcher-status', (event) => { addLog(event.payload, 'system'); });
    const unlisten2 = listen<string>('injection-log', (event) => { addLog(event.payload, 'info'); });

    return () => {
      unlisten1.then(fn => fn());
      unlisten2.then(fn => fn());
    };
  }, []);

  useEffect(() => {
    if (fdpMode) {
      resolveResource('native.dll')
        .then((resourcePath) => { setDllPath(resourcePath); })
        .catch(() => { setDllPath('src/load/native.dll'); });
    }
  }, [fdpMode]);

  // --- Handlers ---
  const handleInject = async () => {
    if (!dllPath) { addLog('No DLL selected.', 'error'); return; }
    addLog(`Injecting on ${targetProcess}...`, 'system');

    const methodMap: Record<string, string> = {
      'Standard': 'standard', 'Standard (LoadLibrary)': 'standard',
      'Manual': 'manual_map', 'Manual Map (Stealth)': 'manual_map',
      'Thread Hijack': 'thread_hijack', 'Thread Hijacking (Existing Thread)': 'thread_hijack',
      'Reflective': 'reflective', 'Reflective Loader (Self-Mapping)': 'reflective',
    };

    try {
      const result = await invoke<string>('inject_dll', {
        request: { target: targetProcess, dllPath, method: methodMap[injectionMethod] || 'standard' }
      });
      addLog(result, 'success');
      if (autoClose) {
        setTimeout(async () => { try { await getCurrentWindow().close(); } catch {} }, 3000);
      }
    } catch (error) {
      addLog(`Injection failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const methodMap: Record<string, string> = {
        'Standard': 'standard', 'Standard (LoadLibrary)': 'standard',
        'Manual': 'manual_map', 'Manual Map (Stealth)': 'manual_map',
        'Thread Hijack': 'thread_hijack', 'Thread Hijacking (Existing Thread)': 'thread_hijack',
        'Reflective': 'reflective', 'Reflective Loader (Self-Mapping)': 'reflective',
      };
      await invoke('save_settings', {
        settings: { jvmArgs, injectionMethod: methodMap[injectionMethod] || 'standard', autoClose, randomWindowTitle: false, fdpJarPath: fdpPath, fdpWrapper: 'lunar' }
      });
      addLog('Settings saved!', 'success');
    } catch (error) {
      addLog(`Save failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  const handleWatcherToggle = async (enabled: boolean) => {
    setWatcherActive(enabled);
    if (enabled) {
      if (!dllPath) { addLog('No DLL selected', 'error'); setWatcherActive(false); return; }
      try {
        const methodMap: Record<string, string> = { 'Standard': 'standard', 'Manual': 'manual_map', 'Thread Hijack': 'thread_hijack', 'Reflective': 'reflective' };
        const result = await invoke<string>('start_watcher', { request: { target: targetProcess, dllPath, method: methodMap[injectionMethod] || 'standard' } });
        addLog(result, 'success');
      } catch (error) { addLog(`Watcher failed: ${error instanceof Error ? error.message : String(error)}`, 'error'); setWatcherActive(false); }
    } else {
      try { const result = await invoke<string>('stop_watcher'); addLog(result, 'warning'); }
      catch (error) { addLog(`Stop failed: ${error instanceof Error ? error.message : String(error)}`, 'error'); }
    }
  };

  // Window controls
  const handleDrag = async (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
    try { await getCurrentWindow().startDragging(); } catch {}
  };

  // Handle news card actions
  const handleNewsAction = (item: NewsItem) => {
    if (item.category === 'Interface') setThemeModalOpen(true);
    else if (item.category === 'Client') setVersionModalOpen(true);
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-[#050508] text-white font-sans"
      style={accentStyles}
    >
      {/* Main Container with rounded corners and glass effect */}
      <div
        className="w-full h-full max-w-[1400px] max-h-[900px] bg-[#0c0c10]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative"
        onMouseDown={handleDrag}
        style={{ userSelect: 'none' }}
      >
        {/* Background ambience */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[var(--accent-500)] opacity-[0.04] rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-[var(--accent-700)] opacity-[0.03] rounded-full blur-[80px]"></div>
        </div>

        {/* Header - draggable area */}
        <Header onOpenSettings={() => setSettingsModalOpen(true)} />

        {/* Switch to classic - small link in header area */}
        <button
          onClick={onSwitchLayout}
          className="absolute top-3 right-24 z-30 text-[10px] text-gray-500 hover:text-[var(--accent-400)] transition-colors uppercase tracking-wider font-bold"
          onMouseDown={e => e.stopPropagation()}
        >
          Classic View
        </button>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-10 pb-6 relative z-10 custom-scrollbar">

          {/* === 2-Column Main Layout === */}
          <div className="flex gap-6 min-h-0">

            {/* LEFT COLUMN: Update Card + Version Info + Launch Button */}
            <div className="w-[340px] shrink-0 flex flex-col gap-4">

              {/* Update Card */}
              <div className="w-full relative rounded-xl overflow-hidden bg-gradient-to-br from-[var(--accent-700)] to-[var(--accent-600)] shadow-xl group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--accent-500-30)] via-transparent to-transparent"></div>
                <div className="relative p-6 flex flex-col min-h-[200px]">
                  <div className="flex justify-end">
                    <span className="bg-[#0f0f11]/80 backdrop-blur px-2.5 py-1 rounded text-xs text-[var(--accent-100)] font-bold tracking-wide border border-[var(--accent-500-20)]">
                      07/02/2026
                    </span>
                  </div>
                  <div className="mt-auto">
                    <h2 className="text-2xl font-black text-white mb-2 tracking-tight">ZAVZ Injector v2.1.0</h2>
                    <div className="h-1 w-12 bg-white/20 rounded-full group-hover:w-24 transition-all duration-700"></div>
                  </div>
                </div>
              </div>

              {/* Changelog info */}
              <div className="space-y-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-500)]"></div>
                  <span className="text-xs text-gray-300">fix(core): Memory leak in pipe (#992)</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Experimental build. Use at your own risk on main accounts. Integrity check passed.
                </p>
              </div>

              {/* Version Info Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#18181b] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[var(--accent-500-30)] transition-colors cursor-pointer group">
                  <InjectorIcon />
                  <div className="text-center">
                    <span className="text-white font-bold text-sm block">v1.0.0</span>
                    <span className="text-gray-500 text-[10px] uppercase tracking-wider">Injector</span>
                  </div>
                </div>
                <div
                  onClick={() => setVersionModalOpen(true)}
                  className="bg-[#18181b] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[var(--accent-500-30)] transition-colors cursor-pointer group"
                >
                  <MinecraftIcon />
                  <div className="text-center">
                    <span className="text-white font-bold text-sm block">.jar</span>
                    <span className="text-gray-500 text-[10px] uppercase tracking-wider">Minecraft</span>
                  </div>
                </div>
              </div>

              {/* LAUNCH INJECTOR Button */}
              <button
                onClick={() => setInjectionModalOpen(true)}
                className="w-full bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white font-black text-lg py-4 rounded-xl shadow-[0_4px_30px_var(--accent-shadow)] hover:shadow-[0_8px_40px_var(--accent-shadow)] transition-all active:scale-[0.98] uppercase tracking-wider"
              >
                LAUNCH INJECTOR
              </button>

              {/* Expand arrow */}
              <div className="flex justify-center">
                <ChevronDown size={18} className="text-gray-600 animate-bounce" />
              </div>
            </div>

            {/* RIGHT COLUMN: News Grid (2-column masonry) */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-2 gap-4 auto-rows-auto">
                {NEWS_ITEMS.map(item => (
                  <NewsCard key={item.id} item={item} onAction={handleNewsAction} />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer: Social Links */}
        <div className="shrink-0 px-10 py-4 border-t border-white/5 bg-[#0a0a0c]/50 flex items-center justify-center gap-6 relative z-10">
          <a href="#" className="text-gray-500 hover:text-white transition-colors">
            <ZIcon className="w-5 h-5" />
          </a>
          <a href="https://github.com/opZywl" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
            <GithubIcon className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-500 hover:text-[#5865F2] transition-colors">
            <DiscordIcon className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-500 hover:text-[#1DA1F2] transition-colors">
            <TwitterIcon className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-500 hover:text-red-500 transition-colors">
            <YoutubeIcon className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 ml-4 text-xs font-medium">
            <ExternalLink size={12} />
            zavzinjector.net
          </a>
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
    </div>
  );
};

export default NewLayoutApp;
