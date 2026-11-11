import { useCallback, useEffect, useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Cpu, RefreshCw, Search, X } from 'lucide-react';
import { Button } from './ui/Button';

interface Process {
  name: string;
  pid: number;
}

interface ProcessSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (processName: string) => void;
}

export function ProcessSelectionModal({ isOpen, onClose, onSelect }: ProcessSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProcesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<Process[]>('list_processes');
      setProcesses(result || []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      setProcesses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setSearchTerm('');
    void fetchProcesses();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fetchProcesses, isOpen, onClose]);

  const filteredProcesses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return processes.filter(
      (process) => process.name.toLowerCase().includes(query) || String(process.pid).includes(query)
    );
  }, [processes, searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      className="ds-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <section
        className="ds-modal ds-process-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="process-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="ds-modal-header">
          <div>
            <p className="ds-overline">Target override</p>
            <h2 id="process-title">Select client process</h2>
          </div>
          <div className="ds-header-actions">
            <button
              className="ds-icon-button"
              onClick={() => void fetchProcesses()}
              disabled={loading}
              aria-label="Refresh process list"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              className="ds-icon-button"
              onClick={onClose}
              aria-label="Close process selection"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="ds-process-search">
          <Search size={15} />
          <input
            autoFocus
            type="search"
            placeholder="Search by process name or PID"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search processes"
          />
        </div>

        <div className="ds-process-list" aria-live="polite">
          {loading && (
            <div className="ds-process-state">
              <RefreshCw size={20} className="animate-spin" />
              <strong>Reading running processes…</strong>
            </div>
          )}
          {!loading && error && (
            <div className="ds-process-state error">
              <Cpu size={22} />
              <strong>Process list unavailable</strong>
              <span>{error}</span>
              <Button variant="secondary" size="sm" onClick={() => void fetchProcesses()}>
                Retry
              </Button>
            </div>
          )}
          {!loading && !error && filteredProcesses.length === 0 && (
            <div className="ds-process-state">
              <Cpu size={22} />
              <strong>{searchTerm ? 'No matching process' : 'No eligible process found'}</strong>
              <span>Launch a supported Minecraft client and refresh this list.</span>
            </div>
          )}
          {!loading &&
            !error &&
            filteredProcesses.map((process) => (
              <button
                className="ds-process-item"
                key={process.pid}
                onClick={() => {
                  onSelect(process.name);
                  onClose();
                }}
              >
                <span className="ds-icon-tile">
                  <Cpu size={16} />
                </span>
                <span>
                  <strong>{process.name}</strong>
                  <small>PID {process.pid}</small>
                </span>
              </button>
            ))}
        </div>

        <footer className="ds-modal-footer">
          <span className="ds-field-help">{filteredProcesses.length} processes available</span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </footer>
      </section>
    </div>
  );
}
