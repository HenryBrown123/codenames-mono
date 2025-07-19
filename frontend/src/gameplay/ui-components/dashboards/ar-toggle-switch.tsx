import React from "react";
import styled from "styled-components";

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;  /* BIGGER labels */
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const ToggleTrack = styled.button<{ $active: boolean }>`
  position: relative;
  width: 64px;  /* BIGGER switch */
  height: 32px;
  background: ${props => props.$active 
    ? 'var(--color-primary, #00ff88)' 
    : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => props.$active 
    ? 'var(--color-primary, #00ff88)' 
    : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  
  &:hover {
    border-color: var(--color-primary, #00ff88);
    box-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
  }
`;

const ToggleThumb = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 3px;
  left: ${props => props.$active ? '32px' : '3px'};
  width: 24px;
  height: 24px;
  background: ${props => props.$active ? '#000' : '#fff'};
  border-radius: 50%;
  transition: all 0.3s ease;
  pointer-events: none;
`;

const ToggleLabel = styled.span<{ $active: boolean }>`
  color: ${props => props.$active 
    ? 'var(--color-primary, #00ff88)' 
    : 'rgba(255, 255, 255, 0.5)'};
  font-weight: 700;
  transition: color 0.3s ease;
`;

interface ARToggleSwitchProps {
  active: boolean;
  onChange: () => void;
}

export const ARToggleSwitch: React.FC<ARToggleSwitchProps> = ({ active, onChange }) => {
  return (
    <ToggleContainer>
      <ToggleLabel $active={!active}>OFF</ToggleLabel>
      <ToggleTrack $active={active} onClick={onChange}>
        <ToggleThumb $active={active} />
      </ToggleTrack>
      <ToggleLabel $active={active}>AR</ToggleLabel>
    </ToggleContainer>
  );
};