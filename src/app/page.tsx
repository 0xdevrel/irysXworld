"use client";

import { useState } from "react";
import { VerifyButton } from "@/components/VerifyButton";
import { PhotoUpload } from "@/components/PhotoUpload";
import { PhotoGallery } from "@/components/PhotoGallery";

interface Photo {
  id: string;
  url: string;
  transactionId: string;
  explorerUrl: string;
  timestamp: number;
}

export default function Home() {
  const [isVerified, setIsVerified] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    // In a real app, you would get the username from the verification response
    setUsername("Verified User");
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

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center flex-1 flex flex-col justify-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-black rounded-2xl flex items-center justify-center">
          <div className="w-12 h-12 bg-white rounded-xl"></div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Photobooth</h1>
        <p className="text-gray-600 text-lg mb-8">Onchain photo storage</p>
        
        {!isVerified ? (
          <div className="space-y-6">
            <VerifyButton onVerificationSuccess={handleVerificationSuccess} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Welcome, {username}!</h2>
              <p className="text-gray-600 text-sm">
                Your photos are ready to upload to Irys testnet.
              </p>
            </div>

            {/* Upload Section */}
            {showUpload ? (
              <PhotoUpload onUploadSuccess={handleUploadSuccess} />
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
                setIsVerified(false);
                setPhotos([]);
                setShowUpload(false);
              }}
              className="w-full bg-gray-100 text-black font-medium py-3 px-6 rounded-2xl hover:bg-gray-200 transition-colors border border-gray-200"
            >
              Reset
            </button>
          </div>
        )}
      </header>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-gray-500 text-xs">
        <p>Powered by World ID & Irys</p>
      </footer>
    </div>
  );
}
