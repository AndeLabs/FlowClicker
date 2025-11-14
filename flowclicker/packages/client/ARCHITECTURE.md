# FlowClicker Frontend Architecture

## 🎯 Arquitectura Modular para Gaming en Vercel

### Stack Tecnológico
- **Framework**: React 19 + Vite 4 (optimizado para SPAs de alta interactividad)
- **Styling**: Tailwind CSS v4 (CSS-first configuration)
- **Animations**: Framer Motion + CSS Animations
- **3D Effects**: React Three Fiber (solo para efectos sutiles, no el juego completo)
- **Particles**: tsparticles (ligero y performante)
- **Web3**: MUD SDK + viem
- **Deployment**: Vercel (auto-deploy desde GitHub)

### 📁 Estructura de Directorios

```
packages/client/src/
├── components/              # Componentes modulares reutilizables
│   ├── ui/                 # UI primitives (buttons, cards, etc.)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Progress.tsx
│   │   └── Badge.tsx
│   │
│   ├── game/               # Componentes específicos del juego
│   │   ├── ClickButton/    # Botón principal de click
│   │   │   ├── index.tsx
│   │   │   ├── animations.ts
│   │   │   └── effects.ts
│   │   ├── TokenCounter/   # Contador de tokens animado
│   │   ├── TrustScore/     # Indicador de trust score
│   │   └── RewardDisplay/  # Display de recompensas
│   │
│   ├── leaderboard/        # Sistema de leaderboards
│   │   ├── PlayerBoard.tsx
│   │   ├── CountryBoard.tsx
│   │   └── GlobalStats.tsx
│   │
│   ├── web3/               # Componentes Web3
│   │   ├── ConnectWallet.tsx
│   │   ├── NetworkStatus.tsx
│   │   └── TransactionToast.tsx
│   │
│   └── effects/            # Efectos visuales
│       ├── ParticleSystem.tsx
│       ├── FloatingNumbers.tsx
│       └── GlowEffect.tsx
│
├── hooks/                  # Custom React hooks
│   ├── game/
│   │   ├── useClick.ts          # Handle click logic
│   │   ├── useRewards.ts        # Track rewards
│   │   └── useGameState.ts      # Game state management
│   │
│   ├── web3/
│   │   ├── useMUD.ts            # MUD SDK integration
│   │   ├── usePlayer.ts         # Player data from contract
│   │   ├── useLeaderboard.ts    # Leaderboard data
│   │   └── useGlobalState.ts    # Global game state
│   │
│   └── ui/
│       ├── useAnimations.ts
│       └── useSound.ts
│
├── lib/                    # Utilities & helpers
│   ├── utils.ts            # General utilities
│   ├── cn.ts               # className merger (tailwind-merge)
│   ├── constants.ts        # Game constants
│   ├── formatters.ts       # Number/date formatters
│   └── validators.ts       # Input validators
│
├── services/               # Business logic layer
│   ├── game/
│   │   ├── clickHandler.ts     # Click processing logic
│   │   ├── rewardCalculator.ts # Reward calculations
│   │   └── antiBotValidator.ts # Client-side anti-bot
│   │
│   └── web3/
│       ├── mudService.ts       # MUD interactions
│       └── contractHelpers.ts  # Contract helpers
│
├── stores/                 # State management (if needed)
│   ├── gameStore.ts        # Game state (Zustand/Jotai)
│   └── uiStore.ts          # UI state
│
├── types/                  # TypeScript definitions
│   ├── game.ts
│   ├── leaderboard.ts
│   └── web3.ts
│
├── styles/                 # Global styles
│   ├── globals.css         # Tailwind + custom CSS
│   └── animations.css      # Custom animations
│
├── assets/                 # Static assets
│   ├── sounds/
│   └── images/
│
├── mud/                    # MUD SDK (existing)
│   ├── setup.ts
│   ├── setupNetwork.ts
│   ├── createSystemCalls.ts
│   └── ...
│
└── App.tsx                 # Main app component

```

### 🏗️ Capas de la Arquitectura

#### 1. **Presentation Layer** (Components)
- Componentes React puros
- Solo se encargan de renderizar
- Reciben datos via props
- Emiten eventos via callbacks

#### 2. **Logic Layer** (Hooks + Services)
- Custom hooks encapsulan lógica compleja
- Services contienen business logic pura
- Separación entre UI logic y game logic

#### 3. **Data Layer** (MUD SDK + Stores)
- MUD SDK maneja sincronización con blockchain
- Stores locales para estado UI transitorio
- React Query para caching (si es necesario)

#### 4. **Effects Layer** (Animations + Particles)
- Framer Motion para animaciones de UI
- Canvas API para efectos visuales ligeros
- React Three Fiber solo para background effects

### 🎮 Flujo de Datos

```
User Click
    ↓
ClickButton Component
    ↓
useClick Hook
    ↓
clickHandler Service
    ↓
MUD System Call (flowclicker__click)
    ↓
Smart Contract (ClickSystem.sol)
    ↓
MUD Store Update
    ↓
React Component Re-render
    ↓
Visual Feedback (particles, counter animation)
```

### 🚀 Optimizaciones de Performance

1. **Code Splitting**
   - Lazy load leaderboards
   - Lazy load Web3 components
   - Dynamic imports para efectos pesados

2. **Memoization**
   - React.memo para componentes pesados
   - useMemo/useCallback donde corresponda
   - Virtualization para listas largas

3. **Asset Optimization**
   - SVGs en lugar de PNGs
   - WebP para imágenes
   - Sprite sheets para animaciones

4. **Bundle Optimization**
   - Tree shaking automático (Vite)
   - CSS purging (Tailwind)
   - Minimal external dependencies

### 🎨 Sistema de Diseño

**Theme System** (Tailwind CSS v4)
```css
@theme {
  --color-primary: #8b5cf6;      /* Purple */
  --color-secondary: #3b82f6;    /* Blue */
  --color-success: #10b981;      /* Green */
  --color-danger: #ef4444;       /* Red */
  --color-bg-game: #0f172a;      /* Dark slate */
  --color-bg-card: #1e293b;      /* Slate */
}
```

**Component Variants** (CVA - Class Variance Authority)
- Consistent styling across components
- Type-safe variant props
- Easy theme switching

### 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-optimized for mobile gaming
- Adaptive UI based on device capabilities

### 🔒 Web3 UX Best Practices

1. **Progressive Enhancement**
   - Game funciona sin wallet (modo demo)
   - Connect wallet solo cuando sea necesario
   - Clear feedback en transacciones

2. **Error Handling**
   - User-friendly error messages
   - Retry mechanisms
   - Fallback states

3. **Loading States**
   - Skeleton screens
   - Optimistic UI updates
   - Progress indicators

### 🚀 Vercel Deployment

**Configuración Óptima**:
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "pnpm install"
}
```

**Features Aprovechadas**:
- ✅ Git-based deployment (auto-deploy on push)
- ✅ Preview deployments (para cada PR)
- ✅ Edge Network (CDN global)
- ✅ Analytics integration
- ✅ Custom domains

### 📊 Metrics & Monitoring

- Web Vitals tracking (LCP, FID, CLS)
- User engagement metrics
- Click rate monitoring
- Error tracking (Sentry integration optional)

### 🎯 Performance Targets

- **FCP** (First Contentful Paint): < 1.5s
- **LCP** (Largest Contentful Paint): < 2.5s
- **TTI** (Time to Interactive): < 3.5s
- **Bundle Size**: < 500KB (gzipped)
- **Click Response**: < 16ms (60 FPS)

---

## 🛠️ Desarrollo

### Quick Start
```bash
# Development
pnpm dev:client

# Build
pnpm build

# Preview
pnpm preview
```

### Testing
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e
```

---

**Autor**: Claude AI
**Fecha**: 2025-11-14
**Versión**: 1.0
