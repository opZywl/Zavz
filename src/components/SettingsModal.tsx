import { useEffect, useState } from 'react';
import { Activity, Crosshair, EyeOff, FileCog, Save, Settings, Terminal, X } from 'lucide-react';
import { ProcessSelectionModal } from './ProcessSelectionModal';
import { Button } from './ui/Button';
import { Select, type SelectOption } from './ui/Select';

export interface SettingsDraft {
  targetProcess: string;
  injectionMethod: string;
  jvmArgs: string;
  autoClose: boolean;
  streamerMode: boolean;
}

interface SettingsModalProps extends SettingsDraft {
  isOpen: boolean;
  onClose: () => void;
  watcherActive: boolean;
  onWatcherToggle: (enabled: boolean) => void;
  systemLogActive: boolean;
  onSystemLogToggle: (enabled: boolean) => void;
  onSave: (settings: SettingsDraft) => void;
  onLaunchJvm: (jvmArgs: string) => void;
}

const METHODS: readonly SelectOption[] = [
  { value: 'Standard', label: 'Standard', hint: 'LoadLibrary' },
  { value: 'Manual', label: 'Manual Map', hint: 'Stealth' },
  { value: 'Thread Hijack', label: 'Thread Hijack', hint: 'Existing thread' },
  { value: 'Reflective', label: 'Reflective', hint: 'Self-mapping' },
];

export function SettingsModal({
  isOpen,
  onClose,
  targetProcess,
  injectionMethod,
  jvmArgs,
  watcherActive,
  onWatcherToggle,
  autoClose,
  streamerMode,
  systemLogActive,
  onSystemLogToggle,
  onSave,
  onLaunchJvm,
}: SettingsModalProps) {
  const [draft, setDraft] = useState<SettingsDraft>({
    targetProcess,
    injectionMethod,
    jvmArgs,
    autoClose,
    streamerMode,
  });
  const [isProcessSelectorOpen, setIsProcessSelectorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'advanced'>('general');

  useEffect(() => {
    if (!isOpen) return;
    setDraft({ targetProcess, injectionMethod, jvmArgs, autoClose, streamerMode });
    setActiveTab('general');
  }, [autoClose, injectionMethod, isOpen, jvmArgs, streamerMode, targetProcess]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isProcessSelectorOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isProcessSelectorOpen, onClose]);

  if (!isOpen) return null;

  const patchDraft = (patch: Partial<SettingsDraft>) =>
    setDraft((current) => ({ ...current, ...patch }));

  return (
    <div className="ds-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="ds-modal ds-settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="ds-modal-header ds-settings-modal-header">
          <div>
            <Settings size={17} aria-hidden="true" />
            <h2 id="settings-title">Settings</h2>
          </div>
          <button
            type="button"
            className="ds-icon-button"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </header>

        <nav className="ds-settings-tabs" aria-label="Settings sections">
          <button
            type="button"
            className={activeTab === 'general' ? 'active' : ''}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            type="button"
            className={activeTab === 'advanced' ? 'active' : ''}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </button>
        </nav>

        <div className="ds-settings-body">
          {activeTab === 'general' && (
            <section className="ds-settings-group">
              <div className="ds-settings-section-title">
                <Crosshair size={15} />
                <div>
                  <strong>Injection target</strong>
                  <span>Process and native injection method.</span>
                </div>
              </div>
              <div className="ds-form-grid">
                <label>
                  <span>Target process</span>
                  <button
                    type="button"
                    className="ds-field-button"
                    onClick={() => setIsProcessSelectorOpen(true)}
                  >
                    <strong>{draft.targetProcess}</strong>
                    <Activity size={14} />
                  </button>
                </label>
                <div className="ds-form-field">
                  <span>Injection method</span>
                  <Select
                    label="Injection method"
                    value={draft.injectionMethod}
                    options={METHODS}
                    onChange={(injectionMethod) => patchDraft({ injectionMethod })}
                  />
                </div>
              </div>
            </section>
          )}

          {activeTab === 'advanced' && (
            <section className="ds-settings-group">
              <div className="ds-settings-section-title">
                <FileCog size={15} />
                <div>
                  <strong>Java runtime</strong>
                  <span>Arguments used by the native JVM launcher.</span>
                </div>
              </div>
              <label className="ds-full-field">
                <span>JVM arguments</span>
                <input
                  value={draft.jvmArgs}
                  onChange={(event) => patchDraft({ jvmArgs: event.target.value })}
                  spellCheck={false}
                />
              </label>
              <Button
                variant="secondary"
                size="sm"
                icon={<Activity size={14} />}
                onClick={() => onLaunchJvm(draft.jvmArgs)}
              >
                Launch configured JAR
              </Button>
            </section>
          )}

          <section className="ds-settings-group">
            <div className="ds-settings-section-title">
              <Terminal size={15} />
              <div>
                <strong>
                  {activeTab === 'general' ? 'Runtime controls' : 'Native diagnostics'}
                </strong>
                <span>
                  {activeTab === 'general'
                    ? 'Immediate native actions and saved behavior.'
                    : 'Controls for the injected client connection.'}
                </span>
              </div>
            </div>
            <div className="ds-toggle-list">
              {activeTab === 'general' && (
                <div>
                  <span>
                    <strong>Process watcher</strong>
                    <small>Inject when the selected process starts.</small>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={watcherActive}
                    className={`ds-switch ${watcherActive ? 'active' : ''}`}
                    onClick={() => onWatcherToggle(!watcherActive)}
                  >
                    <span />
                  </button>
                </div>
              )}
              {activeTab === 'general' && (
                <div>
                  <span>
                    <strong>Auto-close after success</strong>
                    <small>Close three seconds after injection succeeds.</small>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={draft.autoClose}
                    className={`ds-switch ${draft.autoClose ? 'active' : ''}`}
                    onClick={() => patchDraft({ autoClose: !draft.autoClose })}
                  >
                    <span />
                  </button>
                </div>
              )}
              {activeTab === 'general' && (
                <div>
                  <span>
                    <strong>Streamer privacy</strong>
                    <small>Mask the nickname in the application header.</small>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={draft.streamerMode}
                    className={`ds-switch ${draft.streamerMode ? 'active' : ''}`}
                    onClick={() => patchDraft({ streamerMode: !draft.streamerMode })}
                  >
                    <span />
                  </button>
                </div>
              )}
              {activeTab === 'advanced' && (
                <div>
                  <span>
                    <strong>Injected DLL console</strong>
                    <small>Requires an active FDPClient named pipe.</small>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={systemLogActive}
                    className={`ds-switch ${systemLogActive ? 'active' : ''}`}
                    onClick={() => onSystemLogToggle(!systemLogActive)}
                  >
                    <span />
                  </button>
                </div>
              )}
            </div>
          </section>

          {activeTab === 'advanced' && (
            <div className="ds-settings-note">
              <EyeOff size={14} />
              <span>No secrets or arbitrary commands are exposed to the renderer.</span>
            </div>
          )}
        </div>

        <footer className="ds-modal-footer">
          <span />
          <div>
            <Button variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Save size={14} />}
              onClick={() => onSave(draft)}
            >
              Save settings
            </Button>
          </div>
        </footer>
      </div>

      <ProcessSelectionModal
        isOpen={isProcessSelectorOpen}
        onClose={() => setIsProcessSelectorOpen(false)}
        onSelect={(processName) => {
          patchDraft({ targetProcess: processName });
          setIsProcessSelectorOpen(false);
        }}
      />
    </div>
  );
}
