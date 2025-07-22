import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers not showing in React Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Player marker with custom styling
const createPlayerIcon = () => {
  return L.divIcon({
    className: "player-marker",
    html: `
      <div class="player-icon">
        <div class="player-circle"></div>
        <div class="player-arrow"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Custom game markers
const createGameIcon = (type: string, color: string = "#3388ff") => {
  return L.divIcon({
    className: `game-marker game-marker-${type}`,
    html: `
      <div style="
        background-color: ${color}; 
        width: 16px; 
        height: 16px; 
        border-radius: 50%; 
        border: 2px solid white; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        position: relative;
        z-index: 1000;
      "></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

interface GameMarker {
  position: [number, number];
  popup?: string;
  type?:
    | "player"
    | "checkpoint"
    | "obstacle"
    | "treasure"
    | "enemy"
    | "default";
  color?: string;
}

interface GamePath {
  positions: [number, number][];
  color?: string;
  weight?: number;
}

interface GameArea {
  center: [number, number];
  radius: number;
  color?: string;
  fillColor?: string;
  popup?: string;
}

interface GameMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  width?: string;
  markers?: GameMarker[];
  paths?: GamePath[];
  areas?: GameArea[];
  playerPosition?: [number, number];
  darkMode?: boolean;
  enable2_5D?: boolean;
  gameStyle?: boolean;
  onMapClick?: (latlng: L.LatLng) => void;
  onMarkerClick?: (marker: GameMarker, index: number) => void;
  onPlayerMove?: (newPosition: [number, number]) => void;
  bounds?: [[number, number], [number, number]]; // Game world boundaries
}

// WASD Controls Component
function WASDControls({
  onPlayerMove,
  playerPosition,
}: {
  onPlayerMove?: (newPosition: [number, number]) => void;
  playerPosition?: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (!onPlayerMove || !playerPosition) return;

    const moveDistance = 0.0001; // Adjust movement sensitivity

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playerPosition) return;

      let newLat = playerPosition[0];
      let newLng = playerPosition[1];

      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          newLat += moveDistance;
          break;
        case "s":
        case "arrowdown":
          newLat -= moveDistance;
          break;
        case "a":
        case "arrowleft":
          newLng -= moveDistance;
          break;
        case "d":
        case "arrowright":
          newLng += moveDistance;
          break;
        default:
          return;
      }

      const newPosition: [number, number] = [newLat, newLng];
      onPlayerMove(newPosition);

      // Smoothly pan map to follow player
      map.panTo(newPosition, {
        animate: true,
        duration: 0.25,
        easeLinearity: 0.1,
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [map, onPlayerMove, playerPosition]);

  return null;
}

// Map click handler
function MapClickHandler({
  onMapClick,
}: {
  onMapClick?: (latlng: L.LatLng) => void;
}) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

// Map bounds enforcer
function BoundsEnforcer({
  bounds,
}: {
  bounds?: [[number, number], [number, number]];
}) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      const leafletBounds = L.latLngBounds(bounds);
      map.setMaxBounds(leafletBounds);
      map.on("drag", () => {
        map.panInsideBounds(leafletBounds, { animate: false });
      });
    }
  }, [map, bounds]);

  return null;
}

const GameMap: React.FC<GameMapProps> = ({
  center = [40.7128, -74.006], // Default to NYC
  zoom = 18, // High zoom for game-like experience
  height = "100vh",
  width = "100%",
  markers = [],
  paths = [],
  areas = [],
  playerPosition,
  darkMode = false,
  enable2_5D = true,
  gameStyle = true,
  onMapClick,
  onMarkerClick,
  onPlayerMove,
  bounds,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const [currentPlayerPos, setCurrentPlayerPos] = useState<
    [number, number] | undefined
  >(playerPosition || center);

  const getMarkerIcon = useCallback((marker: GameMarker) => {
    const colors = {
      player: "#00ff00",
      checkpoint: "#ffff00",
      obstacle: "#ff0000",
      treasure: "#ffa500",
      enemy: "#ff1493",
      default: "#3388ff",
    };

    const color = marker.color || colors[marker.type || "default"];
    return createGameIcon(marker.type || "default", color);
  }, []);

  const handlePlayerMove = useCallback(
    (newPosition: [number, number]) => {
      setCurrentPlayerPos(newPosition);
      if (onPlayerMove) {
        onPlayerMove(newPosition);
      }
    },
    [onPlayerMove]
  );

  // Dark mode tile layer
  const getTileLayer = () => {
    if (darkMode) {
      return (
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />
      );
    }
    return (
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    );
  };

  const mapClassName = `game-map ${darkMode ? "dark-mode" : ""} ${
    enable2_5D ? "mode-2-5d" : ""
  } ${gameStyle ? "game-style" : ""}`;

  return (
    <>
      <style>{`
        .game-map {
          position: relative;
          overflow: hidden;
        }

        .game-map.mode-2-5d .leaflet-map-pane {
          transform: perspective(1000px) rotateX(15deg);
          transform-origin: center bottom;
        }

        .game-map.mode-2-5d .leaflet-tile-pane {
          transform: translateZ(0);
        }

        .game-map.dark-mode {
          filter: contrast(1.1) brightness(0.9);
        }

        .game-map.game-style {
          border-radius: 8px;
          border: 2px solid ${darkMode ? "#444" : "#ddd"};
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .player-marker {
          z-index: 1000 !important;
        }

        .player-icon {
          position: relative;
          width: 24px;
          height: 24px;
        }

        .player-circle {
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, #00ff00 30%, #008800 100%);
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 3px 10px rgba(0,255,0,0.5);
          animation: playerPulse 2s infinite;
        }

        .player-arrow {
          position: absolute;
          top: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-bottom: 8px solid #00ff00;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
        }

        @keyframes playerPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        .game-marker {
          z-index: 999 !important;
          transition: transform 0.2s ease;
        }

        .game-marker:hover {
          transform: scale(1.2);
        }

        .game-marker-treasure {
          animation: treasureGlow 2s infinite alternate;
        }

        .game-marker-enemy {
          animation: enemyPulse 1s infinite;
        }

        @keyframes treasureGlow {
          0% { filter: drop-shadow(0 0 3px #ffa500); }
          100% { filter: drop-shadow(0 0 8px #ffa500); }
        }

        @keyframes enemyPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        .leaflet-popup-content-wrapper {
          background: ${darkMode ? "#2a2a2a" : "white"};
          color: ${darkMode ? "#fff" : "#333"};
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .leaflet-popup-tip {
          background: ${darkMode ? "#2a2a2a" : "white"};
        }

        .leaflet-control-zoom a {
          background-color: ${darkMode ? "#2a2a2a" : "white"};
          color: ${darkMode ? "#fff" : "#333"};
          border: 1px solid ${darkMode ? "#444" : "#ccc"};
        }

        .leaflet-control-zoom a:hover {
          background-color: ${darkMode ? "#3a3a3a" : "#f4f4f4"};
        }

        .wasd-instructions {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: ${
            darkMode ? "rgba(42, 42, 42, 0.9)" : "rgba(255, 255, 255, 0.9)"
          };
          color: ${darkMode ? "#fff" : "#333"};
          padding: 10px 15px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 12px;
          z-index: 1000;
          border: 1px solid ${darkMode ? "#444" : "#ddd"};
          backdrop-filter: blur(5px);
        }

        .game-ui {
          position: absolute;
          top: 20px;
          right: 20px;
          background: ${
            darkMode ? "rgba(42, 42, 42, 0.9)" : "rgba(255, 255, 255, 0.9)"
          };
          color: ${darkMode ? "#fff" : "#333"};
          padding: 15px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 12px;
          z-index: 1000;
          border: 1px solid ${darkMode ? "#444" : "#ddd"};
          backdrop-filter: blur(5px);
          min-width: 200px;
        }
      `}</style>

      <div
        style={{ height, width, position: "relative" }}
        className={mapClassName}
      >
        <MapContainer
          center={currentPlayerPos || center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
          zoomControl={true}
          doubleClickZoom={false}
          ref={(mapInstance) => {
            if (mapInstance) {
              mapRef.current = mapInstance;
            }
          }}
        >
          {getTileLayer()}

          {/* Bounds enforcement */}
          {bounds && <BoundsEnforcer bounds={bounds} />}

          {/* Game areas (circles) */}
          {areas.map((area, index) => (
            <Circle
              key={`area-${index}`}
              center={area.center}
              radius={area.radius}
              color={area.color || (darkMode ? "#66b3ff" : "#3388ff")}
              fillColor={area.fillColor || (darkMode ? "#66b3ff" : "#3388ff")}
              fillOpacity={0.2}
              weight={2}
            >
              {area.popup && <Popup>{area.popup}</Popup>}
            </Circle>
          ))}

          {/* Game paths (polylines) */}
          {paths.map((path, index) => (
            <Polyline
              key={`path-${index}`}
              positions={path.positions}
              color={path.color || (darkMode ? "#ff6666" : "#ff0000")}
              weight={path.weight || 3}
              opacity={0.8}
            />
          ))}

          {/* Regular markers */}
          {markers.map((marker, index) => (
            <Marker
              key={`marker-${index}`}
              position={marker.position}
              icon={getMarkerIcon(marker)}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(marker, index);
                  }
                },
              }}
            >
              {marker.popup && <Popup>{marker.popup}</Popup>}
            </Marker>
          ))}

          {/* Player marker */}
          {currentPlayerPos && (
            <Marker
              position={currentPlayerPos}
              icon={createPlayerIcon()}
              zIndexOffset={1000}
            >
              <Popup>
                <div>
                  <strong>Player</strong>
                  <br />
                  Position: {currentPlayerPos[0].toFixed(6)},{" "}
                  {currentPlayerPos[1].toFixed(6)}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Event handlers */}
          <MapClickHandler onMapClick={onMapClick} />
          <WASDControls
            onPlayerMove={handlePlayerMove}
            playerPosition={currentPlayerPos}
          />
        </MapContainer>

        {/* Game UI */}
        <div className="game-ui">
          <div>
            <strong>Game Stats</strong>
          </div>
          <div>
            Player:{" "}
            {currentPlayerPos
              ? `${currentPlayerPos[0].toFixed(
                  4
                )}, ${currentPlayerPos[1].toFixed(4)}`
              : "N/A"}
          </div>
          <div>Zoom: {zoom}</div>
          <div>Mode: {darkMode ? "Dark" : "Light"}</div>
          <div>2.5D: {enable2_5D ? "On" : "Off"}</div>
        </div>

        {/* WASD Instructions */}
        <div className="wasd-instructions">
          <div>
            <strong>Controls:</strong>
          </div>
          <div>WASD or Arrow Keys to move</div>
          <div>Mouse wheel to zoom</div>
          <div>Click map to inspect</div>
        </div>
      </div>
    </>
  );
};

export default GameMap;
