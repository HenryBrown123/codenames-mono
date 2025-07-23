import styled, { keyframes } from "styled-components";
import { Z_INDEX } from "@frontend/style/z-index";

const pulse = keyframes`
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
`;

/**
 * Main sidebar container - handles responsive width and visual styling
 */
export const SidebarContainer = styled.aside`
  position: relative;
  height: 100%;
  width: calc(25vw + 50px);
  min-width: 300px;
  max-width: 400px;

  /* Enhanced gradient background from prototype */
  background: linear-gradient(120deg, rgba(10, 16, 14, 0.76) 65%, rgba(20, 20, 30, 0.7) 100%);
  border-right: 1px solid var(--color-primary, #00ff88);
  box-shadow: 0 0 24px 0 rgba(64, 255, 166, 0.14);

  /* Subtle scanline effect */
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 136, 0.03) 2px,
    rgba(0, 255, 136, 0.03) 4px
  );
`;

/**
 * Three-row grid layout for consistent section positioning
 */
export const SidebarGrid = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  padding: 20px;
  gap: 20px;
  overflow-y: auto;
  overflow-x: hidden;

  /* Custom scrollbar styling */
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

/**
 * Loading indicator for refetch operations
 */
export const RefetchIndicator = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4dabf7;
  animation: ${pulse} 1.5s ease-in-out infinite;
  z-index: ${Z_INDEX.FIXED_BUTTONS};
`;
