import { useCallback, useEffect, useState } from "react";
import { emitTo, listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { NotebookPanelContent } from "./components/NotebookPanel";
import {
  loadBuddyPreferences,
  saveBuddyPreferences,
} from "./storage/buddyStorage";
import type { WindowSize } from "./window/windowLayout";
import { closeChecklist } from "./window/checklistWindow";

function applyRootSize(size: WindowSize) {
  const width = `${size.width}px`;
  const height = `${size.height}px`;
  document.documentElement.style.width = width;
  document.documentElement.style.height = height;
  document.body.style.width = width;
  document.body.style.height = height;
  const root = document.getElementById("root");
  if (root) {
    root.style.width = width;
    root.style.height = height;
  }
}

export function ChecklistApp() {
  const [, setTick] = useState(0);

  const handleClose = useCallback(async () => {
    const preferences = loadBuddyPreferences();
    saveBuddyPreferences({ ...preferences, checklistOpen: false });
    await emitTo("buddy", "checklist-closed");
    await closeChecklist();
  }, []);

  useEffect(() => {
    const syncFromWindow = async () => {
      const size = await getCurrentWindow().outerSize();
      applyRootSize({ width: size.width, height: size.height });
    };

    void syncFromWindow();

    const setup = async () => {
      const unlistenSize = await listen<WindowSize>(
        "checklist-size-changed",
        (event) => {
          applyRootSize(event.payload);
          setTick((n) => n + 1);
        }
      );

      return unlistenSize;
    };

    let cleanup: (() => void) | undefined;
    void setup().then((fn) => {
      cleanup = fn;
    });

    return () => cleanup?.();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        void handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose]);

  return (
    <main className="checklist-window">
      <NotebookPanelContent onClose={() => void handleClose()} />
    </main>
  );
}
