import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Settings, UserRoundCog, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import brandIcon from '../assets/branding/icon.png';
import { isTauriRuntime } from '../utils/runtime';

interface HeaderProps {
  nickname: string;
  onOpenNickname: () => void;
  onOpenSettings: () => void;
  onDrag: (event: MouseEvent) => void;
}

type AvatarState = 'loading' | 'ready' | 'error';

async function closeWindow() {
  if (!isTauriRuntime()) return;
  await getCurrentWindow().close();
}

function SkinAvatar({ nickname }: { nickname: string }) {
  const [state, setState] = useState<AvatarState>('loading');
  const [useFallback, setUseFallback] = useState(false);
  const initials = nickname.trim().slice(0, 2).toUpperCase() || 'YZ';
  const skinUrl = useMemo(() => {
    const player = useFallback ? 'MHF_Steve' : nickname.trim();
    return `https://mc-heads.net/avatar/${encodeURIComponent(player)}/64`;
  }, [nickname, useFallback]);

  useEffect(() => {
    setState('loading');
    setUseFallback(false);
  }, [nickname]);

  return (
    <span className={`ds-user-avatar is-${state}`} aria-hidden="true">
      {state !== 'ready' && <span className="ds-avatar-fallback">{initials}</span>}
      <img
        key={skinUrl}
        src={skinUrl}
        alt=""
        draggable={false}
        onLoad={() => setState('ready')}
        onError={() => {
          if (!useFallback) {
            setUseFallback(true);
            setState('loading');
          } else {
            setState('error');
          }
        }}
      />
    </span>
  );
}

export function Header({ nickname, onOpenNickname, onOpenSettings, onDrag }: HeaderProps) {
  const role = nickname === 'Zywl' ? 'Administrator' : 'Player';

  return (
    <header className="ds-app-header ds-compact-header" data-tauri-drag-region onMouseDown={onDrag}>
      <div className="ds-brand" data-tauri-drag-region>
        <img className="ds-brand-symbol" src={brandIcon} alt="" draggable={false} />
        <div className="ds-brand-copy">
          <strong>ZAVZ</strong>
          <span>Injector</span>
        </div>
      </div>

      <div className="ds-welcome" data-tauri-drag-region>
        <span>
          Welcome back, <strong>{nickname || 'Player'}</strong>.
        </span>
        <i />
      </div>

      <div className="ds-header-actions no-drag" onMouseDown={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="ds-user-button"
          onClick={onOpenNickname}
          aria-label="Change Minecraft nickname"
          title="Change nickname"
        >
          <SkinAvatar nickname={nickname || 'MHF_Steve'} />
          <span>
            <strong>{nickname || 'Player'}</strong>
            <small>{role}</small>
          </span>
          <UserRoundCog size={14} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="ds-header-icon ds-tooltip"
          data-tooltip="Settings"
          onClick={onOpenSettings}
          aria-label="Open application settings"
        >
          <Settings size={17} aria-hidden="true" />
        </button>

        <div className="ds-window-controls" aria-label="Window controls">
          <button
            type="button"
            className="close"
            onClick={() => void closeWindow()}
            aria-label="Close window"
            title="Close"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
