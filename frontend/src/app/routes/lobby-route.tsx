import React from "react";
import { useParams } from "react-router-dom";
import PageLayout from "./page-layout/page-layout";
import LobbyInterface from "@frontend/lobby/lobby-page";

export const LobbyRoute: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();

  if (!gameId) {
    return <div>Game ID is required!</div>;
  }

  return (
    <PageLayout>
      <LobbyInterface gameId={gameId} />
    </PageLayout>
  );
};
