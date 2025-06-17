import React from "react";
import { useParams } from "react-router-dom";
import { GameplayProvider } from "@frontend/features/gameplay/state";
import { GameplayPageContent } from "./gameplay-page-content";

/**
 * Main gameplay page component
 * Handles route params and provides the game context
 */
export const GameplayPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();

  if (!gameId) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <h2>Invalid game ID</h2>
      </div>
    );
  }

  return (
    <GameplayProvider gameId={gameId}>
      <GameplayPageContent />
    </GameplayProvider>
  );
};
