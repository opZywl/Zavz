#[cfg(target_os = "windows")]
use std::ffi::{c_void, CString};
#[cfg(target_os = "windows")]
use std::os::windows::io::AsRawHandle;
#[cfg(target_os = "windows")]
use std::path::Path;

#[cfg(target_os = "windows")]
use dll_syringe::process::{OwnedProcess, Process};
#[cfg(target_os = "windows")]
use windows_sys::Win32::Foundation::{CloseHandle, HANDLE, INVALID_HANDLE_VALUE};
#[cfg(target_os = "windows")]
use windows_sys::Win32::System::Diagnostics::Debug::{
    GetThreadContext, SetThreadContext, WriteProcessMemory, CONTEXT, CONTEXT_CONTROL_AMD64,
};
#[cfg(target_os = "windows")]
use windows_sys::Win32::System::Diagnostics::ToolHelp::{
    CreateToolhelp32Snapshot, Module32FirstW, Module32NextW, Thread32First, Thread32Next,
    MODULEENTRY32W, TH32CS_SNAPMODULE, TH32CS_SNAPMODULE32, TH32CS_SNAPTHREAD, THREADENTRY32,
};
#[cfg(target_os = "windows")]
use windows_sys::Win32::System::LibraryLoader::{GetModuleHandleA, GetProcAddress};
#[cfg(target_os = "windows")]
use windows_sys::Win32::System::Memory::{
    VirtualAllocEx, MEM_COMMIT, MEM_RESERVE, PAGE_EXECUTE_READWRITE, PAGE_READWRITE,
};
#[cfg(target_os = "windows")]
use windows_sys::Win32::System::Threading::{
    OpenThread, ResumeThread, SuspendThread, THREAD_GET_CONTEXT, THREAD_SET_CONTEXT,
    THREAD_SUSPEND_RESUME,
};

#[cfg(target_os = "windows")]
fn find_thread_id(pid: u32) -> Result<u32, String> {
    let snapshot = unsafe { CreateToolhelp32Snapshot(TH32CS_SNAPTHREAD, 0) };
    if snapshot == INVALID_HANDLE_VALUE {
        return Err("Failed to create thread snapshot".to_string());
    }

    let mut entry = THREADENTRY32 {
        dwSize: std::mem::size_of::<THREADENTRY32>() as u32,
        ..unsafe { std::mem::zeroed() }
    };

    let mut has_entry = unsafe { Thread32First(snapshot, &mut entry) } != 0;
    while has_entry {
        if entry.th32OwnerProcessID == pid {
            unsafe { CloseHandle(snapshot) };
            return Ok(entry.th32ThreadID);
        }
        has_entry = unsafe { Thread32Next(snapshot, &mut entry) } != 0;
    }

    unsafe { CloseHandle(snapshot) };
    Err("No thread found for target process".to_string())
}

#[cfg(target_os = "windows")]
fn get_remote_module_base(pid: u32, module_name: &str) -> Result<u64, String> {
    let snapshot =
        unsafe { CreateToolhelp32Snapshot(TH32CS_SNAPMODULE | TH32CS_SNAPMODULE32, pid) };
    if snapshot == INVALID_HANDLE_VALUE {
        return Err("Failed to create module snapshot".to_string());
    }

    let mut entry = MODULEENTRY32W {
        dwSize: std::mem::size_of::<MODULEENTRY32W>() as u32,
        ..unsafe { std::mem::zeroed() }
    };

    let mut found = None;
    let mut has_entry = unsafe { Module32FirstW(snapshot, &mut entry) } != 0;
    while has_entry {
        let name_end = entry
            .szModule
            .iter()
            .position(|&c| c == 0)
            .unwrap_or(entry.szModule.len());
        let name = String::from_utf16_lossy(&entry.szModule[..name_end]).to_lowercase();
        if name == module_name.to_lowercase() {
            found = Some(entry.modBaseAddr as u64);
            break;
        }
        has_entry = unsafe { Module32NextW(snapshot, &mut entry) } != 0;
    }

    unsafe { CloseHandle(snapshot) };

    found.ok_or_else(|| format!("Failed to locate remote module: {}", module_name))
}

#[cfg(target_os = "windows")]
pub fn is_module_loaded(pid: u32, dll_path: &Path) -> Result<bool, String> {
    let snapshot =
        unsafe { CreateToolhelp32Snapshot(TH32CS_SNAPMODULE | TH32CS_SNAPMODULE32, pid) };
    if snapshot == INVALID_HANDLE_VALUE {
        return Err(format!(
            "Could not inspect modules in PID {pid}: {}",
            std::io::Error::last_os_error()
        ));
    }

    let expected = dll_path
        .canonicalize()
        .unwrap_or_else(|_| dll_path.to_path_buf())
        .to_string_lossy()
        .trim_start_matches(r"\\?\")
        .replace('/', "\\")
        .to_ascii_lowercase();
    let mut entry = MODULEENTRY32W {
        dwSize: std::mem::size_of::<MODULEENTRY32W>() as u32,
        ..unsafe { std::mem::zeroed() }
    };
    let mut found = false;
    let mut has_entry = unsafe { Module32FirstW(snapshot, &mut entry) } != 0;
    if !has_entry {
        unsafe { CloseHandle(snapshot) };
        return Err(format!("Could not inspect modules in PID {pid}."));
    }

    while has_entry {
        let end = entry
            .szExePath
            .iter()
            .position(|&unit| unit == 0)
            .unwrap_or(entry.szExePath.len());
        let loaded = String::from_utf16_lossy(&entry.szExePath[..end])
            .trim_start_matches(r"\\?\")
            .replace('/', "\\")
            .to_ascii_lowercase();
        if loaded == expected {
            found = true;
            break;
        }
        has_entry = unsafe { Module32NextW(snapshot, &mut entry) } != 0;
    }

    unsafe { CloseHandle(snapshot) };
    Ok(found)
}

#[cfg(not(target_os = "windows"))]
pub fn is_module_loaded(_pid: u32, _dll_path: &std::path::Path) -> Result<bool, String> {
    Ok(false)
}

#[cfg(target_os = "windows")]
fn build_hijack_stub(load_library: u64, dll_path: u64, return_address: u64) -> Vec<u8> {
    let mut code = vec![
        0x48, 0x83, 0xEC, 0x28, // sub rsp, 0x28
        0x48, 0x8B, 0x0D, 0x00, 0x00, 0x00, 0x00, // mov rcx, [rip+disp32]
        0x48, 0x8B, 0x05, 0x00, 0x00, 0x00, 0x00, // mov rax, [rip+disp32]
        0xFF, 0xD0, // call rax
        0x48, 0x83, 0xC4, 0x28, // add rsp, 0x28
        0x48, 0x8B, 0x05, 0x00, 0x00, 0x00, 0x00, // mov rax, [rip+disp32]
        0xFF, 0xE0, // jmp rax
    ];

    let data_offset = code.len();
    code.extend_from_slice(&dll_path.to_le_bytes());
    code.extend_from_slice(&load_library.to_le_bytes());
    code.extend_from_slice(&return_address.to_le_bytes());

    let dll_offset = data_offset;
    let load_offset = data_offset + 8;
    let ret_offset = data_offset + 16;

    let disp1 = (dll_offset as isize - 11) as i32;
    let disp2 = (load_offset as isize - 18) as i32;
    let disp3 = (ret_offset as isize - 31) as i32;

    code[7..11].copy_from_slice(&disp1.to_le_bytes());
    code[14..18].copy_from_slice(&disp2.to_le_bytes());
    code[27..31].copy_from_slice(&disp3.to_le_bytes());

    code
}

#[cfg(all(target_os = "windows", target_pointer_width = "64"))]
pub fn thread_hijack_inject(process: &OwnedProcess, dll_path: &Path) -> Result<(), String> {
    let pid = process
        .pid()
        .map_err(|e| format!("Failed to read process ID: {}", e))?
        .get();

    let thread_id = find_thread_id(pid)?;
    let thread_handle = unsafe {
        OpenThread(
            THREAD_SUSPEND_RESUME | THREAD_GET_CONTEXT | THREAD_SET_CONTEXT,
            0,
            thread_id,
        )
    };

    if thread_handle.is_null() {
        return Err("Failed to open target thread".to_string());
    }

    let suspend_result = unsafe { SuspendThread(thread_handle) };
    if suspend_result == u32::MAX {
        unsafe { CloseHandle(thread_handle) };
        return Err("Failed to suspend target thread".to_string());
    }

    let mut context: CONTEXT = unsafe { std::mem::zeroed() };
    context.ContextFlags = CONTEXT_CONTROL_AMD64;

    let got_context = unsafe { GetThreadContext(thread_handle, &mut context) } != 0;
    if !got_context {
        unsafe { ResumeThread(thread_handle) };
        unsafe { CloseHandle(thread_handle) };
        return Err("Failed to get thread context".to_string());
    }

    let dll_path_str = dll_path
        .to_str()
        .ok_or_else(|| "DLL path contains invalid characters".to_string())?;
    let dll_cstr =
        CString::new(dll_path_str).map_err(|_| "DLL path contains null bytes".to_string())?;

    let process_handle = process.as_raw_handle() as HANDLE;
    let remote_string = unsafe {
        VirtualAllocEx(
            process_handle,
            std::ptr::null_mut(),
            dll_cstr.as_bytes_with_nul().len(),
            MEM_COMMIT | MEM_RESERVE,
            PAGE_READWRITE,
        )
    };
    if remote_string.is_null() {
        unsafe { ResumeThread(thread_handle) };
        unsafe { CloseHandle(thread_handle) };
        return Err("Failed to allocate remote memory for DLL path".to_string());
    }

    let mut written = 0;
    let write_result = unsafe {
        WriteProcessMemory(
            process_handle,
            remote_string,
            dll_cstr.as_ptr() as *const c_void,
            dll_cstr.as_bytes_with_nul().len(),
            &mut written,
        )
    };

    if write_result == 0 {
        unsafe { ResumeThread(thread_handle) };
        unsafe { CloseHandle(thread_handle) };
        return Err("Failed to write DLL path into remote memory".to_string());
    }

    let local_kernel32 = unsafe { GetModuleHandleA(c"kernel32.dll".as_ptr().cast()) };
    if local_kernel32.is_null() {
        unsafe { ResumeThread(thread_handle) };
        unsafe { CloseHandle(thread_handle) };
        return Err("Failed to get local kernel32 handle".to_string());
    }

    let local_load_library =
        unsafe { GetProcAddress(local_kernel32, c"LoadLibraryA".as_ptr().cast()) }
            .ok_or_else(|| "Failed to get local LoadLibraryA address".to_string())?;

    let local_load_library_ptr = local_load_library as *const c_void;
    let local_kernel32_ptr = local_kernel32 as *const c_void;
    let local_load_library_addr = local_load_library_ptr as usize;
    let local_kernel32_addr = local_kernel32_ptr as usize;

    let remote_kernel32 = get_remote_module_base(pid, "kernel32.dll")?;
    let load_library_remote =
        remote_kernel32 + (local_load_library_addr - local_kernel32_addr) as u64;

    let stub = build_hijack_stub(load_library_remote, remote_string as u64, context.Rip);

    let remote_stub = unsafe {
        VirtualAllocEx(
            process_handle,
            std::ptr::null_mut(),
            stub.len(),
            MEM_COMMIT | MEM_RESERVE,
            PAGE_EXECUTE_READWRITE,
        )
    };

    if remote_stub.is_null() {
        unsafe { ResumeThread(thread_handle) };
        unsafe { CloseHandle(thread_handle) };
        return Err("Failed to allocate remote memory for hijack stub".to_string());
    }

    let mut stub_written = 0;
    let stub_result = unsafe {
        WriteProcessMemory(
            process_handle,
            remote_stub,
            stub.as_ptr() as *const c_void,
            stub.len(),
            &mut stub_written,
        )
    };

    if stub_result == 0 {
        unsafe { ResumeThread(thread_handle) };
        unsafe { CloseHandle(thread_handle) };
        return Err("Failed to write hijack stub into remote memory".to_string());
    }

    context.Rip = remote_stub as u64;

    let set_result = unsafe { SetThreadContext(thread_handle, &context) } != 0;
    if !set_result {
        unsafe { ResumeThread(thread_handle) };
        unsafe { CloseHandle(thread_handle) };
        return Err("Failed to set thread context".to_string());
    }

    unsafe { ResumeThread(thread_handle) };
    unsafe { CloseHandle(thread_handle) };

    Ok(())
}

#[cfg(all(target_os = "windows", target_pointer_width = "32"))]
pub fn thread_hijack_inject(_process: &OwnedProcess, _dll_path: &Path) -> Result<(), String> {
    Err("Thread hijacking requires a 64-bit build".to_string())
}

#[cfg(not(target_os = "windows"))]
pub fn thread_hijack_inject(_process: &u32, _dll_path: &Path) -> Result<(), String> {
    Err("Thread hijacking is only supported on Windows".to_string())
}
