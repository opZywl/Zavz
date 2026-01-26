import React from 'react';
import { Zap } from 'lucide-react';

interface LoadingScreenProps {
  loading: boolean;
  loadingStep: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ loading, loadingStep }) => {
  if (!loading) return null;

  return (
    <div className="absolute inset-0 z-50 bg-[#020204]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 transition-all duration-500">
        <div className="w-full max-w-md flex flex-col gap-10 items-center">
            
            {/* Central Animation */}
            <div className="relative">
                 <div className="w-32 h-32 rounded-full border border-zinc-800 flex items-center justify-center bg-[#050508] shadow-2xl relative">
                    {/* Spinning Rings */}
                    <div className="absolute inset-0 rounded-full border-2 border-t-[var(--theme-primary)] border-r-transparent border-b-[var(--theme-primary)]/30 border-l-transparent animate-spin duration-1000"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-b-[var(--theme-light)] border-l-transparent border-t-transparent border-r-[var(--theme-light)]/30 animate-[spin_3s_linear_infinite_reverse]"></div>
                    
                    {/* Inner Icon */}
                    <Zap className="text-white animate-pulse drop-shadow-[0_0_15px_var(--theme-glow)]" size={40} fill="currentColor" />
                 </div>
                 
                 {/* Particle/Glow effects */}
                 <div className="absolute inset-0 bg-[var(--theme-primary)]/20 blur-[40px] rounded-full animate-pulse"></div>
            </div>
            
            <div className="text-center space-y-3 w-full">
                <h2 className="text-3xl font-bold text-white tracking-tight flex flex-col">
                    <span className="text-xs font-mono text-[var(--theme-primary)] uppercase tracking-[0.4em] mb-3 animate-pulse">System Override</span>
                    Injecting Payload
                </h2>
                
                {/* Dynamic Step Text */}
                <div className="h-6 overflow-hidden relative">
                     <p className="text-zinc-400 text-sm font-mono animate-[fade-in-up_0.3s_ease-out]">
                        {loadingStep === 0 && "Initializing..."}
                        {loadingStep === 1 && "Scanning process memory..."}
                        {loadingStep === 2 && "Attaching debugger to target..."}
                        {loadingStep === 3 && "Bypassing anti-cheat (VAC/BattlEye)..."}
                        {loadingStep === 4 && "Allocating memory pages..."}
                        {loadingStep === 5 && "Writing DLL payload..."}
                        {loadingStep === 6 && "Cleaning cleanup & hooks..."}
                     </p>
                </div>
            </div>

            {/* Tech Progress Bar */}
            <div className="w-full space-y-2">
                <div className="flex justify-between text-xs font-mono text-zinc-500 uppercase">
                    <span>Progress</span>
                    <span>{Math.round((loadingStep / 6) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#121215] rounded-full overflow-hidden border border-zinc-800">
                    <div 
                        className="h-full bg-[var(--theme-primary)] shadow-[0_0_15px_var(--theme-glow)] transition-all duration-500 ease-out relative"
                        style={{ width: `${(loadingStep / 6) * 100}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default LoadingScreen;