import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export function useLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      level,
      message,
    };

    setLogs((prev) => [...prev, entry]);

    // Also show toast notification
    switch (level) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast(message, { icon: '⚠️' });
        break;
      default:
        toast(message);
    }

    return entry;
  }, []);

  const info = useCallback((message: string) => addLog('info', message), [addLog]);
  const success = useCallback((message: string) => addLog('success', message), [addLog]);
  const warning = useCallback((message: string) => addLog('warning', message), [addLog]);
  const error = useCallback((message: string) => addLog('error', message), [addLog]);

  const clearLogs = useCallback(() => setLogs([]), []);

  return {
    logs,
    addLog,
    info,
    success,
    warning,
    error,
    clearLogs,
  };
}
