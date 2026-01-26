#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TAURI_DIR="${ROOT_DIR}/src-tauri"
DIST_DIR="${ROOT_DIR}/dist"
RELEASE_DIR="${ROOT_DIR}/release"

if [[ ! -f "${TAURI_DIR}/Cargo.toml" ]]; then
  echo "Erro: ${TAURI_DIR}/Cargo.toml não encontrado. Configure o projeto Tauri primeiro."
  exit 1
fi

mkdir -p "${DIST_DIR}"
mkdir -p "${RELEASE_DIR}"

# Opção de limpeza profunda (use: CLEAN=1 ./build_all_rust.sh)
if [[ "${CLEAN:-0}" == "1" ]]; then
  echo "==> Modo CLEAN ativado - Limpando cache do Cargo e artifacts"
  if [[ -d "${HOME}/.cargo/registry/cache" ]]; then
    echo "Removendo ${HOME}/.cargo/registry/cache"
    rm -rf "${HOME}/.cargo/registry/cache"
  fi
  if [[ -d "${HOME}/.cargo/registry/src" ]]; then
    echo "Removendo ${HOME}/.cargo/registry/src"
    rm -rf "${HOME}/.cargo/registry/src"
  fi
  if [[ -d "${TAURI_DIR}/target" ]]; then
    echo "Removendo ${TAURI_DIR}/target"
    rm -rf "${TAURI_DIR}/target"
  fi
  if [[ -d "${DIST_DIR}" ]]; then
    echo "Removendo ${DIST_DIR}"
    rm -rf "${DIST_DIR}"
  fi
  if [[ -d "${RELEASE_DIR}" ]]; then
    echo "Removendo ${RELEASE_DIR}"
    rm -rf "${RELEASE_DIR}"
  fi
  if [[ -d "node_modules" ]]; then
    echo "Removendo node_modules"
    rm -rf node_modules
  fi
else
  echo "==> Build incremental (use CLEAN=1 para limpeza completa)"
fi

# Instalar dependências do Node.js se necessário
if [[ ! -d "node_modules" ]]; then
  echo "==> Instalando dependências do Node.js"
  npm install
fi

# Limpar dist/ ANTES do build do frontend (remove .exe antigos)
echo "==> Limpando pasta dist/ de arquivos antigos"
if [[ -d "${DIST_DIR}" ]]; then
  # Remove todos os .exe de dist/ (podem estar bloqueados)
  find "${DIST_DIR}" -name "*.exe" -delete 2>/dev/null || true
  # Se ainda existir dist/, tenta remover tudo
  rm -rf "${DIST_DIR}" 2>/dev/null || true
fi
mkdir -p "${DIST_DIR}"

# Build do frontend React + Vite
echo "==> Building frontend (React + Vite)"
npm run build

echo "==> Building Tauri backend (Rust)"
LOCKFILE="${TAURI_DIR}/Cargo.lock"
if [[ -f "${LOCKFILE}" ]] && grep -q "version = 4" "${LOCKFILE}"; then
  echo "Detectado Cargo.lock v4. Removendo para gerar com a toolchain fixada."
  rm "${LOCKFILE}"
fi

cargo +nightly-2026-01-14 build -Znext-lockfile-bump --manifest-path "${TAURI_DIR}/Cargo.toml" --release

EXE_PATH="$(find "${TAURI_DIR}/target/release" -maxdepth 1 -name '*.exe' -print -quit || true)"
if [[ -z "${EXE_PATH}" ]]; then
  echo "Erro: nenhum .exe encontrado em ${TAURI_DIR}/target/release."
  exit 1
fi

cp "${EXE_PATH}" "${RELEASE_DIR}/"
echo ""
echo "✅ Build complete!"
echo "📦 Executável: ${RELEASE_DIR}/$(basename "${EXE_PATH}")"
echo "🚀 Para rodar: ./${RELEASE_DIR}/$(basename "${EXE_PATH}")"
