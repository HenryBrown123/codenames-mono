import React from "react";
import PageLayout from "./page-layout/page-layout";
import GuestAuthPageContent from "@frontend/game-access/pages/guest-auth-page-content";

export const GuestAuthRoute: React.FC = () => {
  return (
    <PageLayout>
      <GuestAuthPageContent />
    </PageLayout>
  );
};
