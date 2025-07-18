import styled, { keyframes } from "styled-components";

const cursorBlink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

export const TerminalContent = styled.div`
  flex: 1;
  padding: 1rem;  /* CHANGED from 1.5rem */
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  color: var(--color-primary, #00ff88);
  font-size: 0.9rem;
  line-height: 1.3;  /* CHANGED from 1.4 - tighter */
  
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
  margin-bottom: 1rem;  /* CHANGED from 1.5rem */
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const TerminalPrompt = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  
  &::before {
    content: ">";
    opacity: 0.5;
    flex-shrink: 0;
  }
`;

export const TerminalOutput = styled.div`
  padding-left: 1rem;
  opacity: 0.9;
`;

export const TerminalCommand = styled.div`
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  color: #ffffff;
`;

export const TerminalStatus = styled.div<{ $type?: 'success' | 'warning' | 'error' }>`
  padding: 0.75rem 1rem;
  margin: 0.5rem 0;
  border-radius: 4px;
  background: ${props => {
    switch(props.$type) {
      case 'success': return 'rgba(0, 255, 136, 0.1)';
      case 'warning': return 'rgba(255, 255, 0, 0.1)';
      case 'error': return 'rgba(255, 0, 0, 0.1)';
      default: return 'rgba(0, 255, 136, 0.05)';
    }
  }};
  border-left: 3px solid ${props => {
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
  margin: 1rem 0;  /* CHANGED from 1.5rem 0 */
`;

export const TerminalActions = styled.div`
  margin-top: auto;
  padding-top: 0.5rem;  /* CHANGED from 1rem */
  display: flex;
  flex-direction: column;
  gap: 0.75rem;  /* CHANGED from 1rem */
`;

export const TerminalCursor = styled.span`
  display: inline-block;
  width: 8px;
  height: 1.2em;
  background: var(--color-primary, #00ff88);
  margin-left: 2px;
  animation: ${cursorBlink} 1s infinite;
`;