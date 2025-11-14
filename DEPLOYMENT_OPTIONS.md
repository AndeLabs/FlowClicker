# FlowClicker - Opciones de Deployment

## Resumen Ejecutivo

FlowClicker se implementa en **Starknet** (L2 sobre Ethereum) usando **Dojo Engine**. Hay 3 opciones de deployment con diferentes trade-offs:

| Opción | Complejidad | Costo | Control | Recomendación |
|--------|-------------|-------|---------|---------------|
| **Starknet Testnet** | Baja | Gratis | Bajo | ✅ MVP/Testing |
| **Starknet Mainnet** | Baja | Bajo ($0.001-0.01/tx) | Medio | ✅ Launch Inicial |
| **Starknet Appchain (L3) + Celestia** | Alta | Muy Bajo (<$0.0001/tx) | Total | ⭐ Escala Masiva |

---

## 1. ARQUITECTURA DE CAPAS (Layer Stack)

### Opción A: Starknet Mainnet (Standard L2)

```
┌─────────────────────────────────────────┐
│         USUARIOS (Wallets)              │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│  FRONTEND (Next.js + Dojo SDK)          │
│  - React components                     │
│  - Dojo hooks (useEntityQuery)          │
│  - Wallet connection                    │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│  TORII INDEXER (GraphQL/gRPC)           │
│  - Indexa eventos de Dojo World         │
│  - Query real-time state                │
│  - WebSocket subscriptions              │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│  STARKNET MAINNET (L2)                  │  ← AQUÍ SE DEPLOYA
│  ┌───────────────────────────────────┐  │
│  │  DOJO WORLD CONTRACT              │  │
│  │  - Models (Player, Country, etc)  │  │
│  │  - Systems (Click, AntiBot, etc)  │  │
│  │  - $FLOW Token (ERC20)            │  │
│  └───────────────────────────────────┘  │
│                                          │
│  - ZK Proofs (Cairo VM)                 │
│  - Fees: ~$0.001-0.01 por transacción   │
└─────────────────┬───────────────────────┘
                  │
                  ↓ (Settlement)
┌─────────────────────────────────────────┐
│  ETHEREUM L1 (Mainnet)                  │
│  - Validación de proofs ZK              │
│  - Seguridad final                      │
│  - DA (Data Availability) por defecto   │
└─────────────────────────────────────────┘
```

**Cuándo usar:**
- ✅ MVP y lanzamiento inicial
- ✅ 10K-100K usuarios
- ✅ Costos predecibles y bajos
- ✅ Máxima seguridad (hereda de Ethereum)

**Costos estimados:**
- Gas por click: ~$0.001-0.005
- 10M clicks/día = $10K-50K/día en gas
- Con optimizaciones (batching): $2K-10K/día

---

### Opción B: Starknet Appchain (L3) con Celestia DA

```
┌─────────────────────────────────────────┐
│         USUARIOS (Wallets)              │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│  FRONTEND (Next.js + Dojo SDK)          │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│  TORII INDEXER                          │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│  FLOWCLICKER APPCHAIN (L3)              │  ← AQUÍ SE DEPLOYA
│  ┌───────────────────────────────────┐  │
│  │  DOJO WORLD CONTRACT              │  │
│  │  (Mismo código que Opción A)      │  │
│  └───────────────────────────────────┘  │
│                                          │
│  - Configuración custom:                │
│    • Block time: 1-2 segundos           │
│    • Block size: customizable           │
│    • Fees: ultra bajos (<$0.0001)       │
│    • Governance: propia                 │
└─────────────────┬───────────────────────┘
                  │
                  ↓ (Settlement)
┌─────────────────────────────────────────┐
│  STARKNET MAINNET (L2)                  │
│  - Valida proofs del Appchain           │
│  - Settlement layer                     │
└─────────────────┬───────────────────────┘
                  │
                  ↓ (DA - Data Availability)
┌─────────────────────────────────────────┐
│  CELESTIA (Modular DA Layer)            │
│  - Almacena datos del appchain          │
│  - Blobstream (pruebas de existencia)   │
│  - Costo: ~$0.00001 por blob            │
└─────────────────────────────────────────┘
```

**Cuándo usar:**
- ⭐ Escala masiva (1M+ usuarios)
- ⭐ Necesitas control total (governance propia)
- ⭐ Presupuesto de gas limitado
- ⭐ Features custom (block time, fees, etc)

**Costos estimados:**
- Gas por click: ~$0.00001-0.0001 (100x más barato)
- 10M clicks/día = $100-1K/día en gas (vs $10K-50K)
- Costo de operar el appchain: ~$5K-10K/mes (infraestructura)

---

## 2. COMPARACIÓN DETALLADA

### A. Starknet Mainnet (L2)

**Pros:**
- ✅ Setup simple (sozo migrate)
- ✅ No necesitas operar infraestructura
- ✅ Máxima seguridad (Ethereum L1)
- ✅ Ecosistema maduro (wallets, explorers, bridges)
- ✅ Dojo 1.0 probado en producción (Loot Survivor)

**Cons:**
- ❌ Fees más altos (~$0.001-0.01/tx)
- ❌ Menos control sobre parámetros de red
- ❌ Compartido con otras apps (congestión potencial)

**Stack de Deployment:**
```bash
# 1. Install Dojo
curl -L https://install.dojoengine.org | bash
dojoup

# 2. Build contracts
cd contracts
sozo build

# 3. Deploy a Starknet Testnet (Sepolia)
sozo migrate apply --rpc-url https://api.cartridge.gg/x/starknet/sepolia

# 4. Deploy a Mainnet
sozo migrate apply --rpc-url https://api.cartridge.gg/x/starknet/mainnet

# 5. Start Torii indexer
torii --world <WORLD_ADDRESS> --rpc https://api.cartridge.gg/x/starknet/mainnet
```

**Costos mensuales:**
- Smart contracts: Free (solo gas de deploy ~$100)
- Torii indexer: $100-200/mes (VPS)
- Gas operacional: Depende de tráfico
  - 100K usuarios, 1M clicks/día = ~$1K-5K/día

---

### B. Starknet Appchain + Celestia DA (L3)

**Pros:**
- ✅ Fees ultra bajos (<$0.0001/tx)
- ✅ Control total (block time, fees, governance)
- ✅ Escalabilidad ilimitada
- ✅ No congestión (chain dedicada)
- ✅ Modular DA (Celestia) reduce costos 10-100x

**Cons:**
- ❌ Setup complejo (rollup-as-a-service)
- ❌ Necesitas operar infraestructura (o pagar RaaS)
- ❌ Menos maduro (tech más nueva)
- ❌ Ecosistema fragmentado (bridges custom)

**Stack de Deployment:**

```bash
# Opción 1: Rollup-as-a-Service (Recomendado)
# Providers: Cartridge, Madara, LambdaClass

# 1. Setup con Madara (Starknet appchain client)
git clone https://github.com/keep-starknet-strange/madara
cd madara

# 2. Configure appchain
cat > configs/flowclicker.json <<EOF
{
  "chain_id": "FLOWCLICKER",
  "settlement": "starknet_mainnet",
  "da_layer": "celestia",
  "block_time": 2,
  "fee_config": {
    "min_fee": 1000
  }
}
EOF

# 3. Deploy Dojo contracts al appchain
sozo migrate apply --rpc-url http://localhost:9944

# 4. Configure Blobstream (Celestia DA)
# ... (requiere configuración adicional)

# Opción 2: Usar provider RaaS (Más fácil)
# Ejemplo: Cartridge Controller
# - Setup via dashboard
# - Deploy Dojo con un click
# - Configurar Celestia DA
```

**Costos mensuales:**
- RaaS provider: $2K-5K/mes (hosting del appchain)
- Celestia DA: $100-500/mes (blobs)
- Torii indexer: $100-200/mes
- Settlement a Starknet: $500-1K/mes
- **TOTAL: ~$3K-7K/mes fijo + gas variable mínimo**

---

## 3. CELESTIA: ¿QUÉ ES Y CÓMO FUNCIONA?

### ¿Qué es Celestia?

**Celestia es una blockchain modular especializada en Data Availability (DA).**

En vez de ser una blockchain completa (ejecución + consenso + DA + settlement), Celestia SOLO hace DA:

```
Blockchain Tradicional (Monolítica):
┌────────────────────────────┐
│ Execution (Smart Contracts)│
│ Consensus (PoS/PoW)        │
│ Data Availability (DA)     │
│ Settlement                 │
└────────────────────────────┘
Todo en una chain = lento y caro

Blockchain Modular (Celestia):
┌────────────────────────────┐
│ Execution: Starknet L3     │ ← FlowClicker contracts
├────────────────────────────┤
│ Consensus: Appchain        │ ← Validadores propios
├────────────────────────────┤
│ DA: Celestia ⭐            │ ← Solo almacenar datos
├────────────────────────────┤
│ Settlement: Starknet L2    │ ← Proofs finales
└────────────────────────────┘
Especialización = rápido y barato
```

### ¿Cómo funciona Celestia para FlowClicker?

**Sin Celestia (DA en Ethereum L1):**
```
Usuario hace click
  → Transacción a Starknet
    → Starknet ejecuta + genera proof
      → Proof + DATA se publican en Ethereum L1
        → Ethereum valida y almacena TODO
          → CARO: ~$0.001-0.01 por tx
```

**Con Celestia (DA en Celestia):**
```
Usuario hace click
  → Transacción a Starknet Appchain
    → Appchain ejecuta + genera proof
      → Proof va a Starknet L2 (Settlement)
      → DATA va a Celestia (DA layer) ⭐
        → Celestia solo almacena datos (no valida)
          → BARATO: ~$0.00001 por tx
      → Blobstream: prueba de que datos existen en Celestia
        → Starknet valida proof + Blobstream proof
          → Seguridad mantenida, costo reducido 100x
```

### Blobstream: El Puente Celestia-Starknet

**Blobstream** es un smart contract en Starknet que:

1. Recibe "commitments" (hashes) de los datos en Celestia
2. Permite verificar que ciertos datos existen en Celestia
3. Escrito en Cairo (portado por Starknet en 2024)

```cairo
// Ejemplo simplificado de verificación Blobstream
fn verify_data_availability(
    data_hash: felt252,
    celestia_proof: BlobstreamProof
) -> bool {
    // 1. Obtener commitment de Celestia via Blobstream
    let commitment = get_celestia_commitment(block_height);

    // 2. Verificar que data_hash está en el commitment
    verify_inclusion(data_hash, commitment, celestia_proof)
}
```

---

## 4. RECOMENDACIÓN PARA FLOWCLICKER

### Roadmap de Deployment Recomendado

**Fase 1: MVP y Testing (Mes 1-2)**
```
Deploy: Starknet Testnet (Sepolia)
Costo: $0 (testnet gratis)
Users: Equipo + beta testers (100-1000)
```

**Fase 2: Launch Público (Mes 3-6)**
```
Deploy: Starknet Mainnet
Costo: $1K-5K/día en gas (10K-100K usuarios)
Users: 10K-100K MAU
Por qué: Setup simple, ecosistema maduro, seguridad probada
```

**Fase 3: Escala Masiva (Mes 6+)**
```
Deploy: Starknet Appchain (L3) + Celestia DA
Costo: $3K-7K/mes fijo + $100-1K/día gas
Users: 100K-1M+ MAU
Por qué: Fees ultra bajos permiten escala masiva sin quebrar
```

### Breakeven Analysis

**¿Cuándo migrar a Appchain?**

```
Costo Starknet Mainnet (por mes):
- 10M clicks/día × $0.005 × 30 días = $1,500,000/mes

Costo Appchain + Celestia (por mes):
- Fijo: $5,000/mes
- Variable: 10M clicks/día × $0.00005 × 30 días = $15,000/mes
- TOTAL: $20,000/mes

Breakeven: ~400K clicks/día
```

**Conclusión:**
- < 400K clicks/día: Starknet Mainnet
- > 400K clicks/día: Appchain + Celestia

---

## 5. IMPLEMENTACIÓN PRÁCTICA

### Setup Inicial Recomendado (Starknet Mainnet)

**Paso 1: Desarrollo Local**
```bash
# Katana (local Starknet)
katana --disable-fee

# Deploy contracts localmente
cd contracts
sozo build
sozo migrate apply
```

**Paso 2: Testnet (Sepolia)**
```bash
# Setup wallet
export STARKNET_ACCOUNT=~/.starknet_accounts/deployer.json
export STARKNET_RPC=https://api.cartridge.gg/x/starknet/sepolia

# Deploy
sozo migrate apply --rpc-url $STARKNET_RPC

# Get World address
WORLD_ADDRESS=$(cat target/dev/manifest.json | jq -r '.world.address')

# Start Torii
torii --world $WORLD_ADDRESS --rpc $STARKNET_RPC
```

**Paso 3: Mainnet**
```bash
export STARKNET_RPC=https://api.cartridge.gg/x/starknet/mainnet

# Deploy (requiere STRK para gas)
sozo migrate apply --rpc-url $STARKNET_RPC

# Production Torii (con PostgreSQL)
docker-compose up -d torii
```

### Frontend Connection

```typescript
// lib/dojo/setup.ts
import { init } from '@dojoengine/sdk';
import { createDojoStore } from '@dojoengine/sdk/react';

const { client } = await init({
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL, // Starknet RPC
  toriiUrl: process.env.NEXT_PUBLIC_TORII_URL, // Torii indexer
  worldAddress: process.env.NEXT_PUBLIC_WORLD_ADDRESS,
});

// React hook
function useFlowClicker() {
  const { data: player } = useEntityQuery({
    model: 'Player',
    where: { wallet: address },
  });

  const executeClick = async () => {
    // Llama al sistema Click en Starknet
    await client.execute('click_system', 'execute_click', [timestamp]);
  };

  return { player, executeClick };
}
```

---

## 6. COSTOS PROYECTADOS (3 AÑOS)

### Opción A: Starknet Mainnet (Toda la vida)

```
Año 1 (100K usuarios, 10M clicks/día):
- Gas: $0.005/click × 10M × 365 = $18.25M
- Infra: $2K/mes × 12 = $24K
- TOTAL: $18.27M

Año 2 (500K usuarios, 50M clicks/día):
- Gas: $0.005 × 50M × 365 = $91.25M
- Infra: $5K/mes × 12 = $60K
- TOTAL: $91.31M

PROBLEMA: No escalable, costos explotan con usuarios
```

### Opción B: Starknet Mainnet → Appchain (Migración en Mes 6)

```
Año 1:
- Mes 1-6: Starknet Mainnet = $9M
- Mes 7-12: Appchain = $120K
- TOTAL: $9.12M

Año 2 (Appchain completo):
- Gas: $0.00005 × 50M × 365 = $912K
- RaaS: $5K × 12 = $60K
- Celestia: $500 × 12 = $6K
- TOTAL: $978K

Año 3 (1M usuarios, 100M clicks/día):
- Gas: $0.00005 × 100M × 365 = $1.825M
- RaaS: $7K × 12 = $84K
- TOTAL: $1.91M

AHORRO: ~$87M vs Starknet Mainnet solo
```

---

## 7. DECISIÓN FINAL

### Para FlowClicker, recomendamos:

**SHORT-TERM (MVP, 0-6 meses):**
```
✅ Starknet Testnet (Sepolia) → Mainnet
```
- Lanzamiento rápido (2-3 semanas)
- Ecosistema maduro (wallets, bridges)
- Dojo 1.0 production-ready
- Costos manejables para early stage

**LONG-TERM (Escala, 6+ meses):**
```
✅ Migración a Starknet Appchain + Celestia DA
```
- Fees 100x más bajos
- Control total (governance propia)
- Escalabilidad ilimitada
- ROI positivo cuando > 400K clicks/día

---

## 8. PRÓXIMOS PASOS

### Semana 1-2: Setup Testnet
- [ ] Instalar Dojo toolchain
- [ ] Deploy a Starknet Sepolia
- [ ] Conectar frontend
- [ ] Testing con beta users

### Semana 3-4: Mainnet Launch
- [ ] Auditoría de contratos
- [ ] Deploy a Starknet Mainnet
- [ ] Marketing y lanzamiento
- [ ] Monitorear costos de gas

### Mes 6+: Evaluar Migración
- [ ] Analizar costos de gas reales
- [ ] Si > 400K clicks/día → planear migración
- [ ] Contactar RaaS providers (Cartridge, Madara)
- [ ] Setup Appchain + Celestia DA

---

## CONCLUSIÓN

**FlowClicker se implementa en Starknet (L2), NO directamente en Celestia.**

Celestia es una **capa de disponibilidad de datos** que se usa opcionalmente en Fase 3 (Appchain L3) para reducir costos.

**Stack completo:**
```
Frontend (Next.js)
  ↓
Torii Indexer (GraphQL)
  ↓
Starknet L2 Mainnet (Fase 1-2) ← AQUÍ DEPLOYAMOS
  ↓
Ethereum L1 (Settlement final)

O en Fase 3:

Frontend (Next.js)
  ↓
Torii Indexer
  ↓
FlowClicker Appchain L3 ← AQUÍ DEPLOYAMOS
  ↓
Starknet L2 (Settlement)
  ↓
Celestia (Data Availability) ← Solo para almacenar datos baratos
```

**Empezamos en Starknet Mainnet, migramos a Appchain cuando tengamos tracción.**

¿Necesitas más detalles sobre alguna opción específica?
