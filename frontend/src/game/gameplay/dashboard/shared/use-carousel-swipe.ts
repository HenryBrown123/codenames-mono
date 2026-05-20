import { useState, useCallback } from "react";
import type { PanInfo } from "framer-motion";
import { SWIPE_THRESHOLD, VELOCITY_THRESHOLD } from "./terminal-components";

interface CarouselNavigation {
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
}

/**
 * Wires drag gestures and arrow callbacks to a carousel.
 *
 * Recognises a swipe when either the drag distance crosses
 * `SWIPE_THRESHOLD` or the release velocity crosses
 * `VELOCITY_THRESHOLD`; tracks the most recent direction so the
 * AnimatePresence transition can use it as a custom prop.
 */
export function useCarouselSwipe(nav: CarouselNavigation) {
  const [swipeDirection, setSwipeDirection] = useState(0);

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const swipedLeft = info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD;
    const swipedRight = info.offset.x > SWIPE_THRESHOLD || info.velocity.x > VELOCITY_THRESHOLD;

    if (swipedLeft && nav.canGoForward) {
      setSwipeDirection(-1);
      nav.onGoForward();
    } else if (swipedRight && nav.canGoBack) {
      setSwipeDirection(1);
      nav.onGoBack();
    }
  }, [nav.canGoBack, nav.canGoForward, nav.onGoBack, nav.onGoForward]);

  const handleGoBack = useCallback(() => {
    setSwipeDirection(1);
    nav.onGoBack();
  }, [nav.onGoBack]);

  const handleGoForward = useCallback(() => {
    setSwipeDirection(-1);
    nav.onGoForward();
  }, [nav.onGoForward]);

  return { swipeDirection, handleDragEnd, handleGoBack, handleGoForward };
}
