import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Search, RefreshCw, X } from 'lucide-react';

interface ProcessInfo {
  pid: number;
  name: string;
}

interface ProcessSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (processName: string) => void;
}

const ProcessSelector: React.FC<ProcessSelectorProps> = ({ isOpen, onClose, onSelect }) => {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [filteredProcesses, setFilteredProcesses] = useState<ProcessInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const result = await invoke<ProcessInfo[]>('list_processes');
      // Sort by name and remove duplicates
      const uniqueProcesses = Array.from(
        new Map(result.map(p => [p.name, p])).values()
      ).sort((a, b) => a.name.localeCompare(b.name));

      setProcesses(uniqueProcesses);
      setFilteredProcesses(uniqueProcesses);
    } catch (error) {
      console.error('Failed to fetch processes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProcesses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = processes.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.pid.toString().includes(searchQuery)
      );
      setFilteredProcesses(filtered);
    } else {
      setFilteredProcesses(processes);
    }
  }, [searchQuery, processes]);

  const handleSelect = (processName: string) => {
    onSelect(processName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0c0c10] border border-[#272735] rounded-2xl shadow-2xl w-[600px] max-h-[700px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#272735] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-200">Select Process</h2>
            <p className="text-sm text-zinc-500 mt-1">{processes.length} processes running</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchProcesses}
              disabled={loading}
              className="p-2 rounded-lg bg-[#15151a] border border-zinc-800 hover:border-[var(--theme-primary)]/50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={`text-[var(--theme-primary)] ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#15151a] border border-zinc-800 hover:border-red-500/50 transition-colors"
            >
              <X size={16} className="text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#272735]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or PID..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#15151a] border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[var(--theme-primary)]/50 transition-colors"
            />
          </div>
        </div>

        {/* Process List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <RefreshCw size={24} className="text-[var(--theme-primary)] animate-spin" />
            </div>
          ) : filteredProcesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Search size={32} className="text-zinc-700 mb-3" />
              <p className="text-zinc-500">No processes found</p>
              <p className="text-xs text-zinc-600 mt-1">Try adjusting your search query</p>
            </div>
          ) : (
            <div className="p-3 space-y-1">
              {filteredProcesses.map((process) => (
                <button
                  key={`${process.name}-${process.pid}`}
                  onClick={() => handleSelect(process.name)}
                  className="w-full p-3 rounded-lg bg-[#15151a] border border-transparent hover:border-[var(--theme-primary)]/30 hover:bg-[var(--theme-primary)]/5 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-200 group-hover:text-[var(--theme-light)] transition-colors">
                        {process.name}
                      </p>
                      <p className="text-xs text-zinc-600 font-mono mt-0.5">
                        PID: {process.pid}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_var(--theme-glow)]"></div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#272735] flex items-center justify-between">
          <p className="text-xs text-zinc-600">
            Showing {filteredProcesses.length} of {processes.length} processes
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#15151a] border border-zinc-800 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessSelector;
