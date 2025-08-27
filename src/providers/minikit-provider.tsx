"use client";

import { ReactNode, useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

declare global {
  interface Window {
    MiniKit: typeof MiniKit;
  }
}

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeMiniKit = async () => {
      try {
        // Install MiniKit
        if (typeof MiniKit.install === "function") {
          MiniKit.install();
        }

        // Make MiniKit available globally for debugging
        window.MiniKit = MiniKit;

        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 100));

        setIsInitialized(true);
        console.log("MiniKit initialized successfully");
      } catch (error) {
        console.error("MiniKit initialization error:", error);
        // Still set as initialized to prevent blocking the app
        setIsInitialized(true);
      }
    };

    initializeMiniKit();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-black rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full"></div>
            <div className="absolute inset-4 bg-black rounded-full animate-ping"></div>
          </div>
          <div className="text-black text-lg font-medium">Loading Photobooth</div>
          <div className="text-gray-500 text-sm mt-2">Initializing World ID...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}