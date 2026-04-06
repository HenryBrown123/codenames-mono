import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import { initTerminalColour } from "./game/gameplay/dashboard/settings/use-terminal-colour";

// Apply saved terminal colour before render
initTerminalColour();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
