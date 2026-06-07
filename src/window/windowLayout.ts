import { POSITION_MARGIN } from "../constants/buddyLayout";
import type { WindowPosition } from "../types/buddy";

export interface WindowSize {
  width: number;
  height: number;
}

export interface WorkArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function clampPositionToWorkArea(
  position: WindowPosition,
  windowSize: WindowSize,
  workArea: WorkArea,
  margin = POSITION_MARGIN
): WindowPosition {
  const minX = workArea.x + margin;
  const minY = workArea.y + margin;
  const maxX = workArea.x + workArea.width - windowSize.width - margin;
  const maxY = workArea.y + workArea.height - windowSize.height - margin;

  return {
    x: Math.min(Math.max(position.x, minX), Math.max(minX, maxX)),
    y: Math.min(Math.max(position.y, minY), Math.max(minY, maxY)),
  };
}

export function getBottomRightPosition(
  primaryMonitor: WorkArea,
  windowSize: WindowSize,
  margin = POSITION_MARGIN
): WindowPosition {
  return {
    x: primaryMonitor.x + primaryMonitor.width - windowSize.width - margin,
    y: primaryMonitor.y + primaryMonitor.height - windowSize.height - margin,
  };
}
