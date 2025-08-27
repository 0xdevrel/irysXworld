import { NextRequest, NextResponse } from "next/server";
import { Uploader } from "@irys/upload";
import { Solana } from "@irys/upload-solana";

export async function POST(request: NextRequest) {
  try {
    const privateKey = process.env.SOLANA_PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json({
        error: "SOLANA_PRIVATE_KEY environment variable is not set"
      }, { status: 500 });
    }

    const { amount = 0.1 } = await request.json();

    console.log('Funding Irys account with SOL...');
    
    // Initialize uploader for Solana devnet
    const uploader = await Uploader(Solana)
      .withWallet(privateKey)
      .withRpc(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')
      .devnet();
    
    // Get current balance
    const currentBalance = await uploader.getBalance();
    const currentBalanceFormatted = uploader.utils.fromAtomic(currentBalance);
    console.log('Current balance:', currentBalanceFormatted, 'SOL');
    
    // Fund the account
    const fundAmount = uploader.utils.toAtomic(amount);
    console.log(`Funding account with ${amount} SOL...`);
    
    const fundTx = await uploader.fund(fundAmount);
    console.log('Funding successful:', uploader.utils.fromAtomic(fundTx.quantity), 'SOL');
    
    // Wait a moment for the funding transaction to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get new balance
    const newBalance = await uploader.getBalance();
    const newBalanceFormatted = uploader.utils.fromAtomic(newBalance);
    console.log('New balance:', newBalanceFormatted, 'SOL');
    
    return NextResponse.json({
      success: true,
      funding: {
        amount: amount,
        transactionId: fundTx.id,
        quantity: uploader.utils.fromAtomic(fundTx.quantity)
      },
      balance: {
        before: currentBalanceFormatted,
        after: newBalanceFormatted,
        unit: "SOL"
      },
      message: "Account funded successfully with SOL"
    });

  } catch (error) {
    console.error('Funding failed:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}
