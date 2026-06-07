# Tech stack

## Recommended stack

Use the following stack for the MVP:

- Tauri
- React
- TypeScript
- SQLite
- Tailwind CSS
- Vite
- Vitest

## Reasoning

### Tauri

Tauri is preferred over Electron because the app should be lightweight. The product is a small desktop assistant and does not need the heavier runtime cost of Electron.

### React

React is suitable for building the task dashboard, startup popup, reminder bubble, and pixel assistant UI.

### TypeScript

TypeScript should be used to keep task models, reminder logic, and storage access predictable and maintainable.

### SQLite

SQLite is suitable for local-first persistence. It allows the app to store tasks directly on the user's machine and work offline.

### Tailwind CSS

Tailwind CSS is suitable for quickly building a neobrutalism UI system with reusable utility classes.

### Vitest

Vitest should be used for unit tests, especially for task logic, date handling, and reminder scheduling.

## Architecture direction

The codebase should separate:

- UI components
- Task domain logic
- Reminder scheduling logic
- Local database access
- App shell and desktop integration
- Pixel assistant presentation

## Suggested module groups

- `tasks`: task model, task validation, task CRUD behavior
- `storage`: SQLite access and persistence
- `reminders`: due-time checking and reminder scheduling
- `ui`: reusable neobrutalism components
- `assistant`: pixel character and speech bubble components
- `app`: main screens and layout

## Constraints

- The app must work offline.
- The app must not require user login.
- Do not add cloud services in MVP.
- Do not add external APIs in MVP.
- Avoid unnecessary dependencies.
- Ask before adding major production dependencies.