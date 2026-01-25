import { useEffect, useRef, useState } from 'react';
import { Terminal, Trash2, ChevronDown } from 'lucide-react';

export interface LogEntry {
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
}

interface ConsoleLogsProps {
  logs: LogEntry[];
  onClear?: () => void;
}

const ConsoleLogs = ({ logs, onClear }: ConsoleLogsProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded]);

  const getTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-cyan-400';
    }
  };

  const getTypeSymbol = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return '[✓]';
      case 'error':
        return '[✗]';
      case 'warning':
        return '[!]';
      default:
        return '[i]';
    }
  };

  return (
    <div className="bento-card flex flex-col overflow-hidden">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
            <Terminal className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Console Output</h3>
            <p className="text-xs text-zinc-500">
              {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onClear && (
            <button
              onClick={onClear}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
              type="button"
              title="Clear logs"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:text-cyan-400"
            type="button"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="terminal flex-1 overflow-y-auto rounded-xl border border-zinc-800 bg-black/60 p-4 shadow-inner">
          {logs.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-zinc-600">
              <p className="text-sm">No logs yet. Start injecting to see output.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="group flex gap-3 rounded-lg px-3 py-2 transition hover:bg-zinc-900/50"
                >
                  <span className="text-zinc-600">
                    {log.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span className={`font-semibold ${getTypeColor(log.type)}`}>
                    {getTypeSymbol(log.type)}
                  </span>
                  <span className="flex-1 text-zinc-300">{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      )}

      {/* Matrix-style decoration */}
      <div className="mt-3 flex items-center gap-2 text-xs text-zinc-700">
        <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-500/50" />
        <span className="font-mono">SYSTEM_READY</span>
        <div className="ml-auto flex gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500/50" />
          <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
          <div className="h-2 w-2 rounded-full bg-red-500/50" />
        </div>
      </div>
    </div>
  );
};

export default ConsoleLogs;
