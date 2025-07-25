import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import ZoomSlider from "./ZoomSlider";
import {
  useCollisionDetection,
  type UseCollisionDetectionReturn,
} from "@/hooks/useCollisionDetection";
import type { ImageDimensions, GameMapProps } from "@/utils/types";

// Optimized WASD Controls with refs instead of state
function WASDControls({
  onPlayerMove,
  playerPosition,
  imageDimensions,
  collision,
}: {
  onPlayerMove?: (newPosition: [number, number]) => void;
  playerPosition?: [number, number];
  imageDimensions: ImageDimensions;
  collision: UseCollisionDetectionReturn;
}) {
  // Claude said that keeping it a set is fine since you want multi directional movement
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrame = useRef<number | null>(null); // Use ref to store animation frame ID
  const lastUpdate = useRef<number>(performance.now()); // Last update timestamp
  const playerPosRef = useRef(playerPosition); // Ref to store player position
  const onPlayerMoveRef = useRef(onPlayerMove);

  // Update refs when props change
  playerPosRef.current = playerPosition;
  onPlayerMoveRef.current = onPlayerMove;

  useEffect(() => {
    const updatePosition = (timestamp: number) => {
      const currentPlayerPos = playerPosRef.current;
      const currentOnPlayerMove = onPlayerMoveRef.current;

      if (!currentPlayerPos || !currentOnPlayerMove) {
        animationFrame.current = requestAnimationFrame(updatePosition);
        return;
      }

      const deltaTime = Math.min((timestamp - lastUpdate.current) / 1000, 0.1);
      lastUpdate.current = timestamp;

      const baseMoveSpeed = 150;
      const currentSpeed = collision.isLoaded
        ? collision.calculateSpeed(
            currentPlayerPos[0],
            currentPlayerPos[1],
            baseMoveSpeed
          )
        : baseMoveSpeed;

      let moveX = 0;
      let moveY = 0;

      // Check keys
      const keys = keysPressed.current;
      if (keys.has("w") || keys.has("arrowup")) moveY -= 1;
      if (keys.has("s") || keys.has("arrowdown")) moveY += 1;
      if (keys.has("a") || keys.has("arrowleft")) moveX -= 1;
      if (keys.has("d") || keys.has("arrowright")) moveX += 1;

      if (moveX !== 0 || moveY !== 0) {
        const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
        const normalizedMoveX = (moveX / magnitude) * currentSpeed * deltaTime;
        const normalizedMoveY = (moveY / magnitude) * currentSpeed * deltaTime;

        let newX = currentPlayerPos[0] + normalizedMoveX;
        let newY = currentPlayerPos[1] + normalizedMoveY;

        // Clamp to boundaries
        newX = Math.max(0, Math.min(imageDimensions.width, newX));
        newY = Math.max(0, Math.min(imageDimensions.height, newY));

        // Collision detection
        if (collision.isLoaded) {
          const canMove = collision.checkMovement(
            currentPlayerPos[0],
            currentPlayerPos[1],
            newX,
            newY
          );

          if (!canMove) {
            // Try sliding along obstacles
            const tryX = Math.max(
              0,
              Math.min(
                imageDimensions.width,
                currentPlayerPos[0] + normalizedMoveX
              )
            );
            const tryY = Math.max(
              0,
              Math.min(
                imageDimensions.height,
                currentPlayerPos[1] + normalizedMoveY
              )
            );

            if (
              collision.checkMovement(
                currentPlayerPos[0],
                currentPlayerPos[1],
                tryX,
                currentPlayerPos[1]
              )
            ) {
              newX = tryX;
              newY = currentPlayerPos[1];
            } else if (
              collision.checkMovement(
                currentPlayerPos[0],
                currentPlayerPos[1],
                currentPlayerPos[0],
                tryY
              )
            ) {
              newX = currentPlayerPos[0];
              newY = tryY;
            } else {
              newX = currentPlayerPos[0];
              newY = currentPlayerPos[1];
            }
          }
        }

        // Only update if position changed
        if (newX !== currentPlayerPos[0] || newY !== currentPlayerPos[1]) {
          currentOnPlayerMove([newX, newY]);
        }
      }

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
        keysPressed.current.add(key);
        if (!animationFrame.current) {
          lastUpdate.current = performance.now();
          animationFrame.current = requestAnimationFrame(updatePosition);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    const handleBlur = () => {
      keysPressed.current.clear();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    animationFrame.current = requestAnimationFrame(updatePosition);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [imageDimensions, collision]); // Removed playerPosition and onPlayerMove from deps

  return null;
}

const GameMap: React.FC<GameMapProps> = ({
  center,
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

  // Add state to track container dimensions
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Single state for zoom with lazy initialization
  const [zoomLevel, setZoomLevel] = useState(() => {
    const savedZoom = localStorage.getItem("petrrun-zoom-level");
    return savedZoom ? parseFloat(savedZoom) : 2.5;
  });

  // Use useLayoutEffect to measure container and update dimensions
  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerDimensions((prev) => {
          if (prev.width !== clientWidth || prev.height !== clientHeight) {
            return { width: clientWidth, height: clientHeight };
          }
          return prev;
        });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Memoized camera transform calculation using state dimensions
  const cameraTransform = useMemo(() => {
    const { width: containerWidth, height: containerHeight } =
      containerDimensions;

    // Early return with basic scale if dimensions not available
    if (containerWidth === 0 || containerHeight === 0) {
      return {
        transform: `scale(${Math.max(zoomLevel * 0.6, 0.5)})`,
        transformOrigin: "0 0",
      };
    }

    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const scale = zoomLevel;

    let targetPosition = center;
    if (gamePhase === "playing" && playerPosition) {
      targetPosition = playerPosition;
    }

    const translateX = centerX - targetPosition[0] * scale;
    const translateY = centerY - targetPosition[1] * scale;

    console.log("Camera Transform:", {
      translateX,
      translateY,
      scale,
      containerWidth,
      containerHeight,
    });

    return {
      transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
      transformOrigin: "0 0",
      willChange: "transform",
    };
  }, [containerDimensions, zoomLevel, center, playerPosition, gamePhase]);

  // Updated click handler to use state dimensions
  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onMapClick || !mapRef.current) return;
      if (containerDimensions.width === 0 || containerDimensions.height === 0)
        return;

      const rect = containerRef.current!.getBoundingClientRect();
      const containerX = e.clientX - rect.left;
      const containerY = e.clientY - rect.top;
      const { width: containerWidth, height: containerHeight } =
        containerDimensions;
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;

      const translateX = centerX - center[0] * zoomLevel;
      const translateY = centerY - center[1] * zoomLevel;

      const mapX = (containerX - translateX) / zoomLevel;
      const mapY = (containerY - translateY) / zoomLevel;

      onMapClick({ x: mapX, y: mapY });
    },
    [onMapClick, center, containerDimensions, zoomLevel]
  );

  // ... rest of your component remains the same
  // Memoized wheel handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel((prev) => Math.max(0.5, Math.min(4, prev + delta)));
  }, []);

  // Memoized terrain info
  const terrainInfo = useMemo(() => {
    if (!playerPosition || !collision.isLoaded) return null;
    return collision.getTerrainInfo(playerPosition[0], playerPosition[1]);
  }, [playerPosition, collision]);

  // Single effect for all keyboard shortcuts and zoom persistence
  useEffect(() => {
    // Save zoom to localStorage
    localStorage.setItem("petrrun-zoom-level", zoomLevel.toString());

    // Keyboard shortcuts
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
        return; // Handled by WASDControls
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
  }, [zoomLevel]);

  // Loading states
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

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gray-200"
      onWheel={handleWheel}
    >
      <WASDControls
        onPlayerMove={onPlayerMove}
        playerPosition={playerPosition}
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
          ...cameraTransform,
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
          {terrainInfo && (
            <div className="text-xs opacity-75 flex items-center gap-2">
              <span>Terrain:</span>
              {(() => {
                const terrainIcon = {
                  blocked: "🚫",
                  fast: "🟢",
                  grass: "🟡",
                  stairs: "🟠",
                  normal: "⚪",
                }[terrainInfo.terrainType];
                const speedText =
                  terrainInfo.terrainType === "blocked"
                    ? "Blocked"
                    : `${Math.round(terrainInfo.speedMultiplier * 100)}% speed`;
                return (
                  <span className="flex items-center gap-1">
                    {terrainIcon}
                    <span>{terrainInfo.terrainType}</span>
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
