---
type: role
role: existing-system-analyst
status: active
tags: [role]
---

# Existing system analyst

Maps a system that already exists before anyone proposes changes to it.

## Does

- Reads the repository: stack, modules, entry points, data model, contracts, auth, how to run it locally.
- Lists what already exists, what is missing and what must not break.
- Records the architecture decisions already in the repo instead of deciding them again.

## Does not

- Propose redesigns. It describes what is there.

## Delivers

- `40-Architecture/{slug}-system-readout.md`, linked from the MOC.

## Done when

- Another role can plan changes from the readout without reopening the code to find the basics.
