import { pathToFileURL } from "node:url";
import { findProjectForCwd, loadConfig, readStdinJson } from "./lib.mjs";

export function buildReminder(config, cwd) {
  const project = findProjectForCwd(config.vaultPath, cwd);
  if (!project) return null;
  return (
    `CORTEX (${project.slug}): before closing, check that (1) the MOC log has what happened, ` +
    "(2) anything reusable across projects is promoted to 60-Knowledge/, " +
    "(3) known unfinished work is in the Backlog."
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = loadConfig();
  if (!config) process.exit(0);
  const input = readStdinJson();
  const reminder = buildReminder(config, input.cwd ?? process.cwd());
  if (reminder) process.stdout.write(JSON.stringify({ systemMessage: reminder }));
}
