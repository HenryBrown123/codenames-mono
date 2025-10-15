import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { GameplayRoute } from "./gameplay-route";
import { CreateGameRoute } from "./create-game-route";
import { GuestAuthRoute } from "./guest-auth-route";
import { LobbyRoute } from "./lobby-route"; // Add this import
import CardVisibilitySandbox from "../../sandbox/card-visibility-sandbox";
import BouncingBallDemoWrapper from "../../sandbox/bouncing-ball-demo";
import { MusicVisualizerDemoWrapper } from "../../sandbox/music-visualiser-animation/music-visualiser-demo";
import { SpringTest } from "../../sandbox/spring-test";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/game/:gameId/lobby" element={<LobbyRoute />} /> {/* Add this route */}
      <Route path="/game/:gameId" element={<GameplayRoute />} />
      <Route path="/create-game" element={<CreateGameRoute />} />
      <Route path="/auth/guest" element={<GuestAuthRoute />} />
      <Route path="/sandbox" element={<CardVisibilitySandbox />} />
      <Route path="/sandbox/bouncing-ball" element={<BouncingBallDemoWrapper />} />
      <Route path="/sandbox/music-visualiser" element={<MusicVisualizerDemoWrapper />} />
      <Route path="/sandbox/spring-test" element={<SpringTest />} />
      {/* Optional: a catch-all route for 404 */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  </Router>
);

export default AppRoutes;
