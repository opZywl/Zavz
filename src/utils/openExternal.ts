import { isAllowedExternalUrl } from './urlRegistry';
import { invoke } from '@tauri-apps/api/core';
import { isTauriRuntime } from './runtime';

/**
 * Opens a URL in the system browser. Blocks non-allowlisted hosts.
 */
export async function openExternal(url: string): Promise<boolean> {
  if (!url || !isAllowedExternalUrl(url)) {
    return false;
  }
  try {
    if (isTauriRuntime()) {
      await invoke('open_external', { url });
      return true;
    }
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (opened) opened.opener = null;
    return opened !== null;
  } catch {
    return false;
  }
}
