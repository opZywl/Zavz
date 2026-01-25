use std::path::{Path, PathBuf};
use std::fs;
use dll_syringe::{process::OwnedProcess, Syringe};
use sysinfo::System;

#[cfg(target_os = "windows")]
use {
    std::ptr,
    winapi::um::wow64apiset::IsWow64Process,
    winapi::shared::minwindef::FALSE,
};

/// Validates DLL architecture against target process
#[cfg(target_os = "windows")]
pub fn validate_dll_architecture(dll_path: &Path, process: &OwnedProcess) -> Result<(), String> {
    // Check if DLL is 32-bit or 64-bit
    let dll_is_64bit = is_pe_64bit(dll_path)?;

    // Check if process is 32-bit or 64-bit
    let process_is_64bit = is_process_64bit(process)?;

    if dll_is_64bit != process_is_64bit {
        return Err(format!(
            "Incompatibilidade de arquitetura: DLL é {}-bit mas o processo é {}-bit",
            if dll_is_64bit { 64 } else { 32 },
            if process_is_64bit { 64 } else { 32 }
        ));
    }

    Ok(())
}

/// Check if a PE file (DLL/EXE) is 64-bit
#[cfg(target_os = "windows")]
fn is_pe_64bit(path: &Path) -> Result<bool, String> {
    use std::io::{Read, Seek, SeekFrom};

    let mut file = fs::File::open(path)
        .map_err(|e| format!("Erro ao abrir DLL: {}", e))?;

    // Read DOS header
    let mut dos_header = [0u8; 64];
    file.read_exact(&mut dos_header)
        .map_err(|e| format!("Erro ao ler DOS header: {}", e))?;

    // Check MZ signature
    if &dos_header[0..2] != b"MZ" {
        return Err("Arquivo não é um PE válido".to_string());
    }

    // Get PE header offset (at position 0x3C)
    let pe_offset = u32::from_le_bytes([
        dos_header[0x3C],
        dos_header[0x3D],
        dos_header[0x3E],
        dos_header[0x3F],
    ]);

    // Seek to PE header
    file.seek(SeekFrom::Start(pe_offset as u64))
        .map_err(|e| format!("Erro ao buscar PE header: {}", e))?;

    // Read PE signature and machine type
    let mut pe_header = [0u8; 6];
    file.read_exact(&mut pe_header)
        .map_err(|e| format!("Erro ao ler PE header: {}", e))?;

    // Check PE signature
    if &pe_header[0..4] != b"PE\0\0" {
        return Err("Assinatura PE inválida".to_string());
    }

    // Machine type at offset 4-5
    let machine = u16::from_le_bytes([pe_header[4], pe_header[5]]);

    // 0x8664 = AMD64, 0x014c = I386
    Ok(machine == 0x8664)
}

/// Check if a process is 64-bit
#[cfg(target_os = "windows")]
fn is_process_64bit(process: &OwnedProcess) -> Result<bool, String> {
    use std::os::windows::io::AsRawHandle;

    let handle = process.as_handle().as_raw_handle() as *mut _;
    let mut is_wow64 = FALSE;

    unsafe {
        if IsWow64Process(handle, &mut is_wow64) == 0 {
            return Err("Falha ao verificar arquitetura do processo".to_string());
        }
    }

    // If running on 64-bit Windows:
    // - 64-bit process: IsWow64 = FALSE
    // - 32-bit process: IsWow64 = TRUE
    #[cfg(target_pointer_width = "64")]
    return Ok(is_wow64 == FALSE);

    // If running on 32-bit Windows, all processes are 32-bit
    #[cfg(target_pointer_width = "32")]
    return Ok(false);
}

/// Sets file access control for UWP compatibility
/// Based on UWPDumper by Wunkolo
#[cfg(target_os = "windows")]
pub fn set_access_control(file_path: &Path, sid_string: &str) -> Result<(), String> {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use windows_sys::Win32::Foundation::{ERROR_SUCCESS, GENERIC_READ, GENERIC_EXECUTE};
    use windows_sys::Win32::Security::{
        ACL, PSID, DACL_SECURITY_INFORMATION, SE_FILE_OBJECT,
    };
    use windows_sys::Win32::Security::Authorization::{
        ConvertStringSidToSidW, GetNamedSecurityInfoW, SetNamedSecurityInfoW,
        SetEntriesInAclW, EXPLICIT_ACCESS_W, TRUSTEE_W, SET_ACCESS,
        SUB_CONTAINERS_AND_OBJECTS_INHERIT, TRUSTEE_IS_SID, TRUSTEE_IS_WELL_KNOWN_GROUP,
    };
    use windows_sys::Win32::System::Memory::LocalFree;

    let wide_path: Vec<u16> = OsStr::new(file_path.to_str().unwrap())
        .encode_wide()
        .chain(Some(0))
        .collect();

    let wide_sid: Vec<u16> = OsStr::new(sid_string)
        .encode_wide()
        .chain(Some(0))
        .collect();

    unsafe {
        let mut sd: *mut std::ffi::c_void = ptr::null_mut();
        let mut current_acl: *mut ACL = ptr::null_mut();

        // Get current security info
        let result = GetNamedSecurityInfoW(
            wide_path.as_ptr(),
            SE_FILE_OBJECT,
            DACL_SECURITY_INFORMATION,
            ptr::null_mut(),
            ptr::null_mut(),
            &mut current_acl,
            ptr::null_mut(),
            &mut sd,
        );

        if result != ERROR_SUCCESS {
            return Err(format!("GetNamedSecurityInfoW falhou: {}", result));
        }

        let mut sid: PSID = ptr::null_mut();
        if ConvertStringSidToSidW(wide_sid.as_ptr(), &mut sid) == 0 {
            if !sd.is_null() {
                LocalFree(sd);
            }
            return Err("ConvertStringSidToSidW falhou".to_string());
        }

        if sid.is_null() {
            if !sd.is_null() {
                LocalFree(sd);
            }
            return Err("SID conversion returned null".to_string());
        }

        let mut ea = EXPLICIT_ACCESS_W {
            grfAccessPermissions: GENERIC_READ | GENERIC_EXECUTE,
            grfAccessMode: SET_ACCESS,
            grfInheritance: SUB_CONTAINERS_AND_OBJECTS_INHERIT,
            Trustee: TRUSTEE_W {
                pMultipleTrustee: ptr::null_mut(),
                MultipleTrusteeOperation: 0,
                TrusteeForm: TRUSTEE_IS_SID,
                TrusteeType: TRUSTEE_IS_WELL_KNOWN_GROUP,
                ptstrName: sid as *mut u16,
            },
        };

        let mut new_acl: *mut ACL = ptr::null_mut();
        let result = SetEntriesInAclW(1, &mut ea, current_acl, &mut new_acl);

        if result == ERROR_SUCCESS {
            let _ = SetNamedSecurityInfoW(
                wide_path.as_ptr() as *mut u16,
                SE_FILE_OBJECT,
                DACL_SECURITY_INFORMATION,
                ptr::null_mut(),
                ptr::null_mut(),
                new_acl as *const ACL,
                ptr::null_mut(),
            );

            if !new_acl.is_null() {
                LocalFree(new_acl as *mut std::ffi::c_void);
            }
        }

        if !sd.is_null() {
            LocalFree(sd);
        }
        LocalFree(sid as *mut std::ffi::c_void);
    }

    Ok(())
}

#[cfg(not(target_os = "windows"))]
pub fn set_access_control(_file_path: &Path, _sid_string: &str) -> Result<(), String> {
    // No-op on non-Windows platforms
    Ok(())
}

#[cfg(not(target_os = "windows"))]
pub fn validate_dll_architecture(_dll_path: &Path, _process: &OwnedProcess) -> Result<(), String> {
    // No-op on non-Windows platforms
    Ok(())
}

/// Find process by name
pub fn find_process_by_name(target: &str) -> Result<OwnedProcess, String> {
    let mut system = System::new_all();
    system.refresh_processes();

    let process = system
        .processes_by_name(target)
        .next()
        .ok_or_else(|| format!("Processo '{}' não encontrado", target))?;

    OwnedProcess::from_pid(process.pid().as_u32())
        .map_err(|err| format!("Falha ao abrir processo: {}", err))
}

/// Perform DLL injection
pub fn inject_dll(
    process: OwnedProcess,
    dll_path: &PathBuf,
    _use_manual_map: bool,
) -> Result<(), String> {
    // Validate architecture
    #[cfg(target_os = "windows")]
    validate_dll_architecture(dll_path, &process)?;

    // Set access control for UWP compatibility
    #[cfg(target_os = "windows")]
    {
        let _ = set_access_control(dll_path, "S-1-15-2-1");
    }

    let syringe = Syringe::for_process(process);

    // Note: Manual Map is not currently supported by dll-syringe 0.17+
    // Always using standard LoadLibrary injection
    syringe
        .inject(dll_path)
        .map(|_| ())
        .map_err(|err| format!("Erro ao injetar DLL: {}", err))
}

/// FDP Client Loader - Copy JAR to .fdpclient folder
pub fn setup_fdp_jar(jar_path: &Path) -> Result<PathBuf, String> {
    // Get user home directory
    let home = dirs::home_dir()
        .ok_or_else(|| "Não foi possível obter diretório home".to_string())?;

    let fdp_dir = home.join(".fdpclient");

    // Create .fdpclient directory if it doesn't exist
    fs::create_dir_all(&fdp_dir)
        .map_err(|e| format!("Erro ao criar pasta .fdpclient: {}", e))?;

    // Get JAR filename
    let jar_filename = jar_path
        .file_name()
        .ok_or_else(|| "Nome de arquivo JAR inválido".to_string())?;

    let dest_path = fdp_dir.join(jar_filename);

    // Check if source and destination are the same
    if jar_path.canonicalize().ok() == dest_path.canonicalize().ok() {
        return Ok(dest_path);
    }

    // Copy JAR to .fdpclient
    fs::copy(jar_path, &dest_path)
        .map_err(|e| format!("Erro ao copiar JAR: {}", e))?;

    Ok(dest_path)
}
