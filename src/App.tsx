import React, { useState, useEffect, useRef } from 'react';
import { LogType, LogEntry, ThemeColor, Tab } from './components/ui';
import LoadingScreen from './components/LoadingScreen';
import ConsoleLogs from './components/ConsoleLogs';
import Dashboard from './components/Dashboard';
import SettingsCard from './components/SettingsCard';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AboutTab from './components/AboutTab';

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
      addLog('Waiting for user input...', 'info');
    }
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // --- Handlers ---
  const handleInject = () => {
    if (!dllPath) {
      addLog('No DLL selected. Aborting.', 'error');
      return;
    }

    setLoading(true);
    setLoadingStep(0);
    addLog(`Initiating injection sequence on ${targetProcess}...`, 'system');

    // Smooth Loading Sequence
    const steps = [
      { msg: `Scanning process list for ${targetProcess}...`, delay: 1000 },
      { msg: 'Process found (PID: 1337). Attaching debugger...', delay: 2500 },
      { msg: 'Bypassing memory protection (DEP/ASLR)...', delay: 4000 },
      { msg: 'Allocating remote memory pages...', delay: 5500 },
      { msg: 'Injecting native payload...', delay: 7000 },
      { msg: 'Cleaning up traces & unlinking module...', delay: 8500 }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setLoadingStep(index + 1);
      }, step.delay);
    });

    // Final Success
    setTimeout(() => {
      setLoading(false);
      addLog('Injection Successful!', 'success');
      addLog('Payload executed. You may now close the injector.', 'info');
      if (autoClose) {
        addLog('Auto-close triggered.', 'warning');
      }
    }, 10000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDllPath(file.name);
      addLog(`Selected DLL: ${file.name}`, 'info');
    }
  }

  const handleJarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFdpPath(file.name);
      addLog(`Selected Jar: ${file.name}`, 'info');
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

  // --- Render ---
  return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[#020204] text-zinc-200 font-sans selection:bg-[var(--theme-primary)]/30 selection:text-[var(--theme-light)] overflow-hidden">

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
        <div className="w-full max-w-[1200px] h-[750px] bg-[#050508] rounded-2xl border border-[#1F1F2E] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col relative z-10 overflow-hidden ring-1 ring-white/5">

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
                        setWatcherActive={(v) => {
                          setWatcherActive(v);
                          addLog(v ? 'Watcher service started' : 'Watcher service stopped', 'info');
                        }}
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