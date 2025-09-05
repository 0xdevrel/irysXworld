"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface PhotoUploadProps {
  onUploadSuccess: (imageUrl: string, transactionId: string, explorerUrl: string) => void;
  walletAddress?: string;
}

export const PhotoUpload = ({ onUploadSuccess, walletAddress }: PhotoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      // Check file size (limit to 10MB for testnet)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      
      setSelectedImage(file);
      setError(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setError("Please select a valid image file");
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const openGallery = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const uploadToIrys = async () => {
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedImage);
      formData.append('walletAddress', walletAddress || ''); // Add wallet address to FormData

      setUploadProgress(10);

      // Upload to our API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'x-wallet-address': walletAddress || ''
        }
      });

      setUploadProgress(90);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      setUploadProgress(100);

      
      // Save photo to KV storage
      if (walletAddress) {
        try {
          const photoData = {
            id: Date.now().toString(),
            url: result.gatewayUrl,
            transactionId: result.transactionId,
            explorerUrl: result.explorerUrl,
            timestamp: Date.now(),
            filename: selectedImage.name,
            size: selectedImage.size
          };

          const saveResponse = await fetch('/api/photos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-address': walletAddress
            },
            body: JSON.stringify(photoData)
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json().catch(() => ({}));
            console.error('Failed to save photo to KV storage:', errorData);
            // Show user-friendly error message
            setError('Photo uploaded successfully, but failed to save to gallery. Please refresh the page.');
          }
        } catch (kvError) {
          console.error('Error saving photo to KV:', kvError);
          // Show user-friendly error message
          setError('Photo uploaded successfully, but failed to save to gallery. Please refresh the page.');
        }
      }
      
      // Call the success callback with new response structure
      onUploadSuccess(result.gatewayUrl, result.transactionId, result.explorerUrl);
      
      // Reset state
      setSelectedImage(null);
      setPreviewUrl(null);
      
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* Upload Options */}
      {!selectedImage && (
        <div className="space-y-6">
          {/* Back Button */}
          <div className="flex justify-start">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-6">Upload Photo</h3>
            
            <div className="flex justify-center space-x-6">
              <button
                onClick={openGallery}
                className="bg-gray-100 hover:bg-gray-200 text-black font-medium py-4 px-6 rounded-2xl transition-colors border border-gray-200 flex flex-col items-center space-y-2"
              >
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded"></div>
                </div>
                <span className="text-sm">Gallery</span>
              </button>
              
              <button
                onClick={openCamera}
                className="bg-gray-100 hover:bg-gray-200 text-black font-medium py-4 px-6 rounded-2xl transition-colors border border-gray-200 flex flex-col items-center space-y-2"
              >
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <span className="text-sm">Camera</span>
              </button>
            </div>
            
            <div className="text-center text-xs text-gray-400 mt-4">
              Max file size: 10MB • Supported: JPG, PNG, GIF
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {previewUrl && selectedImage && (
        <div className="space-y-4">
          <div className="relative">
            <Image
              src={previewUrl}
              alt="Preview"
              width={400}
              height={256}
              className="w-full h-64 object-cover rounded-2xl"
              unoptimized
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
            >
              ×
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-black h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-sm text-gray-600">
                  Uploading to Irys... {uploadProgress}%
                </div>
                {uploadProgress < 50 && (
                  <div className="text-xs text-gray-400">
                    Uploading to Irys network...
                  </div>
                )}
                {uploadProgress >= 50 && uploadProgress < 100 && (
                  <div className="text-xs text-gray-400">
                    Processing on Solana mainnet...
                  </div>
                )}
                {uploadProgress === 100 && (
                  <div className="text-xs text-green-600">
                    ✓ Upload complete! Processing on Irys gateway...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={uploadToIrys}
            disabled={isUploading}
            className="w-full bg-black text-white font-semibold py-3 px-6 rounded-2xl hover:bg-gray-800 active:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95"
          >
            {isUploading ? "Uploading..." : "Upload to Irys"}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};
