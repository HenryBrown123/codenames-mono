import { useState, useEffect } from "react";
import { type DisplayType, getDisplayType } from "./display-type";

/**
 * Returns the current DisplayType.
 * Reads synchronously on first render — correct from frame one, no flash.
 * Updates on window resize.
 */
export const useDisplayType = (): DisplayType => {
  const [displayType, setDisplayType] = useState<DisplayType>(getDisplayType);

  useEffect(() => {
    const handler = () => setDisplayType(getDisplayType());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return displayType;
};
