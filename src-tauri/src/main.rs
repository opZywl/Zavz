#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod injector;
mod ffi_bridge;
mod manual_map;

use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf, sync::Mutex, time::Duration};
use sysinfo::System;
use tauri::{generate_context, AppHandle, Emitter, Manager, State};
use tokio::sync::oneshot;
use tokio::time::sleep;

#[derive(Debug, Serialize)]
struct ProcessInfo {
    pid: u32,
    name: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
#[serde(rename_all = "snake_case")]
enum InjectionMethod {
    Standard,
    ManualMap,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
enum FdpWrapper {
    Lunar,
    Badlion,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct InjectorSettings {
    jvm_args: String,
    injection_method: InjectionMethod,
    auto_close: bool,
    random_window_title: bool,
    fdp_jar_path: String,
    fdp_wrapper: FdpWrapper,
}

impl Default for InjectorSettings {
    fn default() -> Self {
        Self {
            jvm_args: String::new(),
            injection_method: InjectionMethod::Standard,
            auto_close: false,
            random_window_title: false,
            fdp_jar_path: "fdpclient/release.jar".to_string(),
            fdp_wrapper: FdpWrapper::Lunar,
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct InjectRequest {
    target: String,
    dll_path: String,
    method: InjectionMethod,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct WatcherRequest {
    target: String,
    dll_path: String,
    method: InjectionMethod,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FdpJarRequest {
    jar_path: String,
}

struct WatcherHandle {
    stop: oneshot::Sender<()>,
}

#[derive(Default)]
struct WatcherState {
    handle: Mutex<Option<WatcherHandle>>,
}


fn settings_path(app: &AppHandle) -> Result<PathBuf, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|err| format!("Falha ao obter pasta de config: {err}"))?;
    fs::create_dir_all(&config_dir)
        .map_err(|err| format!("Falha ao criar pasta de config: {err}"))?;
    Ok(config_dir.join("yzy_injector_settings.json"))
}

fn load_settings(path: &PathBuf) -> Result<InjectorSettings, String> {
    if !path.exists() {
        return Ok(InjectorSettings::default());
    }
    let data = fs::read_to_string(path).map_err(|err| format!("Falha ao ler config: {err}"))?;
    serde_json::from_str(&data).map_err(|err| format!("Config inválida: {err}"))
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

fn configure_window(app: &AppHandle) -> Result<(), tauri::Error> {
    if let Some(window) = app.get_webview_window("main") {
        window.set_decorations(false)?;
    }
    Ok(())
}

#[tauri::command]
fn get_settings(app: AppHandle) -> Result<InjectorSettings, String> {
    let path = settings_path(&app)?;
    load_settings(&path)
}

#[tauri::command]
fn save_settings(app: AppHandle, settings: InjectorSettings) -> Result<String, String> {
    let path = settings_path(&app)?;
    let data =
        serde_json::to_string_pretty(&settings).map_err(|err| format!("Falha ao serializar: {err}"))?;
    fs::write(&path, data).map_err(|err| format!("Falha ao salvar config: {err}"))?;
    Ok("Configurações salvas.".to_string())
}

#[tauri::command]
fn inject_dll(request: InjectRequest) -> Result<String, String> {
    // Validate target process name
    if request.target.is_empty() {
        return Err("Nome do processo não pode estar vazio.".to_string());
    }

    // Validate DLL path
    let dll_path = PathBuf::from(&request.dll_path);
    if !dll_path.exists() {
        return Err(format!("Arquivo DLL não encontrado: {}", request.dll_path));
    }

    if !dll_path.is_file() {
        return Err(format!("Caminho especificado não é um arquivo: {}", request.dll_path));
    }

    // Validate DLL extension
    let extension = dll_path.extension()
        .and_then(|e| e.to_str())
        .unwrap_or("");

    if extension != "dll" && extension != "lib" {
        return Err(format!("Arquivo deve ter extensão .dll ou .lib, encontrado: .{}", extension));
    }

    // Find the target process
    let process = injector::find_process_by_name(&request.target)?;

    // Perform injection
    let use_manual_map = matches!(request.method, InjectionMethod::ManualMap);
    let result = injector::inject_dll(process, &dll_path, use_manual_map);

    match result {
        Ok(_) => {
            let mut response = String::new();
            if use_manual_map {
                response.push_str("[STEALTH MODE] ");
            }
            response.push_str(&format!(
                "DLL '{}' injetada com sucesso em '{}'!",
                dll_path.file_name().unwrap().to_string_lossy(),
                request.target
            ));
            Ok(response)
        }
        Err(e) => {
            // If manual map failed, suggest using standard
            if use_manual_map && e.contains("not yet fully implemented") {
                Err(format!("Manual Map não está completamente implementado. Por favor, use o método Standard. Detalhes: {}", e))
            } else {
                Err(e)
            }
        }
    }
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

    // Validate target process name
    if request.target.is_empty() {
        return Err("Nome do processo não pode estar vazio.".to_string());
    }

    // Validate DLL path
    let dll_path = PathBuf::from(&request.dll_path);
    if !dll_path.exists() {
        return Err(format!("Arquivo DLL não encontrado: {}", request.dll_path));
    }

    if !dll_path.is_file() {
        return Err(format!("Caminho especificado não é um arquivo: {}", request.dll_path));
    }

    // Validate DLL extension
    let extension = dll_path.extension()
        .and_then(|e| e.to_str())
        .unwrap_or("");

    if extension != "dll" && extension != "lib" {
        return Err(format!("Arquivo deve ter extensão .dll ou .lib, encontrado: .{}", extension));
    }

    let (stop_tx, mut stop_rx) = oneshot::channel();
    let target = request.target;
    let method = request.method;
    let app_handle = app.clone();

    tauri::async_runtime::spawn(async move {
        let mut system = System::new_all();
        let mut last_pid: Option<u32> = None;

        loop {
            if stop_rx.try_recv().is_ok() {
                let _ = app_handle.emit("watcher-status", "Watcher parado.");
                break;
            }

            system.refresh_processes();
            if let Some(process) = system.processes_by_name(&target).next() {
                let current_pid = process.pid().as_u32();

                // Only inject if it's a new process instance
                if last_pid != Some(current_pid) {
                    let _ = app_handle.emit("watcher-status", "Processo encontrado. Injetando...");

                    if matches!(method, InjectionMethod::ManualMap) {
                        let _ = app_handle.emit(
                            "watcher-status",
                            "Manual Map indisponível. Usando Standard LoadLibrary.",
                        );
                    }

                    match injector::find_process_by_name(&target)
                        .and_then(|proc| injector::inject_dll(proc, &dll_path, false))
                    {
                        Ok(_) => {
                            let _ = app_handle.emit("watcher-status", format!("DLL injetada com sucesso em '{}'!", target));
                            last_pid = Some(current_pid);
                            // Don't break - continue watching for new instances
                        }
                        Err(err) => {
                            let _ = app_handle.emit("watcher-status", format!("Erro: {}", err));
                        }
                    }
                }
            } else {
                let _ = app_handle.emit("watcher-status", format!("Aguardando {}...", target));
                last_pid = None;
            }

            sleep(Duration::from_secs(2)).await;
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

#[tauri::command]
fn setup_fdp_jar(request: FdpJarRequest) -> Result<String, String> {
    let jar_path = PathBuf::from(request.jar_path);

    if !jar_path.exists() || !jar_path.is_file() {
        return Err("Arquivo JAR não encontrado.".to_string());
    }

    let dest_path = injector::setup_fdp_jar(&jar_path)?;

    Ok(format!(
        "JAR copiado para: {}",
        dest_path.display()
    ))
}

fn main() {
    tauri::Builder::default()
        .manage(WatcherState::default())
        .setup(|app| {
            configure_window(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_settings,
            save_settings,
            list_processes,
            inject_dll,
            start_watcher,
            stop_watcher,
            setup_fdp_jar,
        ])
        .run(generate_context!())
        .expect("Erro ao executar aplicação Tauri");
}
