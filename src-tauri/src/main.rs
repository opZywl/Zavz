#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ffi_bridge;
mod injection_method;
mod injector;
mod manual_map;
mod reflective;
mod thread_hijack;

use std::{fs, path::PathBuf, sync::Mutex, time::Duration};

use serde::{Deserialize, Serialize};
use sysinfo::System;
use tauri::{generate_context, AppHandle, Emitter, Manager, State};
use tokio::{sync::oneshot, time::sleep};

#[derive(Debug, Serialize)]
struct ProcessInfo {
    pid: u32,
    name: String,
}

use injection_method::InjectionMethod;

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
    let config_root = app
        .path()
        .config_dir()
        .map_err(|err| format!("Failed to get config root: {err}"))?;
    let config_dir = config_root.join("Zavz");
    fs::create_dir_all(&config_dir)
        .map_err(|err| format!("Failed to create config folder: {err}"))?;
    Ok(config_dir.join("settings.json"))
}

fn load_settings(path: &PathBuf) -> Result<InjectorSettings, String> {
    if !path.exists() {
        return Ok(InjectorSettings::default());
    }
    let data = fs::read_to_string(path).map_err(|err| format!("Failed to read config: {err}"))?;
    serde_json::from_str(&data).map_err(|err| format!("Invalid config: {err}"))
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
    let data = serde_json::to_string_pretty(&settings)
        .map_err(|err| format!("Failed to serialize: {err}"))?;
    fs::write(&path, data).map_err(|err| format!("Failed to save config: {err}"))?;
    Ok("Settings saved.".to_string())
}

#[tauri::command]
fn inject_dll(request: InjectRequest) -> Result<String, String> {
    // Validate target process name
    if request.target.is_empty() {
        return Err("Process name cannot be empty.".to_string());
    }

    // Validate DLL path
    let dll_path = PathBuf::from(&request.dll_path);
    if !dll_path.exists() {
        return Err(
            "System operation failed. Please check for updates or contact support for assistance."
                .to_string(),
        );
    }

    if !dll_path.is_file() {
        return Err(
            "System operation failed. Please check for updates or contact support for assistance."
                .to_string(),
        );
    }

    // Validate DLL extension
    let extension = dll_path.extension().and_then(|e| e.to_str()).unwrap_or("");

    if extension != "dll" && extension != "lib" {
        return Err(format!(
            "File must have .dll or .lib extension, found: .{}",
            extension
        ));
    }

    // Find the target process
    let process = injector::find_process_by_name(&request.target)?;

    // Perform injection
    let result = injector::inject_dll(process, &dll_path, request.method);

    match result {
        Ok(_) => {
            let mut response = String::new();
            if matches!(request.method, InjectionMethod::ManualMap) {
                response.push_str("[STEALTH MODE] ");
            } else if matches!(request.method, InjectionMethod::ThreadHijack) {
                response.push_str("[THREAD HIJACK] ");
            } else if matches!(request.method, InjectionMethod::Reflective) {
                response.push_str("[REFLECTIVE] ");
            }
            response.push_str(&"Successfully injected thanks Zywl".to_string());
            Ok(response)
        }
        Err(e) => Err(e),
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
        .map_err(|_| "Watcher state corrupted.".to_string())?;

    if guard.is_some() {
        return Err("Watcher is already running.".to_string());
    }

    // Validate target process name
    if request.target.is_empty() {
        return Err("Process name cannot be empty.".to_string());
    }

    // Validate DLL path
    let dll_path = PathBuf::from(&request.dll_path);
    if !dll_path.exists() {
        return Err(format!("DLL file not found: {}", request.dll_path));
    }

    if !dll_path.is_file() {
        return Err(format!(
            "Specified path is not a file: {}",
            request.dll_path
        ));
    }

    // Validate DLL extension
    let extension = dll_path.extension().and_then(|e| e.to_str()).unwrap_or("");

    if extension != "dll" && extension != "lib" {
        return Err(format!(
            "File must have .dll or .lib extension, found: .{}",
            extension
        ));
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
                let _ = app_handle.emit("watcher-status", "Watcher stopped.");
                break;
            }

            system.refresh_processes();
            if let Some(process) = system.processes_by_name(&target).next() {
                let current_pid = process.pid().as_u32();

                // Only inject if it's a new process instance
                if last_pid != Some(current_pid) {
                    let _ = app_handle.emit("watcher-status", "Process found. Injecting...");

                    match injector::find_process_by_name(&target)
                        .and_then(|proc| injector::inject_dll(proc, &dll_path, method))
                    {
                        Ok(_) => {
                            let _ = app_handle.emit(
                                "watcher-status",
                                format!("DLL successfully injected into '{}'!", target),
                            );
                            last_pid = Some(current_pid);
                            // Don't break - continue watching for new instances
                        }
                        Err(err) => {
                            let _ = app_handle.emit("watcher-status", format!("Error: {}", err));
                        }
                    }
                }
            } else {
                let _ = app_handle.emit("watcher-status", format!("Waiting for {}...", target));
                last_pid = None;
            }

            sleep(Duration::from_secs(2)).await;
        }
    });

    *guard = Some(WatcherHandle { stop: stop_tx });

    Ok("Watcher started.".to_string())
}

#[tauri::command]
fn stop_watcher(state: State<'_, WatcherState>) -> Result<String, String> {
    let mut guard = state
        .handle
        .lock()
        .map_err(|_| "Watcher state corrupted.".to_string())?;

    if let Some(handle) = guard.take() {
        let _ = handle.stop.send(());
        return Ok("Watcher stopped.".to_string());
    }

    Err("Watcher is not active.".to_string())
}

#[tauri::command]
fn setup_fdp_jar(request: FdpJarRequest) -> Result<String, String> {
    let jar_path = PathBuf::from(request.jar_path);

    if !jar_path.exists() || !jar_path.is_file() {
        return Err("JAR file not found.".to_string());
    }

    let dest_path = injector::setup_fdp_jar(&jar_path)?;

    Ok(format!("JAR copied to: {}", dest_path.display()))
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LaunchJvmRequest {
    jar_path: String,
    jvm_args: String,
}

#[tauri::command]
fn launch_jvm(request: LaunchJvmRequest) -> Result<String, String> {
    use std::process::Command;

    let jar_path = PathBuf::from(&request.jar_path);
    if !jar_path.exists() {
        return Err(format!("JAR file not found: {}", request.jar_path));
    }

    // Split JVM arguments
    let args: Vec<&str> = if request.jvm_args.is_empty() {
        vec![]
    } else {
        request.jvm_args.split_whitespace().collect()
    };

    // Build command
    let mut cmd = Command::new("java");

    // Add JVM arguments
    for arg in args {
        cmd.arg(arg);
    }

    // Add JAR
    cmd.arg("-jar");
    cmd.arg(jar_path.to_str().unwrap());

    // Spawn process
    match cmd.spawn() {
        Ok(_) => Ok(format!(
            "Java launched successfully!\nArguments: {}",
            request.jvm_args
        )),
        Err(e) => Err(format!("Failed to launch Java: {}", e)),
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
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
            launch_jvm,
        ])
        .run(generate_context!())
        .expect("Error running Tauri application");
}
