import React, { useEffect, useRef, useState } from "react";
import ZoomSlider from "./ZoomSlider";
import {
  useCollisionDetection,
  type UseCollisionDetectionReturn,
} from "../hooks/useCollisionDetection";

interface GameMarker {
  position: [number, number]; // [x, y] pixels
  popup?: string;
  type?:
    | "player"
    | "checkpoint"
    | "obstacle"
    | "treasure"
    | "enemy"
    | "default";
  color?: string;
  sprite?: string; // URL to sprite image
}

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

interface GameMapProps {
  center?: [number, number]; // [x, y] pixels
  zoom?: number;
  height?: string;
  width?: string;
  markers?: GameMarker[];
  playerPosition?: [number, number]; // [x, y] pixels
  onMapClick?: (position: { x: number; y: number }) => void;
  onPlayerMove?: (newPosition: [number, number]) => void;
  imageDimensions: ImageDimensions;
  gamePhase?: string;
}

function WASDControls({
  onPlayerMove,
  playerPosition,
  imageDimensions,
  collision,
}: {
  onPlayerMove?: (newPosition: [number, number]) => void;
  playerPosition?: [number, number];
  mapRef: React.RefObject<HTMLDivElement | null>;
  imageDimensions: ImageDimensions;
  collision: UseCollisionDetectionReturn;
}) {
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrame = useRef<number | null>(null);
  const lastUpdate = useRef<number>(performance.now());

  useEffect(() => {
    console.log("WASDControls: useEffect mounted", {
      playerPosition,
      onPlayerMove: !!onPlayerMove,
    });

    const updatePosition = (timestamp: number) => {
      if (!playerPosition || !onPlayerMove) {
        console.log("WASDControls: Skipping update", {
          hasPlayerPosition: !!playerPosition,
          hasOnPlayerMove: !!onPlayerMove,
        });
        animationFrame.current = requestAnimationFrame(updatePosition);
        return;
      }

      const deltaTime = Math.min((timestamp - lastUpdate.current) / 1000, 0.1); // Cap deltaTime at 100ms
      lastUpdate.current = timestamp;

      const baseMoveSpeed = 150; // Pixels per second (reduced from 300)
      const currentSpeed = collision.isLoaded
        ? collision.calculateSpeed(
            playerPosition[0],
            playerPosition[1],
            baseMoveSpeed
          )
        : baseMoveSpeed;

      let moveX = 0;
      let moveY = 0;

      // Accumulate movement direction based on keys
      if (keysPressed.current.has("w") || keysPressed.current.has("arrowup")) {
        moveY -= 1;
      }
      if (
        keysPressed.current.has("s") ||
        keysPressed.current.has("arrowdown")
      ) {
        moveY += 1;
      }
      if (
        keysPressed.current.has("a") ||
        keysPressed.current.has("arrowleft")
      ) {
        moveX -= 1;
      }
      if (
        keysPressed.current.has("d") ||
        keysPressed.current.has("arrowright")
      ) {
        moveX += 1;
      }

      let newX = playerPosition[0];
      let newY = playerPosition[1];

      // Only calculate movement if there's a direction
      if (moveX !== 0 || moveY !== 0) {
        // Normalize movement vector to ensure consistent speed in all directions
        const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
        const normalizedMoveX = (moveX / magnitude) * currentSpeed * deltaTime;
        const normalizedMoveY = (moveY / magnitude) * currentSpeed * deltaTime;

        newX = playerPosition[0] + normalizedMoveX;
        newY = playerPosition[1] + normalizedMoveY;

        // Clamp position to map boundaries
        newX = Math.max(0, Math.min(imageDimensions.width, newX));
        newY = Math.max(0, Math.min(imageDimensions.height, newY));

        // Handle collision
        if (collision.isLoaded) {
          const canMove = collision.checkMovement(
            playerPosition[0],
            playerPosition[1],
            newX,
            newY
          );
          console.log("WASDControls: Collision check", {
            from: playerPosition,
            to: [newX, newY],
            canMove,
          });

          if (!canMove) {
            // Try moving only in X or Y direction to allow sliding along obstacles
            const tryX = Math.max(
              0,
              Math.min(
                imageDimensions.width,
                playerPosition[0] + normalizedMoveX
              )
            );
            const tryY = Math.max(
              0,
              Math.min(
                imageDimensions.height,
                playerPosition[1] + normalizedMoveY
              )
            );

            if (
              collision.checkMovement(
                playerPosition[0],
                playerPosition[1],
                tryX,
                playerPosition[1]
              )
            ) {
              newX = tryX;
              newY = playerPosition[1];
            } else if (
              collision.checkMovement(
                playerPosition[0],
                playerPosition[1],
                playerPosition[0],
                tryY
              )
            ) {
              newX = playerPosition[0];
              newY = tryY;
            } else {
              newX = playerPosition[0];
              newY = playerPosition[1];
            }
          }
        }

        console.log("WASDControls: Attempting move", {
          from: playerPosition,
          to: [newX, newY],
          delta: [normalizedMoveX, normalizedMoveY],
          speed: currentSpeed,
          deltaTime,
        });

        // Only call onPlayerMove if position actually changed
        if (newX !== playerPosition[0] || newY !== playerPosition[1]) {
          onPlayerMove([newX, newY]);
        }
      }

      // Keep the animation loop running for smooth updates
      animationFrame.current = requestAnimationFrame(updatePosition);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      const key = e.key.toLowerCase();
      if (
        [
          "w",
          "a",
          "s",
          "d",
          "arrowup",
          "arrowleft",
          "arrowdown",
          "arrowright",
        ].includes(key)
      ) {
        e.preventDefault();
        if (!keysPressed.current.has(key)) {
          keysPressed.current.add(key);
          console.log("WASDControls: Key down", {
            key,
            keysPressed: Array.from(keysPressed.current),
          });
          // Start animation loop if not already running
          if (!animationFrame.current) {
            lastUpdate.current = performance.now();
            animationFrame.current = requestAnimationFrame(updatePosition);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keysPressed.current.has(key)) {
        keysPressed.current.delete(key);
        console.log("WASDControls: Key up", {
          key,
          keysPressed: Array.from(keysPressed.current),
        });
      }
    };

    const handleBlur = () => {
      console.log("WASDControls: Window blur - clearing keys");
      keysPressed.current.clear();
      // Don't cancel animation frame to keep loop running
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    // Start the animation loop immediately
    animationFrame.current = requestAnimationFrame(updatePosition);

    return () => {
      console.log("WASDControls: Cleaning up");
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [onPlayerMove, playerPosition, imageDimensions, collision]);

  return null;
}

const GameMap: React.FC<GameMapProps> = ({
  center = [500, 400],
  markers = [],
  playerPosition,
  onMapClick,
  onPlayerMove,
  imageDimensions,
  gamePhase,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const collision = useCollisionDetection();
  const [zoomLevel, setZoomLevel] = useState(() => {
    const savedZoom = localStorage.getItem("petrrun-zoom-level");
    return savedZoom ? parseFloat(savedZoom) : 2.5;
  });

  useEffect(() => {
    if (collision.isLoaded && !collision.isLoading) {
      console.log(
        "🎯 Auto-center fix triggered! Collision map loaded:",
        collision.isLoaded
      );
    }
  }, [collision.isLoaded, collision.isLoading]);

  useEffect(() => {
    localStorage.setItem("petrrun-zoom-level", zoomLevel.toString());
  }, [zoomLevel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const key = e.key.toLowerCase();
      if (
        [
          "w",
          "a",
          "s",
          "d",
          "arrowup",
          "arrowleft",
          "arrowdown",
          "arrowright",
        ].includes(key)
      ) {
        return;
      }
      switch (e.key) {
        case "=":
        case "+":
          e.preventDefault();
          setZoomLevel((prev) => Math.min(4, prev + 0.2));
          break;
        case "-":
          e.preventDefault();
          setZoomLevel((prev) => Math.max(0.5, prev - 0.2));
          break;
        case "0":
          e.preventDefault();
          setZoomLevel(2.5);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getCameraTransform = () => {
    if (!containerRef.current) {
      return {
        transform: `scale(${Math.max(zoomLevel * 0.6, 0.5)})`,
        transformOrigin: "0 0",
      };
    }

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const scale = zoomLevel;

    if (gamePhase === "countdown") {
      const translateX = centerX - center[0] * scale;
      const translateY = centerY - center[1] * scale;
      return {
        transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
        transformOrigin: "0 0",
        willChange: "transform",
      };
    }

    if (playerPosition && gamePhase === "playing") {
      const translateX = centerX - playerPosition[0] * scale;
      const translateY = centerY - playerPosition[1] * scale;
      return {
        transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
        transformOrigin: "0 0",
        willChange: "transform",
      };
    }

    const targetPosition = playerPosition || center;
    const translateX = centerX - targetPosition[0] * scale;
    const translateY = centerY - targetPosition[1] * scale;

    return {
      transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
      transformOrigin: "0 0",
      willChange: "transform",
    };
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onMapClick || !mapRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const containerX = e.clientX - rect.left;
    const containerY = e.clientY - rect.top;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const scale = zoomLevel;

    let mapX, mapY;
    if (gamePhase === "countdown") {
      const translateX = centerX - center[0] * scale;
      const translateY = centerY - center[1] * scale;
      mapX = (containerX - translateX) / scale;
      mapY = (containerY - translateY) / scale;
    } else if (playerPosition && gamePhase === "playing") {
      const translateX = centerX - playerPosition[0] * scale;
      const translateY = centerY - playerPosition[1] * scale;
      mapX = (containerX - translateX) / scale;
      mapY = (containerY - translateY) / scale;
    } else {
      const targetPosition = playerPosition || center;
      const translateX = centerX - targetPosition[0] * scale;
      const translateY = centerY - targetPosition[1] * scale;
      mapX = (containerX - translateX) / scale;
      mapY = (containerY - translateY) / scale;
    }

    console.log(
      "🖱️ Click at screen:",
      containerX,
      containerY,
      "→ Map:",
      mapX,
      mapY,
      "(scale:",
      scale,
      ")"
    );
    onMapClick({ x: mapX, y: mapY });
  };

  if (!imageDimensions) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing map...</p>
        </div>
      </div>
    );
  }

  if (collision.isLoading) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collision map...</p>
        </div>
      </div>
    );
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel((prev) => Math.max(0.5, Math.min(4, prev + delta)));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gray-200"
      onWheel={handleWheel}
    >
      <WASDControls
        onPlayerMove={onPlayerMove}
        playerPosition={playerPosition}
        mapRef={mapRef}
        imageDimensions={imageDimensions}
        collision={collision}
      />
      <div
        ref={mapRef}
        className="game-map absolute cursor-crosshair"
        onClick={handleMapClick}
        style={{
          backgroundImage: "url(/UCI_map.png)",
          backgroundSize: `${imageDimensions.width}px ${imageDimensions.height}px`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 0",
          width: `${imageDimensions.width}px`,
          height: `${imageDimensions.height}px`,
          backfaceVisibility: "hidden",
          imageRendering: "auto",
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
            <img
              src={marker.sprite}
              alt="Marker"
              className="w-8 h-8 object-contain"
            />
          </div>
        ))}
      </div>
      {playerPosition && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            willChange: "transform",
          }}
        >
          <img
            src="/stickers/Trombone_petr.png"
            alt="Player"
            className="w-16 h-16 object-contain drop-shadow-lg"
            style={{
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
              imageRendering: "pixelated",
            }}
          />
        </div>
      )}
      <ZoomSlider
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        className="absolute top-4 right-4 z-30"
      />
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-sm px-3 py-2 rounded backdrop-blur z-30">
        <div className="space-y-1">
          <div>
            {onPlayerMove
              ? "Use WASD to move • Map follows you"
              : "Click to select start position"}
          </div>
          <div className="text-xs opacity-75">
            Zoom: Mouse wheel or +/- keys • Reset: 0 key
          </div>
          {playerPosition && collision.isLoaded && (
            <div className="text-xs opacity-75 flex items-center gap-2">
              <span>Terrain:</span>
              {(() => {
                const terrain = collision.getTerrainInfo(
                  playerPosition[0],
                  playerPosition[1]
                );
                const terrainIcon = {
                  blocked: "🚫",
                  fast: "🟢",
                  grass: "🟡",
                  stairs: "🟠",
                  normal: "⚪",
                }[terrain.terrainType];
                const speedText =
                  terrain.terrainType === "blocked"
                    ? "Blocked"
                    : `${Math.round(terrain.speedMultiplier * 100)}% speed`;
                return (
                  <span className="flex items-center gap-1">
                    {terrainIcon}
                    <span>{terrain.terrainType}</span>
                    <span>({speedText})</span>
                  </span>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameMap;
