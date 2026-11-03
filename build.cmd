@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js was not found. Install Node.js 18 or newer and run this again.
    exit /b 1
)
where cargo >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Rust was not found. Install rustup and run this again.
    exit /b 1
)
if not exist "src\load\native.dll" (
    echo [ERROR] src\load\native.dll is missing. See src\load\README.md.
    exit /b 1
)

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if errorlevel 1 exit /b 1
)

echo Building ZAVZ...
call npx tauri build
if errorlevel 1 (
    echo [ERROR] The build failed. Read the messages above.
    exit /b 1
)

echo.
echo ZAVZ is ready: src-tauri\target\release\ZAVZ.exe
start "" "src-tauri\target\release\ZAVZ.exe"
