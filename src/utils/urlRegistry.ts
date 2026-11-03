/**
 * Allowed external destinations — only these may open via openExternal.
 */
export const URLRegistry = {
  PORTFOLIO: 'https://lucas-lima.xyz/',
  WEBSITE: 'https://lucas-lima.xyz/',
  FDP_DOWNLOAD: 'https://fdpinfo.github.io/next/',
  GITHUB: 'https://github.com/opZywl',
  DISCORD: 'https://discord.gg/3XRFGeqEYD',
  YOUTUBE: 'https://www.youtube.com/@opZywl',
} as const;

const ALLOWED_HOSTS = new Set([
  'lucas-lima.xyz',
  'www.lucas-lima.xyz',
  'fdpinfo.github.io',
  'github.com',
  'www.github.com',
  'discord.gg',
  'discord.com',
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
]);

export function isAllowedExternalUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    return ALLOWED_HOSTS.has(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}
