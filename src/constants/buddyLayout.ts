/** Safe inset from display edges when placing or validating the buddy (16–24px). */
export const POSITION_MARGIN = 20;

export const BUDDY_WINDOW_SIZE = {
  width: 340,
  height: 240,
};

export const CHECKLIST_WINDOW = {
  minWidth: 420,
  width: 480,
  maxWidth: 520,
  minHeight: 480,
  heightRatio: 0.7,
};

export const SCALE_FACTOR_MIN = 0.72;
export const SCALE_FACTOR_DEFAULT = 1;

export function clampScaleFactor(value: number): number {
  return Math.max(SCALE_FACTOR_MIN, Math.round(value * 100) / 100);
}

export function getBuddyWindowSize(scaleFactor: number): {
  width: number;
  height: number;
} {
  const factor = clampScaleFactor(scaleFactor);
  return {
    width: Math.round(BUDDY_WINDOW_SIZE.width * factor),
    height: Math.round(BUDDY_WINDOW_SIZE.height * factor),
  };
}
