#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TAURI_DIR="${ROOT_DIR}/src-tauri"
DIST_DIR="${ROOT_DIR}/dist"
RELEASE_DIR="${ROOT_DIR}/release"
EXPECTED_EXE_NAME="Zavz.exe"

if [[ ! -f "${TAURI_DIR}/Cargo.toml" ]]; then
  echo "Error: ${TAURI_DIR}/Cargo.toml not found. Set up the Tauri project first."
  exit 1
fi

mkdir -p "${DIST_DIR}"
mkdir -p "${RELEASE_DIR}"

# Remove old executables so the wrong binary is never copied
find "${RELEASE_DIR}" -maxdepth 1 -type f -iname "*.exe" -delete 2>/dev/null || true
find "${TAURI_DIR}/target/release" -maxdepth 1 -type f -iname "*.exe" -delete 2>/dev/null || true

# Deep clean option (use: CLEAN=1 ./build_all_rust.sh)
if [[ "${CLEAN:-0}" == "1" ]]; then
  echo "==> CLEAN mode: clearing the Cargo cache and build outputs"
  if [[ -d "${HOME}/.cargo/registry/cache" ]]; then
    echo "Removing ${HOME}/.cargo/registry/cache"
    rm -rf "${HOME}/.cargo/registry/cache"
  fi
  if [[ -d "${HOME}/.cargo/registry/src" ]]; then
    echo "Removing ${HOME}/.cargo/registry/src"
    rm -rf "${HOME}/.cargo/registry/src"
  fi
  if [[ -d "${TAURI_DIR}/target" ]]; then
    echo "Removing ${TAURI_DIR}/target"
    rm -rf "${TAURI_DIR}/target"
  fi
  if [[ -d "${DIST_DIR}" ]]; then
    echo "Removing ${DIST_DIR}"
    rm -rf "${DIST_DIR}"
  fi
  if [[ -d "${RELEASE_DIR}" ]]; then
    echo "Removing ${RELEASE_DIR}"
    rm -rf "${RELEASE_DIR}"
  fi
  if [[ -d "node_modules" ]]; then
    echo "Removing node_modules"
    rm -rf node_modules
  fi
else
  echo "==> Incremental build (use CLEAN=1 for a full clean)"
fi

# Install Node.js dependencies when needed.
# Isso evita erro de modulo TS ausente quando package.json muda e node_modules antigo fica no cache.
NEEDS_NODE_INSTALL=0
if [[ ! -d "node_modules" ]]; then
  NEEDS_NODE_INSTALL=1
else
  while IFS= read -r dep; do
    [[ -z "${dep}" ]] && continue
    if [[ ! -d "node_modules/${dep}" ]]; then
      echo "Missing dependency: ${dep}"
      NEEDS_NODE_INSTALL=1
      break
    fi
  done < <(node -e "const p=require('./package.json'); const deps={...(p.dependencies||{}), ...(p.devDependencies||{})}; console.log(Object.keys(deps).join('\n'))")
fi

if [[ "${NEEDS_NODE_INSTALL}" == "1" ]]; then
  echo "==> Installing or updating Node.js dependencies"
  npm install
fi

# Limpar dist antes do build do frontend (remove exe antigos)
echo "==> Cleaning old files from dist"
if [[ -d "${DIST_DIR}" ]]; then
  find "${DIST_DIR}" -name "*.exe" -delete 2>/dev/null || true
  rm -rf "${DIST_DIR}" 2>/dev/null || true
fi
mkdir -p "${DIST_DIR}"

echo "==> Building Tauri app (frontend and backend)"
LOCKFILE="${TAURI_DIR}/Cargo.lock"
if [[ -f "${LOCKFILE}" ]] && grep -q "version = 4" "${LOCKFILE}"; then
  echo "Found Cargo.lock v4. Removing it so the pinned toolchain regenerates it."
  rm "${LOCKFILE}"
fi

# Temporary toolchain override for this directory
echo "-> Setting Rust nightly-2026-01-14..."
cd "${TAURI_DIR}"
rustup override set nightly-2026-01-14
cd "${ROOT_DIR}"

# Usar Tauri CLI que automaticamente:
# 1. Roda beforeBuildCommand (npm run build)
# 2. Embeds the dist assets in the executable
# 3. Compila o backend Rust
echo "-> Running the Tauri CLI (builds frontend and backend)..."
npm run tauri build || {
  echo "Warning: the executable built, but bundling failed."
  echo "The standalone executable may still have been created."
}

# Remover override
echo "-> Removing the toolchain override..."
cd "${TAURI_DIR}"
rustup override unset
cd "${ROOT_DIR}"

# Check the expected executable
EXE_PATH="${TAURI_DIR}/target/release/${EXPECTED_EXE_NAME}"
if [[ ! -f "${EXE_PATH}" ]]; then
  echo "Error: expected executable not found: ${EXE_PATH}"
  echo "Check the binary name in src-tauri/Cargo.toml and the build logs."
  exit 1
fi

# Copy to release under a fixed name
cp -f "${EXE_PATH}" "${RELEASE_DIR}/${EXPECTED_EXE_NAME}"

echo ""
echo "Build complete!"
echo "Executable: ./release/${EXPECTED_EXE_NAME}"
echo "To run: ./release/${EXPECTED_EXE_NAME}"
echo ""
echo "The executable embeds the UI (no localhost needed)"
