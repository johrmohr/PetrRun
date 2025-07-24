import React, { useEffect, useRef, useState } from "react";
import ZoomSlider from "./ZoomSlider";

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
}

// WASD Controls Component with smooth movement
function WASDControls({
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
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrame = useRef<number | null>(null);

  // Store the latest position in a ref to avoid stale closures
  const currentPosition = useRef(playerPosition);
  currentPosition.current = playerPosition;

  useEffect(() => {
    if (!onPlayerMove) return;

    const moveSpeed = 25; // pixels per frame (60fps = ~1500 pixels/second) - increased for responsiveness

    const updatePosition = () => {
      const currentPos = currentPosition.current;
      console.log('updatePosition called, currentPos:', currentPos, 'keysPressed:', Array.from(keysPressed.current));
      
      if (!currentPos || keysPressed.current.size === 0) {
        console.log('Stopping animation loop - no position or no keys');
        animationFrame.current = null;
        return;
      }

      let newX = currentPos[0];
      let newY = currentPos[1];

      // Handle multiple keys simultaneously for diagonal movement
      if (keysPressed.current.has("w") || keysPressed.current.has("arrowup")) {
        newY = Math.max(0, newY - moveSpeed);
      }
      if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown")) {
        newY = Math.min(imageDimensions.height, newY + moveSpeed);
      }
      if (keysPressed.current.has("a") || keysPressed.current.has("arrowleft")) {
        newX = Math.max(0, newX - moveSpeed);
      }
      if (keysPressed.current.has("d") || keysPressed.current.has("arrowright")) {
        newX = Math.min(imageDimensions.width, newX + moveSpeed);
      }

      console.log('Position change:', currentPos, '->', [newX, newY]);

      // Only update if position changed
      if (newX !== currentPos[0] || newY !== currentPos[1]) {
        console.log('Calling onPlayerMove with:', [newX, newY]);
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
        console.log('Key pressed:', key, 'Active keys:', Array.from(keysPressed.current));
        
        // Start animation loop if not already running
        if (!animationFrame.current) {
          console.log('Starting animation loop');
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
  }, [onPlayerMove, imageDimensions]); // Removed playerPosition from dependencies

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
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load zoom level from localStorage or use default
  const [zoomLevel, setZoomLevel] = useState(() => {
    const savedZoom = localStorage.getItem('petrrun-zoom-level');
    return savedZoom ? parseFloat(savedZoom) : 2.5;
  });

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

  // Calculate camera transform to follow player
  const getCameraTransform = () => {
    if (!playerPosition || !containerRef.current) {
      return { 
        transform: `scale(${Math.max(zoomLevel * 0.6, 0.5)})`,
        transformOrigin: '0 0'
      }; // Minimum zoom when no player
    }

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    // Calculate how much to translate to center the player
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    // Use the zoom level from the slider
    const scale = zoomLevel;
    
    // Calculate translation to keep player perfectly centered (accounting for scale)
    const translateX = centerX - (playerPosition[0] * scale);
    const translateY = centerY - (playerPosition[1] * scale);

    return {
      transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
      transformOrigin: '0 0',
      willChange: 'transform', // Optimize for frequent updates
    };
  };

  // Handle map clicks (adjust for zoom and translation)
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onMapClick || !mapRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scale = playerPosition ? zoomLevel : Math.max(zoomLevel * 0.6, 0.5); // Use current zoom level
    
    // Get click position relative to container
    const containerX = e.clientX - rect.left;
    const containerY = e.clientY - rect.top;

    // Calculate actual map position accounting for zoom and translation
    let mapX, mapY;
    
    if (playerPosition) {
      const centerX = containerRef.current.clientWidth / 2;
      const centerY = containerRef.current.clientHeight / 2;
      
      const translateX = centerX - (playerPosition[0] * scale);
      const translateY = centerY - (playerPosition[1] * scale);
      
      mapX = (containerX - translateX) / scale;
      mapY = (containerY - translateY) / scale;
          } else {
        // No player position, just account for scale
        const centerX = containerRef.current.clientWidth / 2;
        const centerY = containerRef.current.clientHeight / 2;
        mapX = (containerX - centerX) / scale + imageDimensions.width / 2;
        mapY = (containerY - centerY) / scale + imageDimensions.height / 2;
      }

    onMapClick({ x: mapX, y: mapY });
  };

  // Show loading while detecting image dimensions
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
        </div>
      </div>
    </div>
  );
};

export default GameMap;
