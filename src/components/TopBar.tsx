import React from 'react';
import { Shield, Minus, Maximize2, X } from 'lucide-react';
import { Badge } from './ui';
import { minimizeWindow, maximizeWindow, closeWindow } from '../utils/window';

const TopBar: React.FC = () => {
  return (
    <div className="h-12 px-5 border-b border-[#1F1F2E] flex items-center justify-between bg-[#08080b] select-none z-20">
      {/* Left side - Draggable */}
      <div className="flex items-center gap-3" data-tauri-drag-region>
         <div className="w-6 h-6 bg-[var(--theme-primary)] rounded flex items-center justify-center shadow-[0_0_15px_var(--theme-glow)] transition-colors">
            <Shield size={14} className="text-white" strokeWidth={3} />
         </div>
         <span className="text-sm font-bold tracking-widest text-zinc-200">YZY <span className="text-[var(--theme-primary)] transition-colors">INJECT</span></span>
         <Badge variant="info">v1</Badge>
      </div>

      {/* Middle - Draggable */}
      <div className="flex-1 h-full" data-tauri-drag-region></div>

      {/* Right side - Not draggable */}
      <div className="flex items-center gap-4">
         {/* Fake User Profile - Draggable */}
         <div className="flex items-center gap-2 px-3 py-1 bg-[#121215] rounded-full border border-[#1F1F2E]" data-tauri-drag-region>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981] animate-pulse"></div>
            <span className="text-[10px] text-zinc-400 font-mono">opzywl</span>
         </div>

         <div className="h-4 w-px bg-[#1F1F2E]" data-tauri-drag-region></div>

         {/* Window Controls - NOT draggable */}
         <div className="flex items-center gap-1">
            <button
              className="p-2 hover:bg-[#1F1F2E] rounded text-zinc-500 hover:text-white transition-colors"
              onClick={minimizeWindow}
              type="button"
              title="Minimize"
            >
              <Minus size={14} />
            </button>
            <button
              className="p-2 hover:bg-[#1F1F2E] rounded text-zinc-500 hover:text-white transition-colors"
              onClick={maximizeWindow}
              type="button"
              title="Maximize"
            >
              <Maximize2 size={14} />
            </button>
            <button
              className="p-2 hover:bg-red-500/10 rounded text-zinc-500 hover:text-red-400 transition-colors"
              onClick={closeWindow}
              type="button"
              title="Close"
            >
              <X size={14} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default TopBar;
