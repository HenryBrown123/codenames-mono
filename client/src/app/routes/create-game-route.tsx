import React from "react";
import PageLayout from "./page-layout/page-layout";
import CreateGamePageContent from "@game-access/pages/create-game-page-content";

export const CreateGameRoute: React.FC = () => {
  return (
    <PageLayout>
      <CreateGamePageContent />
    </PageLayout>
  );
};
