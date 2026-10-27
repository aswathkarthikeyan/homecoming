import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import {
  keccak256,
  encodeAcrossDepositV3,
  encodeErc20Approve,
  encodeErc20Transfer,
  scanMultiChainBalances,
  buildCrossChainRescuePlan,
  CrossChainRescueEngine,
  renderCrossChainRescueModalHtml,
  resolveInFlight,
  createApp,
  Store,
  defaultConfig,
} from "../src/index.js";
import type { ChainBalance } from "../src/crosschain/types.js";

test("keccak256 computes standard Ethereum function selectors", () => {
  const transferSel = keccak256("transfer(address,uint256)").slice(0, 10);
  assert.equal(transferSel, "0xa9059cbb");

  const balanceOfSel = keccak256("balanceOf(address)").slice(0, 10);
  assert.equal(balanceOfSel, "0x70a08231");

  const depositV3Sel = keccak256("depositV3(address,address,address,address,uint256,uint256,uint256,address,uint32,uint32,uint32,bytes)").slice(0, 10);
  assert.equal(depositV3Sel, "0x7b939232");
});

test("encodeAcrossDepositV3 formats valid calldata", () => {
  const calldata = encodeAcrossDepositV3({
    depositor: "0x1111111111111111111111111111111111111111",
    recipient: "0x2222222222222222222222222222222222222222",
    inputToken: "0x0000000000000000000000000000000000000000",
    outputToken: "0x0000000000000000000000000000000000000000",
    inputAmount: 100000000000000000n, // 0.1 ETH
    outputAmount: 99800000000000000n,
    destinationChainId: 8453, // Base
  });

  assert.ok(calldata.startsWith("0x7b939232"));
  assert.ok(calldata.length > 700);
});

test("scanMultiChainBalances aggregates multi-chain assets with mock fetcher", async () => {
  const mockFetcher = async (url: string, body: any) => {
    // Return 0.5 ETH on Arbitrum (42161) and 0 ETH on Base (8453)
    if (body.method === "eth_getBalance") {
      if (url.includes("arbitrum")) {
        return { result: "0x6f05b59d3b20000" }; // 0.5 ETH in wei
      }
      return { result: "0x0" };
    }
    // Return 250 USDC on Base
    if (body.method === "eth_call") {
      if (url.includes("base")) {
        return { result: "0x000000000000000000000000000000000000000000000000000000000ee6b280" }; // 250 * 1e6
      }
      return { result: "0x0" };
    }
    return { result: null };
  };

  const balances = await scanMultiChainBalances("0x1234567890abcdef1234567890abcdef12345678", {
    chains: [1, 8453, 42161],
    fetcher: mockFetcher,
  });

  assert.ok(balances.length >= 2);
  const arbEth = balances.find((b) => b.chainId === 42161 && b.tokenSymbol === "ETH");
  assert.ok(arbEth);
  assert.equal(arbEth.balanceFormatted, 0.5);
  assert.ok(arbEth.balanceUsd > 1000);

  const baseUsdc = balances.find((b) => b.chainId === 8453 && b.tokenSymbol === "USDC");
  assert.ok(baseUsdc);
  assert.equal(baseUsdc.balanceFormatted, 250);
});

test("buildCrossChainRescuePlan solves deficit and generates 1-click bridge route", () => {
  const mockBalances: ChainBalance[] = [
    {
      chainId: 8453, // Base: only 0.01 ETH
      chainName: "Base",
      tokenSymbol: "ETH",
      tokenAddress: "0x0000000000000000000000000000000000000000",
      balanceWei: "10000000000000000",
      balanceFormatted: 0.01,
      balanceUsd: 26.0,
      isNative: true,
    },
    {
      chainId: 42161, // Arbitrum: has 0.8 ETH surplus
      chainName: "Arbitrum One",
      tokenSymbol: "ETH",
      tokenAddress: "0x0000000000000000000000000000000000000000",
      balanceWei: "800000000000000000",
      balanceFormatted: 0.8,
      balanceUsd: 2080.0,
      isNative: true,
    },
  ];

  // User needs 0.15 ETH on Base
  const plan = buildCrossChainRescuePlan(
    {
      userAddress: "0x1111111111111111111111111111111111111111",
      targetChainId: 8453,
      neededAmount: 0.15,
      tokenSymbol: "ETH",
    },
    mockBalances,
  );

  assert.equal(plan.status, "surplus_found");
  assert.equal(plan.deficit.shortfall, 0.14); // 0.15 - 0.01
  assert.ok(plan.recommendedRoute);

  const route = plan.recommendedRoute;
  assert.equal(route.originChainId, 42161);
  assert.equal(route.targetChainId, 8453);
  assert.equal(route.protocol, "across_v3");
  assert.equal(route.estimatedDurationSeconds, 8); // L2-to-L2 Across is ~8s
  assert.ok(route.executionPayload.data.startsWith("0x7b939232"));
  assert.ok(BigInt(route.executionPayload.valueWei) > 0n);

  // Render HTML Modal
  const html = renderCrossChainRescueModalHtml(plan);
  assert.match(html, /LIQUIDITY FOUND/);
  assert.match(html, /Across Fast Relayer/);
  assert.match(html, /Bridge & Complete Purchase in 1-Click/);
});

test("resolveInFlight generates cross-chain bridge resolution for insufficient_funds", () => {
  const diag = resolveInFlight("insufficient_funds", {
    flow: "purchase",
    platform: "desktop",
    inAppBrowser: false,
    chainId: 8453,
    targetChainId: 8453,
  });

  assert.equal(diag.cause, "insufficient_funds");
  assert.ok(diag.resolution);
  assert.equal(diag.resolution.type, "bridge_funds");
  assert.match(diag.resolution.title, /Bridge Liquidity/);
  assert.equal((diag.resolution.payload as any).action, "cross_chain_rescue");
});

test("HTTP Server endpoints: /v1/crosschain/scan and /v1/crosschain/rescue", async () => {
  const mockRescueEngine = {
    async scanBalances(addr: string) {
      return [
        {
          chainId: 42161,
          chainName: "Arbitrum One",
          tokenSymbol: "ETH",
          tokenAddress: "0x0000000000000000000000000000000000000000",
          balanceWei: "500000000000000000",
          balanceFormatted: 0.5,
          balanceUsd: 1300,
          isNative: true,
        },
      ];
    },
    async planRescue(params: any) {
      return {
        status: "surplus_found",
        userAddress: params.userAddress,
        deficit: { chainId: params.targetChainId, shortfall: 0.1 },
        recommendedRoute: {
          protocol: "across_v3",
          originChainId: 42161,
          targetChainId: params.targetChainId,
          fee: { totalFeeUsd: 0.35 },
          estimatedDurationSeconds: 8,
        },
        alternativeRoutes: [],
        availableSurpluses: [],
      };
    },
  };

  const app = createApp({
    config: defaultConfig({
      projectId: "test",
      name: "Test Project",
      verifiedOrigin: "https://shop.example",
      resumeSecret: "test_secret_value_that_is_long_enough",
    }),
    apiKey: "secret-key-123",
    engine: { diagnose: async () => ({ cause: "unknown", confidence: 0, source: "rules", evidence: [], alternatives: [] }) },
    store: new Store(),
    senders: {},
    crossChainEngine: mockRescueEngine as any,
  });

  const server = createServer((req, res) => void app.handle(req, res));
  await new Promise<void>((r) => server.listen(0, r));
  server.unref();
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Test /v1/crosschain/scan
    const scanRes = await fetch(`${baseUrl}/v1/crosschain/scan`, {
      method: "POST",
      headers: {
        authorization: "Bearer secret-key-123",
        "content-type": "application/json",
        connection: "close",
      },
      body: JSON.stringify({ address: "0x1111111111111111111111111111111111111111" }),
    });
    assert.equal(scanRes.status, 200);
    const scanJson = await scanRes.json();
    assert.ok(Array.isArray(scanJson.balances));
    assert.equal(scanJson.balances[0].chainId, 42161);

    // 2. Test /v1/crosschain/rescue
    const rescueRes = await fetch(`${baseUrl}/v1/crosschain/rescue`, {
      method: "POST",
      headers: {
        authorization: "Bearer secret-key-123",
        "content-type": "application/json",
        connection: "close",
      },
      body: JSON.stringify({
        userAddress: "0x1111111111111111111111111111111111111111",
        targetChainId: 8453,
        neededAmount: 0.15,
      }),
    });
    assert.equal(rescueRes.status, 200);
    const rescueJson = await rescueRes.json();
    assert.equal(rescueJson.status, "surplus_found");
    assert.equal(rescueJson.recommendedRoute.protocol, "across_v3");
  } finally {
    server.closeAllConnections();
    server.close();
  }
});
