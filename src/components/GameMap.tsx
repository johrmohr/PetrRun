import React, { useEffect, useRef, useState } from "react";

interface GameMarker {
  position: [number, number]; // [x, y] pixels
  popup?: string;
  type?: "player" | "checkpoint" | "obstacle" | "treasure" | "enemy" | "default";
  color?: string;
}

interface GameMapProps {
  center?: [number, number]; // [x, y] pixels
  zoom?: number; // Not used for static image, kept for compatibility
  height?: string;
  width?: string;
  markers?: GameMarker[];
  playerPosition?: [number, number]; // [x, y] pixels
  gameEnded?: boolean;
  reset?: boolean; // New prop to trigger reset
  onMapClick?: (position: { x: number; y: number }) => void;
  onPlayerMove?: (newPosition: [number, number]) => void;
}

// WASD Controls Component
function WASDControls({
  onPlayerMove,
  playerPosition,
  mapRef,
  gameState,
}: {
  onPlayerMove?: (newPosition: [number, number]) => void;
  playerPosition?: [number, number] | null;
  mapRef: React.RefObject<HTMLDivElement>;
  gameState: "waiting" | "countdown" | "playing" | "gameOver";
}) {
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const lastUpdate = useRef<number>(performance.now());
  const positionRef = useRef<[number, number] | null>(playerPosition);

  useEffect(() => {
    if (!onPlayerMove || !playerPosition || !mapRef.current || gameState !== "playing") {
      // Reset keysPressed when not in playing state to prevent movement carryover
      keysPressed.current = {};
      return;
    }

    positionRef.current = playerPosition;
    const moveDistancePerSecond = 80;
    const mapWidth = 1000;
    const mapHeight = 800;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        keysPressed.current[key] = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        keysPressed.current[key] = false;
        e.preventDefault();
      }
    };

    const updatePosition = (timestamp: number) => {
      if (!positionRef.current || !onPlayerMove || gameState !== "playing") {
        animationFrameId = requestAnimationFrame(updatePosition);
        return;
      }

      const deltaTime = Math.min((timestamp - lastUpdate.current) / 1000, 0.1);
      lastUpdate.current = timestamp;

      let dx = 0;
      let dy = 0;

      if (keysPressed.current['w'] || keysPressed.current['arrowup']) dy -= 1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dy += 1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx -= 1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx += 1;

      const magnitude = Math.sqrt(dx * dx + dy * dy);
      if (magnitude > 0) {
        dx = (dx / magnitude) * moveDistancePerSecond * deltaTime;
        dy = (dy / magnitude) * moveDistancePerSecond * deltaTime;
      } else {
        dx = 0;
        dy = 0;
      }

      let newX = positionRef.current[0] + dx;
      let newY = positionRef.current[1] + dy;

      newX = Math.max(0, Math.min(mapWidth, newX));
      newY = Math.max(0, Math.min(mapHeight, newY));

      if (newX !== positionRef.current[0] || newY !== positionRef.current[1]) {
        positionRef.current = [newX, newY];
        onPlayerMove([newX, newY]);
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    let animationFrameId = requestAnimationFrame(updatePosition);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [onPlayerMove, playerPosition, mapRef, gameState]);

  return null;
}

const GameMap: React.FC<GameMapProps> = ({
  center = [600, 450],
  markers = [],
  playerPosition: initialPlayerPosition,
  gameEnded = false,
  reset = false,
  onMapClick,
  onPlayerMove,
  height = "100%",
  width = "100%",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playerPosition, setPlayerPosition] = useState<[number, number] | null>(initialPlayerPosition || null);
  const [gameState, setGameState] = useState<"waiting" | "countdown" | "playing" | "gameOver">("waiting");
  const playerPositionRef = useRef<[number, number] | null>(playerPosition);
  const [forceRender, setForceRender] = useState(0);

  // Reset on mount or when reset prop changes
  useEffect(() => {
    setForceRender((prev) => prev + 1);
    if (reset) {
      setPlayerPosition(null);
      setGameState("waiting");
      playerPositionRef.current = null; // Ensure player position is cleared
    }
  }, [reset]);

  // Sync playerPositionRef
  useEffect(() => {
    playerPositionRef.current = playerPosition;
  }, [playerPosition]);

  // Handle game end
  useEffect(() => {
    if (gameEnded && gameState !== "gameOver") {
      setGameState("gameOver");
    }
  }, [gameEnded]);

  // Handle countdown
  useEffect(() => {
    if (gameState === "countdown") {
      const countdownDuration = 3000;
      const timer = setTimeout(() => {
        setGameState("playing");
      }, countdownDuration);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const handlePlayerMove = (newPosition: [number, number]) => {
    setPlayerPosition(newPosition);
    playerPositionRef.current = newPosition;
    if (onPlayerMove) {
      onPlayerMove(newPosition);
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onMapClick || !mapRef.current || !containerRef.current || gameState !== "waiting") return;

    const rect = containerRef.current.getBoundingClientRect();
    const scale = 2.5;
    const containerX = e.clientX - rect.left;
    const containerY = e.clientY - rect.top;

    const centerX = containerRef.current.clientWidth / 2;
    const centerY = containerRef.current.clientHeight / 2;

    const mapX = (containerX - centerX) / scale + center[0];
    const mapY = (containerY - centerY) / scale + center[1];

    const clampedMapX = Math.max(0, Math.min(1000, mapX));
    const clampedMapY = Math.max(0, Math.min(800, mapY));

    setPlayerPosition([clampedMapX, clampedMapY]);
    setGameState("countdown");
    onMapClick({ x: clampedMapX, y: clampedMapY });
  };

  const getCameraTransform = () => {
    if (!containerRef.current) {
      return { transform: 'scale(2.5)', transformOrigin: '0 0', willChange: 'transform' };
    }

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const scale = 2.5;
    const mapWidth = 1000;
    const mapHeight = 800;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    let translateX, translateY;

    // Always center on initial center when in waiting state or reset
    if (!playerPositionRef.current || gameState === "waiting") {
      translateX = centerX - (center[0] * scale);
      translateY = centerY - (center[1] * scale);
    } else {
      const maxTranslateX = centerX;
      const minTranslateX = centerX - (mapWidth * scale);
      const maxTranslateY = centerY;
      const minTranslateY = centerY - (mapHeight * scale);

      translateX = centerX - (playerPositionRef.current[0] * scale);
      translateY = centerY - (playerPositionRef.current[1] * scale);

      translateX = Math.min(maxTranslateX, Math.max(minTranslateX, translateX));
      translateY = Math.min(maxTranslateY, Math.max(minTranslateY, translateY));
    }

    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      transformOrigin: '0 0',
      willChange: 'transform',
    };
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-gray-200">
      <WASDControls
        onPlayerMove={handlePlayerMove}
        playerPosition={playerPosition}
        mapRef={mapRef}
        gameState={gameState}
      />
      <div
        ref={mapRef}
        className="game-map absolute cursor-crosshair"
        onClick={handleMapClick}
        style={{
          backgroundImage: "url(/UCI_map.png)",
          backgroundSize: "1000px 800px",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 0",
          width: "1000px",
          height: "800px",
          ...getCameraTransform(),
        }}
      >
        {markers.map((marker, index) => (
          <div
            key={index}
            className="absolute z-10 pointer-events-none"
            style={{
              left: marker.position[0] - 8,
              top: marker.position[1] - 8,
            }}
          >
            <div
              className="w-4 h-4 border-2 border-white rounded-full shadow-lg flex items-center justify-center"
              style={{
                backgroundColor: marker.color || "#ffa500",
              }}
            >
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
      {playerPosition && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img
            src="/stickers/Trombone_petr.png"
            alt="Player"
            className="w-12 h-12 object-contain drop-shadow-lg"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            }}
          />
        </div>
      )}
      {/* Only show instructions during playing state */}
      {gameState === "playing" && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-sm px-3 py-2 rounded backdrop-blur z-30">
          Use WASD to move
        </div>
      )}
    </div>
  );
};

export default GameMap;