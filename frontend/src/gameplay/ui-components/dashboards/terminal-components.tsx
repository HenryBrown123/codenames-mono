import styled, { keyframes } from "styled-components";

const cursorBlink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

export const TerminalContent = styled.div`
  flex: 1;
  padding: 2rem;  /* BIG padding */
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  color: var(--color-primary, #00ff88);
  font-size: 1.1rem;  /* BIGGER base font */
  line-height: 1.6;  /* COMFORTABLE line height */
  
  /* Subtle scanline effect */
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 136, 0.03) 2px,
    rgba(0, 255, 136, 0.03) 4px
  );

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 255, 136, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-primary, #00ff88);
    border-radius: 4px;
  }
`;

export const TerminalSection = styled.div`
  margin-bottom: 2.5rem;  /* BIG sections */
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const TerminalPrompt = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 1.2rem;  /* BIGGER prompts */
  
  &::before {
    content: ">";
    opacity: 0.5;
    flex-shrink: 0;
  }
`;

export const TerminalOutput = styled.div`
  padding-left: 1.5rem;
  opacity: 0.9;
  font-size: 1.2rem;  /* Match prompt size */
`;

export const TerminalCommand = styled.div`
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
  color: #ffffff;
  font-size: 1.4rem;  /* BIG headers */
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
`;

export const TerminalStatus = styled.div<{ $type?: 'success' | 'warning' | 'error' }>`
  padding: 1rem 1.5rem;  /* COMFORTABLE padding */
  margin: 1rem 0;
  border-radius: 8px;
  font-size: 1.1rem;  /* READABLE text */
  line-height: 1.5;
  background: ${props => {
    switch(props.$type) {
      case 'success': return 'rgba(0, 255, 136, 0.1)';
      case 'warning': return 'rgba(255, 255, 0, 0.1)';
      case 'error': return 'rgba(255, 0, 0, 0.1)';
      default: return 'rgba(0, 255, 136, 0.05)';
    }
  }};
  border-left: 4px solid ${props => {
    switch(props.$type) {
      case 'success': return '#00ff88';
      case 'warning': return '#ffff00';
      case 'error': return '#ff0040';
      default: return 'var(--color-primary, #00ff88)';
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
  margin: 2rem 0;  /* SPACIOUS dividers */
`;

export const TerminalActions = styled.div`
  margin-top: auto;
  padding-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;  /* COMFORTABLE gap between actions */
`;

export const TerminalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const CompactTerminalActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;  /* BIG gap */
  margin-top: auto;
  padding-top: 2rem;
`;

export const ARStatusBar = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: ${props => props.$active 
    ? 'rgba(0, 255, 136, 0.1)' 
    : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 8px;
  font-size: 1rem;
  color: ${props => props.$active 
    ? 'var(--color-primary, #00ff88)' 
    : 'rgba(255, 255, 255, 0.5)'};
  border: 1px solid ${props => props.$active 
    ? 'rgba(0, 255, 136, 0.3)' 
    : 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.3s ease;
  
  &::before {
    content: "●";
    font-size: 1.2rem;
    color: ${props => props.$active ? '#00ff88' : '#666'};
    text-shadow: ${props => props.$active ? '0 0 8px currentColor' : 'none'};
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
  gap: 1rem;
  margin: 1rem 0;
`;

export const ToggleHint = styled.span`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.4);
  font-family: "JetBrains Mono", monospace;
`;