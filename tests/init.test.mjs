import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { configPath } from "../scripts/lib.mjs";
import { FOLDERS, initVault } from "../scripts/init.mjs";
import { tempDir } from "./helpers.mjs";

test("creates every folder, the templates and the config", () => {
  const home = tempDir();
  const result = initVault({ vaultPath: "~/vault", backend: "native", home });

  assert.equal(result.vault, path.join(home, "vault"));
  for (const folder of FOLDERS) assert.ok(existsSync(path.join(result.vault, folder)), folder);
  assert.ok(existsSync(path.join(result.vault, "CORTEX.md")));
  assert.ok(existsSync(path.join(result.vault, "99-Templates", "project-moc.md")));
  assert.ok(existsSync(path.join(result.vault, "90-Agents", "30-senior-engineer.md")));

  const config = JSON.parse(readFileSync(configPath(home), "utf8"));
  assert.deepEqual(config, { vaultPath: result.vault, spawnBackend: "native" });
});

test("running again never overwrites user files and keeps unknown config keys", () => {
  const home = tempDir();
  const { vault } = initVault({ vaultPath: path.join(home, "vault"), backend: "native", home });
  const hub = path.join(vault, "CORTEX.md");
  writeFileSync(hub, "edited by the user\n");
  const file = configPath(home);
  writeFileSync(file, JSON.stringify({ ...JSON.parse(readFileSync(file, "utf8")), extra: 1 }));

  const second = initVault({ vaultPath: vault, backend: "orca", home });

  assert.equal(readFileSync(hub, "utf8"), "edited by the user\n");
  assert.equal(second.created.length, 0);
  assert.deepEqual(JSON.parse(readFileSync(file, "utf8")), { vaultPath: vault, spawnBackend: "orca", extra: 1 });
});
