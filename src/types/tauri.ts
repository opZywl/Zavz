// TypeScript type definitions for Tauri backend commands

export interface ProcessInfo {
  pid: number;
  name: string;
}

export type InjectionMethod = 'standard' | 'manual_map' | 'thread_hijack' | 'reflective';
export type FdpWrapper = 'lunar' | 'badlion';

export interface InjectRequest {
  target: string;
  dllPath: string;
  method: InjectionMethod;
}

export interface WatcherRequest {
  target: string;
  dllPath: string;
  method: InjectionMethod;
}

export interface FdpJarRequest {
  jarPath: string;
}

export interface InjectorSettings {
  jvmArgs: string;
  injectionMethod: InjectionMethod;
  autoClose: boolean;
  randomWindowTitle: boolean;
  fdpJarPath: string;
  fdpWrapper: FdpWrapper;
}

// Tauri command type definitions
export interface TauriCommands {
  list_processes: () => Promise<ProcessInfo[]>;
  inject_dll: (request: InjectRequest) => Promise<string>;
  start_watcher: (request: WatcherRequest) => Promise<string>;
  stop_watcher: () => Promise<string>;
  setup_fdp_jar: (request: FdpJarRequest) => Promise<string>;
  resolve_fdp_dll_path: () => Promise<string>;
  pick_dll_file: () => Promise<string | null>;
  get_settings: () => Promise<InjectorSettings>;
  save_settings: (settings: InjectorSettings) => Promise<string>;
}

// Type-safe invoke wrapper
import { invoke as tauriInvoke } from '@tauri-apps/api/core';

export async function invokeCommand<K extends keyof TauriCommands>(
  command: K,
  args?: Parameters<TauriCommands[K]>[0]
): Promise<ReturnType<TauriCommands[K]>> {
  return tauriInvoke(command, args ? { request: args } : undefined) as Promise<
    ReturnType<TauriCommands[K]>
  >;
}
