# Plan Template

Output contract for structured change plans. Commands and skills that produce plans must follow this format.

---

## Frontmatter

Every persisted plan file begins with YAML frontmatter:

```yaml
---
title: "<descriptive title>"
status: draft | approved | executing | completed
tier: Small | Medium | Large
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: []
---
```

**Status lifecycle**: `draft` → `approved` → `executing` → `completed`

**File naming**: `.agent/plans/YYYY-MM-DD-<slug>.md` — date-prefixed, lowercase hyphenated slug derived from the title.

## Scope

One sentence stating what this plan accomplishes and the detected change tier (Small / Medium / Large).

## Affected Areas

Bulleted list of files, modules, or architectural layers that will change.

- `path/to/file` — what changes and why

## Approach

Description of the chosen strategy.

### Alternatives Considered *(optional, Medium+ tiers)*

| Alternative | Reason Rejected |
|-------------|-----------------|
| ... | ... |

## Phases

Each phase is independently verifiable. Small-tier plans may have a single phase.

### Phase N: Title

- **Changes**: What will be created, modified, or removed.
- **Verification**: How to confirm this phase succeeded (command, test, manual check).

## Risks *(optional, Medium+ tiers)*

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| ... | Low / Medium / High | ... |
