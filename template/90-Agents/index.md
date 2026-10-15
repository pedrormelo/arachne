---
type: index
tags: [index, roles]
---

# Role registry

Each file defines one role: mission, scope, inputs and deliverable. The orchestrator picks roles from here, and workers adopt a role by reading its file.
Start small: delete roles you do not use, and add new ones from `99-Templates/role.md`.

| Phase | Role | Call when |
|---|---|---|
| Meta | [[00-orchestrator]] | any new request |
| Discovery | [[05-market-researcher]] | the category or market is unfamiliar |
| Discovery | [[15-existing-system-analyst]] | the project already exists and must be mapped first |
| Product | [[10-product-strategist]] | deciding what to build and for whom |
| Design | [[12-ui-designer]] | screens need approval before code |
| Architecture | [[20-tech-architect]] | stack choices, ADRs, task breakdown |
| Infra | [[22-infra-engineer]] | infrastructure, database, deploy, migrations |
| Build | [[30-senior-engineer]] | implementation, debugging |
| Quality | [[35-qa-engineer]] | acceptance criteria, tests, coverage |
