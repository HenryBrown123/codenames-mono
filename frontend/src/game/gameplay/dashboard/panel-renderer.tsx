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
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const panelTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

/**
 * Renders a configured panel list, filtering on each panel's
 * `shouldRender` rule. Mount/unmount transitions are animated through
 * `AnimatePresence` with shared `layoutId`s so panels slide rather
 * than pop when neighbours change.
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
          layout="position"
        >
          <Component />
        </motion.div>
      ))}
    </AnimatePresence>
  );
};
