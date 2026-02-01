// Manual Map DLL Injection Implementation
// This module implements stealth DLL injection by manually mapping the DLL into memory
// without using LoadLibrary, making it harder to detect by anti-cheat systems

#[cfg(target_os = "windows")]
use dll_syringe::process::{OwnedProcess, Process};
#[cfg(target_os = "windows")]
use std::ffi::{c_void, CStr, CString};
#[cfg(target_os = "windows")]
use std::ffi::{c_void, CStr, CString};
#[cfg(target_os = "windows")]
use std::fs::File;
#[cfg(target_os = "windows")]
use std::io::Read;
#[cfg(target_os = "windows")]
use std::os::windows::io::AsRawHandle;
use std::path::Path;

#[cfg(target_os = "windows")]
use windows_sys::Win32::Foundation::{CloseHandle, HANDLE, INVALID_HANDLE_VALUE};
#[cfg(target_os = "windows")]
use windows_sys::Win32::System::Diagnostics::Debug::{ReadProcessMemory, WriteProcessMemory};
#[cfg(target_os = "windows")]
use windows_sys::Win32::System::Diagnostics::ToolHelp::{
    CreateToolhelp32Snapshot, Module32FirstW, Module32NextW, MODULEENTRY32W, TH32CS_SNAPMODULE,
    TH32CS_SNAPMODULE32,
};
#[cfg(target_os = "windows")]
use windows_sys::Win32::System::LibraryLoader::{GetModuleHandleA, GetProcAddress, LoadLibraryA};
#[cfg(target_os = "windows")]
use windows_sys::Win32::System::Memory::{
    VirtualAllocEx, VirtualFreeEx, MEM_COMMIT, MEM_RELEASE, MEM_RESERVE, PAGE_EXECUTE_READWRITE,
    PAGE_READWRITE,
};
#[cfg(target_os = "windows")]
use windows_sys::Win32::System::Threading::{
    CreateRemoteThread, WaitForSingleObject, INFINITE,
};

// PE Header structures
#[repr(C)]
struct ImageDosHeader {
    e_magic: u16,
    _e_cblp: u16,
    _e_cp: u16,
    _e_crlc: u16,
    _e_cparhdr: u16,
    _e_minalloc: u16,
    _e_maxalloc: u16,
    _e_ss: u16,
    _e_sp: u16,
    _e_csum: u16,
    _e_ip: u16,
    _e_cs: u16,
    _e_lfarlc: u16,
    _e_ovno: u16,
    _e_res: [u16; 4],
    _e_oemid: u16,
    _e_oeminfo: u16,
    _e_res2: [u16; 10],
    e_lfanew: i32,
}

#[repr(C)]
struct ImageNtHeaders64 {
    signature: u32,
    file_header: ImageFileHeader,
    optional_header: ImageOptionalHeader64,
}

#[repr(C)]
struct ImageFileHeader {
    machine: u16,
    number_of_sections: u16,
    _time_date_stamp: u32,
    _pointer_to_symbol_table: u32,
    _number_of_symbols: u32,
    size_of_optional_header: u16,
    _characteristics: u16,
}

#[repr(C)]
#[derive(Clone, Copy)]
struct ImageDataDirectory {
    virtual_address: u32,
    size: u32,
}

#[repr(C)]
struct ImageOptionalHeader64 {
    magic: u16,
    _major_linker_version: u8,
    _minor_linker_version: u8,
    _size_of_code: u32,
    _size_of_initialized_data: u32,
    _size_of_uninitialized_data: u32,
    address_of_entry_point: u32,
    _base_of_code: u32,
    image_base: u64,
    _section_alignment: u32,
    _file_alignment: u32,
    _major_operating_system_version: u16,
    _minor_operating_system_version: u16,
    _major_image_version: u16,
    _minor_image_version: u16,
    _major_subsystem_version: u16,
    _minor_subsystem_version: u16,
    _win32_version_value: u32,
    size_of_image: u32,
    size_of_headers: u32,
    _check_sum: u32,
    _subsystem: u16,
    _dll_characteristics: u16,
    _size_of_stack_reserve: u64,
    _size_of_stack_commit: u64,
    _size_of_heap_reserve: u64,
    _size_of_heap_commit: u64,
    _loader_flags: u32,
    number_of_rva_and_sizes: u32,
    data_directory: [ImageDataDirectory; 16],
}

#[repr(C)]
struct ImageSectionHeader {
    name: [u8; 8],
    virtual_size: u32,
    virtual_address: u32,
    size_of_raw_data: u32,
    pointer_to_raw_data: u32,
    _pointer_to_relocations: u32,
    _pointer_to_linenumbers: u32,
    _number_of_relocations: u16,
    _number_of_linenumbers: u16,
    _characteristics: u32,
}

#[repr(C)]
struct ImageImportDescriptor {
    original_first_thunk: u32,
    time_date_stamp: u32,
    forwarder_chain: u32,
    name: u32,
    first_thunk: u32,
}

#[repr(C)]
struct ImageBaseRelocation {
    virtual_address: u32,
    size_of_block: u32,
}

const IMAGE_DOS_SIGNATURE: u16 = 0x5A4D;
const IMAGE_NT_SIGNATURE: u32 = 0x00004550;
const IMAGE_NT_OPTIONAL_HDR64_MAGIC: u16 = 0x20B;
const IMAGE_DIRECTORY_ENTRY_IMPORT: usize = 1;
const IMAGE_DIRECTORY_ENTRY_BASERELOC: usize = 5;
const IMAGE_ORDINAL_FLAG64: u64 = 0x8000_0000_0000_0000;
const IMAGE_REL_BASED_DIR64: u16 = 10;

#[cfg(target_os = "windows")]
fn get_nt_headers(dll_data: &[u8]) -> Result<(usize, &ImageNtHeaders64), String> {
    if dll_data.len() < std::mem::size_of::<ImageDosHeader>() {
        return Err("Invalid DLL file: too small".to_string());
    }

    let dos_header = unsafe { &*(dll_data.as_ptr() as *const ImageDosHeader) };
    if dos_header.e_magic != IMAGE_DOS_SIGNATURE {
        return Err("Invalid DLL file: not a valid PE file (bad DOS signature)".to_string());
    }

    let nt_headers_offset = dos_header.e_lfanew as usize;
    if nt_headers_offset + std::mem::size_of::<ImageNtHeaders64>() > dll_data.len() {
        return Err("Invalid DLL file: NT headers out of bounds".to_string());
    }

    let nt_headers = unsafe {
        &*(dll_data.as_ptr().add(nt_headers_offset) as *const ImageNtHeaders64)
    };

    if nt_headers.signature != IMAGE_NT_SIGNATURE {
        return Err("Invalid DLL file: bad NT signature".to_string());
    }

    if nt_headers.optional_header.magic != IMAGE_NT_OPTIONAL_HDR64_MAGIC {
        return Err("Only 64-bit DLLs are supported for Manual Map".to_string());
    }

    Ok((nt_headers_offset, nt_headers))
}

#[cfg(target_os = "windows")]
fn get_section_headers<'a>(
    dll_data: &'a [u8],
    nt_headers_offset: usize,
    nt_headers: &ImageNtHeaders64,
) -> Result<&'a [ImageSectionHeader], String> {
    let section_headers_offset = nt_headers_offset
        + 4
        + std::mem::size_of::<ImageFileHeader>()
        + nt_headers.file_header.size_of_optional_header as usize;

    let sections_size = std::mem::size_of::<ImageSectionHeader>()
        * nt_headers.file_header.number_of_sections as usize;

    if section_headers_offset + sections_size > dll_data.len() {
        return Err("Invalid DLL file: section headers out of bounds".to_string());
    }

    let sections = unsafe {
        std::slice::from_raw_parts(
            dll_data.as_ptr().add(section_headers_offset) as *const ImageSectionHeader,
            nt_headers.file_header.number_of_sections as usize,
        )
    };

    Ok(sections)
}

#[cfg(target_os = "windows")]
fn rva_to_offset(rva: u32, sections: &[ImageSectionHeader]) -> Option<usize> {
    for section in sections {
        let start = section.virtual_address;
        let end = start.saturating_add(section.virtual_size.max(section.size_of_raw_data));
        if rva >= start && rva < end {
            return Some(section.pointer_to_raw_data as usize + (rva - start) as usize);
        }
    }
    None
}

#[cfg(target_os = "windows")]
fn write_remote_memory(
    process: HANDLE,
    remote: *mut c_void,
    data: &[u8],
) -> Result<(), String> {
    let mut written = 0;
    let result = unsafe {
        WriteProcessMemory(
            process,
            remote,
            data.as_ptr() as *const c_void,
            data.len(),
            &mut written,
        )
    };

    if result == 0 || written != data.len() {
        return Err("Failed to write to remote process memory".to_string());
    }

    Ok(())
}

#[cfg(target_os = "windows")]
fn read_remote_u64(process: HANDLE, remote: *const c_void) -> Result<u64, String> {
    let mut buffer = [0u8; 8];
    let mut read = 0;
    let result = unsafe {
        ReadProcessMemory(
            process,
            remote,
            buffer.as_mut_ptr() as *mut c_void,
            buffer.len(),
            &mut read,
        )
    };

    if result == 0 || read != buffer.len() {
        return Err("Failed to read from remote process memory".to_string());
    }

    Ok(u64::from_le_bytes(buffer))
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
fn ensure_remote_module_loaded(
    process: HANDLE,
    pid: u32,
    module_name: &str,
) -> Result<u64, String> {
    if let Ok(base) = get_remote_module_base(pid, module_name) {
        return Ok(base);
    }

    let module_cstr = CString::new(module_name).map_err(|_| "Invalid module name".to_string())?;
    let remote_string = unsafe {
        VirtualAllocEx(
            process,
            std::ptr::null(),
            module_cstr.as_bytes_with_nul().len(),
            MEM_COMMIT | MEM_RESERVE,
            PAGE_READWRITE,
        )
    };
    if remote_string.is_null() {
        return Err("Failed to allocate remote memory for module name".to_string());
    }

    write_remote_memory(
        process,
        remote_string,
        module_cstr.as_bytes_with_nul(),
    )?;

    let kernel32_local = unsafe { GetModuleHandleA(b"kernel32.dll\0".as_ptr()) };
    if kernel32_local == std::ptr::null_mut() {
        return Err("Failed to get local kernel32 handle".to_string());
    }

    let load_library_local =
        unsafe { GetProcAddress(kernel32_local, b"LoadLibraryA\0".as_ptr()) }
            .ok_or_else(|| "Failed to get local LoadLibraryA address".to_string())?;

    let load_library_local_ptr =
        unsafe { std::mem::transmute::<_, *const c_void>(load_library_local) };

    let kernel32_local_ptr = kernel32_local as *const c_void;

    let load_library_local_addr = load_library_local_ptr as usize;
    let kernel32_local_addr = kernel32_local_ptr as usize;

    let kernel32_remote = get_remote_module_base(pid, "kernel32.dll")?;
    let load_library_remote = kernel32_remote
        + (load_library_local_addr - kernel32_local_addr) as u64;

    let thread = unsafe {
        CreateRemoteThread(
            process,
            std::ptr::null(),
            0,
            Some(std::mem::transmute(load_library_remote)),
            remote_string,
            0,
            std::ptr::null_mut(),
        )
    };

    if thread == std::ptr::null_mut() {
        unsafe { VirtualFreeEx(process, remote_string, 0, MEM_RELEASE) };
        return Err("Failed to create remote thread for LoadLibraryA".to_string());
    }

    unsafe { WaitForSingleObject(thread, INFINITE) };
    unsafe { CloseHandle(thread) };
    unsafe { VirtualFreeEx(process, remote_string, 0, MEM_RELEASE) };

    get_remote_module_base(pid, module_name)
}

#[cfg(target_os = "windows")]
fn resolve_imports(
    process: HANDLE,
    pid: u32,
    dll_data: &[u8],
    nt_headers: &ImageNtHeaders64,
    sections: &[ImageSectionHeader],
    remote_base: u64,
) -> Result<(), String> {
    let import_dir = nt_headers.optional_header.data_directory[IMAGE_DIRECTORY_ENTRY_IMPORT];
    if import_dir.virtual_address == 0 || import_dir.size == 0 {
        return Ok(());
    }

    let mut descriptor_offset = rva_to_offset(import_dir.virtual_address, sections)
        .ok_or_else(|| "Invalid import directory RVA".to_string())?;

    loop {
        if descriptor_offset + std::mem::size_of::<ImageImportDescriptor>() > dll_data.len() {
            return Err("Import descriptor out of bounds".to_string());
        }

        let descriptor = unsafe {
            &*(dll_data.as_ptr().add(descriptor_offset) as *const ImageImportDescriptor)
        };

        if descriptor.name == 0 {
            break;
        }

        let name_offset = rva_to_offset(descriptor.name, sections)
            .ok_or_else(|| "Invalid import module name RVA".to_string())?;
        let module_name = read_c_string(&dll_data[name_offset..])?;

        let remote_module_base = ensure_remote_module_loaded(process, pid, &module_name)?;

        let module_cstr =
            CString::new(module_name.clone()).map_err(|_| "Invalid import module name".to_string())?;
        let local_module = unsafe { LoadLibraryA(module_cstr.as_ptr() as *const u8) };
        if local_module == std::ptr::null_mut() {
            return Err(format!("Failed to load module locally: {}", module_name));
        }

        let mut thunk_rva = if descriptor.original_first_thunk != 0 {
            descriptor.original_first_thunk
        } else {
            descriptor.first_thunk
        };
        let mut iat_rva = descriptor.first_thunk;
        let mut index = 0;

        loop {
            let thunk_offset = rva_to_offset(thunk_rva, sections)
                .ok_or_else(|| "Invalid thunk RVA".to_string())?;
            if thunk_offset + 8 > dll_data.len() {
                return Err("Import thunk out of bounds".to_string());
            }

            let thunk_value = u64::from_le_bytes(
                dll_data[thunk_offset..thunk_offset + 8]
                    .try_into()
                    .unwrap(),
            );

            if thunk_value == 0 {
                break;
            }

            let function_address = if (thunk_value & IMAGE_ORDINAL_FLAG64) != 0 {
                let ordinal = (thunk_value & 0xFFFF) as u16;
                unsafe { GetProcAddress(local_module, ordinal as usize as *const u8) }
            } else {
                let name_rva = thunk_value as u32;
                let name_offset = rva_to_offset(name_rva, sections)
                    .ok_or_else(|| "Invalid import name RVA".to_string())?;
                if name_offset + 2 >= dll_data.len() {
                    return Err("Import name out of bounds".to_string());
                }
                let name = read_c_string(&dll_data[name_offset + 2..])?;
                let name_cstr =
                    CString::new(name).map_err(|_| "Invalid import name".to_string())?;
                unsafe { GetProcAddress(local_module, name_cstr.as_ptr() as *const u8) }
            };

            let function_address = function_address
                .ok_or_else(|| format!("Failed to resolve import in {}", module_name))?;

            let function_address_ptr =
                unsafe { std::mem::transmute::<_, *const c_void>(function_address) };
            let local_module_ptr = local_module as *const c_void;
            let local_rva = function_address_ptr as usize - local_module_ptr as usize;
            let remote_address = remote_module_base + local_rva as u64;

            let iat_address = remote_base + iat_rva as u64 + (index * 8) as u64;
            let remote_bytes = remote_address.to_le_bytes();
            write_remote_memory(process, iat_address as *mut c_void, &remote_bytes)?;

            index += 1;
            thunk_rva += 8;
            iat_rva += 8;
        }

        descriptor_offset += std::mem::size_of::<ImageImportDescriptor>();
    }

    Ok(())
}

#[cfg(target_os = "windows")]
fn read_c_string(data: &[u8]) -> Result<String, String> {
    let end = data
        .iter()
        .position(|&c| c == 0)
        .ok_or_else(|| "String terminator not found".to_string())?;
    let slice = &data[..end];
    let owned = [slice, &[0]].concat();
    let cstr = CStr::from_bytes_with_nul(&owned)
        .map_err(|_| "Invalid C string".to_string())?;
    cstr.to_str()
        .map(|s| s.to_string())
        .map_err(|_| "Invalid UTF-8 string".to_string())
}

#[cfg(target_os = "windows")]
fn apply_relocations(
    process: HANDLE,
    dll_data: &[u8],
    nt_headers: &ImageNtHeaders64,
    sections: &[ImageSectionHeader],
    remote_base: u64,
) -> Result<(), String> {
    let delta = remote_base as i64 - nt_headers.optional_header.image_base as i64;
    if delta == 0 {
        return Ok(());
    }

    let reloc_dir = nt_headers.optional_header.data_directory[IMAGE_DIRECTORY_ENTRY_BASERELOC];
    if reloc_dir.virtual_address == 0 || reloc_dir.size == 0 {
        return Ok(());
    }

    let mut offset = rva_to_offset(reloc_dir.virtual_address, sections)
        .ok_or_else(|| "Invalid relocation directory RVA".to_string())?;
    let end = offset + reloc_dir.size as usize;

    while offset + std::mem::size_of::<ImageBaseRelocation>() <= end {
        let block = unsafe {
            &*(dll_data.as_ptr().add(offset) as *const ImageBaseRelocation)
        };

        if block.size_of_block == 0 {
            break;
        }

        let entries = (block.size_of_block as usize - std::mem::size_of::<ImageBaseRelocation>()) / 2;
        let entries_offset = offset + std::mem::size_of::<ImageBaseRelocation>();

        for i in 0..entries {
            let entry_offset = entries_offset + i * 2;
            if entry_offset + 2 > dll_data.len() {
                return Err("Relocation entry out of bounds".to_string());
            }
            let entry = u16::from_le_bytes([
                dll_data[entry_offset],
                dll_data[entry_offset + 1],
            ]);
            let entry_type = entry >> 12;
            let entry_offset = entry & 0x0FFF;

            if entry_type == IMAGE_REL_BASED_DIR64 {
                let patch_address = remote_base
                    + block.virtual_address as u64
                    + entry_offset as u64;
                let original = read_remote_u64(process, patch_address as *const c_void)?;
                let patched = (original as i64 + delta) as u64;
                write_remote_memory(process, patch_address as *mut c_void, &patched.to_le_bytes())?;
            }
        }

        offset += block.size_of_block as usize;
    }

    Ok(())
}

#[cfg(target_os = "windows")]
fn call_dll_main(process: HANDLE, remote_base: u64, entry_point_rva: u32) -> Result<(), String> {
    let entry_point = remote_base + entry_point_rva as u64;

    let stub = build_dllmain_stub(remote_base, entry_point)?;
    let remote_stub = unsafe {
        VirtualAllocEx(
            process,
            std::ptr::null(),
            stub.len(),
            MEM_COMMIT | MEM_RESERVE,
            PAGE_EXECUTE_READWRITE,
        )
    };
    if remote_stub.is_null() {
        return Err("Failed to allocate memory for DllMain stub".to_string());
    }

    write_remote_memory(process, remote_stub, &stub)?;

    let thread = unsafe {
        CreateRemoteThread(
            process,
            std::ptr::null(),
            0,
            Some(std::mem::transmute(remote_stub)),
            std::ptr::null_mut(),
            0,
            std::ptr::null_mut(),
        )
    };

    if thread == std::ptr::null_mut() {
        unsafe { VirtualFreeEx(process, remote_stub, 0, MEM_RELEASE) };
        return Err("Failed to create remote thread for DllMain".to_string());
    }

    unsafe { WaitForSingleObject(thread, INFINITE) };
    unsafe { CloseHandle(thread) };

    Ok(())
}

#[cfg(target_os = "windows")]
fn build_dllmain_stub(remote_base: u64, entry_point: u64) -> Result<Vec<u8>, String> {
    // x64 stub: call DllMain(remote_base, DLL_PROCESS_ATTACH, null); return
    let mut code = vec![
        0x48, 0x83, 0xEC, 0x28, // sub rsp, 0x28
        0x48, 0xB9, // mov rcx, imm64
    ];
    code.extend_from_slice(&remote_base.to_le_bytes());
    code.extend_from_slice(&[0xBA, 0x01, 0x00, 0x00, 0x00]); // mov edx, 1
    code.extend_from_slice(&[0x49, 0x31, 0xC0]); // xor r8, r8
    code.extend_from_slice(&[0x48, 0xB8]); // mov rax, imm64
    code.extend_from_slice(&entry_point.to_le_bytes());
    code.extend_from_slice(&[0xFF, 0xD0]); // call rax
    code.extend_from_slice(&[0x48, 0x83, 0xC4, 0x28]); // add rsp, 0x28
    code.extend_from_slice(&[0xC3]); // ret
    Ok(code)
}

/// Performs manual map injection of a DLL into a target process
/// This is a more advanced injection technique that bypasses LoadLibrary
#[cfg(target_os = "windows")]
pub fn manual_map_inject(process: &OwnedProcess, dll_path: &Path) -> Result<(), String> {
    // Read DLL file into memory
    let mut file = File::open(dll_path)
        .map_err(|e| format!("Failed to open DLL file: {}", e))?;

    let mut dll_data = Vec::new();
    file.read_to_end(&mut dll_data)
        .map_err(|e| format!("Failed to read DLL file: {}", e))?;

    let (nt_headers_offset, nt_headers) = get_nt_headers(&dll_data)?;
    let sections = get_section_headers(&dll_data, nt_headers_offset, nt_headers)?;

    let image_size = nt_headers.optional_header.size_of_image as usize;
    let size_of_headers = nt_headers.optional_header.size_of_headers as usize;

    if size_of_headers > dll_data.len() {
        return Err("Invalid DLL file: headers out of bounds".to_string());
    }

    let process_handle = process.as_raw_handle() as HANDLE;

    let preferred_base = nt_headers.optional_header.image_base as *mut c_void;
    let mut remote_base = unsafe {
        VirtualAllocEx(
            process_handle,
            preferred_base,
            image_size,
            MEM_COMMIT | MEM_RESERVE,
            PAGE_EXECUTE_READWRITE,
        )
    };

    if remote_base.is_null() {
        remote_base = unsafe {
            VirtualAllocEx(
                process_handle,
                std::ptr::null(),
                image_size,
                MEM_COMMIT | MEM_RESERVE,
                PAGE_EXECUTE_READWRITE,
            )
        };
    }

    if remote_base.is_null() {
        return Err("Failed to allocate memory in target process".to_string());
    }

    let remote_base_u64 = remote_base as u64;

    let result = (|| {
        write_remote_memory(
            process_handle,
            remote_base,
            &dll_data[..size_of_headers],
        )?;

        for section in sections {
            if section.size_of_raw_data == 0 {
                continue;
            }
            let data_offset = section.pointer_to_raw_data as usize;
            let data_end = data_offset + section.size_of_raw_data as usize;
            if data_end > dll_data.len() {
                return Err("Invalid section data bounds".to_string());
            }

            let remote_section = unsafe {
                (remote_base as *mut u8).add(section.virtual_address as usize) as *mut c_void
            };
            write_remote_memory(
                process_handle,
                remote_section,
                &dll_data[data_offset..data_end],
            )?;
        }

        let pid = process
            .pid()
            .map_err(|e| format!("Failed to read process ID: {}", e))?
            .get();

        resolve_imports(
            process_handle,
            pid,
            &dll_data,
            nt_headers,
            sections,
            remote_base_u64,
        )?;

        apply_relocations(
            process_handle,
            &dll_data,
            nt_headers,
            sections,
            remote_base_u64,
        )?;

        call_dll_main(
            process_handle,
            remote_base_u64,
            nt_headers.optional_header.address_of_entry_point,
        )?;

        Ok(())
    })();

    if result.is_err() {
        unsafe {
            VirtualFreeEx(process_handle, remote_base, 0, MEM_RELEASE);
        }
    }

    result
}

#[cfg(not(target_os = "windows"))]
pub fn manual_map_inject(_process: &u32, _dll_path: &Path) -> Result<(), String> {
    Err("Manual Map injection is only supported on Windows".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_manual_map_parsing_rejects_invalid_dll() {
        #[cfg(target_os = "windows")]
        {
            let data = vec![0u8; 32];
            assert!(get_nt_headers(&data).is_err());
        }
    }
}
