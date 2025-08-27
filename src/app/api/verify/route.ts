import { NextRequest, NextResponse } from "next/server";
import {
  verifyCloudProof,
  IVerifyResponse,
  ISuccessResult,
} from "@worldcoin/minikit-js";

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Add CORS headers for ngrok
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    const { payload, action, signal } = (await req.json()) as IRequestPayload;
    
    // Get app ID from environment - use the correct env var name
    const app_id = process.env.WLD_APP_ID as `app_${string}`;
    
    if (!app_id) {
      console.error("App ID not configured - WLD_APP_ID environment variable is missing");
      return NextResponse.json({
        status: 500,
        error: "App ID not configured",
      }, { 
        status: 500,
        headers: corsHeaders 
      });
    }

    console.log("Verifying proof for action:", action);
    console.log("App ID:", app_id);
    
    // Verify the proof using Worldcoin's cloud verification
    const verifyRes = (await verifyCloudProof(
      payload,
      app_id,
      action,
      signal
    )) as IVerifyResponse;

    console.log("Verification result:", verifyRes);

    if (verifyRes.success) {
      console.log("Verification successful");
      return NextResponse.json({ 
        verifyRes, 
        status: 200,
        message: "Verification successful" 
      }, {
        status: 200,
        headers: corsHeaders
      });
    } else if (verifyRes.code === 'max_verifications_reached') {
      // User has already verified for this action - treat as success
      console.log("User already verified for this action - allowing access");
      return NextResponse.json({ 
        verifyRes: { ...verifyRes, success: true },
        status: 200,
        message: "Already verified - access granted",
        alreadyVerified: true
      }, {
        status: 200,
        headers: corsHeaders
      });
    } else {
      console.log("Verification failed:", verifyRes);
      return NextResponse.json({ 
        verifyRes, 
        status: 400,
        error: "Verification failed - " + (verifyRes.detail || "Unknown error")
      }, {
        status: 400,
        headers: corsHeaders
      });
    }
  } catch (error) {
    console.error("Error verifying proof:", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}