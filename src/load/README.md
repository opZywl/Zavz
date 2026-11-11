# Bundled files

- `native.dll`: the loader, kept in git because the ZAVZ executable embeds it. It reads the per-process selection in `.zywl\injector\plans\<pid>.ini` inside the user's home folder.
- `fdp-lunar.dll`: the current FDPClient Lunar startup loader, built from `FDPClient/native/lunar`. It is embedded separately and selected only for **FDP Lunar**. Start the watcher before launching Lunar 1.8.9, without the FDP `-javaagent` argument.
- `fdp-lunar.jar`: the self-contained `FDPClient-b17-lunar.jar` bundle. The JAR path remains selectable in the JAR window; it is independent of the older FDPClient DLL project.
- `release.jar`: the FDPClient JAR, not in git. The installer ships it if the file is here at build time, and ZAVZ copies it to `.zywl\fdpclient\release.jar` when that folder has no JAR yet.
- `visuals.jar`: the Visuals JAR, not in git. The installer ships it if the file is here at build time, and ZAVZ copies it to `.zywl\visuals\release.jar` when that folder has no JAR yet.

ZAVZ creates `.zywl\visuals`, `.zywl\fdpclient`, and `.zywl\fdplunar` in the home folder of whoever runs it. A JAR that is chosen or found elsewhere is copied to its own project folder. Restart Minecraft to change a project that is already loaded.

To update these files, copy them from their builds:
```
copy <LiquidBounce-DLL>\native\build-vs2022\target\Release\native.dll src\load\
copy ..\..\..\IdeaProjects\ZywlVisuals\build\libs\julia-b2.jar src\load\visuals.jar
```
