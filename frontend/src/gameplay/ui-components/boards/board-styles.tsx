import styled from "styled-components";

/**
 * MOBILE-FIRST: Board wrapper that handles different viewport constraints
 */
export const BoardAspectWrapper = styled.div`
  /* Mobile-first: Use available space efficiently */
  width: 100%;
  max-width: 100%; /* CHANGED from 900px - wider board */
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;

  /* PROGRESSIVE ENHANCEMENT: Tablet - more breathing room */
  @media (min-width: 481px) {
    padding: 0.5rem;
    max-width: 100%; /* CHANGED from 900px - wider board */
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop - maintain aspect ratio */
  @media (min-width: 1025px) {
    max-width: 100%; /* CHANGED from 900px - wider board */
    aspect-ratio: 5 / 4;
    padding: 1rem;
  }
`;

/**
 * MOBILE-FIRST: Adaptive grid that works across all screen sizes
 */
export const BoardGrid = styled.div`
  /* Mobile-first: Shorter cards for more board visibility */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 0.5rem; /* CHANGED from 0.75rem - tighter gap */
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow-y: auto;

  /* Ensure minimum touch targets but not too tall */
  & > * {
    min-height: 50px; /* CHANGED from 60px */
    aspect-ratio: 3 / 2; /* ADD - consistent card proportions */
    max-width: 100%;
  }

  /* PROGRESSIVE ENHANCEMENT: Small tablet */
  @media (min-width: 481px) {
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 1rem;

    & > * {
      min-height: 70px;
    }
  }

  /* PROGRESSIVE ENHANCEMENT: Large tablet */
  @media (min-width: 769px) {
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 1.25rem;

    & > * {
      min-height: 80px;
    }
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop - return to 5x5 grid */
  @media (min-width: 1025px) {
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: 1.5rem; /* CHANGED from 2rem - tighter gap = bigger cards */
    overflow-y: visible;

    & > * {
      min-height: 100px;
    }
  }
`;

/**
 * Mobile-first empty card for loading/skeleton states
 */
export const EmptyCard = styled.div`
  background-color: rgba(27, 9, 9, 0.25);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.123);
  min-height: 50px; /* CHANGED from 60px */
  aspect-ratio: 3 / 2; /* CHANGED from 2.4 / 3 */

  /* PROGRESSIVE ENHANCEMENT: Tablet */
  @media (min-width: 481px) {
    border-radius: 8px;
    min-height: 70px;
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop */
  @media (min-width: 769px) {
    border-radius: 12px;
    min-height: 80px;
  }

  @media (min-width: 1025px) {
    min-height: 100px;
  }
`;
