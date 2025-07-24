import { useState, useRef, useEffect, useCallback } from "react";
import InteractiveMap from "../game/components/InteractiveMap";
import ImagePreloader from "../components/ImagePreloader";
import { DROPSITES, DROP_RADIUS } from "../utils/constants";
import { spawnItemNearPlayer } from "../game/utils/mapUtils";
import type { Dropsite } from "../utils/types";

// Game states
type GamePhase = "start" | "countdown" | "reveal" | "playing" | "victory" | "results";

// Inner component that has access to imageDimensions
const GameContent: React.FC<{
  imageDimensions: { width: number; height: number };
}> = ({ imageDimensions }) => {
  // State
  const [phase, setPhase] = useState<GamePhase>("start");
  const [playerPos, setPlayerPos] = useState<[number, number] | null>(null);
  const [currentDropsite, setCurrentDropsite] = useState<Dropsite | null>(null);
  const [dropPosition, setDropPosition] = useState<[number, number] | null>(null);
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle map image data loaded
  const handleMapImageDataLoaded = (data: ImageData | null) => {
    setImageData(data);
  };

  // Function to spawn a new dropsite near the player
  const spawnNewDropsite = useCallback((playerPosition: [number, number], imageDims: { width: number; height: number }) => {
    const randomDropsite = DROPSITES[Math.floor(Math.random() * DROPSITES.length)];
    
    if (imageData) {
      const spawnedPosition = spawnItemNearPlayer(
        playerPosition,
        imageDims,
        800, // spawn radius in pixels
        imageData
      );
      
      if (spawnedPosition) {
        setCurrentDropsite(randomDropsite);
        setDropPosition(spawnedPosition);
        console.log(`Spawned dropsite "${randomDropsite.name}" at:`, spawnedPosition, `Player at:`, playerPosition);
        return;
      }
    }
    
    // Fallback to original dropsite location if spawning fails
    setCurrentDropsite(randomDropsite);
    setDropPosition(randomDropsite.location);
    console.log(`Fallback: Using original dropsite location for "${randomDropsite.name}":`, randomDropsite.location);
  }, [imageData]);

  // When player position is set and image data is available, spawn dropsite
  useEffect(() => {
    if (playerPos && imageData && !currentDropsite) {
      spawnNewDropsite(playerPos, imageDimensions);
    }
  }, [playerPos, imageData, currentDropsite, spawnNewDropsite, imageDimensions]);

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

  // WASD movement handler (delegated to InteractiveMap)
  const handlePlayerMove = (newPos: [number, number]) => {
    setPlayerPos(newPos);
    // Check victory using dropPosition (the actual spawned position)
    if (dropPosition) {
      const distance = Math.sqrt(
        Math.pow(newPos[0] - dropPosition[0], 2) + 
        Math.pow(newPos[1] - dropPosition[1], 2)
      );
      
      if (distance < DROP_RADIUS) {
        setPhase("victory");
      }
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
    setCurrentDropsite(null);
    setDropPosition(null);
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-gray-100">
      {phase === "start" && (
        <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 game-ui-overlay bg-white bg-opacity-90 p-6 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Pick your starting point!</h2>
          <p className="text-gray-600">Click anywhere on the map to begin.</p>
        </div>
      )}
      {phase === "countdown" && (
        <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 game-ui-overlay bg-white bg-opacity-95 p-8 rounded-lg shadow-xl text-center">
          <div className="text-5xl font-bold text-blue-600">
            {countdown > 0 ? countdown : "🎯 ZOT!"}
          </div>
        </div>
      )}
      {phase === "playing" && currentDropsite && (
        <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 game-ui-overlay bg-white bg-opacity-95 p-6 rounded-lg shadow-xl text-center">
          <div className="flex items-center gap-6">
            {/* Photo on the left */}
            <div className="flex-shrink-0">
              <h3 className="text-lg font-bold mb-2 text-gray-800">Find this location!</h3>
              <img src={currentDropsite.photo} alt="Drop site" className="w-48 h-48 object-contain rounded-lg shadow-md" />
              <p className="text-sm text-gray-600 mt-2">{currentDropsite.description}</p>
              <p className="text-xs text-gray-500 mt-1 bg-gray-100 px-2 py-1 rounded">
                Difficulty: {currentDropsite.difficulty}
              </p>
            </div>
            {/* Timer and info on the right */}
            <div className="flex flex-col items-center">
              <div className="text-3xl font-mono font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                {(timer / 1000).toFixed(2)}s
              </div>
              <p className="text-sm text-gray-600 mt-2">Use WASD to move</p>
              <p className="text-xs text-gray-500 mt-1">Find the drop location!</p>
            </div>
          </div>
        </div>
      )}
      {phase === "victory" && (
        <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 game-ui-overlay bg-green-50 bg-opacity-95 border-2 border-green-200 p-6 rounded-lg shadow-xl text-center">
          <div className="text-3xl font-bold text-green-600">
            🎉 You found the drop! 🎉
          </div>
        </div>
      )}
      {phase === "results" && currentDropsite && (
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
      {/* Map always visible, but disables controls except in playing phase */}
      <div className="w-full h-full">
        <InteractiveMap
          playerPosition={playerPos || undefined}
          imageDimensions={imageDimensions}
          onMapImageDataLoaded={handleMapImageDataLoaded}
          markers={
            phase !== "start" && dropPosition && currentDropsite
              ? [
                  {
                    position: dropPosition,
                    popup: `${currentDropsite.name} - Petr Drop!`,
                    color: "#ffa500",
                  },
                ]
              : []
          }
          onMapClick={handleMapClick}
          onPlayerMove={phase === "playing" ? handlePlayerMove : undefined}
        />
      </div>
    </div>
  );
};

export default function Game() {
  return (
    <ImagePreloader imageSrc="/UCI_map.png">
      {(imageDimensions) => <GameContent imageDimensions={imageDimensions} />}
    </ImagePreloader>
  );
}
