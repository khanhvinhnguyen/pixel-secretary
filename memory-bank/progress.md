# Progress

## Current status

Project name: Pixel Secretary

Current phase: Early desktop MVP setup

The project has been initialized as a Tauri + React + TypeScript desktop app. The current product direction is a local-first desktop todo companion with a pixel office secretary, Neobrutalism UI, reminder bubbles, and offline local storage.

## Completed

### Project direction

* Product concept defined: desktop todo companion with pixel secretary.
* MVP scope defined.
* Local-first and offline-first constraints confirmed.
* Mobile app removed from MVP scope.
* Cloud sync removed from MVP scope.
* AI runtime removed from MVP scope.
* Desktop-first direction confirmed.

### Technical direction

* Tauri selected as the desktop shell.
* React selected for UI.
* TypeScript selected for app logic.
* SQLite selected as intended local database.
* Vite selected as frontend build tool.
* Vitest selected for future unit tests.
* Tailwind CSS selected as intended styling utility, but not necessarily installed yet.

### Current package setup

The current package uses:

* React
* React DOM
* TypeScript
* Vite
* Tauri CLI
* Tauri API

Current scripts include:

```json
{
  "dev": "vite --host 127.0.0.1",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "tauri": "tauri",
  "desktop:dev": "PATH=\"$HOME/.cargo/bin:$PATH\" tauri dev",
  "desktop:build": "PATH=\"$HOME/.cargo/bin:$PATH\" tauri build"
}
```

### Desktop shell experiments

The app has already been tested as a desktop companion window.

Confirmed direction:

* Small floating buddy window
* Transparent background
* Frameless window
* Always-on-top behavior
* Desktop companion layout instead of normal app layout

### Checklist/window direction

The checklist should not be rendered inside the small buddy window.

Current decision:

* Buddy should be one small window.
* Checklist/settings should be a separate window.
* Checklist window should be larger, around 70% of screen height.
* Checklist should only show when needed.

### Known platform decision

Desktop is the main platform.

Mobile is not part of MVP because mobile OS restrictions make true floating companion behavior difficult, especially on iOS.

## In progress

### Window behavior

Current focus:

* Stabilize buddy window position.
* Save and restore position locally.
* Prevent off-screen restore when external monitor is disconnected.
* Keep buddy window small, transparent, and always-on-top.
* Keep checklist as a separate window.

Important bug to fix:

```txt
If the app saves a position on an external monitor, then the external monitor is disconnected, the app can reopen off-screen.
```

Required fix:

```txt
On startup:
1. Read saved buddy position.
2. Read currently connected monitors.
3. Validate whether saved position is visible.
4. If valid, restore it.
5. If invalid, reset to bottom-right of primary monitor.
```

## Next immediate tasks

### 1. Finalize desktop window architecture

Tasks:

* Rename main floating window to `buddy` if not already done.
* Add or confirm separate `checklist` window.
* Keep buddy window small and transparent.
* Keep checklist window hidden by default.
* Add open/close/toggle checklist window functions.

Validation:

* Buddy appears on app launch.
* Checklist stays hidden until opened.
* Opening checklist does not hide or move buddy.
* Checklist appears as a large right-side panel.

### 2. Add off-screen recovery

Tasks:

* Validate saved window position on app startup.
* Detect disconnected external monitor case.
* Reset buddy to primary monitor bottom-right if saved position is invalid.
* Add manual "Reset position" action.

Validation:

* Move buddy to external monitor.
* Close app.
* Disconnect external monitor.
* Reopen app.
* Buddy appears on primary monitor instead of disappearing.

### 3. Add basic assistant state system

Tasks:

* Define assistant states:

  * idle
  * noTask
  * reminding
  * completed
  * missed
  * overloaded
  * celebrate
* Map each state to a speech line.
* Render speech bubble based on state.
* Add temporary development controls for switching states.

Validation:

* Developer can preview each assistant state.
* Speech bubble changes by state.
* UI does not break when speech line is empty.

### 4. Replace emoji placeholder with pixel character asset

Tasks:

* Add default female secretary asset.
* Add default male secretary asset later if available.
* Ensure transparent background.
* Use pixelated rendering.
* Keep character size suitable for desktop buddy mode.

Validation:

* Character appears clearly.
* Character does not blur too much.
* Character does not block speech bubble.
* Character fits inside buddy window.

### 5. Add auto-update infrastructure

Tasks:

* Add Tauri updater plugin.
* Add updater frontend binding.
* Generate signing key.
* Add updater config.
* Add placeholder GitHub Releases update endpoint.
* Add manual "Check for updates" UI in settings.
* Do not add payment, login, or cloud sync.

Validation:

* App still runs in dev.
* Build does not break.
* Settings can trigger update check.
* Failed update check does not interrupt user.

## Upcoming MVP tasks

### Task model and storage

Tasks:

* Define `Task` type.
* Define `TaskStatus`.
* Define `TaskRepository` interface.
* Implement local repository.
* Add SQLite database.
* Add migrations.
* Add CRUD functions.

Validation:

* Create task.
* Read task.
* Update task.
* Delete task.
* Complete task.
* Data persists after restart.

### Daily startup popup

Tasks:

* Show today's task popup at startup.
* Allow user to add tasks for today.
* Allow user to start working.
* Hide popup after confirmation.
* Keep buddy visible.

Validation:

* Popup appears on first launch of the day.
* User can add multiple tasks.
* Saved tasks appear in checklist.
* Popup does not reappear unnecessarily after tasks are saved.

### Reminder scheduler

Tasks:

* Check tasks periodically.
* Detect due tasks.
* Show reminder speech bubble.
* Support Done.
* Support Dismiss.
* Prevent reminder spam.

Validation:

* A task due in 1-2 minutes triggers reminder.
* Reminder appears at expected time.
* User can mark task done from reminder.
* Dismissed reminder does not repeat immediately.

### Checklist panel

Tasks:

* Show today's tasks.
* Group tasks by status or time.
* Allow complete/delete/edit actions.
* Add settings tab.
* Add update section.

Validation:

* Checklist opens from buddy.
* Checklist shows task list.
* Checklist closes without closing buddy.
* Checklist remains readable.

## Not started

* SQLite integration
* Tailwind CSS integration
* Vitest setup
* Task CRUD UI
* Reminder engine
* Startup daily task popup
* Real character animation
* Tray/menu bar
* Production updater release flow
* Cloud sync
* Payment
* Login
* Mobile app

## Risks

### 1. Tauri window behavior differs by OS

Risk:
Transparent, frameless, always-on-top, skip taskbar, and multi-window behavior may differ between macOS and Windows.

Mitigation:
Keep window behavior isolated in `desktop/windowManager.ts`.

### 2. Off-screen saved position

Risk:
If user disconnects an external monitor, saved window coordinates may become invalid.

Mitigation:
Validate saved position against current monitors on startup and reset if invalid.

### 3. Reminder spam

Risk:
Reminder scheduler can repeatedly show the same reminder.

Mitigation:
Store reminder dismissed/shown state per task.

### 4. Scope creep

Risk:
Cloud, payment, mobile, AI runtime, and complex animation can delay MVP.

Mitigation:
Keep MVP local-first and desktop-only.

### 5. Character animation complexity

Risk:
Sprite animation can consume too much time.

Mitigation:
Use static character assets first. Add animation after task/reminder flows work.

## Current product rule

The product should remain:

```txt
Desktop-first
Local-first
Offline-first
Small and playful
Useful before it becomes complex
```

## Definition of MVP done

MVP is done when:

* User can create tasks.
* Tasks are stored locally.
* Tasks persist after app restart.
* Today's tasks appear in a startup popup.
* Reminder appears when a task is due.
* Pixel secretary and speech bubble are visible.
* Checklist window opens separately.
* App works offline.
* App can recover from invalid/off-screen saved position.
