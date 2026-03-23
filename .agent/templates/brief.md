# Brief Template

All project briefs follow this structure. YAML frontmatter is required. Sections are required unless marked optional.

---

## Frontmatter Schema

```yaml
---
title: "Brief title"
status: active          # active | completed | archived
created: YYYY-MM-DD
last_validated: YYYY-MM-DD
tags: [tag1, tag2]
---
```

### Status Definitions

- **active** — Requirements remain outstanding. Plans reference this brief.
- **completed** — All requirements are `completed`. No further plans needed.
- **archived** — Superseded or abandoned. Retained for reference.

### Staleness Rules

- `last_validated` is updated each time `/plan` references the brief and the user confirms requirements are still valid.
- If 3+ plans derived from this brief reach `completed` status without `last_validated` being updated, the agent flags the brief as potentially stale and prompts for full re-validation.
- Re-validation means: present all outstanding requirements to the user, ask *"Are these still valid?"*, and update `last_validated` on confirmation.

---

## Sections

### Vision

One to two sentences describing the overall project goal. This anchors all derived plans.

```markdown
## Vision

Build an automated deployment pipeline that reduces release cycle time from days to hours while maintaining full audit trail compliance.
```

### Requirements

Numbered list of project requirements. Each has a status and optional plan reference.

**Requirement statuses:**
- `outstanding` — Not yet addressed by any plan.
- `planned` — A plan has been created to address this requirement. Include the plan file reference.
- `completed` — The plan addressing this requirement has been executed successfully.

```markdown
## Requirements

1. **Automated build pipeline** — `completed` → [2026-03-15-build-pipeline.md](../plans/2026-03-15-build-pipeline.md)
2. **Staging environment provisioning** — `planned` → [2026-03-20-staging-env.md](../plans/2026-03-20-staging-env.md)
3. **Production deployment with rollback** — `outstanding`
4. **Audit logging for all deployments** — `outstanding`
5. **Slack notifications on deploy events** — `outstanding`
```

### Global Patterns *(optional)*

Conventions, architectural decisions, or preferences that apply across all plans derived from this brief. These inform every `/plan` session that references the brief.

```markdown
## Global Patterns

- All infrastructure is defined in Terraform.
- Use GitHub Actions for CI/CD.
- Prefer blue-green deployments over rolling updates.
- All API responses follow the project's standard envelope format.
```

### Plans

Table linking to plans derived from this brief.

```markdown
## Plans

| Plan | Status | Requirements Addressed |
|------|--------|----------------------|
| [2026-03-15-build-pipeline.md](../plans/2026-03-15-build-pipeline.md) | completed | #1 |
| [2026-03-20-staging-env.md](../plans/2026-03-20-staging-env.md) | executing | #2 |
```
