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

echo "==> Building Tauri app (integrado: frontend + backend)"
LOCKFILE="${TAURI_DIR}/Cargo.lock"
if [[ -f "${LOCKFILE}" ]] && grep -q "version = 4" "${LOCKFILE}"; then
  echo "Detectado Cargo.lock v4. Removendo para gerar com a toolchain fixada."
  rm "${LOCKFILE}"
fi

# Configurar toolchain override temporário para este diretório
echo "→ Configurando Rust nightly-2026-01-14..."
cd "${TAURI_DIR}"
rustup override set nightly-2026-01-14
cd "${ROOT_DIR}"

# Usar Tauri CLI que automaticamente:
# 1. Roda beforeBuildCommand (npm run build)
# 2. Embarca assets de dist/ no executável
# 3. Compila o backend Rust
echo "→ Rodando Tauri CLI (isso vai compilar frontend + backend)..."
npm run tauri build

# Remover override
echo "→ Limpando toolchain override..."
cd "${TAURI_DIR}"
rustup override unset
cd "${ROOT_DIR}"

# Encontrar o executável gerado
EXE_PATH="$(find "${TAURI_DIR}/target/release" -maxdepth 1 -name '*.exe' -print -quit || true)"
if [[ -z "${EXE_PATH}" ]]; then
  echo "❌ Erro: nenhum .exe encontrado em ${TAURI_DIR}/target/release."
  echo "   Verifique os logs de build acima."
  exit 1
fi

# Copiar para release/
cp "${EXE_PATH}" "${RELEASE_DIR}/"
echo ""
echo "✅ Build complete!"
echo "📦 Executável: ${RELEASE_DIR}/$(basename "${EXE_PATH}")"
echo "🚀 Para rodar: ./${RELEASE_DIR}/$(basename "${EXE_PATH}")"
echo ""
echo "ℹ️  O executável contém a UI embarcada (não precisa de localhost)"
