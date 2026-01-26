# Script PowerShell para limpar ambiente de build
Write-Host "🧹 Limpando ambiente de build..." -ForegroundColor Cyan

# 1. Matar processos do yzy-injector se estiverem rodando
Write-Host "→ Matando processos yzy-injector.exe..." -ForegroundColor Yellow
Get-Process -Name "yzy-injector" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 2. Aguardar um pouco para o Windows liberar os arquivos
Start-Sleep -Seconds 1

# 3. Remover pasta dist/
Write-Host "→ Removendo pasta dist/..." -ForegroundColor Yellow
if (Test-Path "dist") {
    try {
        Remove-Item -Path "dist" -Recurse -Force -ErrorAction Stop
    } catch {
        Write-Host "⚠️  Não consegui remover dist/ automaticamente." -ForegroundColor Red
        Write-Host "   Feche qualquer aplicação usando arquivos de dist/ e tente novamente." -ForegroundColor Red
        exit 1
    }
}

# 4. Remover pasta release/
Write-Host "→ Removendo pasta release/..." -ForegroundColor Yellow
if (Test-Path "release") {
    Remove-Item -Path "release" -Recurse -Force -ErrorAction SilentlyContinue
}

# 5. Recriar pastas vazias
New-Item -ItemType Directory -Path "dist" -Force | Out-Null
New-Item -ItemType Directory -Path "release" -Force | Out-Null

Write-Host "✅ Limpeza completa!" -ForegroundColor Green
Write-Host "   Agora você pode rodar: bash build_all_rust.sh" -ForegroundColor Green
