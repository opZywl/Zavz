import React from 'react';
import { Terminal, Trash2, ChevronDown } from 'lucide-react';
import { LogEntry } from './ui';

interface ConsoleLogsProps {
  logs: LogEntry[];
  consoleOpen: boolean;
  setConsoleOpen: (open: boolean) => void;
  clearLogs: () => void;
  logsEndRef: React.RefObject<HTMLDivElement>;
}

const ConsoleLogs: React.FC<ConsoleLogsProps> = ({ logs, consoleOpen, setConsoleOpen, clearLogs, logsEndRef }) => {
  return (
    <div className={`bg-[#08080b] border-t border-[#1F1F2E] flex flex-col z-20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${consoleOpen ? 'h-80' : 'h-11'} shadow-[0_-10px_40px_rgba(0,0,0,0.5)]`}>
        {/* Header */}
        <div 
            className="px-5 py-2.5 border-b border-[#1F1F2E] flex justify-between items-center bg-[#0c0c10] cursor-pointer hover:bg-[#121215] select-none group relative"
            onClick={() => setConsoleOpen(!consoleOpen)}
        >
            {/* Active Indicator Line */}
            <div className={`absolute top-0 left-0 h-[2px] bg-[var(--theme-primary)] transition-all duration-500 ${consoleOpen ? 'w-full opacity-100' : 'w-0 opacity-0'}`}></div>

            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md transition-colors duration-300 ${consoleOpen ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]' : 'bg-zinc-800/50 text-zinc-500'}`}>
                    <Terminal size={14} />
                </div>
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    System Log
                    {logs.length > 0 && (
                         <span className={`flex items-center justify-center text-[10px] font-extrabold h-5 min-w-[20px] px-1.5 rounded-full shadow-[0_0_10px_var(--theme-glow)] transition-all duration-300 ${consoleOpen ? 'bg-[var(--theme-primary)] text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                            {logs.length}
                         </span>
                    )}
                </span>
            </div>

            <div className="flex gap-4 items-center">
                 <button 
                    onClick={(e) => { e.stopPropagation(); clearLogs(); }} 
                    className="text-[10px] font-medium text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1.5 px-2 py-1 rounded hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                 >
                    <Trash2 size={12} /> 
                    <span>Clear Output</span>
                 </button>
                 <div className="h-4 w-px bg-[#1F1F2E]"></div>
                 <ChevronDown size={16} className={`text-zinc-500 transition-transform duration-500 ${consoleOpen ? 'rotate-0' : 'rotate-180'}`}/>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 bg-[#050508] custom-scrollbar relative">
             {/* Background Watermark */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
                <Terminal size={120} />
             </div>

             {logs.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-zinc-700 opacity-50 select-none z-10 relative">
                     <p className="text-sm font-medium text-zinc-600">Console Ready</p>
                     <p className="text-[10px] mt-1">Waiting for system events...</p>
                 </div>
             ) : (
                logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 hover:bg-[#0c0c10] px-3 py-2 rounded-lg transition-colors group animate-[fade-in_0.2s_ease-out] border border-transparent hover:border-[#1F1F2E] relative z-10">
                        {/* Timestamp */}
                        <span className="text-zinc-600 font-mono text-[10px] pt-0.5 select-none opacity-50 min-w-[60px] text-right">{log.time}</span>
                        
                        {/* Type Indicator */}
                        <div className="flex items-center gap-2 min-w-[85px]">
                            {log.type === 'info' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>}
                            {log.type === 'success' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>}
                            {log.type === 'error' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>}
                            {log.type === 'warning' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>}
                            {log.type === 'system' && <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] shadow-[0_0_8px_var(--theme-glow)]"></div>}
                            
                            <span className={`text-[10px] font-bold tracking-wider uppercase select-none ${
                                log.type === 'info' ? 'text-blue-400' :
                                log.type === 'success' ? 'text-emerald-400' :
                                log.type === 'error' ? 'text-red-400' :
                                log.type === 'system' ? 'text-[var(--theme-primary)]' :
                                'text-amber-400'
                            }`}>
                                {log.type}
                            </span>
                        </div>

                        {/* Message */}
                        <span className={`flex-1 break-all leading-relaxed ${
                            log.type === 'error' ? 'text-red-200' : 
                            log.type === 'system' ? 'text-zinc-100 font-bold' :
                            'text-zinc-400 group-hover:text-zinc-200'
                        }`}>
                            {log.message}
                        </span>
                    </div>
                ))
             )}
            <div ref={logsEndRef} />
        </div>
    </div>
  );
};

export default ConsoleLogs;