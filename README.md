# Photobooth - Onchain Photo Storage

A Next.js app that uploads photos to Irys using Solana devnet. Built with World ID verification and modern UI.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Solana wallet with devnet SOL

### Installation

```bash
# Clone and install
git clone <your-repo>
cd irys
npm install

# Set up environment
cp env.example .env.local
```

### Environment Setup

Create `.env.local` with:

```bash
# World ID (optional for testing)
WLD_APP_ID=app_your_app_id_here
NEXT_PUBLIC_WLD_ACTION_ID=your_action_id_here
NEXT_PUBLIC_WLD_SIGNAL=
NEXT_PUBLIC_WLD_VERIFICATION_LEVEL=Orb

# Solana Configuration (required)
SOLANA_PRIVATE_KEY=your_solana_private_key_here
SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_IRYS_GATEWAY=https://gateway.irys.xyz
```

### Get Solana Private Key

1. **Generate new wallet**: Use Solana CLI or any wallet
2. **Export private key**: Get base58 encoded private key
3. **Add to .env.local**: `SOLANA_PRIVATE_KEY=your_key_here`

### Get Devnet SOL

```bash
# Start the app
npm run dev

# Get SOL from faucet
curl -X POST http://localhost:3001/api/faucet
```

Or visit: `http://localhost:3001/api/faucet`

### Run the App

```bash
npm run dev
```

Visit `http://localhost:3001`

## 📸 Usage

1. **Verify with World ID** (or skip for testing)
2. **Upload photos** - Drag & drop or camera
3. **View on Irys** - Click images to open gateway
4. **Check transactions** - Click transaction ID for explorer

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload photo to Irys |
| `/api/check-wallet` | GET | Check wallet balance |
| `/api/faucet` | POST | Get devnet SOL |
| `/api/fund-account` | POST | Fund Irys account |

## 🛠️ Development

### Project Structure
```
src/
├── app/
│   ├── api/           # API routes
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main page
├── components/        # React components
└── providers/         # Context providers
```

### Key Technologies
- **Next.js 15** - React framework
- **Irys** - Decentralized storage
- **Solana** - Blockchain (devnet)
- **World ID** - Identity verification
- **Tailwind CSS** - Styling

### Upload Flow
1. User selects image
2. Image uploaded to Irys via Solana devnet
3. Transaction ID and gateway URL returned
4. Image displayed in gallery with retry mechanism

## 🔍 Debugging

### Check Wallet
```bash
curl http://localhost:3001/api/check-wallet
```

### View Console Logs
- Upload progress and errors
- Image loading status
- Transaction details

### Common Issues
- **Black thumbnails**: Check console for image loading errors
- **Upload failures**: Verify SOL balance and network connection
- **CORS errors**: Check Irys gateway URL format

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel with environment variables
```

### Environment Variables for Production
- `SOLANA_PRIVATE_KEY` - Your Solana private key
- `SOLANA_RPC_URL` - Solana RPC endpoint
- World ID credentials (if using verification)

## 📚 Resources

- [Irys Documentation](https://docs.irys.xyz/)
- [Solana Devnet](https://docs.solana.com/clusters)
- [World ID](https://developer.worldcoin.org/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit PR

## 📄 License

MIT License - see LICENSE file for details
