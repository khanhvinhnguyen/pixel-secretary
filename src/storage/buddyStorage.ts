import { clampScaleFactor, SCALE_FACTOR_DEFAULT } from "../constants/buddyLayout";
import {
  DEFAULT_PREFERENCES,
  type BuddyPreferences,
  type DisplayMode,
  type WindowPosition,
} from "../types/buddy";

const STORAGE_KEY = "pixel-secretary.buddy-preferences";

function isDisplayMode(value: unknown): value is DisplayMode {
  return value === "visible" || value === "hidden";
}

function isPosition(value: unknown): value is WindowPosition {
  if (!value || typeof value !== "object") return false;
  const pos = value as WindowPosition;
  return typeof pos.x === "number" && typeof pos.y === "number";
}

function migrateScaleFactor(raw: Record<string, unknown>): number {
  if (typeof raw.scaleFactor === "number") {
    return clampScaleFactor(raw.scaleFactor);
  }

  const legacy = raw.scale;
  if (legacy === "small") return 0.88;
  if (legacy === "large") return 1.12;
  return SCALE_FACTOR_DEFAULT;
}

function sanitizePreferences(raw: unknown): BuddyPreferences {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_PREFERENCES };
  }

  const data = raw as Record<string, unknown>;
  const legacy = raw as Record<string, unknown> & { notebookOpen?: unknown };

  return {
    position: isPosition(data.position) ? data.position : null,
    displayMode: isDisplayMode(data.displayMode)
      ? data.displayMode
      : DEFAULT_PREFERENCES.displayMode,
    scaleFactor: migrateScaleFactor(data),
    resizeModeActive: Boolean(data.resizeModeActive),
    checklistOpen:
      typeof data.checklistOpen === "boolean"
        ? data.checklistOpen
        : Boolean(legacy.notebookOpen),
  };
}

export function loadBuddyPreferences(): BuddyPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    return sanitizePreferences(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function saveBuddyPreferences(preferences: BuddyPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
