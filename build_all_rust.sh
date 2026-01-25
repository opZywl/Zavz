#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TAURI_DIR="${ROOT_DIR}/src-tauri"
DIST_DIR="${ROOT_DIR}/dist"

if [[ ! -f "${TAURI_DIR}/Cargo.toml" ]]; then
  echo "Erro: ${TAURI_DIR}/Cargo.toml não encontrado. Configure o projeto Tauri primeiro."
  exit 1
fi

mkdir -p "${DIST_DIR}"

echo "==> Building Tauri (release)"
cargo build --manifest-path "${TAURI_DIR}/Cargo.toml" --release

EXE_PATH="$(find "${TAURI_DIR}/target/release" -maxdepth 1 -name '*.exe' -print -quit || true)"
if [[ -z "${EXE_PATH}" ]]; then
  echo "Erro: nenhum .exe encontrado em ${TAURI_DIR}/target/release."
  exit 1
fi

cp "${EXE_PATH}" "${DIST_DIR}/"
echo "Build complete. Output: ${DIST_DIR}/$(basename "${EXE_PATH}")"
