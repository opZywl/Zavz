import type { PayloadConfiguration, PayloadId } from '../types/tauri';

export const PROJECT_LABELS: Record<PayloadId, string> = {
  visuals: 'Julia',
  fdpclient: 'FDPClient',
  fdplunar: 'FDPClient Inject',
};

export function payloadsForProfile(
  configuration: PayloadConfiguration,
  profile: string
): PayloadConfiguration {
  if (profile === 'Zywl' || !configuration.selected.includes('fdpclient')) return configuration;
  const selected = configuration.selected.filter((id) => id !== 'fdpclient');
  return { ...configuration, selected: selected.length ? selected : ['visuals'] };
}

export function projectNames(selected: PayloadId[], separator = ' + '): string {
  return selected.map((id) => PROJECT_LABELS[id]).join(separator);
}
