# Bundled files

- `native.dll`: the loader, kept in git because the ZAVZ executable embeds it. It reads the per-process selection in `.zywl\injector\plans\<pid>.ini` inside the user's home folder.
- `release.jar`: the FDPClient JAR, not in git. The installer ships it if the file is here at build time, and ZAVZ copies it to `.zywl\fdpclient\release.jar` when that folder has no JAR yet.
- `visuals.jar`: the Visuals JAR, not in git. The installer ships it if the file is here at build time, and ZAVZ copies it to `.zywl\visuals\release.jar` when that folder has no JAR yet.

ZAVZ creates `.zywl\visuals` and `.zywl\fdpclient` in the home folder of whoever runs it. A JAR that is chosen or found elsewhere is copied there. Restart Minecraft to change a project that is already loaded.

To update these files, copy them from their builds:
```
copy <LiquidBounce-DLL>\native\build-vs2022\target\Release\native.dll src\load\
copy ..\..\..\IdeaProjects\ZywlVisuals\build\libs\visuals-b2.jar src\load\visuals.jar
```
