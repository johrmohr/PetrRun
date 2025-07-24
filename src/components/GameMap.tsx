import React, { useEffect, useRef, useState } from "react";
import ZoomSlider from "./ZoomSlider";
import { useCollisionDetection, type UseCollisionDetectionReturn } from "../hooks/useCollisionDetection";

interface GameMarker {
  position: [number, number]; // Now [x, y] pixels instead of [lat, lng]
  popup?: string;
  type?: "player" | "checkpoint" | "obstacle" | "treasure" | "enemy" | "default";
  color?: string;
}

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

interface GameMapProps {
  center?: [number, number]; // [x, y] pixels
  zoom?: number; // Not used for static image, kept for compatibility
  height?: string;
  width?: string;
  markers?: GameMarker[];
  playerPosition?: [number, number]; // [x, y] pixels
  onMapClick?: (position: { x: number; y: number }) => void;
  onPlayerMove?: (newPosition: [number, number]) => void;
  imageDimensions: ImageDimensions; // New prop for image dimensions
  gamePhase?: string; // Current game phase
}

// WASD Controls Component with smooth movement
function WASDControls({
  onPlayerMove,
  playerPosition,
  mapRef,
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

  // Store the latest position in a ref to avoid stale closures
  const currentPosition = useRef(playerPosition);
  currentPosition.current = playerPosition;

  useEffect(() => {
    if (!onPlayerMove) return;

    const baseMoveSpeed = 25; // Base pixels per frame (60fps = ~1500 pixels/second)

    const updatePosition = () => {
      const currentPos = currentPosition.current;
      if (!currentPos || keysPressed.current.size === 0) {
        animationFrame.current = null;
        return;
      }

      // Calculate movement based on terrain speed
      const currentSpeed = collision.isLoaded 
        ? collision.calculateSpeed(currentPos[0], currentPos[1], baseMoveSpeed)
        : baseMoveSpeed;

      let newX = currentPos[0];
      let newY = currentPos[1];

      // Handle multiple keys simultaneously for diagonal movement
      if (keysPressed.current.has("w") || keysPressed.current.has("arrowup")) {
        const tentativeY = Math.max(0, newY - currentSpeed);
        // Check if movement is valid (not blocked)
        if (!collision.isLoaded || collision.checkMovement(currentPos[0], currentPos[1], currentPos[0], tentativeY)) {
          newY = tentativeY;
        }
      }
      if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown")) {
        const tentativeY = Math.min(imageDimensions.height, newY + currentSpeed);
        if (!collision.isLoaded || collision.checkMovement(currentPos[0], currentPos[1], currentPos[0], tentativeY)) {
          newY = tentativeY;
        }
      }
      if (keysPressed.current.has("a") || keysPressed.current.has("arrowleft")) {
        const tentativeX = Math.max(0, newX - currentSpeed);
        if (!collision.isLoaded || collision.checkMovement(currentPos[0], currentPos[1], tentativeX, currentPos[1])) {
          newX = tentativeX;
        }
      }
      if (keysPressed.current.has("d") || keysPressed.current.has("arrowright")) {
        const tentativeX = Math.min(imageDimensions.width, newX + currentSpeed);
        if (!collision.isLoaded || collision.checkMovement(currentPos[0], currentPos[1], tentativeX, currentPos[1])) {
          newX = tentativeX;
        }
      }

            // Only update if position changed
      if (newX !== currentPos[0] || newY !== currentPos[1]) {
        onPlayerMove([newX, newY]);
      }

      // Continue animation loop
      animationFrame.current = requestAnimationFrame(updatePosition);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (e.target instanceof HTMLInputElement) return;

      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"].includes(key)) {
        e.preventDefault();
        keysPressed.current.add(key);
        // Start animation loop if not already running
        if (!animationFrame.current) {
          animationFrame.current = requestAnimationFrame(updatePosition);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
      // console.log('Key released:', key, 'Active keys:', Array.from(keysPressed.current));
    };

    // Handle focus loss to stop movement
    const handleBlur = () => {
      keysPressed.current.clear();
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };
  }, [onPlayerMove, imageDimensions, collision]); // Added collision dependency

  return null;
}

// Fallback: Simple WASD Controls (uncomment this and comment out the above if needed)
/*
function WASDControlsSimple({
  onPlayerMove,
  playerPosition,
  mapRef,
  imageDimensions,
}: {
  onPlayerMove?: (newPosition: [number, number]) => void;
  playerPosition?: [number, number];
  mapRef: React.RefObject<HTMLDivElement | null>;
  imageDimensions: ImageDimensions;
}) {
  useEffect(() => {
    if (!onPlayerMove || !playerPosition) return;

    const moveDistance = 25; // Larger movement for the big map

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (e.target instanceof HTMLInputElement) return;

      if (!playerPosition || !mapRef.current) return;

      let newX = playerPosition[0];
      let newY = playerPosition[1];

      const key = e.key.toLowerCase();
      switch (key) {
        case "w":
        case "arrowup":
          e.preventDefault();
          newY = Math.max(0, newY - moveDistance);
          break;
        case "s":
        case "arrowdown":
          e.preventDefault();
          newY = Math.min(imageDimensions.height, newY + moveDistance);
          break;
        case "a":
        case "arrowleft":
          e.preventDefault();
          newX = Math.max(0, newX - moveDistance);
          break;
        case "d":
        case "arrowright":
          e.preventDefault();
          newX = Math.min(imageDimensions.width, newX + moveDistance);
          break;
        default:
          return;
      }

      const newPosition: [number, number] = [newX, newY];
      onPlayerMove(newPosition);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onPlayerMove, playerPosition, mapRef, imageDimensions]);

  return null;
}
*/

const GameMap: React.FC<GameMapProps> = ({
  center = [500, 400], // Default center pixels
  markers = [],
  playerPosition,
  onMapClick,
  onPlayerMove,
  height = "100%",
  width = "100%",
  imageDimensions,
  gamePhase,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize collision detection
  const collision = useCollisionDetection();
  
  // Load zoom level from localStorage or use default
  const [zoomLevel, setZoomLevel] = useState(() => {
    const savedZoom = localStorage.getItem('petrrun-zoom-level');
    return savedZoom ? parseFloat(savedZoom) : 2.5;
  });

  // Auto-center fix: zoom in/out right after loading screen to force camera recalculation
  useEffect(() => {
    if (collision.isLoaded && !collision.isLoading) {
      console.log('🎯 Auto-center fix triggered! Collision map loaded:', collision.isLoaded);
      
      // Small zoom adjustment to force camera transform recalculation
      const originalZoom = zoomLevel;
      console.log('📊 Original zoom level:', originalZoom);
      
      // Zoom in slightly, then back to original (imperceptible to user)
      const zoomIn = originalZoom + 1;
      console.log('🔍 Step 1: Zooming IN to', zoomIn);
      setZoomLevel(zoomIn);
      
      setTimeout(() => {
        const zoomOut = originalZoom - 1;
        console.log('🔍 Step 2: Zooming OUT to', zoomOut);
        setZoomLevel(zoomOut);
        
        setTimeout(() => {
          console.log('🔍 Step 3: Returning to original zoom', originalZoom);
          setZoomLevel(0.7);
          console.log('✅ Auto-center fix complete!');
        }, 50);
      }, 50);
    }
  }, [collision.isLoaded, collision.isLoading]); // Trigger when collision map finishes loading

  // Save zoom level to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('petrrun-zoom-level', zoomLevel.toString());
  }, [zoomLevel]);

  // Keyboard shortcuts for zoom control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle zoom shortcuts when not typing in input fields
      if (e.target instanceof HTMLInputElement) return;
      
      // Don't interfere with WASD movement keys
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"].includes(key)) {
        return;
      }
      
      switch (e.key) {
        case '=':
        case '+':
          e.preventDefault();
          setZoomLevel(prev => Math.min(4, prev + 0.2));
          break;
        case '-':
          e.preventDefault();
          setZoomLevel(prev => Math.max(0.5, prev - 0.2));
          break;
        case '0':
          e.preventDefault();
          setZoomLevel(2.5); // Reset to default
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate camera transform based on game phase and player position
  const getCameraTransform = () => {
    if (!containerRef.current) {
      return { 
        transform: `scale(${Math.max(zoomLevel * 0.6, 0.5)})`,
        transformOrigin: '0 0'
      };
    }

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const scale = zoomLevel;

    // During countdown phase, always center on the specified center point
    if (gamePhase === "countdown") {
      const translateX = centerX - (center[0] * scale);
      const translateY = centerY - (center[1] * scale);
      return {
        transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
        transformOrigin: '0 0',
        willChange: 'transform',
      };
    }

    // During playing phase, follow the player if they exist
    if (playerPosition && gamePhase === "playing") {
      const translateX = centerX - (playerPosition[0] * scale);
      const translateY = centerY - (playerPosition[1] * scale);
      return {
        transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
        transformOrigin: '0 0',
        willChange: 'transform',
      };
    }

    // Default behavior: center on specified center or player position
    const targetPosition = playerPosition || center;
    const translateX = centerX - (targetPosition[0] * scale);
    const translateY = centerY - (targetPosition[1] * scale);

    return {
      transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
      transformOrigin: '0 0',
      willChange: 'transform',
    };
  };

  // Handle map clicks (adjust for zoom and translation) - using exact same logic as getCameraTransform
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onMapClick || !mapRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    
    // Get click position relative to container
    const containerX = e.clientX - rect.left;
    const containerY = e.clientY - rect.top;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const scale = zoomLevel; // Use exact same scale as camera transform
    
    // Calculate actual map position using EXACT same logic as getCameraTransform (but reversed)
    let mapX, mapY;
    
    if (gamePhase === "countdown") {
      // During countdown, camera centers on specified center point
      const translateX = centerX - (center[0] * scale);
      const translateY = centerY - (center[1] * scale);
      mapX = (containerX - translateX) / scale;
      mapY = (containerY - translateY) / scale;
    } else if (playerPosition && gamePhase === "playing") {
      // During playing, camera follows player
      const translateX = centerX - (playerPosition[0] * scale);
      const translateY = centerY - (playerPosition[1] * scale);
      mapX = (containerX - translateX) / scale;
      mapY = (containerY - translateY) / scale;
    } else {
      // Default behavior: use target position (player or center)
      const targetPosition = playerPosition || center;
      const translateX = centerX - (targetPosition[0] * scale);
      const translateY = centerY - (targetPosition[1] * scale);
      mapX = (containerX - translateX) / scale;
      mapY = (containerY - translateY) / scale;
    }

    console.log('🖱️ Click at screen:', containerX, containerY, '→ Map:', mapX, mapY, '(scale:', scale, ')');
    onMapClick({ x: mapX, y: mapY });
  };

  // Show loading while detecting image dimensions or collision map
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

  // Show collision map loading status
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

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(4, prev + delta)));
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full overflow-hidden bg-gray-200"
      onWheel={handleWheel}
    >
      {/* WASD Controls */}
      <WASDControls
        onPlayerMove={onPlayerMove}
        playerPosition={playerPosition}
        mapRef={mapRef}
        imageDimensions={imageDimensions}
        collision={collision}
      />

      {/* Map Container with Camera Transform */}
      <div
        ref={mapRef}
        className="game-map absolute cursor-crosshair"
        onClick={handleMapClick}
        style={{
          backgroundImage: "url(/UCI_map.png)",
          backgroundSize: `${imageDimensions.width}px ${imageDimensions.height}px`, // Use actual image dimensions
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 0",
          width: `${imageDimensions.width}px`,
          height: `${imageDimensions.height}px`,
          backfaceVisibility: "hidden", // Prevent flickering
          imageRendering: 'auto', // Smooth rendering during movement
          ...getCameraTransform()
        }}
      >
        {/* Player Marker */}
        {playerPosition && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: playerPosition[0] - 32, // Half of 64px width
              top: playerPosition[1] - 32,  // Half of 64px height
              willChange: 'transform', // Optimize for frequent position changes
            }}
          >
            <img 
              src="/stickers/Trombone_petr.png" 
              alt="Player" 
              className="w-16 h-16 object-contain drop-shadow-lg"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                imageRendering: 'pixelated', // Crisp rendering during movement
              }}
            />
          </div>
        )}

        {/* Game Markers */}
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
              title={marker.popup}
            >
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            {marker.popup && (
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                {marker.popup}
              </div>
            )}
          </div>
        ))}

        {/* Map Instructions - Fixed position relative to viewport */}
      </div>
      
      {/* Zoom Control Slider */}
      <ZoomSlider
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        className="absolute top-4 right-4 z-30"
      />

      {/* Instructions outside the transformed map */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-sm px-3 py-2 rounded backdrop-blur z-30">
        <div className="space-y-1">
          <div>
            {onPlayerMove ? "Use WASD to move • Map follows you" : "Click to select start position"}
          </div>
          <div className="text-xs opacity-75">
            Zoom: Mouse wheel or +/- keys • Reset: 0 key
          </div>
          {/* Terrain indicator */}
          {playerPosition && collision.isLoaded && (
            <div className="text-xs opacity-75 flex items-center gap-2">
              <span>Terrain:</span>
              {(() => {
                const terrain = collision.getTerrainInfo(playerPosition[0], playerPosition[1]);
                const terrainIcon = {
                  'blocked': '🚫',
                  'fast': '🟢',
                  'grass': '🟡',
                  'stairs': '🟠',
                  'normal': '⚪'
                }[terrain.terrainType];
                const speedText = terrain.terrainType === 'blocked' 
                  ? 'Blocked' 
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
