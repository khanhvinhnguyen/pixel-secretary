import { useCallback, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { PixelAssistant } from "./assistant/PixelAssistant";
import { SpeechBubble } from "./ui/SpeechBubble";
import { BuddyContextMenu } from "./components/BuddyContextMenu";
import { BuddyResizeFrame } from "./components/BuddyResizeFrame";
import { useBuddyContextMenu } from "./hooks/useBuddyContextMenu";
import { useBuddyPreferences } from "./hooks/useBuddyPreferences";
import { useBuddyResizeDrag } from "./hooks/useBuddyResizeDrag";
import { useBuddyTray } from "./hooks/useBuddyTray";
import { useBuddyWindow } from "./hooks/useBuddyWindow";
import type { WindowPosition } from "./types/buddy";
import { openChecklist } from "./window/checklistWindow";
import { shouldFlipBuddyOnCurrentDisplay } from "./window/monitorUtils";
import { startBuddyWindowDrag } from "./window/buddyWindow";

export function BuddyApp() {
  const [flipBuddy, setFlipBuddy] = useState(false);
  const {
    preferences,
    ready,
    setDisplayMode,
    setPosition,
    setScaleFactor,
    toggleResizeMode,
    setResizeModeActive,
    openChecklist: persistChecklistOpen,
    closeChecklist: persistChecklistClosed,
    windowSize,
  } = useBuddyPreferences();

  const handlePositionChange = useCallback(
    (position: WindowPosition) => {
      setPosition(position);
    },
    [setPosition]
  );

  const { resetPosition, hideBuddy: hideBuddyWindowOnly } = useBuddyWindow({
    ready,
    preferences,
    onPositionChange: handlePositionChange,
  });

  const showBuddy = useCallback(() => {
    setDisplayMode("visible");
  }, [setDisplayMode]);

  const hideBuddyAndPersist = useCallback(async () => {
    setDisplayMode("hidden");
    await hideBuddyWindowOnly();
  }, [setDisplayMode, hideBuddyWindowOnly]);

  useBuddyTray({
    ready,
    onShowBuddy: showBuddy,
    onHideBuddy: () => void hideBuddyAndPersist(),
  });

  const { menu, openMenu, closeMenu } = useBuddyContextMenu();
  const { onHandlePointerDown } = useBuddyResizeDrag(
    preferences.scaleFactor,
    preferences.position,
    setScaleFactor,
    setPosition
  );

  const scaleFactor = preferences.scaleFactor;

  const handleOpenMenu = useCallback(
    (event: React.MouseEvent) => {
      openMenu(event, {
        windowWidth: windowSize.width,
        windowHeight: windowSize.height,
        scaleFactor,
      });
    },
    [openMenu, windowSize.height, windowSize.width, scaleFactor]
  );

  const handleBuddyPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0 || menu) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest("button, input, textarea, select, a")) return;

      void startBuddyWindowDrag().catch(() => undefined);
    },
    [menu]
  );

  const handleContextAction = async (
    action: "checklist" | "toggle-resize" | "reset-position"
  ) => {
    switch (action) {
      case "checklist":
        persistChecklistOpen();
        await openChecklist();
        break;
      case "toggle-resize":
        toggleResizeMode();
        break;
      case "reset-position":
        await resetPosition();
        break;
    }

    closeMenu();
  };

  useEffect(() => {
    if (!ready || !preferences.checklistOpen || preferences.displayMode === "hidden") {
      return;
    }
    const timer = window.setTimeout(() => {
      void openChecklist();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [ready, preferences.checklistOpen, preferences.displayMode]);

  useEffect(() => {
    const width = `${windowSize.width}px`;
    const height = `${windowSize.height}px`;
    document.documentElement.style.width = width;
    document.documentElement.style.height = height;
    document.body.style.width = width;
    document.body.style.height = height;
    const root = document.getElementById("root");
    if (root) {
      root.style.width = width;
      root.style.height = height;
    }
  }, [windowSize.height, windowSize.width]);

  useEffect(() => {
    if (!ready || !preferences.position) return;

    let cancelled = false;

    void shouldFlipBuddyOnCurrentDisplay(preferences.position, windowSize).then(
      (shouldFlip) => {
        if (!cancelled) {
          setFlipBuddy(shouldFlip);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [ready, preferences.position, windowSize.height, windowSize.width]);

  useEffect(() => {
    const setup = async () => {
      const unlistenClosed = await listen("checklist-closed", () => {
        persistChecklistClosed();
      });
      const unlistenReset = await listen<WindowPosition>(
        "buddy-position-reset",
        (event) => {
          setPosition(event.payload);
        }
      );

      return () => {
        unlistenClosed();
        unlistenReset();
      };
    };

    let cleanup: (() => void) | undefined;
    void setup().then((fn) => {
      cleanup = fn;
    });

    return () => cleanup?.();
  }, [persistChecklistClosed, setPosition]);

  useEffect(() => {
    if (!preferences.resizeModeActive) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setResizeModeActive(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [preferences.resizeModeActive, setResizeModeActive]);

  const buddyClass = [
    "buddy-window",
    preferences.resizeModeActive ? "buddy-window--resize-active" : "",
    flipBuddy ? "buddy-window--flip" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {menu ? (
        <BuddyContextMenu
          x={menu.x}
          y={menu.y}
          scaleFactor={scaleFactor}
          resizeModeActive={preferences.resizeModeActive}
          onAction={(action) => void handleContextAction(action)}
          onClose={closeMenu}
        />
      ) : null}

      <div
        className={buddyClass}
        style={
          {
            "--buddy-scale": scaleFactor,
            width: windowSize.width,
            height: windowSize.height,
          } as React.CSSProperties
        }
      >
        {preferences.resizeModeActive ? (
          <BuddyResizeFrame
            scaleFactor={scaleFactor}
            onHandlePointerDown={onHandlePointerDown}
          />
        ) : null}

        <div
          className="buddy-stage"
          onPointerDown={handleBuddyPointerDown}
        >
          <SpeechBubble
            className="speech-bubble--buddy"
            onContextMenu={handleOpenMenu}
          >
            5 phút nữa tới giờ làm task tiếp theo.
          </SpeechBubble>

          <PixelAssistant
            scale={scaleFactor}
            className="pixel-buddy--stage"
            onContextMenu={handleOpenMenu}
          />
        </div>
      </div>
    </>
  );
}
