import { useCallback, useRef } from "react";
import { getBuddyWindowSize } from "../constants/buddyLayout";
import type { WindowPosition } from "../types/buddy";
import { applyBuddyLayout, readBuddyPosition } from "../window/buddyWindow";
import {
  applyBuddyResizePreview,
  getResizeLayout,
  type ResizeHandleId,
  type ResizeLayout,
} from "../window/buddyResize";

const FALLBACK_POSITION: WindowPosition = { x: 0, y: 0 };

export function useBuddyResizeDrag(
  scaleFactor: number,
  position: WindowPosition | null,
  onScaleFactorChange: (value: number) => void,
  onPositionChange: (position: WindowPosition) => void
) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    handle: ResizeHandleId;
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

    applyBuddyResizePreview(nextScale, nextSize);
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

        dragRef.current.pendingLayout = getResizeLayout(
          dragRef.current,
          moveEvent.screenX,
          moveEvent.screenY
        );

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
          applyBuddyResizePreview(nextScale, size);
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
