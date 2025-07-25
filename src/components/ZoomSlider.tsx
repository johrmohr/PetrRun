import React from "react";

interface ZoomSliderProps {
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  className?: string;
}

const ZoomSlider: React.FC<ZoomSliderProps> = ({
  zoomLevel,
  onZoomChange,
  minZoom = 0.5,
  maxZoom = 4,
  step = 0.1,
  className = "",
}) => {
  const percentage = ((zoomLevel - minZoom) / (maxZoom - minZoom)) * 100;

  // Get zoom level description
  const getZoomDescription = (zoom: number) => {
    if (zoom <= 1) return "Far";
    if (zoom <= 2) return "Normal";
    if (zoom <= 3) return "Close";
    return "Very Close";
  };

  return (
    <div
      className={`bg-white bg-opacity-90 backdrop-blur rounded-lg p-4 shadow-lg ${className}`}
    >
      <div className="flex flex-col items-center space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <span>🔍</span>
          Zoom
        </label>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onZoomChange(Math.max(minZoom, zoomLevel - step))}
            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 transition-colors"
            title="Zoom out"
          >
            −
          </button>
          <div className="relative">
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step={step}
              value={zoomLevel}
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
              }}
            />
            {/* Custom slider thumb styling */}
          </div>
          <button
            onClick={() => onZoomChange(Math.min(maxZoom, zoomLevel + step))}
            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 transition-colors"
            title="Zoom in"
          >
            +
          </button>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">
              {zoomLevel.toFixed(1)}x
            </span>
            <span className="text-xs text-gray-500">
              ({getZoomDescription(zoomLevel)})
            </span>
          </div>
          <button
            onClick={() => onZoomChange(2.5)}
            className="text-xs text-blue-600 hover:text-blue-800 underline transition-colors"
            title="Reset to default zoom (2.5x)"
          >
            reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZoomSlider;
