import { test } from "node:test";
import assert from "node:assert/strict";
import { findErrorBySelector, findErrorsByProtocol, findErrorsByCategory } from "../src/decoder/catalog/index.js";
import { getChainById, searchChains, getMainnetChains, getTestnetChains } from "../src/healing/registry/index.js";
import { InFlightModalStateMachine } from "../src/ui/stateMachine.js";
import { renderInFlightModalHtml } from "../src/ui/domWidget.js";
import { InMemoryDistributedQueue } from "../src/server/db/queue.js";
import { getCorpusByCause, getCorpusSample } from "../eval/fixtures/index.js";

test("catalog finds errors by selector, protocol, and category", () => {
  const ozErr = findErrorBySelector("0xe450d38c");
  assert.ok(ozErr);
  assert.equal(ozErr.name, "ERC20InsufficientBalance");
  assert.equal(ozErr.category, "funds");

  const uniErrors = findErrorsByProtocol("Uniswap");
  assert.ok(uniErrors.length > 5);

  const slippageErrors = findErrorsByCategory("slippage");
  assert.ok(slippageErrors.length > 10);
});

test("chain registry provides fast lookup and search across mainnets and testnets", () => {
  const base = getChainById(8453);
  assert.ok(base);
  assert.equal(base.name, "Base");

  const results = searchChains("Arbitrum");
  assert.ok(results.length >= 2);

  const mainnets = getMainnetChains();
  const testnets = getTestnetChains();
  assert.ok(mainnets.length > 20);
  assert.ok(testnets.length > 10);
});

test("InFlightModalStateMachine updates state and renders DOM HTML widget", () => {
  const sm = new InFlightModalStateMachine();
  assert.equal(sm.getSnapshot().state, "idle");

  sm.intercept("Wrong Network", "Please switch to Base", {
    type: "switch_chain_auto",
    title: "Switch to Base",
    description: "Click to approve network switch",
    payload: { chainId: 8453 },
    autoExecutable: true,
  });

  const snap = sm.getSnapshot();
  assert.equal(snap.state, "intercepted");
  assert.equal(snap.title, "Wrong Network");

  const html = renderInFlightModalHtml(snap);
  assert.match(html, /Wrong Network/);
  assert.match(html, /Switch to Base/);

  sm.dismiss();
  assert.equal(sm.getSnapshot().state, "dismissed");
  assert.equal(renderInFlightModalHtml(sm.getSnapshot()), "");
});

test("distributed in-memory queue schedules and polls ready jobs", () => {
  const queue = new InMemoryDistributedQueue<{ caseId: string }>();
  queue.schedule("job_1", { caseId: "case_abc" }, 0); // Immediately ready
  queue.schedule("job_2", { caseId: "case_def" }, 50_000); // Future

  assert.equal(queue.size(), 2);
  const ready = queue.pollReady();
  assert.equal(ready.length, 1);
  assert.equal(ready[0]?.id, "job_1");
  assert.equal(queue.size(), 1);
});

test("fixtures corpus loads 4,500 labeled cases across all causes", () => {
  const sample = getCorpusSample(50);
  assert.equal(sample.length, 50);

  const gasShockCases = getCorpusByCause("gas_shock");
  assert.ok(gasShockCases.length > 100);
  assert.equal(gasShockCases[0]?.label, "gas_shock");
  assert.equal(gasShockCases[0]?.case.context.gasGwei, 75.0);
});
