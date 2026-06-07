import {
  getCurrentWindow,
  LogicalPosition,
  LogicalSize,
  Window,
} from "@tauri-apps/api/window";
import { getBuddyWindowSize, POSITION_MARGIN } from "../constants/buddyLayout";
import type { WindowPosition } from "../types/buddy";
import {
  getPrimaryWorkArea,
  resolveBuddyStartupPosition,
} from "./monitorUtils";
import { getBottomRightPosition, type WindowSize } from "./windowLayout";

const BUDDY_LABEL = "buddy";

export async function getBuddyWindow(): Promise<Window | null> {
  return Window.getByLabel(BUDDY_LABEL);
}

/** Buddy luôn nổi trên cửa sổ checklist. */
export async function bringBuddyAboveChecklist(): Promise<void> {
  const buddy = await getBuddyWindow();
  if (!buddy) return;

  await buddy.show();
  await buddy.setAlwaysOnTop(true);
}

export async function applyBuddyPosition(position: WindowPosition): Promise<void> {
  await getCurrentWindow().setPosition(
    new LogicalPosition(position.x, position.y)
  );
}

export async function applyBuddyLayout(
  position: WindowPosition,
  size: WindowSize
): Promise<void> {
  const win = getCurrentWindow();
  await win.setSize(new LogicalSize(size.width, size.height));
  await win.setPosition(new LogicalPosition(position.x, position.y));
}

export async function applyBuddySize(
  scaleFactor: number
): Promise<WindowSize> {
  const size = getBuddyWindowSize(scaleFactor);
  await getCurrentWindow().setSize(new LogicalSize(size.width, size.height));
  return size;
}

export async function readBuddyPosition(): Promise<WindowPosition> {
  const win = getCurrentWindow();
  const [pos, sf] = await Promise.all([win.outerPosition(), win.scaleFactor()]);
  const logical = pos.toLogical(sf);
  return { x: Math.round(logical.x), y: Math.round(logical.y) };
}

export async function hideBuddyWindow(): Promise<void> {
  await getCurrentWindow().hide();
}

export async function startBuddyWindowDrag(): Promise<void> {
  await getCurrentWindow().startDragging();
}

/** Reset position → bottom-right of primary monitor (context menu / tray). */
export async function placeBuddyBottomRight(
  scaleFactor: number
): Promise<WindowPosition> {
  const windowSize = getBuddyWindowSize(scaleFactor);
  const primary = await getPrimaryWorkArea();
  const position = primary
    ? getBottomRightPosition(primary, windowSize, POSITION_MARGIN)
    : { x: 100, y: 100 };

  await applyBuddySize(scaleFactor);
  await applyBuddyPosition(position);
  await bringBuddyAboveChecklist();
  return position;
}

/**
 * On startup: read saved position, validate against current monitors,
 * restore or reset to primary bottom-right.
 */
export async function ensureBuddyAndChecklistVisible(
  scaleFactor: number,
  savedPosition: WindowPosition | null
): Promise<WindowPosition> {
  const buddy = await getBuddyWindow();
  const windowSize = getBuddyWindowSize(scaleFactor);
  const { position, resetBecauseOffScreen } = await resolveBuddyStartupPosition(
    savedPosition,
    windowSize
  );

  if (buddy) {
    await buddy.setSize(new LogicalSize(windowSize.width, windowSize.height));
    await buddy.setPosition(new LogicalPosition(position.x, position.y));
    await bringBuddyAboveChecklist();
  }

  if (resetBecauseOffScreen) {
    const checklist = await Window.getByLabel("checklist");
    const visible = checklist ? await checklist.isVisible() : false;
    if (visible) {
      const { positionChecklistNearRightEdge } = await import("./checklistWindow");
      await positionChecklistNearRightEdge();
    }
  }

  return position;
}
