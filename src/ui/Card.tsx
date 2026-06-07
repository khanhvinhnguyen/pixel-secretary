import type { HTMLAttributes, ReactNode } from "react";

export type PixelCardTone = "bright" | "paper" | "sky";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: PixelCardTone;
  children: ReactNode;
}

export function Card({
  tone = "bright",
  className = "",
  children,
  ...props
}: CardProps) {
  const toneClass =
    tone === "paper"
      ? "pixel-card--paper"
      : tone === "sky"
        ? "pixel-card--sky"
        : "";

  const classes = ["pixel-card", toneClass, className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
