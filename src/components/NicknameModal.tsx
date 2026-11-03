import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Check, UserRound, X } from 'lucide-react';
import { Button } from './ui/Button';

interface NicknameModalProps {
  initialValue?: string;
  onConfirm: (nickname: string) => void;
  onClose?: () => void;
}

type PreviewState = 'idle' | 'loading' | 'ready' | 'error';

const NICKNAME_PATTERN = /^[A-Za-z0-9_]{3,16}$/;

export function NicknameModal({ initialValue = '', onConfirm, onClose }: NicknameModalProps) {
  const [value, setValue] = useState(initialValue);
  const [previewState, setPreviewState] = useState<PreviewState>('idle');
  const nickname = value.trim();
  const isValid = NICKNAME_PATTERN.test(nickname);
  const avatarUrl = useMemo(
    () => (isValid ? `https://mc-heads.net/avatar/${encodeURIComponent(nickname)}/96` : ''),
    [isValid, nickname]
  );

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    setPreviewState(isValid ? 'loading' : 'idle');
  }, [avatarUrl, isValid]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (isValid) onConfirm(nickname);
  };

  return (
    <div
      className="ds-modal-backdrop ds-nickname-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <form
        onSubmit={submit}
        className="ds-modal ds-nickname-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nickname-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="ds-modal-header">
          <div>
            <p className="ds-overline">Local profile</p>
            <h2 id="nickname-title">Minecraft nickname</h2>
          </div>
          {onClose && (
            <button type="button" className="ds-icon-button" onClick={onClose} aria-label="Close">
              <X size={17} />
            </button>
          )}
        </header>

        <div className="ds-nickname-body">
          <div className={`ds-skin-preview is-${previewState}`} aria-live="polite">
            <span>
              <UserRound size={24} />
            </span>
            {avatarUrl && (
              <img
                key={avatarUrl}
                src={avatarUrl}
                alt={`Minecraft skin preview for ${nickname}`}
                onLoad={() => setPreviewState('ready')}
                onError={() => setPreviewState('error')}
              />
            )}
          </div>

          <div className="ds-nickname-copy">
            <h3>{initialValue ? 'Update your player profile.' : 'Set up your player profile.'}</h3>
            <p>
              The nickname and skin are stored locally and restored the next time you open the app.
            </p>
          </div>

          <label className="ds-onboarding-field">
            <span>Nickname</span>
            <input
              type="text"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Enter nickname"
              minLength={3}
              maxLength={16}
              pattern="[A-Za-z0-9_]{3,16}"
              autoComplete="off"
              spellCheck={false}
              autoFocus
              aria-describedby="nickname-help"
            />
          </label>
          <p id="nickname-help" className={`ds-field-hint ${nickname && !isValid ? 'error' : ''}`}>
            {nickname && !isValid
              ? 'Use 3–16 letters, numbers or underscores.'
              : previewState === 'loading'
                ? 'Loading skin preview…'
                : previewState === 'error'
                  ? 'Skin unavailable. A local fallback will be used.'
                  : previewState === 'ready'
                    ? 'Skin found and ready.'
                    : 'Use 3–16 letters, numbers or underscores.'}
          </p>
        </div>

        <footer className="ds-modal-footer">
          <span />
          <div>
            {onClose && (
              <Button type="button" variant="secondary" size="md" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!isValid}
              icon={<Check size={15} />}
            >
              Save profile
            </Button>
          </div>
        </footer>
      </form>
    </div>
  );
}
