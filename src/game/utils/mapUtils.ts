// Map utility functions for game mechanics

interface ImageDimensions {
  width: number;
  height: number;
}

const BOUNDARY_PADDING = 32; // Keep player sprite fully visible
const SPAWN_RADIUS = 200; // Radius for spawning items near player

// Sticker options for markers
export const MARKER_STICKERS = [
  "/stickers/Github-petr-dark.png",
  "/stickers/Github-petr-light.png", 
  "/stickers/Space-Explorr-Petr.png",
  "/stickers/Thanos.png",
] as const;

// Spawn an item within a certain radius of the player
export const spawnItemNearPlayer = (
  playerPosition: [number, number],
  imageDimensions: ImageDimensions,
  radius: number = SPAWN_RADIUS,
  mapImageData?: ImageData
): [number, number] => {
  let attempts = 0;
  const maxAttempts = 50; // Prevent infinite loops
  
  while (attempts < maxAttempts) {
    // Generate random angle
    const angle = Math.random() * 2 * Math.PI;
    
    // Generate random distance within radius (more evenly distributed)
    const distance = Math.sqrt(Math.random()) * radius;
    
    // Calculate position
    let x = playerPosition[0] + Math.cos(angle) * distance;
    let y = playerPosition[1] + Math.sin(angle) * distance;
    
    // Ensure within bounds with padding
    x = Math.max(BOUNDARY_PADDING, Math.min(imageDimensions.width - BOUNDARY_PADDING, x));
    y = Math.max(BOUNDARY_PADDING, Math.min(imageDimensions.height - BOUNDARY_PADDING, y));
    
    // Check if position is on solid ground (not transparent)
    if (!mapImageData || isPositionOnSolidGround([x, y], mapImageData, imageDimensions)) {
      return [x, y];
    }
    
    attempts++;
  }
  
  // Fallback: return position close to player if all attempts failed
  const fallbackX = Math.max(BOUNDARY_PADDING, Math.min(imageDimensions.width - BOUNDARY_PADDING, playerPosition[0] + 50));
  const fallbackY = Math.max(BOUNDARY_PADDING, Math.min(imageDimensions.height - BOUNDARY_PADDING, playerPosition[1] + 50));
  return [fallbackX, fallbackY];
};

// Check if a position is within map bounds
export const isPositionInBounds = (
  position: [number, number],
  imageDimensions: ImageDimensions,
  padding: number = BOUNDARY_PADDING
): boolean => {
  const [x, y] = position;
  return (
    x >= padding &&
    x <= imageDimensions.width - padding &&
    y >= padding &&
    y <= imageDimensions.height - padding
  );
};

// Clamp a position to within map bounds
export const clampPositionToBounds = (
  position: [number, number],
  imageDimensions: ImageDimensions,
  padding: number = BOUNDARY_PADDING
): [number, number] => {
  const [x, y] = position;
  return [
    Math.max(padding, Math.min(imageDimensions.width - padding, x)),
    Math.max(padding, Math.min(imageDimensions.height - padding, y))
  ];
};

// Get appropriate sticker for a marker based on its properties
export const getStickerForMarker = (marker: { color?: string }, index: number): string => {
  if (marker.color === "#00ff00") return "/stickers/Github-petr-light.png"; // Checkpoints
  if (marker.color === "#ffd700") return "/stickers/Space-Explorr-Petr.png"; // Treasures
  if (marker.color === "#ff4444") return "/stickers/Thanos.png"; // Enemies
  if (marker.color === "#ffaa00") return "/stickers/Github-petr-dark.png"; // Obstacles
  // Default rotation through available stickers
  return MARKER_STICKERS[index % MARKER_STICKERS.length];
};

// Check if a position is on solid ground (not transparent)
export const isPositionOnSolidGround = (
  position: [number, number],
  imageData: ImageData,
  imageDimensions: ImageDimensions
): boolean => {
  const [x, y] = position;
  
  // Ensure coordinates are within image bounds
  if (x < 0 || x >= imageDimensions.width || y < 0 || y >= imageDimensions.height) {
    return false;
  }
  
  // Calculate pixel index in ImageData array
  const pixelIndex = (Math.floor(y) * imageDimensions.width + Math.floor(x)) * 4;
  
  // Check alpha channel (index + 3)
  const alpha = imageData.data[pixelIndex + 3];
  
  // Consider solid if alpha > 50 (not completely transparent)
  return alpha > 50;
};

// Load map image and extract ImageData for transparency checking
export const loadMapImageData = (imageSrc: string): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Handle CORS if needed
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        resolve(imageData);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageSrc;
  });
};

// Utility to spawn multiple items around the player
export const spawnMultipleItemsNearPlayer = (
  playerPosition: [number, number],
  imageDimensions: ImageDimensions,
  count: number,
  radius: number = SPAWN_RADIUS,
  mapImageData?: ImageData
): [number, number][] => {
  const positions: [number, number][] = [];
  
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let position: [number, number];
    
    // Try to find a position that doesn't overlap with existing positions
    do {
      position = spawnItemNearPlayer(playerPosition, imageDimensions, radius, mapImageData);
      attempts++;
    } while (
      attempts < 20 && // Max attempts to avoid infinite loop
      positions.some(existingPos => {
        const distance = Math.sqrt(
          Math.pow(position[0] - existingPos[0], 2) + 
          Math.pow(position[1] - existingPos[1], 2)
        );
        return distance < 60; // Minimum distance between items
      })
    );
    
    positions.push(position);
  }
  
  return positions;
};

// Calculate distance between two points
export const getDistance = (pos1: [number, number], pos2: [number, number]): number => {
  return Math.sqrt(
    Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2)
  );
};

// Check if player is near a marker (within interaction distance)
export const isPlayerNearMarker = (
  playerPosition: [number, number],
  markerPosition: [number, number],
  interactionDistance: number = 50
): boolean => {
  return getDistance(playerPosition, markerPosition) <= interactionDistance;
};
