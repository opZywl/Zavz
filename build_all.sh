#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RELEASE_DIR="${ROOT_DIR}/release"

echo "Building Zavz (Tauri + Rust + React)..."

# Build frontend
echo "Building React frontend..."
npm run build

# Build Tauri application
echo "Building Tauri application..."
npm run tauri build

# Copy executable to release folder
mkdir -p "${RELEASE_DIR}"
if [ -f "${ROOT_DIR}/src-tauri/target/release/Zavz.exe" ]; then
    cp "${ROOT_DIR}/src-tauri/target/release/Zavz.exe" "${RELEASE_DIR}/"
    echo ""
    echo "✅ Build complete!"
    echo "📦 Executable: ${RELEASE_DIR}/Zavz.exe"
    echo "🚀 To run: ./${RELEASE_DIR}/Zavz.exe"
else
    echo "⚠️  Executable not found. Check build logs above."
    exit 1
fi

