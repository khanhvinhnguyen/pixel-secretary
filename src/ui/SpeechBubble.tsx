import type { HTMLAttributes, ReactNode } from "react";

export type SpeechBubbleTone = "default" | "urgent";

export interface SpeechBubbleProps extends HTMLAttributes<HTMLDivElement> {
  tone?: SpeechBubbleTone;
  children: ReactNode;
}

export function SpeechBubble({
  tone = "default",
  className = "",
  children,
  ...props
}: SpeechBubbleProps) {
  const classes = [
    "speech-bubble",
    tone === "urgent" ? "speech-bubble--urgent" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
