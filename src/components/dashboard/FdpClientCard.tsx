import { Check, Download, PackageCheck, RefreshCw, Settings2, Users } from 'lucide-react';
import { PRODUCT } from '../../data/product';
import { BentoCard } from '../ui/BentoCard';
import { Button } from '../ui/Button';
import { StatusBadge, type StatusTone } from '../ui/StatusBadge';

export type AssetState = 'idle' | 'preparing' | 'ready' | 'error';

interface FdpClientCardProps {
  state: AssetState;
  detail: string;
  onPrepare: () => void;
  onSelectClient: () => void;
  onConfigure: () => void;
}

export function FdpClientCard({
  state,
  detail,
  onPrepare,
  onSelectClient,
  onConfigure,
}: FdpClientCardProps) {
  const tone: StatusTone = state === 'error' ? 'error' : state === 'ready' ? 'ok' : 'accent';

  return (
    <BentoCard id="fdpclient" className="area-fdp" ariaLabel="FDPClient files and release">
      <div className="ds-card-heading">
        <div className="ds-title-with-icon">
          <div className="ds-icon-tile">
            <img src="/img/icon/social/fdp-logo.png" alt="" />
          </div>
          <div>
            <p className="ds-overline">Client package</p>
            <h2 className="ds-card-title">FDPClient</h2>
          </div>
        </div>
        <StatusBadge tone={tone} pulse={state === 'preparing'}>
          {state === 'ready'
            ? 'Installed'
            : state === 'preparing'
              ? 'Preparing'
              : PRODUCT.fdpVersion}
        </StatusBadge>
      </div>

      <div className="ds-fdp-visual">
        <img src="/img/portfolio/portfolio-background.webp" alt="" />
        <div className="ds-fdp-logo">
          <img src="/img/icon/social/fdp-logo.png" alt="FDPClient" />
        </div>
        <span>{PRODUCT.minecraftVersion}</span>
      </div>

      <div className="ds-card-copy-row">
        <div>
          <strong>Multi-client pipeline</strong>
          <span>{PRODUCT.fdpReleaseDate}</span>
        </div>
        <p>CM, Badlion, Lunar, CheatBreaker, Vanilla and Forge with automatic detection.</p>
      </div>

      {state === 'preparing' && (
        <div className="ds-progress" role="progressbar" aria-label="Preparing FDPClient files">
          <span />
        </div>
      )}

      <div
        className={`ds-inline-feedback ds-inline-feedback-${state}`}
        role="status"
        aria-live="polite"
      >
        {state === 'ready' ? (
          <PackageCheck size={14} />
        ) : state === 'error' ? (
          <RefreshCw size={14} />
        ) : (
          <Download size={14} />
        )}
        <span>{detail}</span>
      </div>

      <div className="ds-card-actions">
        <Button variant="ghost" size="sm" icon={<Settings2 size={14} />} onClick={onConfigure}>
          JAR
        </Button>
        <Button variant="secondary" size="sm" icon={<Users size={15} />} onClick={onSelectClient}>
          Select client
        </Button>
        <Button
          variant="primary"
          size="sm"
          loading={state === 'preparing'}
          icon={state === 'ready' ? <Check size={15} /> : <Download size={15} />}
          onClick={onPrepare}
        >
          {state === 'ready' ? 'Verify files' : 'Install files'}
        </Button>
      </div>
    </BentoCard>
  );
}
