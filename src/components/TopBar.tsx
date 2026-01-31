import React, { useEffect, useState } from 'react';
import { Shield, Minus, Maximize2, X } from 'lucide-react';
import { Badge } from './ui';

// Import direto da API do Tauri
import { getCurrentWindow } from '@tauri-apps/api/window';

const TopBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

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
  }, []);

  const handleMinimize = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[TopBar] Minimize button clicked');
    try {
      const win = getCurrentWindow();
      console.log('[TopBar] Getting window instance...');
      await win.minimize();
      console.log('[TopBar] Window minimized successfully');
    } catch (err) {
      console.error('[TopBar] Failed to minimize:', err);
      alert('Failed to minimize window: ' + err);
    }
  };

  const handleMaximize = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[TopBar] Maximize button clicked');
    try {
      const win = getCurrentWindow();
      console.log('[TopBar] Getting window instance...');
      await win.toggleMaximize();
      const maximized = await win.isMaximized();
      setIsMaximized(maximized);
      console.log('[TopBar] Window toggled maximize successfully, now:', maximized);
    } catch (err) {
      console.error('[TopBar] Failed to maximize:', err);
      alert('Failed to maximize window: ' + err);
    }
  };

  const handleClose = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[TopBar] Close button clicked');
    try {
      const win = getCurrentWindow();
      console.log('[TopBar] Getting window instance...');
      console.log('[TopBar] Calling close()...');
      await win.close();
      console.log('[TopBar] Close called successfully');
    } catch (err) {
      console.error('[TopBar] Failed to close:', err);
      alert('Failed to close window: ' + err);
    }
  };

  const handleDragStart = async (e: React.MouseEvent) => {
    // Só arrasta se não for clique em botão
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      console.log('[TopBar] Click on button, not dragging');
      return;
    }

    console.log('[TopBar] Starting drag...');
    try {
      const win = getCurrentWindow();
      await win.startDragging();
    } catch (err) {
      console.error('[TopBar] Failed to start dragging:', err);
    }
  };

  return (
    <div
      className="h-12 px-5 border-b border-[#1F1F2E] flex items-center justify-between bg-[#08080b] relative z-50"
      onMouseDown={handleDragStart}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Left side */}
      <div className="flex items-center gap-3 pointer-events-none">
         <div className="w-6 h-6 bg-[var(--theme-primary)] rounded flex items-center justify-center shadow-[0_0_15px_var(--theme-glow)] transition-colors">
            <Shield size={14} className="text-white" strokeWidth={3} />
         </div>
         <span className="text-sm font-bold tracking-widest text-zinc-200">
           YZY <span className="text-[var(--theme-primary)] transition-colors">CLIENT</span>
         </span>
         <Badge variant="info">v2.4.1</Badge>
      </div>

      {/* Middle - draggable area */}
      <div className="flex-1 h-full"></div>

      {/* Right side */}
      <div className="flex items-center gap-4">
         {/* User Profile */}
         <div className="flex items-center gap-2 px-3 py-1 bg-[#121215] rounded-full border border-[#1F1F2E] pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981] animate-pulse"></div>
            <span className="text-[10px] text-zinc-400 font-mono">opzywl</span>
         </div>

         <div className="h-4 w-px bg-[#1F1F2E] pointer-events-none"></div>

         {/* Window Controls - Must be clickable */}
         <div
           className="flex items-center gap-1 pointer-events-auto relative z-[9999]"
           onMouseDown={(e) => e.stopPropagation()}
         >
            <button
              className="p-2 hover:bg-[#1F1F2E] rounded text-zinc-500 hover:text-white transition-colors relative z-[9999] cursor-pointer"
              onClick={handleMinimize}
              onMouseDown={(e) => e.stopPropagation()}
              type="button"
              title="Minimize"
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
              title={isMaximized ? "Restore" : "Maximize"}
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
              title="Close"
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
  );
};

export default TopBar;
