import {
  clampScaleFactor,
  getBuddyWindowSize,
} from "../constants/buddyLayout";
import type { WindowPosition } from "../types/buddy";
import type { WindowSize } from "./windowLayout";

export type ResizeHandleId =
  | "n"
  | "s"
  | "e"
  | "w"
  | "nw"
  | "ne"
  | "sw"
  | "se";

export interface ResizeLayout {
  position: WindowPosition;
  scaleFactor: number;
  size: WindowSize;
}

export interface ResizeStart {
  handle: ResizeHandleId;
  startX: number;
  startY: number;
  startScale: number;
  startPosition: WindowPosition;
  startSize: WindowSize;
}

const SENSITIVITY = 0.0032;

function scaleDeltaFromDrag(
  handle: ResizeHandleId,
  deltaX: number,
  deltaY: number
): number {
  switch (handle) {
    case "se":
      return (deltaX + deltaY) * SENSITIVITY;
    case "nw":
      return (-deltaX - deltaY) * SENSITIVITY;
    case "ne":
      return (deltaX - deltaY) * SENSITIVITY;
    case "sw":
      return (-deltaX + deltaY) * SENSITIVITY;
    case "e":
      return deltaX * SENSITIVITY * 1.6;
    case "w":
      return -deltaX * SENSITIVITY * 1.6;
    case "s":
      return deltaY * SENSITIVITY * 1.6;
    case "n":
      return -deltaY * SENSITIVITY * 1.6;
  }
}

function getAnchoredPosition(
  handle: ResizeHandleId,
  startPosition: WindowPosition,
  startSize: WindowSize,
  nextSize: WindowSize
): WindowPosition {
  const deltaWidth = startSize.width - nextSize.width;
  const deltaHeight = startSize.height - nextSize.height;

  let x = startPosition.x;
  let y = startPosition.y;

  if (handle.includes("w")) {
    x += deltaWidth;
  } else if (handle === "n" || handle === "s") {
    x += Math.round(deltaWidth / 2);
  }

  if (handle.includes("n")) {
    y += deltaHeight;
  } else if (handle === "e" || handle === "w") {
    y += Math.round(deltaHeight / 2);
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
  };
}

export function getResizeLayout(
  start: ResizeStart,
  screenX: number,
  screenY: number
): ResizeLayout {
  const deltaX = screenX - start.startX;
  const deltaY = screenY - start.startY;
  const delta = scaleDeltaFromDrag(start.handle, deltaX, deltaY);
  const scaleFactor = clampScaleFactor(start.startScale + delta);
  const size = getBuddyWindowSize(scaleFactor);

  return {
    position: getAnchoredPosition(
      start.handle,
      start.startPosition,
      start.startSize,
      size
    ),
    scaleFactor,
    size,
  };
}

export function applyBuddyResizePreview(
  scaleFactor: number,
  size: WindowSize
): void {
  const width = `${size.width}px`;
  const height = `${size.height}px`;
  const scale = String(scaleFactor);

  document.documentElement.style.width = width;
  document.documentElement.style.height = height;
  document.body.style.width = width;
  document.body.style.height = height;

  const root = document.getElementById("root");
  if (root) {
    root.style.width = width;
    root.style.height = height;
  }

  const buddy = document.querySelector<HTMLElement>(".buddy-window");
  if (buddy) {
    buddy.style.width = width;
    buddy.style.height = height;
    buddy.style.setProperty("--buddy-scale", scale);
  }
}
