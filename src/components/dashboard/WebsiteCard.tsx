import { ArrowUpRight, Globe2, Images } from 'lucide-react';
import { BentoCard } from '../ui/BentoCard';
import { Button } from '../ui/Button';

interface WebsiteCardProps {
  onVisit: () => void;
}

export function WebsiteCard({ onVisit }: WebsiteCardProps) {
  return (
    <BentoCard id="website" className="area-website" ariaLabel="Lucas Lima portfolio">
      <div className="ds-website-preview">
        <img
          src="/img/portfolio/site/portfolio-home.webp"
          alt="Preview of the Lucas Lima portfolio"
        />
        <div className="ds-website-scrim" />
        <div className="ds-website-chip">
          <Globe2 size={13} /> lucas-lima.xyz
        </div>
        <div className="ds-website-gallery">
          <Images size={13} /> Local preview
        </div>
      </div>

      <div className="ds-website-copy">
        <div>
          <p className="ds-overline">Featured website</p>
          <h2 className="ds-card-title">Lucas Lima Portfolio</h2>
          <p>Interactive portfolio and the official visual system behind ZAVZ.</p>
        </div>
        <Button variant="secondary" size="sm" icon={<ArrowUpRight size={15} />} onClick={onVisit}>
          Visit website
        </Button>
      </div>
    </BentoCard>
  );
}
