import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/fonts.css";
import "./ui/pixel-theme.css";
import "./global.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
