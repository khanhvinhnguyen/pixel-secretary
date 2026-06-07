import { useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  applyBuddySize,
  ensureBuddyAndChecklistVisible,
  hideBuddyWindow,
  placeBuddyBottomRight,
  readBuddyPosition,
} from "../window/buddyWindow";
import type { BuddyPreferences } from "../types/buddy";

interface UseBuddyWindowOptions {
  ready: boolean;
  preferences: BuddyPreferences;
  onPositionChange: (position: { x: number; y: number }) => void;
}

export function useBuddyWindow({
  ready,
  preferences,
  onPositionChange,
}: UseBuddyWindowOptions) {
  const initialized = useRef(false);
  const layoutKey = useRef("");
  const saveTimer = useRef<number | null>(null);
  const prevDisplayMode = useRef(preferences.displayMode);

  useEffect(() => {
    if (!ready) return;

    const becameVisible =
      prevDisplayMode.current === "hidden" &&
      preferences.displayMode === "visible";
    prevDisplayMode.current = preferences.displayMode;

    if (preferences.displayMode === "hidden") {
      void hideBuddyWindow();
      return;
    }

    const key = String(preferences.scaleFactor);
    if (layoutKey.current === key && initialized.current && !becameVisible) {
      return;
    }

    const syncLayout = async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 80));

      const position = await ensureBuddyAndChecklistVisible(
        preferences.scaleFactor,
        preferences.position
      );

      if (!initialized.current || becameVisible) {
        await applyBuddySize(preferences.scaleFactor);
      }

      onPositionChange(position);
      initialized.current = true;
      layoutKey.current = key;
    };

    void syncLayout();
  }, [ready, preferences.displayMode, preferences.scaleFactor, onPositionChange]);

  useEffect(() => {
    if (!ready || preferences.displayMode === "hidden") return;

    let unlisten: (() => void) | undefined;

    const setup = async () => {
      const appWindow = getCurrentWindow();
      unlisten = await appWindow.onMoved(() => {
        if (saveTimer.current) {
          window.clearTimeout(saveTimer.current);
        }

        saveTimer.current = window.setTimeout(async () => {
          onPositionChange(await readBuddyPosition());
        }, 200);
      });
    };

    void setup();

    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
      }
      unlisten?.();
    };
  }, [ready, preferences.displayMode, onPositionChange]);

  const resetPosition = async () => {
    const position = await placeBuddyBottomRight(preferences.scaleFactor);
    onPositionChange(position);
  };

  const hideBuddy = async () => {
    await hideBuddyWindow();
  };

  return { resetPosition, hideBuddy };
}
