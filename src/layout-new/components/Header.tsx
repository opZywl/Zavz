import React from 'react';
import { Settings, X, ZavzLogo } from './Icons';

interface HeaderProps {
    onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <div className="flex items-center justify-between px-10 py-8 w-full select-none z-20 relative h-28">
      {/* Left: Logo */}
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="transform transition-transform group-hover:rotate-12 duration-300">
             <ZavzLogo />
        </div>
        <div className="flex items-center">
            <span className="font-extrabold text-3xl tracking-tighter text-white italic">ZAVZ</span>
            <div className="bg-[var(--accent-600)] px-1.5 py-0.5 ml-1.5 rounded skew-x-[-12deg] shadow-lg shadow-[var(--accent-shadow)]">
                <span className="font-black text-lg text-white block transform skew-x-[12deg] tracking-wider">INJECTOR</span>
            </div>
        </div>
      </div>

      {/* Center: Welcome Message */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <div className="bg-[#18181b] w-[450px] h-14 rounded flex flex-col items-center justify-center relative shadow-lg border border-[var(--accent-shadow-light)]">
            <span className="text-gray-200 font-medium text-lg">Welcome back, Zywl.</span>
            <div className="absolute bottom-0 w-32 h-[3px] bg-[var(--accent-600)] rounded-t-full shadow-[0_0_10px_var(--accent-500)]"></div>
        </div>
      </div>

      {/* Right: User & Controls */}
      <div className="flex items-center gap-6">
        <div 
          onClick={onOpenSettings}
          className="flex items-center gap-4 bg-[#18181b] p-2 pr-4 rounded-lg min-w-[180px] border border-white/5 hover:border-[var(--accent-500-30)] transition-colors cursor-pointer group"
        >
          <div className="w-10 h-10 bg-[#3e2723] rounded-md overflow-hidden border-2 border-[#18181b] shadow-sm group-hover:border-[var(--accent-600)] transition-colors">
             <img 
               src="https://api.mineatar.io/face/c06f89064c8a49119c29ea1dbd1aab82?scale=8" 
               alt="Skin" 
               className="w-full h-full object-cover"
             />
          </div>
          <div className="flex flex-col leading-tight flex-1">
            <span className="font-bold text-sm text-gray-100 group-hover:text-[var(--accent-400)] transition-colors">Zywl</span>
            <span className="text-[11px] text-gray-500 font-medium">Administrator</span>
          </div>
          <Settings size={20} className="text-gray-400 group-hover:text-[var(--accent-500)] group-hover:rotate-90 transition-all duration-500" />
        </div>

        <button className="w-11 h-11 rounded-full border-2 border-white/10 flex items-center justify-center text-gray-400 hover:bg-[var(--accent-600)] hover:text-white hover:border-[var(--accent-600)] transition-all">
          <X size={22} />
        </button>
      </div>
    </div>
  );
};