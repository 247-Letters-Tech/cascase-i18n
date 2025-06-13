# Cascade-I18n: System Architecture

This document outlines the high-level architecture of the Cascade-I18n platform, detailing how the different packages and services interact.

## 1. Architectural Principles

-   **Modularity:** The system is divided into independent packages (`apps` and `packages`) to promote separation of concerns and reusability.
-   **Scalability:** The architecture is designed to scale horizontally, with a stateless API and a distributed cache.
-   **Extensibility:** The platform is built to be extended with new SDKs, integrations, and features.

## 2. System Diagram

```mermaid
graph TD
    subgraph "User Interfaces"
        CLI_App[CLI App]
        Web_Dashboard[Web Dashboard]
        User_App[User Application]
    end

    subgraph "SDKs"
        React_SDK[@cascade-i18n/react]
        Vue_SDK[@cascade-i18n/vue]
        Flutter_SDK[@cascade-i18n/flutter]
    end

    subgraph "Core Services"
        Core_Service[@cascade-i18n/core]
        API_Service[API Server]
    end

    subgraph "Backend Infrastructure"
        Database[(Database)]
        Cache[(Redis Cache)]
        Object_Storage[Object Storage (S3)]
    end

    User_App -- "Uses" --> React_SDK
    CLI_App -- "Interacts with" --> API_Service
    Web_Dashboard -- "Interacts with" --> API_Service
    React_SDK -- "Depends on" --> Core_Service
    Vue_SDK -- "Depends on" --> Core_Service
    Core_Service -- "Fetches translations from" --> Object_Storage
    API_Service -- "Manages data in" --> Database
    API_Service -- "Uses" --> Cache
```

## 3. Component Breakdown

### 3.1. Applications (`apps/`)

-   **`web`**: A React-based single-page application that provides the main user interface for translators and project managers. It interacts with the `api` for all data.
-   **`api`**: A Node.js server that exposes a RESTful API for managing all platform data. It is the single source of truth for all content.
-   **`cli`**: A command-line tool for developers to manage their i18n projects.

### 3.2. Packages (`packages/`)

-   **`@cascade-i18n/core`**: The framework-agnostic engine that powers the client-side i18n logic. It is used by all SDKs.
-   **`@cascade-i18n/react`**: The SDK for integrating the i18n service into React applications.

### 3.3. Infrastructure

-   **Database**: A relational database (e.g., PostgreSQL) to store all application data.
-   **Cache**: A Redis cache to improve the performance of the API.
-   **Object Storage**: An S3-compatible object store to hold the `manifest.json` and all translation files.

## 4. Data Flow: Translation Delivery

1.  A developer uses the **CLI** or **Web Dashboard** to upload translation files.
2.  The **API Server** stores the files in **Object Storage** and updates the `manifest.json`.
3.  A user loads a web application that uses one of the **SDKs**.
4.  The **SDK** initializes the **Core Service**.
5.  The **Core Service** fetches the `manifest.json` from **Object Storage**.
6.  When a translation is needed, the **Core Service** fetches the required translation files from **Object Storage**, merges them using the [Patch Layer Model](./cascade-i18n-spec.md#2--patch-layer-model-merge-order), and returns the result.

## 5. Related Documentation

For detailed technical specifications including API references, CLI commands, and enterprise features, see the [Complete System Specification](./cascade-i18n-spec.md). 