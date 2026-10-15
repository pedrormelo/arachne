import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export function tempDir() {
  return mkdtempSync(path.join(os.tmpdir(), "arachne-test-"));
}

export function git(cwd, ...args) {
  execFileSync("git", ["-C", cwd, "-c", "user.name=t", "-c", "user.email=t@t", ...args], { stdio: "ignore" });
}

export function makeRepo(dir) {
  mkdirSync(dir, { recursive: true });
  git(dir, "init", "-q", "-b", "main");
  writeFileSync(path.join(dir, "README.md"), "# demo\n");
  git(dir, "add", ".");
  git(dir, "commit", "-qm", "init");
  return dir;
}

export function writeMoc(vault, slug, { status = "active", repoRoot = "", body = "" } = {}) {
  const dir = path.join(vault, "10-Projects");
  mkdirSync(dir, { recursive: true });
  const text = `---\ntype: project-moc\nstatus: ${status}\nrepo_root: '${repoRoot}'\n---\n\n# ${slug}\n\n${body}`;
  writeFileSync(path.join(dir, `${slug}.md`), text);
}
