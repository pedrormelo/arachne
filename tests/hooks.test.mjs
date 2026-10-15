import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { getSection, parseFrontmatter } from "../scripts/lib.mjs";
import { buildContext } from "../scripts/session-start.mjs";
import { buildReminder } from "../scripts/stop.mjs";
import { git, makeRepo, tempDir, writeMoc } from "./helpers.mjs";

const SCRIPTS = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "scripts");

const BODY = [
  "## ⚠️ Active blockers",
  "",
  "- decide auth strategy",
  "",
  "## 📋 Backlog",
  "",
  "- remove legacy flag",
  "",
  "## 📌 Log",
  "",
  "- started",
].join("\n");

function fixture() {
  const root = tempDir();
  const vault = path.join(root, "vault");
  const repo = makeRepo(path.join(root, "repo"));
  writeMoc(vault, "demo", { repoRoot: repo, body: BODY });
  writeMoc(vault, "old", { status: "archived", body: BODY });
  return { root, vault, repo, config: { vaultPath: vault } };
}

test("parseFrontmatter strips quotes and handles CRLF", () => {
  assert.deepEqual(parseFrontmatter("---\r\nstatus: active\r\nrepo_root: 'C:\\x'\r\n---\r\n"), {
    status: "active",
    repo_root: "C:\\x",
  });
  assert.equal(parseFrontmatter("# no frontmatter"), null);
});

test("getSection returns the body up to the next level-2 heading", () => {
  assert.equal(getSection(BODY, "Blockers"), "- decide auth strategy");
  assert.equal(getSection(BODY, "Missing"), null);
});

test("inside the vault: lists only active projects with blockers and backlog", () => {
  const { vault, config } = fixture();
  const context = buildContext(config, path.join(vault, "10-Projects"));
  assert.match(context, /#### demo \(status: active\)/);
  assert.match(context, /decide auth strategy/);
  assert.match(context, /remove legacy flag/);
  assert.doesNotMatch(context, /#### old/);
});

test("inside a linked repository: injects that project's MOC summary", () => {
  const { repo, config } = fixture();
  mkdirSync(path.join(repo, "src"));
  const context = buildContext(config, path.join(repo, "src"));
  assert.match(context, /CORTEX project: demo/);
  assert.match(context, /decide auth strategy/);
  assert.doesNotMatch(context, /started/);
});

test("inside a linked worktree outside repo_root: maps back to the main checkout", () => {
  const { root, repo, config } = fixture();
  const worktree = path.join(root, "wt");
  git(repo, "worktree", "add", "-q", worktree, "-b", "feature");
  assert.match(buildContext(config, worktree), /CORTEX project: demo/);
});

test("elsewhere: no context and no reminder", () => {
  const { root, config } = fixture();
  const other = makeRepo(path.join(root, "other"));
  assert.equal(buildContext(config, other), null);
  assert.equal(buildReminder(config, other), null);
});

test("repo_root prefix of a sibling folder does not match", () => {
  const { root, config } = fixture();
  const sibling = makeRepo(path.join(root, "repo-two"));
  assert.equal(buildContext(config, sibling), null);
});

test("stop hook reminds about the MOC inside a linked repository", () => {
  const { repo, config } = fixture();
  assert.match(buildReminder(config, repo), /CORTEX \(demo\)/);
});

test("session-start CLI emits hook JSON, and stays silent without config", () => {
  const { root, repo, vault } = fixture();
  const home = path.join(root, "home");
  const run = () =>
    spawnSync("node", [path.join(SCRIPTS, "session-start.mjs"), "SessionStart"], {
      input: JSON.stringify({ cwd: repo }),
      env: { ...process.env, HOME: home, USERPROFILE: home },
      encoding: "utf8",
    });

  assert.equal(run().stdout, "");

  mkdirSync(path.join(home, ".config", "arachne"), { recursive: true });
  writeFileSync(path.join(home, ".config", "arachne", "config.json"), JSON.stringify({ vaultPath: vault }));
  const output = JSON.parse(run().stdout);
  assert.equal(output.hookSpecificOutput.hookEventName, "SessionStart");
  assert.match(output.hookSpecificOutput.additionalContext, /CORTEX project: demo/);
});
