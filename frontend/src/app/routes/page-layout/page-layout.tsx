import React, { ReactNode } from "react";
import styled from "styled-components";

/**
 * MOBILE-FIRST: Page wrapper that handles viewport properly
 */
const Wrapper = styled.div`
  /* Mobile-first: Use proper viewport units */
  height: 100dvh; /* Dynamic viewport height */
  min-height: 100vh; /* Fallback */
  max-height: 100vh; /* Prevent overflow */
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden; /* Prevent page-level scrolling */

  /* Account for safe areas on mobile */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);

  /* Ensure proper box model */
  box-sizing: border-box;
`;

/**
 * MOBILE-FIRST: Content area that doesn't interfere with child layouts
 */
const Content = styled.div`
  /* Mobile-first: Let children handle their own layout */
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  /* max-width: 100%;
  max-height: 100%; */
  max-width: 100%;
  height: 100%;
  min-height: 0; /* Allow shrinking */
  overflow: hidden; /* Let children handle overflow */
  position: relative;
`;

interface PageLayoutProps {
  children: ReactNode;
}

/**
 * Page layout component with mobile-first viewport handling
 */
const PageLayout: React.FC<PageLayoutProps> = ({ children }) => (
  <Wrapper id="page-content-wrapper">
    <Content id="page-content">{children}</Content>
  </Wrapper>
);

export default PageLayout;
