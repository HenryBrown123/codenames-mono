import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle<{ theme: ThemeType }>`
  * {
    box-sizing: border-box;
    font-family: 'Courier New', monospace;
  }

  div {
    // border: 1px dashed red; // for layout debugging
  }

  html {
    --color-text: ${({ theme }) => theme.text};
    --color-background: ${({ theme }) => theme.background};
    --color-primary: ${({ theme }) => theme.primary};
    --color-secondary: ${({ theme }) => theme.secondary};
    --color-card: ${({ theme }) => theme.card};
    --color-dashboard: ${({ theme }) => theme.dashboard};
    --color-team1: ${({ theme }) => theme.team1};
    --color-team2: ${({ theme }) => theme.team2};
  }

  body {
    color: var(--color-text);
    background: ${({ theme }) => theme.background};  /* Direct theme access instead of CSS variable */
    margin: 0;
    padding: 0;
    min-height: 100vh;  /* Ensure body covers full viewport */
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
      rgba(0, 255, 0, 0.03) 2px,
      rgba(0, 255, 0, 0.03) 4px
    );
    pointer-events: none;
    z-index: 1;
  }

  @media (max-width: 768px) {
    body {
      overflow: hidden;
      //position: fixed;
      width: 100%;
      height: 100%;
      /* background: ${({ theme }) => theme.background}; */
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
  text: "white",
  background: "radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0f 100%)",
  primary: "#00ff88",
  secondary: "#00cc6a",
  card: "#00000096",
  dashboard: "rgba(20, 20, 20, 0.8)",
  team1: "#B85555",
  team2: "#5588B8",
  error: "#cc2e2e",
  primaryHover: "#00cc6a",
  buttonText: "white",
  shadowColor: "rgba(0, 0, 0, 0.3)",
  shadowDark: "black",
  shadowLight: "rgba(255, 255, 255, 0.1)",
  disabledBackground: "rgba(255, 255, 255, 0.1)",
};

export const darkTheme: ThemeType = {
  text: "white",
  background: "radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0f 100%)",
  primary: "#00ff88",
  secondary: "#00cc6a",
  card: "#2e2e2e",
  dashboard: "rgba(20, 20, 20, 0.8)",
  team1: "#B85555",
  team2: "#5588B8",
  error: "#cc2e2e",
  primaryHover: "#00cc6a",
  buttonText: "white",
  shadowColor: "rgba(0, 0, 0, 0.3)",
  shadowDark: "black",
  shadowLight: "rgba(255, 255, 255, 0.1)",
  disabledBackground: "rgba(255, 255, 255, 0.1)",
};
