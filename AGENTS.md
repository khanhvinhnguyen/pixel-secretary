# Repository Guidelines

## Mandatory workflow

Before implementing any code, always read:

- `memory-bank/product-requirements-document.md`
- `memory-bank/tech-stack.md`
- `memory-bank/implementation-plan.md`
- `memory-bank/progress.md`
- `memory-bank/architecture.md`

Only implement one step from `implementation-plan.md` at a time.

Do not start the next step until the user confirms validation passed.

After implementation, report:

1. What changed
2. Files changed
3. How to validate manually
4. Known limitations

Do not update `progress.md` until the user confirms validation passed.

After validation passes, update:

- `memory-bank/progress.md`
- `memory-bank/architecture.md`

Do not over-engineer. Prioritize the MVP.

## Project Structure & Module Organization

This repository is currently in the planning stage. Project context lives in `memory-bank/`:

- `memory-bank/product-requirements-document.md`: MVP product intent for a local-first desktop todo assistant.
- `memory-bank/tech-stack.md`: stack selection notes and constraints.
- `memory-bank/architecture.md`, `implementation-plan.md`, `progress.md`: placeholders for design, task breakdown, and delivery tracking.

When implementation begins, keep app source in a dedicated top-level directory such as `src/`, tests in `tests/` or colocated `*.test.*` files, and static pixel art/assets in `assets/`.

## Build, Test, and Development Commands

No build system is present yet. Add commands to the chosen package manager or task runner as soon as code is introduced. Expected examples:

- `npm install`: install desktop app dependencies.
- `npm run dev`: run the local development build.
- `npm test`: run automated tests.
- `npm run lint`: run formatting and static checks.

Document any added commands in the README and keep this file updated.

## Coding Style & Naming Conventions

Prefer small, focused modules organized by feature: tasks, reminders, storage, popup UI, and pixel assistant UI. Use descriptive names such as `ReminderScheduler`, `TaskStore`, and `TodayPopup`. Keep local-first persistence code isolated from UI components so storage can be tested independently.

Use the formatter and linter configured by the implementation stack. Until tooling exists, use 2-space indentation for JavaScript/TypeScript/JSON and concise Markdown with sentence-case headings.

## Testing Guidelines

Add tests for reminder scheduling, deadline handling, local database operations, and offline behavior before broad UI polish. Use deterministic clocks or fake timers for reminder tests. Name tests after behavior, for example `reminds user when task deadline arrives`.

## Commit & Pull Request Guidelines

This directory is not currently a Git repository, so no project-specific commit history exists. Once Git is initialized, use short imperative commit messages, for example `Add local task storage` or `Implement daily popup`.

Pull requests should include a brief summary, test results, linked issue or task, and screenshots or short clips for popup, speech bubble, and pixel-character UI changes.

## Security & Configuration Tips

Keep the app offline-capable and avoid external services for MVP reminders or storage. Do not commit local database files, generated logs, credentials, or machine-specific configuration.
