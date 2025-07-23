import styled, { keyframes, css } from "styled-components";

const cursorBlink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

const spyDotBlink = keyframes`
  0%, 100% { filter: brightness(1.03); }
  50% { filter: brightness(1.45); }
`;

/**
 * Simple wrapper for mobile view compatibility
 */
export const TerminalContent = styled.div`
  color: var(--color-primary, #00ff88);
  font-size: 1rem;
  line-height: 1.4;
`;

/**
 * Terminal section card - provides visual container for content
 * No margin needed - parent grid handles spacing
 */
export const TerminalSection = styled.div`
  border: 1px solid rgba(0, 255, 136, 0.5);
  border-radius: 6px;
  padding: 15px;
  background: rgba(64, 255, 166, 0.03);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(1px);
  transition:
    border-color 0.7s,
    background 0.7s;
`;

export const TerminalPrompt = styled.div`
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 1rem;

  &::before {
    content: ">";
    opacity: 0.5;
    flex-shrink: 0;
  }
`;

export const TerminalOutput = styled.div`
  padding-left: 1rem;
  opacity: 0.9;
  font-size: 1rem;
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
  margin-bottom: 10px;
  color: var(--color-primary, #00ff88);
  font-size: 1.1rem;
  text-shadow: 0 0 7px rgba(0, 255, 136, 0.5);
  border-bottom: 1px solid rgba(0, 255, 136, 0.5);
  padding-bottom: 10px;
  letter-spacing: 2px;
`;

export const TerminalStatus = styled.div<{ $type?: "success" | "warning" | "error" }>`
  padding: 1rem 1.5rem;
  margin: 1rem 0;
  border-radius: 8px;
  font-size: 1.1rem;
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
  margin: 1.25rem 0;
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
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${(props) =>
    props.$active ? "rgba(0, 255, 136, 0.1)" : "rgba(255, 255, 255, 0.05)"};
  border-radius: 8px;
  font-size: 0.9rem;
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
  gap: 0.75rem;
  margin: 0.75rem 0;
`;

/**
 * Wrapper for middle grid section - ensures it fills available space
 */
export const MiddleSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;

  /* Ensure the terminal section inside stretches if needed */
  > ${TerminalSection} {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
`;

/**
 * Spy goggles container with minimum height for better spacing
 */
export const SpyGogglesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  min-height: 120px;
`;

export const SpyGogglesText = styled.p`
  margin: 7px 0 15px 0;
  color: #b5dbcc;
  font-size: 0.97em;
  text-align: left;
  line-height: 1.4;
`;

export const SpyGogglesSwitchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: flex-start;
`;

export const SpyGogglesDot = styled.span<{ $active: boolean }>`
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${(props) => (props.$active ? "#00ff88" : "#355e4b")};
  box-shadow: ${(props) => (props.$active ? "0 0 18px 2px rgba(0, 255, 136, 0.5)" : "none")};
  margin-right: 8px;
  transition:
    background 0.28s,
    box-shadow 0.28s;
  vertical-align: middle;

  ${(props) =>
    props.$active &&
    css`
      animation: ${spyDotBlink} 1.25s infinite alternate;
    `}
`;

export const SpySwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
  border-radius: 16px;
  background: #1a2521;
  border: 1.5px solid rgba(0, 255, 136, 0.5);
  box-shadow: 0 1.5px 8px rgba(0, 255, 136, 0.5);
  vertical-align: middle;
  transition:
    background 0.18s,
    border-color 0.18s;
  cursor: pointer;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
`;

export const SpySlider = styled.span`
  position: absolute;
  cursor: pointer;
  border-radius: 16px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  transition: background 0.13s;

  &:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 2.5px;
    bottom: 1.7px;
    border-radius: 50%;
    background: rgba(0, 255, 136, 0.5);
    box-shadow: 0 0 7px 0px rgba(0, 255, 136, 0.5);
    transition:
      transform 0.23s,
      box-shadow 0.23s,
      background 0.23s;
  }

  input:checked + & {
    background: linear-gradient(90deg, rgba(0, 255, 136, 0.5) 0%, transparent 80%);
  }

  input:checked + &:before {
    transform: translateX(20px);
    background: #00ff88;
    box-shadow:
      0 0 16px 1px rgba(0, 255, 136, 0.5),
      0 0 0 1px #fff9 inset;
  }
`;

export const SpyStatus = styled.span<{ $active: boolean }>`
  font-size: 1em;
  font-weight: ${(props) => (props.$active ? "bold" : "normal")};
  letter-spacing: 1.1px;
  color: ${(props) => (props.$active ? "#00ff88" : "#555")};
  opacity: ${(props) => (props.$active ? 0.97 : 0.7)};
  margin-left: 14px;
  min-width: 52px;
  text-align: left;
  transition:
    color 0.2s,
    opacity 0.2s;
`;
