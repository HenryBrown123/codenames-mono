import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { GameplayRoute } from "./gameplay-route";
import { PreGameFlow } from "../scene-flow";

const IconGallery = React.lazy(() => import("./icon-gallery").then(m => ({ default: m.IconGallery })));

const AppRoutes = () => (
  <Router>
    <Routes>
      {process.env.NODE_ENV === "development" && (
        <Route path="/icons" element={<React.Suspense fallback={null}><IconGallery /></React.Suspense>} />
      )}
      <Route path="/game/:gameId" element={<GameplayRoute />} />
      <Route path="*" element={<PreGameFlow />} />
    </Routes>
  </Router>
);

export default AppRoutes;
