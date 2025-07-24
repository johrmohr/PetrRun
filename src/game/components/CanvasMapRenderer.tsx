import React, { useRef, useEffect, useCallback } from "react";

interface MapMarker {
  position: [number, number];
  popup?: string;
  color?: string;
  sticker?: string;
}

interface CanvasMapRendererProps {
  width: number;
  height: number;
  imageDimensions: { width: number; height: number };
  transform: { transform: string; transformOrigin: string };
  markers: MapMarker[];
  playerPosition?: [number, number];
  backgroundImageUrl: string;
}

const CanvasMapRenderer: React.FC<CanvasMapRendererProps> = ({
  width,
  height,
  imageDimensions,
  transform,
  markers,
  playerPosition,
  backgroundImageUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const playerImageRef = useRef<HTMLImageElement | null>(null);
  const stickerImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Helper function to get sticker URL for marker
    const getStickerUrlForMarker = (marker: MapMarker): string => {
      if (marker.sticker) return marker.sticker;
      if (marker.color === "#00ff00") return "/stickers/Github-petr-light.png";
      if (marker.color === "#ffd700") return "/stickers/Space-Explorr-Petr.png";
      if (marker.color === "#ff4444") return "/stickers/Thanos.png";
      if (marker.color === "#ffaa00") return "/stickers/Github-petr-dark.png";
      return "/stickers/Github-petr-dark.png";
    };

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Save context state
    ctx.save();

    // Apply transform (zoom and translation)
    // Parse transform string to get translate and scale values
    const transformMatch = transform.transform.match(
      /translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)\s*scale\((-?\d+(?:\.\d+)?)\)/
    );

    if (transformMatch) {
      const translateX = parseFloat(transformMatch[1]);
      const translateY = parseFloat(transformMatch[2]);
      const scale = parseFloat(transformMatch[3]);

      ctx.translate(translateX, translateY);
      ctx.scale(scale, scale);
    }

    // Draw background image
    if (backgroundImageRef.current) {
      ctx.drawImage(
        backgroundImageRef.current,
        0,
        0,
        imageDimensions.width,
        imageDimensions.height
      );
    }

    // Draw markers
    markers.forEach((marker) => {
      const stickerUrl = getStickerUrlForMarker(marker);
      const stickerImg = stickerImagesRef.current.get(stickerUrl);
      
      if (stickerImg) {
        const size = 40; // Size in pixels
        ctx.drawImage(
          stickerImg,
          marker.position[0] - size / 2,
          marker.position[1] - size / 2,
          size,
          size
        );
      }
    });

    // Draw player
    if (playerPosition && playerImageRef.current) {
      const size = 64; // Size in pixels
      ctx.drawImage(
        playerImageRef.current,
        playerPosition[0] - size / 2,
        playerPosition[1] - size / 2,
        size,
        size
      );
    }

    // Restore context state
    ctx.restore();
  }, [width, height, imageDimensions, transform, markers, playerPosition]);

  // Load images
  useEffect(() => {
    // Load background image
    const bgImg = new Image();
    bgImg.onload = () => {
      backgroundImageRef.current = bgImg;
      render();
    };
    bgImg.src = backgroundImageUrl;

    // Load player image
    const playerImg = new Image();
    playerImg.onload = () => {
      playerImageRef.current = playerImg;
      render();
    };
    playerImg.src = "/stickers/Trombone_petr.png";

    // Load sticker images
    const stickerUrls = [
      "/stickers/Github-petr-dark.png",
      "/stickers/Github-petr-light.png",
      "/stickers/Space-Explorr-Petr.png",
      "/stickers/Thanos.png",
    ];

    stickerUrls.forEach((url) => {
      const img = new Image();
      img.onload = () => {
        stickerImagesRef.current.set(url, img);
        render();
      };
      img.src = url;
    });
  }, [backgroundImageUrl, render]);

  // Re-render when dependencies change
  useEffect(() => {
    render();
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 cursor-crosshair"
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
};

export default CanvasMapRenderer;
