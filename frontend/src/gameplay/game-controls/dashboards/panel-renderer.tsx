import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PanelConfig } from "./config/types";
import { VisibilityContext } from "./config/context";

interface PanelRendererProps {
  panels: PanelConfig[];
  context: VisibilityContext;
  slotId: string;
}

const panelVariants = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
};

const panelTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
};

/**
 * Generic panel renderer with consistent animations.
 * Panels don't know they're animated - this handles it.
 */
export const PanelRenderer: React.FC<PanelRendererProps> = ({ panels, context, slotId }) => {
  const visiblePanels = panels.filter((panel) => panel.shouldRender(context));

  return (
    <AnimatePresence mode="popLayout">
      {visiblePanels.map(({ id, component: Component }) => (
        <motion.div
          key={id}
          layoutId={`${slotId}-${id}`}
          variants={panelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={panelTransition}
          layout
        >
          <Component />
        </motion.div>
      ))}
    </AnimatePresence>
  );
};
