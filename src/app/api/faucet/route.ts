import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    error: "Faucet is not available on mainnet. Please fund your wallet with real SOL from an exchange or wallet.",
    message: "This endpoint is disabled for mainnet. Use a cryptocurrency exchange or wallet to obtain SOL.",
    network: "mainnet"
  }, { status: 400 });
}
