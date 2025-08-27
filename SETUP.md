# Photobooth Mini App Setup Guide

## 🚀 Quick Start

1. **Install dependencies**: `npm install`
2. **Set up environment variables** (see below)
3. **Run development server**: `npm run dev`
4. **Open in World App** on your mobile device

## 🔑 Required Environment Variables

Create a `.env.local` file in your project root with these variables:

### World ID Configuration (Required)
```bash
# Your World ID App ID (starts with 'app_')
WLD_APP_ID=app_your_app_id_here

# Your World ID Action ID for verification
NEXT_PUBLIC_WLD_ACTION_ID=your_action_id_here
```

### Optional World ID Settings
```bash
# Signal for verification (can be empty string)
NEXT_PUBLIC_WLD_SIGNAL=

# Verification level (Orb or Device)
NEXT_PUBLIC_WLD_VERIFICATION_LEVEL=Orb
```

### Irys Configuration (For Photo Upload)
```bash
# Your wallet private key for Irys testnet (keep this secret!) - SERVER SIDE ONLY
IRYS_PRIVATE_KEY=your_private_key_here

# Irys gateway for viewing uploaded content
NEXT_PUBLIC_IRYS_GATEWAY=https://gateway.irys.xyz

# Irys testnet network (devnet)
IRYS_NETWORK=devnet

# Note: The RPC URL is hardcoded to use Irys testnet: https://testnet-rpc.irys.xyz/v1/execution-rpc
# No need to configure this as an environment variable
```

## 🌍 World ID Setup

1. Go to [World ID Developer Portal](https://developer.worldcoin.org/)
2. Create a new app
3. Copy your App ID (starts with `app_`)
4. Create a new action for verification
5. Copy your Action ID
6. Add both to your `.env.local` file

## 📱 Irys Testnet Setup

1. Go to [Irys Documentation](https://docs.irys.xyz/)
2. Set up an Irys testnet wallet at [wallet.irys.xyz](https://wallet.irys.xyz)
3. Get your private key for the Irys testnet wallet
4. **Get testnet IRYS tokens** - This is crucial for uploads to work
5. Add the configuration to your `.env.local` file

**Important**: 
- The Irys private key is server-side only (no `NEXT_PUBLIC_` prefix) for security
- We're using Irys testnet, not Ethereum Sepolia
- The RPC URL is hardcoded to `https://testnet-rpc.irys.xyz/v1`
- **You need IRYS tokens in your wallet for uploads to work**

### Getting IRYS Testnet Tokens

To get IRYS testnet tokens, you can:
1. Use the Irys testnet faucet (if available)
2. Check the [Irys Discord](https://discord.gg/irys) for testnet token distribution
3. Contact the Irys team for testnet access

**Note**: Without IRYS tokens in your wallet, photo uploads will fail with "402 error: Not enough balance for transaction".

## 📱 Testing the App

### Desktop Testing
- The app will show a message to open on mobile
- Verification button will be disabled
- Good for development and testing UI

### Mobile Testing
1. Open the app in **World App**
2. Navigate to your mini app
3. Click "Verify with World ID"
4. Complete the verification process
5. Use the photo upload features

## 🎨 Design Features

- **Mobile-First**: Optimized for mobile devices
- **Black & White**: Minimal, tasteful aesthetic
- **Touch-Friendly**: Large buttons and smooth interactions
- **iOS Optimized**: Prevents scroll bounce
- **Fast Loading**: Optimized for 2-3 second load times
- **Instagram-Like**: Familiar photo upload interface

## 🔧 Development

### Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── verify/route.ts       # World ID verification API
│   │   └── upload/route.ts       # Irys photo upload API
│   ├── globals.css               # Global styles with mobile-first design
│   ├── layout.tsx                # Root layout with MiniKit provider
│   └── page.tsx                  # Main home page with photo upload
├── components/
│   ├── VerifyButton.tsx          # World ID verification component
│   ├── PhotoUpload.tsx           # Photo upload interface
│   └── PhotoGallery.tsx          # Photo gallery display
└── providers/
    └── minikit-provider.tsx      # MiniKit initialization provider
```

### Key Components
- **MiniKitProvider**: Initializes World ID MiniKit
- **VerifyButton**: Handles user verification
- **PhotoUpload**: Instagram-like photo upload interface
- **PhotoGallery**: Displays uploaded photos
- **Home Page**: Main app interface with verification and upload flow

## 📸 Photo Upload Features

### **Upload Methods**
- **Gallery**: Select photos from device gallery
- **Camera**: Take new photos directly in the app
- **File**: Upload image files

### **Irys Integration**
- **Testnet Storage**: Photos stored on Irys testnet (devnet)
- **Decentralized**: No central server stores your photos
- **Permanent**: Once uploaded, photos are permanently stored
- **Verifiable**: Each photo has a unique transaction ID

### **Upload Process**
1. User verifies identity with World ID
2. Selects upload method (gallery/camera/file)
3. Chooses or captures photo
4. Photo is uploaded to Irys testnet via API route
5. Photo appears in personal gallery
6. Photos can be viewed via Irys gateway

## 🚨 Troubleshooting

### Common Issues

1. **"App ID not configured"**
   - Check your `WLD_APP_ID` environment variable
   - Make sure it starts with `app_`

2. **"Action ID not configured"**
   - Check your `NEXT_PUBLIC_WLD_ACTION_ID` environment variable
   - Verify it's set correctly

3. **"Irys private key not configured"**
   - Check your `IRYS_PRIVATE_KEY` environment variable
   - Make sure it's server-side only (no `NEXT_PUBLIC_` prefix)

4. **Verification fails**
   - Ensure you're testing in World App
   - Check browser console for errors
   - Verify your World ID app configuration

5. **Photo upload fails**
   - Check Irys configuration in environment variables
   - **Ensure you have testnet IRYS tokens in your wallet** (most common issue)
   - Check server logs for detailed error messages
   - If you see "402 error: Not enough balance", you need to fund your wallet with IRYS tokens
   - If you see "funding failed", check your wallet has sufficient IRYS tokens for funding

6. **"Funding failed" or "Tx doesn't exist" errors**
   - This indicates your wallet doesn't have enough IRYS tokens
   - Get testnet IRYS tokens from the Irys team or Discord
   - Ensure your private key is correct and corresponds to a funded wallet
   - Check the Irys testnet explorer at [testnet-explorer.irys.xyz](https://testnet-explorer.irys.xyz)

### Debug Mode

The app includes console logging for debugging:
- MiniKit initialization status
- Verification request details
- Photo upload progress and results
- API response information

## 📋 Next Steps

After setting up verification and photo upload:

1. **Test the complete flow** on mobile
2. **Add photo management** (delete, edit, organize)
3. **Implement social features** (sharing, commenting)
4. **Add advanced privacy controls**
5. **Support multiple Irys networks**

## 🔗 Resources

- [World ID Documentation](https://docs.world.org/)
- [MiniKit Commands](https://docs.world.org/mini-apps/commands/verify)
- [Design Guidelines](https://docs.world.org/mini-apps/design/app-guidelines)
- [Irys Documentation](https://docs.irys.xyz/)
- [Irys Quickstart](https://docs.irys.xyz/build/d/quickstart)
- [Supported Tokens](https://docs.irys.xyz/build/d/features/supported-tokens)
- [Networks](https://docs.irys.xyz/build/d/networks)
- [Irys Testnet Wallet](https://wallet.irys.xyz)
- [Irys Testnet Explorer](https://testnet-explorer.irys.xyz)

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review World ID and Irys documentation
3. Check browser console and server logs for errors
4. Verify environment variable configuration
5. Ensure you have testnet IRYS tokens for Irys operations
