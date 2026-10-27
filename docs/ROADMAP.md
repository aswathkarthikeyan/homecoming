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
- [ ] **Web3-Native Communication Dispatchers:**
  - Integration with **Push Protocol** and **XMTP** for direct wallet notifications.
  - Browser Web Push API integration for pure anonymous users.

---

## Phase 4: Causal Intelligence & Enterprise Flagship (v1.0.0)
*Target: Autonomous conversion optimization and bulletproof enterprise verification.*

- [x] **Contextual Multi-Armed Bandits:**
  - Thompson Sampling with Beta-Bernoulli conjugate priors to dynamically optimize recovery delays and channel routing.
- [x] **Econometric Lift Estimation:**
  - Stratified causal uplift estimation with CUPED variance reduction.
- [ ] **Synpress & Anvil Automated Testnet Fleet:**
  - Headless browser test suite interacting with live browser extensions against deliberately faulty smart contracts.
- [ ] **Developer Portal & Session Replay:**
  - Self-hosted analytics portal visualizing causal revenue lift, funnel drop-offs, and transaction execution graphs.
