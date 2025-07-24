import { useState, useEffect } from 'react';
import { loadMapImageData } from '../utils/mapUtils';

// Hook to load and manage map image data for transparency checking
export const useMapImageData = (imageSrc: string) => {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await loadMapImageData(imageSrc);
        
        if (isMounted) {
          setImageData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load map data');
          console.warn('Could not load map image data for transparency checking:', err);
          // Continue without image data - spawning will work but without transparency checks
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [imageSrc]);

  return { imageData, isLoading, error };
};
