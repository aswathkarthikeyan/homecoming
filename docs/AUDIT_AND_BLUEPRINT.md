# Homecoming: Architectural Audit & Flagship Transformation Blueprint

> **Status:** Formal Engineering Audit & Flagship Execution Plan

---

## Executive Summary: The Good vs. The Veneer

[Homecoming](file:///Users/workspace/Downloads/homecoming/README.md) has an exceptionally strong core narrative: **Web3 conversion abandonment is a multi-million-dollar blind spot**, and diagnosing *why* a transaction or connection failed—paired with a deterministic, safe, holdout-measured recovery mechanism—is a legitimate, venture-scale problem. The repository has clean code style, zero bloat, thoughtful safety rails in [src/recovery/safety.ts](file:///Users/workspace/Downloads/homecoming/src/recovery/safety.ts), and statistical holdout discipline in [src/measure/holdout.ts](file:///Users/workspace/Downloads/homecoming/src/measure/holdout.ts).

However, if evaluated today by a seasoned Web3 protocol engineer, a quantitative infra architect, or a tier-1 VC, **key pillars of the implementation will instantly read as a toy or synthetic prototype.**

---

## Part 1. The Brutal Audit: What Looks "Fake" or Like a Prototype

### 1. The 97.5% Eval Accuracy is Circular & Overfitted to Synthetic Data
* **The Claim:** [eval/REPORT.md](file:///Users/workspace/Downloads/homecoming/eval/REPORT.md) reports **97.0% Accuracy** and **100% Precision** across 6,000 cases.
* **The Reality:** It is a closed-loop simulation. In [eval/simulator.ts](file:///Users/workspace/Downloads/homecoming/eval/simulator.ts#L42-L43), the simulator synthesizes cases by literally stamping hardcoded strings like `"Sold out"`, `"Max supply reached"`, `"Slippage exceeded"`, `-32002`, and `4902`. In turn, [src/diagnosis/rules.ts](file:///Users/workspace/Downloads/homecoming/src/diagnosis/rules.ts#L17-L20) and [src/diagnosis/features.ts](file:///Users/workspace/Downloads/homecoming/src/diagnosis/features.ts) match these exact regexes and codes.
* **Why this breaks on live traffic:** In production Web3:
  - Wallets wrap errors in proprietary layers (e.g., MetaMask RPC errors vs. Rabby internal errors vs. Coinbase Smart Wallet passes).
  - Modern dApps use [viem](https://viem.sh) / [wagmi](https://wagmi.sh), where reverts are returned as raw hex data (`0x08c379a0` string or custom Solidity 4-byte selectors like `0xd92e233d` for custom contract errors).
  - Many RPC nodes fail with generic `-32603 Internal JSON-RPC error` or silent HTTP 429 drops without plain-text error messages.
  - The current model would degrade drastically on un-curated, real-world traffic.

---

### 2. The Browser Recorder Monkey-Patches Providers & Misses 80% of Modern Web3
* **Monkey-Patching Flaw:** In [src/sdk/recorder.ts:L81-L112](file:///Users/workspace/Downloads/homecoming/src/sdk/recorder.ts#L81-L112), `wrap()` mutates `provider.request = async (args) => ...`. This approach breaks in modern frameworks:
  - It interferes with [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) multi-injected provider discovery.
  - It conflicts with proxy wrappers used by Wagmi, RainbowKit, AppKit (Web3Modal), and Privy.
* **Missing Dominant Modern Primitives:**
  - **EIP-712 & Typed Signatures:** In [src/sdk/recorder.ts:L85-L90](file:///Users/workspace/Downloads/homecoming/src/sdk/recorder.ts#L85-L90), only `eth_sendTransaction`, `eth_requestAccounts`, and chain switches are intercepted. It does not monitor `eth_signTypedData_v4` or `personal_sign`. Nearly all DEX swaps (Uniswap Permit2, 1inch, CoW Protocol) and NFT marketplaces (OpenSea Seaport) rely on EIP-712 gasless permits or off-chain order signatures.
  - **Account Abstraction / ERC-4337 / EIP-5792:** No support for `wallet_sendCalls`, paymaster failures, userOp gas estimation reverts, or bundler dropouts.
  - **Non-EVM Ecosystems:** Zero support for Solana (`window.solana`, `signAndSendTransaction`), Cosmos, or Bitcoin/Ordinals.
  - **Embedded Wallets:** Ignores headless/embedded authentication flows like Privy, Dynamic, Turnkey, or Magic.

---

### 3. The "Anonymous User" Dilemma (The Elephant in the Room)
* **The Flaw:** In [src/recovery/playbooks.ts](file:///Users/workspace/Downloads/homecoming/src/recovery/playbooks.ts) and [src/channels/index.ts](file:///Users/workspace/Downloads/homecoming/src/channels/index.ts), the engine sends Telegram/Discord/Webhook alerts to a known user contact destination.
* **The Reality:** 95%+ of users who bounce during `wallet_not_installed`, `deeplink_blocked`, or wallet connection **are anonymous visitors who have not authenticated or surrendered their Telegram/Discord ID.**
* **The Consequence:** A recovery system that relies solely on outbound Web2 bot messaging can only address the tiny fraction of users who previously linked their social handle. To be viable, a recovery engine must operate **in-session, in-browser, and cross-device** first.

---

### 4. The Naive Bayes Model is a Prototype-Grade Baseline
* **The Implementation:** [src/diagnosis/classifier.ts](file:///Users/workspace/Downloads/homecoming/src/diagnosis/classifier.ts) implements Multinomial Naive Bayes trained on toy bag-of-words tokens generated from synthetic strings.
* **The Reality:** Naive Bayes treats all features as conditionally independent given the class. But in a transaction timeline, **order, temporal duration, and event sequence matter critically** (e.g., `connect_requested` followed immediately by `abandoned` is completely different from `connect_requested` followed by 30 seconds of inactivity).

---

### 5. Single-Node In-Memory Storage & Global Gas RPC
* **Store:** [src/server/store.ts](file:///Users/workspace/Downloads/homecoming/src/server/store.ts) uses a Node.js in-memory `Map` with synchronous `fs.writeFileSync` / `renameSync` JSON snapshotting. A single high-volume drop (e.g., 5,000 tx failures in 60 seconds) will block the Node.js event loop, cause memory bloat, and prevent running multi-instance horizontal replicas behind a load balancer.
* **Gas Oracle:** [src/server/app.ts](file:///Users/workspace/Downloads/homecoming/src/server/app.ts) queries a single `HOMECOMING_GAS_ORACLE_RPC_URL` via `eth_gasPrice`. Modern multi-chain dApps operate across Ethereum L1, Base, Arbitrum, Polygon, and Optimism with EIP-1559 base fee / priority fee dynamics.

---

## Part 2. The Flagship Vision: What "Only-One-of-Its-Kind" Looks Like

To move from a neat prototype to an industry-defining standard, Homecoming must become:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             HOMECOMING                                   │
│    The Universal Resilience & Self-Healing Protocol for Web3 Commerce    │
└──────────────────────────────────────────────────────────────────────────┘
                                     │
      ┌──────────────────────────────┼──────────────────────────────┐
      ▼                              ▼                              ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│   LAYER 1:   │             │   LAYER 2:   │             │   LAYER 3:   │
│ In-Flight    │             │ Deep Triage  │             │ Autonomous   │
│ Auto-Healing │ ──────────► │ & ABI Hex    │ ──────────► │ Omnichannel  │
│ (In-Session) │             │ Diagnostics  │             │ Recovery     │
└──────────────┘             └──────────────┘             └──────────────┘
```

1. **Not just a post-mortem bot, but an in-flight auto-healer:** Intercept errors and fix them **live in the user's interface before they abandon** (e.g., auto-switch RPC, one-click permit fallback, inline paymaster sponsorship, slippage tolerance auto-tuning).
2. **The "Sentry + Datadog + Klaviyo" of Web3:** Combine real-time ABI bytecode revert decoding with causal A/B testing and multi-channel re-engagement.
3. **Privacy-Preserving Web3 Attribution:** Reach anonymous users via browser notifications, wallet push (Push Protocol / XMTP), Farcaster Frames, and QR cross-device handoffs.

---

## Part 3. Strategic Pathways & Architectural Blueprints

### Pathway A: In-Flight Self-Healing SDK (Zero-Drop Architecture)

Rather than waiting 10 minutes to notify a lost user, fix failures dynamically in-session.

```
User Action ──► Failure Intercepted ──► Self-Healing Handler ──► Flow Saved
                     │                          │
                     ▼                          ▼
             Unresolvable Bounce       Out-of-Band Recovery
```

* **SDK Evolution:**
  - Build first-class integrations for `@homecoming/wagmi`, `@homecoming/rainbowkit`, and `@homecoming/solana-adapter`.
  - Non-invasive event listening using EIP-1193 standard event listeners (`chainChanged`, `accountsChanged`, `disconnect`) and transport wrappers rather than aggressive monkey-patching.
* **Instant Interceptors:**
  - `chain_not_added` / `wrong_network` ➔ Automatically prompt `wallet_addEthereumChain` or `wallet_switchEthereumChain` with pre-filled RPC, block explorer, and chain icons.
  - `gas_shock` / `insufficient_funds` ➔ Offer instantaneous fallback:
    - On-ramp modal trigger (Stripe / MoonPay).
    - Cross-chain bridge suggestion if funds exist on another L2 (Li.Fi / Socket API).
    - Gasless sponsor conversion if the dApp has an ERC-4337 Biconomy/ZeroDev paymaster enabled.
  - `slippage_or_quote_expired` ➔ Auto-fetch fresh quote and present a 1-click "Accept Updated Quote & Execute" micro-UI.

---

### Pathway B: Enterprise-Grade Diagnostic Engine (ABI & Revert Decoding)

Replace regex matching on string messages with deterministic byte-level protocol diagnostics:

1. **4-Byte Revert Selector & ABI Decoding:**
   - Integrate with the [Ethereum Signature Database (4byte.directory)](https://www.4byte.directory/) and [OpenChain](https://openchain.xyz/).
   - Unpack custom Solidity errors (e.g., `UniswapV3InvalidSlippage()`, `ERC20InsufficientAllowance(address,uint256,uint256)`).
2. **Transaction Simulation Pre-Flight:**
   - Integrate with Tenderly or Alchemy Pre-Flight / Trace APIs to diagnose failed transactions before submitting to mempool.
   - Detect front-running, sandwich attacks, or state changes between quote generation and submission.
3. **Wallet RPC Quirks Database:**
   - Catalog explicit RPC anomalies:
     - MetaMask Mobile browser header stripping.
     - iOS Safari Universal Link deep-link breaking on cold wallet launch.
     - Phantom Solana simulation deserialization errors.

---

### Pathway C: Privacy-Preserving Web3 Attribution (Solving the Anonymous User)

Solve the challenge of reaching users who abandoned before sharing Web2 contact info:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      ATTRIBUTION & REACH MATRIX                        │
├───────────────────┬──────────────────────────┬─────────────────────────┤
│ User State        │ Primary Channel          │ Recovery Mechanism      │
├───────────────────┼──────────────────────────┼─────────────────────────┤
│ Pure Anonymous    │ Local/Web Push API       │ PWA / Browser Push      │
│ Mobile / Desktop  │ Universal QR Bridge      │ Cross-Device Continuity │
│ Connected Wallet  │ Web3 Native Messaging   │ XMTP / Push Protocol    │
│ Opted-in Social   │ Direct Message           │ Telegram / Discord      │
└───────────────────┴──────────────────────────┴─────────────────────────┤
```

* **Ephemeral Session Continuity:** Store encrypted signed recovery tokens in `IndexedDB` / `sessionStorage`. If the user returns to any page on the dApp domain, Homecoming restores the exact abandoned cart/flow modal instantly.
* **Universal QR Bridge:** If desktop connection stalls, render an adaptive QR code carrying a signed, short-lived session payload (`EIP-4361` / SIWE compatible) that deep-links directly into MetaMask, Coinbase, or Phantom mobile apps.
* **Wallet-Native Messaging:** When a wallet address is known (even if disconnected), dispatch non-intrusive notifications via **Push Protocol** or **XMTP**, directing the user to their verified domain.

---

### Pathway D: Advanced Machine Learning & Causal Optimization

Upgrade the diagnosis and recovery decisioning stack:

1. **Sequential Deep Triage (Temporal Graph / Markov Chains):**
   - Replace Naive Bayes with a small, lightweight temporal model (e.g., XGBoost with sequential time-delta features or an ONNX-runtime sequence classifier).
   - Classify based on event velocity: time-to-first-click, signature modal dwell time, tab switching latency.
2. **Causal Lift & Multi-Armed Bandits:**
   - Upgrade [src/measure/holdout.ts](file:///Users/workspace/Downloads/homecoming/src/measure/holdout.ts) from static 50/50 A/B testing to **Contextual Multi-Armed Bandits (Thompson Sampling)**:
     - Dynamically balance recovery timing: Should we wait 2 minutes, 15 minutes, or 2 hours for *this* user context?
     - Optimize channel selection: In-app banner vs. Web Push vs. Telegram.
3. **Structured Small Language Model (SLM) Fallback:**
   - Use fine-tuned open weights (e.g., Llama 3 8B or Mistral NeMo) trained specifically on Web3 RPC logs and contract ABIs, constrained via JSON Schema validation (leveraging Structured Outputs) rather than heuristic string extraction in [src/diagnosis/llm/reasoner.ts:L39-L61](file:///Users/workspace/Downloads/homecoming/src/diagnosis/llm/reasoner.ts#L39-L61).

---

### Pathway E: Enterprise Production Architecture

Modernize the infrastructure to support millions of events with zero event-loop blocking:

* **Storage Engine:**
  - Transition from in-memory Map snapshotting ([src/server/store.ts](file:///Users/workspace/Downloads/homecoming/src/server/store.ts)) to **PostgreSQL** (with Prisma or Drizzle) for case state, with **ClickHouse** or **DuckDB** for high-throughput append-only event timelines.
* **Asynchronous Queue:**
  - Replace the in-memory array queue with **BullMQ** on Redis or AWS SQS, guaranteeing distributed execution, delayed jobs, retries, and rate-limiting per provider.
* **Multi-Chain Gas Oracles:**
  - Multi-chain gas feed pulling from EIP-1559 base fee queries across Ethereum, Arbitrum, Base, Optimism, and Polygon via a multi-provider RPC aggregator.

---

## Part 4. Phased Master Roadmap & Delivery Status

The recommended progression to establish Homecoming as the premier Web3 recovery standard:

### Phase 1: Real-World Hardening & Protocol Accuracy [DELIVERED]
1. **Unify Error Decoding (`src/decoder`):** Built contract error decoder library that converts raw RPC hex reverts into human-readable failure reasons across 4,638+ cataloged selectors.
2. **EIP-712 & EIP-6963 Integration (`src/sdk`):** Expanded recorder SDK to intercept typed data signatures (Permits/Orders) and multi-wallet discovery without invasive monkey-patching.
3. **Multi-Chain Gas Engine (`src/oracle`):** Dynamic EIP-1559 base + priority fee calculation and L1 rollup data availability tracking.

### Phase 2: In-Session Interception & Self-Healing [DELIVERED]
1. **In-Flight UI Components (`src/ui`):** Glassmorphic accessible modals and state machine for network switching, quote refresh, and cross-chain balance rescue.
2. **Cross-Chain Balance Rescue (`src/crosschain`):** Across V3 and Circle CCTP 1-click bridge engine solving zero-balance deadlocks.
3. **Cross-Device Deep-Link Engine (`src/healing/registry/handoff.ts`):** Mobile QR bridge generation with tamper-resistant EIP-4361 signed payloads.

### Phase 3: Infrastructure Scale & Web3-Native Channels [DELIVERED]
1. **Web3 Communication Layers (`src/channels/web3`):** Push Protocol, XMTP direct wallet messaging, Farcaster Frames v2 interactive in-feed recovery, and W3C Web Push for anonymous users.
2. **Pre-Flight Fork Simulation (`src/simulation`):** In-browser `eth_simulateV1` / `eth_call` state-override fork simulation with asset balance diff tables.
3. **Production Data Schemas (`src/server/db`):** Scalable ClickHouse and PostgreSQL multi-tenant schemas.

### Phase 4: Autonomous Causal Intelligence & Multi-VM [DELIVERED]
1. **Account Abstraction & EIP-7702 Sponsorship (`src/paymaster`):** Merchant gas sponsorship engine, ERC-20 paymaster (USDC/USDT), and EIP-7702 dynamic delegation code generator.
2. **EIP-5792 Atomic Call Batching (`src/batch`):** Single-signature `wallet_sendCalls` bundling for token approval + contract execution.
3. **Mempool "Tx Doctor" Sentinel (`src/mempool`):** Real-time pending transaction stagnation detection, 1-click replacement (+12% gas bump), and MEV-Blocker routing.
4. **Multi-VM Expansion (`src/svm`):** Solana SVM Anchor IDL revert decoding (1770 slippage, 1771 funds) and Compute Budget optimizer.
5. **In-Browser Local SLM (`src/ai`):** Offline reasoning engine running quantized small language models (SmolLM2 / Llama-3.2) in WebAssembly with zero API costs.
6. **Thompson Sampling Bandit & CUPED Uplift (`src/intelligence`):** Dynamic exploration/exploitation balancing and causal revenue variance reduction.
