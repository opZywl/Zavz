import type { PayloadId } from '../types/tauri';

export const PROJECT_LABELS: Record<PayloadId, string> = {
  visuals: 'Visuals',
  fdpclient: 'FDPClient',
  fdplunar: 'FDP Lunar',
};

export function projectNames(selected: PayloadId[], separator = ' + '): string {
  return selected.map((id) => PROJECT_LABELS[id]).join(separator);
}
