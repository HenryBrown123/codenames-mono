import React from "react";
import { useParams } from "react-router-dom";
import PageLayout from "./page-layout/page-layout";
import { GameplayPage } from "@frontend/features/gameplay/pages";

export const GameplayRoute: React.FC = () => {
  return (
    <PageLayout>
      <GameplayPage />
    </PageLayout>
  );
};
