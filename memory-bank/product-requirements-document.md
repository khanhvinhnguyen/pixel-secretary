# Product requirements document

## Product name

Pixel Secretary

## Product summary

Pixel Secretary is a local-first desktop todo and reminder app. The app acts like a small office assistant on the user's computer. It helps the user plan daily tasks, view today's schedule at startup, and receive reminders through a pixel character with speech bubbles.

## Target user

The target user is an individual who wants a lightweight desktop task reminder system that feels more personal and playful than a standard todo app.

## MVP goal

Build a working desktop MVP in 2-3 weeks with the following capabilities:

- Create, edit, delete, and complete tasks.
- Store all data locally on the user's machine.
- Work without internet connection.
- Show today's tasks in a startup popup.
- Remind the user when a task is due.
- Display reminders through a pixel office character and neobrutalism speech bubble UI.

## Core features

### 1. Task management

Users can create tasks with:

- Title
- Optional description
- Due date
- Due time
- Status: pending, completed, missed
- Created time
- Updated time

Users can:

- View all tasks
- View today's tasks
- Edit task details
- Mark tasks as completed
- Delete tasks

### 2. Daily startup popup

When the app starts, it shows a centered popup containing today's tasks.

The popup should include:

- Greeting message
- List of today's pending tasks
- Task time, if available
- Button to close popup
- Button to open the main task window

### 3. Reminder system

When a task reaches its due time, the app should notify the user.

MVP reminder behavior:

- Show a small reminder popup or speech bubble.
- Display the task title.
- Allow the user to mark the task as done.
- Allow the user to dismiss the reminder.

### 4. Pixel character assistant

The app includes a pixel-style office character.

MVP character behavior:

- Character can be male or female.
- Character appears near the reminder bubble.
- Character is static in MVP.
- Character can display simple speech bubble messages.

Advanced animations are out of scope for MVP.

### 5. Neobrutalism UI

The app uses a neobrutalism visual style:

- Strong black borders
- Hard shadows
- Flat colors
- High-contrast cards and buttons
- Simple, bold layout
- Speech bubbles and popups should follow the same style

### 6. Local-first storage

The app must store data locally.

Requirements:

- No account required.
- No internet required.
- No cloud sync in MVP.
- Data persists after app restart.
- Local database files must not be committed to Git.

## Non-goals for MVP

The MVP will not include:

- Cloud sync
- Team collaboration
- Login/register
- Mobile app
- AI-generated tasks
- Calendar integration
- Complex character animation
- Marketplace or themes
- Multi-device sync

## Success criteria

The MVP is successful when:

- User can create a task.
- Task is saved locally.
- Task remains after app restart.
- Today's tasks appear on app startup.
- Reminder appears when task due time arrives.
- Pixel character and speech bubble are visible.
- App can run offline.