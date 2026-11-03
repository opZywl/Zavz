import { ExternalLink, Globe2 } from 'lucide-react';
import { DiscordIcon, GithubIcon, YoutubeIcon } from '../Icons';
import { openExternal } from '../../utils/openExternal';
import { URLRegistry } from '../../utils/urlRegistry';

const links = [
  {
    label: 'Portfolio',
    url: URLRegistry.PORTFOLIO,
    icon: <Globe2 size={20} />,
  },
  { label: 'GitHub', url: URLRegistry.GITHUB, icon: <GithubIcon className="h-[22px] w-[22px]" /> },
  {
    label: 'Discord',
    url: URLRegistry.DISCORD,
    icon: <DiscordIcon className="h-[22px] w-[22px]" />,
  },
  {
    label: 'YouTube',
    url: URLRegistry.YOUTUBE,
    icon: <YoutubeIcon className="h-[22px] w-[22px]" />,
  },
] as const;

export function ExternalLinks() {
  return (
    <nav className="ds-external-links" aria-label="External links">
      {links.map((link) => (
        <button
          type="button"
          key={link.label}
          className="ds-tooltip"
          data-tooltip={link.label}
          aria-label={`Open ${link.label} in the default browser`}
          onClick={() => void openExternal(link.url)}
        >
          {link.icon}
        </button>
      ))}
      <button
        type="button"
        className="ds-external-primary ds-tooltip"
        data-tooltip="Portfolio"
        onClick={() => void openExternal(URLRegistry.PORTFOLIO)}
      >
        <span className="ds-external-primary-icon" aria-hidden="true">
          <ExternalLink size={14} />
        </span>
        <span>lucas-lima.xyz</span>
      </button>
    </nav>
  );
}
