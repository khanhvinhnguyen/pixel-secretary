import { Button } from "../ui/Button";

const PLACEHOLDER_TASKS = [
  "Dọn inbox",
  "Hoàn thành mockup pixel",
  "Đặt nhắc task tiếp theo",
  "Ghi 1 việc làm kế tiếp",
  "Kiểm tra block focus hôm nay",
];

interface NotebookPanelContentProps {
  onClose: () => void;
}

export function NotebookPanelContent({ onClose }: NotebookPanelContentProps) {
  return (
    <div className="notebook-panel" role="dialog" aria-label="Checklist">
      <header className="notebook-header" data-tauri-drag-region>
        <h1 className="notebook-title">Checklist</h1>
        <Button
          variant="coral"
          icon
          className="notebook-close"
          aria-label="Đóng checklist"
          onClick={onClose}
        >
          ×
        </Button>
      </header>

      <div className="notebook-body">
        <ul className="notebook-checklist">
          {PLACEHOLDER_TASKS.map((task) => (
            <li key={task} className="notebook-checklist__item">
              <span
                className="notebook-checklist__box pixel-checkbox"
                aria-hidden
              />
              <span>{task}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface NotebookTabProps {
  open: boolean;
  onToggle: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
}

export function NotebookTab({ open, onToggle, onContextMenu }: NotebookTabProps) {
  return (
    <button
      type="button"
      className={`notebook-tab ${open ? "notebook-tab--open" : ""}`}
      aria-expanded={open}
      aria-label={open ? "Đóng checklist" : "Mở checklist"}
      onClick={onToggle}
      onContextMenu={onContextMenu}
    >
      <span className="notebook-tab__label">LIST</span>
    </button>
  );
}
