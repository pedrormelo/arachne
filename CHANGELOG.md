# Changelog

## 1.0.0

First release.

- `/arachne:init` creates a CORTEX vault (folders, templates, nine roles) and writes `~/.config/arachne/config.json`. It never overwrites existing files.
- SessionStart hook: inside the vault, lists active projects with their blockers and backlog. Inside a linked repository, or a linked worktree of it, it injects that project's MOC summary.
- Stop hook: reminds you to update the MOC, the backlog and the knowledge base.
- `/arachne:vault`: the protocol (MOC, coordination envelopes, ADR checklist, backlog, promotion).
- `/arachne:spawn`: runs a role in its own git worktree, as a native Claude Code subagent or an Orca session, falling back to native when Orca is not available. Workers never commit.
- The method, documented in `skills/vault/references/method.md`.
