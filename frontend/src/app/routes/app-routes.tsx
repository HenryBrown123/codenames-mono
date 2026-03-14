import React from "react";
import { Routes, Route, BrowserRouter as Router, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { GameplayRoute } from "./gameplay-route";
import { CreateGameRoute } from "./create-game-route";
import { GuestAuthRoute } from "./guest-auth-route";
import { LobbyRoute } from "./lobby-route";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/game/:gameId/lobby" element={<LobbyRoute />} />
        <Route path="/game/:gameId" element={<GameplayRoute />} />
        <Route path="/create-game" element={<CreateGameRoute />} />
        <Route path="/auth/guest" element={<GuestAuthRoute />} />
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
