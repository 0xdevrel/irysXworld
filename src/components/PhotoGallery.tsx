"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MiniKit, ResponseEvent } from '@worldcoin/minikit-js';

interface Photo {
  id: string;
  url: string;
  transactionId: string;
  explorerUrl: string;
  timestamp: number;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onTransactionClick?: (photo: Photo) => void;
}

type ImageState = 'error';

interface ImageStatus {
  state: ImageState;
  retryCount: number;
  errorMessage?: string;
}

interface LightboxState {
  isOpen: boolean;
  photo: Photo | null;
}

export const PhotoGallery = ({ photos, onTransactionClick }: PhotoGalleryProps) => {
  const [imageErrors, setImageErrors] = useState<Record<string, ImageStatus>>({});
  const [lightbox, setLightbox] = useState<LightboxState>({ isOpen: false, photo: null });
  const [isSharing, setIsSharing] = useState(false);
  const [isLightboxImageLoading, setIsLightboxImageLoading] = useState(false);


  // Handle escape key to close lightbox
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && lightbox.isOpen) {
        closeLightbox();
      }
    };

    if (lightbox.isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [lightbox.isOpen]);

  // Subscribe to share events to handle cancellation properly
  useEffect(() => {
    const handleShareResponse = (_payload: unknown) => {
      setIsSharing(false);
    };

    if (MiniKit && MiniKit.subscribe) {
      MiniKit.subscribe(ResponseEvent.MiniAppShare, handleShareResponse);
      
      return () => {
        if (MiniKit && MiniKit.unsubscribe) {
          MiniKit.unsubscribe(ResponseEvent.MiniAppShare);
        }
      };
    }
  }, []);

  const handleImageError = (photoId: string) => {
    console.error(`Failed to load image for photo ${photoId}`);
    setImageErrors(prev => ({
      ...prev,
      [photoId]: { state: 'error', retryCount: 0, errorMessage: 'Failed to load image' }
    }));
  };

  const handleImageLoad = (photoId: string) => {
    // Remove from errors if it loads successfully
    setImageErrors(prev => {
      const { [photoId]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const openLightbox = (photo: Photo) => {
    setLightbox({ isOpen: true, photo });
    setIsLightboxImageLoading(true);
  };

  const closeLightbox = () => {
    setLightbox({ isOpen: false, photo: null });
    setIsLightboxImageLoading(false);
  };

  const handleLightboxImageLoad = () => {
    setIsLightboxImageLoading(false);
  };

  const handleLightboxImageError = () => {
    setIsLightboxImageLoading(false);
    console.error('Failed to load lightbox image:', lightbox.photo?.url);
    
    // Show error state in lightbox
    setLightbox(prev => ({
      ...prev,
      photo: prev.photo ? { ...prev.photo, url: 'error' } : null
    }));
  };

  const sharePhoto = async (photo: Photo) => {
    setIsSharing(true);
    
    const shareUrl = photo.url;
    
    // Use MiniKit share command for native sharing experience
    if (MiniKit && MiniKit.commandsAsync && MiniKit.commandsAsync.share) {
      // Don't await the share command - let the event handle the response
      // This prevents AbortError from being thrown when user cancels
      MiniKit.commandsAsync.share({
        title: 'Check out my photo from Photobooth',
        text: 'I uploaded this photo to the decentralized Photobooth app!',
        url: shareUrl
      }).catch((error) => {
        // Only log non-cancellation errors
        if (error.name !== 'AbortError' && !error.message.includes('cancellation')) {
          console.error('Failed to initiate share:', error);
          setIsSharing(false);
          
                  // Fallback to clipboard on error
        navigator.clipboard.writeText(shareUrl).catch((clipboardError) => {
          console.error('Failed to copy to clipboard:', clipboardError);
        });
        }
        // For AbortError/cancellation, we don't do anything - the event will handle it
      });
      
    } else {
      // Fallback to clipboard if MiniKit is not available
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (clipboardError) {
        console.error('Failed to copy to clipboard:', clipboardError);
      } finally {
        setIsSharing(false);
      }
    }
  };

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `photo-${photo.transactionId.slice(0, 8)}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <>
      <div className="space-y-4">
        {/* Gallery Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Photos</h3>
          <span className="text-sm text-gray-500">
            {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {/* Photo Grid */}
        <div className="grid grid-cols-2 gap-4">
          {photos.map((photo) => {
            const hasError = imageErrors[photo.id];

            return (
              <div
                key={photo.id}
                className="relative group cursor-pointer bg-gray-50 rounded-xl overflow-hidden"
                onClick={() => openLightbox(photo)}
              >
                {/* Status indicator - only show for errors */}
                {hasError && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Error
                    </div>
                  </div>
                )}
                
                {/* Image - simplified approach */}
                <Image
                  src={photo.url}
                  alt="Uploaded photo"
                  width={400}
                  height={200}
                  className="w-full h-40 object-cover"
                  unoptimized
                  onError={() => handleImageError(photo.id)}
                  onLoad={() => handleImageLoad(photo.id)}
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-black rounded"></div>
                    </div>
                  </div>
                </div>
                
                {/* Transaction ID badge - clickable to open explorer */}
                <div 
                  className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-opacity-90 transition-colors z-10"
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
      </div>

      {/* Lightbox Modal */}
      {lightbox.isOpen && lightbox.photo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full flex flex-col">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
            >
              <span className="text-2xl font-bold">×</span>
            </button>
            
            {/* Image */}
            <div className="flex-1 flex items-center justify-center relative">
              {isLightboxImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg font-medium">Loading Image</p>
                    <p className="text-white text-sm opacity-75 mt-1">Please wait...</p>
                  </div>
                </div>
              )}
              
              {lightbox.photo.url === 'error' ? (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">⚠️</span>
                  </div>
                  <p className="text-white text-lg font-medium mb-2">Failed to Load Image</p>
                  <p className="text-white text-sm opacity-75 mb-4">The image could not be loaded from Irys</p>
                  <button
                    onClick={() => window.open(lightbox.photo?.url, '_blank')}
                    className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Try Opening Directly
                  </button>
                </div>
              ) : (
                <Image
                  src={lightbox.photo.url}
                  alt="Full size photo"
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain"
                  unoptimized
                  onLoad={handleLightboxImageLoad}
                  onError={handleLightboxImageError}
                />
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-center space-x-4 py-4">
              <button
                onClick={() => sharePhoto(lightbox.photo!)}
                disabled={isSharing}
                className="bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSharing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Sharing...</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>Share</span>
                  </>
                )}
              </button>
              <button
                onClick={() => downloadPhoto(lightbox.photo!)}
                className="bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                <span>⬇️</span>
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
