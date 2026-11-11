# ZAVZ
![Minecraft](https://img.shields.io/badge/game-Minecraft-brightgreen)  
A desktop app that loads a chosen Java project into a running Minecraft 1.8.9 process.

Website: [lucas-lima.xyz](https://lucas-lima.xyz)  
Latest [github-actions](https://github.com/opZywl/YZYInjector/actions/workflows/build.yml?query=event%3Apush)  
Discord: [discord.gg/3XRFGeqEYD](https://discord.gg/3XRFGeqEYD)

## Setting up a Workspace
ZAVZ is a Tauri 2 app built with React, TypeScript and Rust. You need Windows, Node.js 18 or newer, Yarn, and the Rust toolchain `nightly-2026-01-14`.
1. Clone the repository using `git clone https://github.com/opZywl/YZYInjector.git` (The repository is private, so you need access first).
2. CD into the local repository folder.
3. Install the toolchain: `rustup toolchain install nightly-2026-01-14`
4. Install the frontend dependencies: `yarn install`
5. Run in development mode: `yarn tauri dev`
6. Build a release: `yarn tauri build`

### Troubleshooting Workspace Errors
The build embeds the loaders from `src/load`. The FDPClient Inject loader source is in `native/fdp-lunar`. See [src/load/README.md](../src/load/README.md) for how to update the bundled files.

More build details are in [BUILD.md](../BUILD.md).
