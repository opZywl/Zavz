import { ArrowUpRight, CheckCircle2, GitPullRequestArrow, Sparkles, Wrench } from 'lucide-react';
import type { UpdateEntry } from '../../types/product';
import { BentoCard } from '../ui/BentoCard';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

interface UpdatesCardProps {
  update?: UpdateEntry;
  newVersionAvailable: boolean;
  onOpenRelease: () => void;
}

export function UpdatesCard({ update, newVersionAvailable, onOpenRelease }: UpdatesCardProps) {
  return (
    <BentoCard id="updates" className="area-updates" ariaLabel="Application updates">
      <div className="ds-card-heading">
        <div className="ds-title-with-icon">
          <div className="ds-icon-tile">
            <GitPullRequestArrow size={18} />
          </div>
          <div>
            <p className="ds-overline">Release history</p>
            <h2 className="ds-card-title">Updates</h2>
          </div>
        </div>
        <StatusBadge tone={newVersionAvailable ? 'warn' : 'ok'} pulse={newVersionAvailable}>
          {newVersionAvailable ? 'Update available' : 'Up to date'}
        </StatusBadge>
      </div>

      {update ? (
        <>
          <div className="ds-update-version">
            <div>
              <span>Current release</span>
              <strong>v{update.version}</strong>
            </div>
            <time>{update.date}</time>
          </div>

          <div className="ds-update-columns">
            <div>
              <span>
                <Sparkles size={13} /> Highlights
              </span>
              <ul>
                {update.highlights.slice(0, 2).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <span>
                <Wrench size={13} /> Fixes
              </span>
              <ul>
                {update.fixes.slice(0, 2).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="ds-update-footer">
            <span>
              <CheckCircle2 size={14} /> {update.features.length} new capabilities
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowUpRight size={14} />}
              onClick={onOpenRelease}
            >
              Open release
            </Button>
          </div>
        </>
      ) : (
        <div className="ds-empty-state">
          <strong>No release data</strong>
          <p>Add an entry to updates.json.</p>
        </div>
      )}
    </BentoCard>
  );
}
