#!/usr/bin/env bash
# Script para limpar dist/ e matar processos bloqueados

echo "🧹 Limpando ambiente de build..."

# 1. Matar processos do yzy-injector se estiverem rodando
echo "→ Matando processos yzy-injector.exe..."
taskkill //F //IM yzy-injector.exe 2>/dev/null || true

# 2. Aguardar um pouco para o Windows liberar os arquivos
sleep 1

# 3. Remover pasta dist/
echo "→ Removendo pasta dist/..."
if [[ -d "dist" ]]; then
  rm -rf dist 2>/dev/null || {
    echo "⚠️  Não consegui remover dist/ automaticamente."
    echo "    Execute manualmente: Remove-Item -Recurse -Force dist"
    exit 1
  }
fi

# 4. Remover pasta release/
echo "→ Removendo pasta release/..."
rm -rf release 2>/dev/null || true

# 5. Recriar pastas vazias
mkdir -p dist
mkdir -p release

echo "✅ Limpeza completa!"
echo "   Agora você pode rodar: ./build_all_rust.sh"
