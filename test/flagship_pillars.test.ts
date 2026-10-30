import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PreFlightSimulator,
  PaymasterPolicyEngine,
  formatEip7702Delegation,
  isEip7702Delegated,
  extractEip7702Implementation,
  AtomicBatcher,
  TxDoctorSentinel,
  xmtpSender,
  pushProtocolSender,
  generateResumeFarcasterFrame,
  buildWebPushPayload,
  decodeSvmError,
  SvmComputeBudgetOptimizer,
  LocalSlmReasoner,
} from "../src/index.js";

// ==========================================
// PILLAR 1: PRE-FLIGHT FORK SIMULATION TESTS
// ==========================================
test("PreFlightSimulator parses simulated asset changes and detects reverts", async () => {
  const simulator = new PreFlightSimulator();

  // Test 1: Native ETH transfer
  const ethSim = await simulator.simulate({
    from: "0x1111111111111111111111111111111111111111",
    to: "0x2222222222222222222222222222222222222222",
    value: "1000000000000000000", // 1 ETH
    chainId: 1,
  });

  assert.equal(ethSim.success, true);
  assert.equal(ethSim.assetChanges.length, 1);
  assert.equal(ethSim.assetChanges[0]!.symbol, "ETH");
  assert.equal(ethSim.assetChanges[0]!.amountFormatted, 1);
  assert.equal(ethSim.assetChanges[0]!.direction, "out");

  // Test 2: ERC-20 transfer(address,uint256) selector 0xa9059cbb
  const tokenRecipient = "3333333333333333333333333333333333333333";
  const tokenAmountHex = (100n * 10n ** 18n).toString(16).padStart(64, "0");
  const transferData = `0xa9059cbb${tokenRecipient.padStart(64, "0")}${tokenAmountHex}`;

  const erc20Sim = await simulator.simulate({
    from: "0x1111111111111111111111111111111111111111",
    to: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    data: transferData,
    chainId: 1,
  });

  assert.equal(erc20Sim.success, true);
  assert.equal(erc20Sim.assetChanges.length, 1);
  assert.equal(erc20Sim.assetChanges[0]!.amountFormatted, 100);
  assert.equal(erc20Sim.assetChanges[0]!.to, "0x" + tokenRecipient);

  // Test 3: Zero address revert detection
  const zeroRevert = await simulator.simulate({
    from: "0x1111111111111111111111111111111111111111",
    to: "0x0000000000000000000000000000000000000000",
    data: "0x12345678",
    chainId: 1,
  });

  assert.equal(zeroRevert.success, false);
  assert.ok(zeroRevert.revertReason?.includes("zero address"));
});

// ==========================================
// PILLAR 2: ACCOUNT ABSTRACTION & EIP-7702 TESTS
// ==========================================
test("PaymasterPolicyEngine evaluates merchant sponsorship and ERC-20 paymaster", () => {
  const engine = new PaymasterPolicyEngine({
    projectId: "shop_alpha",
    sponsorNativeGas: true,
    maxCostPerTxUsd: 1.5,
    maxSponsorshipPerUserMonthlyUsd: 50,
    allowedContractTargets: ["0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"],
    acceptedErc20Tokens: [
      {
        symbol: "USDC",
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        exchangeRateUsd: 1.0,
        decimals: 6,
      },
    ],
    paymasterContractAddress: "0x5555555555555555555555555555555555555555",
  });

  // 1. Merchant gas sponsorship for cheap tx
  const cheapTx = engine.evaluate({
    userAddress: "0x1111111111111111111111111111111111111111",
    targetContract: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    estimatedGasUnits: 100000,
    gasPriceGwei: 2,
    ethPriceUsd: 2500, // 100k * 2 gwei = 0.0002 ETH = $0.50
  });

  assert.equal(cheapTx.eligible, true);
  assert.equal(cheapTx.mode, "gasless_merchant_sponsored");
  assert.ok(cheapTx.paymasterAndData?.startsWith("0x5555555555555555555555555555555555555555"));

  // 2. Fallback to ERC-20 Paymaster for expensive tx where merchant limit is exceeded
  const expensiveTx = engine.evaluate({
    userAddress: "0x1111111111111111111111111111111111111111",
    targetContract: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    estimatedGasUnits: 500000,
    gasPriceGwei: 5,
    ethPriceUsd: 3000, // 500k * 5 gwei = 0.0025 ETH = $7.50
    userTokenBalances: [
      {
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        balanceFormatted: 50.0, // 50 USDC
      },
    ],
  });

  assert.equal(expensiveTx.eligible, true);
  assert.equal(expensiveTx.mode, "erc20_token_paymaster");
  assert.equal(expensiveTx.paymentToken?.symbol, "USDC");
  assert.ok(expensiveTx.paymentToken!.requiredTokenFormatted > 7);

  // 3. Rejected target contract
  const unauthorizedTx = engine.evaluate({
    userAddress: "0x1111111111111111111111111111111111111111",
    targetContract: "0x9999999999999999999999999999999999999999",
    estimatedGasUnits: 100000,
    gasPriceGwei: 2,
    ethPriceUsd: 2500,
  });

  assert.equal(unauthorizedTx.eligible, false);
  assert.equal(unauthorizedTx.mode, "rejected");
});

test("EIP-7702 delegation formatting and code verification", () => {
  const implementation = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  const delegationCode = formatEip7702Delegation(implementation);

  assert.equal(delegationCode.startsWith("0xef0100"), true);
  assert.equal(delegationCode.length, 48); // 0x (2) + ef0100 (6) + 40 address hex = 48
  assert.equal(isEip7702Delegated(delegationCode), true);
  assert.equal(
    extractEip7702Implementation(delegationCode)?.toLowerCase(),
    implementation.toLowerCase()
  );
});

// ==========================================
// PILLAR 2.5: EIP-5792 ATOMIC BATCHING TESTS
// ==========================================
test("AtomicBatcher builds EIP-5792 approval + execution batch", () => {
  const token = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const marketplace = "0x1111111111111111111111111111111111111111";

  const batch = AtomicBatcher.buildApprovalAndExecutionBatch({
    from: "0x2222222222222222222222222222222222222222",
    chainId: 8453, // Base
    tokenAddress: token,
    spender: marketplace,
    approveAmount: 1000000n, // 1 USDC
    executionCall: {
      to: marketplace,
      data: "0x12345678",
      value: "0x0",
    },
    paymasterServiceUrl: "https://paymaster.example.com/rpc",
  });

  assert.equal(batch.version, "1.0");
  assert.equal(batch.chainId, "0x2105"); // 8453 in hex
  assert.equal(batch.calls.length, 2);
  assert.ok(batch.calls[0]!.data?.startsWith("0x095ea7b3")); // approve selector
  assert.equal(batch.calls[1]!.to, marketplace);
  assert.equal(batch.capabilities?.atomicRequired, true);

  // Plan execution check
  const plan = AtomicBatcher.planExecution(batch.calls, batch.from, 8453, {
    "0x2105": { atomicRequired: true },
  });
  assert.equal(plan.supported, true);
  assert.equal(plan.rpcMethod, "wallet_sendCalls");
});

// ==========================================
// PILLAR 3: "TX DOCTOR" MEMPOOL SENTINEL TESTS
// ==========================================
test("TxDoctorSentinel detects stagnation and formats replacement transactions", () => {
  const doctor = new TxDoctorSentinel({ stagnationThresholdSec: 30 });
  const txHash = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

  doctor.track({
    hash: txHash,
    chainId: 1,
    from: "0x1111111111111111111111111111111111111111",
    to: "0x2222222222222222222222222222222222222222",
    nonce: 42,
    valueWei: "0",
    data: "0x",
    maxFeePerGasGwei: 15,
    maxPriorityFeePerGasGwei: 1.5,
    submittedAt: Date.now() - 60000, // 60s ago
  });

  // Stagnation diagnosis when base fee spiked to 25 Gwei
  const report = doctor.diagnoseStagnation(txHash, 25);
  assert.equal(report.isStagnant, true);
  assert.equal(report.underpriced, true);
  assert.equal(report.recommendation, "speed_up");
  assert.ok(report.feeShortfallGwei >= 10);

  // Speed-up payload generation
  const speedUp = doctor.buildSpeedUpPayload(txHash, 25, {
    useMevProtection: true,
  });
  assert.equal(speedUp.action, "speed_up");
  assert.equal(speedUp.nonce, 42);
  assert.ok(speedUp.maxFeePerGasGwei > 15 * 1.12); // Must beat 1.12x rule
  assert.equal(speedUp.recommendedRpcUrl, "https://rpc.mevblocker.io");

  // Cancellation payload generation
  const cancel = doctor.buildCancelPayload(txHash, 25);
  assert.equal(cancel.action, "cancel");
  assert.equal(cancel.to, "0x1111111111111111111111111111111111111111"); // Self-send
  assert.equal(cancel.value, "0");
});

// ==========================================
// PILLAR 4: WEB3 NATIVE CHANNELS TESTS
// ==========================================
test("Web3 channels: XMTP, Push, Farcaster Frames, and Web Push", async () => {
  const recipient = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

  // 1. XMTP Dispatcher
  const xmtp = xmtpSender();
  const xmtpRes = await xmtp(recipient, "Resume your mint at https://shop.example/resume?t=abc");
  assert.equal(xmtpRes.success, true);
  assert.equal(xmtpRes.channel, "xmtp");
  assert.ok(xmtpRes.messageId?.startsWith("xmtp_msg_"));

  // 2. Push Protocol Dispatcher
  const push = pushProtocolSender({
    channelAddress: "0x1111111111111111111111111111111111111111",
  });
  const pushRes = await push(recipient, {
    title: "Mint Interrupted",
    body: "Tap to resume with gas pre-sponsored",
    ctaUrl: "https://shop.example/resume?t=abc",
  });
  assert.equal(pushRes.success, true);
  assert.equal(pushRes.channel, "push_protocol");

  // 3. Farcaster Frame v2 generator
  const frame = generateResumeFarcasterFrame({
    title: "Resume Mint on Base",
    imageUrl: "https://shop.example/frame-preview.png",
    buttons: [
      { label: "1-Click Resume", action: "link", target: "https://shop.example/resume?t=abc" },
    ],
    postUrl: "https://shop.example/api/frame",
  });
  assert.equal(frame.metaTags["fc:frame"], "vNext");
  assert.equal(frame.metaTags["fc:frame:button:1"], "1-Click Resume");
  assert.ok(frame.html.includes("<meta property=\"fc:frame\""));

  // 4. W3C Web Push payload builder
  const webPushJson = buildWebPushPayload({
    title: "Checkout Saved",
    body: "Your item is reserved. Resume now.",
    resumeUrl: "https://shop.example/resume?t=abc",
  });
  const parsed = JSON.parse(webPushJson);
  assert.equal(parsed.notification.title, "Checkout Saved");
  assert.equal(parsed.notification.data.url, "https://shop.example/resume?t=abc");
});

// ==========================================
// PILLAR 5: SOLANA SVM & IN-BROWSER SLM TESTS
// ==========================================
test("Solana SVM error decoder and Compute Budget optimizer", () => {
  // 1. Anchor framework error 1770 (ConstraintSlippage)
  const slippageErr = decodeSvmError(1770, "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");
  assert.equal(slippageErr.errorName, "ConstraintSlippage");
  assert.equal(slippageErr.category, "slippage");
  assert.equal(slippageErr.recoverable, true);

  // 2. Anchor framework error 1771 (ConstraintFunds)
  const fundsErr = decodeSvmError("custom program error: 0x6eb"); // 1771 in hex
  assert.equal(fundsErr.errorName, "ConstraintFunds");
  assert.equal(fundsErr.category, "funds");

  // 3. Compute Budget instruction log
  const cuErr = decodeSvmError("Program failed: consumed 200000 of 200000 compute units");
  assert.equal(cuErr.errorName, "ComputeBudgetExhausted");
  assert.equal(cuErr.category, "compute_budget");

  // 4. Compute Budget priority fee optimizer
  const budget = SvmComputeBudgetOptimizer.estimatePriorityFee({
    level: "turbo",
    isCongested: true,
    estimatedUnits: 400000,
  });
  assert.equal(budget.priorityLevel, "turbo");
  assert.ok(budget.microLamportsPerCU > 100000);
  assert.equal(budget.jitoTipLamports, 100000);
  assert.ok(budget.estimatedCostSol > 0);
});

test("LocalSlmReasoner builds constrained prompt and runs offline inference", async () => {
  const reasoner = new LocalSlmReasoner();

  const prompt = reasoner.buildLocalPrompt({
    timeline: [
      { type: "connect_requested", t: 100 },
      { type: "chain_switch_failed", t: 500, code: 4902 },
      { type: "abandoned", t: 1200 },
    ],
    context: { flow: "purchase", platform: "desktop", inAppBrowser: false, chainId: 1 },
    allowedCauses: ["wrong_network", "insufficient_funds", "gas_shock"],
  });

  assert.ok(prompt.includes("You are a Web3 transaction resilience diagnostic agent"));
  assert.ok(prompt.includes("wrong_network"));

  // Offline inference test
  const result = await reasoner.infer({
    timeline: [
      { type: "connect_requested", t: 100 },
      { type: "chain_switch_failed", t: 500, code: 4902 },
      { type: "abandoned", t: 1200 },
    ],
    context: { flow: "purchase", platform: "desktop", inAppBrowser: false, chainId: 1 },
    allowedCauses: ["wrong_network", "insufficient_funds", "gas_shock"],
  });

  assert.equal(result.cause, "wrong_network");
  assert.ok(result.confidence > 0.8);
  assert.equal(result.source, "local_slm_offline");
});
