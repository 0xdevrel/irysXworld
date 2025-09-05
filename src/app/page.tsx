"use client";

import { WalletAuthButton } from "@/components/WalletAuthButton";

interface User {
  address: string;
  username?: string;
}

export default function Home() {
  const handleAuthSuccess = (userData: User) => {
    console.log('User authenticated:', userData);
    
    // Save user data to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Redirect directly to upload page after login
    window.location.href = '/upload';
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
        
        <div className="space-y-6">
          <WalletAuthButton onAuthSuccess={handleAuthSuccess} />
        </div>
      </header>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-gray-500 text-xs">
        <p>Powered by World App & Irys</p>
      </footer>
    </div>
  );
}
