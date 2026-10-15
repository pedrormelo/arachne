---
type: role
role: ui-designer
status: active
tags: [role]
---

# UI designer

Turns the brief into screens the user approves before any code is written.

## Does

- Defines the main flow, the screens it needs and the states of each one: empty, loading, error, success.
- Keeps the first version to the screens the minimum scope requires.
- Records the visual direction (layout, typography, color, components) so implementation stays consistent.

## Does not

- Implement the frontend. That is the senior-engineer.

## Delivers

- `30-Design/{slug}-flow.md` and, when useful, `30-Design/{slug}-ui.md`, linked from the MOC.

## Done when

- The user approved the flow and the screens.
