/**
 * Opens a URL in the system's default browser.
 * Uses Tauri plugin-opener when available, falls back to window.open.
 */
export async function openExternal(url: string): Promise<void> {
  try {
    const { openUrl } = await import('@tauri-apps/plugin-opener');
    await openUrl(url);
  } catch {
    window.open(url, '_blank');
  }
}
