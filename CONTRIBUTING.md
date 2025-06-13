# Contributing to Cascade-I18n

Thank you for your interest in contributing to the Cascade-I18n platform. As a private project, our contribution process is focused on internal team collaboration. This guide outlines the standards and procedures to ensure our codebase remains clean, consistent, and high-quality.

## 1. Development Workflow

1.  **Pick a Task:** Assign yourself a task from the project board or the [TODO list](./docs/TODO.md).
2.  **Create a Branch:** Create a new branch from `main` with a descriptive name (e.g., `feat/add-vue-sdk` or `fix/login-bug`).
3.  **Develop:** Write your code, following the guidelines below.
4.  **Test:** Add or update tests for your changes.
5.  **Submit a Pull Request:** Push your branch and open a pull request against `main`. Provide a clear description of your changes.

## 2. Coding Standards

-   **Code Style:** We use Prettier for automatic code formatting. Please ensure it is set up in your editor.
-   **Linting:** We use ESLint to catch common errors. Run `npm run lint` before committing your changes.
-   **TypeScript:** Follow best practices for TypeScript. Use strong types and avoid `any` where possible.
-   **Commit Messages:** Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## 3. Guidelines for Human Developers

-   **Communication:** Clearly communicate your progress and any roadblocks in the relevant project management ticket.
-   **Code Reviews:**
    -   All pull requests require at least one approval from another team member.
    -   Provide constructive feedback during reviews. Focus on the code, not the person.
    -   Be thorough in your own testing before requesting a review.
-   **Documentation:** Update all relevant documentation (e.g., [PRD](./docs/product-requirements.md), [tech specs](./docs/technical-specification.md), JSDoc comments) as part of your pull request.

## 4. Guidelines for AI Agents/Developers

AI agents are a valuable part of our team. To ensure effective collaboration, all AI-generated contributions must adhere to the following:

-   **Tool Usage:**
    -   When making code changes, always use the available file editing tools. Do not output raw code in your messages.
    -   Before using a tool, provide a clear, one-sentence explanation of why you are using it.
-   **Validation:**
    -   Before submitting a change, validate it against the user rules provided in your instructions.
    -   Verify that your changes have not introduced any linter errors. If they have, attempt to fix them before completing your task.
-   **Clarity:**
    -   Clearly state your plan before making changes.
    -   When your work is complete, provide a concise summary of what you have accomplished.

By following these guidelines, we can ensure a smooth and productive development process for the entire team, both human and AI. 