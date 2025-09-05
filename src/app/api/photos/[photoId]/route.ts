import { NextRequest, NextResponse } from "next/server";
import { deleteUserPhoto } from "@/lib/kv";

// DELETE /api/photos/[photoId] - Delete a specific photo
export async function DELETE(
  req: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const userAddress = req.headers.get('x-user-address');
    const { photoId } = params;
    
    if (!userAddress) {
      return NextResponse.json({
        error: "User address required"
      }, { status: 400 });
    }

    if (!photoId) {
      return NextResponse.json({
        error: "Photo ID required"
      }, { status: 400 });
    }

    console.log('Deleting photo for user:', userAddress, 'Photo ID:', photoId);
    
    await deleteUserPhoto(userAddress, photoId);
    
    return NextResponse.json({
      success: true,
      message: "Photo deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to delete photo"
    }, { status: 500 });
  }
}
