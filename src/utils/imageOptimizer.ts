// Image optimization utilities

export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = async (imageSources: string[]): Promise<HTMLImageElement[]> => {
  const promises = imageSources.map(src => preloadImage(src));
  return Promise.all(promises);
};

// Create an optimized background image style
export const createOptimizedBackgroundStyle = (
  imageSrc: string,
  width: number,
  height: number
): React.CSSProperties => ({
  backgroundImage: `url(${imageSrc})`,
  backgroundSize: `${width}px ${height}px`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "0 0",
  width: `${width}px`,
  height: `${height}px`,
  willChange: "transform",
  backfaceVisibility: "hidden",
  imageRendering: "pixelated", // For crisp pixels at different zoom levels
});

// Cache management for images
class ImageCache {
  private cache = new Map<string, HTMLImageElement>();

  async get(src: string): Promise<HTMLImageElement> {
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    const img = await preloadImage(src);
    this.cache.set(src, img);
    return img;
  }

  preload(sources: string[]): Promise<HTMLImageElement[]> {
    return preloadImages(sources);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const imageCache = new ImageCache();

// Constants for map optimization
export const MAP_CONFIG = {
  ORIGINAL_WIDTH: 2000,
  ORIGINAL_HEIGHT: 1600,
  TILE_SIZE: 256,
  MAX_ZOOM: 2.5,
  MIN_ZOOM: 0.5,
} as const;

export default {
  preloadImage,
  preloadImages,
  createOptimizedBackgroundStyle,
  imageCache,
  MAP_CONFIG,
}; 