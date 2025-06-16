import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { GameplayRoute } from "./gameplay-route";
import { CreateGameRoute } from "./create-game-route";
import { GuestAuthRoute } from "./guest-auth-route";
import { LobbyRoute } from "./lobby-route"; // Add this import

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/game/:gameId/lobby" element={<LobbyRoute />} />{" "}
      {/* Add this route */}
      <Route path="/game/:gameId" element={<GameplayRoute />} />
      <Route path="/create-game" element={<CreateGameRoute />} />
      <Route path="/auth/guest" element={<GuestAuthRoute />} />
      {/* Optional: a catch-all route for 404 */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  </Router>
);

export default AppRoutes;
