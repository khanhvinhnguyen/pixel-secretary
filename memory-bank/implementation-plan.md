# Implementation plan

## Step 1: Initialize desktop app project

Goal:
Set up a Tauri + React + TypeScript desktop app.

Tasks:
- Initialize the project.
- Confirm the app runs locally.
- Add basic project scripts.
- Add initial README if missing.

Validation:
- `npm install` works.
- `npm run dev` or equivalent works.
- Desktop app window opens successfully.
- No task feature is required in this step.

Do not start Step 2 until validation passes.

## Step 2: Add base UI system

Goal:
Create the initial neobrutalism UI foundation.

Tasks:
- Add global styles.
- Add base layout.
- Add reusable UI primitives:
  - Button
  - Card
  - Popup container
  - Speech bubble
- Use strong black borders, hard shadows, and high-contrast layout.

Validation:
- App shows a basic screen using the neobrutalism style.
- Button, card, popup, and speech bubble can be visually checked.
- No database feature is required in this step.

Do not start Step 3 until validation passes.

## Step 3: Define task model and local storage

Goal:
Create the task data model and local persistence layer.

Tasks:
- Define task type/model.
- Set up SQLite local database.
- Create task table.
- Add basic storage functions:
  - Create task
  - Read tasks
  - Update task
  - Delete task

Validation:
- A sample task can be inserted.
- Tasks can be read from local storage.
- Data persists after app restart.
- UI polish is not required in this step.

Do not start Step 4 until validation passes.

## Step 4: Build task CRUD screen

Goal:
Allow the user to manage tasks from the app UI.

Tasks:
- Create task list screen.
- Create task form.
- Add create task flow.
- Add edit task flow.
- Add delete task flow.
- Add mark-as-completed flow.

Validation:
- User can create a task.
- User can edit a task.
- User can delete a task.
- User can mark a task as completed.
- Changes persist after restart.

Do not start Step 5 until validation passes.

## Step 5: Build today's tasks startup popup

Goal:
Show today's pending tasks when the app starts.

Tasks:
- Query pending tasks due today.
- Create startup popup.
- Show task title and due time.
- Add close button.
- Add open main window button if needed.

Validation:
- When app starts, today's tasks appear in a centered popup.
- Completed tasks do not appear as pending tasks.
- Popup can be closed.

Do not start Step 6 until validation passes.

## Step 6: Build reminder scheduler

Goal:
Notify the user when a task reaches its due time.

Tasks:
- Add reminder checking logic.
- Detect pending tasks whose due time has arrived.
- Show reminder popup or speech bubble.
- Allow dismissing reminder.
- Allow marking task as completed from reminder.

Validation:
- Create a task due within 1-2 minutes.
- Reminder appears at the correct time.
- User can dismiss the reminder.
- User can mark the task as completed.
- Reminder does not repeatedly spam after dismissal.

Do not start Step 7 until validation passes.

## Step 7: Add pixel character assistant

Goal:
Add the pixel office assistant to reminder UI.

Tasks:
- Add placeholder pixel character asset or CSS placeholder.
- Add male/female character option if simple.
- Display character beside speech bubble.
- Keep animation minimal or static for MVP.

Validation:
- Pixel character appears with reminder bubble.
- UI remains readable.
- Character does not block core task actions.

Do not start Step 8 until validation passes.

## Step 8: MVP polish and offline verification

Goal:
Clean up the MVP and verify local-first behavior.

Tasks:
- Check offline behavior.
- Check app restart behavior.
- Review empty states.
- Review error states.
- Clean up code structure.
- Update architecture.md.
- Update README.

Validation:
- App works without internet.
- Tasks persist after restart.
- Main flows are usable.
- No obvious UI breakage.
- README explains how to run the app.