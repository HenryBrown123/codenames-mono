import React from "react";
import { useParams } from "react-router-dom";
import PageLayout from "./page-layout/page-layout";
import { GameplayPageContent } from "@frontend/gameplay/pages/gameplay-page";

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
