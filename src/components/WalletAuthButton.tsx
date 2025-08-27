"use client";

import { useState } from "react";
import { MiniKit, WalletAuthInput } from '@worldcoin/minikit-js';

interface WalletAuthButtonProps {
  onAuthSuccess: (user: { address: string; username?: string }) => void;
}

export const WalletAuthButton = ({ onAuthSuccess }: WalletAuthButtonProps) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithWallet = async () => {
    console.log('Starting wallet authentication...');
    
    // Check if MiniKit is available
    if (typeof MiniKit === 'undefined') {
      setError("MiniKit is not available. Please refresh the page.");
      return;
    }

    if (!MiniKit.isInstalled()) {
      // For testing purposes, allow fallback authentication
      console.log('World App not installed, using fallback for testing');
      setError("World App is not installed. Please install World App to continue.");
      
      // Uncomment the following lines for testing without World App
      // onAuthSuccess({ 
      //   address: "0x1234567890123456789012345678901234567890", 
      //   username: "testuser" 
      // });
      return;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      console.log('Getting nonce from backend...');
      
      // Get nonce from backend
      const res = await fetch('/api/nonce');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get nonce');
      }
      const { nonce } = await res.json();
      console.log('Nonce received:', nonce);

      console.log('Triggering wallet auth command...');
      
      // Trigger wallet auth command
      const walletAuthInput: WalletAuthInput = {
        nonce: nonce,
        requestId: 'photobooth-auth',
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 24 hours ago
        statement: 'Sign in to Photobooth - Your decentralized photo storage app. https://worldcoin.com/apps',
      };

      console.log('Wallet auth input:', walletAuthInput);

      const { commandPayload: generateMessageResult, finalPayload } = await MiniKit.commandsAsync.walletAuth(walletAuthInput);

      console.log('Wallet auth response:', { generateMessageResult, finalPayload });

      if (finalPayload.status === 'error') {
        const errorMessage = 'error' in finalPayload ? String(finalPayload.error) : 'Wallet authentication failed';
        throw new Error(errorMessage);
      }

      console.log('Verifying authentication on backend...');

      // Verify the authentication on backend
      const verifyRes = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      });

      const verifyResult = await verifyRes.json();
      console.log('Verification result:', verifyResult);

      if (verifyResult.status === 'success' && verifyResult.isValid) {
        // Get username from MiniKit if available
        const username = MiniKit.user?.username || verifyResult.user?.username;
        const address = finalPayload.address;
        
        console.log('Wallet auth successful:', { address, username });
        onAuthSuccess({ address, username });
      } else {
        throw new Error(verifyResult.message || 'Verification failed');
      }

    } catch (authError) {
      console.error('Wallet auth error:', authError);
      setError(authError instanceof Error ? authError.message : 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={signInWithWallet}
        disabled={isAuthenticating}
        className="w-full bg-black text-white font-semibold py-4 px-6 rounded-2xl hover:bg-gray-800 active:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95 flex items-center justify-center space-x-2"
      >
        {isAuthenticating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting Wallet...</span>
          </>
        ) : (
          <>
            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded"></div>
            </div>
            <span>Sign in with Wallet</span>
          </>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
          ⚠️ {error}
        </div>
      )}

      <div className="text-center text-xs text-gray-400">
        Connect your World App wallet to start uploading photos
      </div>
    </div>
  );
};
