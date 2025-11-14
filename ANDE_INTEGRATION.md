# FlowClicker en ANDE Network - Análisis y Opciones

## 1. TU INFRAESTRUCTURA: ANDE Network

```
ANDE Network Testnet
├── Chain ID: 6174
├── RPC: https://rpc.ande.network
├── Explorer: https://explorer.ande.network
├── Compatible: EVM (Solidity, Hardhat, ethers.js)
└── DA Layer: Celestia (rollup soberano)
```

### Arquitectura ANDE
```
ANDE Network (Sovereign Rollup)
├── Execution: EVM
├── Settlement: Self-sovereign (no external L1)
└── Data Availability: Celestia
```

**Ventaja clave**: Costos ultra bajos por usar Celestia DA directamente.

---

## 2. PROBLEMA: Dojo ≠ EVM

### Incompatibilidad Fundamental

| Aspecto | Dojo | ANDE Network |
|---------|------|--------------|
| **VM** | Cairo (StarknetVM) | EVM |
| **Lenguaje** | Cairo 2.x | Solidity, Vyper |
| **Tools** | Sozo, Katana, Torii | Hardhat, Foundry, ethers.js |
| **ECS** | Nativo (Models/Systems) | Requiere implementar |
| **Indexer** | Torii (Cairo events) | The Graph, Custom |

**Conclusión**: No puedes usar Dojo directamente en ANDE.

---

## 3. OPCIONES PARA FLOWCLICKER EN ANDE

### Opción A: MUD Engine (Equivalente EVM de Dojo) ⭐ RECOMENDADA

**MUD (Multi-User Dungeon)** es el framework líder para juegos full onchain en EVM (>95% market share).

#### ¿Qué es MUD?

Creado por Lattice, MUD es exactamente lo que necesitas:

```
MUD = Dojo para EVM
├── ECS architecture nativa
├── State synchronization automática
├── Compatible con cualquier EVM chain
├── Store: on-chain database
├── World: contract registry
└── MUD devtools: indexer + client
```

#### Arquitectura MUD en ANDE

```typescript
// contracts/src/systems/ClickSystem.sol
import { System } from "@latticexyz/world/src/System.sol";
import { Player, Country, GlobalState } from "../codegen/Tables.sol";

contract ClickSystem is System {
  function executeClick(uint256 timestamp, bytes32 signature) public returns (uint256) {
    // 1. Validar anti-bot
    (bool isValid, uint16 trustScore) = validateClick(msg.sender, timestamp, signature);

    if (!isValid) {
      return 0;
    }

    // 2. MINT tokens $FLOW
    uint256 tokensMinted = calculateTokensPerClick(timestamp);
    _mint(msg.sender, tokensMinted);

    // 3. Actualizar stats (MUD auto-sync)
    Player.setTotalClicks(msg.sender, Player.getTotalClicks(msg.sender) + 1);
    Player.setTotalRewards(msg.sender, Player.getTotalRewards(msg.sender) + tokensMinted);

    Country.setTotalClicks(
      getCountryCode(msg.sender),
      Country.getTotalClicks(getCountryCode(msg.sender)) + 1
    );

    return tokensMinted;
  }
}
```

#### Frontend con MUD

```typescript
// frontend/src/mud/setup.ts
import { createPublicClient } from 'viem';
import { syncToRecs } from '@latticexyz/store-sync/recs';

const publicClient = createPublicClient({
  chain: {
    id: 6174,
    name: 'ANDE Network',
    network: 'ande',
    nativeCurrency: { name: 'ANDE', symbol: 'ANDE', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://rpc.ande.network'] },
      public: { http: ['https://rpc.ande.network'] },
    },
  },
  transport: http(),
});

// MUD sync automático (como Torii en Dojo)
const { components, world } = await syncToRecs({
  world: WORLD_ADDRESS,
  publicClient,
});

// React hook (similar a Dojo useEntityQuery)
function usePlayer(address: Address) {
  const player = useComponentValue(components.Player, address);
  return player;
}
```

#### Ventajas de MUD en ANDE

| Ventaja | Descripción |
|---------|-------------|
| ✅ **ECS Nativo** | Arquitectura idéntica a Dojo |
| ✅ **Auto-sync** | Cliente se sincroniza automáticamente |
| ✅ **Type-safe** | Schema definido genera tipos TypeScript |
| ✅ **Battle-tested** | Usado por Sky Strife, OPCraft, etc |
| ✅ **Tooling maduro** | MUD devtools, deployer, etc |
| ✅ **Compatible ANDE** | Funciona en cualquier EVM chain |
| ✅ **Celestia GA** | Gas ultra bajo en ANDE |

#### Costos en ANDE

```
Suposiciones:
- Gas por click en ANDE: ~21,000 gas (transfer simple)
- Gas price en ANDE: ~0.1 gwei (Celestia DA = barato)
- 1 ETH = $3,000

Costo por click:
21,000 × 0.1 gwei × $3,000 = $0.0000063

10M clicks/día × $0.0000063 = $63/día

¡100x más barato que Starknet Mainnet!
```

#### Setup de MUD en ANDE

```bash
# 1. Install MUD
pnpm create mud@latest flowclicker-mud

# 2. Configure ANDE network
# packages/contracts/foundry.toml
[profile.ande]
src = "src"
out = "out"
libs = ["lib"]
eth_rpc_url = "https://rpc.ande.network"
chain_id = 6174

# 3. Define schema (como Dojo models)
# packages/contracts/mud.config.ts
import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  tables: {
    Player: {
      schema: {
        wallet: "address",
        totalClicks: "uint256",
        totalRewards: "uint256",
        countryCode: "bytes32",
        trustScore: "uint16",
        isBotFlagged: "bool",
      },
      key: ["wallet"],
    },
    Country: {
      schema: {
        code: "bytes32",
        totalClicks: "uint256",
        playerCount: "uint32",
        rank: "uint16",
      },
      key: ["code"],
    },
    GlobalState: {
      schema: {
        totalClicks: "uint256",
        totalPlayers: "uint32",
        currentRewardRate: "uint256",
      },
      key: [],
    },
  },
});

# 4. Deploy a ANDE
pnpm mud deploy --profile ande

# 5. Frontend setup (auto-generated por MUD)
cd packages/client
pnpm dev
```

---

### Opción B: Custom Solidity (Sin Framework)

Si no quieres usar MUD, puedes implementar FlowClicker directamente en Solidity:

```solidity
// contracts/FlowClicker.sol
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FlowClicker is ERC20 {
    struct Player {
        uint256 totalClicks;
        uint256 totalRewards;
        bytes32 countryCode;
        uint16 trustScore;
        bool isBotFlagged;
        uint64 lastClickTimestamp;
    }

    mapping(address => Player) public players;
    mapping(bytes32 => uint256) public countryClicks;

    uint256 public startTimestamp;
    uint256 public constant DECAY_DURATION = 3 * 365 days;

    constructor() ERC20("FlowToken", "FLOW") {
        startTimestamp = block.timestamp;
    }

    function executeClick(uint256 timestamp, bytes memory signature)
        external
        returns (uint256 tokensMinted)
    {
        // 1. Validate anti-bot
        (bool isValid, uint16 newTrustScore) = _validateClick(
            msg.sender,
            timestamp,
            signature
        );

        if (!isValid) {
            return 0;
        }

        // 2. Calculate tokens with decay
        tokensMinted = _calculateTokensPerClick(timestamp);

        // 3. MINT tokens
        _mint(msg.sender, tokensMinted);

        // 4. Update state
        players[msg.sender].totalClicks += 1;
        players[msg.sender].totalRewards += tokensMinted;
        players[msg.sender].trustScore = newTrustScore;
        players[msg.sender].lastClickTimestamp = uint64(timestamp);

        countryClicks[players[msg.sender].countryCode] += 1;

        emit ClickExecuted(msg.sender, tokensMinted, newTrustScore);
    }

    function _calculateTokensPerClick(uint256 timestamp)
        internal
        view
        returns (uint256)
    {
        uint256 elapsed = timestamp - startTimestamp;

        if (elapsed >= DECAY_DURATION) {
            return 0.0005 ether; // Post-3 años
        }

        // Decay linear (año 1: 0.01, año 2: 0.004, año 3: 0.001)
        uint256 decayFactor = (elapsed * 1000) / DECAY_DURATION;
        uint256 initialRate = 0.01 ether;
        uint256 finalRate = 0.0005 ether;

        return initialRate - ((initialRate - finalRate) * decayFactor) / 1000;
    }

    function _validateClick(
        address player,
        uint256 timestamp,
        bytes memory signature
    ) internal returns (bool isValid, uint16 trustScore) {
        // Anti-bot logic aquí
        // Similar a lo descrito en PLAN.md
    }
}
```

**Ventajas:**
- ✅ Control total
- ✅ Sin dependencias externas
- ✅ Gas optimizado

**Desventajas:**
- ❌ Sin auto-sync (necesitas The Graph)
- ❌ Más código a mantener
- ❌ Sin ECS architecture
- ❌ Sin tooling especializado

---

### Opción C: Hybrid - Dojo en Starknet + ANDE para DA

Usar ambas chains en paralelo:

```
FlowClicker Architecture (Hybrid)
├── Game Logic: Dojo en Starknet
│   ├── Click systems
│   ├── Anti-bot
│   └── Token minting
│
└── ANDE Network: Custom use cases
    ├── High-volume data storage (Celestia DA)
    ├── Analytics backend
    ├── Secondary marketplace
    └── Cross-chain bridge
```

**Cuándo usar:**
- Quieres lo mejor de ambos mundos
- ANDE para features custom/experimentales
- Starknet para lógica core probada

---

## 4. COMPARACIÓN DE OPCIONES

| Aspecto | MUD en ANDE | Custom Solidity | Dojo en Starknet |
|---------|-------------|-----------------|------------------|
| **Development Time** | 3-4 semanas | 6-8 semanas | 2-3 semanas |
| **Complejidad** | Media | Alta | Baja (si ya sabes Cairo) |
| **Gas Cost/Click** | ~$0.000006 | ~$0.000006 | ~$0.001-0.01 |
| **ECS Architecture** | ✅ Nativo | ❌ Manual | ✅ Nativo |
| **Auto-sync Client** | ✅ MUD devtools | ❌ The Graph needed | ✅ Torii |
| **Tooling** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Community** | Grande (EVM) | N/A | Mediana (Starknet) |
| **Usa ANDE** | ✅ | ✅ | ❌ |
| **Battle-tested** | ✅ (Sky Strife) | ❌ | ✅ (Loot Survivor) |

---

## 5. RECOMENDACIÓN PARA ANDE NETWORK

### Estrategia Recomendada: MUD en ANDE ⭐

**Por qué MUD:**

1. **Arquitectura idéntica a Dojo**: ECS, auto-sync, schema-driven
2. **Compatible con ANDE**: Funciona en cualquier EVM chain
3. **Costos mínimos**: Celestia DA = gas ultra bajo
4. **Tooling maduro**: MUD devtools, deployer, indexer
5. **Community**: >95% de juegos onchain en EVM usan MUD
6. **Time-to-market**: 3-4 semanas vs 6-8 custom

**Stack completo:**
```
Frontend: Next.js + MUD React SDK
Contracts: Solidity + MUD Framework
Network: ANDE Network (EVM + Celestia)
Indexer: MUD Indexer (auto)
Wallet: MetaMask, Rainbow, etc
```

### Roadmap con MUD en ANDE

**Semana 1-2: Setup**
- [ ] Install MUD (`pnpm create mud`)
- [ ] Configure ANDE network en foundry.toml
- [ ] Define schema (Player, Country, GlobalState)
- [ ] Deploy a ANDE testnet

**Semana 3-4: Core Systems**
- [ ] Implementar ClickSystem
- [ ] Implementar AntiBotSystem
- [ ] Implementar TokenMintSystem
- [ ] Implementar RankingSystem

**Semana 5-6: Frontend**
- [ ] Setup MUD React SDK
- [ ] Componente ClickArea con auto-sync
- [ ] Leaderboards en tiempo real
- [ ] Wallet connection (ANDE)

**Semana 7-8: Testing & Launch**
- [ ] Testing en ANDE testnet
- [ ] Security audit
- [ ] Deploy a ANDE mainnet (cuando esté lista)
- [ ] Launch público

---

## 6. MODIFICACIONES NECESARIAS EN ANDE

### ¿Necesitas modificar ANDE para juegos full onchain?

**Respuesta corta: NO, ANDE ya está lista.**

ANDE Network siendo EVM compatible ya soporta todo lo necesario:

✅ **Smart contracts**: Solidity funciona
✅ **Events**: Para indexing
✅ **Block times**: Suficiente para gaming
✅ **Celestia DA**: Costos ultra bajos
✅ **Tooling**: Hardhat, Foundry, ethers.js

### Optimizaciones Opcionales

Si quieres optimizar ANDE específicamente para gaming:

1. **Reducir block time**: De ~12s a ~2-3s (mejor UX)
2. **Aumentar gas limit**: Para transacciones complejas
3. **Custom precompiles**: Funciones crypto optimizadas (verificación de firmas)
4. **Mempool priority**: Para clicks en tiempo real

Pero **NO son necesarias** para MVP. ANDE funciona out-of-the-box.

---

## 7. EJEMPLO: FLOWCLICKER CON MUD EN ANDE

### Estructura del Proyecto

```
flowclicker-mud/
├── packages/
│   ├── contracts/           # MUD contracts en Solidity
│   │   ├── src/
│   │   │   ├── systems/
│   │   │   │   ├── ClickSystem.sol
│   │   │   │   ├── AntiBotSystem.sol
│   │   │   │   └── RankingSystem.sol
│   │   │   └── codegen/     # Auto-generated por MUD
│   │   └── mud.config.ts    # Schema definition
│   │
│   └── client/              # Next.js frontend
│       ├── src/
│       │   ├── components/
│       │   │   ├── ClickArea.tsx
│       │   │   └── Leaderboard.tsx
│       │   └── mud/         # MUD setup
│       └── package.json
│
└── pnpm-workspace.yaml
```

### mud.config.ts (Schema Definition)

```typescript
import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  namespace: "flowclicker",
  tables: {
    Player: {
      schema: {
        wallet: "address",
        totalClicks: "uint256",
        totalRewards: "uint256",
        countryCode: "bytes32",
        lastClickTimestamp: "uint64",
        trustScore: "uint16",
        sequentialMaxClicks: "uint8",
        isBotFlagged: "bool",
      },
      key: ["wallet"],
    },
    Country: {
      schema: {
        code: "bytes32",
        totalClicks: "uint256",
        playerCount: "uint32",
        rank: "uint16",
      },
      key: ["code"],
    },
    GlobalState: {
      schema: {
        totalClicks: "uint256",
        totalPlayers: "uint32",
        startTimestamp: "uint64",
        currentRewardRate: "uint256",
        totalRewardsDistributed: "uint256",
      },
      key: [],
    },
    ClickSession: {
      schema: {
        wallet: "address",
        sessionStart: "uint64",
        clicksInSession: "uint32",
        sessionDuration: "uint64",
        isValid: "bool",
      },
      key: ["wallet", "sessionStart"],
    },
  },
});
```

### ClickSystem.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { Player, Country, GlobalState, ClickSession } from "../codegen/index.sol";
import { FlowToken } from "./FlowToken.sol";

contract ClickSystem is System {
    FlowToken public flowToken;

    function executeClick(
        uint256 timestamp,
        bytes32 clientSignature
    ) public returns (uint256 tokensMinted) {
        address wallet = _msgSender();

        // 1. Validate anti-bot
        (bool isValid, uint16 trustScore) = _validateClick(
            wallet,
            timestamp,
            clientSignature
        );

        if (!isValid) {
            return 0;
        }

        // 2. Calculate and MINT tokens
        tokensMinted = _calculateAndMintTokens(wallet, timestamp);

        // 3. Update player stats
        _updatePlayerStats(wallet, tokensMinted, trustScore);

        // 4. Update country stats
        bytes32 countryCode = Player.getCountryCode(wallet);
        _updateCountryStats(countryCode);

        // 5. Update global state
        _updateGlobalState();

        return tokensMinted;
    }

    function _calculateAndMintTokens(
        address wallet,
        uint256 timestamp
    ) internal returns (uint256) {
        uint256 tokens = _calculateTokensPerClick(timestamp);
        flowToken.mint(wallet, tokens);
        return tokens;
    }

    function _calculateTokensPerClick(uint256 timestamp)
        internal
        view
        returns (uint256)
    {
        uint64 startTime = GlobalState.getStartTimestamp();
        uint256 elapsed = timestamp - startTime;
        uint256 threeYears = 3 * 365 days;

        if (elapsed >= threeYears) {
            return 0.0005 ether; // 0.0005 FLOW
        }

        // Linear decay
        uint256 decayFactor = (elapsed * 1000) / threeYears;
        uint256 initialRate = 0.01 ether;
        uint256 finalRate = 0.0005 ether;

        return initialRate - ((initialRate - finalRate) * decayFactor) / 1000;
    }

    function _validateClick(
        address wallet,
        uint256 timestamp,
        bytes32 signature
    ) internal returns (bool isValid, uint16 newTrustScore) {
        // Anti-bot validation logic
        // (Similar al descrito en PLAN.md pero adaptado a Solidity)

        uint16 currentTrust = Player.getTrustScore(wallet);
        bool isFlagged = Player.getIsBotFlagged(wallet);

        if (isFlagged) {
            return (false, 0);
        }

        // Validar rate limiting (800 clicks/30s)
        uint64 sessionStart = uint64(timestamp / 30);
        uint32 clicksInSession = ClickSession.getClicksInSession(wallet, sessionStart);

        if (clicksInSession >= 800) {
            uint8 sequential = Player.getSequentialMaxClicks(wallet);
            if (sequential >= 11) {
                Player.setIsBotFlagged(wallet, true);
                return (false, 0);
            }
            Player.setSequentialMaxClicks(wallet, sequential + 1);
        }

        // Update session
        ClickSession.setClicksInSession(wallet, sessionStart, clicksInSession + 1);

        // Validate timestamp intervals
        uint64 lastClick = Player.getLastClickTimestamp(wallet);
        if (timestamp - lastClick < 50) { // < 50ms suspicious
            newTrustScore = currentTrust > 10 ? currentTrust - 10 : 0;
        } else {
            newTrustScore = currentTrust < 1000 ? currentTrust + 1 : 1000;
        }

        isValid = newTrustScore > 300;
        return (isValid, newTrustScore);
    }

    function _updatePlayerStats(
        address wallet,
        uint256 tokens,
        uint16 trustScore
    ) internal {
        Player.setTotalClicks(wallet, Player.getTotalClicks(wallet) + 1);
        Player.setTotalRewards(wallet, Player.getTotalRewards(wallet) + tokens);
        Player.setTrustScore(wallet, trustScore);
        Player.setLastClickTimestamp(wallet, uint64(block.timestamp));
    }

    function _updateCountryStats(bytes32 countryCode) internal {
        Country.setTotalClicks(
            countryCode,
            Country.getTotalClicks(countryCode) + 1
        );
    }

    function _updateGlobalState() internal {
        GlobalState.setTotalClicks(GlobalState.getTotalClicks() + 1);
    }
}
```

### Frontend con MUD React SDK

```typescript
// packages/client/src/components/ClickArea.tsx
import { useMUD } from '../mud/MUDContext';
import { useComponentValue } from '@latticexyz/react';
import { motion } from 'framer-motion';

export function ClickArea() {
  const {
    components: { Player },
    systemCalls: { executeClick },
    playerEntity,
  } = useMUD();

  // Auto-synced player data (como Dojo useEntityQuery)
  const player = useComponentValue(Player, playerEntity);

  const handleClick = async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = '0x...'; // Generate client signature

    // Optimistic UI update
    setLocalClicks(prev => prev + 1);

    try {
      // Call smart contract on ANDE
      const tokensMinted = await executeClick(timestamp, signature);

      // MUD auto-syncs, player data updates automatically
      console.log(`Minted ${tokensMinted} FLOW tokens!`);
    } catch (error) {
      // Revert optimistic update
      setLocalClicks(prev => prev - 1);
      console.error('Click failed:', error);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      className="w-64 h-64 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600"
    >
      <div className="text-white text-2xl font-bold">
        {player?.totalClicks || 0} clicks
      </div>
      <div className="text-white/80 text-sm">
        {player?.totalRewards || 0} FLOW earned
      </div>
    </motion.button>
  );
}
```

---

## 8. COSTOS COMPARATIVOS

### FlowClicker en diferentes chains

| Chain | Gas/Click | 10M clicks/día | 100M clicks/mes |
|-------|-----------|----------------|-----------------|
| **ANDE (Celestia DA)** | $0.000006 | $60/día | $18K/mes |
| **Starknet Mainnet** | $0.005 | $50K/día | $15M/mes |
| **Ethereum L1** | $2.00 | $20M/día | $6B/mes (inviable) |
| **Optimism** | $0.01 | $100K/día | $30M/mes |
| **Arbitrum** | $0.008 | $80K/día | $24M/mes |

**ANDE es 833x más barato que Starknet Mainnet** 🎯

---

## 9. CONCLUSIÓN Y DECISIÓN FINAL

### RECOMENDACIÓN: MUD en ANDE Network

**Stack Final:**
```
Contracts:   Solidity + MUD Framework
Network:     ANDE Network (6174)
DA Layer:    Celestia
Frontend:    Next.js + MUD React SDK
Indexer:     MUD Indexer (built-in)
Wallet:      MetaMask, Rainbow
Token:       ERC20 $FLOW
```

**Por qué:**
1. ✅ **Aprovechas ANDE**: Tu chain, tu control
2. ✅ **Costos mínimos**: Celestia DA = 833x más barato
3. ✅ **Time-to-market**: 4 semanas vs 8-10 custom
4. ✅ **Architecture probada**: ECS como Dojo
5. ✅ **Tooling maduro**: MUD devtools completo
6. ✅ **Escalabilidad**: Celestia DA escala infinitamente

**Comparación con Dojo en Starknet:**

| Aspecto | MUD en ANDE | Dojo en Starknet |
|---------|-------------|------------------|
| **Costo/mes (10M clicks/día)** | $18K | $15M |
| **Control de chain** | ✅ Total | ❌ Starknet Foundation |
| **Tiempo de desarrollo** | 4 semanas | 3 semanas |
| **Complejidad** | Media | Media |
| **Ecosistema** | EVM (huge) | Starknet (growing) |

**Decisión final**: Usar MUD en ANDE Network para lanzamiento inicial. Si crece masivamente, ya tienes la infra optimizada.

---

## 10. PRÓXIMOS PASOS

### Sprint 1: Setup MUD en ANDE (Semana 1)
- [ ] `pnpm create mud@latest flowclicker-mud`
- [ ] Configurar ANDE network en foundry.toml
- [ ] Definir schema en mud.config.ts
- [ ] Deploy test contract a ANDE testnet
- [ ] Verificar que MUD sync funciona con ANDE

### Sprint 2: Core Systems (Semanas 2-3)
- [ ] Implementar ClickSystem.sol
- [ ] Implementar AntiBotSystem.sol
- [ ] Implementar FlowToken.sol (ERC20)
- [ ] Testing local con MUD devtools

### Sprint 3: Frontend (Semana 4)
- [ ] Setup MUD React SDK
- [ ] ClickArea component
- [ ] Leaderboards (real-time con MUD)
- [ ] Wallet connection para ANDE

### Sprint 4: Testing & Launch (Semanas 5-6)
- [ ] End-to-end testing en ANDE testnet
- [ ] Security audit
- [ ] Deploy a ANDE mainnet (cuando esté lista)
- [ ] Marketing y lanzamiento

---

## RECURSOS

### MUD Documentation
- Docs: https://mud.dev
- Examples: https://github.com/latticexyz/mud/tree/main/examples
- Discord: https://discord.gg/latticexyz

### ANDE Network
- RPC: https://rpc.ande.network
- Chain ID: 6174
- Explorer: https://explorer.ande.network (próximamente)

### Juegos de Referencia con MUD
- Sky Strife: https://skystrife.xyz
- OPCraft: https://opcraft.mud.dev
- Emoji: https://emoji.mud.dev

---

**¿Quieres que prepare el setup inicial de MUD para ANDE?**
