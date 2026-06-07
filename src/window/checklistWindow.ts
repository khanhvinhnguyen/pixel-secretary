import { emitTo } from "@tauri-apps/api/event";
import {
  getCurrentWindow,
  LogicalPosition,
  LogicalSize,
  Window,
} from "@tauri-apps/api/window";
import {
  CHECKLIST_WINDOW,
  POSITION_MARGIN,
  getBuddyWindowSize,
} from "../constants/buddyLayout";
import {
  loadBuddyPreferences,
  saveBuddyPreferences,
} from "../storage/buddyStorage";
import type { WindowPosition } from "../types/buddy";
import { bringBuddyAboveChecklist } from "./buddyWindow";
import { getPrimaryWorkArea, getWorkAreaForBuddyPosition } from "./monitorUtils";
import {
  clampPositionToWorkArea,
  getBottomRightPosition,
  type WindowSize,
  type WorkArea,
} from "./windowLayout";

const CHECKLIST_LABEL = "checklist";
const BUDDY_LABEL = "buddy";
const CHECKLIST_MARGIN = Math.max(16, POSITION_MARGIN);

export function getCurrentWindowLabel(): string {
  try {
    return getCurrentWindow().label;
  } catch {
    const previewWindow = new URLSearchParams(window.location.search).get(
      "window"
    );
    if (previewWindow === CHECKLIST_LABEL) {
      return CHECKLIST_LABEL;
    }

    return BUDDY_LABEL;
  }
}

export async function getBuddyDisplay(): Promise<WorkArea> {
  const buddy = await Window.getByLabel(BUDDY_LABEL);
  const primary = await getPrimaryWorkArea();

  if (!buddy) {
    return primary ?? { x: 0, y: 0, width: 1280, height: 800 };
  }

  const position = await buddy.outerPosition();
  const preferences = loadBuddyPreferences();
  const buddySize = getBuddyWindowSize(preferences.scaleFactor);

  return getWorkAreaForBuddyPosition(
    { x: position.x, y: position.y },
    buddySize
  );
}

export function clampWindowToDisplay(
  position: WindowPosition,
  size: WindowSize,
  workArea: WorkArea
): WindowPosition {
  return clampPositionToWorkArea(position, size, workArea, CHECKLIST_MARGIN);
}

export function getChecklistSize(workArea: WorkArea): WindowSize {
  const width = Math.min(
    CHECKLIST_WINDOW.maxWidth,
    Math.max(CHECKLIST_WINDOW.minWidth, CHECKLIST_WINDOW.width)
  );
  const height = Math.max(
    CHECKLIST_WINDOW.minHeight,
    Math.round(workArea.height * CHECKLIST_WINDOW.heightRatio)
  );

  return {
    width: Math.min(width, workArea.width - CHECKLIST_MARGIN * 2),
    height: Math.min(height, workArea.height - CHECKLIST_MARGIN * 2),
  };
}

export async function positionChecklistNearRightEdge(): Promise<WindowSize> {
  const checklist = await Window.getByLabel(CHECKLIST_LABEL);
  if (!checklist) {
    return {
      width: CHECKLIST_WINDOW.width,
      height: CHECKLIST_WINDOW.minHeight,
    };
  }

  const workArea = await getBuddyDisplay();
  const size = getChecklistSize(workArea);
  const desired = {
    x: workArea.x + workArea.width - size.width - CHECKLIST_MARGIN,
    y: workArea.y + Math.round((workArea.height - size.height) * 0.56),
  };
  const position = clampWindowToDisplay(desired, size, workArea);

  await checklist.setSize(new LogicalSize(size.width, size.height));
  await checklist.setPosition(new LogicalPosition(position.x, position.y));

  return size;
}

export async function openChecklist(): Promise<void> {
  const preferences = loadBuddyPreferences();
  saveBuddyPreferences({
    ...preferences,
    checklistOpen: true,
  });

  const size = await positionChecklistNearRightEdge();

  const checklist = await Window.getByLabel(CHECKLIST_LABEL);
  if (!checklist) return;

  await checklist.setAlwaysOnTop(false);
  await checklist.show();
  await emitTo(CHECKLIST_LABEL, "checklist-size-changed", size);

  await bringBuddyAboveChecklist();
}

export async function closeChecklist(): Promise<void> {
  const preferences = loadBuddyPreferences();
  saveBuddyPreferences({ ...preferences, checklistOpen: false });

  const checklist = await Window.getByLabel(CHECKLIST_LABEL);
  await checklist?.hide();

  await bringBuddyAboveChecklist();
}

export async function resetBuddyPosition(): Promise<void> {
  const preferences = loadBuddyPreferences();
  const buddy = await Window.getByLabel(BUDDY_LABEL);
  if (!buddy) return;

  const primary = await getPrimaryWorkArea();
  const size = getBuddyWindowSize(preferences.scaleFactor);
  const position = primary
    ? getBottomRightPosition(primary, size, POSITION_MARGIN)
    : { x: 100, y: 100 };

  await buddy.setSize(new LogicalSize(size.width, size.height));
  await buddy.setPosition(new LogicalPosition(position.x, position.y));
  saveBuddyPreferences({ ...preferences, position });
  await emitTo(BUDDY_LABEL, "buddy-position-reset", position);
  await bringBuddyAboveChecklist();
}
