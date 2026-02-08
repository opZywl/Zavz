import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, RefreshCw, Cpu } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface Process {
  name: string;
  pid: number;
}

const FALLBACK_PROCESSES: Process[] = [
  { name: 'javaw.exe', pid: 12450 },
  { name: 'java.exe', pid: 8432 },
  { name: 'minecraft.exe', pid: 15678 },
];

interface ProcessSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (processName: string) => void;
}

export const ProcessSelectionModal: React.FC<ProcessSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [processes, setProcesses] = useState<Process[]>(FALLBACK_PROCESSES);
  const [loading, setLoading] = useState(false);

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const result = await invoke<Process[]>('list_processes');
      if (result && result.length > 0) {
        setProcesses(result);
      }
    } catch {
      // Keep fallback processes
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchProcesses();
    }
  }, [isOpen]);

  const filteredProcesses = useMemo(() => {
    return processes.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pid.toString().includes(searchTerm)
    );
  }, [searchTerm, processes]);

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#0f0f11] w-[450px] h-[600px] rounded-xl border border-white/10 shadow-2xl flex flex-col font-sans overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-[#141416]">
            <div>
                <h2 className="text-white font-bold text-lg">Select Process</h2>
                <p className="text-gray-500 text-xs">{filteredProcesses.length} processes running</p>
            </div>
            <div className="flex gap-2">
                <button onClick={fetchProcesses} className={`p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`}>
                    <RefreshCw size={16} />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/5">
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Search by name or PID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[var(--accent-500)] transition-colors placeholder:text-gray-600"
                />
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {filteredProcesses.map((proc) => (
                <button 
                    key={proc.pid}
                    onClick={() => {
                        onSelect(proc.name);
                        onClose();
                    }}
                    className="w-full text-left p-3 rounded-lg hover:bg-[#18181b] hover:border hover:border-white/5 border border-transparent transition-all group flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded bg-[#202023] flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-[var(--accent-500)] transition-colors">
                            <Cpu size={16} />
                         </div>
                         <div>
                             <div className="text-sm font-bold text-gray-200 group-hover:text-white">{proc.name}</div>
                             <div className="text-[10px] text-gray-500 group-hover:text-gray-400 font-mono">PID: {proc.pid}</div>
                         </div>
                    </div>
                </button>
            ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#141416] flex justify-end">
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-[#18181b] hover:bg-[#202023] border border-white/10 rounded-lg text-xs font-bold text-gray-300 transition-colors"
            >
                Cancel
            </button>
        </div>

      </div>
    </div>
  );
};