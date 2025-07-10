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
const DraggableDebugTool: React.FC<{ viewportHeight: number }> = ({ viewportHeight }) => {
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

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: "rgba(0,0,0,0.85)",
        color: "lime",
        padding: "8px",
        fontSize: "10px",
        zIndex: 9999,
        borderRadius: "6px",
        fontFamily: "monospace",
        border: "1px solid lime",
        minWidth: isMinimized ? "60px" : "100px",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={() => setIsMinimized(!isMinimized)}
    >
      {isMinimized ? (
        <div style={{ textAlign: "center" }}>
          📱
          <br />
          {viewportHeight}px
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "4px",
            }}
          >
            <span>📱 Debug</span>
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
          <div>VH: {viewportHeight}px</div>
          <div>Inner: {window.innerHeight}px</div>
          {window.visualViewport && <div>Visual: {Math.round(window.visualViewport.height)}px</div>}
          <div>Ratio: {window.devicePixelRatio}x</div>
          <div>
            Safe-B:{" "}
            {getComputedStyle(document.documentElement).getPropertyValue("padding-bottom") || "0px"}
          </div>
        </>
      )}
    </div>
  );
};
const useMobileViewportHeight = () => {
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    const updateHeight = () => {
      setHeight(window.innerHeight);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);

    // iOS specific - handle viewport changes when address bar shows/hides
    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        setHeight(window.visualViewport.height);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleVisualViewportChange);
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleVisualViewportChange);
      }
    };
  }, []);

  return height;
};

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const viewportHeight = useMobileViewportHeight();

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Debug info for real device testing
  useEffect(() => {
    console.log("=== VIEWPORT DEBUG INFO ===");
    console.log("Window inner height:", window.innerHeight);
    console.log("Screen height:", screen.height);
    console.log("Device pixel ratio:", window.devicePixelRatio);
    if (window.visualViewport) {
      console.log("Visual viewport height:", window.visualViewport.height);
      console.log("Visual viewport offset:", window.visualViewport.offsetTop);
    }
    console.log("=========================");
  }, [viewportHeight]);

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

          {/* Draggable floaty debug tool for mobile development */}
          <DraggableDebugTool viewportHeight={viewportHeight} />
        </AppContainer>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
