/**
 * URL Registry - Central directory of all remote endpoints.
 * Equivalent of URLRegistryUtils.kt
 */
export const URLRegistry = {
  WEBSITE: 'https://fdpinfo.github.io/next',
  get STATUS() {
    return `${this.WEBSITE}/database/data.txt`;
  },
  get INJECTOR() {
    return `${this.WEBSITE}/database/injector.txt`;
  },
  GITHUB: 'https://github.com/opZywl',
} as const;
