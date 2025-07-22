import React from "react";
import styled from "styled-components";

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem; /* REDUCED from 0.75rem */
  font-size: 0.9rem; /* REDUCED from 1rem */
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const ToggleTrack = styled.button<{ $active: boolean }>`
  position: relative;
  width: 56px; /* REDUCED from 64px */
  height: 28px; /* REDUCED from 32px */
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
  left: ${props => props.$active ? '28px' : '3px'}; /* ADJUSTED for new size */
  width: 20px; /* REDUCED from 24px */
  height: 20px; /* REDUCED from 24px */
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