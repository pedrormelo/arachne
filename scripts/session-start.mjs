import { pathToFileURL } from "node:url";
import {
  ACTIVE_STATUSES,
  findProjectForCwd,
  getSection,
  isInside,
  knowledgeIndex,
  listProjects,
  loadConfig,
  readStdinJson,
} from "./lib.mjs";

export function buildContext(config, cwd) {
  const vault = config.vaultPath;
  const knowledge = knowledgeIndex(vault);

  if (isInside(cwd, vault)) {
    const active = listProjects(vault)
      .filter((p) => ACTIVE_STATUSES.has(p.fields.status))
      .map((p) => {
        const parts = [`#### ${p.slug} (status: ${p.fields.status})`];
        const blockers = getSection(p.text, "Blockers");
        const backlog = getSection(p.text, "Backlog");
        if (blockers) parts.push(`**Blockers:**\n${blockers}`);
        if (backlog) parts.push(`**Backlog:**\n${backlog}`);
        return parts.join("\n");
      });
    const out = ["## CORTEX vault (session inside the vault)", "", "### Active projects"];
    out.push(active.length ? active.join("\n\n") : "No project with status active or in-progress in 10-Projects/.");
    if (knowledge) out.push("", "### Reusable knowledge (60-Knowledge)", knowledge);
    out.push("", "The arachne:vault skill applies to this session.");
    return out.join("\n");
  }

  const project = findProjectForCwd(vault, cwd);
  if (!project) return null;
  const out = [`## CORTEX project: ${project.slug}`, `MOC: ${project.file}`];
  const blockers = getSection(project.text, "Blockers");
  const backlog = getSection(project.text, "Backlog");
  if (blockers) out.push("", "### Active blockers", blockers);
  if (backlog) out.push("", "### Backlog", backlog);
  if (knowledge) out.push("", "### Reusable knowledge (60-Knowledge)", knowledge);
  out.push("", "The arachne:vault skill applies to this session: read the MOC before acting.");
  return out.join("\n");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = loadConfig();
  if (!config) process.exit(0);
  const input = readStdinJson();
  const context = buildContext(config, input.cwd ?? process.cwd());
  if (context) {
    const event = process.argv[2] ?? "SessionStart";
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: context } }));
  }
}
