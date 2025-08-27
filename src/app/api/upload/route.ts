import { NextRequest, NextResponse } from "next/server";
import { Uploader } from "@irys/upload";
import { Solana } from "@irys/upload-solana";

let uploaderInstance: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

const getIrysUploader = async () => {
  try {
    if (!uploaderInstance) {
      const privateKey = process.env.SOLANA_PRIVATE_KEY;
      
      if (!privateKey) {
        throw new Error('SOLANA_PRIVATE_KEY environment variable is not set');
      }

      console.log('Initializing Irys uploader for Solana devnet...');
      
      // Configure for Solana devnet as per working script
      uploaderInstance = await Uploader(Solana)
        .withWallet(privateKey)
        .withRpc(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')
        .devnet();
        
      console.log(`Connected to Irys from ${uploaderInstance.address}`);
      console.log('Network:', uploaderInstance.api.url);
      console.log('Irys uploader initialized successfully for Solana devnet');
    }
    
    return uploaderInstance;
  } catch (error) {
    console.error('Failed to initialize Irys uploader:', error);
    throw error;
  }
};

export async function POST(req: NextRequest) {
  try {
    // Add CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({
        error: "No file provided"
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        error: "File must be an image"
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        error: "File size must be less than 10MB"
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    try {
      console.log('Starting upload to Irys Solana devnet...');
      
      const irysUploader = await getIrysUploader();

      // Check balance before upload
      try {
        const balance = await irysUploader.getBalance();
        const price = await irysUploader.getPrice(file.size);
        const balanceFormatted = irysUploader.utils.fromAtomic(balance);
        const priceFormatted = irysUploader.utils.fromAtomic(price);
        
        console.log('Current balance:', balanceFormatted, 'SOL');
        console.log('Upload cost:', priceFormatted, 'SOL');
        
        if (balance.lt(price)) {
          console.log('Insufficient balance for upload');
          return NextResponse.json({
            error: `Insufficient balance. Required: ${priceFormatted} SOL, Available: ${balanceFormatted} SOL`
          }, {
            status: 402,
            headers: corsHeaders
          });
        }
      } catch (balanceError) {
        console.log('Could not check balance:', balanceError);
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload the image with tags
      const tags = [
        { name: "Content-Type", value: file.type },
        { name: "Application", value: "Photobooth" },
        { name: "Version", value: "1.0" },
        { name: "Timestamp", value: new Date().toISOString() },
        { name: "Filename", value: file.name },
        { name: "Uploader", value: "World App User" }
      ];

      // Add wallet address if available in headers
      const walletAddress = req.headers.get('x-wallet-address');
      if (walletAddress) {
        tags.push({ name: "Wallet-Address", value: walletAddress });
      }

      console.log('Uploading file to Irys Solana devnet...');
      const receipt = await irysUploader.upload(buffer, { tags });
      
      const transactionId = receipt.id;
      const gatewayUrl = `https://gateway.irys.xyz/${transactionId}`;
      const explorerUrl = `https://explorer.solana.com/tx/${transactionId}?cluster=devnet`;
      
      console.log('Upload successful!');
      console.log('Transaction ID:', transactionId);
      console.log('Gateway URL:', gatewayUrl);
      console.log('Explorer URL:', explorerUrl);

      return NextResponse.json({
        success: true,
        transactionId,
        gatewayUrl,
        explorerUrl,
        filename: file.name,
        size: file.size
      }, {
        status: 200,
        headers: corsHeaders
      });

    } catch (uploadError) {
      console.error("Irys upload error:", uploadError);
      
      // Provide more specific error messages
      let errorMessage = "Upload failed";
      if (uploadError instanceof Error) {
        if (uploadError.message.includes("402")) {
          errorMessage = "Insufficient SOL balance. Please fund your wallet with SOL from the devnet faucet.";
        } else if (uploadError.message.includes("funding")) {
          errorMessage = "Funding failed. Please check your SOL balance.";
        } else {
          errorMessage = uploadError.message;
        }
      }
      
      return NextResponse.json({
        error: errorMessage
      }, {
        status: 500,
        headers: corsHeaders
      });
    }

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error occurred"
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
