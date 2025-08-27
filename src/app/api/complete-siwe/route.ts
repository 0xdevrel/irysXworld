import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from '@worldcoin/minikit-js';

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log('SIWE verification request received');
    
    const { payload, nonce } = (await req.json()) as IRequestPayload;
    
    console.log('Received payload:', { 
      address: payload.address, 
      status: payload.status,
      nonce: nonce 
    });
    
    // Check if nonce matches the one we created - await cookies() first
    const cookieStore = await cookies();
    const storedNonce = cookieStore.get('siwe')?.value;
    console.log('Stored nonce:', storedNonce);
    console.log('Received nonce:', nonce);
    
    if (nonce !== storedNonce) {
      console.error('Nonce mismatch');
      return NextResponse.json({
        status: 'error',
        isValid: false,
        message: 'Invalid nonce - please try again',
      }, { status: 400 });
    }
    
    console.log('Nonce verified, checking SIWE message...');
    
    // Verify the SIWE message
    const validMessage = await verifySiweMessage(payload, nonce);
    console.log('SIWE verification result:', validMessage);
    
    if (validMessage.isValid) {
      // Clear the nonce cookie after successful verification
      cookieStore.delete('siwe');
      
      console.log('SIWE verification successful');
      
      return NextResponse.json({
        status: 'success',
        isValid: true,
        user: {
          address: payload.address,
          username: payload.message.includes('username:') 
            ? payload.message.split('username:')[1]?.split('\n')[0]?.trim()
            : undefined
        }
      });
    } else {
      console.error('SIWE verification failed');
      return NextResponse.json({
        status: 'error',
        isValid: false,
        message: 'Invalid signature - please try again',
      }, { status: 400 });
    }
    
  } catch (error: unknown) {
    console.error('SIWE verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Verification failed - please try again';
    return NextResponse.json({
      status: 'error',
      isValid: false,
      message: errorMessage,
    }, { status: 500 });
  }
}
