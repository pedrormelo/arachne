import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { configPath, loadConfig } from "./lib.mjs";

const TEMPLATE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "template");

export const FOLDERS = [
  "00-Inbox",
  "10-Projects",
  "20-Briefs",
  "30-Design",
  "40-Architecture",
  "50-Reviews",
  "60-Knowledge",
  "90-Agents",
  "99-Templates",
];

export function orcaAvailable() {
  const result = spawnSync("orca", ["--version"], { stdio: "ignore", shell: process.platform === "win32" });
  return result.status === 0;
}

function copyMissing(from, to, created) {
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) {
      mkdirSync(dest, { recursive: true });
      copyMissing(src, dest, created);
    } else if (!existsSync(dest)) {
      copyFileSync(src, dest);
      created.push(dest);
    }
  }
}

export function initVault({ vaultPath, backend, home = os.homedir(), templateDir = TEMPLATE_DIR }) {
  const vault = path.resolve(vaultPath.replace(/^~(?=$|[\\/])/, home));
  for (const folder of FOLDERS) mkdirSync(path.join(vault, folder), { recursive: true });
  const created = [];
  copyMissing(templateDir, vault, created);

  const file = configPath(home);
  const config = { ...loadConfig(file), vaultPath: vault, spawnBackend: backend };
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
  return { vault, configFile: file, spawnBackend: backend, created };
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) args[argv[i].replace(/^--/, "")] = argv[i + 1];
  return args;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.vault) {
    console.error("usage: node init.mjs --vault <path> [--backend orca|native]");
    process.exit(2);
  }
  if (args.backend && !["orca", "native"].includes(args.backend)) {
    console.error(`unknown backend "${args.backend}", expected orca or native`);
    process.exit(2);
  }
  const backend = args.backend ?? (orcaAvailable() ? "orca" : "native");
  const result = initVault({ vaultPath: args.vault, backend });
  console.log(`vault: ${result.vault}`);
  console.log(`config: ${result.configFile}`);
  console.log(`spawn backend: ${result.spawnBackend}`);
  console.log(`files created: ${result.created.length}`);
}
