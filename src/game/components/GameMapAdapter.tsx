import React from "react";
import InteractiveMap from "./InteractiveMap";
import type { GameMarker } from "../../utils/types";

interface GameMapProps {
  center?: [number, number]; // Pixel coordinates [x, y] - ignored, InteractiveMap handles centering
  zoom?: number; // Ignored in favor of InteractiveMap's internal zoom
  height?: string; // Ignored
  width?: string; // Ignored
  markers: GameMarker[];
  paths?: Array<{
    positions: [number, number][];
    color: string;
    weight: number;
  }>; // Not implemented yet
  areas?: Array<{
    center: [number, number];
    radius: number;
    color: string;
    fillColor: string;
    popup: string;
  }>; // Not implemented yet
  playerPosition: [number, number]; // Pixel coordinates [x, y]
  darkMode?: boolean; // Ignored
  enable2_5D?: boolean; // Ignored
  gameStyle?: boolean; // Ignored
  bounds?: [[number, number], [number, number]]; // Ignored
  onMapClick?: (position: { lat: number; lng: number }) => void; // Legacy format for compatibility
  onMarkerClick?: (marker: GameMarker) => void; // Not implemented yet
  onPlayerMove?: (newPosition: [number, number]) => void; // Pixel coordinates
  imageDimensions: { width: number; height: number };
  onMapImageDataLoaded?: (imageData: ImageData | null) => void; // Pass through to InteractiveMap
}

const GameMapAdapter: React.FC<GameMapProps> = ({
  markers,
  playerPosition,
  onMapClick,
  onPlayerMove,
  imageDimensions,
  onMapImageDataLoaded,
}) => {
  // Convert markers to the format expected by InteractiveMap
  const pixelMarkers = markers.map((marker) => ({
    position: marker.position, // Already pixel coordinates
    popup: marker.popup,
    color: marker.color,
  }));

  // Handle map clicks - InteractiveMap returns pixel coordinates, convert to legacy geo format
  const handlePixelMapClick = (position: { x: number; y: number }) => {
    if (onMapClick) {
      // Convert pixel coordinates to a fake geographic format for backward compatibility
      // This maintains compatibility with existing game logic
      const normalizedX = position.x / imageDimensions.width;
      const normalizedY = position.y / imageDimensions.height;
      
      // Create fake lat/lng that maps consistently to pixel space
      const fakeLat = 33.65 - (normalizedY * 0.01); // UCI campus latitude range
      const fakeLng = -117.845 + (normalizedX * 0.01); // UCI campus longitude range
      
      onMapClick({ lat: fakeLat, lng: fakeLng });
    }
  };

  // Handle player movement - pass through pixel coordinates directly
  const handlePixelPlayerMove = (newPosition: [number, number]) => {
    if (onPlayerMove) {
      onPlayerMove(newPosition);
    }
  };

  return (
    <InteractiveMap
      markers={pixelMarkers}
      playerPosition={playerPosition}
      onMapClick={handlePixelMapClick}
      onPlayerMove={handlePixelPlayerMove}
      imageDimensions={imageDimensions}
      onMapImageDataLoaded={onMapImageDataLoaded}
    />
  );
};

export default GameMapAdapter;
