import React, { useCallback } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Shield, Minus, Maximize2, X } from 'lucide-react';
import { Badge } from './ui';

const TopBar: React.FC = () => {
  const appWindow = getCurrentWindow();

  const handleMinimize = useCallback(async () => {
    await appWindow.minimize();
  }, [appWindow]);

  const handleMaximize = useCallback(async () => {
    await appWindow.toggleMaximize();
  }, [appWindow]);

  const handleClose = useCallback(async () => {
    await appWindow.close();
  }, [appWindow]);

  return (
    <div
      className="h-12 px-5 border-b border-[#1F1F2E] flex items-center justify-between bg-[#08080b] select-none z-20"
      data-tauri-drag-region
    >
      <div className="flex items-center gap-3">
         <div className="w-6 h-6 bg-[var(--theme-primary)] rounded flex items-center justify-center shadow-[0_0_15px_var(--theme-glow)] transition-colors">
            <Shield size={14} className="text-white" strokeWidth={3} />
         </div>
         <span className="text-sm font-bold tracking-widest text-zinc-200">YZY <span className="text-[var(--theme-primary)] transition-colors">CLIENT</span></span>
         <Badge variant="info">v2.4.1</Badge>
      </div>
      
      <div className="flex items-center gap-4">
         {/* Fake User Profile */}
         <div
            className="flex items-center gap-2 px-3 py-1 bg-[#121215] rounded-full border border-[#1F1F2E]"
            data-tauri-drag-region="false"
         >
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981] animate-pulse"></div>
            <span className="text-[10px] text-zinc-400 font-mono">admin@yzy.cc</span>
         </div>

         <div className="h-4 w-px bg-[#1F1F2E]" data-tauri-drag-region="false"></div>

         <div className="flex items-center gap-1" data-tauri-drag-region="false">
            <button
              className="p-2 hover:bg-[#1F1F2E] rounded text-zinc-500 hover:text-white transition-colors"
              onClick={handleMinimize}
              aria-label="Minimize window"
              type="button"
            >
              <Minus size={14} />
            </button>
            <button
              className="p-2 hover:bg-[#1F1F2E] rounded text-zinc-500 hover:text-white transition-colors"
              onClick={handleMaximize}
              aria-label="Maximize window"
              type="button"
            >
              <Maximize2 size={14} />
            </button>
            <button
              className="p-2 hover:bg-red-500/10 rounded text-zinc-500 hover:text-red-400 transition-colors"
              onClick={handleClose}
              aria-label="Close window"
              type="button"
            >
              <X size={14} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default TopBar;
