import { useCallback, useRef } from "react";
import {
  clampScaleFactor,
  getBuddyWindowSize,
} from "../constants/buddyLayout";
import type { WindowPosition } from "../types/buddy";
import { applyBuddyLayout, readBuddyPosition } from "../window/buddyWindow";

export type ResizeHandleId =
  | "n"
  | "s"
  | "e"
  | "w"
  | "nw"
  | "ne"
  | "sw"
  | "se";

const SENSITIVITY = 0.0032;
const FALLBACK_POSITION: WindowPosition = { x: 0, y: 0 };

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
    default:
      return 0;
  }
}

function getAnchoredPosition(
  handle: ResizeHandleId,
  startPosition: WindowPosition,
  startSize: { width: number; height: number },
  nextSize: { width: number; height: number }
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

export function useBuddyResizeDrag(
  scaleFactor: number,
  position: WindowPosition | null,
  onScaleFactorChange: (value: number) => void,
  onPositionChange: (position: WindowPosition) => void
) {
  const dragRef = useRef<{
    handle: ResizeHandleId;
    startX: number;
    startY: number;
    startScale: number;
    startPosition: WindowPosition;
    startSize: { width: number; height: number };
    hasMoved: boolean;
  } | null>(null);

  const onHandlePointerDown = useCallback(
    (handle: ResizeHandleId, event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      dragRef.current = {
        handle,
        startX: event.screenX,
        startY: event.screenY,
        startScale: scaleFactor,
        startPosition: position ?? FALLBACK_POSITION,
        startSize: getBuddyWindowSize(scaleFactor),
        hasMoved: false,
      };

      void readBuddyPosition()
        .then((currentPosition) => {
          if (!dragRef.current || dragRef.current.hasMoved) return;
          dragRef.current.startPosition = currentPosition;
        })
        .catch(() => undefined);

      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is best-effort; window listeners below keep dragging alive.
      }

      const onMove = (moveEvent: PointerEvent) => {
        if (!dragRef.current) return;
        moveEvent.preventDefault();
        dragRef.current.hasMoved = true;

        const deltaX = moveEvent.screenX - dragRef.current.startX;
        const deltaY = moveEvent.screenY - dragRef.current.startY;
        const delta = scaleDeltaFromDrag(dragRef.current.handle, deltaX, deltaY);
        const nextScale = clampScaleFactor(dragRef.current.startScale + delta);
        const nextSize = getBuddyWindowSize(nextScale);
        const nextPosition = getAnchoredPosition(
          dragRef.current.handle,
          dragRef.current.startPosition,
          dragRef.current.startSize,
          nextSize
        );

        onScaleFactorChange(nextScale);
        onPositionChange(nextPosition);
        void applyBuddyLayout(nextPosition, nextSize);
      };

      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [onPositionChange, onScaleFactorChange, position, scaleFactor]
  );

  return { onHandlePointerDown };
}
