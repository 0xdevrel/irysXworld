"use client";

import { useState, useEffect } from "react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { PhotoGallery } from "@/components/PhotoGallery";
import { Navigation } from "@/components/Navigation";

interface Photo {
  id: string;
  url: string;
  transactionId: string;
  explorerUrl: string;
  timestamp: number;
}

interface User {
  address: string;
  username?: string;
}

export default function UploadPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

  // Load user photos from KV storage
  const loadUserPhotos = async (userAddress: string) => {
    setIsLoadingPhotos(true);
    try {
      const response = await fetch('/api/photos', {
        headers: {
          'x-user-address': userAddress
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPhotos(data.photos || []);
        } else {
          console.error('Failed to load photos - invalid response format');
          setPhotos([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load photos from KV storage:', errorData);
        setPhotos([]);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
      setPhotos([]);
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  // Get user data from localStorage or URL parameters
  useEffect(() => {
    // Try to get user data from localStorage first
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoading(false);
        
        // Load user's photos from KV storage
        if (userData.address) {
          loadUserPhotos(userData.address);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsLoading(false);
        window.location.href = '/';
      }
    } else {
      // If no user data, redirect to home
      window.location.href = '/';
    }
  }, []);

  // Get user from localStorage or props (you can modify this based on your auth flow)
  const getDisplayName = () => {
    if (user?.username && user.username.trim() !== '') {
      return user.username;
    }
    if (user?.address) {
      return `${user.address.slice(0, 6)}...${user.address.slice(-4)}`;
    }
    return "User";
  };

  const handleUploadSuccess = (_imageUrl: string, _transactionId: string, _explorerUrl: string) => {
    // Reload photos from KV storage to get the latest data
    if (user?.address) {
      loadUserPhotos(user.address);
    }
    
    setShowUpload(false);
  };


  const handleTransactionClick = (photo: Photo) => {
    // Open transaction explorer in new tab
    window.open(photo.explorerUrl, '_blank');
  };

  const handleSignOut = () => {
    // Clear user data and redirect to home
    setUser(null);
    setPhotos([]);
    setShowUpload(false);
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // Show loading state while user data is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-black rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full"></div>
            <div className="absolute inset-4 bg-black rounded-full animate-ping"></div>
          </div>
          <div className="text-black text-lg font-medium">Loading Photobooth</div>
          <div className="text-gray-500 text-sm mt-2">Initializing...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Compact Header */}
      <Navigation user={user} onSignOut={handleSignOut} />

      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold">Welcome, {getDisplayName()}!</h2>
          </div>

          {/* Upload Section */}
          {showUpload ? (
            <PhotoUpload 
              onUploadSuccess={handleUploadSuccess} 
              walletAddress={user?.address}
            />
          ) : (
            <div className="space-y-6">
              {/* Upload Button */}
              <div className="text-center">
                <button
                  onClick={() => setShowUpload(true)}
                  className="bg-black text-white font-semibold py-3 px-8 rounded-2xl hover:bg-gray-800 active:bg-gray-900 transition-all duration-200 transform active:scale-95"
                >
                  Upload New Photo
                </button>
              </div>
              
              {/* Photo Gallery */}
              {isLoadingPhotos ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="absolute inset-0 bg-black rounded-full animate-pulse"></div>
                    <div className="absolute inset-2 bg-white rounded-full"></div>
                    <div className="absolute inset-4 bg-black rounded-full animate-ping"></div>
                  </div>
                  <div className="text-black text-lg font-medium">Loading Photos</div>
                  <div className="text-gray-500 text-sm mt-2">Fetching from storage...</div>
                </div>
              ) : (
                <PhotoGallery 
                  photos={photos} 
                  onTransactionClick={handleTransactionClick}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-3 text-center text-gray-500 text-xs border-t border-gray-100">
        <p>Powered by World App & Irys</p>
      </footer>
    </div>
  );
}
