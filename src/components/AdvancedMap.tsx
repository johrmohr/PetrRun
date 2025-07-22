import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMapEvents,
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

// Create custom icons for different marker types
const createCustomIcon = (color: string = "blue") => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

interface GameMarker {
  position: [number, number];
  popup?: string;
  type?: "player" | "checkpoint" | "obstacle" | "treasure" | "default";
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

interface AdvancedMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  width?: string;
  markers?: GameMarker[];
  paths?: GamePath[];
  areas?: GameArea[];
  onMapClick?: (latlng: L.LatLng) => void;
  onMarkerClick?: (marker: GameMarker, index: number) => void;
}

// Component to handle map click events
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

const AdvancedMap: React.FC<AdvancedMapProps> = ({
  center = [51.505, -0.09],
  zoom = 13,
  height = "400px",
  width = "100%",
  markers = [],
  paths = [],
  areas = [],
  onMapClick,
  onMarkerClick,
}) => {
  const getMarkerIcon = (marker: GameMarker) => {
    const colors = {
      player: "#00ff00",
      checkpoint: "#ffff00",
      obstacle: "#ff0000",
      treasure: "#ffa500",
      default: "#0066ff",
    };

    const color = marker.color || colors[marker.type || "default"];
    return createCustomIcon(color);
  };

  return (
    <div style={{ height, width }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render game areas (circles) */}
        {areas.map((area, index) => (
          <Circle
            key={`area-${index}`}
            center={area.center}
            radius={area.radius}
            color={area.color || "#3388ff"}
            fillColor={area.fillColor || "#3388ff"}
            fillOpacity={0.2}
          >
            {area.popup && <Popup>{area.popup}</Popup>}
          </Circle>
        ))}

        {/* Render paths (polylines) */}
        {paths.map((path, index) => (
          <Polyline
            key={`path-${index}`}
            positions={path.positions}
            color={path.color || "#ff0000"}
            weight={path.weight || 3}
          />
        ))}

        {/* Render markers */}
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

        <MapClickHandler onMapClick={onMapClick} />
      </MapContainer>
    </div>
  );
};

export default AdvancedMap;
