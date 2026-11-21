export interface InjectorConfig {
  version: string;
  showUpdateAlert: boolean;
  source: 'remote' | 'local';
}

const DEFAULT_CONFIG: InjectorConfig = {
  version: 'v1.0.0',
  showUpdateAlert: false,
  source: 'local',
};

/**
 * Reads the packaged release channel. The previous remote endpoint now returns
 * HTTP 404, so release metadata is kept offline-first and can be replaced in a
 * future signed update without producing renderer network errors.
 */
export async function fetchInjectorConfig(): Promise<InjectorConfig> {
  try {
    const response = await fetch('/config/injector.json');
    if (!response.ok) return DEFAULT_CONFIG;
    const value = (await response.json()) as Record<string, unknown>;
    return {
      version: typeof value.version === 'string' ? value.version : DEFAULT_CONFIG.version,
      showUpdateAlert:
        typeof value.showUpdateAlert === 'boolean'
          ? value.showUpdateAlert
          : DEFAULT_CONFIG.showUpdateAlert,
      source: 'local',
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
