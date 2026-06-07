import type { ResizeHandleId } from "../window/buddyResize";

const RESIZE_HANDLES: {
  id: ResizeHandleId;
  positionClass: string;
  label: string;
}[] = [
  { id: "nw", positionClass: "buddy-resize-handle--nw", label: "Góc trên trái" },
  { id: "n", positionClass: "buddy-resize-handle--n", label: "Cạnh trên" },
  { id: "ne", positionClass: "buddy-resize-handle--ne", label: "Góc trên phải" },
  { id: "w", positionClass: "buddy-resize-handle--w", label: "Cạnh trái" },
  { id: "e", positionClass: "buddy-resize-handle--e", label: "Cạnh phải" },
  { id: "sw", positionClass: "buddy-resize-handle--sw", label: "Góc dưới trái" },
  { id: "s", positionClass: "buddy-resize-handle--s", label: "Cạnh dưới" },
  { id: "se", positionClass: "buddy-resize-handle--se", label: "Góc dưới phải" },
];

interface BuddyResizeFrameProps {
  scaleFactor: number;
  onHandlePointerDown: (
    handle: ResizeHandleId,
    event: React.PointerEvent<HTMLButtonElement>
  ) => void;
}

export function BuddyResizeFrame({
  scaleFactor,
  onHandlePointerDown,
}: BuddyResizeFrameProps) {
  return (
    <>
      <div className="buddy-resize-frame" aria-hidden>
        <span className="buddy-resize-frame__corner buddy-resize-frame__corner--tl" />
        <span className="buddy-resize-frame__corner buddy-resize-frame__corner--tr" />
        <span className="buddy-resize-frame__corner buddy-resize-frame__corner--bl" />
        <span className="buddy-resize-frame__corner buddy-resize-frame__corner--br" />
      </div>

      {RESIZE_HANDLES.map((handle) => (
        <button
          key={handle.id}
          type="button"
          className={`buddy-resize-handle ${handle.positionClass}`}
          aria-label={handle.label}
          style={{ "--buddy-scale": scaleFactor } as React.CSSProperties}
          onPointerDown={(event) => onHandlePointerDown(handle.id, event)}
        />
      ))}

      <p className="buddy-resize-hint">8 điểm kéo · Esc thoát</p>
    </>
  );
}
