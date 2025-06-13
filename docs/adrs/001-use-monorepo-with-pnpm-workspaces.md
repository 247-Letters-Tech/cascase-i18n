# 1. Use Monorepo with pnpm Workspaces for Project Structure

-   **Status:** Accepted
-   **Date:** 2024-08-01

## Context

The Cascade-I18n project needs to support multiple packages and applications, including a `core` logic library, framework-specific SDKs (`react`, `vue`), a `cli`, a `web` dashboard, and an `api`. As these packages and apps are tightly coupled and will often be developed in tandem, we need a repository structure that facilitates easy cross-package development, dependency management, and versioning.

## Decision

We will adopt a monorepo architecture using pnpm workspaces.

The project structure will be organized as follows:

-   `apps/`: Contains deployable applications (e.g., `web`, `api`, `cli`).
-   `packages/`: Contains reusable libraries/SDKs (e.g., `core`, `react`, `vue`).
-   `docs/`: Contains all project documentation.
-   `infrastructure/`: Contains infrastructure-as-code (e.g., Terraform, database schemas).

This structure allows for a single `pnpm-lock.yaml` file, streamlined dependency management, and simplified local development, as changes in one package are immediately available to others within the workspace.

## Consequences

### Positive

-   **Simplified Dependency Management:** A single `pnpm install` at the root installs dependencies for all packages.
-   **Improved Developer Experience:** Facilitates atomic commits and pull requests that span multiple packages.
-   **Code Sharing:** Makes it trivial to share code and types between packages.
-   **Consistent Tooling:** Allows for centralized configuration of tools like TypeScript, ESLint, and Prettier.

### Negative

-   **Increased Complexity:** The initial setup is more complex than a single-package repository.
-   **Tooling Overhead:** Requires familiarity with pnpm workspaces and monorepo-aware tooling.
-   **Coupling Risk:** While packages are distinct, there is a higher risk of creating tightly coupled code if boundaries are not respected. 