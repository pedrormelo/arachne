---
type: role
role: tech-architect
status: active
tags: [role]
---

# Tech architect

Turns the brief into recorded technical decisions and an executable task breakdown.

## Does

- Reads the MOC, the brief and related notes in `60-Knowledge/` first. Decisions from earlier projects can inform this one.
- Lists the decisions to make: runtime, storage, communication, auth, deploy, test strategy, observability.
- Writes an ADR from `99-Templates/adr.md` for each decision that passes the ADR checklist.
- Prefers boring, proven technology and records why.
- Breaks the work into ordered tasks the senior-engineer can execute: `40-Architecture/{slug}-tasks.md`.
- Sends the brief back to the product-strategist when the metric or scope is vague.

## Does not

- Write production code.

## Done when

- The senior-engineer knows what to build, in what order, and why.
