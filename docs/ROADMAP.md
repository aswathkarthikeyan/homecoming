# Homecoming Engineering Roadmap: From V0.1 to V1.0 Flagship

```
   v0.1.0 Prototype         v0.2.0 Hardening         v0.5.0 Self-Healing       v1.0.0 Enterprise Standard
┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐   ┌─────────────────────────┐
│ • Regex triage     │   │ • ABI Error Matrix │   │ • In-flight Modals │   │ • Distributed ClickHouse│
│ • Naive Bayes      │──►│ • EIP-712/6963 SDK │──►│ • Fallback RPCs    │──►│ • BullMQ Worker Fleet   │
│ • Simple simulator │   │ • Multi-chain Gas  │   │ • Cross-device QR  │   │ • Contextual Bandits    │
│ • Memory store     │   │ • Replay Fixtures  │   │ • Web Push & XMTP  │   │ • Synpress E2E Testnet  │
└────────────────────┘   └────────────────────┘   └────────────────────┘   └─────────────────────────┘
```

---

## Phase 1: Protocol Error Matrix & SDK Hardening (v0.2.0)
*Target: Eliminate synthetic overfitting and brittle monkey-patching.*

- [x] **Universal 4-Byte Revert Decoder:**
  - Standard `Error(string)` (`0x08c379a0`) and `Panic(uint256)` (`0x4e487b71`) decoders.
  - OpenZeppelin v5 custom contract errors (`ERC20InsufficientBalance`, `ERC20InsufficientAllowance`, `EnforcedPause`).
  - Uniswap v2/v3/v4 & Permit2 error selectors (`UniswapV3InvalidSlippage`, `SignatureExpired`, `TransferFailed`).
  - ERC-4337 Account Abstraction error codes (`AA10` through `AA34`).
- [x] **Wallet Error Normalizer:**
  - Standardize error dictionaries for MetaMask, Rabby, Coinbase Smart Wallet, Phantom, Rainbow, Safe, and Trust.
- [x] **Non-Invasive Provider Interceptor:**
  - Transparent proxy wrapping that preserves EventEmitter listeners and handles EIP-6963 provider announcements.
  - Support for `eth_signTypedData_v4` (EIP-712 permits) and `personal_sign` (SIWE).
- [x] **Multi-Chain Gas Oracle Engine:**
  - EIP-1559 Base + Priority Fee calculations with L1 data rollup overhead for Base, Arbitrum, and Optimism.

---

## Phase 2: In-Flight Self-Healing & Client Recovery (v0.5.0)
*Target: Intercept and resolve transaction roadblocks live before the user abandons.*

- [x] **In-Session Triage State Machine:**
  - Instant classification of in-flight roadblocks into immediate UI remedies.
  - Pre-packaged verified chain switch definitions for 10+ EVM and SVM networks.
- [x] **Cross-Device Continuity Bridge:**
  - Short-lived, cryptographically signed QR handoff tokens enabling seamless desktop-to-mobile wallet continuation.
- [ ] **Headless UI Component Library (`@homecoming/react`):**
  - Plug-and-play accessible modals and drawer banners for network switching, quote refresh, and gas notifications.
- [ ] **Encrypted Local Journal (`IndexedDB`):**
  - Retain pending cart / mint state across browser reloads without sending PII to a server.

---

## Phase 3: Distributed Infrastructure & Web3 Native Channels (v0.8.0)
*Target: Scalability to hundreds of thousands of events per second with zero event-loop blocking.*

- [ ] **ClickHouse Analytical Pipeline:**
  - High-throughput append-only timeline ingestion with automated partition management.
- [ ] **PostgreSQL + BullMQ Queue Fleet:**
  - Persistent relational state for projects, API keys, and rate limits.
  - Distributed queue workers for delayed recovery jobs and webhook dispatches.
- [x] **Web3-Native Communication Dispatchers (`src/channels/web3`):**
  - Integration with **Push Protocol** and **XMTP** for direct wallet notifications.
  - Farcaster Frames v2 interactive one-click in-feed checkout recovery.
  - Browser W3C Web Push API integration for pure anonymous users.

---

## Phase 4: Autonomous Causal Intelligence & Flagship Superpowers (v1.0.0)
*Target: Autonomous conversion optimization, multi-VM coverage, and pre-flight resilience.*

- [x] **Pre-Flight Fork Simulation & Asset Diffs (`src/simulation`):**
  - In-browser state-override fork simulator via `eth_simulateV1` / `eth_call`.
  - Detailed asset delta parsing, transfer event logging, and slippage violation detection.
- [x] **Account Abstraction & EIP-7702 Gasless Sponsorship (`src/paymaster`):**
  - Merchant gas sponsorship policy engine and ERC-20 token paymaster (USDC/USDT).
  - EIP-7702 dynamic delegation code (`0xef0100 + address`) formatting and validation.
- [x] **EIP-5792 Atomic Call Batching (`src/batch`):**
  - Single-signature `wallet_sendCalls` bundling for token approval + contract execution.
- [x] **Mempool "Tx Doctor" & Nonce Acceleration (`src/mempool`):**
  - Stagnation detection for pending transactions and 1-click replacement payload generator (+12% gas bump).
  - MEV-Blocker & Private RPC routing recommendations.
- [x] **Multi-VM Expansion: Solana SVM (`src/svm`):**
  - Anchor IDL error decoding (`0x1770` slippage, `0x1771` funds) and dynamic Compute Budget optimizer.
- [x] **In-Browser Local SLM Offline Reasoner (`src/ai`):**
  - Zero-cost offline reasoning using quantized small language models (SmolLM2 / Llama-3.2) constrained to Homecoming taxonomy.
- [x] **Contextual Multi-Armed Bandits:**
  - Thompson Sampling with Beta-Bernoulli conjugate priors to dynamically optimize recovery delays and channel routing.
- [x] **Econometric Lift Estimation:**
  - Stratified causal uplift estimation with CUPED variance reduction.
