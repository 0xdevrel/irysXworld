// Cloudflare KV utility functions for photo storage

export interface Photo {
  id: string;
  url: string;
  transactionId: string;
  explorerUrl: string;
  timestamp: number;
  filename: string;
  size: number;
}

export interface UserProfile {
  address: string;
  username?: string;
  lastLogin: number;
  photos: Photo[];
}

// KV API endpoints
const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';

async function makeKVRequest(endpoint: string, method: string = 'GET', body?: any) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !namespaceId || !apiToken) {
    throw new Error('Cloudflare KV configuration missing. Please check environment variables.');
  }

  const url = `${CLOUDFLARE_API_BASE}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${endpoint}`;
  
  const headers: HeadersInit = {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`KV request failed: ${response.status} ${errorText}`);
  }

  if (method === 'GET') {
    return await response.text();
  }
  
  return await response.json();
}

export async function getUserPhotos(userAddress: string): Promise<UserProfile | null> {
  try {
    const key = `user:${userAddress}`;
    const data = await makeKVRequest(key);
    
    if (!data) {
      return null;
    }

    return JSON.parse(data) as UserProfile;
  } catch (error) {
    console.error('Error fetching user photos:', error);
    return null;
  }
}

export async function saveUserPhoto(userAddress: string, photo: Photo): Promise<void> {
  try {
    const key = `user:${userAddress}`;
    
    // Get existing user data
    let userProfile = await getUserPhotos(userAddress);
    
    if (!userProfile) {
      // Create new user profile
      userProfile = {
        address: userAddress,
        lastLogin: Date.now(),
        photos: []
      };
    }

    // Add new photo to the beginning of the array
    userProfile.photos.unshift(photo);
    userProfile.lastLogin = Date.now();

    // Save back to KV
    await makeKVRequest(key, 'PUT', userProfile);
    
    console.log(`Saved photo ${photo.id} for user ${userAddress}`);
  } catch (error) {
    console.error('Error saving user photo:', error);
    throw error;
  }
}

export async function deleteUserPhoto(userAddress: string, photoId: string): Promise<void> {
  try {
    const key = `user:${userAddress}`;
    
    // Get existing user data
    const userProfile = await getUserPhotos(userAddress);
    
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Remove photo from array
    userProfile.photos = userProfile.photos.filter(photo => photo.id !== photoId);
    userProfile.lastLogin = Date.now();

    // Save back to KV
    await makeKVRequest(key, 'PUT', userProfile);
    
    console.log(`Deleted photo ${photoId} for user ${userAddress}`);
  } catch (error) {
    console.error('Error deleting user photo:', error);
    throw error;
  }
}

export async function updateUserProfile(userAddress: string, username?: string): Promise<void> {
  try {
    const key = `user:${userAddress}`;
    
    // Get existing user data
    let userProfile = await getUserPhotos(userAddress);
    
    if (!userProfile) {
      // Create new user profile
      userProfile = {
        address: userAddress,
        lastLogin: Date.now(),
        photos: []
      };
    }

    // Update profile
    if (username) {
      userProfile.username = username;
    }
    userProfile.lastLogin = Date.now();

    // Save back to KV
    await makeKVRequest(key, 'PUT', userProfile);
    
    console.log(`Updated profile for user ${userAddress}`);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}
