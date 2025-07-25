import { useState, useEffect } from "react";
import {
  initializeCollisionDetection,
  getTerrainAt,
  isMovementValid,
  getMovementSpeed,
  getCollisionDataStatus,
  type TerrainInfo,
} from "../utils/collisionDetection";

export interface UseCollisionDetectionReturn {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  getTerrainInfo: (x: number, y: number) => TerrainInfo;
  checkMovement: (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ) => boolean;
  calculateSpeed: (x: number, y: number, baseSpeed: number) => number;
}

/**
 * React hook for collision detection
 * Manages loading state and provides collision detection functions
 */
export function useCollisionDetection(): UseCollisionDetectionReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeCollision = async () => {
      // Check if already loaded
      const status = getCollisionDataStatus();
      if (status.isLoaded) {
        setIsLoaded(true);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const success = await initializeCollisionDetection();
        if (success) {
          await new Promise((resolve) => setTimeout(resolve, 100)); // Artificial delay
          setIsLoaded(true);
          console.log("✅ Collision detection initialized successfully");
        } else {
          throw new Error("Failed to initialize collision detection");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error(
          "❌ Collision detection initialization failed:",
          errorMessage,
        );
      } finally {
        await new Promise((resolve) => setTimeout(resolve, 100)); // Artificial delay
        setIsLoading(false);
      }
    };

    initializeCollision();
  }, []);

  return {
    isLoaded,
    isLoading,
    error,
    getTerrainInfo: (x: number, y: number) => getTerrainAt(x, y),
    checkMovement: (fromX: number, fromY: number, toX: number, toY: number) =>
      isMovementValid(fromX, fromY, toX, toY),
    calculateSpeed: (x: number, y: number, baseSpeed: number) =>
      getMovementSpeed(x, y, baseSpeed),
  };
}
