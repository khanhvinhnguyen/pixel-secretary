import { useEffect, useRef } from "react";
import { defaultWindowIcon } from "@tauri-apps/api/app";
import { Menu, MenuItem, PredefinedMenuItem } from "@tauri-apps/api/menu";
import { TrayIcon } from "@tauri-apps/api/tray";

interface UseBuddyTrayOptions {
  ready: boolean;
  onShowBuddy: () => void;
  onHideBuddy: () => void;
}

/**
 * Menu bar / system tray — cách mở lại buddy sau khi ẩn (app vẫn chạy nền).
 */
export function useBuddyTray({
  ready,
  onShowBuddy,
  onHideBuddy,
}: UseBuddyTrayOptions) {
  const onShowRef = useRef(onShowBuddy);
  const onHideRef = useRef(onHideBuddy);

  useEffect(() => {
    onShowRef.current = onShowBuddy;
    onHideRef.current = onHideBuddy;
  }, [onShowBuddy, onHideBuddy]);

  useEffect(() => {
    if (!ready) return;

    let tray: TrayIcon | null = null;

    const setup = async () => {
      const showItem = await MenuItem.new({
        id: "show-buddy",
        text: "Hiện buddy",
        action: () => onShowRef.current(),
      });
      const hideItem = await MenuItem.new({
        id: "hide-buddy",
        text: "Ẩn buddy",
        action: () => onHideRef.current(),
      });
      const quitItem = await PredefinedMenuItem.new({ item: "Quit" });
      const menu = await Menu.new({
        items: [showItem, hideItem, quitItem],
      });

      const icon = await defaultWindowIcon();
      tray = await TrayIcon.new({
        menu,
        tooltip: "Pixel Secretary — click để mở menu",
        icon: icon ?? undefined,
        showMenuOnLeftClick: true,
      });
    };

    void setup();

    return () => {
      void tray?.close();
    };
  }, [ready]);
}
