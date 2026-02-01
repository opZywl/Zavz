#[cfg(target_os = "windows")]
use dll_syringe::process::OwnedProcess;
#[cfg(target_os = "windows")]
use std::ffi::c_void;
#[cfg(target_os = "windows")]
use std::fs::File;
#[cfg(target_os = "windows")]
use std::io::Read;
#[cfg(target_os = "windows")]
use std::os::windows::io::AsRawHandle;
#[cfg(target_os = "windows")]
use std::path::Path;

#[cfg(target_os = "windows")]
use windows_sys::Win32::Foundation::{CloseHandle, HANDLE};
#[cfg(target_os = "windows")]
use windows_sys::Win32::System::Diagnostics::Debug::WriteProcessMemory;
#[cfg(target_os = "windows")]
use windows_sys::Win32::System::Memory::{
    VirtualAllocEx, MEM_COMMIT, MEM_RESERVE, PAGE_EXECUTE_READWRITE,
};
#[cfg(target_os = "windows")]
use windows_sys::Win32::System::Threading::{
    CreateRemoteThread, WaitForSingleObject, INFINITE,
};

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
struct ImageFileHeader {
    _machine: u16,
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
    _address_of_entry_point: u32,
    _base_of_code: u32,
    _image_base: u64,
    _section_alignment: u32,
    _file_alignment: u32,
    _major_operating_system_version: u16,
    _minor_operating_system_version: u16,
    _major_image_version: u16,
    _minor_image_version: u16,
    _major_subsystem_version: u16,
    _minor_subsystem_version: u16,
    _win32_version_value: u32,
    _size_of_image: u32,
    _size_of_headers: u32,
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
struct ImageNtHeaders64 {
    signature: u32,
    file_header: ImageFileHeader,
    optional_header: ImageOptionalHeader64,
}

#[repr(C)]
struct ImageSectionHeader {
    _name: [u8; 8],
    virtual_size: u32,
    virtual_address: u32,
    size_of_raw_data: u32,
    pointer_to_raw_data: u32,
    _unused: [u8; 16],
}

#[repr(C)]
struct ImageExportDirectory {
    _characteristics: u32,
    _time_date_stamp: u32,
    _major_version: u16,
    _minor_version: u16,
    _name: u32,
    _base: u32,
    number_of_functions: u32,
    number_of_names: u32,
    address_of_functions: u32,
    address_of_names: u32,
    address_of_name_ordinals: u32,
}

const IMAGE_DOS_SIGNATURE: u16 = 0x5A4D;
const IMAGE_NT_SIGNATURE: u32 = 0x00004550;
const IMAGE_NT_OPTIONAL_HDR64_MAGIC: u16 = 0x20B;
const IMAGE_DIRECTORY_ENTRY_EXPORT: usize = 0;

#[cfg(target_os = "windows")]
fn get_nt_headers(dll_data: &[u8]) -> Result<(usize, &ImageNtHeaders64), String> {
    if dll_data.len() < std::mem::size_of::<ImageDosHeader>() {
        return Err("System operation failed. Please check for updates or contact support for assistance.".to_string());
    }

    let dos_header = unsafe { &*(dll_data.as_ptr() as *const ImageDosHeader) };
    if dos_header.e_magic != IMAGE_DOS_SIGNATURE {
        return Err("System operation failed. Please check for updates or contact support for assistance.".to_string());
    }

    let nt_offset = dos_header.e_lfanew as usize;
    if nt_offset + std::mem::size_of::<ImageNtHeaders64>() > dll_data.len() {
        return Err("System operation failed. Please check for updates or contact support for assistance.".to_string());
    }

    let nt_headers = unsafe { &*(dll_data.as_ptr().add(nt_offset) as *const ImageNtHeaders64) };
    if nt_headers.signature != IMAGE_NT_SIGNATURE {
        return Err("System operation failed. Please check for updates or contact support for assistance.".to_string());
    }
    if nt_headers.optional_header.magic != IMAGE_NT_OPTIONAL_HDR64_MAGIC {
        return Err("System operation failed. Please check for updates or contact support for assistance.".to_string());
    }

    Ok((nt_offset, nt_headers))
}

#[cfg(target_os = "windows")]
fn get_section_headers<'a>(
    dll_data: &'a [u8],
    nt_offset: usize,
    nt_headers: &ImageNtHeaders64,
) -> Result<&'a [ImageSectionHeader], String> {
    let section_offset = nt_offset
        + 4
        + std::mem::size_of::<ImageFileHeader>()
        + nt_headers.file_header.size_of_optional_header as usize;
    let section_size = std::mem::size_of::<ImageSectionHeader>()
        * nt_headers.file_header.number_of_sections as usize;
    if section_offset + section_size > dll_data.len() {
        return Err("System operation failed. Please check for updates or contact support for assistance.".to_string());
    }

    Ok(unsafe {
        std::slice::from_raw_parts(
            dll_data.as_ptr().add(section_offset) as *const ImageSectionHeader,
            nt_headers.file_header.number_of_sections as usize,
        )
    })
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
fn find_export_rva(
    dll_data: &[u8],
    nt_headers: &ImageNtHeaders64,
    sections: &[ImageSectionHeader],
    export_name: &str,
) -> Result<u32, String> {
    let export_dir = nt_headers.optional_header.data_directory[IMAGE_DIRECTORY_ENTRY_EXPORT];
    if export_dir.virtual_address == 0 || export_dir.size == 0 {
        return Err("System operation failed. Please check for updates or contact support for assistance.".to_string());
    }

    let export_offset = rva_to_offset(export_dir.virtual_address, sections)
        .ok_or_else(|| "System operation failed. Please check for updates or contact support for assistance.".to_string())?;
    if export_offset + std::mem::size_of::<ImageExportDirectory>() > dll_data.len() {
        return Err("System operation failed. Please check for updates or contact support for assistance.".to_string());
    }

    let export = unsafe { &*(dll_data.as_ptr().add(export_offset) as *const ImageExportDirectory) };

    let names_offset = rva_to_offset(export.address_of_names, sections)
        .ok_or_else(|| "System operation failed. Please check for updates or contact support for assistance.".to_string())?;
    let ordinals_offset = rva_to_offset(export.address_of_name_ordinals, sections)
        .ok_or_else(|| "System operation failed. Please check for updates or contact support for assistance.".to_string())?;
    let functions_offset = rva_to_offset(export.address_of_functions, sections)
        .ok_or_else(|| "System operation failed. Please check for updates or contact support for assistance.".to_string())?;

    for i in 0..export.number_of_names as usize {
        let name_rva_offset = names_offset + i * 4;
        let ordinal_offset = ordinals_offset + i * 2;
        if name_rva_offset + 4 > dll_data.len() || ordinal_offset + 2 > dll_data.len() {
            return Err("System operation failed. Please check for updates or contact support for assistance.".to_string());
        }

        let name_rva = u32::from_le_bytes(
            dll_data[name_rva_offset..name_rva_offset + 4]
                .try_into()
                .unwrap(),
        );
        let name_offset = rva_to_offset(name_rva, sections)
            .ok_or_else(|| "System operation failed. Please check for updates or contact support for assistance.".to_string())?;
        let name_end = dll_data[name_offset..]
            .iter()
            .position(|&c| c == 0)
            .ok_or_else(|| "System operation failed. Please check for updates or contact support for assistance.".to_string())?;
        let name = std::str::from_utf8(&dll_data[name_offset..name_offset + name_end])
            .map_err(|_| "System operation failed. Please check for updates or contact support for assistance.".to_string())?;

        if name == export_name {
            let ordinal = u16::from_le_bytes(
                dll_data[ordinal_offset..ordinal_offset + 2]
                    .try_into()
                    .unwrap(),
            ) as u32;
            if ordinal as u32 >= export.number_of_functions {
                return Err("System operation failed. Please check for updates or contact support for assistance.".to_string());
            }

            let func_rva_offset = functions_offset + ordinal as usize * 4;
            if func_rva_offset + 4 > dll_data.len() {
                return Err("System operation failed. Please check for updates or contact support for assistance.".to_string());
            }

            let func_rva = u32::from_le_bytes(
                dll_data[func_rva_offset..func_rva_offset + 4]
                    .try_into()
                    .unwrap(),
            );
            return Ok(func_rva);
        }
    }

    Err("System operation failed. Please check for updates or contact support for assistance.".to_string())
}

#[cfg(target_os = "windows")]
fn write_remote_memory(process: HANDLE, remote: *mut c_void, data: &[u8]) -> Result<(), String> {
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
        return Err("System operation failed. Please check for updates or contact support for assistance.".to_string());
    }

    Ok(())
}

#[cfg(target_os = "windows")]
pub fn reflective_inject(process: &OwnedProcess, dll_path: &Path) -> Result<(), String> {
    let mut file = File::open(dll_path)
        .map_err(|_e| "System operation failed. Please check for updates or contact support for assistance.".to_string())?;

    let mut dll_data = Vec::new();
    file.read_to_end(&mut dll_data)
        .map_err(|_e| "System operation failed. Please check for updates or contact support for assistance.".to_string())?;

    let (nt_offset, nt_headers) = get_nt_headers(&dll_data)?;
    let sections = get_section_headers(&dll_data, nt_offset, nt_headers)?;
    let reflective_rva = find_export_rva(&dll_data, nt_headers, sections, "ReflectiveLoader")?;

    let process_handle = process.as_raw_handle() as HANDLE;
    let remote_base = unsafe {
        VirtualAllocEx(
            process_handle,
            std::ptr::null(),
            dll_data.len(),
            MEM_COMMIT | MEM_RESERVE,
            PAGE_EXECUTE_READWRITE,
        )
    };

    if remote_base.is_null() {
        return Err("System operation failed. Please check for updates or contact support for assistance.".to_string());
    }

    write_remote_memory(process_handle, remote_base, &dll_data)?;

    let thread = unsafe {
        CreateRemoteThread(
            process_handle,
            std::ptr::null(),
            0,
            Some(std::mem::transmute((remote_base as u64 + reflective_rva as u64) as *const c_void)),
            remote_base,
            0,
            std::ptr::null_mut(),
        )
    };

    if thread == std::ptr::null_mut() {
        return Err("System operation failed. Please check for updates or contact support for assistance.".to_string());
    }

    unsafe { WaitForSingleObject(thread, INFINITE) };
    unsafe { CloseHandle(thread) };

    Ok(())
}

#[cfg(not(target_os = "windows"))]
pub fn reflective_inject(_process: &u32, _dll_path: &Path) -> Result<(), String> {
    Err("Reflective injection is only supported on Windows".to_string())
}
