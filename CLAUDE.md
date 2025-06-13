# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cascade-I18n is a monorepo for a comprehensive, scalable internationalization (i18n) platform. It uses pnpm workspaces to manage multiple apps and packages.

## Architecture

The project follows a modular architecture with:

### Apps (`apps/`)
- **`api`**: Node.js server exposing RESTful API for platform data management
- **`web`**: React SPA providing UI for translators and project managers  
- **`cli`**: Command-line tool for developers to manage i18n projects

### Packages (`packages/`)
- **`@cascade-i18n/core`**: Framework-agnostic i18n engine used by all SDKs
- **`@cascade-i18n/react`**: React SDK for integrating i18n into React applications
- **`@cascade-i18n/vue`**: Vue SDK (in development)

## Common Commands

### Development
```bash
# Install dependencies (from root)
npm install

# Build all packages
npm run build

# Lint all packages  
npm run lint

# Run API server in dev mode
cd apps/api && npm run dev

# Run web app in dev mode
cd apps/web && npm run dev

# Build individual apps
cd apps/api && npm run build
cd apps/web && npm run build
cd apps/cli && npm run build
```

### Package Development
```bash
# Build core package
cd packages/core && npm run build

# Build React SDK
cd packages/react && npm run build
```

## Data Flow

1. Developers use CLI/Web Dashboard to upload translations
2. API stores files in Object Storage and updates manifest.json
3. SDKs initialize Core Service in user applications
4. Core Service fetches manifest.json and translation files from Object Storage
5. Translations are merged and delivered to applications

## Infrastructure Components

- **Database**: PostgreSQL for application data
- **Cache**: Redis for API performance
- **Object Storage**: S3-compatible storage for manifest.json and translation files