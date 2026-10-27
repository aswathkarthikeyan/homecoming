import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveInFlight,
  getChainDefinition,
  generateCrossDeviceHandoff,
  verifyCrossDeviceToken,
} from "../src/healing/engine.js";

test("resolves chain_not_added with automated addEthereumChain parameter", () => {
  const diag = resolveInFlight("chain_not_added", {
    flow: "purchase",
    platform: "desktop",
    inAppBrowser: false,
    targetChainId: 8453, // Base
  });

  assert.equal(diag.cause, "chain_not_added");
  assert.ok(diag.resolution);
  assert.equal(diag.resolution.type, "switch_chain_auto");
  assert.equal(diag.resolution.autoExecutable, true);
  assert.equal((diag.resolution.payload as any).method, "wallet_addEthereumChain");
});

test("resolves wrong_network with wallet_switchEthereumChain parameter", () => {
  const diag = resolveInFlight("wrong_network", {
    flow: "purchase",
    platform: "desktop",
    inAppBrowser: false,
    chainId: 1,
    targetChainId: 42161, // Arbitrum One
  });

  assert.equal(diag.cause, "wrong_network");
  assert.ok(diag.resolution);
  assert.equal(diag.resolution.type, "switch_chain_auto");
  assert.equal(diag.resolution.autoExecutable, true);
  assert.equal((diag.resolution.payload as any).method, "wallet_switchEthereumChain");
});

test("resolves rpc_failure with fallback RPC node recommendation", () => {
  const diag = resolveInFlight("rpc_failure", {
    flow: "purchase",
    platform: "desktop",
    inAppBrowser: false,
    chainId: 1,
  });

  assert.equal(diag.cause, "rpc_failure");
  assert.ok(diag.resolution);
  assert.equal(diag.resolution.type, "fallback_rpc");
  assert.ok(Array.isArray((diag.resolution.payload as any).fallbackRpcs));
});

test("cross-device QR handoff creates verifiable, tamper-resistant tokens", () => {
  const secret = "test-secret-key-32-chars-long-123456";
  const handoff = generateCrossDeviceHandoff("https://checkout.example.com", secret, {
    sessionId: "sess_12345",
    projectId: "proj_abc",
    targetChainId: 8453,
    action: "purchase",
    ttlMs: 60_000,
  });

  assert.ok(handoff.token);
  assert.match(handoff.uri, /^https:\/\/checkout\.example\.com\/handoff\?t=/);

  // Verification succeeds
  const verified = verifyCrossDeviceToken(secret, handoff.token);
  assert.ok(verified);
  assert.equal(verified.sessionId, "sess_12345");
  assert.equal(verified.targetChainId, 8453);

  // Tampered token fails
  const tampered = (handoff.token[0] === "a" ? "b" : "a") + handoff.token.slice(1);
  const tamperedRes = verifyCrossDeviceToken(secret, tampered);
  assert.equal(tamperedRes, null);

  // Expired token fails
  const expired = verifyCrossDeviceToken(secret, handoff.token, Date.now() + 100_000);
  assert.equal(expired, null);
});

test("getChainDefinition returns verified network parameters", () => {
  const base = getChainDefinition(8453);
  assert.ok(base);
  assert.equal(base.name, "Base");
  assert.equal(base.nativeCurrency.symbol, "ETH");
  assert.ok(base.rpcUrls.length > 0);
});
