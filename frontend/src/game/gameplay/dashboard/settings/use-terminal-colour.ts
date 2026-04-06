import { useState, useEffect, useCallback } from "react";
import { applyTerminalColour, DEFAULT_TERMINAL_COLOUR } from "./ui-settings-dashboard";

const STORAGE_KEY = "terminalColour";

/**
 * Custom hook for managing terminal colour state.
 * Handles localStorage persistence and applies colour on mount/change.
 */
export function useTerminalColour() {
  const [terminalColour, setTerminalColour] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_TERMINAL_COLOUR;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_TERMINAL_COLOUR;
  });

  /** Apply colour on mount and whenever it changes */
  useEffect(() => {
    applyTerminalColour(terminalColour);
  }, [terminalColour]);

  const handleColourChange = useCallback((colour: string) => {
    setTerminalColour(colour);
    localStorage.setItem(STORAGE_KEY, colour);
    applyTerminalColour(colour);
  }, []);

  return {
    terminalColour,
    onTerminalColourChange: handleColourChange,
  };
}

/**
 * Initialize terminal colour on app startup.
 * Call this once at the app entry point.
 */
export function initTerminalColour(): void {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_TERMINAL_COLOUR;
  applyTerminalColour(saved);
}
