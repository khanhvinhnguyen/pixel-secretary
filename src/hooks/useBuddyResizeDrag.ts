import { useCallback, useRef } from "react";
import {
  clampScaleFactor,
  SCALE_FACTOR_MAX,
  SCALE_FACTOR_MIN,
} from "../constants/buddyLayout";

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

export function useBuddyResizeDrag(
  scaleFactor: number,
  onScaleFactorChange: (value: number) => void
) {
  const dragRef = useRef<{
    handle: ResizeHandleId;
    startX: number;
    startY: number;
    startScale: number;
  } | null>(null);

  const onHandlePointerDown = useCallback(
    (handle: ResizeHandleId, event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      dragRef.current = {
        handle,
        startX: event.clientX,
        startY: event.clientY,
        startScale: scaleFactor,
      };

      event.currentTarget.setPointerCapture(event.pointerId);

      const onMove = (moveEvent: PointerEvent) => {
        if (!dragRef.current) return;
        const deltaX = moveEvent.clientX - dragRef.current.startX;
        const deltaY = moveEvent.clientY - dragRef.current.startY;
        const delta = scaleDeltaFromDrag(dragRef.current.handle, deltaX, deltaY);
        onScaleFactorChange(
          clampScaleFactor(dragRef.current.startScale + delta)
        );
      };

      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [onScaleFactorChange, scaleFactor]
  );

  return { onHandlePointerDown };
}
