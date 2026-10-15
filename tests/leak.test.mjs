import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const patterns = (process.env.ARACHNE_LEAK_PATTERNS ?? "").split(",").filter(Boolean);

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if ([".git", "node_modules"].includes(e.name)) return [];
    const full = path.join(dir, e.name);
    return e.isDirectory() ? files(full) : [full];
  });
}

// Patterns come from the environment so the forbidden strings never live in the repo.
test("no private strings in the repository", { skip: patterns.length === 0 && "ARACHNE_LEAK_PATTERNS not set" }, () => {
  const hits = files(ROOT).flatMap((file) => {
    const text = readFileSync(file, "utf8").toLowerCase();
    return patterns.filter((p) => text.includes(p.toLowerCase())).map((p) => `${path.relative(ROOT, file)}: ${p}`);
  });
  assert.deepEqual(hits, []);
});
