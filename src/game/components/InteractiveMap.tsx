import React, { useEffect, useRef, useState } from "react";
import ZoomControl from "@/ui/ZoomControl";
import { getStickerForMarker } from "../utils/mapUtils";
import { useMapImageData } from "../hooks/useMapImageData";

interface MapMarker {
  position: [number, number]; // [x, y] pixels in map coordinate space
  popup?: string;
  color?: string;
}

interface ImageDimensions {
  width: number;
  height: number;
}

interface GameMapProps {
  markers?: MapMarker[];
  playerPosition?: [number, number]; // [x, y] pixels in map coordinate space
  onMapClick?: (position: { x: number; y: number }) => void;
  onPlayerMove?: (newPosition: [number, number]) => void;
  imageDimensions: ImageDimensions;
  onMapImageDataLoaded?: (imageData: ImageData | null) => void; // Callback to provide image data to parent
}

// Constants for better control
const MOVE_SPEED = 8; // pixels per frame for smoother movement
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 5.0;
const ZOOM_DEFAULT = 1.5;
const ZOOM_STEP = 0.15;
const BOUNDARY_PADDING = 32; // Keep player sprite fully visible

// Smooth WASD Controls with diagonal movement support
const WASDControls: React.FC<{
  onPlayerMove?: (newPosition: [number, number]) => void;
  playerPosition?: [number, number];
  imageDimensions: ImageDimensions;
}> = ({ onPlayerMove, playerPosition, imageDimensions }) => {
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    if (!onPlayerMove || !playerPosition) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        keysPressed.current.add(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
    };

    const updatePosition = () => {
      if (!playerPosition || keysPressed.current.size === 0) {
        animationFrame.current = requestAnimationFrame(updatePosition);
        return;
      }

      let deltaX = 0;
      let deltaY = 0;

      // Calculate movement vector based on pressed keys
      if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) deltaY -= MOVE_SPEED;
      if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) deltaY += MOVE_SPEED;
      if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) deltaX -= MOVE_SPEED;
      if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) deltaX += MOVE_SPEED;

      // Normalize diagonal movement to maintain consistent speed
      if (deltaX !== 0 && deltaY !== 0) {
        const normalizer = Math.sqrt(2) / 2; // ~0.707
        deltaX *= normalizer;
        deltaY *= normalizer;
      }

      if (deltaX !== 0 || deltaY !== 0) {
        // Apply bounds checking with padding for sprite visibility
        const newX = Math.max(
          BOUNDARY_PADDING, 
          Math.min(imageDimensions.width - BOUNDARY_PADDING, playerPosition[0] + deltaX)
        );
        const newY = Math.max(
          BOUNDARY_PADDING, 
          Math.min(imageDimensions.height - BOUNDARY_PADDING, playerPosition[1] + deltaY)
        );

        // Only update if position actually changed
        if (newX !== playerPosition[0] || newY !== playerPosition[1]) {
          onPlayerMove([newX, newY]);
        }
      }

      animationFrame.current = requestAnimationFrame(updatePosition);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    animationFrame.current = requestAnimationFrame(updatePosition);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [onPlayerMove, playerPosition, imageDimensions]);

  return null;
};

const GameMap: React.FC<GameMapProps> = ({
  markers = [],
  playerPosition,
  onMapClick,
  onPlayerMove,
  imageDimensions,
  onMapImageDataLoaded,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load map image data for transparency checking
  const { imageData } = useMapImageData("/UCI_map.png");
  
  // Notify parent when image data is loaded
  useEffect(() => {
    if (onMapImageDataLoaded) {
      onMapImageDataLoaded(imageData);
    }
  }, [imageData, onMapImageDataLoaded]);
  
  // Zoom state with proper bounds
  const [zoomLevel, setZoomLevel] = useState(() => {
    const savedZoom = localStorage.getItem("petrrun-zoom-level");
    const zoom = savedZoom ? parseFloat(savedZoom) : ZOOM_DEFAULT;
    return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom));
  });

  // Save zoom level to localStorage
  useEffect(() => {
    localStorage.setItem("petrrun-zoom-level", zoomLevel.toString());
  }, [zoomLevel]);

  // Zoom control functions
  const zoomIn = () => setZoomLevel(prev => Math.min(ZOOM_MAX, prev + ZOOM_STEP));
  const zoomOut = () => setZoomLevel(prev => Math.max(ZOOM_MIN, prev - ZOOM_STEP));
  const resetZoom = () => setZoomLevel(ZOOM_DEFAULT);

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "=":
        case "+":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
          e.preventDefault();
          zoomOut();
          break;
        case "0":
          e.preventDefault();
          resetZoom();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Calculate viewport transform to follow player or center map
  const getViewportTransform = () => {
    if (!containerRef.current) {
      return { transform: `scale(${zoomLevel})`, transformOrigin: "center center" };
    }

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    if (!playerPosition) {
      // No player - center the map in the viewport
      const translateX = (containerWidth - imageDimensions.width * zoomLevel) / 2;
      const translateY = (containerHeight - imageDimensions.height * zoomLevel) / 2;
      
      return {
        transform: `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`,
        transformOrigin: "0 0",
      };
    }

    // Player exists - follow the player with bounds checking
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    // Calculate where we want the player to appear (center of viewport)
    let translateX = centerX - playerPosition[0] * zoomLevel;
    let translateY = centerY - playerPosition[1] * zoomLevel;

    // Apply bounds - don't let the map go beyond viewport edges
    const scaledMapWidth = imageDimensions.width * zoomLevel;
    const scaledMapHeight = imageDimensions.height * zoomLevel;

    // Constrain X translation
    translateX = Math.min(0, translateX); // Don't go past left edge
    translateX = Math.max(containerWidth - scaledMapWidth, translateX); // Don't go past right edge

    // Constrain Y translation  
    translateY = Math.min(0, translateY); // Don't go past top edge
    translateY = Math.max(containerHeight - scaledMapHeight, translateY); // Don't go past bottom edge

    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`,
      transformOrigin: "0 0",
    };
  };

  // Handle map clicks - convert viewport coordinates to map coordinates
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onMapClick || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const viewportX = e.clientX - rect.left;
    const viewportY = e.clientY - rect.top;

    // Get current transform values
    const transform = getViewportTransform();
    const transformMatch = transform.transform.match(/translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)\s*scale\((-?\d+(?:\.\d+)?)\)/);
    
    if (!transformMatch) return;
    
    const translateX = parseFloat(transformMatch[1]);
    const translateY = parseFloat(transformMatch[2]);
    const scale = parseFloat(transformMatch[3]);

    // Convert viewport coordinates to map coordinates
    const mapX = (viewportX - translateX) / scale;
    const mapY = (viewportY - translateY) / scale;

    // Ensure coordinates are within map bounds
    if (mapX >= 0 && mapX <= imageDimensions.width && mapY >= 0 && mapY <= imageDimensions.height) {
      onMapClick({ x: mapX, y: mapY });
    }
  };

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoomLevel(prev => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prev + delta)));
  };

  // Show loading state
  if (!imageDimensions.width || !imageDimensions.height) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
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
      {/* WASD Controls */}
      <WASDControls
        onPlayerMove={onPlayerMove}
        playerPosition={playerPosition}
        imageDimensions={imageDimensions}
      />

      {/* Map Container */}
      <div
        ref={mapRef}
        className="absolute cursor-crosshair transition-transform duration-200 ease-out"
        onClick={handleMapClick}
        style={{
          backgroundImage: "url(/UCI_map.png)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 0",
          width: `${imageDimensions.width}px`,
          height: `${imageDimensions.height}px`,
          willChange: "transform",
          ...getViewportTransform(),
        }}
      >
        {/* Player Marker */}
        {playerPosition && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: playerPosition[0] - 32,
              top: playerPosition[1] - 32,
              transform: "scale(1)", // Ensure player doesn't scale with map
            }}
          >
            <img
              src="/stickers/Trombone_petr.png"
              alt="Player"
              className="w-16 h-16 object-contain drop-shadow-lg"
              style={{
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
              }}
            />
          </div>
        )}

        {/* Game Markers */}
        {markers.map((marker, index) => {
          return (
            <div
              key={index}
              className="absolute z-10 pointer-events-none"
              style={{
                left: marker.position[0] - 20,
                top: marker.position[1] - 20,
                transform: "scale(1)", // Ensure markers don't scale with map
              }}
            >
              <img
                src={getStickerForMarker(marker, index)}
                alt={marker.popup || "Game marker"}
                className="w-10 h-10 object-contain drop-shadow-lg transition-transform hover:scale-110"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                }}
                title={marker.popup}
              />
              {marker.popup && (
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity z-20">
                  {marker.popup}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Zoom Control */}
      <ZoomControl
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        className="absolute top-4 right-4 z-30"
      />

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-sm px-3 py-2 rounded backdrop-blur z-30">
        <div className="space-y-1">
          <div>
            {onPlayerMove
              ? "WASD: Move • Mouse: Click to set target"
              : "Click to select start position"}
          </div>
          <div className="text-xs opacity-75">
            Zoom: Scroll wheel or +/- • Reset: 0 key
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMap;
