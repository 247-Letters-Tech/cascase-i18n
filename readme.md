# Cascade-I18n

A comprehensive, scalable, and developer-friendly internationalization (i18n) platform designed for modern applications. Supports advanced features like cascading translations, dialect switching, persona-based localization, and AI-powered translation assistance.

## Features

- 🌍 **Advanced Localization**: Support for pure and mixed-code variants (e.g., Tamil + Tanglish)
- 🎭 **Multi-dimensional Personalization**: Customize by persona, mode/tone, geography, dialect, and context
- 🔄 **Runtime Dialect Switching**: Switch dialects with visual preview without reloading
- 🤖 **AI Integration**: LLM-powered translation suggestions and automated gap filling
- 📦 **Modular Architecture**: Framework-agnostic core with dedicated SDKs
- 🚀 **Enterprise Ready**: Built for scale with caching, CDN support, and observability

## Architecture

### Monorepo Structure

#### Apps (`apps/`)
- **`api`**: Node.js REST API server for translation management
- **`web`**: React dashboard for translators and project managers  
- **`cli`**: Command-line tool for developers

#### Packages (`packages/`)
- **`@cascade-i18n/core`**: Framework-agnostic i18n engine
- **`@cascade-i18n/react`**: React SDK with hooks and components
- **`@cascade-i18n/vue`**: Vue SDK (in development)

### Patch Layer Model

Translations are merged in this order for maximum flexibility:
```
module → persona → mode → geography → dialect → goal → AI patch → hot-fix
```

## Quick Start

### Installation

```bash
git clone <repository-url>
cd cascade-i18n
npm install
```

### Development

```bash
# Build all packages
npm run build

# Lint all packages
npm run lint

# Run API server
cd apps/api && npm run dev

# Run web dashboard
cd apps/web && npm run dev
```

### Usage

```typescript
import { initI18n, applyPatches } from '@cascade-i18n/core';
import { useTranslation } from '@cascade-i18n/react';

// Initialize with language and persona
await initI18n('ta-tg', config, 'student', 'zen');

// Apply additional context patches
await applyPatches('ta-tg', 'student', 'zen', { goal: 'web-dev' });

// Use in React components
function MyComponent() {
  const { t, switchDialect } = useTranslation();
  
  return (
    <div>
      <h1>{t('roadmap.create_goal')}</h1>
      <button onClick={() => switchDialect('ta-tg_kongu')}>
        Switch to Kongu Tamil
      </button>
    </div>
  );
}
```

## Documentation

📚 **[Complete Documentation Index](./docs/index.md)** - Full documentation guide

**Quick Links:**
- 🚀 [Getting Started](./docs/getting-started.md) - Step-by-step setup guide
- 🏗️ [Architecture Guide](./docs/architecture.md) - System design and data flow
- 🤝 [Contributing Guide](./CONTRIBUTING.md) - Development workflow and standards
- 📋 [Project Status](./docs/status.md) - Current development state

## Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) for development workflow, coding standards, and guidelines for both human and AI developers.

## License

This project is privately maintained. Please contact the team for licensing information. 