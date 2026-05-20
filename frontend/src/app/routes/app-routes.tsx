import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { GameplayRoute } from "./gameplay-route";
import { PreGameFlow } from "../scene-flow";

const IconGallery = React.lazy(() => import("./icon-gallery").then(m => ({ default: m.IconGallery })));

/**
 * Top-level route table.
 *
 * `/game/:gameId` enters gameplay; everything else falls through to
 * the pre-game flow. In development, also exposes `/icons` for the
 * icon gallery (lazy-loaded, omitted from the production bundle).
 */
const AppRoutes = () => (
  <Router>
    <Routes>
      {import.meta.env.MODE === "development" && (
        <Route path="/icons" element={<React.Suspense fallback={null}><IconGallery /></React.Suspense>} />
      )}
      <Route path="/game/:gameId" element={<GameplayRoute />} />
      <Route path="*" element={<PreGameFlow />} />
    </Routes>
  </Router>
);

export default AppRoutes;
