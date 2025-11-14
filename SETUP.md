# FlowClicker - Setup Profesional con MUD en ANDE Network

## Prerrequisitos

```bash
# Verificar Node.js (requiere v18+)
node --version

# Instalar pnpm si no lo tienes
npm install -g pnpm

# Verificar pnpm
pnpm --version

# Instalar Foundry (para smart contracts)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

---

## Paso 1: Crear Proyecto MUD (Comando Oficial)

```bash
# Navega al directorio FlowClicker-dojo
cd /home/user/FlowClicker-dojo

# Ejecuta el comando oficial de MUD (latest version: 2.2.14)
pnpm create mud@latest flowclicker

# El CLI te preguntará:
# 1. "Choose a template" → Selecciona "vanilla" (base limpia)
# 2. "Install dependencies?" → Yes

# Esto creará:
# flowclicker/
# ├── packages/
# │   ├── contracts/    # Foundry + MUD contracts
# │   └── client/       # Vite + React
# ├── pnpm-workspace.yaml
# └── package.json
```

---

## Paso 2: Configurar ANDE Network

### 2.1 Editar `packages/contracts/foundry.toml`

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
fs_permissions = [{ access = "read-write", path = "./"}]
# Configuración base de MUD

[profile.local]
# Anvil local para desarrollo

[profile.ande]
src = "src"
out = "out"
libs = ["lib"]
eth_rpc_url = "https://rpc.ande.network"
chain_id = 6174
# ANDE Network configuration
```

### 2.2 Editar `packages/contracts/mud.config.ts`

```typescript
import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "flowclicker",
  tables: {
    Player: {
      schema: {
        player: "address",
        totalClicks: "uint256",
        totalRewards: "uint256",
        countryCode: "bytes32",
        lastClickTimestamp: "uint64",
        trustScore: "uint16",
        sequentialMaxClicks: "uint8",
        isBotFlagged: "bool",
      },
      key: ["player"],
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
        player: "address",
        sessionStart: "uint64",
        clicksInSession: "uint32",
        isValid: "bool",
      },
      key: ["player", "sessionStart"],
    },
  },
  systems: {
    ClickSystem: {
      openAccess: false,
    },
    AntiBotSystem: {
      openAccess: false,
    },
  },
});
```

---

## Paso 3: Desarrollo Local

```bash
cd flowclicker

# Terminal 1: Start local blockchain (Anvil)
pnpm dev:node

# Terminal 2: Deploy contracts + start indexer
pnpm dev:contracts

# Terminal 3: Start frontend
pnpm dev:client

# La app estará en http://localhost:3000
```

---

## Paso 4: Deploy a ANDE Network

```bash
# Build contracts
cd packages/contracts
pnpm build

# Deploy a ANDE testnet
pnpm mud deploy --profile ande

# Guarda el WORLD_ADDRESS que te devuelve
# Ejemplo: 0x1234...
```

---

## Paso 5: Configurar Frontend para ANDE

### Editar `packages/client/.env`

```env
VITE_CHAIN_ID=6174
VITE_RPC_URL=https://rpc.ande.network
VITE_WORLD_ADDRESS=<WORLD_ADDRESS_DEL_DEPLOY>
```

### Editar `packages/client/src/mud/setupNetwork.ts`

```typescript
import { createPublicClient, createWalletClient, http } from "viem";
import { defineChain } from "viem";

// Definir ANDE Network
const andeNetwork = defineChain({
  id: 6174,
  name: "ANDE Network",
  network: "ande",
  nativeCurrency: {
    name: "ANDE",
    symbol: "ANDE",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.ande.network"],
    },
    public: {
      http: ["https://rpc.ande.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "ANDE Explorer",
      url: "https://explorer.ande.network",
    },
  },
});

// Resto del código MUD generado automáticamente...
```

---

## Paso 6: Instalar Dependencias Adicionales

```bash
# En packages/contracts
cd packages/contracts
pnpm add @openzeppelin/contracts

# En packages/client
cd ../client
pnpm add framer-motion @rainbow-me/rainbowkit wagmi viem
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## Paso 7: Verificar Instalación

```bash
# Desde la raíz del proyecto
cd flowclicker

# Verificar que todo está bien
pnpm build

# Correr tests
pnpm test

# Si todo pasa, estás listo para desarrollar
```

---

## Estructura Final del Proyecto

```
flowclicker/
├── packages/
│   ├── contracts/
│   │   ├── src/
│   │   │   ├── systems/          # Tus smart contracts
│   │   │   │   ├── ClickSystem.sol
│   │   │   │   ├── AntiBotSystem.sol
│   │   │   │   └── FlowToken.sol
│   │   │   └── codegen/          # Auto-generated por MUD
│   │   ├── test/                 # Foundry tests
│   │   ├── mud.config.ts         # MUD schema
│   │   └── foundry.toml          # Foundry config
│   │
│   └── client/
│       ├── src/
│       │   ├── components/       # React components
│       │   ├── hooks/            # Custom hooks
│       │   ├── mud/              # MUD SDK setup
│       │   └── App.tsx
│       ├── .env                  # Environment vars
│       └── vite.config.ts
│
├── pnpm-workspace.yaml
└── package.json
```

---

## Comandos Útiles

```bash
# Desarrollo local (3 terminales)
pnpm dev:node        # Terminal 1: Local blockchain
pnpm dev:contracts   # Terminal 2: Contracts + indexer
pnpm dev:client      # Terminal 3: Frontend

# Deploy
pnpm mud deploy --profile ande

# Tests
pnpm test           # Todos los tests
pnpm test:contracts # Solo contracts

# Build
pnpm build          # Build todo

# Lint
pnpm lint           # Lint todo el proyecto

# Clean
pnpm clean          # Limpiar artifacts
```

---

## Troubleshooting

### Error: "Module not found"
```bash
# Re-instalar dependencias
pnpm install

# O limpiar y reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Error: "Chain ID mismatch"
```bash
# Verificar que .env tiene el Chain ID correcto
cat packages/client/.env

# Debe mostrar:
# VITE_CHAIN_ID=6174
```

### Error: "Cannot connect to ANDE"
```bash
# Verificar que ANDE RPC está funcionando
curl -X POST https://rpc.ande.network \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Debería retornar: {"jsonrpc":"2.0","id":1,"result":"0x181e"}
# (0x181e = 6174 en hexadecimal)
```

---

## Próximos Pasos

Después de completar este setup:

1. ✅ Implementar ClickSystem.sol
2. ✅ Implementar AntiBotSystem.sol
3. ✅ Implementar FlowToken.sol
4. ✅ Crear componentes de UI
5. ✅ Testing end-to-end
6. ✅ Deploy a producción

---

## Referencias

- **MUD Docs**: https://mud.dev
- **MUD GitHub**: https://github.com/latticexyz/mud
- **Foundry Book**: https://book.getfoundry.sh
- **ANDE Network**: https://rpc.ande.network (Chain ID: 6174)

---

**IMPORTANTE**: Ejecuta estos comandos en tu máquina local, NO en este chat. Este es el setup profesional usando herramientas oficiales, NO creación manual de archivos.
