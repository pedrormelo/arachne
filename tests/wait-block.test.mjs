import assert from "node:assert/strict";
import { appendFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { closingBlocks, waitForBlock } from "../scripts/wait-block.mjs";
import { tempDir } from "./helpers.mjs";

const MOC = [
  "## 🔁 Coordination",
  "",
  "> Agent envelopes (`📋 INVOKE`, `📤 HANDOFF`, `✅ DONE`, `⚠️ BLOCKED`) are appended below.",
  "",
  "### 📋 INVOKE — 2026-01-01 — orchestrator → senior-engineer",
  "> **re:** task",
  "",
].join("\n");

const HANDOFF = "\n### 📤 HANDOFF — 2026-01-01 — senior-engineer → @orchestrator\n> **re:** task\n\n**Done:** it\n";

test("counts only block headings, not mentions in the section description", () => {
  assert.equal(closingBlocks(MOC).length, 0);
  assert.equal(closingBlocks(MOC + HANDOFF).length, 1);
});

test("returns the new block once it is appended", async () => {
  const moc = path.join(tempDir(), "demo.md");
  writeFileSync(moc, MOC);
  setTimeout(() => appendFileSync(moc, HANDOFF), 50);
  const block = await waitForBlock(moc, 0, { timeoutMs: 2000, intervalMs: 20 });
  assert.match(block, /^### 📤 HANDOFF/);
  assert.match(block, /\*\*Done:\*\* it/);
});

test("returns null on timeout", async () => {
  const moc = path.join(tempDir(), "demo.md");
  writeFileSync(moc, MOC + HANDOFF);
  assert.equal(await waitForBlock(moc, 1, { timeoutMs: 50, intervalMs: 20 }), null);
});
