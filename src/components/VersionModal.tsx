import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  FolderOpen,
  FolderSearch,
  Layers,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { PROJECT_LABELS } from '../data/projects';
import { isTauriRuntime } from '../utils/runtime';
import type { PayloadConfiguration, PayloadId, PayloadStatus } from '../types/tauri';
import { Button } from './ui/Button';

interface VersionModalProps {
  profile: string;
  isOpen: boolean;
  onClose: () => void;
  configuration: PayloadConfiguration;
  onSave: (configuration: PayloadConfiguration) => Promise<void>;
}

type JarField = 'visualsJar' | 'fdpclientJar' | 'fdpLunarJar';

const PROJECTS: Array<{ id: PayloadId; field: JarField; detail: string; mark: ReactNode }> = [
  {
    id: 'visuals',
    field: 'visualsJar',
    detail: 'Effects, HUD and weapons for Minecraft 1.8.9',
    mark: <Sparkles size={17} aria-hidden="true" />,
  },
  {
    id: 'fdpclient',
    field: 'fdpclientJar',
    detail: 'Client for Minecraft 1.8.9',
    mark: <img src="/img/icon/social/fdp-logo.png" alt="" />,
  },
  {
    id: 'fdplunar',
    field: 'fdpLunarJar',
    detail: 'Client for Minecraft 1.8.9 | Lunar Client Compatible',
    mark: <img src="/img/icon/social/fdp-logo.png" alt="" />,
  },
];

const STATE_LABELS: Record<PayloadStatus['state'], string> = {
  ready: 'Ready',
  missing: 'No JAR',
  invalid: 'Wrong file',
};

function samePath(first: string, second: string): boolean {
  return first.toLowerCase() === second.toLowerCase();
}

function describeFile(status: PayloadStatus): string {
  const size = `${(status.sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  if (!samePath(status.path, status.installPath)) {
    return `${size}. Saving copies it to ${status.installPath}`;
  }
  const date = status.modifiedMs
    ? `, updated ${new Date(status.modifiedMs).toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })}`
    : '';
  return `${status.detected ? 'Found on this PC and installed. ' : ''}${size}${date}`;
}

export function VersionModal({
  isOpen,
  onClose,
  configuration,
  onSave,
  profile,
}: VersionModalProps) {
  const [draft, setDraft] = useState(configuration);
  const [statuses, setStatuses] = useState<Partial<Record<PayloadId, PayloadStatus>>>({});
  const [pickingField, setPickingField] = useState<JarField | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const inspection = useRef(0);

  const inspect = useCallback(async (current: PayloadConfiguration, detect: boolean) => {
    if (!isTauriRuntime()) return;
    const ticket = ++inspection.current;
    try {
      const result = await invoke<PayloadStatus[]>('inspect_payloads', {
        configuration: current,
        detect,
      });
      if (ticket !== inspection.current) return;
      setStatuses(Object.fromEntries(result.map((status) => [status.id, status])));
      setDraft((latest) => {
        const next = { ...latest };
        for (const status of result) {
          const project = PROJECTS.find((candidate) => candidate.id === status.id);
          if (project) next[project.field] = status.path;
        }
        return next;
      });
    } catch (reason) {
      if (ticket === inspection.current) setError(String(reason));
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const opening = { ...configuration, selected: [...configuration.selected] };
    setDraft(opening);
    setStatuses({});
    setError('');
    void inspect(opening, true);
  }, [configuration, inspect, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleProject = (id: PayloadId) => {
    setDraft((current) => ({
      ...current,
      selected:
        current.allowMultiple && id !== 'fdplunar' && !current.selected.includes('fdplunar')
          ? current.selected.includes(id)
            ? current.selected.filter((value) => value !== id)
            : [...current.selected, id]
          : [id],
    }));
    setError('');
  };

  const setLoadBoth = (allowMultiple: boolean) => {
    setDraft((current) => ({
      ...current,
      allowMultiple,
      selected: allowMultiple ? current.selected : current.selected.slice(0, 1),
    }));
    setError('');
  };

  const pickJar = async (field: JarField) => {
    if (!isTauriRuntime()) {
      setError('The file picker is available in the desktop application.');
      return;
    }
    setPickingField(field);
    setError('');
    try {
      const path = await invoke<string | null>('pick_jar_file');
      if (path) {
        const next = { ...draft, [field]: path };
        setDraft(next);
        await inspect(next, false);
      }
    } catch (reason) {
      setError(String(reason));
    } finally {
      setPickingField(null);
    }
  };

  const reveal = (path: string) => {
    if (!isTauriRuntime()) return;
    void invoke('reveal_in_explorer', { path }).catch((reason: unknown) =>
      setError(String(reason))
    );
  };

  const blockedProject = draft.selected.find((id) => {
    const state = statuses[id]?.state;
    return state === 'missing' || state === 'invalid';
  });

  const save = async () => {
    if (!draft.selected.length) {
      setError('Select a project to load.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await onSave(draft);
    } catch (reason) {
      setError(String(reason));
    } finally {
      setIsSaving(false);
    }
  };

  const projects = PROJECTS.filter((project) => project.id !== 'fdpclient' || profile === 'Zywl');

  return (
    <div
      className="ds-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        className="ds-modal ds-project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-title"
      >
        <header className="ds-modal-header">
          <div className="ds-title-with-icon">
            <span className="ds-project-header-mark" aria-hidden="true">
              <Layers size={17} />
            </span>
            <div>
              <p className="ds-overline">Start loads</p>
              <h2 id="project-title">Choose a project</h2>
            </div>
          </div>
          <button
            type="button"
            className="ds-icon-button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close project selection"
          >
            <X size={16} />
          </button>
        </header>

        <div className="ds-project-body">
          <div
            className="ds-project-list"
            role={draft.allowMultiple ? 'group' : 'radiogroup'}
            aria-label="Projects"
          >
            {projects.map((project) => {
              const label = PROJECT_LABELS[project.id];
              const isSelected = draft.selected.includes(project.id);
              const status = statuses[project.id];
              const path = draft[project.field];
              return (
                <article
                  key={project.id}
                  className={`ds-project-card ${isSelected ? 'is-selected' : ''}`}
                >
                  <button
                    type="button"
                    className="ds-project-pick"
                    role={draft.allowMultiple ? 'checkbox' : 'radio'}
                    aria-checked={isSelected}
                    disabled={isSaving}
                    onClick={() => toggleProject(project.id)}
                  >
                    <span className="ds-project-mark">{project.mark}</span>
                    <span className="ds-project-title">
                      <strong>{label}</strong>
                      <small>{project.detail}</small>
                    </span>
                    {status ? (
                      <span className={`ds-project-state is-${status.state}`}>
                        {status.state === 'ready' ? (
                          <CheckCircle2 size={12} aria-hidden="true" />
                        ) : (
                          <AlertCircle size={12} aria-hidden="true" />
                        )}
                        {STATE_LABELS[status.state]}
                      </span>
                    ) : (
                      <span className="ds-project-state">
                        <Loader2 size={12} className="ds-spin" aria-hidden="true" />
                        Checking
                      </span>
                    )}
                    <span
                      className={`ds-project-check ${draft.allowMultiple ? 'is-square' : ''}`}
                      aria-hidden="true"
                    >
                      {isSelected && <Check size={12} />}
                    </span>
                  </button>

                  <div className="ds-project-file">
                    <input
                      value={path}
                      readOnly
                      spellCheck={false}
                      disabled={isSaving}
                      title={path}
                      placeholder="Finding the folder on this PC…"
                      aria-label={`${label} JAR location`}
                    />
                    <button
                      type="button"
                      onClick={() => reveal(path)}
                      disabled={isSaving || !path}
                      title="Show in folder"
                      aria-label={`Show the ${label} folder`}
                    >
                      <FolderSearch size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void pickJar(project.field)}
                      disabled={pickingField !== null || isSaving}
                      title="Choose file"
                      aria-label={`Choose the ${label} JAR`}
                    >
                      <FolderOpen size={15} />
                    </button>
                  </div>

                  {status && status.state === 'ready' && (
                    <p className="ds-project-note">{describeFile(status)}</p>
                  )}
                  {status && status.state !== 'ready' && (
                    <p className="ds-project-note is-error">{status.message}</p>
                  )}
                </article>
              );
            })}
          </div>

          <div className="ds-project-both">
            <span>
              <strong>Load both at once</strong>
              <small>Off: only the selected project loads.</small>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={draft.allowMultiple}
              aria-label="Load both at once"
              className={`ds-switch ${draft.allowMultiple ? 'active' : ''}`}
              disabled={isSaving}
              onClick={() => setLoadBoth(!draft.allowMultiple)}
            >
              <span />
            </button>
          </div>

          {error && (
            <p className="ds-project-note is-error" role="alert">
              {error}
            </p>
          )}
        </div>

        <footer className="ds-modal-footer">
          <span className="ds-project-footnote">Restart Minecraft before switching projects.</span>
          <div>
            <Button variant="secondary" size="md" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => void save()}
              loading={isSaving}
              disabled={Boolean(blockedProject) || !draft.selected.length}
            >
              Save selection
            </Button>
          </div>
        </footer>
      </section>
    </div>
  );
}
