import React, { useEffect, useState } from 'react';
import { Minus, Maximize2, X } from 'lucide-react';
import appIcon from '../assets/branding/icon.png';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';

interface DebugLog {
  id: number;
  message: string;
  time: string;
}

const TopBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);

  const addDebugLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-4), { id: Date.now(), message, time }]);
  };

  useEffect(() => {
    const checkMaximized = async () => {
      try {
        const win = getCurrentWindow();
        const maximized = await win.isMaximized();
        setIsMaximized(maximized);
      } catch (err) {
        console.error('Failed to check maximized state:', err);
      }
    };

    checkMaximized();

    // Ouvir eventos do backend para exibir nas notificações
    const unlistenWatcher = listen<string>('watcher-status', (event) => {
      addDebugLog(event.payload);
    });

    const unlistenInjection = listen<string>('injection-log', (event) => {
      addDebugLog(event.payload);
    });

    return () => {
      unlistenWatcher.then(fn => fn());
      unlistenInjection.then(fn => fn());
    };
  }, []);

  const handleMinimize = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const win = getCurrentWindow();
      await win.minimize();
    } catch (err) {
      const errorMsg = String(err);
      addDebugLog('Failed to minimize: ' + errorMsg);
      alert('FAILED TO MINIMIZE:\n' + errorMsg);
    }
  };

  const handleMaximize = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const win = getCurrentWindow();
      await win.toggleMaximize();
      const maximized = await win.isMaximized();
      setIsMaximized(maximized);
    } catch (err) {
      const errorMsg = String(err);
      addDebugLog('Failed to maximize: ' + errorMsg);
      alert('FAILED TO MAXIMIZE:\n' + errorMsg);
    }
  };

  const handleClose = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const win = getCurrentWindow();
      await win.close();
    } catch (err) {
      const errorMsg = String(err);
      addDebugLog('Failed to close: ' + errorMsg);
      alert('FAILED TO CLOSE:\n' + errorMsg + '\n\nPress Alt+F4 to close');
    }
  };

  const handleDragStart = async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }

    try {
      const win = getCurrentWindow();
      await win.startDragging();
    } catch (err) {
      console.error('Failed to start dragging:', err);
    }
  };

  return (
    <>
      <div
        className="h-12 px-5 border-b border-[#1F1F2E] flex items-center justify-between bg-[#08080b] relative z-50"
        onMouseDown={handleDragStart}
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {/* Left side */}
        <div className="flex items-center gap-3 pointer-events-none">
           <img src={appIcon} alt="YZY Injector" className="w-7 h-7 rounded" />
        </div>

        {/* Middle - draggable area */}
        <div className="flex-1 h-full"></div>

        {/* Right side */}
        <div className="flex items-center gap-4">
           {/* Window Controls */}
           <div
             className="flex items-center gap-1 pointer-events-auto relative z-[9999]"
             onMouseDown={(e) => e.stopPropagation()}
           >
              <button
                className="p-2 hover:bg-[#1F1F2E] rounded text-zinc-500 hover:text-white transition-colors relative z-[9999] cursor-pointer"
                onClick={handleMinimize}
                onMouseDown={(e) => e.stopPropagation()}
                type="button"
                title="Minimizar (clique para testar)"
                style={{
                  pointerEvents: 'auto',
                  WebkitAppRegion: 'no-drag',
                } as any}
              >
                <Minus size={14} />
              </button>

              <button
                className="p-2 hover:bg-[#1F1F2E] rounded text-zinc-500 hover:text-white transition-colors relative z-[9999] cursor-pointer"
                onClick={handleMaximize}
                onMouseDown={(e) => e.stopPropagation()}
                type="button"
                title={isMaximized ? "Restaurar" : "Maximizar (clique para testar)"}
                style={{
                  pointerEvents: 'auto',
                  WebkitAppRegion: 'no-drag',
                } as any}
              >
                <Maximize2 size={14} />
              </button>

              <button
                className="p-2 hover:bg-red-500/10 rounded text-zinc-500 hover:text-red-400 transition-colors relative z-[9999] cursor-pointer"
                onClick={handleClose}
                onMouseDown={(e) => e.stopPropagation()}
                type="button"
                title="Fechar (clique para testar)"
                style={{
                  pointerEvents: 'auto',
                  WebkitAppRegion: 'no-drag',
                } as any}
              >
                <X size={14} />
              </button>
           </div>
        </div>
      </div>

      {/* Debug Overlay - Aparece no topo da tela */}
      {debugLogs.length > 0 && (
        <div className="fixed top-14 right-4 z-[99999] space-y-2 max-w-md">
          {debugLogs.map((log) => (
            <div
              key={log.id}
              className="bg-black/90 border border-[var(--theme-primary)] rounded-lg px-4 py-2 shadow-2xl backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
            >
              <span className="text-xs font-mono text-zinc-200 block">{log.message}</span>
              <span className="text-[10px] text-zinc-500 font-mono">{log.time}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default TopBar;
