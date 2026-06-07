import { useCallback, useEffect, useState } from "react";
import { clampScaleFactor, getBuddyWindowSize } from "../constants/buddyLayout";
import { loadBuddyPreferences, saveBuddyPreferences } from "../storage/buddyStorage";
import {
  DEFAULT_PREFERENCES,
  type BuddyPreferences,
  type DisplayMode,
  type WindowPosition,
} from "../types/buddy";

export function useBuddyPreferences() {
  const [preferences, setPreferences] = useState<BuddyPreferences>(
    DEFAULT_PREFERENCES
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPreferences(loadBuddyPreferences());
    setReady(true);
  }, []);

  const update = useCallback((patch: Partial<BuddyPreferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      saveBuddyPreferences(next);
      return next;
    });
  }, []);

  const setScaleFactor = useCallback(
    (scaleFactor: number) =>
      update({ scaleFactor: clampScaleFactor(scaleFactor) }),
    [update]
  );

  const setDisplayMode = useCallback(
    (displayMode: DisplayMode) => update({ displayMode }),
    [update]
  );

  const setPosition = useCallback(
    (position: WindowPosition) => update({ position }),
    [update]
  );

  const setResizeModeActive = useCallback(
    (resizeModeActive: boolean) => update({ resizeModeActive }),
    [update]
  );

  const toggleResizeMode = useCallback(() => {
    setPreferences((current) => {
      const next = {
        ...current,
        resizeModeActive: !current.resizeModeActive,
      };
      saveBuddyPreferences(next);
      return next;
    });
  }, []);

  const openChecklist = useCallback(() => {
    update({ checklistOpen: true });
  }, [update]);

  const closeChecklist = useCallback(() => {
    update({ checklistOpen: false });
  }, [update]);

  const windowSize = getBuddyWindowSize(preferences.scaleFactor);

  return {
    preferences,
    ready,
    update,
    setScaleFactor,
    setDisplayMode,
    setPosition,
    setResizeModeActive,
    toggleResizeMode,
    openChecklist,
    closeChecklist,
    windowSize,
  };
}
