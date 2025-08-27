"use client";

import { useState, useEffect } from "react";

interface Photo {
  id: string;
  url: string;
  transactionId: string;
  explorerUrl: string;
  timestamp: number;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
  onTransactionClick?: (photo: Photo) => void;
}

type ImageState = 'loading' | 'processing' | 'loaded' | 'error' | 'retrying';

interface ImageStatus {
  state: ImageState;
  retryCount: number;
  lastRetryTime?: number;
  errorMessage?: string;
}

export const PhotoGallery = ({ photos, onPhotoClick, onTransactionClick }: PhotoGalleryProps) => {
  const [imageStatuses, setImageStatuses] = useState<Record<string, ImageStatus>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  // Initialize image statuses for new photos
  useEffect(() => {
    photos.forEach((photo) => {
      if (!imageStatuses[photo.id]) {
        setImageStatuses(prev => ({
          ...prev,
          [photo.id]: { state: 'processing', retryCount: 0 }
        }));
        
        // Add delay for newly uploaded images to allow Irys gateway to process
        const timer = setTimeout(() => {
          setImageUrls(prev => ({ ...prev, [photo.id]: photo.url }));
          setImageStatuses(prev => ({
            ...prev,
            [photo.id]: { ...prev[photo.id], state: 'loading' }
          }));
        }, 3000); // Increased delay for better reliability
        
        return () => clearTimeout(timer);
      }
    });
  }, [photos, imageStatuses]);

  const handleImageError = (photoId: string, error?: string) => {
    console.error(`Failed to load image for photo ${photoId}:`, error);
    const currentStatus = imageStatuses[photoId];
    const currentRetries = currentStatus?.retryCount || 0;
    
    if (currentRetries < 3) {
      // Retry loading the image with exponential backoff
      const retryDelay = Math.min(2000 * Math.pow(2, currentRetries), 10000); // Max 10 seconds
      
      setImageStatuses(prev => ({
        ...prev,
        [photoId]: {
          state: 'retrying',
          retryCount: currentRetries + 1,
          lastRetryTime: Date.now(),
          errorMessage: error
        }
      }));

      setTimeout(() => {
        setImageStatuses(prev => ({
          ...prev,
          [photoId]: { ...prev[photoId], state: 'loading' }
        }));
      }, retryDelay);
    } else {
      setImageStatuses(prev => ({
        ...prev,
        [photoId]: {
          state: 'error',
          retryCount: currentRetries,
          errorMessage: error || 'Failed to load image after multiple attempts'
        }
      }));
    }
  };

  const handleImageLoad = (photoId: string) => {
    console.log(`Successfully loaded image for photo ${photoId}`);
    setImageStatuses(prev => ({
      ...prev,
      [photoId]: { state: 'loaded', retryCount: 0 }
    }));
  };

  const retryImage = (photoId: string) => {
    setImageStatuses(prev => ({
      ...prev,
      [photoId]: { state: 'loading', retryCount: 0 }
    }));
  };

  const getImageStateContent = (photo: Photo) => {
    const status = imageStatuses[photo.id];
    const state = status?.state || 'processing';

    switch (state) {
      case 'processing':
        return (
          <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-gray-600 font-medium">Processing on Irys</p>
              <p className="text-xs text-gray-400 mt-1">Please wait...</p>
            </div>
          </div>
        );

      case 'loading':
        return (
          <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-blue-600 font-medium">Loading Image</p>
              <p className="text-xs text-blue-400 mt-1">This may take a moment</p>
            </div>
          </div>
        );

      case 'retrying':
        const retryCount = status?.retryCount || 0;
        return (
          <div className="w-full h-32 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-yellow-600 font-medium">Retrying... ({retryCount}/3)</p>
              <p className="text-xs text-yellow-400 mt-1">Large image, please wait</p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="w-full h-32 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 bg-red-400 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-sm">⚠️</span>
              </div>
              <p className="text-xs text-red-600 font-medium">Failed to Load</p>
              <p className="text-xs text-red-400 mt-1 break-all px-2">
                {photo.url.includes('gateway.irys.xyz') ? 'Irys gateway timeout' : 'Image unavailable'}
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  retryImage(photo.id);
                }}
                className="text-xs text-red-500 hover:text-red-700 mt-2 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-400 rounded-lg"></div>
        </div>
        <p className="text-gray-500 text-sm">No photos uploaded yet</p>
        <p className="text-gray-400 text-xs mt-1">Upload your first photo to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center">Your Photos</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo) => {
          const status = imageStatuses[photo.id];
          const state = status?.state || 'processing';
          const isLoaded = state === 'loaded';

          return (
            <div
              key={photo.id}
              className="relative group cursor-pointer"
              onClick={() => onPhotoClick?.(photo)}
            >
              {/* Status indicator */}
              <div className="absolute top-1 right-1 z-10">
                {state === 'processing' && (
                  <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                    Processing
                  </div>
                )}
                {state === 'loading' && (
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Loading
                  </div>
                )}
                {state === 'retrying' && (
                  <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Retry {status?.retryCount}/3
                  </div>
                )}
                {state === 'error' && (
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Error
                  </div>
                )}
                {state === 'loaded' && (
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    ✓ Loaded
                  </div>
                )}
              </div>
              
              {/* Image or loading state */}
              {isLoaded ? (
                <img
                  src={imageUrls[photo.id]}
                  alt="Uploaded photo"
                  className="w-full h-32 object-cover rounded-xl"
                  onError={() => {
                    console.error(`Image failed to load for ${photo.id}:`, imageUrls[photo.id]);
                    handleImageError(photo.id, 'Network error or image corrupted');
                  }}
                  onLoad={() => handleImageLoad(photo.id)}
                  crossOrigin="anonymous"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                getImageStateContent(photo)
              )}
              
              {/* Overlay on hover - only for loaded images */}
              {isLoaded && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-xl flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-black rounded"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Transaction ID badge - clickable to open explorer */}
              <div 
                className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-opacity-70 transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onTransactionClick?.(photo);
                }}
                title="Click to view transaction on explorer"
              >
                {photo.transactionId.slice(0, 6)}...
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-center text-xs text-gray-400">
        {photos.length} photo{photos.length !== 1 ? 's' : ''} stored on Irys
      </div>
      
      {/* Help text for large images */}
      <div className="text-center text-xs text-gray-400 bg-gray-50 p-3 rounded-xl">
        <p className="font-medium mb-1">💡 Tip for Large Images</p>
        <p>Large photos may take longer to load from Irys gateway. If an image fails to load, it will automatically retry up to 3 times.</p>
      </div>
    </div>
  );
};
