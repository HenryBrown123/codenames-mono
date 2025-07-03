import { createGlobalStyle, keyframes } from "styled-components";

const pulse = keyframes`
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
`;

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
    --color-team1: ${({ theme }) => theme.team1} | "red";
    --color-team2: ${({ theme }) => theme.team2} | "green";
    --color-background-size: "cover"
  }

  body {
    color: var(--color-text);
    background-image: var(--color-background);
    //background-repeat: no-repeat; // Prevents the background from repeating
    margin: 0;
    padding: 0;
    background-size: var(--color-background-size);
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.6;
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

// @ts-ignore
import lightBackgroundImage from "/background-light.webp";

export const lightTheme: ThemeType = {
  text: "white",
  background: `url(${lightBackgroundImage})`,
  primary: "#44a85a",
  secondary: "#a6eb25ba",
  card: "#00000096",
  dashboard: "#1a1a1a",
  team1: "#ae3751e1",
  team2: "rgb(71 134 64)",
  error: "#cc2e2e",
  primaryHover: "#3b954f",
  buttonText: "white",
  shadowColor: "gray",
  shadowDark: "black",
  shadowLight: "white",
  disabledBackground: "lightgray",
};

// @ts-ignore
import darkBackgroundImage from "/background-dark-2.webp";

export const darkTheme: ThemeType = {
  text: "white",
  background: `url(${darkBackgroundImage})`,
  primary: "#1e8c4a",
  secondary: "#7bcf22",
  card: "#2e2e2e",
  dashboard: "#1a1a1a",
  team1: "#ae3751e1",
  team2: "rgb(71 134 64)",
  error: "#cc2e2e",
  primaryHover: "#176c3c",
  buttonText: "white",
  shadowColor: "darkgray",
  shadowDark: "black",
  shadowLight: "gray",
  disabledBackground: "#2e2e2e",
};
