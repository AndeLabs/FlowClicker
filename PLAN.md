# FlowClicker - Plan de Desarrollo Full Onchain con Dojo

## 1. VISIÓN DEL PROYECTO

### 1.1 Concepto
FlowClicker es un juego clicker profesional **full onchain** construido con Dojo Engine sobre Starknet, que combina:
- Mecánicas de clicker adictivas con economía tokenizada ($FLOW)
- Sistema de decaimiento temporal (3 años) que incentiva participación temprana
- Competición global por países con rankings en tiempo real
- Seguridad anti-bot de nivel profesional inspirada en popcat.click
- Experiencia de usuario Web3 sin fricción

### 1.2 Objetivos Clave
1. **Juego Full Onchain**: Toda la lógica de juego verificable en blockchain
2. **UX de Primera**: Ocultar la complejidad blockchain al usuario
3. **Anti-Bot Robusto**: Sistema multi-capa de detección y prevención
4. **Escalabilidad**: Soportar millones de jugadores concurrentes
5. **Economía Sostenible**: Sistema de recompensas equilibrado a 3 años

---

## 2. ARQUITECTURA TÉCNICA ONCHAIN (DOJO)

### 2.1 Arquitectura ECS (Entity-Component-System)

#### **Entidades Principales**
- **Player**: Jugadores individuales
- **Country**: Países en competición
- **GlobalState**: Estado global del juego
- **Session**: Sesiones de juego activas

#### **Models (Componentes de Datos)**

```cairo
// Player Model
#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct Player {
    #[key]
    pub wallet: ContractAddress,
    pub total_clicks: u256,
    pub session_clicks: u32,
    pub country_code: felt252,
    pub last_click_timestamp: u64,
    pub sequential_max_clicks: u8,
    pub is_bot_flagged: bool,
    pub trust_score: u16,
    pub total_rewards: u256,
    pub last_reward_claim: u64,
}

// Country Rankings Model
#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct Country {
    #[key]
    pub country_code: felt252,
    pub total_clicks: u256,
    pub player_count: u32,
    pub average_clicks_per_player: u64,
    pub rank: u16,
}

// Global State Model
#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct GlobalState {
    #[key]
    pub id: u8, // Singleton pattern (id = 0)
    pub total_clicks: u256,
    pub total_players: u32,
    pub start_timestamp: u64,
    pub current_reward_rate: u256,
    pub total_rewards_distributed: u256,
}

// Click Session Model (Anti-Bot)
#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct ClickSession {
    #[key]
    pub wallet: ContractAddress,
    #[key]
    pub session_start: u64,
    pub clicks_in_session: u32,
    pub session_duration: u64,
    pub click_pattern_hash: felt252,
    pub is_valid: bool,
}

// Reward Decay Model
#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct RewardConfig {
    #[key]
    pub id: u8,
    pub initial_rate: u256,      // Recompensa inicial por click
    pub final_rate: u256,         // Recompensa final (3 años después)
    pub decay_start: u64,         // Timestamp de inicio
    pub decay_end: u64,           // Timestamp de fin (3 años)
    pub decay_curve: u8,          // Tipo de curva (1=lineal, 2=exponencial)
}
```

#### **Systems (Lógica de Negocio)**

```cairo
// 1. Click System
#[dojo::contract]
mod click_system {
    fn execute_click(
        ref world: IWorldDispatcher,
        wallet: ContractAddress,
        timestamp: u64,
        client_signature: felt252
    ) -> bool {
        // 1. Validar anti-bot
        // 2. Actualizar contador del jugador
        // 3. Actualizar contador del país
        // 4. Actualizar estado global
        // 5. Emitir evento
    }
}

// 2. Anti-Bot Validation System
#[dojo::contract]
mod anti_bot_system {
    fn validate_click(
        ref world: IWorldDispatcher,
        wallet: ContractAddress,
        timestamp: u64,
        pattern_data: felt252
    ) -> (bool, u16) {
        // Retorna (es_válido, nuevo_trust_score)
        // Implementa múltiples capas de validación
    }
}

// 3. Reward Distribution System
#[dojo::contract]
mod reward_system {
    fn calculate_reward(
        ref world: IWorldDispatcher,
        clicks: u32,
        timestamp: u64
    ) -> u256 {
        // Calcula recompensa con decaimiento temporal
    }

    fn claim_rewards(
        ref world: IWorldDispatcher,
        wallet: ContractAddress
    ) -> u256 {
        // Distribuye tokens $FLOW
    }
}

// 4. Ranking System
#[dojo::contract]
mod ranking_system {
    fn update_rankings(
        ref world: IWorldDispatcher
    ) {
        // Actualiza rankings de países en tiempo real
    }
}
```

### 2.2 World Contract Configuration

```toml
# dojo_config.toml
[world]
name = "FlowClickerWorld"
description = "Full onchain clicker game on Starknet"

[[systems]]
name = "click_system"
write_access = ["Player", "Country", "GlobalState", "ClickSession"]

[[systems]]
name = "anti_bot_system"
write_access = ["Player", "ClickSession"]

[[systems]]
name = "reward_system"
write_access = ["Player", "GlobalState"]

[[systems]]
name = "ranking_system"
write_access = ["Country"]
```

---

## 3. SISTEMA ANTI-BOT MULTI-CAPA

### 3.1 Inspiración de Popcat.click

Análisis de popcat.click:
- **Rate Limiting**: Máximo 800 clicks/30 segundos
- **Sequential Detection**: Flag después de 11 sesiones consecutivas máximas
- **Client-Side Validation**: Patrones de click validados
- **Server-Side Protection**: 429 Too Many Requests por IP
- **Visual Feedback**: Ojos rojos cuando se detecta bot

### 3.2 Sistema Anti-Bot Mejorado (Onchain + Offchain)

#### **Capa 1: Client-Side (Offchain - Preventivo)**

```typescript
// services/antiBotClient.ts
class AntiBotClient {
  private clickTimestamps: number[] = [];
  private mouseMovements: { x: number; y: number; t: number }[] = [];

  validateClick(): { valid: boolean; signature: string } {
    const now = Date.now();

    // 1. Rate limiting local
    const last30s = this.clickTimestamps.filter(t => now - t < 30000);
    if (last30s.length >= 800) {
      return { valid: false, signature: '' };
    }

    // 2. Validar variabilidad de intervalos
    const variance = this.calculateClickVariance();
    if (variance < 0.05) { // Clicks demasiado uniformes = bot
      return { valid: false, signature: '' };
    }

    // 3. Validar movimiento del mouse
    if (!this.hasRecentMouseMovement(500)) {
      return { valid: false, signature: '' };
    }

    // 4. Generar firma cliente
    const signature = this.generateClickSignature(now);

    this.clickTimestamps.push(now);
    return { valid: true, signature };
  }

  private generateClickSignature(timestamp: number): string {
    // Combina: timestamp + movimientos de mouse + intervalos
    const data = {
      ts: timestamp,
      variance: this.calculateClickVariance(),
      mouseHash: this.hashMouseMovements(),
    };
    return createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }
}
```

#### **Capa 2: Smart Contract (Onchain - Definitivo)**

```cairo
// contracts/src/systems/anti_bot.cairo
fn validate_click(
    ref world: IWorldDispatcher,
    wallet: ContractAddress,
    timestamp: u64,
    client_signature: felt252
) -> (bool, u16) {
    let mut player = get!(world, wallet, Player);
    let mut session = get!(world, (wallet, timestamp / 30), ClickSession);

    // 1. Rate limiting (800 clicks/30s)
    if session.clicks_in_session >= 800 {
        player.sequential_max_clicks += 1;
        if player.sequential_max_clicks >= 11 {
            player.is_bot_flagged = true;
            player.trust_score = 0;
            return (false, 0);
        }
    }

    // 2. Validar intervalo entre clicks
    let interval = timestamp - player.last_click_timestamp;
    if interval < 50 { // < 50ms es sospechoso
        player.trust_score = player.trust_score.saturating_sub(10);
    }

    // 3. Validar firma del cliente
    if !verify_click_signature(client_signature, timestamp, wallet) {
        player.trust_score = player.trust_score.saturating_sub(50);
    }

    // 4. Actualizar trust score (máximo 1000)
    if player.trust_score > 800 {
        player.trust_score = min(player.trust_score + 1, 1000);
    }

    // 5. Determinar si el click es válido
    let is_valid = !player.is_bot_flagged && player.trust_score > 300;

    set!(world, (player, session));
    (is_valid, player.trust_score)
}
```

#### **Capa 3: Torii Indexer (Analytics)**

```typescript
// backend/analytics/botDetection.ts
class BotDetectionAnalytics {
  async analyzePlayerBehavior(wallet: string): Promise<BotScore> {
    // 1. Análisis de patrones a largo plazo
    const clickHistory = await this.getClickHistory(wallet, 7); // 7 días

    // 2. Machine Learning: detectar anomalías
    const anomalyScore = await this.mlAnomalyDetection(clickHistory);

    // 3. Correlación con otros jugadores
    const collusion = await this.detectCollusionPatterns(wallet);

    // 4. Validación de metadata (User-Agent, IP, etc.)
    const metaScore = await this.validateMetadata(wallet);

    return {
      botProbability: (anomalyScore + collusion + metaScore) / 3,
      shouldFlag: anomalyScore > 0.8,
      confidence: 0.95,
    };
  }
}
```

### 3.3 Sistema de Trust Score

- **Trust Score inicial**: 500/1000
- **Aumenta con**: Clicks válidos, variabilidad natural, sesiones largas
- **Disminuye con**: Patrones sospechosos, rate limiting, firmas inválidas
- **Threshold**: < 300 = clicks no cuentan, < 100 = ban permanente

---

## 4. SISTEMA DE DECAIMIENTO TEMPORAL (3 AÑOS)

### 4.1 Fórmula de Decaimiento

```cairo
// Decaimiento exponencial suave
fn calculate_reward_rate(current_timestamp: u64, config: RewardConfig) -> u256 {
    let elapsed = current_timestamp - config.decay_start;
    let total_duration = config.decay_end - config.decay_start;

    if elapsed >= total_duration {
        return config.final_rate;
    }

    // Curva exponencial: rate = initial * e^(-k*t)
    // donde k se ajusta para llegar a final_rate en 3 años
    let decay_factor = (elapsed * 1000) / total_duration; // 0-1000
    let current_rate = config.initial_rate
        - ((config.initial_rate - config.final_rate) * decay_factor) / 1000;

    current_rate
}
```

### 4.2 Configuración de Ejemplo

```
Año 1: 100 $FLOW por 1000 clicks
Año 2: 40 $FLOW por 1000 clicks
Año 3: 10 $FLOW por 1000 clicks
Post-3 años: 5 $FLOW por 1000 clicks (sostenible a largo plazo)
```

### 4.3 Incentivos de Participación Temprana

- **Early Bird Bonus**: Primeros 10,000 jugadores reciben NFT único
- **Country Pioneer**: Primer jugador de cada país recibe multiplicador 2x permanente
- **Milestone Rewards**: Rewards extras en hitos globales (1M, 10M, 100M clicks)

---

## 5. STACK TECNOLÓGICO MODERNO

### 5.1 Backend / Blockchain

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| **Blockchain** | Starknet | Pruebas ZK, bajo costo, alta velocidad |
| **Smart Contracts** | Cairo 2.x | Lenguaje nativo de Starknet |
| **Game Engine** | Dojo 1.0+ | ECS framework optimizado para juegos |
| **Sequencer (Dev)** | Katana | Desarrollo local rápido |
| **Indexer** | Torii | GraphQL/gRPC automático de modelos |
| **CLI** | Sozo | Deploy y gestión de contratos |

### 5.2 Frontend

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| **Framework** | Next.js 15+ (App Router) | SSR, SEO, performance |
| **Language** | TypeScript 5.8+ | Type safety, DX mejorado |
| **UI Library** | Shadcn/UI + Radix UI | Componentes accesibles y customizables |
| **Styling** | Tailwind CSS v4 | Utility-first, performance |
| **Animations** | Framer Motion | Animaciones fluidas y profesionales |
| **3D/Canvas** | Three.js + React Three Fiber | Efectos visuales premium |
| **State Management** | Zustand | Simple, performante, React 19 compatible |
| **Dojo SDK** | @dojoengine/sdk 1.6+ | Integración con Starknet/Dojo |
| **Wallet** | @starknet-react/core | Wallet connection |

### 5.3 Backend / APIs

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| **API Framework** | Hono (Edge Runtime) | Ultra rápido, moderno |
| **Database** | PostgreSQL + Prisma | Datos analíticos y cache |
| **Cache** | Redis | Session storage, rate limiting |
| **Analytics** | Custom + Torii GraphQL | Tracking onchain/offchain |
| **Monitoring** | Sentry + Datadog | Error tracking, performance |

### 5.4 Infraestructura

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| **Hosting Frontend** | Vercel | Edge network, Next.js optimizado |
| **Hosting Backend** | Railway / Fly.io | Deploy fácil, escalable |
| **CDN** | Cloudflare | DDoS protection, speed |
| **Domain/DNS** | Cloudflare DNS | Rápido, seguro |
| **CI/CD** | GitHub Actions | Automatización completa |
| **Containerization** | Docker | Reproducibilidad |

---

## 6. DISEÑO UI/UX PROFESIONAL

### 6.1 Principios de Diseño

1. **Ocultar Web3**: Usuario no debe ver wallets, gas fees, transacciones hasta que sea necesario
2. **Feedback Inmediato**: Cada click debe tener respuesta visual/audio instantánea
3. **Gamificación**: Achievements, leaderboards, country pride
4. **Accesibilidad**: WCAG 2.1 AA compliant
5. **Mobile-First**: 70% de usuarios en mobile

### 6.2 Componentes Clave

#### **Landing Page**

```
┌─────────────────────────────────────────┐
│  FLOWCLICKER                  [Connect] │
├─────────────────────────────────────────┤
│                                         │
│         🐱 CLICK TO EARN $FLOW          │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │     [  ANIMATED CLICK AREA  ]    │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Your Clicks: 1,234 | $FLOW: 12.34     │
│                                         │
│  🌍 Country: USA | Rank: #12           │
│                                         │
├─────────────────────────────────────────┤
│  GLOBAL LEADERBOARD                     │
│  1. 🇺🇸 USA        12.4B clicks         │
│  2. 🇨🇳 China      10.2B clicks         │
│  3. 🇮🇳 India       8.1B clicks         │
└─────────────────────────────────────────┘
```

#### **Animaciones Premium**

```typescript
// Particle system para cada click
import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

function ClickParticles({ clicks }) {
  return (
    <Canvas>
      <Points positions={generateParticlePositions(clicks)}>
        <PointMaterial
          transparent
          color="#FFD700"
          size={0.5}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </Canvas>
  );
}
```

#### **Sonido Premium**

- Click sound con variación de pitch (evitar monotonía)
- Sonidos especiales para milestones (100, 1000, 10000 clicks)
- Música ambiente opcional (toggle)
- Feedback háptico en mobile

### 6.3 Temas

```typescript
// Dark mode por defecto (gaming standard)
const theme = {
  colors: {
    primary: '#00D4FF',      // Cyan eléctrico
    secondary: '#FF00E5',    // Magenta
    background: '#0A0E1A',   // Azul oscuro profundo
    surface: '#151B2E',      // Superficie elevada
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    success: '#00FF88',
    warning: '#FFB800',
    error: '#FF0055',
  },
  effects: {
    glow: '0 0 20px rgba(0, 212, 255, 0.5)',
    blur: 'backdrop-blur(10px)',
  },
};
```

---

## 7. ARQUITECTURA DE SISTEMA COMPLETA

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Next.js 15 (App Router) + TypeScript + Tailwind        │ │
│  │ - React Three Fiber (3D effects)                        │ │
│  │ - Framer Motion (animations)                            │ │
│  │ - Shadcn/UI components                                  │ │
│  │ - Zustand (state)                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ @dojoengine/sdk (React hooks + Zustand integration)    │ │
│  │ - useEntityQuery                                        │ │
│  │ - useModels                                             │ │
│  │ - Optimistic rendering                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DOJO INFRASTRUCTURE                       │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │    Torii     │◄───│     Katana   │◄───│     Sozo     │  │
│  │  (Indexer)   │    │ (Sequencer)  │    │    (CLI)     │  │
│  │              │    │              │    │              │  │
│  │  - GraphQL   │    │  - Local dev │    │  - Deploy    │  │
│  │  - gRPC      │    │  - Fast      │    │  - Migrate   │  │
│  │  - WebSocket │    │              │    │  - Test      │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                     │                              │
│         └─────────┬───────────┘                              │
│                   ↓                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               WORLD CONTRACT (Dojo)                     │ │
│  │                                                          │ │
│  │  Systems:              Models:                          │ │
│  │  - ClickSystem         - Player                         │ │
│  │  - AntiBotSystem       - Country                        │ │
│  │  - RewardSystem        - GlobalState                    │ │
│  │  - RankingSystem       - ClickSession                   │ │
│  │                        - RewardConfig                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       STARKNET L2                            │
│  - ZK Proofs                                                 │
│  - Low gas fees                                              │
│  - High throughput                                           │
│  - Security from Ethereum L1                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      ETHEREUM L1                             │
│  - Final settlement                                          │
│  - Security layer                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  BACKEND ANALYTICS (Opcional)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Hono API (Edge Runtime)                                 │ │
│  │ - Bot detection ML                                      │ │
│  │ - Analytics agregados                                   │ │
│  │ - Leaderboards cache                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ PostgreSQL + Redis                                      │ │
│  │ - Analytics DB                                          │ │
│  │ - Session cache                                         │ │
│  │ - Rate limiting                                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. PLAN DE DESARROLLO (ROADMAP)

### **FASE 1: Fundación (Semanas 1-3)**

#### Semana 1: Setup y Arquitectura Base
- [ ] Instalar Dojo toolchain (dojoup)
- [ ] Inicializar proyecto Dojo con sozo
- [ ] Setup repositorio Git con estructura modular
- [ ] Configurar Katana para desarrollo local
- [ ] Definir todos los Models en Cairo
- [ ] Setup proyecto Next.js 15 con TypeScript
- [ ] Configurar Tailwind CSS v4 + Shadcn/UI
- [ ] Integrar @dojoengine/sdk

#### Semana 2: Smart Contracts Core
- [ ] Implementar Models (Player, Country, GlobalState, etc.)
- [ ] Implementar ClickSystem básico
- [ ] Implementar RewardSystem con decaimiento temporal
- [ ] Implementar RankingSystem
- [ ] Tests unitarios de sistemas (Cairo tests)
- [ ] Deploy a Katana local
- [ ] Configurar Torii indexer

#### Semana 3: Frontend Base
- [ ] Diseño UI/UX en Figma (opcional pero recomendado)
- [ ] Implementar landing page
- [ ] Crear componente principal de Click
- [ ] Integración con Dojo SDK (useEntityQuery, useModels)
- [ ] Wallet connection (@starknet-react/core)
- [ ] Stats dashboard (clicks, rewards, rank)
- [ ] Responsive design (mobile-first)

---

### **FASE 2: Seguridad y Gamificación (Semanas 4-6)**

#### Semana 4: Sistema Anti-Bot
- [ ] Implementar AntiBotClient (frontend)
- [ ] Implementar AntiBotSystem (Cairo)
- [ ] Sistema de Trust Score
- [ ] Rate limiting (800 clicks/30s)
- [ ] Validación de firmas cliente
- [ ] Tests de seguridad (intentar exploits)

#### Semana 5: Competición Global
- [ ] Sistema de países (detección automática)
- [ ] Leaderboard global en tiempo real
- [ ] Leaderboard por país
- [ ] Leaderboard individual
- [ ] Actualización optimista (Zustand)
- [ ] Animaciones de cambios de ranking

#### Semana 6: Gamificación Premium
- [ ] Particle system para clicks (Three.js)
- [ ] Sonidos premium con variación
- [ ] Feedback háptico (mobile)
- [ ] Achievements system
- [ ] Milestone rewards
- [ ] NFT para early adopters
- [ ] Theme switcher (dark/light)

---

### **FASE 3: Optimización y Scaling (Semanas 7-8)**

#### Semana 7: Performance
- [ ] Optimización de gas (batch clicks)
- [ ] Lazy loading de componentes
- [ ] Code splitting
- [ ] Image optimization
- [ ] PWA (Progressive Web App)
- [ ] Service worker para offline
- [ ] Lighthouse score > 90

#### Semana 8: Analytics y Monitoring
- [ ] Integrar Sentry (error tracking)
- [ ] Métricas de performance
- [ ] Bot detection analytics (ML)
- [ ] Dashboard de admin
- [ ] A/B testing framework
- [ ] Torii GraphQL queries optimizadas

---

### **FASE 4: Testing y Deploy (Semanas 9-10)**

#### Semana 9: Testing Completo
- [ ] Tests E2E (Playwright)
- [ ] Tests de integración
- [ ] Load testing (Artillery)
- [ ] Security audit básico
- [ ] Bug bounty interno
- [ ] Beta testing con usuarios reales

#### Semana 10: Production Deploy
- [ ] Deploy smart contracts a Starknet testnet
- [ ] Deploy frontend a Vercel
- [ ] Setup Cloudflare CDN
- [ ] Configurar monitoring en producción
- [ ] Documentación completa
- [ ] Marketing y lanzamiento

---

### **FASE 5: Post-Launch (Continuo)**

- [ ] Recolección de feedback
- [ ] Optimizaciones basadas en analytics
- [ ] Nuevas features (votes de comunidad)
- [ ] Deploy a Starknet mainnet
- [ ] Programa de referidos
- [ ] Integración con otros protocolos DeFi
- [ ] Mobile app nativa (React Native)

---

## 9. ESTIMACIÓN DE RECURSOS

### 9.1 Equipo Recomendado

- **1 Cairo/Dojo Developer**: Smart contracts, sistemas, arquitectura onchain
- **1 Frontend Developer**: React/Next.js, UI/UX, integraciones
- **1 Designer**: UI/UX, animaciones, branding
- **0.5 DevOps**: Infraestructura, CI/CD, monitoring (part-time)

### 9.2 Costos Estimados (10 semanas)

| Concepto | Costo Mensual | Total (2.5 meses) |
|----------|---------------|-------------------|
| Equipo (4 personas) | $20,000 | $50,000 |
| Infraestructura | $500 | $1,250 |
| Herramientas/SaaS | $200 | $500 |
| Auditoría (post-MVP) | - | $15,000 |
| Marketing inicial | - | $10,000 |
| **TOTAL** | | **$76,750** |

### 9.3 Infraestructura Mensual

- Vercel Pro: $20/mes
- Railway/Fly.io: $50/mes
- PostgreSQL (Supabase): $25/mes
- Redis (Upstash): $10/mes
- Cloudflare Pro: $20/mes
- Sentry: $26/mes
- Dominios: $20/año
- **Total**: ~$170/mes

---

## 10. MÉTRICAS DE ÉXITO

### 10.1 KPIs Técnicos
- [ ] Uptime > 99.9%
- [ ] Response time < 200ms (p95)
- [ ] Lighthouse score > 90
- [ ] Zero critical bugs en producción
- [ ] Bot detection accuracy > 95%
- [ ] Gas cost < $0.01 por transacción

### 10.2 KPIs de Negocio
- [ ] 10,000+ jugadores activos en primer mes
- [ ] 100M+ clicks totales en primer mes
- [ ] Retention Day 7 > 40%
- [ ] Retention Day 30 > 20%
- [ ] 100+ países participando
- [ ] $100K+ en rewards distribuidos

### 10.3 KPIs de Comunidad
- [ ] 5,000+ seguidores en Twitter
- [ ] 1,000+ miembros en Discord
- [ ] 100+ menciones orgánicas
- [ ] Top 10 trending en Starknet ecosystem

---

## 11. RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Bots sofisticados | Alta | Alto | Sistema multi-capa + ML + bounty program |
| Congestión de red | Media | Alto | Batch transactions + L2 escalable |
| Bugs críticos | Media | Crítico | Auditoría + tests extensivos + bug bounty |
| Falta de adopción | Media | Alto | Marketing agresivo + gamificación |
| Competencia | Alta | Medio | Diferenciación (full onchain + Dojo) |
| Costos de gas | Baja | Medio | Starknet tiene fees muy bajos |

---

## 12. RECURSOS Y REFERENCIAS

### 12.1 Documentación Oficial
- Dojo Engine: https://dojoengine.org
- Dojo Book: https://book.dojoengine.org
- Starknet Docs: https://docs.starknet.io
- Cairo Language: https://book.cairo-lang.org

### 12.2 Ejemplos de Código
- Loot Survivor: https://github.com/loot-survivor
- Awesome Dojo: https://github.com/dojoengine/awesome-dojo
- Dojo Starter: https://github.com/dojoengine/dojo-starter

### 12.3 Casos de Éxito Analizados
- **Loot Survivor**: Primer juego complejo full onchain en Starknet
- **Popcat.click**: Mecánicas de clicker y anti-bot
- **Vampire Survivors**: Gamificación y engagement
- **Axie Infinity**: Economía de tokens sostenible

### 12.4 Herramientas Recomendadas
- **Diseño**: Figma, Spline (3D)
- **Desarrollo**: VS Code + Cairo extension
- **Testing**: Playwright, Artillery
- **Analytics**: Mixpanel, PostHog
- **Monitoring**: Sentry, Datadog

---

## 13. CONCLUSIONES Y PRÓXIMOS PASOS

### 13.1 Resumen Ejecutivo

FlowClicker representa una evolución natural de los juegos clicker tradicionales hacia el paradigma **full onchain**. Al combinar:

1. **Tecnología de punta** (Dojo Engine + Starknet)
2. **Experiencia de usuario premium** (UI/UX sin fricción)
3. **Seguridad robusta** (anti-bot multi-capa)
4. **Economía sostenible** (decaimiento temporal 3 años)
5. **Competición global** (rankings en tiempo real)

Creamos un juego que es **verificable, transparente, escalable y adictivo**.

### 13.2 Ventajas Competitivas

| Aspecto | FlowClicker | Competencia |
|---------|-------------|-------------|
| **Verificabilidad** | Full onchain | Servers centralizados |
| **Transparencia** | 100% auditable | Caja negra |
| **Ownership** | Tokens reales | Puntos sin valor |
| **Composabilidad** | Otros protocolos pueden integrar | Cerrado |
| **Permanencia** | Mientras exista blockchain | Depende de empresa |

### 13.3 Próximos Pasos Inmediatos

1. **Aprobar este plan** con stakeholders
2. **Formar el equipo** (contratar devs especializados)
3. **Setup inicial** (semana 1 del roadmap)
4. **Diseño UI/UX** en paralelo con desarrollo
5. **Primera demo** funcional en 3 semanas

---

## 14. APÉNDICES

### A. Comandos Útiles de Dojo

```bash
# Instalar Dojo
curl -L https://install.dojoengine.org | bash
dojoup

# Crear nuevo proyecto
sozo init flowclicker

# Build contracts
sozo build

# Deploy local
katana --disable-fee  # Terminal 1
sozo migrate apply   # Terminal 2

# Indexar con Torii
torii --world <WORLD_ADDRESS>

# Tests
sozo test
```

### B. Estructura de Proyecto Recomendada

```
flowclicker/
├── contracts/                 # Dojo Cairo contracts
│   ├── src/
│   │   ├── models/
│   │   │   ├── player.cairo
│   │   │   ├── country.cairo
│   │   │   ├── global_state.cairo
│   │   │   └── click_session.cairo
│   │   ├── systems/
│   │   │   ├── click.cairo
│   │   │   ├── anti_bot.cairo
│   │   │   ├── reward.cairo
│   │   │   └── ranking.cairo
│   │   └── lib.cairo
│   ├── Scarb.toml
│   └── dojo_config.toml
│
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── api/
│   ├── components/
│   │   ├── ui/              # Shadcn components
│   │   ├── ClickArea.tsx
│   │   ├── Leaderboard.tsx
│   │   └── StatsPanel.tsx
│   ├── lib/
│   │   ├── dojo/
│   │   │   ├── setup.ts
│   │   │   └── hooks.ts
│   │   └── antiBot.ts
│   ├── public/
│   └── package.json
│
├── backend/                   # Optional analytics API
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   └── package.json
│
├── docs/                      # Documentation
│   ├── architecture.md
│   ├── api.md
│   └── deployment.md
│
└── README.md
```

### C. Checklist de Lanzamiento

**Pre-Launch (1 semana antes)**
- [ ] Auditoría de seguridad completa
- [ ] Load testing con tráfico simulado
- [ ] Backup y recovery plan
- [ ] Documentación para usuarios
- [ ] Material de marketing preparado
- [ ] Comunicados de prensa
- [ ] Partnerships confirmados

**Launch Day**
- [ ] Deploy a mainnet
- [ ] Monitoring activo 24/7
- [ ] Equipo de soporte listo
- [ ] Anuncio en redes sociales
- [ ] Tracking de métricas en tiempo real

**Post-Launch (primera semana)**
- [ ] Daily analytics review
- [ ] Hotfixes si es necesario
- [ ] Recolección de feedback
- [ ] AMA con comunidad
- [ ] Primeros ajustes de balance

---

## CONCLUSIÓN FINAL

Este plan establece las bases para crear un juego clicker de **clase mundial** que aprovecha todo el potencial de **Dojo Engine** y **Starknet**. Con una ejecución disciplinada y un equipo talentoso, FlowClicker puede convertirse en el juego onchain más popular del ecosistema.

**La diferencia está en los detalles**: anti-bot robusto, UX sin fricción, economía sostenible y una arquitectura técnica impecable.

**Let's build the future of onchain gaming!** 🚀
