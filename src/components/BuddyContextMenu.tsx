import type { ContextMenuAction } from "../hooks/useBuddyContextMenu";

interface BuddyContextMenuProps {
  x: number;
  y: number;
  scaleFactor: number;
  resizeModeActive: boolean;
  onAction: (action: ContextMenuAction) => void;
  onClose: () => void;
}

export function BuddyContextMenu({
  x,
  y,
  scaleFactor,
  resizeModeActive,
  onAction,
  onClose,
}: BuddyContextMenuProps) {
  return (
    <>
      <button
        type="button"
        className="context-menu-backdrop"
        aria-label="Đóng menu"
        onClick={onClose}
      />
      <menu
        className="context-menu"
        style={
          {
            left: x,
            top: y,
            "--buddy-scale": scaleFactor,
          } as React.CSSProperties
        }
        onClick={(event) => event.stopPropagation()}
      >
        <li>
          <button type="button" onClick={() => onAction("checklist")}>
            Checklist
          </button>
        </li>
        <li>
          <button
            type="button"
            className={
              resizeModeActive ? "context-menu-option--active" : undefined
            }
            onClick={() => onAction("toggle-resize")}
          >
            Resize
          </button>
        </li>
        <li>
          <button type="button" onClick={() => onAction("reset-position")}>
            Reset position
          </button>
        </li>
      </menu>
    </>
  );
}
