import React from "react";
import InteractiveMap from "./InteractiveMap";
import type { GameMarker } from "../../utils/types";

interface GameMapProps {
  center: [number, number];
  zoom: number;
  height: string;
  width: string;
  markers: GameMarker[];
  paths?: Array<{
    positions: [number, number][];
    color: string;
    weight: number;
  }>;
  areas?: Array<{
    center: [number, number];
    radius: number;
    color: string;
    fillColor: string;
    popup: string;
  }>;
  playerPosition: [number, number];
  darkMode?: boolean;
  enable2_5D?: boolean;
  gameStyle?: boolean;
  bounds?: [[number, number], [number, number]];
  onMapClick?: (position: { lat: number; lng: number }) => void;
  onMarkerClick?: (marker: GameMarker) => void;
  onPlayerMove?: (newPosition: [number, number]) => void;
}

// Helper function to convert geographic coordinates to pixel coordinates
function geoToPixel(lat: number, lng: number): [number, number] {
  // Simple conversion for demo purposes - in a real app you'd use proper map projection
  // These bounds roughly correspond to a small area, converting to 1000x800 pixel space
  const minLat = 40.705;
  const maxLat = 40.72;
  const minLng = -74.015;
  const maxLng = -73.995;

  const x = ((lng - minLng) / (maxLng - minLng)) * 1000;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 800; // Flip Y for screen coordinates

  return [Math.max(0, Math.min(1000, x)), Math.max(0, Math.min(800, y))];
}

// Helper function to convert pixel coordinates to geographic coordinates
function pixelToGeo(x: number, y: number): { lat: number; lng: number } {
  const minLat = 40.705;
  const maxLat = 40.72;
  const minLng = -74.015;
  const maxLng = -73.995;

  const lng = minLng + (x / 1000) * (maxLng - minLng);
  const lat = maxLat - (y / 800) * (maxLat - minLat); // Flip Y back

  return { lat, lng };
}

const GameMapAdapter: React.FC<GameMapProps> = ({
  markers,
  playerPosition,
  onMapClick,
  onPlayerMove,
}) => {
  // Convert geographic coordinates to pixel coordinates for InteractiveMap
  const pixelMarkers = markers.map((marker) => ({
    position: geoToPixel(marker.position[0], marker.position[1]),
    popup: marker.popup,
    color: marker.color,
  }));

  const pixelPlayerPosition = geoToPixel(playerPosition[0], playerPosition[1]);

  const handlePixelMapClick = (position: { x: number; y: number }) => {
    if (onMapClick) {
      const geoPos = pixelToGeo(position.x, position.y);
      onMapClick(geoPos);
    }
  };

  const handlePixelPlayerMove = (newPosition: [number, number]) => {
    if (onPlayerMove) {
      const geoPos = pixelToGeo(newPosition[0], newPosition[1]);
      onPlayerMove([geoPos.lat, geoPos.lng]);
    }
  };

  return (
    <InteractiveMap
      markers={pixelMarkers}
      playerPosition={pixelPlayerPosition}
      onMapClick={handlePixelMapClick}
      onPlayerMove={handlePixelPlayerMove}
      imageDimensions={{ width: 1000, height: 800 }}
    />
  );
};

export default GameMapAdapter;
