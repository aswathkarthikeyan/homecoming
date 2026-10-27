import { test } from "node:test";
import assert from "node:assert/strict";
import {
  decodeEvmError,
  decodeAbiString,
  decodePanicCode,
  normalizeWalletError,
  diagnoseRawError,
} from "../src/decoder/index.js";

test("decodes standard Error(string) hex payload", () => {
  // Selector 0x08c379a0 + offset 0x20 + length 0x0e + "Price too high" padded
  const hex =
    "0x08c379a0" +
    "0000000000000000000000000000000000000000000000000000000000000020" +
    "000000000000000000000000000000000000000000000000000000000000000e" +
    Buffer.from("Price too high", "utf8").toString("hex").padEnd(64, "0");

  const str = decodeAbiString(hex);
  assert.equal(str, "Price too high");

  const decoded = decodeEvmError(hex);
  assert.ok(decoded);
  assert.equal(decoded.name, "Error");
  assert.equal(decoded.message, "Price too high");
  assert.equal(decoded.category, "slippage");
});

test("decodes standard Panic(uint256) hex payload", () => {
  // Panic(0x11) -> Arithmetic overflow/underflow
  const hex = "0x4e487b71" + "0000000000000000000000000000000000000000000000000000000000000011";
  const code = decodePanicCode(hex);
  assert.equal(code, 0x11);

  const decoded = decodeEvmError(hex);
  assert.ok(decoded);
  assert.equal(decoded.name, "Panic");
  assert.match(decoded.message, /Arithmetic operation underflowed or overflowed/);
  assert.equal(decoded.category, "panic");
});

test("decodes known 4-byte protocol errors from Uniswap and OpenZeppelin", () => {
  // UniswapV3InvalidSlippage 0xd92e233d
  const uniErr = decodeEvmError("0xd92e233d000000000000000000000000000000000000000000000000");
  assert.ok(uniErr);
  assert.equal(uniErr.name, "UniswapV3InvalidSlippage");
  assert.equal(uniErr.protocol, "Uniswap");
  assert.equal(uniErr.category, "slippage");

  // ERC20InsufficientBalance 0xe450d38c
  const ozErr = decodeEvmError("0xe450d38c000000000000000000000000000000000000000000000000");
  assert.ok(ozErr);
  assert.equal(ozErr.name, "ERC20InsufficientBalance");
  assert.equal(ozErr.protocol, "OpenZeppelin");
  assert.equal(ozErr.category, "funds");
});

test("decodes ERC-4337 EntryPoint revert codes", () => {
  const raw = { message: "AA21 account insufficient balance for userOp" };
  const decoded = decodeEvmError(raw);
  assert.ok(decoded);
  assert.equal(decoded.selector, "AA21");
  assert.equal(decoded.protocol, "ERC-4337");
  assert.equal(decoded.category, "funds");
});

test("normalizes wallet-specific exceptions", () => {
  const metamaskReject = normalizeWalletError({ code: 4001, message: "User rejected the request." });
  assert.equal(metamaskReject.cause, "user_rejected");
  assert.equal(metamaskReject.isActionable, false);

  const pendingReq = normalizeWalletError({ code: -32002, message: "Request already pending" });
  assert.equal(pendingReq.cause, "pending_request");
  assert.equal(pendingReq.isActionable, true);

  const rateLimit = normalizeWalletError({ code: 429, message: "Too many requests" });
  assert.equal(rateLimit.cause, "rate_limited");
  assert.equal(rateLimit.isActionable, true);
});

test("diagnoseRawError provides end-to-end diagnosis and actionable remedies", () => {
  const slippageRes = diagnoseRawError("0xd92e233d0000000000000000000000000000000000000000");
  assert.equal(slippageRes.cause, "slippage_or_quote_expired");
  assert.ok(slippageRes.actionableRemedy);

  const rejectRes = diagnoseRawError({ code: 4001, message: "MetaMask: User rejected" });
  assert.equal(rejectRes.cause, "user_declined");

  const pendingRes = diagnoseRawError({ code: -32002, message: "Pending request" });
  assert.equal(pendingRes.cause, "request_already_pending");
});
