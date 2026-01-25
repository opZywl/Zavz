# YZY Injector v2 - Guia de Migração

## 📋 Resumo da Modernização

Este documento detalha a migração completa do **YZY Injector** de C++ (wxWidgets) para **Tauri v2 + Rust + React (TypeScript)**.

---

## 🎯 Objetivos Alcançados

### ✅ **1. Backend (Rust)**
Todas as funcionalidades do código legado C++ foram portadas com melhorias:

#### **Funcionalidades Portadas:**

| Funcionalidade Legada (C++) | Implementação Moderna (Rust) | Arquivo |
|----------------------------|------------------------------|---------|
| `GetProcId()` (inject.cpp) | `find_process_by_name()` | `src-tauri/src/injector.rs:79` |
| `performInjection()` (inject.cpp) | `inject_dll()` com validação de arquitetura | `src-tauri/src/injector.rs:94` |
| `SetAccessControl()` (FixFilePerms.cpp) | `set_access_control()` para UWP | `src-tauri/src/injector.rs:59` |
| Watcher Loop (cMain.cpp:464) | Async watcher com detecção de novas instâncias | `src-tauri/src/main.rs:192` |
| JAR Copying (cMain.cpp:349) | `setup_fdp_jar()` | `src-tauri/src/injector.rs:115` |
| Config Save/Load (config.cpp) | Persistência JSON via Tauri | `src-tauri/src/main.rs:104` |

#### **Melhorias Implementadas:**

1. **✨ Validação de Arquitetura DLL/Processo**
   - Detecta se DLL é 32-bit ou 64-bit (leitura do PE header)
   - Compara com arquitetura do processo alvo
   - Previne erros de incompatibilidade
   - Localização: `src-tauri/src/injector.rs:11`

2. **🔒 File Permissions (UWP Compatibility)**
   - Portado do UWPDumper (código original por Wunkolo)
   - Permite injeção em apps UWP
   - Usa Windows ACL API
   - Localização: `src-tauri/src/injector.rs:59`

3. **🔄 Watcher Aprimorado**
   - Detecta novas instâncias do processo (via PID tracking)
   - Não para após primeira injeção
   - Continua monitorando
   - Localização: `src-tauri/src/main.rs:192`

4. **📦 FDP Client Loader**
   - Copia .jar para `~/.fdpclient`
   - Verifica duplicatas
   - Suporte para Lunar/Badlion
   - Localização: `src-tauri/src/injector.rs:115`

---

### ✅ **2. Frontend (React + TypeScript)**

#### **Componentes Criados:**

1. **`Dashboard.tsx`** - Layout Bento Grid com:
   - Header animado com gradientes
   - Status cards em tempo real
   - Footer com links
   - Localização: `src/components/Dashboard.tsx`

2. **`ConsoleLogs.tsx`** - Terminal estilo hacker com:
   - Timestamps
   - Color-coded logs (info/success/error/warning)
   - Auto-scroll
   - Clear button
   - Localização: `src/components/ConsoleLogs.tsx`

3. **`InjectorCard.tsx`** (Modernizado) - Card principal com:
   - Drag & Drop para DLL
   - Process selector com custom toggle
   - Watcher controls
   - Localização: `src/components/InjectorCard.tsx`

4. **`SettingsCard.tsx`** (Modernizado) - Configurações avançadas:
   - JVM Arguments
   - Injection Method (Standard/Manual Map)
   - Auto-close toggle
   - Random Window Title toggle
   - FDP Loader (JAR selection)
   - Localização: `src/components/SettingsCard.tsx`

#### **Design System:**

- **Paleta de Cores:**
  - Background: `#09090b` (Zinc-950)
  - Surface: `#18181b` (Zinc-900)
  - Accent: `#4677FF` (Blue)
  - Text: Zinc-100/400/500

- **Tipografia:**
  - Sans: Inter (Google Fonts)
  - Mono: JetBrains Mono (logs)

- **Layout:**
  - Bento Grid (12 colunas)
  - Responsive breakpoints
  - Rounded corners (2xl = 16px)
  - Glassmorphism effects

---

## 🔧 Configuração do Ambiente

### **1. Instalar Dependências**

```bash
# Frontend
npm install

# Backend (Rust)
cd src-tauri
cargo build
```

### **2. Desenvolvimento**

```bash
# Terminal 1: Frontend dev server
npm run dev

# Terminal 2: Tauri dev (abre janela)
npm run tauri dev
```

### **3. Build de Produção**

```bash
# Build completo (frontend + backend)
npm run tauri build

# Resultado: src-tauri/target/release/yzy-injector.exe
```

---

## 📚 Estrutura de Arquivos

```
YZYInjector/
├── src/                          # Frontend React
│   ├── components/
│   │   ├── Dashboard.tsx         # Layout principal Bento Grid
│   │   ├── ConsoleLogs.tsx       # Terminal de logs
│   │   ├── InjectorCard.tsx      # Card de injeção
│   │   └── SettingsCard.tsx      # Configurações
│   ├── App.tsx                   # App principal com state
│   ├── main.tsx                  # Entry point React
│   └── index.css                 # Tailwind + estilos globais
│
├── src-tauri/                    # Backend Rust
│   ├── src/
│   │   ├── main.rs               # Entry point Tauri (comandos)
│   │   └── injector.rs           # Módulo de injeção (core logic)
│   ├── Cargo.toml                # Dependências Rust
│   └── tauri.conf.json           # Config Tauri
│
├── package.json                  # Dependências Node.js
├── vite.config.ts                # Config Vite
├── tsconfig.json                 # Config TypeScript
├── tailwind.config.js            # Config Tailwind
└── index.html                    # HTML base
```

---

## 🎨 Comparação Visual

### **Antes (wxWidgets C++)**
- Interface "Windows Forms" antiga
- Botões genéricos
- Layout fixo
- Sem animações
- Cores planas

### **Depois (Tauri v2 + React)**
- Design moderno estilo LiquidLauncher
- Bento Grid responsivo
- Dark mode profundo (Zinc/Slate)
- Animações suaves
- Gradientes e glassmorphism
- Terminal de logs estilo hacker
- Drag & Drop para arquivos

---

## 🚀 Funcionalidades Completas

### **Injeção**
- [x] Standard (LoadLibrary)
- [x] Manual Map (stub - futuro)
- [x] Validação de arquitetura (32/64-bit)
- [x] File permissions (UWP)

### **Watcher**
- [x] Monitoramento contínuo
- [x] Detecção de novas instâncias
- [x] Auto-inject
- [x] Status em tempo real

### **Configurações**
- [x] JVM Arguments
- [x] Método de injeção
- [x] Auto-close
- [x] Random Window Title
- [x] Persistência (JSON)

### **FDP Client Loader**
- [x] Seleção de .jar
- [x] Cópia para .fdpclient
- [x] Suporte Lunar/Badlion
- [x] Verificação de duplicatas

### **Interface**
- [x] Dashboard Bento Grid
- [x] Console Logs (terminal)
- [x] Drag & Drop DLL
- [x] Process selector
- [x] Real-time status

---

## 🔐 Segurança

**Importante:** Este software é uma ferramenta de desenvolvimento autorizada. Use apenas em:
- Contextos educacionais
- Testes autorizados
- Desenvolvimento de mods/clients

**Recursos de Segurança:**
- Validação de arquitetura (previne crashes)
- Error handling robusto
- Sandboxing via Tauri
- Sem operações elevadas desnecessárias

---

## 📝 Notas Técnicas

### **Limitações Conhecidas:**

1. **Manual Map Injection:**
   - Não disponível no `dll-syringe` 0.17+
   - Stub adicionado para futura implementação
   - Atualmente usa Standard LoadLibrary

2. **Plataforma:**
   - Windows only (DLL injection é específico do Windows)
   - Linux/macOS: Comandos são no-op

### **Dependências Principais:**

**Frontend:**
- React 18.2
- Tauri API 2.9
- Lucide React (ícones)
- Tailwind CSS 3.4

**Backend:**
- Tauri 2.3
- dll-syringe 0.17
- sysinfo 0.30
- winapi 0.3 (Windows)
- dirs 5.0

---

## 👨‍💻 Desenvolvimento

### **Adicionar Nova Funcionalidade:**

1. **Backend (Rust):**
   ```rust
   // src-tauri/src/main.rs
   #[tauri::command]
   fn minha_funcao() -> Result<String, String> {
       Ok("Sucesso".to_string())
   }

   // Registrar em main():
   .invoke_handler(tauri::generate_handler![
       minha_funcao
   ])
   ```

2. **Frontend (React):**
   ```typescript
   import { invoke } from "@tauri-apps/api/core";

   const result = await invoke<string>("minha_funcao");
   ```

### **Estilização:**

Use classes Tailwind ou custom classes do `index.css`:
```tsx
<div className="bento-card glass">
  <div className="accent-gradient">...</div>
</div>
```

---

## 🎯 Checklist de Features Portadas

- [x] Process finding (GetProcId)
- [x] DLL injection (performInjection)
- [x] File permissions (SetAccessControl)
- [x] Watcher loop
- [x] Config save/load
- [x] JAR copying (FDP Loader)
- [x] Architecture validation (NOVO)
- [x] Custom process toggle
- [x] JVM Arguments
- [x] Injection method selection
- [x] Auto-close
- [x] Random window title
- [x] Hide to tray (removido - Tauri não precisa)
- [x] Console logs (terminal UI)
- [x] Badlion/Lunar client support

---

## 📦 Build Final

O executável final (`yzy-injector.exe`) é:
- **Tamanho:** ~15MB (otimizado com LTO)
- **Dependências:** WebView2 (instalado automaticamente)
- **Performance:** Nativa (Rust + hardware acceleration)
- **Portável:** Sim (single .exe)

---

## 🌟 Créditos

- **Código Original:** opZywl
- **UWP File Permissions:** Wunkolo (UWPDumper)
- **Design Inspiração:** LiquidLauncher
- **Stack:** Tauri, Rust, React, Tailwind

---

## 📞 Suporte

- **GitHub:** [opZywl/YZYInjector](https://github.com/opZywl)
- **Issues:** Use GitHub Issues para reportar bugs
- **Contribuições:** Pull Requests são bem-vindos!

---

**Versão:** 2.0.0
**Data:** Janeiro 2025
**Licença:** GPL-3.0
