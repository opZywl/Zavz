import { useState, useMemo, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { resolveResource } from '@tauri-apps/api/path';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Header } from './components/Header';
import { NewsCard } from './components/NewsCard';
import { UpdateCard } from './components/UpdateCard';
import {
  InjectorIcon,
  GithubIcon,
  DiscordIcon,
  TwitterIcon,
  YoutubeIcon,
  ExternalLink,
  ChevronDown,
} from './components/Icons';
import { NicknameModal } from './components/NicknameModal';
import { UpdateAlertModal } from './components/UpdateAlertModal';
import { openExternal } from './utils/openExternal';
import { fetchInjectorConfig } from './utils/apiConnector';
import { ThemeModal } from './components/ThemeModal';
import { VersionModal } from './components/VersionModal';
import { ClientSelectionModal } from './components/ClientSelectionModal';
import { SettingsModal } from './components/SettingsModal';
import { InjectionModal } from './components/InjectionModal';

// ---- Types ----
export type LogType = 'info' | 'success' | 'error' | 'warning' | 'system';

export interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: LogType;
}

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
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt('0x' + hex[1] + hex[1]);
    g = parseInt('0x' + hex[2] + hex[2]);
    b = parseInt('0x' + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt('0x' + hex[1] + hex[2]);
    g = parseInt('0x' + hex[3] + hex[4]);
    b = parseInt('0x' + hex[5] + hex[6]);
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
    shadow: hexToRgba(baseColor, 0.4),
  };
};

// ---- Theme Presets ----
const defaultThemes: Record<string, ThemeColor> = {
  red: {
    100: '#fee2e2',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    900: '#7f1d1d',
    shadow: 'rgba(220, 38, 38, 0.4)',
  },
  blue: {
    100: '#dbeafe',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a',
    shadow: 'rgba(37, 99, 235, 0.4)',
  },
  purple: {
    100: '#f0ccff',
    400: '#d633ff',
    500: '#c500ff',
    600: '#a600d6',
    700: '#8200a8',
    900: '#4a0061',
    shadow: 'rgba(197, 0, 255, 0.4)',
  },
  green: {
    100: '#dcfce7',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    900: '#14532d',
    shadow: 'rgba(22, 163, 74, 0.4)',
  },
  orange: {
    100: '#ffedd5',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    900: '#7c2d12',
    shadow: 'rgba(234, 88, 12, 0.4)',
  },
  pink: {
    100: '#fce7f3',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    900: '#831843',
    shadow: 'rgba(236, 72, 153, 0.4)',
  },
  cyan: {
    100: '#cffafe',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    900: '#164e63',
    shadow: 'rgba(6, 182, 212, 0.4)',
  },
  yellow: {
    100: '#fef9c3',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    900: '#713f12',
    shadow: 'rgba(234, 179, 8, 0.4)',
  },
  black: {
    100: '#d4d4d8',
    400: '#71717a',
    500: '#3f3f46',
    600: '#27272a',
    700: '#18181b',
    900: '#09090b',
    shadow: 'rgba(63, 63, 70, 0.4)',
  },
  gradient: {
    100: '#ffe4e6',
    400: '#f43f5e',
    500: '#e11d48',
    600: '#be123c',
    700: '#9f1239',
    900: '#881337',
    shadow: 'rgba(225, 29, 72, 0.4)',
  },
};

// ---- News Data (fallback, overridden by config/cards.json) ----
const defaultNewsItems: NewsItem[] = [
  {
    id: '1',
    category: 'Client',
    title: 'FDPCLIENT',
    date: '10/11/2025',
    description: 'b16 released changelog. Check out the new features and improvements.',
    imageUrl: '/img/icon/social/fdp-logo.png',
    linkText: 'Download',
    url: 'https://fdpinfo.github.io/next/',
  },
  {
    id: '2',
    category: 'Interface',
    title: 'Interface Custom',
    date: '24/10/2025',
    description:
      'Customize your loader experience with our new dynamic theming engine. Click to edit.',
    imageUrl: '/img/card/color.jpg',
    linkText: 'Customize',
  },
  {
    id: '3',
    category: 'News',
    title: '',
    description: '',
    imageUrl: '',
    date: '',
    linkText: 'Coming Soon',
  },
  {
    id: '4',
    category: 'Website',
    title: '',
    description: '',
    imageUrl: '',
    date: '',
    linkText: 'Coming Soon',
  },
  {
    id: '5',
    category: 'Update',
    title: '',
    description: '',
    imageUrl: '',
    date: '',
    linkText: 'Coming Soon',
  },
  {
    id: '6',
    category: 'Script',
    title: '',
    description: '',
    imageUrl: '',
    date: '',
    linkText: 'Coming Soon',
  },
];

// ---- Social Link Component with Tooltip (opens in system browser) ----
const SocialLink = ({
  icon,
  label,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  link?: string;
}) => (
  <button
    onClick={() => {
      if (link) openExternal(link);
    }}
    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-colors duration-200 relative group"
  >
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--accent-500)] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap shadow-lg z-50">
      {label}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--accent-500)] rotate-45"></div>
    </div>
    {icon}
  </button>
);

// ---- Main Component ----
const App = () => {
  // Nickname state (persisted in localStorage)
  const [nickname, setNickname] = useState<string>(
    () => localStorage.getItem('zavz-nickname') || ''
  );

  const handleNicknameConfirm = (name: string) => {
    localStorage.setItem('zavz-nickname', name);
    setNickname(name);
  };

  // Remote config state (from injector.txt)
  const [appVersion, setAppVersion] = useState<string>('v1.0.0');
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);
  const [newsItems, setNewsItems] = useState<NewsItem[]>(defaultNewsItems);

  // Fetch remote config and card config on mount
  useEffect(() => {
    fetchInjectorConfig().then((config) => {
      setAppVersion(config.version);
      if (config.showUpdateAlert) setShowUpdateAlert(true);
    });

    // Load cards from JSON config
    fetch('/config/cards.json')
      .then((res) => res.json())
      .then((data: { cards?: any[] }) => {
        if (data.cards && Array.isArray(data.cards)) {
          const items: NewsItem[] = data.cards
            .filter((c: any) => c.enabled !== false)
            .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
            .map((c: any) => ({
              id: c.id,
              category: c.category || '',
              title: c.title || '',
              description: c.description || '',
              date: c.date || '',
              imageUrl: c.imageUrl || '',
              linkText: c.linkText || 'Coming Soon',
              url: c.url || undefined,
            }));
          setNewsItems(items);
        }
      })
      .catch(() => {
        /* use default items */
      });
  }, []);

  // Theme state
  const [currentThemeKey, setCurrentThemeKey] = useState<string>('purple');
  const [customHex, setCustomHex] = useState<string>('#c500ff');
  const [isCustom, setIsCustom] = useState(false);
  const [glowEnabled, setGlowEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem('zavz-glow');
    return stored !== null ? stored === 'true' : true;
  });

  // Modal state
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isInjectionModalOpen, setIsInjectionModalOpen] = useState(false);

  // Injection state (Tauri integration)
  const [targetProcess, setTargetProcess] = useState('javaw.exe');
  const [dllPath, setDllPath] = useState('native.dll');
  const [injectionMethod, setInjectionMethod] = useState('Standard');
  const [fdpMode, setFdpMode] = useState(false);
  const [fdpPath, setFdpPath] = useState('release.jar');
  const [jvmArgs, setJvmArgs] = useState('-Xmx4G -XX:+UseG1GC -noverify');
  const [autoClose, setAutoClose] = useState(false);
  const [streamerMode, setStreamerMode] = useState(false);
  const [discordRpc, setDiscordRpc] = useState(true);
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
    setLogs((prev) => [...prev, { id, time: timeString, message, type }]);
  };

  // ---- Tauri Effects ----
  useEffect(() => {
    if (logs.length === 0) {
      addLog('Zavz v2 initialized', 'system');
      invoke<any>('get_settings')
        .then((settings) => {
          if (settings.jvmArgs) setJvmArgs(settings.jvmArgs);
          if (settings.injectionMethod) {
            const methodMap: Record<string, string> = {
              standard: 'Standard',
              manual_map: 'Manual',
              thread_hijack: 'Thread Hijack',
              reflective: 'Reflective',
            };
            setInjectionMethod(methodMap[settings.injectionMethod] || 'Standard');
          }
          if (settings.autoClose !== undefined) setAutoClose(settings.autoClose);
          if (settings.fdpJarPath) setFdpPath(settings.fdpJarPath);
        })
        .catch(() => {});
    }

    const unlisten1 = listen<string>('watcher-status', (event) => {
      addLog(event.payload, 'system');
    });
    const unlisten2 = listen<string>('injection-log', (event) => {
      addLog(event.payload, 'info');
    });
    return () => {
      unlisten1.then((fn) => fn());
      unlisten2.then((fn) => fn());
    };
  }, []);

  // ---- Handlers ----
  const handleInject = async (mode: 'manual' | 'fdp') => {
    const methodMap: Record<string, string> = {
      Standard: 'standard',
      Manual: 'manual_map',
      'Thread Hijack': 'thread_hijack',
      Reflective: 'reflective',
    };

    const tryInject = async (path: string) => {
      return invoke<string>('inject_dll', {
        request: {
          target: targetProcess,
          dllPath: path,
          method: methodMap[injectionMethod] || 'standard',
        },
      });
    };

    const normalizeError = (message: string, usedPath: string) => {
      if (message.includes('System operation failed')) {
        return `DLL path is invalid or missing: ${usedPath}`;
      }
      return message;
    };

    const injectWithResolvedFdpPath = async () => {
      const candidates: string[] = [];
      try {
        candidates.push(await resolveResource('native.dll'));
      } catch {}
      candidates.push('src/load/native.dll');
      candidates.push('native.dll');

      const uniqueCandidates = [...new Set(candidates.filter(Boolean))];
      let lastError = 'FDP payload DLL not found.';

      for (const candidate of uniqueCandidates) {
        try {
          setDllPath(candidate);
          return await tryInject(candidate);
        } catch (error) {
          const message = normalizeError(
            error instanceof Error ? error.message : String(error),
            candidate
          );
          lastError = message;
          if (message.includes('DLL path is invalid or missing')) {
            continue;
          }
          throw new Error(message);
        }
      }

      throw new Error(lastError);
    };

    try {
      addLog(`Injecting on ${targetProcess}...`, 'system');

      if (mode === 'manual' && !dllPath.trim()) {
        throw new Error('No DLL selected.');
      }

      const result =
        mode === 'fdp'
          ? await injectWithResolvedFdpPath()
          : await tryInject(dllPath?.trim() || '');

      addLog(result, 'success');
      if (autoClose) {
        setTimeout(async () => {
          try {
            await getCurrentWindow().close();
          } catch {}
        }, 3000);
      }
    } catch (error) {
      const usedPath = mode === 'fdp' ? dllPath || 'native.dll' : dllPath || '<empty>';
      const message = normalizeError(
        error instanceof Error ? error.message : String(error),
        usedPath
      );
      addLog(`Injection failed: ${message}`, 'error');
      throw new Error(message);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const methodMap: Record<string, string> = {
        Standard: 'standard',
        Manual: 'manual_map',
        'Thread Hijack': 'thread_hijack',
        Reflective: 'reflective',
      };
      await invoke('save_settings', {
        settings: {
          jvmArgs,
          injectionMethod: methodMap[injectionMethod] || 'standard',
          autoClose,
          randomWindowTitle: streamerMode,
          fdpJarPath: fdpPath,
          fdpWrapper: 'lunar',
        },
      });
      addLog('Settings saved!', 'success');
    } catch (error) {
      addLog(`Save failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  const handleWatcherToggle = async (enabled: boolean) => {
    setWatcherActive(enabled);
    if (enabled) {
      if (!dllPath) {
        addLog('No DLL selected', 'error');
        setWatcherActive(false);
        return;
      }
      try {
        const methodMap: Record<string, string> = {
          Standard: 'standard',
          Manual: 'manual_map',
          'Thread Hijack': 'thread_hijack',
          Reflective: 'reflective',
        };
        const result = await invoke<string>('start_watcher', {
          request: {
            target: targetProcess,
            dllPath,
            method: methodMap[injectionMethod] || 'standard',
          },
        });
        addLog(result, 'success');
      } catch (error) {
        addLog(
          `Watcher failed: ${error instanceof Error ? error.message : String(error)}`,
          'error'
        );
        setWatcherActive(false);
      }
    } else {
      try {
        const result = await invoke<string>('stop_watcher');
        addLog(result, 'warning');
      } catch (error) {
        addLog(`Stop failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
      }
    }
  };

  const handleLaunchJvm = async () => {
    if (!fdpPath) {
      addLog('No JAR file selected.', 'error');
      return;
    }
    addLog(`Launching Java with arguments: ${jvmArgs}`, 'info');
    addLog(`JAR path: ${fdpPath}`, 'system');
    try {
      const result = await invoke<string>('launch_jvm', {
        request: { jarPath: fdpPath, jvmArgs },
      });
      addLog(result, 'success');
    } catch (error) {
      addLog(
        `Failed to launch JVM: ${error instanceof Error ? error.message : String(error)}`,
        'error'
      );
    }
  };

  // ---- News Actions ----
  const handleNewsAction = (item: NewsItem) => {
    if (item.url) {
      openExternal(item.url);
      return;
    }
    if (item.category === 'Interface') setIsThemeModalOpen(true);
  };

  // ---- Tauri Native Drag ----
  const handleDrag = async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('a') ||
      target.closest('.no-drag') ||
      target.closest('[role="button"]')
    )
      return;
    try {
      await getCurrentWindow().startDragging();
    } catch {}
  };

  // Show nickname screen if not set
  if (!nickname) {
    return (
      <div
        style={appStyle}
        className="h-screen w-screen bg-[#09090b] flex flex-col relative overflow-hidden text-white selection:bg-[var(--accent-500-30)] font-sans transition-colors duration-500 cursor-default"
      >
        <NicknameModal onConfirm={handleNicknameConfirm} />
      </div>
    );
  }

  return (
    <div
      style={appStyle}
      className="h-screen w-screen bg-[#09090b] flex flex-col relative overflow-hidden text-white selection:bg-[var(--accent-500-30)] font-sans transition-colors duration-500 cursor-default"
    >
      <Header
        nickname={nickname}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onDrag={handleDrag}
      />

      {/* Content Area */}
      <div className="flex-1 min-h-0 px-8 pb-0 pt-0 flex gap-6 overflow-hidden">
        {/* Left Column */}
        <div className="w-[320px] flex flex-col min-h-0 pt-1">
          <UpdateCard version={appVersion} glowEnabled={glowEnabled} />

          <div className="mt-4 mb-6 pl-1">
            <p className="text-gray-400 text-[13px] font-medium mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-500)] animate-pulse shrink-0"></span>
              Release B1: The First Beta Version Is Now Available
            </p>
            <p className="text-gray-600 text-[13px] leading-relaxed">
              If something goes wrong, just tell everyone it's an Easter egg. It's a feature, not a bug!
            </p>
          </div>

          <div className="mt-auto space-y-3 mb-3">
            {/* Version Selectors - Centered vertical like LiquidBounce */}
            <div className="flex gap-3">
              <div
                onClick={() => setIsClientModalOpen(true)}
                className="flex-1 bg-[#111114] rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 border border-white/[0.06] hover:border-[var(--accent-500-30)] cursor-pointer transition-all group"
              >
                <InjectorIcon />
                <span className="text-[13px] font-bold text-white mt-1 group-hover:text-[var(--accent-400)] transition-colors">
                  {appVersion}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">Injector</span>
              </div>
              <div
                onClick={() => setIsVersionModalOpen(true)}
                className="flex-1 bg-[#111114] rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 border border-white/[0.06] hover:border-[var(--accent-500-30)] cursor-pointer transition-all group"
              >
                <img
                  src="/img/icon/social/icon-version-mc.png"
                  alt="Minecraft"
                  className="w-10 h-10 object-contain drop-shadow-lg"
                />
                <span className="text-[13px] font-bold text-white mt-1 group-hover:text-[var(--accent-400)] transition-colors">
                  1.8.9
                </span>
                <span className="text-[10px] text-gray-500 font-medium">Minecraft</span>
              </div>
            </div>

            <button
              onClick={() => setIsInjectionModalOpen(true)}
              className={`w-full h-12 bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white font-bold text-[15px] rounded-2xl transition-all transform active:scale-[0.98] tracking-wide ${glowEnabled ? 'shadow-[0_4px_24px_var(--accent-shadow)]' : ''}`}
            >
              Launch Injector
            </button>
          </div>
        </div>

        {/* Right Column (News Grid) */}
        <div className="flex-1 relative group/news min-h-0">
          <div className="absolute inset-0 overflow-y-auto pr-1 pb-12 pt-1 scrollbar-thin">
            <div className="grid grid-cols-2 gap-4">
              {newsItems.map((item) => (
                <NewsCard key={item.id} item={item} onAction={handleNewsAction} />
              ))}
            </div>
          </div>

          {/* Bottom Fade Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent pointer-events-none"></div>

          {/* Floating Chevron */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="text-gray-600 animate-bounce">
              <ChevronDown size={26} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bar - LiquidBounce style with contour */}
      <div className="px-8 h-16 flex items-center justify-end relative z-30 shrink-0">
        <div className="flex items-center bg-[#111114] p-1.5 rounded-xl border border-white/[0.06]">
          <SocialLink
            icon={<GithubIcon className="w-5 h-5" />}
            label="GitHub"
            link="https://github.com/opZywl"
          />
          <SocialLink
            icon={<DiscordIcon className="w-5 h-5" />}
            label="Discord"
            link="https://discord.gg/3XRFGeqEYD"
          />
          <SocialLink
            icon={<TwitterIcon className="w-5 h-5" />}
            label="Twitter"
            link="https://fdpinfo.github.io/next/"
          />
          <SocialLink
            icon={<YoutubeIcon className="w-5 h-5" />}
            label="YouTube"
            link="https://www.youtube.com/@opZywl"
          />

          <button
            onClick={() => openExternal('https://lucas-lima.vercel.app/')}
            className="relative flex items-center gap-2 pl-3 pr-4 py-1.5 ml-1.5 rounded-lg overflow-hidden group bg-[#1a1a1f]"
          >
            <div className="absolute inset-0 bg-[var(--accent-600)] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <div className="relative z-10 flex items-center gap-2">
              <div className="w-6 h-6 bg-[var(--accent-600)] group-hover:bg-white/20 rounded flex items-center justify-center transition-colors shadow-sm">
                <ExternalLink size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                lucas-lima.xyz
              </span>
            </div>
          </button>
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
        autoClose={autoClose}
        setAutoClose={setAutoClose}
        streamerMode={streamerMode}
        setStreamerMode={setStreamerMode}
        discordRpc={discordRpc}
        setDiscordRpc={setDiscordRpc}
        onSave={handleSaveSettings}
        onLaunchJvm={handleLaunchJvm}
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
        glowEnabled={glowEnabled}
        setGlowEnabled={(v: boolean) => {
          setGlowEnabled(v);
          localStorage.setItem('zavz-glow', String(v));
        }}
      />
      <UpdateAlertModal
        isOpen={showUpdateAlert}
        onClose={() => setShowUpdateAlert(false)}
        version={appVersion}
      />
    </div>
  );
};

export default App;
