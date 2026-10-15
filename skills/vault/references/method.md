# The CORTEX method

CORTEX coordinates you and a set of AI agent roles through a vault of plain Markdown files. The vault is the shared, durable memory: decisions, handoffs and lessons live in files, not in chat history. Any agent, in any session, can pick up where the last one stopped.

## Principles

1. **The vault is the single source of truth.** Coordination that only happened in a chat did not happen. Write it down.
2. **One hub per project.** Each project has a MOC (map of content) in `10-Projects/{slug}.md`. Every related note links back to it.
3. **Working memory vs long-term memory.** What is true for one project lives in its MOC (working memory). What would teach future projects is promoted to `60-Knowledge/` (long-term memory).
4. **Small context windows.** Read the MOC and the notes it links for the task at hand. Never load the whole vault.
5. **Cite, do not copy.** Reference another note with a `[[wikilink]]`. Two copies of a fact drift apart.
6. **Name carries meaning.** File names (`ADR-007-{slug}`, `{slug}-brief`) tell what a note is, so the folder layout can change without losing anything.

## Vault layout

| Folder | Holds | Naming |
|---|---|---|
| `00-Inbox/` | Captures in transit. Process them: promote or delete. | free |
| `10-Projects/` | One MOC per project, plus `_index.md`. | `{slug}` |
| `20-Briefs/` | Product briefs, market research. | `{slug}-brief`, `{slug}-market-research` |
| `30-Design/` | Flows, screens, visual direction. | `{slug}-flow`, `{slug}-ui` |
| `40-Architecture/` | System readouts, task breakdowns, runbooks, ADRs. | `{slug}-system-readout`, `{slug}-tasks`, `ADR-NNN-{slug}` |
| `50-Reviews/` | Code reviews, QA reports. | `{slug}-qa-{YYYY-MM-DD}` |
| `60-Knowledge/` | Atomic, cross-project notes, plus `index.md`. | `{concept}`, no date |
| `90-Agents/` | Role registry, plus `index.md`. | `{NN}-{role}` |
| `99-Templates/` | Templates for every note type. | `{type}` |

Names are kebab-case. Dated artifacts use ISO dates. Knowledge notes carry no date, because they are meant to stay true.

Obsidian is optional. It adds a graph view and backlinks, but the method only needs Markdown files.

## The project MOC

The MOC is where any session starts. Its frontmatter carries `status` (`idea`, `active`, `in-progress`, `paused`, `shipped`, `archived`) and `repo_root`, the absolute path of the project's code repository. `repo_root` is what lets a session opened inside the repository find its MOC.

Sections with fixed meaning:

| Section | What it is | Edit rule |
|---|---|---|
| `⚠️ Active blockers` | What stops progress **now** and needs a decision. | Live state: update in place; remove when resolved. |
| `📋 Backlog` | Known, unfinished work that blocks nothing today. | An item leaves only when delivered or turned into an ADR or note. |
| `📌 Log` | What happened, by date. | Append-only. |
| `🔁 Coordination` | Agent envelopes. | Append-only, newest last. |

Whenever a session ends with something known to be incomplete (a scope cut, a deferred item, a debt found but not paid), it goes in the Backlog. Nothing leaves the Backlog by being forgotten.

## Coordination envelopes

Agents coordinate only through blocks written in the MOC's `🔁 Coordination` section. Each block has the same header:

```markdown
### {emoji} {TYPE} — {YYYY-MM-DD} — {from} → {to}
> **re:** {title or the block it answers}
```

| Block | When | Written by |
|---|---|---|
| `🚀 KICK-OFF` | Align the chain before heavy work: one short answer per role involved. | orchestrator |
| `📋 INVOKE` | Delegate one task to one role, with only the context it needs. | orchestrator |
| `📤 HANDOFF` | Deliver finished, self-contained work. | the role that did it |
| `✅ DONE` | Close a part with nothing pending. | the role that finished |
| `⚠️ BLOCKED` | Escalate with **one concrete, answerable question**, never "I am stuck". | any role |
| `🤝 MEETING` | Resolve a blocker that needs more than one view. One round, and the decision is not reopened. | orchestrator |

An `📋 INVOKE` body contains:

- **Goal:** one concrete task.
- **Context:** only the facts the role needs, as links.
- **Constraints:** known traps and limits.
- **Deliverable:** format and where to save it.
- **Done when:** a verifiable criterion.

A `📤 HANDOFF` body states what was delivered, where it is (worktree, branch, files), what is open, and how to verify it.

## Roles

Roles are defined in `90-Agents/`. A worker adopts a role by reading its file. The orchestrator routes work:

- "Build X" → product-strategist → tech-architect → senior-engineer
- "How do I implement Y" → tech-architect → senior-engineer
- "It is broken" → senior-engineer
- "Is Z worth building" → product-strategist
- Existing system → existing-system-analyst first
- Screens involved → ui-designer between product and architecture

Rules for the chain:

- **One orchestrator per project.** Two would write contradicting decisions into the same MOC.
- **Do not over-sequence.** If one role can do it, call one.
- **Pass context, do not reopen.** A later role builds on earlier decisions instead of re-voting them.
- **Loops are a red flag.** If the chain returns to the same role twice, stop and report.
- **Parallel only when independent.** Two roles run at once only if neither needs the other's output.

Start with the roles you need. Add more from `99-Templates/role.md` when a real need appears.

## When a decision becomes an ADR

Two or more checks mean it is an ADR (`40-Architecture/ADR-NNN-{slug}.md`):

- [ ] Expensive or hard to reverse once implemented.
- [ ] Affects more than one component or role.
- [ ] Sets a precedent others will follow.
- [ ] Someone will later ask "why did we do it this way?".
- [ ] Real alternatives were considered and discarded.

Zero or one check: it is a log entry in the MOC, or a knowledge note if it is reusable.

An accepted ADR is never edited. Changing your mind means writing a new ADR that supersedes it.

## Promotion: working memory → long-term memory

When a learning shows up in a MOC:

1. Is it reusable across projects? No → it stays in the MOC.
2. Is it atomic (one idea)? No → split it first.
3. Does a similar note exist in `60-Knowledge/`? Yes → merge into it. No → create it from `99-Templates/knowledge-note.md`, list it in `60-Knowledge/index.md`, and link it from the MOC.

This is how the vault gets smarter: each project starts with what the previous ones learned.

## Growing the vault

The layout above suits one person or a small team. When the vault outgrows it (many active projects, several business domains, handoffs that need to be audited on their own), split folders: ADRs into their own folder, handoffs and invocations into dated files. Wikilinks resolve by name, so moving files does not break them.
