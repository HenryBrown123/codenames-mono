import React from "react";
import PageLayout from "./page-layout/page-layout";
import CreateGamePageContent from "@frontend/game-access/pages/create-game-page-content";

export const CreateGameRoute: React.FC = () => {
  return (
    <PageLayout>
      <CreateGamePageContent />
    </PageLayout>
  );
};
