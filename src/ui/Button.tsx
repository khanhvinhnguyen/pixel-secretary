import type { ButtonHTMLAttributes, ReactNode } from "react";

export type PixelButtonVariant =
  | "gold"
  | "mint"
  | "coral"
  | "sky"
  | "purple"
  | "paper";

export interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PixelButtonVariant;
  icon?: boolean;
  block?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "gold",
  icon = false,
  block = false,
  className = "",
  type = "button",
  children,
  ...props
}: PixelButtonProps) {
  const classes = [
    "pixel-btn",
    "pixel-pressable",
    `pixel-btn--${variant}`,
    icon ? "pixel-btn--icon" : "",
    block ? "pixel-btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
