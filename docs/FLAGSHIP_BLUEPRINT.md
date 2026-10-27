# Homecoming: Flagship Architecture & Engineering Blueprint

> **Status:** Specification & Master Architecture Document  
> **Target Scale:** 150,000+ Productive Lines of Code across Monorepo Workspaces  
> **Core Mandate:** Transform Homecoming from a reactive notification prototype into the definitive, category-creating **Universal Resilience & Self-Healing Protocol for Web3 Commerce**.

---

## 1. Executive Summary & Foundational Paradigm Shift

### The Problem
Traditional analytics platforms (Mixpanel, Google Analytics, Dune) report *where* users bounce, but cannot decipher why a cryptographic interaction aborted. Marketing automation tools (HubSpot, Braze, Klaviyo) dispatch generic re-engagement blasts to social handles without addressing the cryptographic roadblock that stopped the user.

Most failed Web3 transactions never produce an on-chain event. They stall in the client:
- Deep links fail to trigger target mobile wallets on iOS Safari.
- RPC nodes time out or return cryptic `-32603 Internal JSON-RPC` error payloads.
- Custom smart contract reverts output raw 4-byte hexadecimal selectors (`0xd92e233d`) without human-readable explanations.
- Dynamic gas fee spikes induce sticker shock.
- Missing token allowances or quote slippage abort multi-hop routing.

### The Solution: Homecoming Flagship
Homecoming re-architects Web3 transaction recovery through a three-tier resilience model:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HOMECOMING FLAGSHIP TIERS                       │
├───────────────────┬────────────────────────────────────────────────────┤
│ Tier 1: In-Flight │ Resolves errors live in the browser/app within     │
│ Self-Healing      │ milliseconds before abandonment occurs.            │
├───────────────────┼────────────────────────────────────────────────────┤
│ Tier 2: Bytecode  │ Dissects raw RPC hex blobs, ABI selectors, and     │
│ Diagnostics       │ wallet client quirks deterministically.            │
├───────────────────┼────────────────────────────────────────────────────┤
│ Tier 3: Causal    │ Dispatches cryptographically signed, safe Resume   │
│ Omnichannel       │ Links across Web Push, XMTP, and Web2 channels     │
│ Recovery          │ measured strictly against non-messaged holdouts.   │
└───────────────────┴────────────────────────────────────────────────────┘
```

---

## 2. Comprehensive Architectural Audit: De-Risking the Prototype

To transition from prototype to enterprise standard, the following architectural vulnerabilities have been identified and resolved:

| Prototype Vulnerability | Root Cause in V0.1 | Flagship Solution |
| :--- | :--- | :--- |
| **Synthetic Eval Overfitting** | `eval/simulator.ts` emitted exact string literals matched by `src/diagnosis/rules.ts`. | Replaced with real-world RPC hex replay fixtures and decentralized 4-byte ABI selector decoding (`src/decoder/`). |
| **Fragile Monkey-Patching** | Direct mutation of `window.ethereum.request` in `src/sdk/recorder.ts`. | Non-invasive proxy wrapper preserving EventEmitter chains, supporting EIP-6963 provider announcements and custom Viem transports. |
| **Ignored Modern Web3 Flows** | Handled only basic ETH transfers and account connections. | First-class monitoring for EIP-712 typed permits (Permit2/Seaport), SIWE (`personal_sign`), and ERC-4337 (`wallet_sendCalls`). |
| **Anonymous User Dead-End** | Outbound messaging required pre-existing Telegram/Discord handles. | In-flight modal recovery, encrypted local session persistence (`IndexedDB`), and cross-device QR handoffs. |
| **Single-Node In-Memory Store** | In-memory `Map` with synchronous `fs.writeFileSync`. | Distributed event pipeline architecture targeting PostgreSQL + ClickHouse + BullMQ. |
| **Static Gas Oracles** | Single RPC URL with legacy `eth_gasPrice`. | Multi-chain EIP-1559 Base + Priority Fee oracle with L1 data rollup overhead tracking (Base, Arbitrum, OP). |

---

## 3. Productive Scale Blueprint: High-Leverage Sizing Matrix

To achieve 150,000–300,000 lines of productive code without boilerplate or synthetic filler, the system expands across seven dedicated domains:

```
                                  HOMECOMING MONOREPO
                                           │
    ┌───────────────────────┬──────────────┴──────────────┬────────────────────────┐
    ▼                       ▼                             ▼                        ▼
@homecoming/decoder     @homecoming/sdk               @homecoming/healing      @homecoming/server
 (ABI & Error Matrix)    (Multi-Stack Telemetry)       (In-Session Recovery)    (Ingest & Pipeline)
    │                       │                             │                        │
    ├── 4-Byte Selectors    ├── EIP-6963 Discovery        ├── Modal Interceptors   ├── ClickHouse Engine
    ├── Wallet Quirks       ├── EIP-712 Permits           ├── RPC Fallback Matrix  ├── BullMQ Dispatcher
    └── AA / SVM Reverts    └── Viem / Wagmi Transports   └── Cross-Device QR      └── Causal Bandits
```

### Domain 1: Universal Web3 Error Matrix (`@homecoming/decoder`)
- **Estimated Scope:** 35,000 – 45,000 LOC
- **Purpose:** Decodes raw on-chain hex reverts, ABI custom errors, and client-specific JSON-RPC error codes into structured, actionable domain diagnostics.
- **Key Modules:**
  - `abi.ts`: EVM standard errors (`Error(string)`, `Panic(uint256)`), Uniswap v2/v3/v4 & Permit2 custom errors, OpenZeppelin v5 custom errors, and ERC-4337 Account Abstraction error codes (`AA10` through `AA34`).
  - `wallets.ts`: Normalization catalog for 30+ Web3 wallets (MetaMask, Rabby, Coinbase Smart Wallet, Phantom, Rainbow, Safe, Trust).
  - `svm.ts`: Solana Anchor IDL instruction error parsers and compute budget limits.

### Domain 2: Multi-Ecosystem Client SDK Suite (`@homecoming/sdk`)
- **Estimated Scope:** 30,000 – 40,000 LOC
- **Purpose:** Non-invasive telemetry capture across web, mobile, and embedded wallet environments.
- **Key Modules:**
  - `interceptor.ts`: Transparent proxy interceptor for EIP-1193, EIP-6963, and Solana provider standards.
  - `typedData.ts`: EIP-712 permit and off-chain order signature validator.
  - `wagmi.ts` / `viem.ts`: Native decorators and custom transports.
  - `session.ts`: Local session storage journal ensuring transaction context survives browser reloads.

### Domain 3: In-Flight Self-Healing Engine (`@homecoming/healing`)
- **Estimated Scope:** 25,000 – 35,000 LOC
- **Purpose:** Intercepts failures in-session and surfaces instant 1-click remediation actions.
- **Key Modules:**
  - `engine.ts`: In-session triage state machine matching failures to immediate UI remedies.
  - `chains.ts`: Verified multi-chain catalog (Ethereum, Base, Arbitrum, Optimism, Polygon, Avalanche, BSC, ZKsync, Solana) with automated RPC fallback matrixes.
  - `qr.ts`: Cross-device state handoff engine with EIP-4361 / SIWE tokenization.

### Domain 4: Distributed Event Ingestion & Persistence (`@homecoming/server`)
- **Estimated Scope:** 35,000 – 50,000 LOC
- **Purpose:** High-throughput ingestion, scheduling, and multi-tenant telemetry.
- **Key Modules:**
  - `clickhouse/`: Columnar schema definitions, partition policies, and rollup aggregation queries.
  - `queue/`: BullMQ distributed worker fleet handling delayed jobs, exponential backoff, and rate limits.
  - `auth/`: Multi-tenant API key management, role-based access control, and HMAC webhook dispatchers.

### Domain 5: Simulation & Mempool Telemetry Engine (`@homecoming/mempool`)
- **Estimated Scope:** 20,000 – 30,000 LOC
- **Purpose:** Pre-flight validation and in-flight transaction lifecycle tracking.
- **Key Modules:**
  - `simulate.ts`: Pre-flight fork simulation via `eth_call` and debug traces.
  - `mempool.ts`: WebSocket listener tracking pending tx stagnation, replacement, and dropped nonces.
  - `gas.ts`: Multi-chain EIP-1559 base + priority fee calculations and L1 rollup data overhead estimation.

### Domain 6: Causal Intelligence & Optimization (`@homecoming/intelligence`)
- **Estimated Scope:** 15,000 – 20,000 LOC
- **Purpose:** Rigorous econometric measurement and machine learning optimization.
- **Key Modules:**
  - `bandit.ts`: Contextual Multi-Armed Bandit (Thompson Sampling with Beta-Bernoulli conjugate priors) for dynamic timing and channel optimization.
  - `uplift.ts`: Stratified causal uplift estimation with CUPED variance reduction and bootstrap confidence intervals.

### Domain 7: Test Harnesses & Fuzzing Infrastructure (`@homecoming/testnet`)
- **Estimated Scope:** 25,000 – 35,000 LOC
- **Purpose:** End-to-end verification across real-world fault conditions.
- **Key Modules:**
  - `contracts/`: Intentionally faulty Solidity contracts (out-of-gas, custom reverts, paused, blacklisted).
  - `synpress/`: Automated headless browser tests interacting with live browser extensions.
  - `fuzz/`: Fast-check property fuzzers validating timeline decoders and cryptographic tokens.

---

## 4. Cryptographic Security & Anti-Phishing Invariants

Homecoming enforces non-negotiable security rules in code:
1. **Zero Secret Exposure:** Resume Links never serialize private keys, seed phrases, or unmasked user handles.
2. **Deterministic Origin Verification:** Links must match the verified project origin exactly. Multiple links or foreign domains trigger an immediate safety veto.
3. **No Urgency Exploitation:** Phishing markers ("act now", "claim airdrop", "wallet suspended", "verify seed") are blocked at the compiler level via [src/recovery/safety.ts](file:///Users/workspace/Downloads/homecoming/src/recovery/safety.ts).
4. **Timing-Safe Token Verification:** HMAC-SHA256 signatures are verified using `crypto.timingSafeEqual` to eliminate timing side-channel attacks.

---

## 5. Summary

By executing this architectural blueprint, Homecoming transitions into an indispensable, category-defining enterprise standard for Web3 commerce resilience.
