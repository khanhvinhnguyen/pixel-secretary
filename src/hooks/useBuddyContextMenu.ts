import { useCallback, useEffect, useState } from "react";
import { clampContextMenuPosition } from "../utils/contextMenuClamp";

export type ContextMenuAction = "checklist" | "toggle-resize" | "reset-position";

interface ContextMenuState {
  x: number;
  y: number;
}

interface OpenMenuOptions {
  windowWidth: number;
  windowHeight: number;
  scaleFactor: number;
}

export function useBuddyContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  const openMenu = useCallback(
    (event: React.MouseEvent, options: OpenMenuOptions) => {
      event.preventDefault();
      const { x, y } = clampContextMenuPosition(
        event.clientX,
        event.clientY,
        options.windowWidth,
        options.windowHeight,
        options.scaleFactor
      );
      setMenu({ x, y });
    },
    []
  );

  const closeMenu = useCallback(() => {
    setMenu(null);
  }, []);

  useEffect(() => {
    if (!menu) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menu, closeMenu]);

  return {
    menu,
    openMenu,
    closeMenu,
  };
}
