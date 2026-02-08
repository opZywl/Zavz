/**
 * API Connector - Fetches remote config from injector.txt
 * Equivalent of APIConnectorUtils.kt
 *
 * Remote format: ///version///alertBoolean
 * Example: ///v1.0.0///true
 */
import { URLRegistry } from './urlRegistry';

export interface InjectorConfig {
  version: string;
  showUpdateAlert: boolean;
}

const DEFAULT_CONFIG: InjectorConfig = {
  version: 'v1.0.0',
  showUpdateAlert: false,
};

/**
 * Fetches and parses the injector config from the remote server.
 */
export async function fetchInjectorConfig(): Promise<InjectorConfig> {
  try {
    const response = await fetch(URLRegistry.INJECTOR);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();

    // Parse format: ///version///alert
    const parts = text.trim().split('///').filter(Boolean);
    if (parts.length < 2) return DEFAULT_CONFIG;

    return {
      version: parts[0].trim(),
      showUpdateAlert: parts[1].trim().toLowerCase() === 'true',
    };
  } catch (error) {
    console.warn('[APIConnector] Failed to fetch injector config:', error);
    return DEFAULT_CONFIG;
  }
}
