# FlowClicker Frontend

Modern, scalable frontend for FlowClicker - the full onchain clicker game on ANDE Network.

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/FlowClicker-dojo&project-name=flowclicker&root-directory=flowclicker/packages/client)

### Option 1: Deploy from GitHub (Recommended)

1. **Fork/Clone this repository**
2. **Push to your GitHub**
3. **Go to [Vercel](https://vercel.com)**
4. **Click "Add New Project"**
5. **Import your GitHub repository**
6. **Configure**:
   - Framework Preset: `Vite`
   - Root Directory: `flowclicker/packages/client`
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
7. **Add Environment Variables**:
   ```
   VITE_CHAIN_ID=6174
   VITE_RPC_URL=https://rpc.ande.network
   VITE_WORLD_ADDRESS=<your_deployed_world_address>
   ```
8. **Deploy!**

Changes pushed to `main` branch will auto-deploy.

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
cd flowclicker/packages/client
vercel --prod
```

## 🏗️ Architecture

Built with modern, production-ready technologies:

### Tech Stack
- **React 19** - Latest React with improved performance
- **TypeScript 5.8+** - Type safety
- **Vite 4** - Lightning-fast HMR and builds
- **Tailwind CSS v4** - CSS-first configuration
- **Framer Motion** - Smooth animations
- **React Three Fiber** - 3D effects
- **tsparticles** - Particle effects
- **MUD SDK 2.2.23** - Web3 integration

### Features
✅ Modular component architecture
✅ Optimized for Vercel Edge Network
✅ Auto-scaling and CDN
✅ TypeScript for type safety
✅ Responsive design (mobile-first)
✅ Web3 wallet integration
✅ Real-time leaderboards
✅ Smooth animations and effects
✅ Anti-bot client validation
✅ Progressive Web App ready

## 📁 Project Structure

```
src/
├── components/       # Modular UI components
│   ├── ui/          # Base UI primitives
│   ├── game/        # Game-specific components
│   ├── leaderboard/ # Leaderboard components
│   ├── web3/        # Web3 components
│   └── effects/     # Visual effects
├── hooks/           # Custom React hooks
├── lib/             # Utilities & helpers
├── services/        # Business logic layer
├── types/           # TypeScript definitions
├── styles/          # Global styles
└── mud/             # MUD SDK integration
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture docs.

## 🛠️ Development

### Prerequisites
- Node.js 20+ or 22+
- pnpm 9+ or 10+

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Environment Variables

Create `.env` file:

```env
# Required
VITE_CHAIN_ID=6174
VITE_RPC_URL=https://rpc.ande.network
VITE_WORLD_ADDRESS=<your_deployed_world_address>

# Optional
VITE_ENABLE_DEV_TOOLS=true
VITE_ANALYTICS_ID=<your_analytics_id>
```

## 🎮 Game Features

### Core Gameplay
- **Click-to-Mint**: Each valid click mints $FLOW tokens instantly
- **Temporal Decay**: Rewards decrease over 3 years (0.01 → 0.0005 FLOW)
- **Anti-Bot System**: Multi-layer bot detection
- **Trust Score**: Player reputation system (0-1000)
- **Global Competition**: Country leaderboards

### UI/UX Highlights
- Smooth animations on every click
- Particle effects for visual feedback
- Real-time token counter
- Trust score visualization
- Responsive mobile design
- Dark gaming theme
- Web3 wallet integration (simplified UX)

## 📊 Performance

### Optimization Features
- ✅ Code splitting & lazy loading
- ✅ Tree shaking (Vite)
- ✅ CSS purging (Tailwind)
- ✅ Asset optimization
- ✅ Memoization strategies
- ✅ Minimal bundle size

### Performance Targets
- **FCP** < 1.5s
- **LCP** < 2.5s
- **TTI** < 3.5s
- **Bundle** < 500KB (gzipped)

## 🔐 Security

- Client-side anti-bot validation
- Rate limiting
- Trust score tracking
- Secure Web3 integration
- No sensitive data in frontend

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- [Documentation](./ARCHITECTURE.md)
- [Issues](https://github.com/YOUR_USERNAME/FlowClicker-dojo/issues)
- [Discord](#)

---

Built with ❤️ using MUD Framework on ANDE Network
