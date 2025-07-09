import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle<{ theme: ThemeType }>`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    --color-text: rgba(255, 255, 255, 0.95);
    --color-background: #0a0a0f;
    --color-primary: #00ff88;
    --color-secondary: #ff0080;
    --color-team-red: #ff0040;
    --color-team-blue: #00d4ff;
    --color-card: rgba(255, 255, 255, 0.02);
    --color-dashboard: rgba(255, 255, 255, 0.05);
  }

  body {
    font-family: "JetBrains Mono", "Courier New", monospace;
    background: #0a0a0f;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    padding: 0;
    min-height: 100vh;
    position: relative;
  }

  body::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.01) 2px,
      rgba(255, 255, 255, 0.01) 4px
    );
    pointer-events: none;
    z-index: 999;
  }

  @media (max-width: 768px) {
    body {
      overflow: hidden;
      position: fixed;
      width: 100%;
      height: 100%;
    }
  }
`;

export interface ThemeType {
  text: string;
  background: string;
  primary: string;
  secondary: string;
  card: string;
  dashboard: string;
  team1: string;
  team2: string;
  error: string;
  primaryHover: string;
  buttonText: string;
  shadowColor: string;
  shadowDark: string;
  shadowLight: string;
  disabledBackground: string;
}

export const lightTheme: ThemeType = {
  text: "rgba(255, 255, 255, 0.95)",
  background: "#0a0a0f",
  primary: "#00ff88",
  secondary: "#ff0080",
  card: "rgba(255, 255, 255, 0.02)",
  dashboard: "rgba(255, 255, 255, 0.05)",
  team1: "#ff0040",
  team2: "#00d4ff",
  error: "#ff0080",
  primaryHover: "#00cc6a",
  buttonText: "#000",
  shadowColor: "rgba(0, 0, 0, 0.3)",
  shadowDark: "rgba(0, 0, 0, 0.5)",
  shadowLight: "rgba(255, 255, 255, 0.1)",
  disabledBackground: "rgba(255, 255, 255, 0.05)",
};

export const darkTheme: ThemeType = {
  text: "rgba(255, 255, 255, 0.95)",
  background: "#0a0a0f",
  primary: "#00ff88",
  secondary: "#ff0080",
  card: "rgba(255, 255, 255, 0.02)",
  dashboard: "rgba(255, 255, 255, 0.05)",
  team1: "#ff0040",
  team2: "#00d4ff",
  error: "#ff0080",
  primaryHover: "#00cc6a",
  buttonText: "#000",
  shadowColor: "rgba(0, 0, 0, 0.3)",
  shadowDark: "rgba(0, 0, 0, 0.5)",
  shadowLight: "rgba(255, 255, 255, 0.1)",
  disabledBackground: "rgba(255, 255, 255, 0.05)",
};
