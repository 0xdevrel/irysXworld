"use client";

import { useState } from "react";
import { MiniKit, VerificationLevel, VerifyCommandInput, ISuccessResult } from "@worldcoin/minikit-js";

interface VerifyButtonProps {
  onVerificationSuccess: () => void;
}

export const VerifyButton = ({ onVerificationSuccess }: VerifyButtonProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actionId = process.env.NEXT_PUBLIC_WLD_ACTION_ID as string;
  const isLikelyMobile = typeof navigator !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(navigator.userAgent);

  const handleVerification = async () => {
    if (!MiniKit.isInstalled()) {
      setError("Please open this app in World App");
      return;
    }

    if (!actionId) {
      setError("Action ID is not configured. Please set NEXT_PUBLIC_WLD_ACTION_ID.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const verifyPayload: VerifyCommandInput = {
        action: actionId,
        signal: "",
        verification_level: VerificationLevel.Orb, // Use Orb for better security
      };

      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

      const status = (finalPayload as { status?: unknown } | null | undefined)?.status;
      if (!finalPayload || (typeof status === "string" && status === "error")) {
        setError("Verification failed. Please try again.");
        return;
      }

      const verifyResponse = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult,
          action: actionId,
          signal: "",
        }),
      });

      const verifyResult: { status?: number; verifyRes?: { success?: boolean } ; error?: string } = await verifyResponse.json();
      if (verifyResponse.ok && (verifyResult.status === 200 || verifyResult.verifyRes?.success)) {
        onVerificationSuccess();
      } else {
        setError(verifyResult.error || "Verification failed on server. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <button
        onClick={handleVerification}
        disabled={isVerifying || !isLikelyMobile}
        className="w-full bg-black text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:bg-gray-800 active:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95"
      >
        {isVerifying ? (
          <div className="flex items-center justify-center space-x-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Verifying...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-3">
            <div className="w-5 h-5 bg-white rounded-full"></div>
            <span>Verify with World ID</span>
          </div>
        )}
      </button>
      
      {!isLikelyMobile && (
        <div className="text-center mt-4 text-gray-500 text-sm">
          📱 Open on your phone in World App to verify
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};
