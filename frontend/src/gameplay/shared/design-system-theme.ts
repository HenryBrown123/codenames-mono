import { css } from "styled-components";

/**
 * Design System Theme
 * CSS variables and common styles from the design-system.css
 */

export const designSystemTheme = {
  // Core Colors
  colors: {
    background: "#0a0a0f",
    surface1: "rgba(255, 255, 255, 0.02)",
    surface2: "rgba(255, 255, 255, 0.05)",
    surface3: "rgba(255, 255, 255, 0.08)",
    
    // Mission Colors
    teamRed: "#ff0040",
    teamBlue: "#00d4ff",
    neutral: "#888888",
    assassin: "#000000",
    
    // UI Colors
    primary: "#00ff88",
    primaryHover: "#00cc6a",
    accent: "#ff0080",
    text: "rgba(255, 255, 255, 0.95)",
    textMuted: "rgba(255, 255, 255, 0.6)",
    border: "rgba(255, 255, 255, 0.1)",
    borderHover: "rgba(255, 255, 255, 0.3)",
  },
  
  // Spacing Scale
  space: {
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  
  // Border Radius
  radius: {
    md: "8px",
    lg: "12px",
  },
  
  // Transitions
  transition: {
    normal: "250ms ease",
  },
  
  // Typography
  font: {
    family: '"JetBrains Mono", "Courier New", monospace',
    sizeSm: "0.875rem",
    sizeMd: "1rem",
    sizeLg: "1.25rem",
  },
};

// Global styles to be injected
export const GlobalDesignSystemStyles = css`
  body {
    font-family: ${designSystemTheme.font.family};
    background:
      radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 0, 128, 0.1) 0%, transparent 50%),
      ${designSystemTheme.colors.background};
    color: ${designSystemTheme.colors.text};
    position: relative;
  }

  /* Scanline effect overlay */
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
`;

// Panel styling mixin
export const panelStyles = css`
  background-color: ${designSystemTheme.colors.surface2};
  border: 1px solid ${designSystemTheme.colors.border};
  border-radius: ${designSystemTheme.radius.lg};
  padding: ${designSystemTheme.space.lg};
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  
  &::before {
    content: "INTEL";
    position: absolute;
    top: 0.5rem;
    right: 1rem;
    font-size: 0.7rem;
    color: ${designSystemTheme.colors.primary};
    opacity: 0.3;
    letter-spacing: 0.2em;
  }
`;

// Button styling mixin
export const buttonPrimaryStyles = css`
  padding: ${designSystemTheme.space.md} ${designSystemTheme.space.lg};
  border: 1px solid ${designSystemTheme.colors.primary};
  border-radius: ${designSystemTheme.radius.md};
  font-weight: 700;
  font-size: ${designSystemTheme.font.sizeMd};
  cursor: pointer;
  transition: all ${designSystemTheme.transition.normal};
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: ${designSystemTheme.font.family};
  background-color: transparent;
  color: ${designSystemTheme.colors.primary};
  text-align: center;
  
  &:hover {
    background-color: ${designSystemTheme.colors.primary};
    color: #000;
    box-shadow: 0 5px 15px rgba(0, 255, 136, 0.4);
  }
`;

// Glitch animation for headings
export const glitchAnimation = css`
  @keyframes glitch {
    0%, 100% {
      text-shadow:
        0 0 2px ${designSystemTheme.colors.primary},
        0 0 4px ${designSystemTheme.colors.primary};
    }
    25% {
      text-shadow:
        -2px 0 ${designSystemTheme.colors.teamRed},
        2px 0 ${designSystemTheme.colors.teamBlue};
    }
    50% {
      text-shadow:
        2px 0 ${designSystemTheme.colors.accent},
        -2px 0 ${designSystemTheme.colors.primary};
    }
    75% {
      text-shadow:
        0 0 2px ${designSystemTheme.colors.teamBlue},
        0 0 4px ${designSystemTheme.colors.teamBlue};
    }
  }
  
  animation: glitch 4s infinite;
`;

// Board area styling
export const boardAreaStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: ${designSystemTheme.radius.lg};
  padding: ${designSystemTheme.space.xl};
  min-height: 0;
  background: linear-gradient(
    90deg,
    #8b6939 0%,
    #a0743f 20%,
    #7d5d33 40%,
    #946b3a 60%,
    #8b6939 80%,
    #a0743f 100%
  );
  border: 1px solid ${designSystemTheme.colors.border};
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  
  @media (max-width: 768px) {
    padding: ${designSystemTheme.space.md};
  }
  
  @media (max-width: 480px) {
    padding: ${designSystemTheme.space.sm};
  }
`;