import updatesJson from './updates.json';
import type { UpdateEntry } from '../types/product';

export const PRODUCT = {
  name: 'ZAVZ',
  version: '1.1.2',
  minecraftVersion: '1.8.9',
  channel: 'Stable',
  releaseDate: '02/11/2026',
  releaseSummary: 'Native multi-client injection with automatic target detection.',
  fdpVersion: 'B17',
  fdpReleaseDate: '17 Jul 2026',
} as const;

function isUpdateEntry(value: unknown): value is UpdateEntry {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.version === 'string' &&
    typeof item.date === 'string' &&
    (item.status === 'current' || item.status === 'previous') &&
    Array.isArray(item.highlights) &&
    item.highlights.every((entry) => typeof entry === 'string') &&
    Array.isArray(item.fixes) &&
    item.fixes.every((entry) => typeof entry === 'string') &&
    Array.isArray(item.features) &&
    item.features.every((entry) => typeof entry === 'string')
  );
}

export const UPDATES: UpdateEntry[] = Array.isArray(updatesJson)
  ? updatesJson.filter(isUpdateEntry)
  : [];
