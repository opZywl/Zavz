# 🔧 Zavz v2 - Build Instructions

## 📋 Requisitos

- **Node.js** 18+ (para o frontend React)
- **Rust** nightly-2026-01-14 (para o backend Tauri)
- **Windows** (DLL injection é específico do Windows)

---

## 🚀 Build Rápido (Recomendado)

### **Opção 1: Script Automatizado**

```bash
# Build incremental (rápido, preserva cache):
./build_all_rust.sh

# Build limpo (lento, remove todo cache):
CLEAN=1 ./build_all_rust.sh
```

**O que o script faz:**
1. ✅ Instala dependências do Node.js (se necessário)
2. ✅ Builda o frontend React + Vite → `dist/`
3. ✅ Builda o backend Rust + Tauri → `src-tauri/target/release/`
4. ✅ Copia o `.exe` final para `dist/`

**Resultado:**
- Executável: `dist/Zavz.exe`
- **100% standalone** (UI embarcada, não precisa de localhost)

---

## 🔨 Build Manual (Passo a Passo)

Se preferir rodar manualmente:

### **1. Instalar Dependências**
```bash
# Frontend (Node.js):
npm install

# Backend (Rust) - já vem com o Cargo
```

### **2. Build do Frontend**
```bash
# Compila TypeScript + React + Vite → dist/
npm run build
```

**Importante:** O frontend **DEVE** ser buildado antes do backend, pois o Tauri embarca os arquivos de `dist/` no executável final.

### **3. Build do Backend**
```bash
# Compila Rust + Tauri (release otimizado):
cd src-tauri
cargo +nightly-2026-01-14 build -Znext-lockfile-bump --release
cd ..
```

### **4. Localizar o Executável**
```bash
# O .exe final está em:
src-tauri/target/release/Zavz.exe
```

---

## 🐛 Troubleshooting

### **Erro: "localhost se recusou a conectar"**

**Causa:** O frontend não foi buildado antes do backend.

**Solução:**
```bash
# 1. Buildar o frontend primeiro:
npm run build

# 2. Depois buildar o backend:
./build_all_rust.sh
```

---

### **Erro: "winapi feature accctrl does not exist"**

**Causa:** Versão incorreta do Rust ou dependências desatualizadas.

**Solução:**
```bash
# Limpar cache e rebuildar:
CLEAN=1 ./build_all_rust.sh
```

---

### **Erro: "node_modules not found"**

**Causa:** Dependências do Node.js não instaladas.

**Solução:**
```bash
npm install
./build_all_rust.sh
```

---

## 🎯 Modo Desenvolvimento

Para desenvolvimento com hot reload:

### **Terminal 1: Frontend Dev Server**
```bash
npm run dev
```
- Roda Vite em `http://localhost:5173`
- Hot reload automático

### **Terminal 2: Tauri Dev Mode**
```bash
npm run tauri dev
```
- Abre janela do app
- Recompila Rust quando necessário
- Recarrega UI automaticamente

---

## 📦 Build de Produção Otimizado

Para criar um executável final otimizado:

```bash
# 1. Limpar tudo:
CLEAN=1 ./build_all_rust.sh

# 2. O executável final está em:
dist/Zavz.exe
```

**Otimizações aplicadas:**
- ✅ `opt-level = "z"` (tamanho mínimo)
- ✅ `strip = true` (remove símbolos de debug)
- ✅ `lto = true` (link-time optimization)
- ✅ `codegen-units = 1` (melhor otimização)

**Tamanho esperado:** ~15-20 MB (com WebView2 embedado)

---

## 📁 Estrutura de Build

```
Zavz/
├── dist/                    # Frontend buildado (Vite output)
│   ├── index.html
│   ├── assets/
│   └── Zavz.exe    # Executável final (copiado pelo script)
│
├── src-tauri/
│   └── target/
│       └── release/
│           └── Zavz.exe  # Executável original
│
├── node_modules/           # Dependências Node.js
├── package.json            # Config do frontend
└── build_all_rust.sh       # Script de build automatizado
```

---

## ⚡ Dicas de Performance

### **Build Incremental (Recomendado)**
```bash
# Usa cache, rápido (~2-5 minutos):
./build_all_rust.sh
```

### **Build Limpo (Quando Necessário)**
```bash
# Remove todo cache, lento (~10-15 minutos):
CLEAN=1 ./build_all_rust.sh
```

**Quando usar CLEAN=1:**
- Após mudar versões de dependências
- Erros de compilação estranhos
- Primeira build após clone do repo

---

## 🎨 Features do Build

✅ **Frontend:**
- React 18 + TypeScript
- Vite (build rápido)
- Tailwind CSS (utility-first)
- Lucide Icons

✅ **Backend:**
- Rust (seguro e performático)
- Tauri v2 (executável pequeno)
- DLL Injection (LoadLibrary)
- Process Monitoring (async)

✅ **Integração:**
- UI embarcada no .exe (sem localhost)
- Single file deployment
- WebView2 bootstrapper incluído
- Settings persistentes (JSON)

---

## 📞 Suporte

Problemas? Abra uma issue:
https://github.com/opZywl/Zavz/issues

---

**Versão:** 2.0.0
**Data:** Janeiro 2025
**Licença:** GPL-3.0
