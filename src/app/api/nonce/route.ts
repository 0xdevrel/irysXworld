import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Generate nonce - at least 8 alphanumeric characters
    const nonce = crypto.randomUUID().replace(/-/g, "");
    
    // Store nonce in secure cookie - await cookies() first
    const cookieStore = await cookies();
    cookieStore.set("siwe", nonce, { 
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 5 // 5 minutes
    });
    
    return NextResponse.json({ nonce });
  } catch (error) {
    console.error('Error generating nonce:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}
