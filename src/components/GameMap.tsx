import React, { useEffect, useRef, useState } from "react";

interface GameMarker {
  position: [number, number]; // Now [x, y] pixels instead of [lat, lng]
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
  onMapClick?: (position: { x: number; y: number }) => void;
  onPlayerMove?: (newPosition: [number, number]) => void;
}

// WASD Controls Component
function WASDControls({
  onPlayerMove,
  playerPosition,
  mapRef,
}: {
  onPlayerMove?: (newPosition: [number, number]) => void;
  playerPosition?: [number, number];
  mapRef: React.RefObject<HTMLDivElement>;
}) {
  useEffect(() => {
    if (!onPlayerMove || !playerPosition) return;

    const moveDistance = 5; // Reduced for zoomed-in view (was 10)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playerPosition || !mapRef.current) return;

      let newX = playerPosition[0];
      let newY = playerPosition[1];

      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          newY = Math.max(0, newY - moveDistance);
          break;
        case "s":
        case "arrowdown":
          newY = Math.min(800, newY + moveDistance); // 800 is map height
          break;
        case "a":
        case "arrowleft":
          newX = Math.max(0, newX - moveDistance);
          break;
        case "d":
        case "arrowright":
          newX = Math.min(1000, newX + moveDistance); // 1000 is map width
          break;
        default:
          return;
      }

      const newPosition: [number, number] = [newX, newY];
      onPlayerMove(newPosition);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onPlayerMove, playerPosition, mapRef]);

  return null;
}

const GameMap: React.FC<GameMapProps> = ({
  center = [500, 400], // Default center pixels
  markers = [],
  playerPosition,
  onMapClick,
  onPlayerMove,
  height = "100%",
  width = "100%",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate camera transform to follow player
  const getCameraTransform = () => {
    if (!playerPosition || !containerRef.current) {
      return { transform: 'scale(2)' }; // Default zoom without player
    }

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    // Calculate how much to translate to center the player
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    // Scale factor for zoom
    const scale = 2;
    
    // Calculate translation to keep player centered (accounting for scale)
    const translateX = centerX - (playerPosition[0] * scale);
    const translateY = centerY - (playerPosition[1] * scale);

    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      transformOrigin: '0 0'
    };
  };

  // Handle map clicks (adjust for zoom and translation)
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onMapClick || !mapRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scale = 2; // Match the scale used in transform
    
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
      mapX = (containerX - centerX) / scale + 500; // 500 is default center
      mapY = (containerY - centerY) / scale + 400; // 400 is default center
    }

    onMapClick({ x: mapX, y: mapY });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-gray-200">
      {/* WASD Controls */}
      <WASDControls
        onPlayerMove={onPlayerMove}
        playerPosition={playerPosition}
        mapRef={mapRef}
      />

      {/* Map Container with Camera Transform */}
      <div
        ref={mapRef}
        className="game-map absolute cursor-crosshair transition-transform duration-200 ease-out"
        onClick={handleMapClick}
        style={{
          backgroundImage: "url(/UCI_map.png)",
          backgroundSize: "1000px 800px", // Fixed size for consistent scaling
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 0",
          width: "1000px",
          height: "800px",
          ...getCameraTransform()
        }}
      >
        {/* Player Marker */}
        {playerPosition && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: playerPosition[0] - 16, // Half of 32px width
              top: playerPosition[1] - 16,  // Half of 32px height
            }}
          >
            <img 
              src="/stickers/Trombone_petr.png" 
              alt="Player" 
              className="w-8 h-8 object-contain drop-shadow-lg"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
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
      
      {/* Instructions outside the transformed map */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-sm px-3 py-2 rounded backdrop-blur z-30">
        {onPlayerMove ? "Use WASD to move • Map follows you" : "Click to select start position"}
      </div>
    </div>
  );
};

export default GameMap;
