# Building ZAVZ

You need Windows, Node.js 18 or newer, and the Rust toolchain `nightly-2026-01-14`. The FDPClient Inject DLL is embedded in ZAVZ, and its source is included in `native/fdp-lunar`. See [FDPClient Inject startup loader](docs/FDP-LUNAR.md) for its CMake, Visual Studio 2022 and Java 17 build instructions.

## The short way
Run `build.cmd` in the repository root. It checks the tools, installs what is missing, builds ZAVZ and opens it.

## By hand
```
npm install
npx tauri build
```
The executable is `src-tauri\target\release\ZAVZ.exe` and the installer is under `src-tauri\target\release\bundle\nsis`.

For development, `npx tauri dev` runs the app against the Vite server.

## Files bundled into ZAVZ
`src/load` holds what ZAVZ ships. See [src/load/README.md](src/load/README.md).
