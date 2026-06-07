import {
  availableMonitors,
  primaryMonitor,
  type Monitor,
} from "@tauri-apps/api/window";
import { POSITION_MARGIN } from "../constants/buddyLayout";
import type { WindowPosition } from "../types/buddy";
import {
  clampPositionToWorkArea,
  getBottomRightPosition,
  type WindowSize,
  type WorkArea,
} from "./windowLayout";

/** Conservative default when monitor APIs fail or return nothing. */
export const FALLBACK_POSITION: WindowPosition = { x: 100, y: 100 };

function monitorWorkArea(monitor: Monitor): WorkArea {
  const sf = monitor.scaleFactor;
  const pos = monitor.workArea.position.toLogical(sf);
  const size = monitor.workArea.size.toLogical(sf);
  return {
    x: Math.round(pos.x),
    y: Math.round(pos.y),
    width: Math.round(size.width),
    height: Math.round(size.height),
  };
}

export function workAreasFromMonitors(monitors: Monitor[]): WorkArea[] {
  return monitors.map(monitorWorkArea);
}

/**
 * True when the full buddy window (with edge margin) fits inside a connected display work area.
 */
export function isPositionVisibleOnAnyMonitor(
  position: WindowPosition,
  monitors: WorkArea[],
  windowSize: WindowSize,
  margin = POSITION_MARGIN
): boolean {
  if (monitors.length === 0) return false;

  return monitors.some((area) =>
    isWindowInsideWorkArea(position, windowSize, area, margin)
  );
}

function isWindowInsideWorkArea(
  position: WindowPosition,
  windowSize: WindowSize,
  workArea: WorkArea,
  margin: number
): boolean {
  const minX = workArea.x + margin;
  const minY = workArea.y + margin;
  const maxX = workArea.x + workArea.width - windowSize.width - margin;
  const maxY = workArea.y + workArea.height - windowSize.height - margin;

  if (maxX < minX || maxY < minY) return false;

  return (
    position.x >= minX &&
    position.y >= minY &&
    position.x <= maxX &&
    position.y <= maxY
  );
}

function findHostWorkArea(
  position: WindowPosition,
  monitors: WorkArea[],
  windowSize: WindowSize,
  margin = POSITION_MARGIN
): WorkArea | null {
  return (
    monitors.find((area) =>
      isWindowInsideWorkArea(position, windowSize, area, margin)
    ) ?? null
  );
}

function findNearestWorkArea(
  position: WindowPosition,
  monitors: WorkArea[],
  windowSize: WindowSize
): WorkArea | null {
  if (monitors.length === 0) return null;

  const center = {
    x: position.x + windowSize.width / 2,
    y: position.y + windowSize.height / 2,
  };

  return monitors.reduce<WorkArea | null>((nearest, area) => {
    const areaCenter = {
      x: area.x + area.width / 2,
      y: area.y + area.height / 2,
    };
    const distance =
      (center.x - areaCenter.x) ** 2 + (center.y - areaCenter.y) ** 2;

    if (!nearest) return area;

    const nearestCenter = {
      x: nearest.x + nearest.width / 2,
      y: nearest.y + nearest.height / 2,
    };
    const nearestDistance =
      (center.x - nearestCenter.x) ** 2 +
      (center.y - nearestCenter.y) ** 2;

    return distance < nearestDistance ? area : nearest;
  }, null);
}

export async function getMonitorWorkAreas(): Promise<WorkArea[]> {
  try {
    const monitors = await availableMonitors();
    return workAreasFromMonitors(monitors);
  } catch {
    return [];
  }
}

export async function getPrimaryWorkArea(): Promise<WorkArea | null> {
  try {
    const monitor = await primaryMonitor();
    if (!monitor) return null;
    return monitorWorkArea(monitor);
  } catch {
    return null;
  }
}

/**
 * Startup / restore: validate saved position against connected displays only.
 * Never restores coordinates outside all current monitors.
 */
export async function resolveBuddyStartupPosition(
  saved: WindowPosition | null,
  windowSize: WindowSize
): Promise<{ position: WindowPosition; resetBecauseOffScreen: boolean }> {
  const monitors = await getMonitorWorkAreas();
  const primary = (await getPrimaryWorkArea()) ?? monitors[0] ?? null;

  if (!primary) {
    return {
      position: { ...FALLBACK_POSITION },
      resetBecauseOffScreen: true,
    };
  }

  const areas = monitors.length > 0 ? monitors : [primary];

  if (!saved) {
    return {
      position: getBottomRightPosition(primary, windowSize, POSITION_MARGIN),
      resetBecauseOffScreen: false,
    };
  }

  if (!isPositionVisibleOnAnyMonitor(saved, areas, windowSize, POSITION_MARGIN)) {
    return {
      position: getBottomRightPosition(primary, windowSize, POSITION_MARGIN),
      resetBecauseOffScreen: true,
    };
  }

  const host =
    findHostWorkArea(saved, areas, windowSize, POSITION_MARGIN) ?? primary;

  return {
    position: clampPositionToWorkArea(
      saved,
      windowSize,
      host,
      POSITION_MARGIN
    ),
    resetBecauseOffScreen: false,
  };
}

/** Work area for clamping checklist near buddy (validation only, no display follow). */
export async function getWorkAreaForBuddyPosition(
  position: WindowPosition,
  windowSize: WindowSize
): Promise<WorkArea> {
  const monitors = await getMonitorWorkAreas();
  const primary = (await getPrimaryWorkArea()) ?? monitors[0];

  if (!primary) {
    return { x: 0, y: 0, width: 1280, height: 800 };
  }

  const areas = monitors.length > 0 ? monitors : [primary];
  const host = findHostWorkArea(position, areas, windowSize, POSITION_MARGIN);

  return host ?? primary;
}

export async function shouldFlipBuddyOnCurrentDisplay(
  position: WindowPosition,
  windowSize: WindowSize
): Promise<boolean> {
  const monitors = await getMonitorWorkAreas();
  const primary = (await getPrimaryWorkArea()) ?? monitors[0];

  if (!primary) return false;

  const areas = monitors.length > 0 ? monitors : [primary];
  const host =
    findHostWorkArea(position, areas, windowSize, 0) ??
    findNearestWorkArea(position, areas, windowSize) ??
    primary;
  const buddyCenterX = position.x + windowSize.width / 2;
  const displayCenterX = host.x + host.width / 2;

  return buddyCenterX < displayCenterX;
}
