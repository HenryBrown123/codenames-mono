import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import styled from "styled-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AppRoutes from "./routes/app-routes";
import { GlobalStyle, lightTheme, darkTheme } from "../style";

/**
 * CLEAN APPROACH: Let CSS do what it's designed to do
 * WITH MOBILE BROWSER FIXES
 */
const AppContainer = styled.div`
  /* Use the standard approach that works everywhere */
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh; /* Progressive enhancement for modern browsers */
  min-height: -webkit-fill-available; /* WebKit/Chrome mobile fix */

  /* Standard flexbox layout */
  display: flex;
  flex-direction: column;

  /* Handle safe areas cleanly */
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom)
    env(safe-area-inset-left);

  /* Add extra bottom padding to fight stubborn browsers */
  padding-bottom: max(env(safe-area-inset-bottom), 20px);
`;

const SectionsContainer = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  flex-direction: column;
  min-height: 0; /* Allow children to shrink */
`;

const PageSection = styled.div`
  flex: 1;
  min-height: 0; /* Allow children to shrink */
`;

/**
 * Draggable debug widget for mobile development
 */
const DraggableDebugTool: React.FC<{
  viewportHeight: number;
  visualViewportHeight: number;
  screenHeight: number;
}> = ({ viewportHeight, visualViewportHeight, screenHeight }) => {
  const [position, setPosition] = useState({ x: 10, y: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, dragStart]);

  const safeAreaBottom =
    getComputedStyle(document.documentElement).getPropertyValue("padding-bottom") || "0px";
  const userAgent = navigator.userAgent.includes("Samsung")
    ? "Samsung"
    : navigator.userAgent.includes("Chrome")
      ? "Chrome"
      : navigator.userAgent.includes("Firefox")
        ? "Firefox"
        : "Other";

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: "rgba(0,0,0,0.9)",
        color: "lime",
        padding: "6px",
        fontSize: "9px",
        zIndex: 9999,
        borderRadius: "4px",
        fontFamily: "monospace",
        border: "1px solid lime",
        minWidth: isMinimized ? "50px" : "140px",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
        lineHeight: 1.2,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={() => setIsMinimized(!isMinimized)}
    >
      {isMinimized ? (
        <div style={{ textAlign: "center" }}>
          📱
          <br />
          {viewportHeight}
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "3px",
            }}
          >
            <span>📱 Viewport Debug</span>
            <button
              style={{
                background: "none",
                border: "none",
                color: "lime",
                cursor: "pointer",
                fontSize: "8px",
                padding: "0 2px",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(true);
              }}
            >
              −
            </button>
          </div>
          <div>Inner H: {viewportHeight}px</div>
          <div>Visual H: {visualViewportHeight}px</div>
          <div>Screen H: {screenHeight}px</div>
          <div>DPR: {window.devicePixelRatio}x</div>
          <div>Safe-B: {safeAreaBottom}</div>
          <div>Browser: {userAgent}</div>
          <div>Diff: {viewportHeight - visualViewportHeight}px</div>
        </>
      )}
    </div>
  );
};

const useMobileViewportHeight = () => {
  const [heights, setHeights] = useState({
    innerHeight: window.innerHeight,
    visualHeight: window.visualViewport?.height || window.innerHeight,
    screenHeight: screen.height,
  });

  useEffect(() => {
    const updateHeights = () => {
      const newHeights = {
        innerHeight: window.innerHeight,
        visualHeight: window.visualViewport?.height || window.innerHeight,
        screenHeight: screen.height,
      };

      setHeights(newHeights);
    };

    updateHeights();
    window.addEventListener("resize", updateHeights);
    window.addEventListener("orientationchange", updateHeights);

    const handleVisualViewportChange = () => {
      const newHeights = {
        innerHeight: window.innerHeight,
        visualHeight: window.visualViewport?.height || window.innerHeight,
        screenHeight: screen.height,
      };

      setHeights(newHeights);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleVisualViewportChange);
    }

    return () => {
      window.removeEventListener("resize", updateHeights);
      window.removeEventListener("orientationchange", updateHeights);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleVisualViewportChange);
      }
    };
  }, []);

  return heights;
};

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { innerHeight, visualHeight, screenHeight } = useMobileViewportHeight();

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <GlobalStyle />
        <AppContainer id="app-container">
          <SectionsContainer id="sections-container">
            <PageSection id="page-container">
              <AppRoutes />
            </PageSection>
          </SectionsContainer>

          {false && (
            <DraggableDebugTool
              viewportHeight={innerHeight}
              visualViewportHeight={visualHeight}
              screenHeight={screenHeight}
            />
          )}
        </AppContainer>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
