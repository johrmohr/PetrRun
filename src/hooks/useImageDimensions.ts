import { useState, useEffect } from "react";

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  isLoaded: boolean;
}

export const useImageDimensions = (imageSrc: string): ImageDimensions => {
  const [dimensions, setDimensions] = useState<ImageDimensions>({
    width: 0,
    height: 0,
    aspectRatio: 1,
    isLoaded: false,
  });

  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();

    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;

      setDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio,
        isLoaded: true,
      });
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${imageSrc}`);
      // Set fallback dimensions (updated to current image size)
      setDimensions({
        width: 5000,
        height: 3517,
        aspectRatio: 5000 / 3517,
        isLoaded: true,
      });
    };

    img.src = imageSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc]);

  return dimensions;
};
