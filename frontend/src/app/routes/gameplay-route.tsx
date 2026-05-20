import React from "react";
import { useParams } from "react-router-dom";
import PageLayout from "./page-layout/page-layout";
import { GameplayPageContent } from "@frontend/game/gameplay";

/**
 * Route handler for `/game/:gameId`. Extracts the game id from the
 * URL and mounts the gameplay page inside the standard page layout;
 * renders an inline error if the id is missing.
 */
export const GameplayRoute: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();

  if (!gameId) {
    return <div>Game ID is required!</div>;
  }
  return (
    <PageLayout>
      <GameplayPageContent gameId={gameId} />
    </PageLayout>
  );
};
