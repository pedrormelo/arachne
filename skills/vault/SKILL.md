---
name: vault
description: Applies the CORTEX method when working with a CORTEX vault — project MOCs, coordination envelopes (INVOKE, HANDOFF, DONE, BLOCKED, MEETING), ADRs, backlog and promotion to long-term knowledge. Use proactively whenever the session starts inside the vault or inside a repository whose MOC has a matching repo_root (the arachne SessionStart hook announces this), before writing in 10-Projects/, 40-Architecture/, 60-Knowledge/ or 90-Agents/, and when the user asks to open a project, record a decision, register a blocker or backlog item, write a handoff, or promote a learning.
---

# CORTEX vault protocol

The vault path is `vaultPath` in `~/.config/arachne/config.json`. If that file does not exist, tell the user to run `/arachne:init` and stop.

The full method is in [references/method.md](references/method.md). Read it the first time you apply this protocol in a session, or when a rule below is unclear.

## Before acting: knowledge first

1. Open the project MOC (`10-Projects/{slug}.md`). Read the status, `⚠️ Active blockers` and `📋 Backlog` before anything else. If the project has no MOC, create one from `99-Templates/project-moc.md`, fill `repo_root` with the repository's absolute path, and add it to `10-Projects/_index.md`.
2. Check `60-Knowledge/index.md` for notes related to the task. Reuse and link them instead of rediscovering.
3. Before answering as a role, read its file in `90-Agents/`.

## While working

- Coordinate only through envelopes appended to the MOC's `🔁 Coordination` section. The header format and the meaning of each block are in the method.
- A `⚠️ BLOCKED` always carries one concrete question. Mirror it in `⚠️ Active blockers` until it is resolved.
- Append to `📌 Log` and `🔁 Coordination`; never rewrite earlier entries.
- Run the ADR checklist on every technical decision. Two or more checks → write `40-Architecture/ADR-NNN-{slug}.md` from `99-Templates/adr.md` and link it from the MOC.
- Link with `[[wikilinks]]` instead of copying text between notes.
- Load only the MOC and the notes the task needs.

## Before the session ends

- Log what happened in the MOC.
- Put anything known to be unfinished in `📋 Backlog`.
- Promote learnings that are reusable across projects to `60-Knowledge/`, following the promotion steps in the method.

## Delegating to other roles

Use `/arachne:spawn` to run a role as a separate agent in its own worktree.
