import React, { useCallback, useRef } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Shield, Minus, Maximize2, X } from 'lucide-react';
import { Badge } from './ui';

const TopBar: React.FC = () => {
  const dragRef = useRef<HTMLDivElement>(null);

  const handleMinimize = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      console.log('Minimizing window...');
      const appWindow = getCurrentWindow();
      await appWindow.minimize();
      console.log('Window minimized successfully');
    } catch (error) {
      console.error('Failed to minimize:', error);
    }
  }, []);

  const handleMaximize = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      console.log('Toggling maximize...');
      const appWindow = getCurrentWindow();
      await appWindow.toggleMaximize();
      console.log('Window maximized successfully');
    } catch (error) {
      console.error('Failed to maximize:', error);
    }
  }, []);

  const handleClose = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      console.log('Closing window...');
      const appWindow = getCurrentWindow();
      await appWindow.close();
      console.log('Window closed successfully');
    } catch (error) {
      console.error('Failed to close:', error);
    }
  }, []);

  const handleDragStart = useCallback(async (e: React.MouseEvent) => {
    // Only drag if clicking on the drag region, not on buttons
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }

    try {
      const appWindow = getCurrentWindow();
      await appWindow.startDragging();
    } catch (error) {
      console.error('Failed to start dragging:', error);
    }
  }, []);

  return (
    <div
      ref={dragRef}
      className="h-12 px-5 border-b border-[#1F1F2E] flex items-center justify-between bg-[#08080b] select-none z-20"
      onMouseDown={handleDragStart}
      style={{ WebkitAppRegion: 'no-drag' } as any}
    >
      <div className="flex items-center gap-3">
         <div className="w-6 h-6 bg-[var(--theme-primary)] rounded flex items-center justify-center shadow-[0_0_15px_var(--theme-glow)] transition-colors">
            <Shield size={14} className="text-white" strokeWidth={3} />
         </div>
         <span className="text-sm font-bold tracking-widest text-zinc-200">YZY <span className="text-[var(--theme-primary)] transition-colors">INJECT</span></span>
         <Badge variant="info">v1</Badge>
      </div>

      <div className="flex-1 h-full"></div>

      <div className="flex items-center gap-4">
         {/* Fake User Profile */}
         <div className="flex items-center gap-2 px-3 py-1 bg-[#121215] rounded-full border border-[#1F1F2E]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981] animate-pulse"></div>
            <span className="text-[10px] text-zinc-400 font-mono">opzywl</span>
         </div>

         <div className="h-4 w-px bg-[#1F1F2E]"></div>

         <div
           className="flex items-center gap-1"
           onMouseDown={(e) => e.stopPropagation()}
           style={{ WebkitAppRegion: 'no-drag' } as any}
         >
            <button
              className="p-2 hover:bg-[#1F1F2E] rounded text-zinc-500 hover:text-white transition-colors cursor-pointer"
              onClick={handleMinimize}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Minimize window"
              type="button"
              style={{ WebkitAppRegion: 'no-drag' } as any}
            >
              <Minus size={14} />
            </button>
            <button
              className="p-2 hover:bg-[#1F1F2E] rounded text-zinc-500 hover:text-white transition-colors cursor-pointer"
              onClick={handleMaximize}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Maximize window"
              type="button"
              style={{ WebkitAppRegion: 'no-drag' } as any}
            >
              <Maximize2 size={14} />
            </button>
            <button
              className="p-2 hover:bg-red-500/10 rounded text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
              onClick={handleClose}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Close window"
              type="button"
              style={{ WebkitAppRegion: 'no-drag' } as any}
            >
              <X size={14} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default TopBar;
