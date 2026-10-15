---
type: hub
tags: [cortex, hub]
---

# CORTEX vault

This vault is the shared memory for you and your agents. If it is not written here, it did not happen.

| Folder | Holds |
|---|---|
| `00-Inbox/` | Quick captures. Process them: promote or delete. |
| `10-Projects/` | One MOC per project: the hub for status, blockers, backlog, log and agent coordination. Index: [[10-Projects/_index]] |
| `20-Briefs/` | Product briefs and research. |
| `30-Design/` | Flows and UI decisions. |
| `40-Architecture/` | System readouts, task breakdowns and `ADR-NNN-{slug}` decisions. |
| `50-Reviews/` | Code reviews and QA reports. |
| `60-Knowledge/` | Atomic, cross-project notes (long-term memory). Index: [[60-Knowledge/index]] |
| `90-Agents/` | Role registry. Index: [[90-Agents/index]] |
| `99-Templates/` | Templates for every note type. |

Every note links back to its project MOC (`[[10-Projects/{slug}]]`) or to an index.
The method itself is documented in the arachne plugin (`skills/vault/references/method.md`).
