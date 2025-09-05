import { NextResponse } from "next/server";
import { Uploader } from "@irys/upload";
import { Solana } from "@irys/upload-solana";

export async function GET() {
  try {
    const privateKey = process.env.SOLANA_PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json({
        error: "SOLANA_PRIVATE_KEY environment variable is not set"
      }, { status: 500 });
    }

    console.log('Checking Solana wallet configuration...');
    
    // Initialize uploader for Solana mainnet with explicit network setting
    const uploader = await Uploader(Solana)
      .withWallet(privateKey)
      .network("mainnet");

    // Get wallet address
    const address = uploader.address;

    // Get Irys balance
    let irysBalance = "Unknown";
    try {
      const balance = await uploader.getBalance();
      irysBalance = uploader.utils.fromAtomic(balance).toString();
    } catch (error) {
      console.log('Could not get Irys balance:', error);
    }

    // Note: SOL balance check removed - not needed for Irys mainnet with .network("mainnet")
    const solBalance = "N/A (using Irys mainnet)";

    console.log('Wallet check completed');
    
    return NextResponse.json({
      success: true,
      wallet: {
        address,
        network: "Solana Mainnet",
        configuration: "Using Uploader(Solana).withWallet().network('mainnet')"
      },
      balances: {
        irys: {
          balance: irysBalance,
          unit: "SOL"
        },
        solana: {
          balance: solBalance,
          unit: "SOL"
        }
      },
      message: "Uploader initialized successfully for Solana mainnet."
    });

  } catch (error) {
    console.error('Wallet check failed:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}
