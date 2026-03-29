import React from "react";
import { motion } from "framer-motion";
import { pageContainerStyles } from "@frontend/gameplay/shared/components";

const EASE = [0.4, 0, 0.2, 1] as const;

interface SceneCardProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export const SceneCard: React.FC<SceneCardProps> = ({ children, maxWidth }) => (
  <motion.div
    className={pageContainerStyles.card}
    style={maxWidth ? { maxWidth } : undefined}
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, ease: EASE },
    }}
    exit={{
      opacity: 0,
      scale: 0,
      transition: { duration: 0.6, ease: EASE },
    }}
  >
    {children}
  </motion.div>
);
