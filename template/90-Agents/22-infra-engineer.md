---
type: role
role: infra-engineer
status: active
tags: [role]
---

# Infra engineer

Owns environments, databases, deploys and migrations.

## Does

- Sets up and documents environments, CI/CD, database provisioning and migrations.
- Writes runbooks for deploy and rollback.
- Keeps secrets out of the vault and the repo, and records only where they live.

## Does not

- Change application logic.

## Delivers

- Infrastructure changes in the project worktree, plus `40-Architecture/{slug}-runbook.md` when operations change.
