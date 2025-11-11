import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useGameDataRequired } from "../game-data/providers";
import { VictoryFlash } from "./victory-flash";

type GameOverPhase = "flash" | "complete";

export const GameOverOverlay = () => {
  const { gameData } = useGameDataRequired();
  const [phase, setPhase] = useState<GameOverPhase>("flash");

  const winningTeamName = gameData.currentRound?.winningTeamName;
  console.log(winningTeamName);
  const teams = gameData.teams;
  const winningTeam = teams.find((t) => t.name === winningTeamName);

  console.log(winningTeam);

  useEffect(() => {
    if (phase === "flash") {
      const timer = setTimeout(() => setPhase("complete"), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const teamColor = winningTeam?.name.includes("Red")
    ? "var(--color-team-red)"
    : "var(--color-team-blue)";

  return (
    <AnimatePresence>
      {phase === "flash" && (
        <VictoryFlash winnerName={winningTeam?.name || "TEAM"} teamColor={teamColor} />
      )}
    </AnimatePresence>
  );
};
