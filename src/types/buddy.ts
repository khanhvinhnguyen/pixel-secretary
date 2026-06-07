export type DisplayMode = "visible" | "hidden";

export interface WindowPosition {
  x: number;
  y: number;
}

export interface BuddyPreferences {
  position: WindowPosition | null;
  displayMode: DisplayMode;
  /** 0.72 – 1.28, kéo tay hoặc preset cũ migrate */
  scaleFactor: number;
  resizeModeActive: boolean;
  checklistOpen: boolean;
}

export const DEFAULT_PREFERENCES: BuddyPreferences = {
  position: null,
  displayMode: "visible",
  scaleFactor: 1,
  resizeModeActive: false,
  checklistOpen: false,
};
