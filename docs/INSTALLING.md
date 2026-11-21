# ZAVZ
![Minecraft](https://img.shields.io/badge/game-Minecraft-brightgreen)  
A desktop app that loads a chosen Java project into a running Minecraft 1.8.9 process.

Website: [lucas-lima.xyz](https://lucas-lima.xyz)  
Latest [github-actions](https://github.com/opZywl/Zavz/actions/workflows/build.yml?query=event%3Apush)  
Discord: [discord.gg/3XRFGeqEYD](https://discord.gg/3XRFGeqEYD)

## How To Install ZAVZ?
ZAVZ runs on Windows. It can load two projects: Julia Visuals and FDPClient Inject.

- **Step 1:** Get the installer from the latest build, or build it yourself by following [WORKSPACE.md](WORKSPACE.md). The repository is private, so the build page only opens for accounts with access.
- **Step 2:** Run the installer
- **Step 3:** Open any Minecraft 1.8.9 client
- **Step 4:** In ZAVZ, click **JAR**, select your project, choose the file, then click **Save selection**
- **Step 5:** Click **Start**, then **Detect**, select the game, then **Inject**

Restart Minecraft before switching projects.

## Where ZAVZ keeps its files
ZAVZ keeps its files in `%USERPROFILE%\.zywl\injector`. Each project's JAR goes in `%USERPROFILE%\.zywl\<project>\release.jar`.

## Antivirus warnings
Antivirus tools can flag injectors, including ZAVZ, because malware uses similar techniques. The source code is in this repository if you want to check it.
