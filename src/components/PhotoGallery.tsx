"use client";

import { useState } from "react";

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

export const PhotoGallery = ({ photos, onPhotoClick, onTransactionClick }: PhotoGalleryProps) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});

  const handleImageError = (photoId: string) => {
    console.error(`Failed to load image for photo ${photoId}`);
    const currentRetries = retryCount[photoId] || 0;
    
    if (currentRetries < 3) {
      // Retry loading the image after a delay
      setTimeout(() => {
        setRetryCount(prev => ({ ...prev, [photoId]: currentRetries + 1 }));
        setImageErrors(prev => ({ ...prev, [photoId]: false }));
      }, 2000 * (currentRetries + 1)); // Exponential backoff
    } else {
      setImageErrors(prev => ({ ...prev, [photoId]: true }));
    }
  };

  const handleImageLoad = (photoId: string) => {
    console.log(`Successfully loaded image for photo ${photoId}`);
    setImageErrors(prev => ({ ...prev, [photoId]: false }));
    setRetryCount(prev => ({ ...prev, [photoId]: 0 }));
  };

  const retryImage = (photoId: string) => {
    setImageErrors(prev => ({ ...prev, [photoId]: false }));
    setRetryCount(prev => ({ ...prev, [photoId]: 0 }));
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
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group cursor-pointer"
            onClick={() => onPhotoClick?.(photo)}
          >
            {/* Debug info */}
            <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded opacity-75">
              {photo.url.includes('gateway.irys.xyz') ? 'Irys' : 'Other'}
            </div>
            
            {/* Image with error handling */}
            {imageErrors[photo.id] ? (
              <div className="w-full h-32 bg-gray-200 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 bg-gray-400 rounded-lg mx-auto mb-1"></div>
                  <p className="text-xs text-gray-500">Failed to load</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      retryImage(photo.id);
                    }}
                    className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <img
                src={photo.url}
                alt="Uploaded photo"
                className="w-full h-32 object-cover rounded-xl"
                onError={() => handleImageError(photo.id)}
                onLoad={() => handleImageLoad(photo.id)}
                crossOrigin="anonymous"
                loading="lazy"
              />
            )}
            
            {/* Loading indicator */}
            {retryCount[photo.id] > 0 && !imageErrors[photo.id] && (
              <div className="absolute inset-0 bg-black bg-opacity-20 rounded-xl flex items-center justify-center">
                <div className="text-white text-xs">Retrying... ({retryCount[photo.id]}/3)</div>
              </div>
            )}
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-xl flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-black rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Transaction ID badge - clickable to open explorer */}
            <div 
              className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-opacity-70 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onTransactionClick?.(photo);
              }}
              title="Click to view transaction on explorer"
            >
              {photo.transactionId.slice(0, 6)}...
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center text-xs text-gray-400">
        {photos.length} photo{photos.length !== 1 ? 's' : ''} stored on Irys
      </div>
    </div>
  );
};
