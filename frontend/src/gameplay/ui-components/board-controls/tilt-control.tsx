import React from "react";
import styled from "styled-components";
import { Z_INDEX } from "@frontend/style/z-index";

const ControlContainer = styled.div`
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: ${Z_INDEX.TOAST};
  background: rgba(10, 10, 15, 0.95);
  border: 1px solid var(--color-primary, #00ff88);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const Label = styled.label`
  color: var(--color-primary, #00ff88);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const Slider = styled.input`
  width: 120px;
  accent-color: var(--color-primary, #00ff88);
  cursor: pointer;
`;

const Value = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.9rem;
  min-width: 35px;
  text-align: right;
`;

interface TiltControlProps {
  value: number;
  onChange: (degrees: number) => void;
}

/**
 * Board tilt control slider for 3D perspective effect
 */
export const TiltControl: React.FC<TiltControlProps> = ({ value, onChange }) => {
  return (
    <ControlContainer className="desktop-only">
      <Label htmlFor="board-tilt">Board Tilt</Label>
      <Slider
        id="board-tilt"
        type="range"
        min="0"
        max="90"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <Value>{value}°</Value>
    </ControlContainer>
  );
};