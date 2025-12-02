import React from "react";
import { Routes, Route, BrowserRouter as Router, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { GameplayRoute } from "./gameplay-route";
import { CreateGameRoute } from "./create-game-route";
import { GuestAuthRoute } from "./guest-auth-route";
import { LobbyRoute } from "./lobby-route";
import CardVisibilitySandbox from "../../sandbox/card-visibility-sandbox";
import BouncingBallDemoWrapper from "../../sandbox/bouncing-ball-demo";
import { MusicVisualizerDemo } from "../../sandbox/music-visualiser-animation/music-visualiser-demo";
import { SpringTest } from "../../sandbox/spring-test";
import GameOverLayoutsSandbox from "../../sandbox/game-over-layouts-sandbox";
import DashboardSandbox from "../../sandbox/dashboard-sandbox";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/game/:gameId/lobby" element={<LobbyRoute />} />
        <Route path="/game/:gameId" element={<GameplayRoute />} />
        <Route path="/create-game" element={<CreateGameRoute />} />
        <Route path="/auth/guest" element={<GuestAuthRoute />} />
        <Route path="/sandbox" element={<CardVisibilitySandbox />} />
        <Route path="/sandbox/bouncing-ball" element={<BouncingBallDemoWrapper />} />
        <Route path="/sandbox/music-visualiser" element={<MusicVisualizerDemo />} />
        <Route path="/sandbox/spring-test" element={<SpringTest />} />
        <Route path="/sandbox/game-over" element={<GameOverLayoutsSandbox />} />
        <Route path="/sandbox/dashboard" element={<DashboardSandbox />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </AnimatePresence>
  );
};

const AppRoutes = () => (
  <Router>
    <AnimatedRoutes />
  </Router>
);

export default AppRoutes;
