use std::{
    fs,
    io::Read,
    path::{Path, PathBuf},
    time::{Duration, Instant, UNIX_EPOCH},
};

use serde::{Deserialize, Serialize};

const RESULT_TIMEOUT: Duration = Duration::from_secs(30);
const LARGEST_JAR_BYTES: u64 = 600 * 1024 * 1024;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PayloadId {
    Visuals,
    Fdpclient,
    Fdplunar,
}

impl PayloadId {
    pub const ALL: [PayloadId; 3] = [
        PayloadId::Visuals,
        PayloadId::Fdpclient,
        PayloadId::Fdplunar,
    ];

    pub fn id(self) -> &'static str {
        match self {
            Self::Visuals => "visuals",
            Self::Fdpclient => "fdpclient",
            Self::Fdplunar => "fdplunar",
        }
    }

    pub fn label(self) -> &'static str {
        match self {
            Self::Visuals => "Visuals",
            Self::Fdpclient => "FDPClient",
            Self::Fdplunar => "FDP Lunar",
        }
    }

    fn entry(self) -> &'static str {
        match self {
            Self::Visuals => "xyz/zywl/visuals/injection/Loader.class",
            Self::Fdpclient => "net/zywl/fdp/injection/Loader.class",
            Self::Fdplunar => "net/ccbluex/liquidbounce/injection/bootstrap/LunarAgent.class",
        }
    }

    fn known_cores(self) -> &'static [&'static str] {
        match self {
            Self::Visuals => &[
                "xyz/zywl/visuals/core/Core.class",
                "xyz/zywl/visuals/core/ZywlVisuals.class",
            ],
            Self::Fdpclient => &["net/zywl/fdp/FDPClient.class"],
            Self::Fdplunar => &[],
        }
    }
}

fn manifest_value(archive: &mut zip::ZipArchive<fs::File>, key: &str) -> Option<String> {
    let mut text = String::new();
    archive
        .by_name("META-INF/MANIFEST.MF")
        .ok()?
        .read_to_string(&mut text)
        .ok()?;
    let mut value: Option<String> = None;
    let mut reading = false;
    for line in text.lines() {
        if let Some(rest) = line.strip_prefix(' ') {
            if reading {
                if let Some(found) = value.as_mut() {
                    found.push_str(rest);
                }
            }
            continue;
        }
        reading = false;
        if let Some((name, rest)) = line.split_once(':') {
            if name.trim().eq_ignore_ascii_case(key) {
                value = Some(rest.trim_start().to_string());
                reading = true;
            }
        }
    }
    value
        .map(|found| found.trim().to_string())
        .filter(|found| !found.is_empty())
}

fn class_file(class: &str) -> String {
    format!("{}.class", class.replace('.', "/"))
}

pub fn validate_jar(source: &Path, id: PayloadId) -> Result<(), String> {
    let label = id.label();
    let file =
        fs::File::open(source).map_err(|e| format!("The {label} JAR cannot be opened: {e}"))?;
    let mut archive = zip::ZipArchive::new(file)
        .map_err(|e| format!("The {label} JAR is not a valid archive: {e}"))?;
    let wrong = || format!("This file is not a {label} JAR. Choose the correct file.");
    let entry = match id {
        PayloadId::Visuals => {
            manifest_value(&mut archive, "Zavz-Entry-Class").map(|class| class_file(&class))
        }
        PayloadId::Fdpclient | PayloadId::Fdplunar => None,
    }
    .unwrap_or_else(|| id.entry().to_string());
    if archive.index_for_name(&entry).is_none() {
        return Err(wrong());
    }
    if id == PayloadId::Fdplunar {
        return if manifest_value(&mut archive, "FDP-Lunar-Bundle").as_deref() == Some("1.8.9")
            && manifest_value(&mut archive, "Agent-Class").as_deref()
                == Some("net.ccbluex.liquidbounce.injection.bootstrap.LunarAgent")
            && manifest_value(&mut archive, "FDP-Payload-Resource").as_deref()
                == Some("FDPClient.jar")
            && archive.index_for_name("FDPClient.jar").is_some()
        {
            Ok(())
        } else {
            Err(
                "Choose the current FDPClient-b17-lunar.jar bundle for native Lunar startup."
                    .into(),
            )
        };
    }
    if id
        .known_cores()
        .iter()
        .any(|name| archive.index_for_name(name).is_some())
    {
        return Ok(());
    }
    match manifest_value(&mut archive, "Zywl-Payload-Class").map(|class| class_file(&class)) {
        Some(name) if archive.index_for_name(&name).is_some() => Ok(()),
        _ => Err(wrong()),
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct PayloadConfiguration {
    pub selected: Vec<PayloadId>,
    pub allow_multiple: bool,
    pub visuals_jar: String,
    pub fdpclient_jar: String,
    pub fdp_lunar_jar: String,
}

pub fn root() -> PathBuf {
    dirs::home_dir()
        .expect("ZAVZ requires a user home directory")
        .join(".zywl")
}

pub fn jar_path(id: PayloadId) -> PathBuf {
    root().join(id.id()).join("release.jar")
}

fn variable(name: &str) -> Option<String> {
    match name.to_ascii_uppercase().as_str() {
        "USERPROFILE" | "HOME" => dirs::home_dir().map(|path| path.to_string_lossy().into_owned()),
        _ => std::env::var(name).ok(),
    }
}

pub fn expand_user_path(raw: &str) -> String {
    let trimmed = raw.trim().trim_matches('"').trim();
    let mut expanded = String::with_capacity(trimmed.len());
    let mut rest = trimmed;
    while let Some(start) = rest.find('%') {
        let after = &rest[start + 1..];
        let value = after
            .find('%')
            .filter(|&end| end > 0)
            .and_then(|end| variable(&after[..end]).map(|value| (value, end)));
        match value {
            Some((value, end)) => {
                expanded.push_str(&rest[..start]);
                expanded.push_str(&value);
                rest = &after[end + 1..];
            }
            None => {
                expanded.push_str(&rest[..=start]);
                rest = after;
            }
        }
    }
    expanded.push_str(rest);
    if let Some(relative) = expanded
        .strip_prefix("~\\")
        .or_else(|| expanded.strip_prefix("~/"))
    {
        if let Some(home) = dirs::home_dir() {
            expanded = home.join(relative).to_string_lossy().into_owned();
        }
    }
    if cfg!(windows) {
        expanded = expanded.replace('/', "\\");
    }
    expanded
}

fn resolve_or_default(raw: &str, id: PayloadId) -> String {
    let expanded = expand_user_path(raw);
    if expanded.is_empty() {
        jar_path(id).to_string_lossy().into_owned()
    } else {
        expanded
    }
}

impl Default for PayloadConfiguration {
    fn default() -> Self {
        Self {
            selected: vec![PayloadId::Visuals],
            allow_multiple: false,
            visuals_jar: jar_path(PayloadId::Visuals).to_string_lossy().into_owned(),
            fdpclient_jar: jar_path(PayloadId::Fdpclient)
                .to_string_lossy()
                .into_owned(),
            fdp_lunar_jar: jar_path(PayloadId::Fdplunar).to_string_lossy().into_owned(),
        }
    }
}

impl PayloadConfiguration {
    pub fn validate(&self) -> Result<(), String> {
        if self.selected.is_empty() {
            return Err("Select a project to load.".into());
        }
        if self.selected.contains(&PayloadId::Fdplunar) && self.selected.len() != 1 {
            return Err("FDP Lunar uses its own startup DLL. Select it on its own.".into());
        }
        if self.selected.len() > 2 || (self.selected.len() > 1 && !self.allow_multiple) {
            return Err("Turn on \"Load both\" before selecting both projects.".into());
        }
        if self.selected.len() == 2 && self.selected[0] == self.selected[1] {
            return Err("The same project was selected twice.".into());
        }
        Ok(())
    }

    pub fn source(&self, id: PayloadId) -> &str {
        match id {
            PayloadId::Visuals => &self.visuals_jar,
            PayloadId::Fdpclient => &self.fdpclient_jar,
            PayloadId::Fdplunar => &self.fdp_lunar_jar,
        }
    }

    pub fn with_resolved_paths(mut self) -> Self {
        self.visuals_jar = resolve_or_default(&self.visuals_jar, PayloadId::Visuals);
        self.fdpclient_jar = resolve_or_default(&self.fdpclient_jar, PayloadId::Fdpclient);
        self.fdp_lunar_jar = resolve_or_default(&self.fdp_lunar_jar, PayloadId::Fdplunar);
        self
    }

    pub fn healed(mut self) -> Self {
        let mut selected = Vec::new();
        for id in self.selected {
            if !selected.contains(&id) {
                selected.push(id);
            }
        }
        if selected.is_empty() {
            selected.push(PayloadId::Visuals);
        }
        if !self.allow_multiple || selected.contains(&PayloadId::Fdplunar) {
            selected.truncate(1);
        }
        self.selected = selected;
        for id in PayloadId::ALL {
            let given = PathBuf::from(resolve_or_default(self.source(id), id));
            let installed = jar_path(id);
            if !installed.is_file() && validate_jar(&given, id).is_ok() {
                let _ = copy_with_backup(&given, &installed);
            }
            let path = installed.to_string_lossy().into_owned();
            match id {
                PayloadId::Visuals => self.visuals_jar = path,
                PayloadId::Fdpclient => self.fdpclient_jar = path,
                PayloadId::Fdplunar => self.fdp_lunar_jar = path,
            }
        }
        self
    }
}

pub fn ensure_layout() -> Result<(), String> {
    let mut folders = vec![root().join("injector")];
    folders.extend(PayloadId::ALL.iter().map(|id| root().join(id.id())));
    for folder in folders {
        fs::create_dir_all(&folder)
            .map_err(|error| format!("Could not create {}: {error}", folder.display()))?;
    }
    Ok(())
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PayloadStatus {
    pub id: PayloadId,
    pub path: String,
    pub install_path: String,
    pub state: &'static str,
    pub message: String,
    pub size_bytes: u64,
    pub modified_ms: u64,
    pub detected: bool,
}

fn modified_ms(metadata: &fs::Metadata) -> u64 {
    metadata
        .modified()
        .ok()
        .and_then(|time| time.duration_since(UNIX_EPOCH).ok())
        .map(|elapsed| elapsed.as_millis() as u64)
        .unwrap_or(0)
}

fn search_directories() -> Vec<PathBuf> {
    let mut directories = Vec::new();
    if let Some(folder) = std::env::current_exe()
        .ok()
        .and_then(|exe| exe.parent().map(PathBuf::from))
    {
        directories.push(folder);
    }
    if let Some(config) = dirs::config_dir() {
        directories.push(config.join(".minecraft").join("mods"));
    }
    if let Some(desktop) = dirs::desktop_dir() {
        directories.push(desktop);
    }
    if let Some(downloads) = dirs::download_dir() {
        directories.push(downloads);
    }
    directories
}

fn is_candidate(path: &Path) -> bool {
    path.extension()
        .and_then(|extension| extension.to_str())
        .is_some_and(|extension| extension.eq_ignore_ascii_case("jar"))
        && fs::metadata(path)
            .is_ok_and(|metadata| metadata.is_file() && metadata.len() <= LARGEST_JAR_BYTES)
}

fn find_jar(id: PayloadId) -> Option<PathBuf> {
    let mut newest: Option<(u64, PathBuf)> = None;
    for directory in search_directories() {
        let Ok(entries) = fs::read_dir(directory) else {
            continue;
        };
        for entry in entries.flatten() {
            let path = entry.path();
            if !is_candidate(&path) || validate_jar(&path, id).is_err() {
                continue;
            }
            let stamp = fs::metadata(&path)
                .map(|metadata| modified_ms(&metadata))
                .unwrap_or(0);
            if newest.as_ref().is_none_or(|(best, _)| stamp > *best) {
                newest = Some((stamp, path));
            }
        }
    }
    newest.map(|(_, path)| path)
}

pub fn adopt_missing<F>(id: PayloadId, bundled: &F) -> bool
where
    F: Fn(PayloadId) -> Option<PathBuf>,
{
    let installed = jar_path(id);
    if installed.is_file() {
        return false;
    }
    let source = bundled(id)
        .filter(|path| validate_jar(path, id).is_ok())
        .or_else(|| find_jar(id));
    match source {
        Some(source) => copy_with_backup(&source, &installed).is_ok(),
        None => false,
    }
}

pub fn inspect<F>(
    configuration: &PayloadConfiguration,
    detect: bool,
    bundled: &F,
) -> Vec<PayloadStatus>
where
    F: Fn(PayloadId) -> Option<PathBuf>,
{
    PayloadId::ALL
        .iter()
        .map(|&id| {
            let installed = jar_path(id);
            let mut path = PathBuf::from(resolve_or_default(configuration.source(id), id));
            let detected = detect && adopt_missing(id, bundled);
            if detect && !path.is_file() {
                path = installed.clone();
            }
            let label = id.label();
            let metadata = fs::metadata(&path)
                .ok()
                .filter(|metadata| metadata.is_file());
            let (state, message) = match &metadata {
                None => (
                    "missing",
                    format!("No {label} JAR yet. Choose the file and it is copied here."),
                ),
                Some(_) => match validate_jar(&path, id) {
                    Ok(()) => ("ready", String::new()),
                    Err(reason) => ("invalid", reason),
                },
            };
            PayloadStatus {
                id,
                path: path.to_string_lossy().into_owned(),
                install_path: installed.to_string_lossy().into_owned(),
                state,
                message,
                size_bytes: metadata.as_ref().map_or(0, |metadata| metadata.len()),
                modified_ms: metadata.as_ref().map_or(0, modified_ms),
                detected,
            }
        })
        .collect()
}

fn same_contents(first: &Path, second: &Path) -> std::io::Result<bool> {
    if fs::metadata(first)?.len() != fs::metadata(second)?.len() {
        return Ok(false);
    }
    let mut one = fs::File::open(first)?;
    let mut other = fs::File::open(second)?;
    let mut left = vec![0u8; 1 << 20];
    let mut right = vec![0u8; 1 << 20];
    loop {
        let read = one.read(&mut left)?;
        if read == 0 {
            return Ok(true);
        }
        other.read_exact(&mut right[..read])?;
        if left[..read] != right[..read] {
            return Ok(false);
        }
    }
}

fn in_use_hint(error: std::io::Error, target: &Path) -> String {
    if error.raw_os_error() == Some(32) || error.kind() == std::io::ErrorKind::PermissionDenied {
        format!(
            "{} is in use. Close Minecraft and try again.",
            target.display()
        )
    } else {
        format!("Could not install the JAR at {}: {error}", target.display())
    }
}

pub fn copy_with_backup(source: &Path, target: &Path) -> Result<(), String> {
    if !source.is_file() {
        return Err(format!("JAR not found: {}.", source.display()));
    }
    let source_path = source.canonicalize().map_err(|e| e.to_string())?;
    if target.canonicalize().ok().as_ref() == Some(&source_path) {
        return Ok(());
    }
    let directory = target.parent().ok_or("The install folder is missing.")?;
    fs::create_dir_all(directory).map_err(|e| e.to_string())?;
    if target.is_file() && same_contents(&source_path, target).unwrap_or(false) {
        return Ok(());
    }
    let incoming = target.with_extension("jar.incoming");
    fs::copy(&source_path, &incoming).map_err(|e| in_use_hint(e, &incoming))?;
    if target.is_file() {
        let previous = target.with_extension("jar.previous");
        let _ = fs::remove_file(&previous);
        if let Err(error) = fs::rename(target, &previous) {
            let _ = fs::remove_file(&incoming);
            return Err(in_use_hint(error, target));
        }
    }
    fs::rename(&incoming, target).map_err(|e| in_use_hint(e, target))
}

pub fn install(configuration: &PayloadConfiguration) -> Result<Vec<(PayloadId, PathBuf)>, String> {
    configuration.validate()?;
    ensure_layout()?;
    for &id in &configuration.selected {
        let source = Path::new(configuration.source(id));
        if !source.is_file() {
            return Err(format!(
                "The {} JAR is missing from {}. Choose the file in the JAR window.",
                id.label(),
                source.display()
            ));
        }
        validate_jar(source, id)?;
    }
    for id in PayloadId::ALL {
        if !configuration.selected.contains(&id) {
            let source = Path::new(configuration.source(id));
            if validate_jar(source, id).is_ok() {
                let _ = copy_with_backup(source, &jar_path(id));
            }
        }
    }
    configuration
        .selected
        .iter()
        .map(|&id| {
            let destination = jar_path(id);
            copy_with_backup(Path::new(configuration.source(id)), &destination)?;
            Ok((id, destination))
        })
        .collect()
}

pub fn plan_text(
    pid: u32,
    configuration: &PayloadConfiguration,
    installed: &[(PayloadId, PathBuf)],
) -> Result<String, String> {
    configuration.validate()?;
    if installed.len() != configuration.selected.len() {
        return Err("The installed projects do not match the selection.".into());
    }
    let mut text = format!(
        "[selection]\r\nversion=1\r\npid={pid}\r\ncount={}\r\nmultiple={}\r\n",
        installed.len(),
        u8::from(configuration.allow_multiple)
    );
    for (index, ((id, path), selected)) in installed.iter().zip(&configuration.selected).enumerate()
    {
        if id != selected {
            return Err(
                "The installed projects are in a different order than the selection.".into(),
            );
        }
        let value = path.to_str().ok_or("The JAR path is not valid Unicode.")?;
        if value.contains(['\r', '\n', '"']) || value.encode_utf16().count() >= 259 {
            return Err(
                "The JAR path is too long or has characters the Windows loader cannot read.".into(),
            );
        }
        text.push_str(&format!(
            "\r\n[payload{index}]\r\nid={}\r\njar={value}\r\n",
            id.id()
        ));
    }
    Ok(text)
}

fn plan_path(pid: u32) -> PathBuf {
    root()
        .join("injector")
        .join("plans")
        .join(format!("{pid}.ini"))
}

pub fn write_plan(
    pid: u32,
    configuration: &PayloadConfiguration,
    installed: &[(PayloadId, PathBuf)],
) -> Result<PathBuf, String> {
    let text = plan_text(pid, configuration, installed)?;
    let plan = plan_path(pid);
    let directory = plan.parent().ok_or("The plan folder is missing.")?;
    fs::create_dir_all(directory).map_err(|e| e.to_string())?;
    let result = directory.join(format!("{pid}.ini.result"));
    match fs::remove_file(&result) {
        Ok(()) => (),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => (),
        Err(error) => return Err(error.to_string()),
    }
    let bytes: Vec<u8> = std::iter::once(0xfeffu16)
        .chain(text.encode_utf16())
        .flat_map(u16::to_le_bytes)
        .collect();
    fs::write(plan, bytes).map_err(|e| e.to_string())?;
    Ok(result)
}

pub fn discard_plan(pid: u32) {
    let plan = plan_path(pid);
    let _ = fs::remove_file(plan.with_extension("ini.result"));
    let _ = fs::remove_file(plan);
}

fn process_alive(pid: u32) -> bool {
    let target = sysinfo::Pid::from_u32(pid);
    let mut system = sysinfo::System::new();
    system.refresh_process(target)
}

pub fn wait_result(pid: u32, path: &Path, early_lunar: bool) -> Result<(), String> {
    let timeout = if early_lunar {
        Duration::from_secs(300)
    } else {
        RESULT_TIMEOUT
    };
    let start = Instant::now();
    let mut last_alive_check = Instant::now();
    while start.elapsed() < timeout {
        match fs::read_to_string(path) {
            Ok(result) if result == "ok" => return Ok(()),
            Ok(result) if result.starts_with("error: ") => return Err(result[7..].to_string()),
            Ok(_) => (),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => (),
            Err(error) => return Err(format!("Could not read the loading result: {error}")),
        }
        if last_alive_check.elapsed() >= Duration::from_secs(1) {
            last_alive_check = Instant::now();
            if !process_alive(pid) {
                return Err(
                    "The game closed while the project was loading. Check crash-reports and .zywl/injector/native.log."
                        .into(),
                );
            }
        }
        std::thread::sleep(Duration::from_millis(100));
    }
    Err("The game did not confirm that the project loaded. Restart Minecraft and try again.".into())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lunar_agent_is_a_separate_single_project() {
        let mut config = PayloadConfiguration {
            selected: vec![PayloadId::Fdplunar],
            ..Default::default()
        };
        assert!(config.validate().is_ok());
        let plan = plan_text(
            42,
            &config,
            &[(
                PayloadId::Fdplunar,
                PathBuf::from(r"C:\FDP\current-lunar.jar"),
            )],
        )
        .unwrap();
        assert!(plan.contains("id=fdplunar"));
        assert!(!plan.contains("id=fdpclient"));
        config.allow_multiple = true;
        config.selected.push(PayloadId::Visuals);
        assert!(config.validate().is_err());
    }

    #[test]
    fn single_visuals_does_not_emit_fdpclient() {
        let config = PayloadConfiguration::default();
        let text = plan_text(
            123,
            &config,
            &[(PayloadId::Visuals, PathBuf::from(r"C:\test\visuals.jar"))],
        )
        .unwrap();
        assert!(text.contains("count=1"));
        assert!(text.contains("id=visuals"));
        assert!(!text.contains("fdpclient"));
    }

    #[test]
    fn multiple_requires_explicit_opt_in() {
        let mut config = PayloadConfiguration::default();
        config.selected.push(PayloadId::Fdpclient);
        assert!(config.validate().is_err());
        config.allow_multiple = true;
        assert!(config.validate().is_ok());
        config.selected[1] = PayloadId::Visuals;
        assert!(config.validate().is_err());
    }

    #[test]
    fn empty_selection_and_ini_injection_are_rejected() {
        let mut config = PayloadConfiguration::default();
        assert!(plan_text(
            1,
            &config,
            &[(PayloadId::Visuals, PathBuf::from("C:\\a\n[payload1]"))]
        )
        .is_err());
        config.selected.clear();
        assert!(config.validate().is_err());
    }

    #[test]
    fn environment_variables_and_home_expand_to_real_paths() {
        let home = dirs::home_dir().unwrap().to_string_lossy().into_owned();
        let expanded = expand_user_path(r"%USERPROFILE%\.zywl\visuals\release.jar");
        assert_eq!(expanded, format!(r"{home}\.zywl\visuals\release.jar"));
        assert!(!expanded.contains('%'));
        assert_eq!(expand_user_path("%userprofile%"), home);
        assert_eq!(expand_user_path(r"~\x.jar"), format!(r"{home}\x.jar"));
        assert_eq!(expand_user_path("  \"C:/a/b.jar\" "), r"C:\a\b.jar");
        assert_eq!(expand_user_path(r"C:\100%\x.jar"), r"C:\100%\x.jar");
        assert_eq!(
            expand_user_path(r"%ZAVZ_NOT_SET_ANYWHERE%\x"),
            r"%ZAVZ_NOT_SET_ANYWHERE%\x"
        );
    }

    #[test]
    fn blank_paths_heal_to_the_install_folder() {
        let healed = PayloadConfiguration {
            selected: vec![],
            allow_multiple: false,
            visuals_jar: String::new(),
            fdpclient_jar: "   ".into(),
            fdp_lunar_jar: String::new(),
        }
        .healed();
        assert_eq!(healed.selected, vec![PayloadId::Visuals]);
        assert_eq!(
            healed.visuals_jar,
            jar_path(PayloadId::Visuals).to_string_lossy()
        );
        assert_eq!(
            healed.fdpclient_jar,
            jar_path(PayloadId::Fdpclient).to_string_lossy()
        );
    }

    #[test]
    fn healing_keeps_one_project_unless_multiple_is_on() {
        let mut config = PayloadConfiguration {
            selected: vec![
                PayloadId::Fdpclient,
                PayloadId::Visuals,
                PayloadId::Fdpclient,
            ],
            ..PayloadConfiguration::default()
        };
        assert_eq!(config.clone().healed().selected, vec![PayloadId::Fdpclient]);
        config.allow_multiple = true;
        assert_eq!(
            config.healed().selected,
            vec![PayloadId::Fdpclient, PayloadId::Visuals]
        );
    }

    #[test]
    fn inspecting_never_returns_a_placeholder_path() {
        let statuses = inspect(
            &PayloadConfiguration {
                selected: vec![PayloadId::Visuals],
                allow_multiple: false,
                visuals_jar: r"%USERPROFILE%\.zywl\visuals\release.jar".into(),
                fdpclient_jar: String::new(),
                fdp_lunar_jar: String::new(),
            },
            false,
            &|_| None,
        );
        assert_eq!(statuses.len(), PayloadId::ALL.len());
        let home = dirs::home_dir().unwrap();
        for status in statuses {
            assert!(!status.path.contains('%'), "{}", status.path);
            assert!(!status.path.is_empty());
            let expected = home.join(".zywl").join(status.id.id()).join("release.jar");
            assert_eq!(status.install_path, expected.to_string_lossy());
        }
    }

    #[test]
    fn the_project_folders_come_from_this_users_home() {
        let home = dirs::home_dir().unwrap();
        assert_eq!(
            jar_path(PayloadId::Visuals),
            home.join(r".zywl\visuals\release.jar")
        );
        assert_eq!(
            jar_path(PayloadId::Fdpclient),
            home.join(r".zywl\fdpclient\release.jar")
        );
    }

    #[test]
    fn a_jar_kept_elsewhere_is_replaced_by_the_project_folder() {
        let healed = PayloadConfiguration {
            selected: vec![PayloadId::Fdpclient],
            allow_multiple: false,
            visuals_jar: r"C:\does\not\exist\visuals.jar".into(),
            fdpclient_jar: r"C:\does\not\exist\fdp.jar".into(),
            fdp_lunar_jar: r"C:\does\not\exist\fdp-lunar.jar".into(),
        }
        .healed();
        assert_eq!(
            healed.visuals_jar,
            jar_path(PayloadId::Visuals).to_string_lossy()
        );
        assert_eq!(
            healed.fdpclient_jar,
            jar_path(PayloadId::Fdpclient).to_string_lossy()
        );
    }

    fn jar(name: &str, entries: &[(&str, &str)]) -> PathBuf {
        let path = std::env::temp_dir().join(format!("zavz-{}-{name}.jar", std::process::id()));
        let mut writer = zip::ZipWriter::new(fs::File::create(&path).unwrap());
        let options = zip::write::SimpleFileOptions::default()
            .compression_method(zip::CompressionMethod::Stored);
        for (entry, text) in entries {
            writer.start_file(*entry, options).unwrap();
            std::io::Write::write_all(&mut writer, text.as_bytes()).unwrap();
        }
        writer.finish().unwrap();
        path
    }

    #[test]
    fn visuals_jars_are_known_by_their_loader_and_payload() {
        let loader = ("xyz/zywl/visuals/injection/Loader.class", "");
        let old = jar(
            "old",
            &[loader, ("xyz/zywl/visuals/core/ZywlVisuals.class", "")],
        );
        let renamed = jar(
            "renamed",
            &[loader, ("xyz/zywl/visuals/core/Core.class", "")],
        );
        let declared = jar(
            "declared",
            &[
                loader,
                (
                    "META-INF/MANIFEST.MF",
                    "Manifest-Version: 1.0\r\nZywl-Payload-Class: xyz.zywl.visuals.bootst\r\n rap.ZavzBootstrap\r\n\r\n",
                ),
                ("xyz/zywl/visuals/bootstrap/ZavzBootstrap.class", ""),
            ],
        );
        let missing = jar(
            "missing",
            &[
                loader,
                (
                    "META-INF/MANIFEST.MF",
                    "Manifest-Version: 1.0\r\nZywl-Payload-Class: xyz.zywl.visuals.Gone\r\n\r\n",
                ),
            ],
        );
        let no_loader = jar("no-loader", &[("xyz/zywl/visuals/core/Core.class", "")]);
        let moved = jar(
            "moved",
            &[
                (
                    "META-INF/MANIFEST.MF",
                    "Manifest-Version: 1.0\r\nZavz-Entry-Class: xyz.zywl.julia.injection.Loader\r\nZywl-Payload-Class: xyz.zywl.julia.bootstrap.ZavzBootstrap\r\n\r\n",
                ),
                ("xyz/zywl/julia/injection/Loader.class", ""),
                ("xyz/zywl/julia/bootstrap/ZavzBootstrap.class", ""),
            ],
        );
        let stale_entry = jar(
            "stale-entry",
            &[
                loader,
                (
                    "META-INF/MANIFEST.MF",
                    "Manifest-Version: 1.0\r\nZavz-Entry-Class: xyz.zywl.julia.injection.Loader\r\nZywl-Payload-Class: xyz.zywl.visuals.bootstrap.ZavzBootstrap\r\n\r\n",
                ),
                ("xyz/zywl/visuals/bootstrap/ZavzBootstrap.class", ""),
            ],
        );
        assert!(validate_jar(&old, PayloadId::Visuals).is_ok());
        assert!(validate_jar(&renamed, PayloadId::Visuals).is_ok());
        assert!(validate_jar(&declared, PayloadId::Visuals).is_ok());
        assert!(validate_jar(&moved, PayloadId::Visuals).is_ok());
        assert!(validate_jar(&missing, PayloadId::Visuals).is_err());
        assert!(validate_jar(&no_loader, PayloadId::Visuals).is_err());
        assert!(validate_jar(&stale_entry, PayloadId::Visuals).is_err());
        assert!(validate_jar(&renamed, PayloadId::Fdpclient).is_err());
        assert!(validate_jar(&moved, PayloadId::Fdpclient).is_err());
        for path in [
            old,
            renamed,
            declared,
            missing,
            no_loader,
            moved,
            stale_entry,
        ] {
            let _ = fs::remove_file(path);
        }
    }
}
