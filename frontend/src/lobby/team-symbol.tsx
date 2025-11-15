import React from "react";
import { motion } from "framer-motion";

interface TeamSymbolProps {
  teamName: "Team Red" | "Team Blue";
  teamColor: string;
  className?: string;
  onClick?: () => void;
  isButton?: boolean;
}

export const TeamSymbol: React.FC<TeamSymbolProps> = ({
  teamName,
  teamColor,
  className,
  onClick,
  isButton = false,
}) => {
  const symbol = teamName === "Team Red" ? "◆" : "▪";

  const content = (
    <motion.div
      layout
      layoutId={isButton ? undefined : "team-symbol"}
      className={className}
      style={{ color: teamColor }}
      key={teamName}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {symbol}
    </motion.div>
  );

  if (isButton && onClick) {
    return (
      <motion.button
        layout
        onClick={onClick}
        style={{
          margin: 0,
          padding: 0,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        {content}
      </motion.button>
    );
  }

  return content;
};
