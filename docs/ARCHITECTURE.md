# Zavz Architecture Documentation

## Overview

Zavz is a modern desktop application built with **Tauri v2**, combining a React frontend with a Rust backend. This architecture provides native performance with a modern web UI.

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hot Toast** - Toast notifications
- **Vite** - Build tool and dev server

### Backend
- **Rust (nightly-2026-01-14)** - System programming language
- **Tauri v2.3** - Desktop application framework
- **Windows API** - Direct system integration
- **Tokio** - Async runtime

### Development Tools
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Clippy** - Rust linting
- **Rustfmt** - Rust formatting
- **GitHub Actions** - CI/CD automation

## Project Structure

```
YZYInjector/
├── src/                        # Frontend (React/TypeScript)
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── DragDropZone.tsx
│   │   ├── InjectionModal.tsx
│   │   ├── SettingsModal.tsx
│   │   └── [other modals]
│   ├── hooks/                # Custom React hooks
│   │   ├── useTheme.ts
│   │   ├── useLogger.ts
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   ├── contexts/             # React Context providers
│   │   └── AppContext.tsx
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
│
├── src-tauri/                 # Backend (Rust)
│   ├── src/
│   │   ├── main.rs          # Tauri setup and commands
│   │   ├── injector.rs      # Core injection logic
│   │   ├── injection_method.rs
│   │   ├── thread_hijack.rs
│   │   ├── reflective.rs
│   │   ├── manual_map.rs
│   │   └── ffi_bridge.rs
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri configuration
│
├── .github/workflows/         # CI/CD pipelines
│   ├── lint.yml
│   ├── build.yml
│   └── release.yml
│
├── docs/                      # Documentation
│   └── ARCHITECTURE.md
│
├── .eslintrc.cjs             # ESLint configuration
├── .prettierrc.json          # Prettier configuration
├── rustfmt.toml              # Rustfmt configuration
├── .clippy.toml              # Clippy configuration
└── package.json              # Node.js dependencies
```

## Architecture Patterns

### Frontend Architecture

#### Component Hierarchy
```
App
├── AppProvider (Context)
│   ├── Header
│   ├── Modals
│   │   ├── InjectionModal
│   │   ├── SettingsModal
│   │   ├── ThemeModal
│   │   └── [other modals]
│   └── Console/Logs
```

#### State Management
- **Context API**: Global state via `AppContext`
  - Theme management
  - Logger/toast notifications
  - User preferences (nickname, etc.)
- **Local State**: Component-specific state with `useState`
- **LocalStorage**: Persistent settings via `useLocalStorage` hook

#### Custom Hooks

##### `useTheme`
- Manages application theming
- Provides 10 preset themes
- Supports custom color schemes
- Persists to localStorage
- Applies CSS custom properties

##### `useLogger`
- Centralized logging system
- Multiple log levels (info, success, warning, error)
- Integrates with react-hot-toast
- Returns log history

##### `useLocalStorage`
- Type-safe localStorage wrapper
- Automatic JSON serialization
- Error handling
- React state integration

### Backend Architecture

#### Tauri Commands
Tauri commands are exposed Rust functions callable from the frontend:

```rust
#[tauri::command]
async fn inject_dll(
    dll_path: String,
    process_name: String,
    method: String
) -> Result<(), String>
```

Commands are registered in `main.rs` and called from React using:

```typescript
import { invoke } from '@tauri-apps/api/core';
await invoke('inject_dll', { dllPath, processName, method });
```

#### Module Organization

- **main.rs**: Tauri setup, command handlers, settings management
- **injector.rs**: High-level injection orchestration
- **injection_method.rs**: Injection technique enum
- **thread_hijack.rs**: Thread hijacking implementation
- **reflective.rs**: Reflective DLL injection
- **manual_map.rs**: Manual PE mapping (partial)

## Data Flow

### Injection Flow
```
User Action (Frontend)
    ↓
React Component
    ↓
invoke('inject_dll')
    ↓
Tauri Command Handler
    ↓
Injector Module
    ↓
Specific Injection Technique
    ↓
Windows API Calls
    ↓
Success/Error Response
    ↓
Toast Notification + Log Entry
```

### Settings Flow
```
User Changes Setting
    ↓
React State Update
    ↓
useLocalStorage Hook
    ↓
localStorage.setItem()
    ↓
Optional: Tauri Command (for backend settings)
    ↓
Save to ~/.config/Zavz/settings.json
```

## Communication Layer

### Frontend → Backend
- **Tauri Commands**: Type-safe RPC-style calls
- **Events**: (Future) Event-based communication for async updates

### Backend → Frontend
- **Return Values**: Command responses
- **Events**: (Future) Push notifications from backend

## Styling System

### CSS Architecture
- **Tailwind Utility Classes**: Primary styling method
- **CSS Custom Properties**: Dynamic theming
  - `--color-primary`
  - `--color-background`
  - `--color-card-bg`
  - `--color-text`
- **Glassmorphism**: `backdrop-blur` effects
- **Framer Motion**: Declarative animations

### Theme System
Themes are applied by updating CSS variables:
```typescript
document.documentElement.style.setProperty('--color-primary', theme.primary);
```

## Build Process

### Development
```bash
yarn dev          # Frontend dev server (Vite)
yarn tauri dev    # Full app with hot reload
```

### Production
```bash
yarn build        # Build frontend
yarn tauri build  # Build full application
```

### Optimization
- **Frontend**: Vite production build (minification, tree-shaking)
- **Backend**: Rust release profile with LTO, size optimization
- **Bundle**: Single .exe with embedded WebView2

## CI/CD Pipeline

### Lint Workflow
- Runs on push/PR to main/develop
- Frontend: ESLint + Prettier + TypeScript check
- Backend: Clippy + Rustfmt

### Build Workflow
- Builds application on Windows
- Uploads artifacts
- Matrix strategy for future multi-platform support

### Release Workflow
- Triggered on version tags (v*.*.*)
- Creates GitHub release
- Uploads installers (MSI, NSIS)

## Security Considerations

### Sandboxing
Tauri provides better sandboxing than Electron by:
- Using native WebView2 instead of bundled Chromium
- Restricted IPC (only exposed commands callable)
- No Node.js in frontend context

### CSP
Content Security Policy is currently disabled (`csp: null`) in tauri.conf.json for development flexibility.

**Recommendation**: Enable CSP for production:
```json
"csp": "default-src 'self'; script-src 'self'"
```

## Performance Optimization

### Frontend
- **Code Splitting**: Vite dynamic imports
- **Lazy Loading**: React.lazy for heavy components
- **Memoization**: useMemo/useCallback for expensive computations
- **Virtual Scrolling**: (Future) For large process lists

### Backend
- **Async I/O**: Tokio for non-blocking operations
- **Zero-cost Abstractions**: Rust performance benefits
- **Minimal Dependencies**: Careful crate selection

## Error Handling

### Frontend
```typescript
try {
  await invoke('inject_dll', params);
  success('Injection successful');
} catch (error) {
  error(`Injection failed: ${error}`);
}
```

### Backend
```rust
pub fn inject() -> Result<(), String> {
    // Operation
    .map_err(|e| format!("Detailed error: {:?}", e))
}
```

## Future Improvements

### Planned Features
- [ ] Plugin system for extensibility
- [ ] Multi-language support (i18n)
- [ ] Settings sync across devices
- [ ] Advanced process monitoring
- [ ] Injection profiles/presets

### Technical Debt
- Complete manual map injection implementation
- Add comprehensive unit tests
- Improve error message specificity
- Add backend integration tests

## Resources

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [React Documentation](https://react.dev/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Tailwind CSS](https://tailwindcss.com/)
