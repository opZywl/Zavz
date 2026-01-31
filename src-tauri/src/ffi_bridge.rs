// FFI Bridge between Rust and C++
// This module provides C-compatible exports for the injection functions
// allowing the legacy C++ code to call into the Rust backend if needed

use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use std::path::PathBuf;

use crate::injector;
use dll_syringe::process::Process;

/// C-compatible version of find_process_by_name
/// Returns process ID or 0 if not found
#[no_mangle]
pub extern "C" fn rust_get_proc_id(proc_name: *const c_char) -> u32 {
    if proc_name.is_null() {
        return 0;
    }

    unsafe {
        let c_str = CStr::from_ptr(proc_name);
        let process_name = match c_str.to_str() {
            Ok(s) => s,
            Err(_) => return 0,
        };

        match injector::find_process_by_name(process_name) {
            Ok(process) => process.pid(),
            Err(_) => 0,
        }
    }
}

/// C-compatible version of inject_dll
/// Returns 0 on success, 1 on failure
#[no_mangle]
pub extern "C" fn rust_perform_injection(
    proc_name: *const c_char,
    dll_path: *const c_char,
    use_manual_map: bool,
) -> i32 {
    if proc_name.is_null() || dll_path.is_null() {
        return 1;
    }

    unsafe {
        let process_name = match CStr::from_ptr(proc_name).to_str() {
            Ok(s) => s,
            Err(_) => return 1,
        };

        let dll_path_str = match CStr::from_ptr(dll_path).to_str() {
            Ok(s) => s,
            Err(_) => return 1,
        };

        let dll_path_buf = PathBuf::from(dll_path_str);

        let process = match injector::find_process_by_name(process_name) {
            Ok(p) => p,
            Err(_) => return 1,
        };

        match injector::inject_dll(process, &dll_path_buf, use_manual_map) {
            Ok(_) => 0,
            Err(_) => 1,
        }
    }
}

/// C-compatible version to get last error message
/// Caller must free the returned string
#[no_mangle]
pub extern "C" fn rust_get_last_error() -> *mut c_char {
    // For simplicity, return a static error message
    // In a real implementation, you'd store the last error in thread-local storage
    let error_msg = CString::new("Check logs for error details").unwrap();
    error_msg.into_raw()
}

/// Free a string allocated by Rust
#[no_mangle]
pub extern "C" fn rust_free_string(s: *mut c_char) {
    if !s.is_null() {
        unsafe {
            let _ = CString::from_raw(s);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::ffi::CString;

    #[test]
    fn test_get_proc_id_null() {
        let result = rust_get_proc_id(std::ptr::null());
        assert_eq!(result, 0);
    }

    #[test]
    fn test_free_string() {
        let s = CString::new("test").unwrap();
        let ptr = s.into_raw();
        rust_free_string(ptr);
        // Should not crash
    }
}
