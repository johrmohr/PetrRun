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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start selection: player clicks map to set start
  const handleMapClick = (latlng: { lat: number; lng: number }) => {
    if (phase === "start") {
      setPlayerPos([latlng.lat, latlng.lng]);
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
        // Go directly to playing phase after countdown
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

  // WASD movement handler (delegated to GameMap)
  const handlePlayerMove = (newPos: [number, number]) => {
    setPlayerPos(newPos);
    // Check victory using current dropsite location
    if (
      Math.sqrt(
        Math.pow(newPos[0] - currentDropsite.location[0], 2) + 
        Math.pow(newPos[1] - currentDropsite.location[1], 2)
      ) < DROP_RADIUS
    ) {
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
    setPhase("start");
    setPlayerPos(null);
    setTimer(0);
    setStartTime(null);
    // Select a new random dropsite for the next round
    setCurrentDropsite(selectRandomDropsite());
  };

  // UI rendering by phase
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-gray-100">
      {phase === "start" && (
        <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 bg-white p-6 rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-2">Pick your starting point!</h2>
          <p>Click anywhere on the map to begin.</p>
        </div>
      )}
      {phase === "countdown" && (
        <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 bg-white p-6 rounded shadow text-center text-4xl font-bold">
          {countdown > 0 ? countdown : "ZOT!"}
        </div>
      )}
      {phase === "playing" && (
        <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 bg-white p-6 rounded shadow text-center">
          <div className="flex items-center gap-6">
            {/* Photo on the left */}
            <div className="flex-shrink-0">
              <h3 className="text-lg font-bold mb-2">Find this location!</h3>
              <img src={currentDropsite.photo} alt="Drop site" className="w-48 h-48 object-contain" />
              <p className="text-sm text-gray-600 mt-2">{currentDropsite.description}</p>
              <p className="text-xs text-gray-500 mt-1">Difficulty: {currentDropsite.difficulty}</p>
            </div>
            {/* Timer and info on the right */}
            <div className="flex flex-col items-center">
              <span className="font-mono text-2xl font-bold">{(timer / 1000).toFixed(2)}s</span>
              <p className="text-sm text-gray-600 mt-2">Use WASD to move</p>
            </div>
          </div>
        </div>
      )}
      {phase === "victory" && (
        <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 bg-green-100 p-6 rounded shadow text-center text-3xl font-bold">
          You found the drop!
        </div>
      )}
      {phase === "results" && (
        <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          <p className="mb-2"><strong>{currentDropsite.name}</strong></p>
          <p className="mb-2">Final Time: <span className="font-mono">{(timer / 1000).toFixed(2)}s</span></p>
          <p className="text-sm text-gray-600 mb-4">Difficulty: {currentDropsite.difficulty}</p>
          <button onClick={handleRestart} className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Play Again</button>
        </div>
      )}
      {/* Map always visible, but disables controls except in playing phase */}
      <div className="w-full h-full">
        {(() => {
          const gameMapProps: any = {
            center: playerPos || GAME_CONFIG.MAP.DEFAULT_CENTER,
            zoom: 18,
            playerPosition: playerPos || undefined,
            markers: phase !== "start"
              ? [
                  {
                    position: currentDropsite.location,
                    type: "treasure",
                    popup: `${currentDropsite.name} - Petr Drop!`,
                    color: "#ffa500",
                  },
                ]
              : [],
            onMapClick: handleMapClick,
            onPlayerMove: phase === "playing" ? handlePlayerMove : undefined,
          };
          
          if (GAME_CONFIG.MAP.GAME_BOUNDS) {
            gameMapProps.bounds = GAME_CONFIG.MAP.GAME_BOUNDS as [[number, number], [number, number]];
          }
          
          return <GameMap {...gameMapProps} />;
        })()}
      </div>
    </div>
  );
}
