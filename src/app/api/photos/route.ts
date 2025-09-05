import { NextRequest, NextResponse } from "next/server";
import { getUserPhotos, saveUserPhoto, updateUserProfile, Photo } from "@/lib/kv";

// GET /api/photos - Get user's photos
export async function GET(req: NextRequest) {
  try {
    const userAddress = req.headers.get('x-user-address');
    
    if (!userAddress) {
      return NextResponse.json({
        error: "User address required"
      }, { status: 400 });
    }

    console.log('Fetching photos for user:', userAddress);
    
    const userProfile = await getUserPhotos(userAddress);
    
    if (!userProfile) {
      return NextResponse.json({
        success: true,
        photos: [],
        user: {
          address: userAddress,
          username: undefined
        }
      });
    }

    return NextResponse.json({
      success: true,
      photos: userProfile.photos,
      user: {
        address: userProfile.address,
        username: userProfile.username
      }
    });

  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to fetch photos"
    }, { status: 500 });
  }
}

// POST /api/photos - Save a new photo
export async function POST(req: NextRequest) {
  try {
    const userAddress = req.headers.get('x-user-address');
    
    if (!userAddress) {
      return NextResponse.json({
        error: "User address required"
      }, { status: 400 });
    }

    const photoData = await req.json();
    
    // Validate photo data
    const requiredFields = ['id', 'url', 'transactionId', 'explorerUrl', 'timestamp', 'filename', 'size'];
    for (const field of requiredFields) {
      if (!photoData[field]) {
        return NextResponse.json({
          error: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }

    const photo: Photo = {
      id: photoData.id,
      url: photoData.url,
      transactionId: photoData.transactionId,
      explorerUrl: photoData.explorerUrl,
      timestamp: photoData.timestamp,
      filename: photoData.filename,
      size: photoData.size
    };

    console.log('Saving photo for user:', userAddress, 'Photo ID:', photo.id);
    
    await saveUserPhoto(userAddress, photo);
    
    return NextResponse.json({
      success: true,
      message: "Photo saved successfully",
      photo
    });

  } catch (error) {
    console.error('Error saving photo:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to save photo"
    }, { status: 500 });
  }
}

// PUT /api/photos - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const userAddress = req.headers.get('x-user-address');
    
    if (!userAddress) {
      return NextResponse.json({
        error: "User address required"
      }, { status: 400 });
    }

    const { username } = await req.json();
    
    console.log('Updating profile for user:', userAddress, 'Username:', username);
    
    await updateUserProfile(userAddress, username);
    
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to update profile"
    }, { status: 500 });
  }
}
