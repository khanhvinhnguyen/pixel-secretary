import { useCallback, useRef } from "react";
import {
  clampScaleFactor,
  getBuddyWindowSize,
} from "../constants/buddyLayout";
import type { WindowPosition } from "../types/buddy";
import { applyBuddyLayout, readBuddyPosition } from "../window/buddyWindow";
import type { WindowSize } from "../window/windowLayout";

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

interface ResizeLayout {
  position: WindowPosition;
  scaleFactor: number;
  size: WindowSize;
}

function applyPreviewDom(scaleFactor: number, size: WindowSize): void {
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
    frameId: number | null;
    pendingLayout: ResizeLayout | null;
    queuedNativeLayout: ResizeLayout | null;
    nativeLayoutInFlight: boolean;
    active: boolean;
    lastLayout: {
      position: WindowPosition;
      scaleFactor: number;
    };
  } | null>(null);

  const applyNativeLayoutLatest = useCallback((layout: ResizeLayout) => {
    const drag = dragRef.current;
    if (!drag?.active) {
      void applyBuddyLayout(layout.position, layout.size);
      return;
    }

    if (drag.nativeLayoutInFlight) {
      drag.queuedNativeLayout = layout;
      return;
    }

    drag.nativeLayoutInFlight = true;
    void applyBuddyLayout(layout.position, layout.size).finally(() => {
      const current = dragRef.current;
      if (!current || current !== drag || !current.active) return;

      current.nativeLayoutInFlight = false;
      const queued = current.queuedNativeLayout;
      current.queuedNativeLayout = null;

      if (queued) {
        applyNativeLayoutLatest(queued);
      }
    });
  }, []);

  const flushPendingLayout = useCallback(() => {
    const drag = dragRef.current;
    if (!drag?.pendingLayout) return;

    const layout = drag.pendingLayout;
    const { position: nextPosition, scaleFactor: nextScale, size: nextSize } =
      layout;

    drag.pendingLayout = null;
    drag.frameId = null;
    drag.lastLayout = {
      position: nextPosition,
      scaleFactor: nextScale,
    };

    applyPreviewDom(nextScale, nextSize);
    applyNativeLayoutLatest(layout);
  }, [applyNativeLayoutLatest]);

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
        frameId: null,
        pendingLayout: null,
        queuedNativeLayout: null,
        nativeLayoutInFlight: false,
        active: true,
        lastLayout: {
          position: position ?? FALLBACK_POSITION,
          scaleFactor,
        },
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
        const rawScale = dragRef.current.startScale + delta;
        const nextScale = clampScaleFactor(rawScale);
        const nextSize = getBuddyWindowSize(nextScale);
        const nextPosition = getAnchoredPosition(
          dragRef.current.handle,
          dragRef.current.startPosition,
          dragRef.current.startSize,
          nextSize
        );

        dragRef.current.pendingLayout = {
          position: nextPosition,
          scaleFactor: nextScale,
          size: nextSize,
        };

        if (dragRef.current.frameId === null) {
          dragRef.current.frameId = window.requestAnimationFrame(
            flushPendingLayout
          );
        }
      };

      const onUp = () => {
        const drag = dragRef.current;

        if (drag && drag.frameId !== null) {
          window.cancelAnimationFrame(drag.frameId);
        }

        if (drag?.pendingLayout) {
          const { position: nextPosition, scaleFactor: nextScale, size } =
            drag.pendingLayout;
          applyPreviewDom(nextScale, size);
          void applyBuddyLayout(nextPosition, size);
          drag.lastLayout = {
            position: nextPosition,
            scaleFactor: nextScale,
          };
        }

        if (drag) {
          drag.active = false;
          drag.queuedNativeLayout = null;
          onScaleFactorChange(drag.lastLayout.scaleFactor);
          onPositionChange(drag.lastLayout.position);
        }

        dragRef.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [
      flushPendingLayout,
      onPositionChange,
      onScaleFactorChange,
      position,
      scaleFactor,
    ]
  );

  return { onHandlePointerDown };
}
