const BASE_MENU_WIDTH = 176;
const BASE_MENU_HEIGHT = 210;

/** Approximate bottom-right buddy + speech bubble region to avoid covering. */
function buddyAvoidRect(windowWidth: number, windowHeight: number, scale: number) {
  return {
    left: windowWidth - 250 * scale,
    top: windowHeight - 190 * scale,
    right: windowWidth - 8,
    bottom: windowHeight - 8,
  };
}

function rectsOverlap(
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number }
): boolean {
  return !(
    a.right <= b.left ||
    a.left >= b.right ||
    a.bottom <= b.top ||
    a.top >= b.bottom
  );
}

export function clampContextMenuPosition(
  clientX: number,
  clientY: number,
  windowWidth: number,
  windowHeight: number,
  scale = 1
): { x: number; y: number } {
  const menuW = BASE_MENU_WIDTH * scale;
  const menuH = BASE_MENU_HEIGHT * scale;
  const padding = 8;

  let x = clientX;
  let y = clientY;

  if (x + menuW > windowWidth - padding) {
    x = clientX - menuW;
  }

  if (y + menuH > windowHeight - padding) {
    y = clientY - menuH;
  }

  x = Math.max(padding, Math.min(x, windowWidth - menuW - padding));
  y = Math.max(padding, Math.min(y, windowHeight - menuH - padding));

  const menuRect = { left: x, top: y, right: x + menuW, bottom: y + menuH };
  const avoid = buddyAvoidRect(windowWidth, windowHeight, scale);

  if (rectsOverlap(menuRect, avoid)) {
    const aboveY = clientY - menuH;
    if (aboveY >= padding) {
      y = aboveY;
    } else {
      x = Math.max(padding, clientX - menuW);
    }

    x = Math.max(padding, Math.min(x, windowWidth - menuW - padding));
    y = Math.max(padding, Math.min(y, windowHeight - menuH - padding));
  }

  return { x, y };
}
