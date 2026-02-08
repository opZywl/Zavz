import {
  Bot,
  Send,
  Check,
  Palette,
  Minus,
  Activity,
  Terminal,
  List,
  Play,
  MessageSquare,
  Power,
  Zap,
  CheckCircle,
  Search,
  RefreshCw,
  Cpu,
  Save,
  Droplet,
  Sliders
} from 'lucide-react';

// Re-export Lucide icons that don't have SVG equivalents
export {
  Bot,
  Send,
  Check,
  Palette,
  Minus,
  Activity,
  Terminal,
  List,
  Play,
  MessageSquare,
  Power,
  Zap,
  CheckCircle,
  Search,
  RefreshCw,
  Cpu,
  Save,
  Droplet,
  Sliders
};

// ---- SVG Icon Components (using new icon assets from public/) ----

const createSvgIcon = (src: string, alt: string) => {
  const IconComponent = ({ size = 20, className }: { size?: number; className?: string }) => (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`inline-block ${className || ''}`}
      style={{ width: size, height: size }}
    />
  );
  IconComponent.displayName = alt;
  return IconComponent;
};

// UI Icons (mapped from public/img/icon/)
export const X = createSvgIcon('/img/icon/icon-button-close.svg', 'Close');
export const Settings = createSvgIcon('/img/icon/icon-cog.svg', 'Settings');
export const ChevronDown = createSvgIcon('/img/icon/icon-news-scroll.svg', 'Scroll');
export const ExternalLink = createSvgIcon('/img/icon/social/icon-url.svg', 'External');
export const Eye = createSvgIcon('/img/icon/icon-eye.svg', 'Eye');
export const FileCode = createSvgIcon('/img/icon/icon-file-choose.svg', 'File');
export const Lock = createSvgIcon('/img/icon/icon-lock.svg', 'Lock');
export const Person = createSvgIcon('/img/icon/icon-person.svg', 'Person');
export const Folder = createSvgIcon('/img/icon/icon-directory-choose.svg', 'Folder');
export const FolderOpen = createSvgIcon('/img/icon/icon-directory-open.svg', 'Open');
export const Copy = createSvgIcon('/img/icon/icon-copy-to-clipboard.svg', 'Copy');
export const Plus = createSvgIcon('/img/icon/icon-plus.svg', 'Plus');
export const Prev = createSvgIcon('/img/icon/icon-prev.svg', 'Previous');
export const Next = createSvgIcon('/img/icon/icon-next.svg', 'Next');

// ZAVZ Logo
export const ZavzLogo = () => (
  <img src="/img/icon/icon.png" alt="ZAVZ" width="48" height="48" className="object-contain" />
);

// Injector Icon
export const InjectorIcon = () => (
  <div className="w-10 h-10 rounded-full bg-[var(--accent-600)] flex items-center justify-center relative overflow-hidden shadow-lg group">
     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white z-10">
        <path d="M19 12L12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
     </svg>
     <div className="absolute inset-0 bg-[var(--accent-500)] opacity-50 blur-sm"></div>
  </div>
);

// Social Icons (using new SVG files from public/img/icon/social/)
export const GithubIcon = ({ className }: { className?: string }) => (
  <img src="/img/icon/social/icon-github.svg" alt="GitHub" className={`inline-block ${className || ''}`} />
);

export const DiscordIcon = ({ className }: { className?: string }) => (
  <img src="/img/icon/social/icon-discord.svg" alt="Discord" className={`inline-block ${className || ''}`} />
);

export const TwitterIcon = ({ className }: { className?: string }) => (
  <img src="/img/icon/social/icon-twitter.svg" alt="Twitter" className={`inline-block ${className || ''}`} />
);

export const YoutubeIcon = ({ className }: { className?: string }) => (
  <img src="/img/icon/social/icon-youtube.svg" alt="YouTube" className={`inline-block ${className || ''}`} />
);

export const NodebbIcon = ({ className }: { className?: string }) => (
  <img src="/img/icon/social/icon-nodebb.svg" alt="NodeBB" className={`inline-block ${className || ''}`} />
);

export const UrlIcon = ({ className }: { className?: string }) => (
  <img src="/img/icon/social/icon-url.svg" alt="Link" className={`inline-block ${className || ''}`} />
);
