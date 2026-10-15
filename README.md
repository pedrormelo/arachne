# arachne

**The CORTEX method for Claude Code.** A vault of plain Markdown files becomes the shared memory of you and a team of agent roles: each project has a hub note, agents hand work to each other through blocks written in that note, decisions become ADRs, and lessons that apply to more than one project are promoted to a knowledge base that every future session can read.

Nothing important lives only in a chat. Any session, by any agent, can pick up where the last one stopped.

## What you get

- **A vault scaffold.** Folders, templates and a registry of nine roles: orchestrator, market researcher, product strategist, UI designer, existing-system analyst, tech architect, infra engineer, senior engineer, QA engineer.
- **Automatic context.** When you open Claude Code inside the vault, it sees your active projects with their blockers and backlog. When you open it inside a code repository linked to a project, it sees that project's hub note. This works in linked git worktrees too.
- **The protocol as a skill.** Project MOCs, coordination envelopes (`📋 INVOKE`, `📤 HANDOFF`, `⚠️ BLOCKED`, …), an ADR checklist, a backlog that never forgets, and promotion to long-term knowledge.
- **Multi-agent spawning.** Run a role as a separate agent in its own git worktree of the project. Two backends:
  - `native`: a Claude Code subagent. Nothing else to install.
  - `orca`: a full, visible session in Orca, so you can talk to the role directly.

  Workers never commit. You review their changes and decide.

## How it differs

Session-memory tools keep the context of a single agent across sessions. arachne coordinates **several roles** around **explicit, human-readable artifacts**: who asked whom for what, what was delivered, which decision was made and why. The vault works without the plugin: it is just Markdown, and opens in Obsidian if you want a graph view.

## Install

```
/plugin marketplace add pedrormelo/arachne
/plugin install arachne@arachne
```

Then run `/arachne:init`. It asks where to create the vault and which spawn backend to use, and never overwrites existing files.

Requires Node.js 18+ and git 2.31+.

## Use

1. **Link a project.** Create `10-Projects/{slug}.md` from `99-Templates/project-moc.md` and set `repo_root` to the repository path. Or simply ask Claude to open a project for a repository.
2. **Work.** Inside the repository, Claude reads the project's blockers and backlog at startup and follows the protocol: it logs what happened, records decisions, and keeps the backlog.
3. **Delegate.** Ask the orchestrator for something bigger, for example "build a login page for demo". It writes `📋 INVOKE` blocks and runs `/arachne:spawn` for each role. Each role works in its own worktree and answers with a `📤 HANDOFF` or a `⚠️ BLOCKED` in the project note.

| Skill | Does |
|---|---|
| `/arachne:init` | Create the vault and the config. |
| `/arachne:vault` | The protocol. Applied automatically inside the vault or a linked repository. |
| `/arachne:spawn` | Run a role as an agent in its own worktree. |

The config lives in `~/.config/arachne/config.json`:

```json
{ "vaultPath": "/home/you/cortex-vault", "spawnBackend": "native" }
```

## The method

[`skills/vault/references/method.md`](skills/vault/references/method.md) is the complete method: principles, vault layout, envelopes, roles, the ADR checklist and promotion. You can read it and apply it without this plugin.

## Development

```
npm test
```

Set `ARACHNE_LEAK_PATTERNS` to a comma-separated list of strings that must never appear in the repository (personal paths, private project names), and the leak test checks every file for them.

## License

MIT
