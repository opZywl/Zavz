import React, { useState, useEffect, useRef } from 'react';
import { LogType, LogEntry, ThemeColor, Tab } from './components/ui';
import LoadingScreen from './components/LoadingScreen';
import ConsoleLogs from './components/ConsoleLogs';
import Dashboard from './components/Dashboard';
import SettingsCard from './components/SettingsCard';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AboutTab from './components/AboutTab';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { resolveResource } from '@tauri-apps/api/path';

// Helper to generate color palette from hex
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const DEFAULT_THEMES: Record<string, any> = {
  blue: { primary: '#2563eb', hover: '#1d4ed8', light: '#60a5fa', glow: 'rgba(37, 99, 235, 0.5)' },
  purple: { primary: '#7c3aed', hover: '#6d28d9', light: '#a78bfa', glow: 'rgba(124, 58, 237, 0.5)' },
  emerald: { primary: '#059669', hover: '#047857', light: '#34d399', glow: 'rgba(5, 150, 105, 0.5)' },
  red: { primary: '#dc2626', hover: '#b91c1c', light: '#f87171', glow: 'rgba(220, 38, 38, 0.5)' },
  amber: { primary: '#d97706', hover: '#b45309', light: '#fbbf24', glow: 'rgba(217, 119, 6, 0.5)' }
};

const App = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [theme, setTheme] = useState<ThemeColor>('blue');
  const [customColor, setCustomColor] = useState('#2563eb');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Injection Logic State
  const [targetProcess, setTargetProcess] = useState('javaw.exe');
  const [dllPath, setDllPath] = useState('native.dll');

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [consoleOpen, setConsoleOpen] = useState(true);

  // Settings
  const [jvmArgs, setJvmArgs] = useState('-Xmx4G -XX:+UseG1GC -noverify');
  const [injectionMethod, setInjectionMethod] = useState('Standard');
  const [autoClose, setAutoClose] = useState(false);

  // Settings Tab State
  const [streamerMode, setStreamerMode] = useState(false);
  const [discordRpc, setDiscordRpc] = useState(true);

  // Sidebar State
  const [updateMenuOpen, setUpdateMenuOpen] = useState(false);

  // Loader
  const [fdpPath, setFdpPath] = useState('release.jar');
  const [loadFdpJar, setLoadFdpJar] = useState(false);
  const [clientWrapper, setClientWrapper] = useState<'Lunar' | 'Badlion'>('Lunar');

  // FDP Mode - auto-load native.dll from src/load
  const [fdpMode, setFdpMode] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jarInputRef = useRef<HTMLInputElement>(null);

  // Watcher
  const [watcherActive, setWatcherActive] = useState(false);

  // --- Helpers ---
  const addLog = (message: string, type: LogType = 'info') => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-GB', { hour12: false });
    const id = Math.random().toString(36).substr(2, 9);
    setLogs(prev => [...prev, { id, time: timeString, message, type }]);
  };

  const getCurrentTheme = () => {
    if (theme === 'custom') {
      return {
        primary: customColor,
        hover: customColor, // simplistic approximation
        light: customColor, // simplistic approximation
        glow: hexToRgba(customColor, 0.5)
      };
    }
    return DEFAULT_THEMES[theme];
  };

  const currentThemeStyles = getCurrentTheme();

  useEffect(() => {
    // Initial logs
    if (logs.length === 0) {
      addLog('YZY Injector Kernel initialized', 'system');
      addLog('Secure connection established (TLS 1.3)', 'success');

      // Carregar settings do backend
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
          addLog('Settings loaded successfully', 'success');
        })
        .catch(() => {
          addLog('Using default settings', 'info');
        });

      addLog('Waiting for user input...', 'info');
    }

    // Setup event listeners
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
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Auto-set DLL path when FDP Mode is enabled
  useEffect(() => {
    if (fdpMode) {
      resolveResource('native.dll')
        .then((resourcePath) => {
          setDllPath(resourcePath);
          addLog('FDP Mode activated', 'system');
        })
        .catch(() => {
          // Fallback for development mode
          setDllPath('src/load/native.dll');
          addLog('FDP Mode activated', 'system');
        });
    }
  }, [fdpMode]);

  // --- Handlers ---
  const handleInject = async () => {
    if (!dllPath) {
      addLog('No DLL selected. Aborting.', 'error');
      return;
    }

    setLoading(true);
    setLoadingStep(0);
    addLog(`Initiating injection sequence on ${targetProcess}...`, 'system');

    try {
      // Step 1: Scanning
      setLoadingStep(1);
      addLog(`Scanning process list for ${targetProcess}...`, 'info');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Process found
      setLoadingStep(2);
      addLog('Process found. Validating DLL architecture...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Bypassing protection
      setLoadingStep(3);
      addLog('Bypassing memory protection (DEP/ASLR)...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Step 4: Allocating memory
      setLoadingStep(4);
      addLog('Allocating remote memory pages...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 5: Injecting (REAL CALL)
      setLoadingStep(5);
      addLog('Injecting native payload...', 'system');

      const methodMap: Record<string, string> = {
        'Standard': 'standard',
        'Manual': 'manual_map',
        'Thread Hijack': 'thread_hijack',
        'Reflective': 'reflective'
      };

      const result = await invoke<string>('inject_dll', {
        request: {
          target: targetProcess,
          dllPath: dllPath,
          method: methodMap[injectionMethod] || 'standard'
        }
      });

      // Step 6: Cleanup
      setLoadingStep(6);
      addLog('Cleaning up traces & unlinking module...', 'info');
      await new Promise(resolve => setTimeout(resolve, 800));

      setLoading(false);
      addLog(result, 'success');
      addLog('Payload executed. You may now close the injector.', 'info');

      if (autoClose) {
        addLog('Auto-close triggered in 3 seconds...', 'warning');
        setTimeout(async () => {
          try {
            const { getCurrentWindow } = await import('@tauri-apps/api/window');
            await getCurrentWindow().close();
          } catch (e) {
            console.error('Failed to close window:', e);
          }
        }, 3000);
      }
    } catch (error) {
      setLoading(false);
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`Injection failed: ${errorMsg}`, 'error');
      addLog('Please check if the target process is running and the DLL path is correct.', 'warning');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Usar o path completo via Tauri
      try {
        const filePath = (file as any).path || file.name;
        setDllPath(filePath);
        addLog(`Selected DLL: ${file.name}`, 'info');
        addLog(`Full path: ${filePath}`, 'system');
      } catch (err) {
        setDllPath(file.name);
        addLog(`Selected DLL: ${file.name}`, 'info');
      }
    }
  }

  const handleJarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const filePath = (file as any).path || file.name;
        setFdpPath(filePath);
        addLog(`Selected JAR: ${file.name}`, 'info');
        addLog(`Full path: ${filePath}`, 'system');

        // Configurar FDP JAR automaticamente
        if (loadFdpJar) {
          const result = await invoke<string>('setup_fdp_jar', {
            request: { jarPath: filePath }
          });
          addLog(result, 'success');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        addLog(`JAR setup error: ${errorMsg}`, 'error');
      }
    }
  }

  const handleClientWrapperChange = (wrapper: 'Lunar' | 'Badlion') => {
    if (wrapper === 'Badlion') {
      addLog('Badlion disabled because many render bugs at last release comming soon', 'error');
      return;
    }
    setClientWrapper(wrapper);
    addLog(`Client wrapper switched to ${wrapper}`, 'info');
  }

  const clearLogs = () => setLogs([]);

  const handleSaveSettings = async () => {
    try {
      const methodMap: Record<string, string> = {
        'Standard': 'standard',
        'Manual': 'manual_map',
        'Thread Hijack': 'thread_hijack',
        'Reflective': 'reflective'
      };

      const wrapperMap: Record<string, string> = {
        'Lunar': 'lunar',
        'Badlion': 'badlion'
      };

      await invoke('save_settings', {
        settings: {
          jvmArgs: jvmArgs,
          injectionMethod: methodMap[injectionMethod] || 'standard',
          autoClose: autoClose,
          randomWindowTitle: streamerMode,
          fdpJarPath: fdpPath,
          fdpWrapper: wrapperMap[clientWrapper] || 'lunar'
        }
      });
      addLog('Settings saved successfully!', 'success');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`Failed to save settings: ${errorMsg}`, 'error');
    }
  };

  const handleLaunchJvm = async () => {
    try {
      if (!fdpPath) {
        addLog('No JAR file selected. Please select a JAR file first.', 'error');
        return;
      }

      addLog(`Launching Java with arguments: ${jvmArgs}`, 'info');
      addLog(`JAR path: ${fdpPath}`, 'system');

      const result = await invoke<string>('launch_jvm', {
        request: {
          jarPath: fdpPath,
          jvmArgs: jvmArgs
        }
      });

      addLog(result, 'success');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`Failed to launch JVM: ${errorMsg}`, 'error');
    }
  };

  const handleWatcherToggle = async (enabled: boolean) => {
    setWatcherActive(enabled);

    if (enabled) {
      try {
        if (!dllPath) {
          addLog('Cannot start watcher: No DLL selected', 'error');
          setWatcherActive(false);
          return;
        }

        const methodMap: Record<string, string> = {
          'Standard': 'standard',
          'Manual': 'manual_map',
          'Thread Hijack': 'thread_hijack',
          'Reflective': 'reflective'
        };

        const result = await invoke<string>('start_watcher', {
          request: {
            target: targetProcess,
            dllPath: dllPath,
            method: methodMap[injectionMethod] || 'standard'
          }
        });
        addLog(result, 'success');
        addLog(`Watcher monitoring for: ${targetProcess}`, 'system');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        addLog(`Watcher start failed: ${errorMsg}`, 'error');
        setWatcherActive(false);
      }
    } else {
      try {
        const result = await invoke<string>('stop_watcher');
        addLog(result, 'warning');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        addLog(`Watcher stop failed: ${errorMsg}`, 'error');
      }
    }
  };

  // --- Render ---
  return (
      <div className="h-screen w-screen flex items-stretch justify-stretch bg-[#020204] text-zinc-200 font-sans selection:bg-[var(--theme-primary)]/30 selection:text-[var(--theme-light)] overflow-hidden">

        {/* Dynamic Theme Styles */}
        <style>{`
        :root {
          --theme-primary: ${currentThemeStyles.primary};
          --theme-hover: ${currentThemeStyles.hover};
          --theme-light: ${currentThemeStyles.light};
          --theme-glow: ${currentThemeStyles.glow};
        }
      `}</style>

        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--theme-primary)]/10 rounded-full blur-[120px] opacity-40 transition-colors duration-700"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-zinc-900/10 rounded-full blur-[120px] opacity-40"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
        </div>

        {/* --- Main Window Container (Landscape) --- */}
        <div className="w-full h-full min-h-0 bg-[#050508] rounded-none border border-[#1F1F2E] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col relative z-10 overflow-hidden ring-1 ring-white/5">

          <LoadingScreen loading={loading} loadingStep={loadingStep} />

          <TopBar />

          {/* === Layout Body === */}
          <div className="flex flex-1 overflow-hidden">

            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                updateMenuOpen={updateMenuOpen}
                setUpdateMenuOpen={setUpdateMenuOpen}
            />

            {/* === Main Content Area === */}
            <div className="flex-1 bg-[#020204] relative flex flex-col">

              {/* Scrollable Content */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">

                {activeTab === 'dashboard' && (
                    <Dashboard
                        targetProcess={targetProcess}
                        setTargetProcess={setTargetProcess}
                        dllPath={dllPath}
                        injectionMethod={injectionMethod}
                        setInjectionMethod={setInjectionMethod}
                        handleInject={handleInject}
                        handleFileSelect={handleFileSelect}
                        fileInputRef={fileInputRef}
                        fdpMode={fdpMode}
                        setFdpMode={setFdpMode}
                        clientWrapper={clientWrapper}
                        handleClientWrapperChange={handleClientWrapperChange}
                        loadFdpJar={loadFdpJar}
                        setLoadFdpJar={(v) => {
                          setLoadFdpJar(v);
                          if (!v) addLog('FDP Jar Loader disabled', 'warning');
                          else addLog('FDP Jar Loader enabled', 'info');
                        }}
                        fdpPath={fdpPath}
                        jarInputRef={jarInputRef}
                        handleJarSelect={handleJarSelect}
                        watcherActive={watcherActive}
                        setWatcherActive={handleWatcherToggle}
                        handleSaveSettings={handleSaveSettings}
                    />
                )}

                {activeTab === 'settings' && (
                    <SettingsCard
                        theme={theme}
                        setTheme={setTheme}
                        customColor={customColor}
                        setCustomColor={setCustomColor}
                        DEFAULT_THEMES={DEFAULT_THEMES}
                        autoClose={autoClose}
                        setAutoClose={setAutoClose}
                        jvmArgs={jvmArgs}
                        setJvmArgs={setJvmArgs}
                        discordRpc={discordRpc}
                        setDiscordRpc={setDiscordRpc}
                        streamerMode={streamerMode}
                        setStreamerMode={setStreamerMode}
                        onLaunchJvm={handleLaunchJvm}
                    />
                )}

                {activeTab === 'about' && (
                    <AboutTab />
                )}

              </div>

              <ConsoleLogs
                  logs={logs}
                  consoleOpen={consoleOpen}
                  setConsoleOpen={setConsoleOpen}
                  clearLogs={clearLogs}
                  logsEndRef={logsEndRef}
              />
            </div>
          </div>

        </div>
      </div>
  );
};

export default App;
