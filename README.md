# FlowClicker - Full Onchain Clicker Game

[![Built with Dojo](https://img.shields.io/badge/Built%20with-Dojo-orange)](https://dojoengine.org)
[![Starknet](https://img.shields.io/badge/Starknet-L2-blue)](https://starknet.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Visión

**FlowClicker** es un juego clicker profesional **full onchain** construido con [Dojo Engine](https://dojoengine.org) sobre Starknet. Combina mecánicas adictivas de clicker games con la transparencia y verificabilidad de blockchain.

### Características Principales

- **Full Onchain**: Toda la lógica de juego verificable en blockchain
- **Sistema Anti-Bot Multi-Capa**: Inspirado en popcat.click pero mejorado
- **Competición Global por Países**: Rankings en tiempo real con orgullo nacional
- **Economía Sostenible**: Sistema de decaimiento temporal (3 años) con token $FLOW
- **UX Sin Fricción**: Account Abstraction y optimistic rendering
- **Arquitectura ECS**: Modular, escalable y componible

## Stack Tecnológico

### Backend / Blockchain
- **Blockchain**: Starknet (ZK-Rollup)
- **Smart Contracts**: Cairo 2.x
- **Game Engine**: Dojo 1.0+
- **Indexer**: Torii (GraphQL/gRPC)
- **Sequencer**: Katana (desarrollo local)

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.8+
- **UI**: Shadcn/UI + Radix UI
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion + Three.js
- **State**: Zustand + Dojo SDK
- **Web3**: @dojoengine/sdk, @starknet-react/core

## Estructura del Proyecto

```
flowclicker/
├── contracts/          # Cairo smart contracts (Dojo)
│   ├── src/
│   │   ├── models/    # ECS Components
│   │   └── systems/   # Game logic
│   └── Scarb.toml
├── frontend/          # Next.js application
│   ├── app/
│   ├── components/
│   └── lib/
├── docs/              # Documentación
├── PLAN.md           # Plan de desarrollo completo
└── RESEARCH.md       # Investigación y casos de éxito
```

## Quick Start

### Prerequisites

```bash
# Install Dojo
curl -L https://install.dojoengine.org | bash
dojoup

# Verify installation
sozo --version
katana --version
torii --version
```

### Development

```bash
# 1. Start local Starknet (Katana)
katana --disable-fee

# 2. Build and deploy contracts
cd contracts
sozo build
sozo migrate apply

# 3. Start indexer (Torii)
torii --world <WORLD_ADDRESS>

# 4. Run frontend
cd frontend
pnpm install
pnpm dev
```

## Documentación

- **[PLAN.md](./PLAN.md)**: Plan de desarrollo completo con arquitectura, roadmap, y estimaciones
- **[RESEARCH.md](./RESEARCH.md)**: Investigación exhaustiva de casos de éxito y mejores prácticas

## Roadmap

### Fase 1: Fundación (Semanas 1-3)
- Setup de Dojo y Next.js
- Implementación de Models y Systems core
- Frontend base con wallet connection

### Fase 2: Seguridad y Gamificación (Semanas 4-6)
- Sistema anti-bot multi-capa
- Competición global por países
- Animaciones y efectos premium

### Fase 3: Optimización (Semanas 7-8)
- Performance optimization
- Analytics y monitoring
- PWA y mobile-first

### Fase 4: Testing y Deploy (Semanas 9-10)
- Testing completo (E2E, load, security)
- Deploy a testnet
- Beta pública

## Sistema Anti-Bot

FlowClicker implementa un sistema anti-bot de 3 capas:

1. **Client-Side**: Validación de patrones de click, movimientos de mouse, intervalos
2. **Smart Contract**: Rate limiting (800 clicks/30s), trust score, sequential detection
3. **Analytics**: Machine Learning para detección de anomalías a largo plazo

Ver [PLAN.md](./PLAN.md#3-sistema-anti-bot-multi-capa) para detalles completos.

## Economía del Token $FLOW

### 1 Click = Mint Automático

**Cada click válido minta tokens $FLOW instantáneamente:**

```
Usuario hace click → Validación anti-bot → Mint de tokens → Wallet del usuario
```

### Decaimiento Temporal (3 años)

La cantidad de tokens por click decrece con el tiempo:

- **Año 1**: 0.01 $FLOW por click (10 tokens por 1000 clicks)
- **Año 2**: 0.004 $FLOW por click (4 tokens por 1000 clicks)
- **Año 3**: 0.001 $FLOW por click (1 token por 1000 clicks)
- **Post-3 años**: 0.0005 $FLOW por click (sostenible)

Esto incentiva la **participación temprana** y asegura **sostenibilidad a largo plazo**.

### Mecanismos de Burn (Deflación)

- 50% de compras de boosts → burn
- 100% de compras de cosmetics → burn
- 50% de tournament fees → burn

**Resultado**: Economía deflacionaria desde año 2+

## Contributing

Contribuciones son bienvenidas! Por favor lee nuestra guía de contribución (próximamente).

## Security

Si encuentras una vulnerabilidad de seguridad, por favor contacta a [security@flowclicker.xyz] (email temporal).

## License

MIT License - ver [LICENSE](./LICENSE) para detalles.

## Links

- **Dojo Engine**: https://dojoengine.org
- **Starknet**: https://starknet.io
- **Discord**: (próximamente)
- **Twitter**: (próximamente)

---

**Built with ❤️ using Dojo Engine on Starknet**