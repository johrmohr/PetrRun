import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/App.tsx";
import PetrRunGame from "@/pages/PetrRunGame";
import GameDemo from "@/pages/GameDemo";
import { BrowserRouter, Route, Routes } from "react-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/game" element={<PetrRunGame />} />
        <Route path="/game-demo" element={<GameDemo />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
