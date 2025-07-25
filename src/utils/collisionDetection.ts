/**
 * Collision Detection System for PetrRun
 * Reads a collision map to determine movement speeds and blocked areas
 *
 * Color coding:
 * - Red (255,0,0): Unreachable areas (blocked)
 * - Green (0,255,0): Fastest movement (1.5x speed)
 * - Yellow (255,255,0): Slower movement - grass (0.7x speed)
 * - Orange (255,165,0): Slowest movement - stairs (0.3x speed)
 * - White/Other: Normal movement (1.0x speed)
 */

export interface CollisionData {
  isLoaded: boolean;
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
  imageData: ImageData | null;
  width: number;
  height: number;
}

export interface TerrainInfo {
  isBlocked: boolean;
  speedMultiplier: number;
  terrainType: "blocked" | "fast" | "grass" | "stairs" | "normal";
}

// Global collision data instance
let collisionData: CollisionData = {
  isLoaded: false,
  canvas: null,
  context: null,
  imageData: null,
  width: 0,
  height: 0,
};

/**
 * Load the collision map image and prepare it for pixel reading
 */
export async function loadCollisionMap(): Promise<CollisionData> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        // Create a canvas to read pixel data
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Could not get canvas context");
        }

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Draw the collision map to the canvas
        ctx.drawImage(img, 0, 0);

        // Get the image data for pixel reading
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        collisionData = {
          isLoaded: true,
          canvas,
          context: ctx,
          imageData,
          width: canvas.width,
          height: canvas.height,
        };

        console.log(
          `🗺️ Collision map loaded: ${canvas.width}x${canvas.height} pixels`
        );
        resolve(collisionData);
      } catch (error) {
        console.error("Failed to process collision map:", error);
        reject(error);
      }
    };

    img.onerror = () => {
      console.error("Failed to load collision map image");
      reject(new Error("Failed to load collision map image"));
    };

    img.src = "/UCI_collision_map.png";
  });
}

/**
 * Get terrain information at a specific pixel coordinate
 */
export function getTerrainAt(x: number, y: number): TerrainInfo {
  if (!collisionData.isLoaded || !collisionData.imageData) {
    return { isBlocked: false, speedMultiplier: 1.0, terrainType: "normal" };
  }

  // Clamp coordinates to image bounds
  const clampedX = Math.max(
    0,
    Math.min(Math.floor(x), collisionData.width - 1)
  );
  const clampedY = Math.max(
    0,
    Math.min(Math.floor(y), collisionData.height - 1)
  );

  // Calculate pixel index (RGBA format)
  const index = (clampedY * collisionData.width + clampedX) * 4;
  const data = collisionData.imageData.data;

  if (index >= data.length) {
    return { isBlocked: false, speedMultiplier: 1.0, terrainType: "normal" };
  }

  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];

  return analyzePixelColor(r, g, b);
}

/**
 * Analyze a pixel color and return terrain information
 */
function analyzePixelColor(r: number, g: number, b: number): TerrainInfo {
  // Define color thresholds for fuzzy matching
  const threshold = 30;

  // Red (blocked areas)
  if (r > 200 && g < threshold && b < threshold) {
    return { isBlocked: true, speedMultiplier: 0, terrainType: "blocked" };
  }

  // Green (fast areas)
  if (g > 200 && r < threshold && b < threshold) {
    return { isBlocked: false, speedMultiplier: 1.5, terrainType: "fast" };
  }

  // Yellow (grass - slower)
  if (r > 200 && g > 200 && b < threshold) {
    return { isBlocked: false, speedMultiplier: 0.7, terrainType: "grass" };
  }

  // Orange (stairs - slowest)
  if (r > 200 && g > 100 && g < 200 && b < threshold) {
    return { isBlocked: false, speedMultiplier: 0.3, terrainType: "stairs" };
  }

  // Default (normal speed)
  return { isBlocked: false, speedMultiplier: 1.0, terrainType: "normal" };
}

/**
 * Check if a movement from one position to another is valid
 */
export function isMovementValid(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): boolean {
  // Check the destination terrain
  const destinationTerrain = getTerrainAt(toX, toY);

  if (destinationTerrain.isBlocked) {
    return false;
  }

  // For more precision, we could check intermediate points along the path
  // For now, just check the destination
  return true;
}

/**
 * Get the effective movement speed at a position
 */
export function getMovementSpeed(
  x: number,
  y: number,
  baseSpeed: number
): number {
  const terrain = getTerrainAt(x, y);
  return baseSpeed * terrain.speedMultiplier;
}

/**
 * Get collision data status
 */
export function getCollisionDataStatus(): CollisionData {
  return collisionData;
}

/**
 * Initialize collision detection system
 * Should be called once when the game starts
 */
export async function initializeCollisionDetection(): Promise<boolean> {
  try {
    await loadCollisionMap();
    return true;
  } catch (error) {
    console.error("Failed to initialize collision detection:", error);
    return false;
  }
}
