import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useGameDataRequired } from "../game-data/providers";
import { VictoryFlash } from "./victory-flash";
import { GAME_OVER_TIMING } from "./game-over-timing";

export const GameOverOverlay = () => {
  const { gameData } = useGameDataRequired();
  const [showFlash, setShowFlash] = useState(true);

  const winningTeamName = gameData.currentRound?.winningTeamName;

  const teams = gameData.teams || [];
  const winningTeam = teams.find((t) => t.name === winningTeamName);

  useEffect(() => {
    const timer = setTimeout(() => setShowFlash(false), GAME_OVER_TIMING.FLASH_TOTAL * 1000);
    return () => clearTimeout(timer);
  }, []);

  const teamColor = winningTeam?.name.includes("Red")
    ? "var(--color-team-red)"
    : "var(--color-team-blue)";

  return (
    <AnimatePresence>
      {showFlash && <VictoryFlash winnerName={winningTeam?.name || "TEAM"} teamColor={teamColor} />}
    </AnimatePresence>
  );
};
