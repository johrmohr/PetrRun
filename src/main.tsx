import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/App.tsx";
import Game from "@/pages/Game";
import GameDemo from "@/pages/GameDemo";
import { BrowserRouter, Route, Routes } from "react-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/game" element={<Game />} />
        <Route path="/game-demo" element={<GameDemo />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
