#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TAURI_DIR="${ROOT_DIR}/src-tauri"
DIST_DIR="${ROOT_DIR}/dist"
RELEASE_DIR="${ROOT_DIR}/release"
EXPECTED_EXE_NAME="Zavz.exe"

if [[ ! -f "${TAURI_DIR}/Cargo.toml" ]]; then
  echo "Erro: ${TAURI_DIR}/Cargo.toml nao encontrado. Configure o projeto Tauri primeiro."
  exit 1
fi

mkdir -p "${DIST_DIR}"
mkdir -p "${RELEASE_DIR}"

# Remove executaveis antigos para evitar copiar binario errado
find "${RELEASE_DIR}" -maxdepth 1 -type f -iname "*.exe" -delete 2>/dev/null || true
find "${TAURI_DIR}/target/release" -maxdepth 1 -type f -iname "*.exe" -delete 2>/dev/null || true

# Opcao de limpeza profunda (use: CLEAN=1 ./build_all_rust.sh)
if [[ "${CLEAN:-0}" == "1" ]]; then
  echo "==> Modo CLEAN ativado - limpando cache do Cargo e artefatos"
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

# Instalar dependencias do Node.js quando necessario.
# Isso evita erro de modulo TS ausente quando package.json muda e node_modules antigo fica no cache.
NEEDS_NODE_INSTALL=0
if [[ ! -d "node_modules" ]]; then
  NEEDS_NODE_INSTALL=1
else
  while IFS= read -r dep; do
    [[ -z "${dep}" ]] && continue
    if [[ ! -d "node_modules/${dep}" ]]; then
      echo "Dependencia ausente detectada: ${dep}"
      NEEDS_NODE_INSTALL=1
      break
    fi
  done < <(node -e "const p=require('./package.json'); const deps={...(p.dependencies||{}), ...(p.devDependencies||{})}; console.log(Object.keys(deps).join('\n'))")
fi

if [[ "${NEEDS_NODE_INSTALL}" == "1" ]]; then
  echo "==> Instalando/atualizando dependencias do Node.js"
  npm install
fi

# Limpar dist antes do build do frontend (remove exe antigos)
echo "==> Limpando pasta dist de arquivos antigos"
if [[ -d "${DIST_DIR}" ]]; then
  find "${DIST_DIR}" -name "*.exe" -delete 2>/dev/null || true
  rm -rf "${DIST_DIR}" 2>/dev/null || true
fi
mkdir -p "${DIST_DIR}"

echo "==> Building Tauri app (integrado: frontend + backend)"
LOCKFILE="${TAURI_DIR}/Cargo.lock"
if [[ -f "${LOCKFILE}" ]] && grep -q "version = 4" "${LOCKFILE}"; then
  echo "Detectado Cargo.lock v4. Removendo para gerar com a toolchain fixada."
  rm "${LOCKFILE}"
fi

# Configurar toolchain override temporario para este diretorio
echo "-> Configurando Rust nightly-2026-01-14..."
cd "${TAURI_DIR}"
rustup override set nightly-2026-01-14
cd "${ROOT_DIR}"

# Usar Tauri CLI que automaticamente:
# 1. Roda beforeBuildCommand (npm run build)
# 2. Embarca assets de dist no executavel
# 3. Compila o backend Rust
echo "-> Rodando Tauri CLI (isso vai compilar frontend + backend)..."
npm run tauri build || {
  echo "Aviso: build do executavel completou, mas bundling falhou."
  echo "O executavel standalone pode ter sido criado com sucesso."
}

# Remover override
echo "-> Limpando toolchain override..."
cd "${TAURI_DIR}"
rustup override unset
cd "${ROOT_DIR}"

# Validar executavel esperado
EXE_PATH="${TAURI_DIR}/target/release/${EXPECTED_EXE_NAME}"
if [[ ! -f "${EXE_PATH}" ]]; then
  echo "Erro: executavel esperado nao encontrado: ${EXE_PATH}"
  echo "Verifique o nome do binario em src-tauri/Cargo.toml e os logs de build."
  exit 1
fi

# Copiar para release com nome fixo
cp -f "${EXE_PATH}" "${RELEASE_DIR}/${EXPECTED_EXE_NAME}"

echo ""
echo "Build complete!"
echo "Executavel: ./release/${EXPECTED_EXE_NAME}"
echo "Para rodar: ./release/${EXPECTED_EXE_NAME}"
echo ""
echo "O executavel contem a UI embarcada (nao precisa de localhost)"
