"use client";

import { useState } from "react";
import { WalletAuthButton } from "@/components/WalletAuthButton";
import { PhotoUpload } from "@/components/PhotoUpload";
import { PhotoGallery } from "@/components/PhotoGallery";

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

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  const handleAuthSuccess = (userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
    console.log('User authenticated:', userData);
  };

  const handleUploadSuccess = (imageUrl: string, transactionId: string, explorerUrl: string) => {
    console.log('Upload success - Image URL:', imageUrl);
    console.log('Upload success - Transaction ID:', transactionId);
    console.log('Upload success - Explorer URL:', explorerUrl);
    
    const newPhoto: Photo = {
      id: Date.now().toString(),
      url: imageUrl,
      transactionId,
      explorerUrl,
      timestamp: Date.now()
    };
    
    console.log('Created new photo object:', newPhoto);
    setPhotos(prev => [newPhoto, ...prev]);
    setShowUpload(false);
  };

  const handlePhotoClick = (photo: Photo) => {
    // Open photo in new tab
    window.open(photo.url, '_blank');
  };

  const handleTransactionClick = (photo: Photo) => {
    // Open transaction explorer in new tab
    window.open(photo.explorerUrl, '_blank');
  };

  const getDisplayName = () => {
    if (user?.username) {
      return user.username;
    }
    if (user?.address) {
      return `${user.address.slice(0, 6)}...${user.address.slice(-4)}`;
    }
    return "User";
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center flex-1 flex flex-col justify-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-black rounded-2xl flex items-center justify-center">
          <div className="w-12 h-12 bg-white rounded-xl"></div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Photobooth</h1>
        <p className="text-gray-600 text-lg mb-8">Onchain photo storage</p>
        
        {!isAuthenticated ? (
          <div className="space-y-6">
            <WalletAuthButton onAuthSuccess={handleAuthSuccess} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Welcome, {getDisplayName()}!</h2>
            </div>

            {/* Upload Section */}
            {showUpload ? (
              <PhotoUpload 
                onUploadSuccess={handleUploadSuccess} 
                walletAddress={user?.address}
              />
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => setShowUpload(true)}
                  className="w-full bg-black text-white font-semibold py-3 px-6 rounded-2xl hover:bg-gray-800 active:bg-gray-900 transition-all duration-200 transform active:scale-95"
                >
                  Upload New Photo
                </button>
                
                {/* Photo Gallery */}
                <PhotoGallery 
                  photos={photos} 
                  onPhotoClick={handlePhotoClick}
                  onTransactionClick={handleTransactionClick}
                />
              </div>
            )}

            {/* Reset Button */}
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setUser(null);
                setPhotos([]);
                setShowUpload(false);
              }}
              className="w-full bg-gray-100 text-black font-medium py-3 px-6 rounded-2xl hover:bg-gray-200 transition-colors border border-gray-200"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-gray-500 text-xs">
        <p>Powered by World App & Irys</p>
      </footer>
    </div>
  );
}
