# Photobooth - Onchain Photo Storage

A Next.js 15 app that uploads photos to Irys using Solana mainnet. Built with World ID verification, MiniKit integration, and modern UI components.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Solana wallet with mainnet SOL
- World App (for authentication)

### Installation

```bash
# Clone and install
git clone https://github.com/0xdevrel/irysXworld.git
cd irysXworld
npm install

# Set up environment
cp env.example .env.local
```

### Environment Setup

Create `.env.local` with:

```bash
# World ID Configuration (required for authentication)
WLD_APP_ID=app_your_app_id_here
NEXT_PUBLIC_WLD_ACTION_ID=your_action_id_here
NEXT_PUBLIC_WLD_SIGNAL=
NEXT_PUBLIC_WLD_VERIFICATION_LEVEL=Orb

# Solana Configuration (required for uploads)
SOLANA_PRIVATE_KEY=your_solana_private_key_here
NEXT_PUBLIC_IRYS_GATEWAY=https://gateway.irys.xyz

# Cloudflare KV Configuration (required for persistent photo storage)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here
CLOUDFLARE_KV_NAMESPACE_ID=your_kv_namespace_id_here
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
```

### Get Solana Private Key

1. **Generate new wallet**: Use Solana CLI or any wallet
2. **Export private key**: Get base58 encoded private key
3. **Add to .env.local**: `SOLANA_PRIVATE_KEY=your_key_here`

### Get Mainnet SOL

**Important**: This app uses Solana mainnet, which requires real SOL tokens.

1. **Buy SOL** from exchanges like Coinbase, Binance, Kraken
2. **Transfer SOL** to your wallet address (shown in the app)
3. **Fund Irys account** using the `/api/fund-account` endpoint

### Set Up Cloudflare KV

**Important**: Photos are now stored persistently using Cloudflare KV to maintain user galleries across sessions.

1. **Create Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Create KV Namespace**:
   - Go to Workers & Pages → KV
   - Create a new namespace (e.g., "photobooth-storage")
   - Copy the namespace ID
3. **Get Account ID**:
   - Go to Workers & Pages → Overview
   - Copy your Account ID
4. **Create API Token**:
   - Go to My Profile → API Tokens
   - Create token with "Cloudflare KV:Edit" permissions
   - Copy the token
5. **Add to .env.local**: Set all three KV environment variables

### Run the App

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📸 Usage

1. **Sign in with World App** - Authenticate using MiniKit
2. **Upload photos** - Gallery or camera capture
3. **View photos** - Click to open lightbox with share/download
4. **Check transactions** - Click transaction ID for Solana explorer

## 🔧 API Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/upload` | POST | Upload photo to Irys | `FormData` with file |
| `/api/check-wallet` | GET | Check wallet balance | None |
| `/api/fund-account` | POST | Fund Irys account | `{ amount: number }` |
| `/api/faucet` | POST | Disabled (mainnet) | None |
| `/api/nonce` | GET | Generate SIWE nonce | None |
| `/api/complete-siwe` | POST | Verify SIWE signature | `{ payload, nonce }` |
| `/api/verify` | POST | Verify World ID proof | `{ payload, action, signal }` |
| `/api/photos` | GET | Get user's photos from KV | `x-user-address` header |
| `/api/photos` | POST | Save photo to KV | `{ photo data }` + `x-user-address` header |
| `/api/photos` | PUT | Update user profile | `{ username }` + `x-user-address` header |
| `/api/photos/[id]` | DELETE | Delete photo from KV | `x-user-address` header |

## 🛠️ Development

### Project Structure
```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── upload/            # Photo upload endpoint
│   │   ├── check-wallet/      # Wallet balance check
│   │   ├── fund-account/      # Fund Irys account
│   │   ├── nonce/             # SIWE nonce generation
│   │   ├── complete-siwe/     # SIWE verification
│   │   ├── verify/            # World ID verification
│   │   └── photos/            # Photo CRUD operations with KV
│   ├── upload/                # Upload page
│   ├── layout.tsx             # Root layout with MiniKit provider
│   └── page.tsx               # Landing page
├── components/
│   ├── PhotoUpload.tsx        # Upload interface with camera/gallery
│   ├── PhotoGallery.tsx       # Photo grid with lightbox
│   ├── WalletAuthButton.tsx   # World App authentication
│   └── Navigation.tsx         # Header navigation
├── lib/
│   └── kv.ts                  # Cloudflare KV utility functions
└── providers/
    └── minikit-provider.tsx   # MiniKit initialization
```

### Key Technologies
- **Next.js 15** - React framework with App Router
- **Irys** - Decentralized storage on Solana mainnet
- **World ID MiniKit** - Authentication and user management
- **Cloudflare KV** - Persistent photo storage and user profiles
- **Tailwind CSS 4** - Modern styling
- **TypeScript** - Type safety

### Authentication Flow
1. User clicks "Sign in with Wallet"
2. MiniKit generates SIWE message with nonce
3. User signs message in World App
4. Backend verifies signature via `/api/complete-siwe`
5. User data stored in localStorage

### Upload Flow
1. User selects image (gallery or camera)
2. Image preview with file validation (10MB limit)
3. Upload to `/api/upload` with progress tracking
4. Irys uploader processes on Solana mainnet
5. Transaction ID and gateway URL returned
6. Photo metadata saved to Cloudflare KV
7. Gallery refreshed with persistent storage

### Component Architecture

#### PhotoUpload Component
- File selection (gallery/camera)
- Image preview with validation
- Upload progress tracking
- Error handling with retry

#### PhotoGallery Component
- Grid layout with loading states
- Lightbox modal with share/download
- Image error handling and retry
- Transaction explorer integration

#### WalletAuthButton Component
- MiniKit integration
- SIWE message generation
- Backend verification
- Username extraction

### State Management
- Local state with React hooks
- localStorage for user session persistence
- Cloudflare KV for photo metadata persistence
- No external state management library

## 🔍 Debugging

### Check Wallet Status
```bash
curl http://localhost:3000/api/check-wallet
```

### View Console Logs
- Upload progress and errors
- Image loading status
- Transaction details
- MiniKit initialization

### Common Issues

#### Upload Failures
- **Insufficient SOL**: Check balance via `/api/check-wallet`
- **Network errors**: Verify Solana mainnet connection
- **File size**: Ensure images are under 10MB

#### Authentication Issues
- **MiniKit not available**: Check World App installation
- **SIWE verification failed**: Verify nonce and signature
- **Username not found**: Check MiniKit user object

#### Image Loading
- **Black thumbnails**: Check Irys gateway URL format
- **Loading states**: Images may take time to propagate
- **CORS errors**: Verify gateway configuration

### Development Tools
- **Turbopack**: Enabled for faster builds
- **ESLint**: Code quality and consistency
- **TypeScript**: Type checking and IntelliSense

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel with environment variables
```

### Environment Variables for Production
```bash
# Required
SOLANA_PRIVATE_KEY=your_solana_private_key_here
WLD_APP_ID=app_your_app_id_here
NEXT_PUBLIC_WLD_ACTION_ID=your_action_id_here
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here
CLOUDFLARE_KV_NAMESPACE_ID=your_kv_namespace_id_here
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here

# Optional
NEXT_PUBLIC_WLD_SIGNAL=
NEXT_PUBLIC_WLD_VERIFICATION_LEVEL=Orb
NEXT_PUBLIC_IRYS_GATEWAY=https://gateway.irys.xyz
```

### Build Configuration
- **Next.js 15**: App Router with Turbopack
- **TypeScript**: Strict mode enabled
- **Tailwind CSS 4**: PostCSS configuration
- **ESLint**: Next.js recommended rules

## 📚 Resources

- [Irys Documentation](https://docs.irys.xyz/)
- [Solana Mainnet](https://docs.solana.com/clusters)
- [World ID MiniKit](https://developer.worldcoin.org/minikit)
- [Cloudflare KV](https://developers.cloudflare.com/kv/)
- [Next.js 15 App Router](https://nextjs.org/docs/app)

## 🤝 Contributing

1. Fork the [repository](https://github.com/0xdevrel/irysXworld)
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes with proper TypeScript types
4. Test thoroughly (upload, authentication, gallery)
5. Submit PR with clear description

### Development Guidelines
- Use TypeScript for all new code
- Follow existing component patterns
- Add proper error handling
- Test on both desktop and mobile
- Verify World App integration

### Repository
- **GitHub**: [https://github.com/0xdevrel/irysXworld](https://github.com/0xdevrel/irysXworld)
- **Description**: Irys upload proof of concept with World ID integration
- **Language**: TypeScript (95.5%), CSS (3.4%), JavaScript (1.1%)

## 📄 License

MIT License - see LICENSE file for details
