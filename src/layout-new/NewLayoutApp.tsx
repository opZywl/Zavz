import { useState, useMemo, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { resolveResource } from '@tauri-apps/api/path';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Header } from './components/Header';
import { NewsCard } from './components/NewsCard';
import { UpdateCard } from './components/UpdateCard';
import { InjectorIcon, MinecraftIcon, ZIcon, GithubIcon, DiscordIcon, TwitterIcon, YoutubeIcon } from './components/Icons';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { ThemeModal } from './components/ThemeModal';
import { VersionModal } from './components/VersionModal';
import { ClientSelectionModal } from './components/ClientSelectionModal';
import { SettingsModal } from './components/SettingsModal';
import { InjectionModal } from './components/InjectionModal';
import type { LogType, LogEntry } from '../components/ui';

// ---- Types ----
export interface ThemeColor {
    100: string;
    400: string;
    500: string;
    600: string;
    700: string;
    900: string;
    shadow: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  imageUrl?: string;
  linkText: string;
  url?: string;
}

// ---- Theme Utilities ----
const adjustColor = (hex: string, factor: number): string => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.min(255, Math.max(0, Math.round(r * factor)));
    g = Math.min(255, Math.max(0, Math.round(g * factor)));
    b = Math.min(255, Math.max(0, Math.round(b * factor)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const hexToRgba = (hex: string, alpha: number) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt("0x" + hex[1] + hex[1]);
        g = parseInt("0x" + hex[2] + hex[2]);
        b = parseInt("0x" + hex[3] + hex[3]);
    } else if (hex.length === 7) {
        r = parseInt("0x" + hex[1] + hex[2]);
        g = parseInt("0x" + hex[3] + hex[4]);
        b = parseInt("0x" + hex[5] + hex[6]);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const generateTheme = (baseColor: string): ThemeColor => {
    return {
        100: adjustColor(baseColor, 1.8),
        400: adjustColor(baseColor, 1.2),
        500: baseColor,
        600: adjustColor(baseColor, 0.9),
        700: adjustColor(baseColor, 0.7),
        900: adjustColor(baseColor, 0.4),
        shadow: hexToRgba(baseColor, 0.4)
    };
};

// ---- Theme Presets ----
const defaultThemes: Record<string, ThemeColor> = {
  red: {
    100: '#fee2e2', 400: '#f87171', 500: '#ef4444',
    600: '#dc2626', 700: '#b91c1c', 900: '#7f1d1d',
    shadow: 'rgba(220, 38, 38, 0.4)'
  },
  blue: {
    100: '#dbeafe', 400: '#60a5fa', 500: '#3b82f6',
    600: '#2563eb', 700: '#1d4ed8', 900: '#1e3a8a',
    shadow: 'rgba(37, 99, 235, 0.4)'
  },
  purple: {
    100: '#f3e8ff', 400: '#c084fc', 500: '#a855f7',
    600: '#9333ea', 700: '#7e22ce', 900: '#581c87',
    shadow: 'rgba(147, 51, 234, 0.4)'
  },
  green: {
    100: '#dcfce7', 400: '#4ade80', 500: '#22c55e',
    600: '#16a34a', 700: '#15803d', 900: '#14532d',
    shadow: 'rgba(22, 163, 74, 0.4)'
  },
  orange: {
    100: '#ffedd5', 400: '#fb923c', 500: '#f97316',
    600: '#ea580c', 700: '#c2410c', 900: '#7c2d12',
    shadow: 'rgba(234, 88, 12, 0.4)'
  },
  pink: {
    100: '#fce7f3', 400: '#f472b6', 500: '#ec4899',
    600: '#db2777', 700: '#be185d', 900: '#831843',
    shadow: 'rgba(236, 72, 153, 0.4)'
  },
  cyan: {
    100: '#cffafe', 400: '#22d3ee', 500: '#06b6d4',
    600: '#0891b2', 700: '#0e7490', 900: '#164e63',
    shadow: 'rgba(6, 182, 212, 0.4)'
  },
  yellow: {
    100: '#fef9c3', 400: '#facc15', 500: '#eab308',
    600: '#ca8a04', 700: '#a16207', 900: '#713f12',
    shadow: 'rgba(234, 179, 8, 0.4)'
  },
  gradient: {
    100: '#ffe4e6', 400: '#f43f5e', 500: '#e11d48',
    600: '#be123c', 700: '#9f1239', 900: '#881337',
    shadow: 'rgba(225, 29, 72, 0.4)'
  }
};

// ---- News Data ----
const newsItems: NewsItem[] = [
  {
    id: '1', category: 'Client', title: 'FDPCLIENT', date: '10/11/2025',
    description: 'b16 released changelog. Check out the new features and improvements.',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=800&auto=format&fit=crop',
    linkText: 'Download', url: 'https://fdpinfo.github.io/next/'
  },
  {
    id: '2', category: 'Interface', title: 'Interface Customization is Live', date: '24/10/2025',
    description: 'Customize your injector experience with our new dynamic theming engine. Click to edit.',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-efdeb6bf80d1?q=80&w=800&auto=format&fit=crop',
    linkText: 'Customize'
  },
  {
    id: '3', category: 'Proxy', title: 'ZavzProxy Is Expanding', date: '24/10/2025',
    description: '15 global locations and over 40k unique IPs used monthly!',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    linkText: 'Read more'
  },
  {
    id: '4', category: 'Website', title: 'The New Zavz Website is Live!', date: '09/05/2025',
    description: 'We finally gave the Zavz website a fresh new look. Hope you like it!',
    imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=800&auto=format&fit=crop',
    linkText: 'Visit Site'
  },
  {
    id: '5', category: 'Update', title: 'New Injection Method', date: '08/02/2026',
    description: 'Added reflective loader support for enhanced stability on newer anti-cheats.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
    linkText: 'Read Changelog'
  },
  {
    id: '6', category: 'Script', title: 'Bedwars Auto-Play', date: '07/02/2026',
    description: 'Beta release of the automated bedwars script. Use at your own risk.',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop',
    linkText: 'Get Script'
  }
];

// ---- Social Link Component with Tooltip ----
const SocialLink = ({ icon, label, link }: { icon: React.ReactNode, label: string, link?: string }) => (
    <a
        href={link || "#"}
        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[var(--accent-400)] transition-colors relative group"
    >
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--accent-500)] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap shadow-lg z-50">
            {label}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--accent-500)] rotate-45"></div>
        </div>
        {icon}
    </a>
);

// ---- Main Component ----
interface NewLayoutAppProps {
  onSwitchLayout: () => void;
}

const NewLayoutApp: React.FC<NewLayoutAppProps> = ({ onSwitchLayout }) => {
  // Theme state
  const [currentThemeKey, setCurrentThemeKey] = useState<string>('red');
  const [customHex, setCustomHex] = useState<string>('#ef4444');
  const [isCustom, setIsCustom] = useState(false);

  // Modal state
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isInjectionModalOpen, setIsInjectionModalOpen] = useState(false);

  // Dragging via Tauri native API

  // Injection state (Tauri integration)
  const [targetProcess, setTargetProcess] = useState('javaw.exe');
  const [dllPath, setDllPath] = useState('native.dll');
  const [injectionMethod, setInjectionMethod] = useState('Standard');
  const [fdpMode, setFdpMode] = useState(false);
  const [fdpPath, setFdpPath] = useState('release.jar');
  const [jvmArgs, setJvmArgs] = useState('-Xmx4G -XX:+UseG1GC -noverify');
  const [autoClose, setAutoClose] = useState(false);
  const [watcherActive, setWatcherActive] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // ---- Theme computation ----
  const activeTheme = useMemo(() => {
    if (isCustom) return generateTheme(customHex);
    return defaultThemes[currentThemeKey];
  }, [currentThemeKey, customHex, isCustom]);

  const appStyle = {
    '--accent-100': activeTheme[100],
    '--accent-400': activeTheme[400],
    '--accent-500': activeTheme[500],
    '--accent-600': activeTheme[600],
    '--accent-700': activeTheme[700],
    '--accent-900': activeTheme[900],
    '--accent-shadow': activeTheme.shadow,
    '--accent-shadow-light': hexToRgba(activeTheme[500], 0.2),
    '--accent-500-30': hexToRgba(activeTheme[500], 0.3),
    '--accent-500-20': hexToRgba(activeTheme[500], 0.2),
  } as React.CSSProperties;

  // ---- Helpers ----
  const addLog = (message: string, type: LogType = 'info') => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-GB', { hour12: false });
    const id = Math.random().toString(36).substr(2, 9);
    setLogs(prev => [...prev, { id, time: timeString, message, type }]);
  };

  // ---- Tauri Effects ----
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

  // ---- Handlers ----
  const handleInject = async () => {
    if (!dllPath) { addLog('No DLL selected.', 'error'); return; }
    addLog(`Injecting on ${targetProcess}...`, 'system');
    const methodMap: Record<string, string> = {
      'Standard': 'standard', 'Manual': 'manual_map',
      'Thread Hijack': 'thread_hijack', 'Reflective': 'reflective',
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
        'Standard': 'standard', 'Manual': 'manual_map',
        'Thread Hijack': 'thread_hijack', 'Reflective': 'reflective',
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

  // ---- News Actions ----
  const handleNewsAction = (item: NewsItem) => {
    if (item.url) { window.open(item.url, '_blank'); return; }
    if (item.category === 'Interface') setIsThemeModalOpen(true);
  };

  // ---- Tauri Native Drag ----
  const handleDrag = async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a') || target.closest('.no-drag') || target.closest('[role="button"]')) return;
    try { await getCurrentWindow().startDragging(); } catch {}
  };

  return (
    <div style={appStyle} className="w-full h-full bg-[#09090b] flex flex-col relative overflow-hidden text-white selection:bg-[var(--accent-500-30)] font-sans transition-colors duration-500 cursor-default">

        <Header onOpenSettings={() => setIsSettingsModalOpen(true)} onDrag={handleDrag} />

        {/* Switch to classic layout */}
        <button
          onClick={onSwitchLayout}
          className="absolute top-5 right-24 z-30 text-[10px] text-gray-500 hover:text-[var(--accent-400)] transition-colors uppercase tracking-wider font-bold"
        >
          Classic View
        </button>

        {/* Content Area */}
        <div className="flex-1 px-10 pb-4 pt-0 flex gap-8 h-full overflow-hidden">

          {/* Left Column */}
          <div className="w-[340px] flex flex-col h-full pt-2">
            <UpdateCard />

            <div className="mt-5 mb-8 pl-1">
               <p className="text-gray-400 text-sm font-medium mb-3 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-500)] animate-pulse"></span>
                   fix(core): Memory leak in pipe (#992)
               </p>
               <p className="text-gray-500 text-sm leading-relaxed">
                 Experimental build. Use at your own risk on main accounts. Integrity check passed.
               </p>
            </div>

            <div className="mt-auto space-y-4 mb-2">
                 {/* Version Selectors */}
                <div className="flex gap-4">
                    <div onClick={() => setIsClientModalOpen(true)} className="flex-1 bg-[#101012] rounded-lg p-3 flex flex-col items-center justify-center gap-2 border border-white/5 hover:border-[var(--accent-500-30)] hover:bg-[#18181b] cursor-pointer transition-all h-28 group">
                         <InjectorIcon />
                         <span className="text-sm font-bold text-white mt-1 group-hover:text-[var(--accent-400)]">v1.0.0</span>
                         <span className="text-[10px] text-gray-500">Injector</span>
                    </div>
                    <div onClick={() => setIsVersionModalOpen(true)} className="flex-1 bg-[#101012] rounded-lg p-3 flex flex-col items-center justify-center gap-2 border border-white/5 hover:border-[var(--accent-500-30)] hover:bg-[#18181b] cursor-pointer transition-all h-28 group">
                         <MinecraftIcon />
                         <span className="text-sm font-bold text-white mt-1 group-hover:text-[var(--accent-400)]">.jar</span>
                         <span className="text-[10px] text-gray-500">Minecraft</span>
                    </div>
                </div>

                <button
                  onClick={() => setIsInjectionModalOpen(true)}
                  className="w-full h-14 bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white font-black text-lg rounded-lg shadow-[0_4px_20px_var(--accent-shadow)] transition-all transform active:scale-[0.98] uppercase tracking-wide"
                >
                   Launch Injector
                </button>
            </div>
          </div>

          {/* Right Column (News Grid) */}
          <div className="flex-1 relative group/news h-full">
             <div className="absolute inset-0 overflow-y-auto pr-2 pb-14 scrollbar-thin pt-2">
                <div className="grid grid-cols-2 gap-4">
                    {newsItems.map((item) => (
                        <NewsCard key={item.id} item={item} onAction={handleNewsAction} />
                    ))}
                </div>
             </div>

             {/* Bottom Fade Gradient */}
             <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#09090b] via-[#09090b]/90 to-transparent pointer-events-none"></div>

             {/* Floating Chevron */}
             <div className="absolute bottom-1 left-1/2 -translate-x-1/2 pb-1 z-20 pointer-events-none">
                 <div className="text-gray-500 animate-bounce transition-colors duration-[2000ms]">
                     <ChevronDown size={28} />
                 </div>
             </div>
          </div>

        </div>

        {/* Footer Bar */}
        <div className="px-10 h-[88px] flex items-center justify-end relative z-30 bg-[#09090b] border-t border-white/5">
             <div className="flex items-center bg-[#0e0e11] p-1.5 rounded-lg border border-white/5 shadow-lg">
                 <SocialLink icon={<ZIcon className="w-6 h-6" />} label="Zavz" />
                 <SocialLink icon={<GithubIcon className="w-5 h-5" />} label="GitHub" />
                 <SocialLink icon={<DiscordIcon className="w-5 h-5" />} label="Discord" />
                 <SocialLink icon={<TwitterIcon className="w-5 h-5" />} label="Twitter" />
                 <SocialLink icon={<YoutubeIcon className="w-5 h-5" />} label="YouTube" />

                 <a
                    href="https://zavzinjector.net"
                    className="relative flex items-center gap-2 pl-3 pr-4 py-1.5 ml-2 rounded-lg overflow-hidden group bg-[#18181b]"
                 >
                    <div className="absolute inset-0 bg-[var(--accent-600)] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    <div className="relative z-10 flex items-center gap-2">
                        <div className="w-6 h-6 bg-[var(--accent-600)] group-hover:bg-white/20 rounded flex items-center justify-center transition-colors shadow-sm">
                            <ExternalLink size={14} className="text-white" />
                        </div>
                        <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">zavzinjector.net</span>
                    </div>
                </a>
             </div>
        </div>

        {/* Modals */}
        <InjectionModal
          isOpen={isInjectionModalOpen}
          onClose={() => setIsInjectionModalOpen(false)}
          onInject={handleInject}
          dllPath={dllPath}
          setDllPath={setDllPath}
          fdpMode={fdpMode}
          setFdpMode={setFdpMode}
        />
        <ClientSelectionModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
        />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
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
          isOpen={isVersionModalOpen}
          onClose={() => setIsVersionModalOpen(false)}
          fdpPath={fdpPath}
          setFdpPath={setFdpPath}
        />
        <ThemeModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
          currentTheme={currentThemeKey}
          setTheme={setCurrentThemeKey}
          themes={defaultThemes as any}
          customHex={customHex}
          setCustomHex={setCustomHex}
          isCustom={isCustom}
          setIsCustom={setIsCustom}
        />
    </div>
  );
};

export default NewLayoutApp;
