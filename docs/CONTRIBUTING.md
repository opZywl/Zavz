# Contributing to Zavz

Thank you for your interest in contributing to Zavz! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- **Node.js** 18 or higher
- **Rust** nightly-2026-01-14
- **Yarn** package manager
- **Windows** (for building the application)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/YZYInjector.git
cd YZYInjector
```

2. Install frontend dependencies:
```bash
yarn install
```

3. Install Rust toolchain:
```bash
rustup toolchain install nightly-2026-01-14
rustup default nightly-2026-01-14
rustup component add rustfmt clippy
```

4. Run in development mode:
```bash
yarn tauri dev
```

## Code Style

### TypeScript/React

We use **ESLint** and **Prettier** for code formatting and linting.

**Run linting:**
```bash
yarn lint          # Check for issues
yarn lint:fix      # Auto-fix issues
yarn format        # Format all files
yarn format:check  # Check formatting
```

**Key rules:**
- Use functional components with hooks
- Prefer `const` over `let`
- Use TypeScript types (avoid `any`)
- Follow React Hooks rules
- Use destructuring where appropriate

**Example:**
```typescript
// ✅ Good
export function MyComponent({ title, onSubmit }: Props) {
  const [value, setValue] = useState('');

  const handleClick = useCallback(() => {
    onSubmit(value);
  }, [value, onSubmit]);

  return <button onClick={handleClick}>{title}</button>;
}

// ❌ Bad
export function MyComponent(props: any) {
  let value = '';

  function handleClick() {
    props.onSubmit(value);
  }

  return <button onClick={handleClick}>{props.title}</button>;
}
```

### Rust

We use **Rustfmt** and **Clippy** for Rust code.

**Run formatting and linting:**
```bash
cd src-tauri
cargo fmt --all        # Format code
cargo clippy --all-targets  # Run linter
```

**Key rules:**
- Use explicit error types (`Result<T, String>`)
- Prefer explicit lifetimes when needed
- Use `?` operator for error propagation
- Add documentation comments for public APIs
- Avoid `unwrap()` in production code

**Example:**
```rust
// ✅ Good
pub fn validate_dll_path(path: &str) -> Result<PathBuf, String> {
    let path_buf = PathBuf::from(path);

    if !path_buf.exists() {
        return Err(format!("DLL file not found: {}", path));
    }

    Ok(path_buf)
}

// ❌ Bad
pub fn validate_dll_path(path: &str) -> PathBuf {
    let path_buf = PathBuf::from(path);
    assert!(path_buf.exists());  // ❌ Will panic
    path_buf
}
```

## Component Guidelines

### UI Components

Create reusable components in `src/components/ui/`:

```typescript
// src/components/ui/MyComponent.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface MyComponentProps {
  title: string;
  onClick?: () => void;
  className?: string;
}

export function MyComponent({ title, onClick, className = '' }: MyComponentProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-lg p-4 bg-white/5 ${className}`}
      onClick={onClick}
    >
      <h3>{title}</h3>
    </motion.div>
  );
}
```

### Custom Hooks

Create hooks in `src/hooks/`:

```typescript
// src/hooks/useMyFeature.ts
import { useState, useCallback } from 'react';

export function useMyFeature(initialValue: string) {
  const [value, setValue] = useState(initialValue);

  const updateValue = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  return { value, updateValue };
}
```

## Testing

### Frontend Tests (Coming Soon)

```bash
yarn test          # Run tests
yarn test:watch    # Watch mode
yarn test:coverage # Coverage report
```

### Backend Tests

```bash
cd src-tauri
cargo test
```

## Commit Messages

We follow **Conventional Commits** for clear commit history:

```
<type>(<scope>): <subject>

<body>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(ui): add drag and drop for DLL files

Implemented DragDropZone component with visual feedback
when dragging DLL files over the injection area.
```

```
fix(injection): handle process access denied error

Added proper error handling when trying to inject into
protected processes, with user-friendly error message.
```

## Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make your changes** following the code style

3. **Run linting and formatting**:
   ```bash
   yarn lint:fix
   yarn format
   cd src-tauri && cargo fmt && cargo clippy
   ```

4. **Test your changes** thoroughly

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

6. **Push and create a PR**:
   ```bash
   git push origin feat/my-feature
   ```

7. **Fill out the PR template** with:
   - Description of changes
   - Related issue number (if any)
   - Screenshots (for UI changes)
   - Testing performed

## Code Review

All PRs require at least one approval before merging. Reviewers will check:

- ✅ Code follows style guidelines
- ✅ No linting errors
- ✅ Tests pass (when applicable)
- ✅ Changes are well-documented
- ✅ No security vulnerabilities introduced
- ✅ Performance impact is acceptable

## Project Structure

When adding new files, follow the existing structure:

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── [Feature]Modal.tsx  # Feature-specific modals
├── hooks/            # Custom React hooks
├── contexts/         # React Context providers
├── utils/            # Utility functions
└── types/            # TypeScript type definitions
```

## Documentation

- Update README.md for user-facing changes
- Update ARCHITECTURE.md for architectural changes
- Add JSDoc comments for complex functions
- Update CHANGELOG.md (maintained by maintainers)

## Questions?

If you have questions, feel free to:
- Open an issue with the `question` label
- Join our Discord community
- Check existing documentation in `/docs`

Thank you for contributing! 🎉
