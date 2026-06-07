import { BuddyApp } from "./BuddyApp";
import { ChecklistApp } from "./ChecklistApp";
import { getCurrentWindowLabel } from "./window/checklistWindow";
import "./App.css";

function App() {
  const label = getCurrentWindowLabel();

  if (label === "checklist") {
    return <ChecklistApp />;
  }

  return <BuddyApp />;
}

export default App;
