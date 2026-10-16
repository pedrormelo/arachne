import { readFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import { pathToFileURL } from "node:url";

const BLOCK = /^### (📤 HANDOFF|⚠️ BLOCKED|✅ DONE) .*$/gmu;

export function closingBlocks(text) {
  return [...text.matchAll(BLOCK)].map((m) => m.index);
}

export async function waitForBlock(moc, after, { timeoutMs, intervalMs = 15000 }) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const text = readFileSync(moc, "utf8");
    const blocks = closingBlocks(text);
    if (blocks.length > after) return text.slice(blocks[after]).split(/\r?\n(?=### )/)[0].trim();
    if (Date.now() >= deadline) return null;
    await sleep(intervalMs);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [moc, after, timeoutSec = "1800"] = process.argv.slice(2);
  if (!moc) {
    console.error("usage: node wait-block.mjs <moc> [<blocks-already-present> [<timeout-seconds>]]");
    process.exit(2);
  }
  if (after === undefined) {
    console.log(closingBlocks(readFileSync(moc, "utf8")).length);
  } else {
    const block = await waitForBlock(moc, Number(after), { timeoutMs: Number(timeoutSec) * 1000 });
    if (!block) {
      console.error("timeout: no new HANDOFF, BLOCKED or DONE block");
      process.exit(1);
    }
    console.log(block);
  }
}
