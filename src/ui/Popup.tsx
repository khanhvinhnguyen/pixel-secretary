import type { ReactNode } from "react";

export interface PopupProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

export function Popup({ open, title, onClose, children }: PopupProps) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="pixel-popup-backdrop"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div
        className="pixel-popup"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {title ? (
          <h2
            style={{
              margin: "0 0 10px",
              fontSize: 16,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </>
  );
}
