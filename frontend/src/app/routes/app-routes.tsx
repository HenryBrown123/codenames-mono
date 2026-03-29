import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { GameplayRoute } from "./gameplay-route";
import { PreGameFlow } from "../scene-flow";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/game/:gameId" element={<GameplayRoute />} />
      <Route path="*" element={<PreGameFlow />} />
    </Routes>
  </Router>
);

export default AppRoutes;
