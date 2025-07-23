import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
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

interface MapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  width?: string;
  markers?: Array<{
    position: [number, number];
    popup?: string;
  }>;
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

const Map: React.FC<MapProps> = ({
  center = [51.505, -0.09], // Default to London
  zoom = 13,
  height = "400px",
  width = "100%",
  markers = [],
}) => {
  const handleMapClick = (latlng: L.LatLng) => {
    console.log("Map clicked at:", latlng);
  };

  return (
    <div style={{ height, width }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Default marker if no markers provided */}
        {markers.length === 0 && (
          <Marker position={center}>
            <Popup>A sample marker at the center of the map.</Popup>
          </Marker>
        )}

        {/* Custom markers */}
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position}>
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}

        <MapClickHandler onMapClick={handleMapClick} />
      </MapContainer>
    </div>
  );
};

export default Map;
