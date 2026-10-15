import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export const ACTIVE_STATUSES = new Set(["active", "in-progress"]);

export function configPath(home = os.homedir()) {
  return path.join(home, ".config", "arachne", "config.json");
}

export function loadConfig(file = configPath()) {
  try {
    const config = JSON.parse(readFileSync(file, "utf8"));
    return config.vaultPath ? config : null;
  } catch {
    return null;
  }
}

export function readStdinJson() {
  try {
    return JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return {};
  }
}

export function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (kv) fields[kv[1]] = kv[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  }
  return fields;
}

export function getSection(text, keyword) {
  const lines = text.split(/\r?\n/);
  const key = keyword.toLowerCase();
  const start = lines.findIndex((l) => l.startsWith("## ") && l.toLowerCase().includes(key));
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => l.startsWith("## "));
  const body = (end === -1 ? rest : rest.slice(0, end)).join("\n").trim();
  return body || null;
}

// Resolve symlinks (e.g. /var -> /private/var on macOS) so git's paths and ours compare equal.
function realPath(p) {
  try {
    return realpathSync.native(p);
  } catch {
    return path.resolve(p);
  }
}

export function normalizePath(p) {
  const resolved = realPath(p).replace(/\\/g, "/").replace(/\/+$/, "");
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

export function isInside(child, parent) {
  const c = normalizePath(child);
  const p = normalizePath(parent);
  return c === p || c.startsWith(p + "/");
}

// A linked worktree lives outside repo_root, so map it back to the main checkout before matching.
export function mainCheckoutPath(cwd) {
  try {
    const out = execFileSync(
      "git",
      ["-C", cwd, "rev-parse", "--path-format=absolute", "--git-dir", "--git-common-dir", "--show-toplevel"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    const [gitDir, commonDir, top] = out.trim().split(/\r?\n/);
    if (!top || normalizePath(gitDir) === normalizePath(commonDir)) return cwd;
    const relative = path.relative(realPath(top), realPath(cwd));
    return path.join(path.dirname(commonDir), relative);
  } catch {
    return cwd;
  }
}

export function listProjects(vaultPath) {
  const dir = path.join(vaultPath, "10-Projects");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => {
      const file = path.join(dir, f);
      const text = readFileSync(file, "utf8");
      return { slug: f.slice(0, -3), file, text, fields: parseFrontmatter(text) ?? {} };
    });
}

export function findProjectForCwd(vaultPath, cwd) {
  const location = mainCheckoutPath(cwd);
  return (
    listProjects(vaultPath).find((p) => p.fields.repo_root && isInside(location, p.fields.repo_root)) ?? null
  );
}

export function knowledgeIndex(vaultPath) {
  const file = path.join(vaultPath, "60-Knowledge", "index.md");
  if (!existsSync(file)) return null;
  const entries = readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter((l) => /^#{2,3} /.test(l) || /^- \[\[/.test(l));
  const kept = entries.filter((l, i) => !/^#/.test(l) || /^- \[\[/.test(entries[i + 1] ?? ""));
  return kept.length ? kept.join("\n") : null;
}
