import React, { useState, useRef, useEffect } from "react";
import GameMap from "../components/GameMap";
import { GAME_CONFIG, DROPSITES, DROP_RADIUS } from "../utils/constants";
import type { Dropsite } from "../utils/types";

// Game states
type GamePhase = "start" | "countdown" | "reveal" | "playing" | "victory" | "results";

// Function to select a random dropsite
const selectRandomDropsite = (): Dropsite => {
  const randomIndex = Math.floor(Math.random() * DROPSITES.length);
  return DROPSITES[randomIndex];
};

export default function Game() {
  // State
  const [phase, setPhase] = useState<GamePhase>("start");
  const [playerPos, setPlayerPos] = useState<[number, number] | null>(null);
  const [currentDropsite, setCurrentDropsite] = useState<Dropsite>(() => selectRandomDropsite());
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [resetKey, setResetKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start selection: player clicks map to set start
  const handleMapClick = (position: { x: number; y: number }) => {
    if (phase === "start") {
      setPlayerPos([position.x, position.y]);
    }
  };

  // Start countdown when player picks start
  useEffect(() => {
    if (phase === "start" && playerPos) {
      setPhase("countdown");
      setCountdown(3);
    }
  }, [playerPos, phase]);

  // Countdown logic
  useEffect(() => {
    if (phase === "countdown") {
      if (countdown > 0) {
        const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(id);
      } else {
        setPhase("playing");
        setStartTime(Date.now());
      }
    }
  }, [phase, countdown]);

  // Timer logic
  useEffect(() => {
    if (phase === "playing") {
      timerRef.current = setInterval(() => {
        setTimer(Date.now() - (startTime ?? Date.now()));
      }, 100);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else if (phase === "victory") {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [phase, startTime]);

  // WASD movement handler
  const handlePlayerMove = (newPos: [number, number]) => {
    if (phase === "results" || phase === "victory") return;
    setPlayerPos(newPos);
    const distance = Math.sqrt(
      Math.pow(newPos[0] - currentDropsite.location[0], 2) + 
      Math.pow(newPos[1] - currentDropsite.location[1], 2)
    );
    if (distance < DROP_RADIUS) {
      setPhase("victory");
    }
  };

  // On victory, stop timer and show results after short delay
  useEffect(() => {
    if (phase === "victory") {
      setTimeout(() => setPhase("results"), 1500);
    }
  }, [phase]);

  // Reset for new round
  const handleRestart = () => {
    setCurrentDropsite(selectRandomDropsite());
    setPlayerPos(null);
    setTimer(0);
    setStartTime(null);
    setCountdown(3);
    setPhase("start");
    setResetKey((prev) => prev + 1);
  };

  // UI rendering by phase
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-gray-100">
      {phase === "start" && (
        <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 game-ui-overlay bg-white bg-opacity-90 p-6 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Pick your starting point!</h2>
          <p className="text-gray-600">Click anywhere on the map to begin.</p>
        </div>
      )}
      {(phase === "playing") && (
        <div className="absolute z-10 top-8 right-8 game-ui-overlay bg-white bg-opacity-95 p-3 rounded-lg shadow-xl text-center w-64 flex flex-col items-center border border-gray-200">
          <h3 className="text-base font-bold mb-2 text-gray-800">Find the drop location</h3>
          <img 
            src={currentDropsite.photo} 
            alt={currentDropsite.name} 
            className="w-56 h-40 object-cover rounded-lg shadow m-0" 
            style={{ display: 'block', margin: 0, padding: 0, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          />
          <p className="text-xs text-gray-600 mt-2">{currentDropsite.description}</p>
          <p className="text-xs text-gray-500 mt-1 bg-gray-100 px-2 py-1 rounded">
            Difficulty: {currentDropsite.difficulty}
          </p>
          <div className="flex flex-col items-center mt-3 w-full">
            <div className="text-2xl font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg w-full">
              {(timer / 1000).toFixed(2)}s
            </div>
          </div>
        </div>
      )}
      {phase === "countdown" && (
        <>
          <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 game-ui-overlay bg-white bg-opacity-95 p-8 rounded-lg shadow-xl text-center">
            <div className="text-5xl font-bold text-blue-600">
              {countdown > 0 ? countdown : "🎯 ZOT!"}
            </div>
          </div>
          <div className="absolute z-10 top-40 left-1/2 -translate-x-1/2 text-center">
            <p className="text-lg text-gray-700 bg-white bg-opacity-40 px-4 py-2 rounded shadow" style={{opacity: 0.7}}>
              Use WASD to move
            </p>
          </div>
        </>
      )}
      {phase === "victory" && (
        <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 game-ui-overlay bg-green-50 bg-opacity-95 border-2 border-green-200 p-6 rounded-lg shadow-xl text-center">
          <div className="text-3xl font-bold text-green-600">
            🎉 You found the drop! 🎉
          </div>
        </div>
      )}
      {phase === "results" && (
        <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 game-ui-overlay bg-white bg-opacity-95 p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">🏆 Results</h2>
          <p className="mb-2 text-lg"><strong className="text-blue-600">{currentDropsite.name}</strong></p>
          <p className="mb-2 text-2xl font-mono font-bold text-green-600">
            Time: {(timer / 1000).toFixed(2)}s
          </p>
          <p className="text-sm text-gray-600 mb-6 bg-gray-100 px-3 py-1 rounded">
            Difficulty: {currentDropsite.difficulty}
          </p>
          <button 
            onClick={handleRestart} 
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            🎮 Play Again
          </button>
        </div>
      )}
      <div className="w-full h-full">
        <GameMap
          center={playerPos || GAME_CONFIG.MAP.DEFAULT_CENTER}
          zoom={18}
          playerPosition={playerPos || undefined}
          markers={
            phase !== "start"
              ? [
                  {
                    position: currentDropsite.location,
                    type: "treasure",
                    popup: `${currentDropsite.name} - Petr Drop!`,
                    color: "#ffa500",
                  },
                ]
              : []
          }
          onMapClick={handleMapClick}
          onPlayerMove={phase === "playing" ? handlePlayerMove : undefined}
          gameEnded={phase === "results" || phase === "victory"}
          reset={resetKey}
        />
      </div>
    </div>
  );
}