import React, { useState, useEffect } from 'react';

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

interface ImagePreloaderProps {
  imageSrc: string;
  children: (dimensions: ImageDimensions) => React.ReactNode;
  fallbackComponent?: React.ReactNode;
}

const ImagePreloader: React.FC<ImagePreloaderProps> = ({ 
  imageSrc, 
  children, 
  fallbackComponent 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<ImageDimensions>({
    width: 5000,   // Updated to actual current image dimensions
    height: 3517,  // Updated to actual current image dimensions
    aspectRatio: 5000 / 3517  // Updated aspect ratio
  });

  useEffect(() => {
    const img = new Image();
    let loadingInterval: number;

    // Simulate loading progress since we can't track actual progress easily
    const simulateProgress = () => {
      let progress = 0;
      loadingInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90; // Don't reach 100% until actually loaded
        setLoadingProgress(Math.min(progress, 90));
      }, 200);
    };

    const handleLoad = () => {
      clearInterval(loadingInterval);
      setLoadingProgress(100);
      
      // Capture image dimensions
      const imageDimensions: ImageDimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      };
      setDimensions(imageDimensions);
      
      // Small delay to show 100% before transitioning
      setTimeout(() => {
        setIsLoaded(true);
      }, 300);
    };

    const handleError = () => {
      clearInterval(loadingInterval);
      setError('Failed to load map image. Please refresh and try again.');
      
      // Set fallback dimensions for UCI map (updated to current image size)
      setDimensions({
        width: 5000,
        height: 3517,
        aspectRatio: 5000 / 3517
      });
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    
    // Start simulating progress
    simulateProgress();
    
    // Start loading the image
    img.src = imageSrc;

    return () => {
      clearInterval(loadingInterval);
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return fallbackComponent || (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-2xl max-w-md">
          {/* Loading Animation */}
          <div className="mb-6">
            <img 
              src="/stickers/Trombone_petr.png" 
              alt="Loading" 
              className="w-24 h-24 mx-auto animate-bounce"
            />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Loading PetrRun...
          </h2>
          <p className="text-gray-600 mb-6">
            Petr is preparing the campus map for your adventure!
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-500">
            {Math.round(loadingProgress)}% loaded
          </p>
        </div>
      </div>
    );
  }

  return <>{children(dimensions)}</>;
};

export default ImagePreloader; 