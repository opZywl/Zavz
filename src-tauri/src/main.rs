#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::{path::PathBuf, sync::Mutex, time::Duration};
use sysinfo::{ProcessExt, System, SystemExt};
use tauri::{AppHandle, Manager, State};
use tokio::sync::oneshot;

use dll_syringe::{process::OwnedProcess, Syringe};

#[derive(Debug, Serialize)]
struct ProcessInfo {
    pid: u32,
    name: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
enum InjectionMethod {
    Standard,
    ManualMap,
}

#[derive(Debug, Deserialize)]
struct InjectRequest {
    target: String,
    dll_path: String,
    method: InjectionMethod,
}

#[derive(Debug, Deserialize)]
struct WatcherRequest {
    target: String,
    dll_path: String,
    method: InjectionMethod,
}

struct WatcherHandle {
    stop: oneshot::Sender<()>,
}

#[derive(Default)]
struct WatcherState {
    handle: Mutex<Option<WatcherHandle>>,
}

fn find_process_by_name(target: &str) -> Result<OwnedProcess, String> {
    let mut system = System::new_all();
    system.refresh_processes();

    let process = system
        .processes_by_name(target)
        .next()
        .ok_or_else(|| format!("Processo '{target}' não encontrado."))?;

    OwnedProcess::from_pid(process.pid().as_u32())
        .map_err(|err| format!("Falha ao abrir processo: {err}"))
}

fn inject_into_process(process: OwnedProcess, dll_path: &PathBuf, method: InjectionMethod) -> Result<(), String> {
    let syringe = Syringe::for_process(process);
    match method {
        InjectionMethod::Standard => syringe
            .inject(dll_path)
            .map(|_| ())
            .map_err(|err| format!("Erro ao injetar DLL: {err}")),
        InjectionMethod::ManualMap => syringe
            .inject_manual_map(dll_path)
            .map(|_| ())
            .map_err(|err| format!("Erro ao injetar DLL (Manual Map): {err}")),
    }
}

#[tauri::command]
fn list_processes() -> Result<Vec<ProcessInfo>, String> {
    let mut system = System::new_all();
    system.refresh_processes();

    let processes = system
        .processes()
        .values()
        .map(|process| ProcessInfo {
            pid: process.pid().as_u32(),
            name: process.name().to_string(),
        })
        .collect();

    Ok(processes)
}

#[tauri::command]
fn inject_dll(request: InjectRequest) -> Result<String, String> {
    let dll_path = PathBuf::from(request.dll_path);
    if !dll_path.exists() {
        return Err("Arquivo DLL não encontrado no caminho informado.".to_string());
    }

    let process = find_process_by_name(&request.target)?;
    inject_into_process(process, &dll_path, request.method)?;

    Ok("DLL injetada com sucesso.".to_string())
}

#[tauri::command]
fn start_watcher(
    app: AppHandle,
    state: State<'_, WatcherState>,
    request: WatcherRequest,
) -> Result<String, String> {
    let mut guard = state
        .handle
        .lock()
        .map_err(|_| "Estado do watcher corrompido.".to_string())?;

    if guard.is_some() {
        return Err("Watcher já está em execução.".to_string());
    }

    let dll_path = PathBuf::from(request.dll_path);
    if !dll_path.exists() {
        return Err("Arquivo DLL não encontrado no caminho informado.".to_string());
    }

    let (stop_tx, mut stop_rx) = oneshot::channel();
    let target = request.target;
    let method = request.method;
    let app_handle = app.clone();

    tauri::async_runtime::spawn(async move {
        let mut system = System::new_all();
        loop {
            if stop_rx.try_recv().is_ok() {
                let _ = app_handle.emit_all("watcher-status", "Watcher parado.");
                break;
            }

            system.refresh_processes();
            if let Some(process) = system.processes_by_name(&target).next() {
                let _ = app_handle.emit_all("watcher-status", "Processo encontrado. Injetando...");

                match OwnedProcess::from_pid(process.pid().as_u32())
                    .map_err(|err| format!("Falha ao abrir processo: {err}"))
                    .and_then(|proc| inject_into_process(proc, &dll_path, method))
                {
                    Ok(_) => {
                        let _ = app_handle.emit_all("watcher-status", "Injected!");
                        break;
                    }
                    Err(err) => {
                        let _ = app_handle.emit_all("watcher-status", err);
                    }
                }
            } else {
                let _ = app_handle.emit_all("watcher-status", "Waiting for process...");
            }

            tauri::async_runtime::sleep(Duration::from_secs(2)).await;
        }
    });

    *guard = Some(WatcherHandle { stop: stop_tx });

    Ok("Watcher iniciado.".to_string())
}

#[tauri::command]
fn stop_watcher(state: State<'_, WatcherState>) -> Result<String, String> {
    let mut guard = state
        .handle
        .lock()
        .map_err(|_| "Estado do watcher corrompido.".to_string())?;

    if let Some(handle) = guard.take() {
        let _ = handle.stop.send(());
        return Ok("Watcher interrompido.".to_string());
    }

    Err("Watcher não está ativo.".to_string())
}

fn main() {
    tauri::Builder::default()
        .manage(WatcherState::default())
        .invoke_handler(tauri::generate_handler![
            list_processes,
            inject_dll,
            start_watcher,
            stop_watcher
        ])
        .run(tauri::generate_context!())
        .expect("erro ao executar aplicação Tauri");
}
