# Architecture

## Project overview

Pixel Secretary is a local-first desktop todo and reminder app built with Tauri, React, and TypeScript.

The app behaves like a small desktop assistant rather than a normal productivity dashboard. It shows a pixel office character on the desktop, displays reminders through Neobrutalism speech bubbles, and stores task data locally on the user's machine.

The MVP must work without internet, without login, and without cloud sync.

## Architecture goals

The architecture should support:

* Local-first task storage
* Offline usage
* Desktop companion window behavior
* Separate checklist/settings panel
* Reminder scheduling
* Pixel assistant presentation
* Future auto-update support
* Future optional paid/cloud expansion without rewriting the whole app

## High-level structure

```txt
src/
├─ app/
│  ├─ App.tsx
│  ├─ BuddyApp.tsx
│  ├─ ChecklistApp.tsx
│  └─ routes.ts
│
├─ assistant/
│  ├─ components/
│  │  ├─ PixelAssistant.tsx
│  │  ├─ SpeechBubble.tsx
│  │  └─ BuddyContextMenu.tsx
│  ├─ assistantState.ts
│  ├─ assistantDialogues.ts
│  └─ characterAssets.ts
│
├─ tasks/
│  ├─ task.types.ts
│  ├─ taskRepository.ts
│  ├─ localTaskRepository.ts
│  ├─ taskService.ts
│  └─ taskValidation.ts
│
├─ reminders/
│  ├─ reminderEngine.ts
│  ├─ reminder.types.ts
│  └─ reminderRules.ts
│
├─ storage/
│  ├─ database.ts
│  ├─ migrations.ts
│  └─ localSettings.ts
│
├─ desktop/
│  ├─ windowManager.ts
│  ├─ positionRecovery.ts
│  ├─ checklistWindow.ts
│  └─ tray.ts
│
├─ updater/
│  ├─ updateService.ts
│  └─ UpdatePrompt.tsx
│
├─ ui/
│  ├─ Button.tsx
│  ├─ Card.tsx
│  ├─ Popup.tsx
│  ├─ Tabs.tsx
│  └─ neobrutalism.css
│
└─ shared/
   ├─ date.ts
   ├─ id.ts
   └─ result.ts
```

## Desktop window model

The app should use separate desktop windows instead of putting every feature into one small window.

### Buddy window

The buddy window is the main desktop companion.

Responsibilities:

* Show the pixel assistant.
* Show the speech bubble.
* Show a small checklist/book launcher.
* Handle right-click context menu.
* Stay small, transparent, frameless, and always-on-top.
* Save and restore position locally.
* Recover position if the saved location is off-screen.

Suggested behavior:

```txt
Window label: buddy
Size: around 340x240
Transparent: true
Decorations: false
Always on top: true
Resizable: false
Skipped from taskbar/dock where supported
```

### Checklist window

The checklist window is a separate panel.

Responsibilities:

* Show today's checklist.
* Show settings.
* Show future update controls.
* Stay hidden by default.
* Open only when the user clicks the checklist tab or context menu action.
* Use a larger panel layout, around 70% of screen height.

Suggested behavior:

```txt
Window label: checklist
Width: around 420-520px
Height: around 70% of visible work area
Position: right side of current/primary display
Visible by default: false
Resizable: false for MVP
```

## Local-first storage

The MVP should store all data locally.

Initial options:

* SQLite for production-ready local persistence
* localStorage only for temporary prototypes

Preferred direction:

```txt
UI
→ taskService
→ TaskRepository interface
→ LocalTaskRepository
→ SQLite
```

The UI should not directly depend on SQLite. It should use a repository/service abstraction so future cloud sync can be added without rewriting the UI.

## Task model

```ts
export type TaskStatus = "pending" | "completed" | "missed" | "dismissed";

export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  status: TaskStatus;
  reminderDismissedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

## Repository interface

```ts
export interface TaskRepository {
  createTask(input: CreateTaskInput): Promise<Task>;
  getTaskById(id: string): Promise<Task | null>;
  getAllTasks(): Promise<Task[]>;
  getTodayTasks(date: string): Promise<Task[]>;
  updateTask(id: string, input: UpdateTaskInput): Promise<Task>;
  completeTask(id: string): Promise<Task>;
  deleteTask(id: string): Promise<void>;
}
```

Current MVP implementation:

```txt
LocalTaskRepository
```

Future implementation:

```txt
SyncTaskRepository
CloudTaskRepository
```

## Reminder architecture

The reminder engine should be separated from UI.

Responsibilities:

* Check pending tasks.
* Detect tasks whose due time has arrived.
* Avoid repeated reminder spam.
* Trigger assistant state changes.
* Allow task actions from reminder UI.

Recommended flow:

```txt
timer tick
→ get pending tasks
→ compare due date/time with current time
→ resolve reminder event
→ update assistant state
→ show speech bubble / checklist action
```

The reminder engine should be testable without rendering React components.

## Assistant state model

The assistant should react to task state rather than being hard-coded to one message.

```ts
export type AssistantState =
  | "idle"
  | "noTask"
  | "reminding"
  | "completed"
  | "missed"
  | "overloaded"
  | "celebrate";
```

Example mapping:

```txt
noTask      → no tasks for today
idle        → tasks exist but no urgent reminder
reminding   → task is due soon or now
completed   → user completed a task
missed      → task is overdue
overloaded  → too many tasks today
celebrate   → short state after completing a task
```

The assistant should support temporary state transitions. For example:

```txt
complete task
→ assistant state = celebrate for 3 seconds
→ resolve next state from current tasks
```

## UI system

The MVP UI uses a Neobrutalism style.

Core visual rules:

* Strong black borders
* Hard black shadows
* Flat colors
* Minimal gradients
* High contrast
* Bold typography
* Simple spacing
* Clear action buttons

Reusable UI primitives:

* Button
* Card
* Popup
* Speech bubble
* Panel
* Tabs
* Context menu

## Pixel character system

MVP:

* Use static PNG/WebP assets.
* Support male/female character option if simple.
* Use one pose first if animation is not ready.

Future:

* Character packs
* Sprite sheets
* State-to-animation mapping
* Unlockable skins/outfits

Suggested future character pack format:

```json
{
  "id": "female-secretary-default",
  "displayName": "Female Secretary",
  "description": "Default pixel office secretary",
  "spritesheetPath": "spritesheet.png",
  "states": {
    "idle": 0,
    "reminding": 1,
    "completed": 2,
    "missed": 3,
    "overloaded": 4,
    "celebrate": 5
  }
}
```

## Auto-update direction

The app should include auto-update infrastructure early because the project is still new.

MVP updater scope:

* Manual "Check for updates" action
* Tauri updater plugin
* Signed update artifacts
* Static update manifest endpoint placeholder
* No cloud account required
* No paid feature logic yet

The updater should not silently install updates in MVP. It should ask the user before updating.

## Future cloud expansion

Cloud is not part of MVP.

However, the architecture should avoid blocking future cloud features.

Future cloud features may include:

* Account login
* Multi-device sync
* Paid plan checks
* Cloud backup
* Character packs
* Cross-device task history

To prepare for this, keep domain logic separate from storage implementation.

Do not couple UI directly to local database code.

## Non-goals for MVP architecture

Do not add these in MVP:

* Cloud sync
* Login/register
* Payment
* License server
* Mobile app
* AI-generated task planning
* Calendar integration
* Complex animation engine
* Marketplace system
* Team collaboration
