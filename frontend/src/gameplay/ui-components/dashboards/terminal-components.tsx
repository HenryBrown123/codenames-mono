import styled, { keyframes } from "styled-components";

const cursorBlink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

export const TerminalContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Consistent spacing between sections */
  padding: 1.5rem;
  color: var(--color-primary, #00ff88);
  font-size: 1rem;
  line-height: 1.4;
  overflow: hidden; /* No scrolling needed */

  /* Subtle scanline effect */
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 136, 0.03) 2px,
    rgba(0, 255, 136, 0.03) 4px
  );

  /* Hide scrollbar but keep scrollable */
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary, #00ff88) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-primary, #00ff88);
    border-radius: 2px;
    opacity: 0.5;
  }
`;

export const TerminalSection = styled.div`
  /* Simple section with no special spacing */
`;

export const TerminalPrompt = styled.div`
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 0.5rem; /* REDUCED from 0.75rem */
  font-size: 1rem; /* REDUCED from 1.2rem */

  &::before {
    content: ">";
    opacity: 0.5;
    flex-shrink: 0;
  }
`;

export const TerminalOutput = styled.div`
  padding-left: 1rem; /* REDUCED from 1.5rem */
  opacity: 0.9;
  font-size: 1rem; /* REDUCED from 1.2rem */
`;

export const cornerBlink = keyframes`
  0%, 100% {
      border: 1.5px solid #ff6200;
  }
  25% {
      border: 1.5px solid #ff62007e;

  }
  50% {
      border: 1.5px solid #ff6200a1;
  }
  75% {
      border: 1.5px solid #ff62007e;

  }
`;

export const TerminalMessageBlock = styled.pre`
  background: rgba(0, 255, 136, 0.08);
  border: 1.5px solid #ff6200;
  box-shadow: 0 0 12px 1px rgba(0, 255, 136, 0.11);
  border-radius: 8px;
  color: var(--color-primary, #00ff88);
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 1.08rem;
  padding: 1.1rem 1.5rem 1.1rem 2.5rem;
  margin: 1rem 0 1.5rem 0;
  position: relative;
  text-shadow:
    0 0 6px #0f3,
    0 0 2px #0c8;
  white-space: pre-line;
  overflow-x: auto;

  &::before {
    content: ">";
    position: absolute;
    top: 1.15rem;
    left: 1.1rem;
    color: var(--color-primary, #00ff88);
    opacity: 0.5;
    font-size: 1.08rem;
    font-family: inherit;
  }

  /* Animated blinking for "targeting" effect */
  @media (prefers-reduced-motion: no-preference) {
    animation: ${cornerBlink} 2s ease-in-out infinite;
  }
`;

export const TerminalCommand = styled.div`
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.75rem; /* REDUCED from 1rem */
  color: #ffffff;
  font-size: 1.2rem; /* REDUCED from 1.4rem */
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
`;

export const TerminalStatus = styled.div<{ $type?: "success" | "warning" | "error" }>`
  padding: 1rem 1.5rem; /* COMFORTABLE padding */
  margin: 1rem 0;
  border-radius: 8px;
  font-size: 1.1rem; /* READABLE text */
  line-height: 1.5;
  background: ${(props) => {
    switch (props.$type) {
      case "success":
        return "rgba(0, 255, 136, 0.1)";
      case "warning":
        return "rgba(255, 255, 0, 0.1)";
      case "error":
        return "rgba(255, 0, 0, 0.1)";
      default:
        return "rgba(0, 255, 136, 0.05)";
    }
  }};
  border-left: 4px solid
    ${(props) => {
      switch (props.$type) {
        case "success":
          return "#00ff88";
        case "warning":
          return "#ffff00";
        case "error":
          return "#ff0040";
        default:
          return "var(--color-primary, #00ff88)";
      }
    }};
`;

export const TerminalDivider = styled.div`
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-primary, #00ff88) 50%,
    transparent 100%
  );
  opacity: 0.3;
  margin: 1.25rem 0; /* REDUCED from 2rem */
`;

export const TerminalActions = styled.div`
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(0, 255, 136, 0.2);
`;

export const TerminalHeader = styled.div`
  display: flex;
  min-width: 0;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const CompactTerminalActions = styled(TerminalActions)`
  gap: 1.25rem;
`;

export const ARStatusBar = styled.div<{ $active: boolean }>`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.5rem; /* REDUCED from 0.75rem */
  padding: 0.5rem 1rem; /* REDUCED from 0.75rem 1.25rem */
  background: ${(props) =>
    props.$active ? "rgba(0, 255, 136, 0.1)" : "rgba(255, 255, 255, 0.05)"};
  border-radius: 8px;
  font-size: 0.9rem; /* REDUCED from 1rem */
  color: ${(props) =>
    props.$active ? "var(--color-primary, #00ff88)" : "rgba(255, 255, 255, 0.5)"};
  border: 1px solid
    ${(props) => (props.$active ? "rgba(0, 255, 136, 0.3)" : "rgba(255, 255, 255, 0.1)")};
  transition: all 0.3s ease;

  &::before {
    content: "●";
    font-size: 1.2rem;
    color: ${(props) => (props.$active ? "#00ff88" : "#666")};
    text-shadow: ${(props) => (props.$active ? "0 0 8px currentColor" : "none")};
  }
`;

export const TerminalCursor = styled.span`
  display: inline-block;
  width: 10px;
  height: 1.4em;
  background: var(--color-primary, #00ff88);
  margin-left: 4px;
  animation: ${cursorBlink} 1s infinite;
`;

export const TerminalToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem; /* REDUCED from 1rem */
  margin: 0.75rem 0; /* REDUCED from 1rem */
`;

export const ToggleHint = styled.span`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.4);
  font-family: "JetBrains Mono", monospace;
`;

export const TerminalTop = styled.div`
  flex-shrink: 0;
`;

export const TerminalMiddle = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center; // or flex-start if you don't want centering
`;

export const TerminalBottom = styled.div`
  flex-shrink: 0;
  margin-top: auto; // This ensures it sticks to bottom
`;
