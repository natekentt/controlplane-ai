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
confidence_score:           # Medium+ tiers; optional for Small
  requirements_completeness: Low | Medium | High
  design_clarity: Low | Medium | High
  edge_case_coverage: Low | Medium | High
  test_strategy: Low | Medium | High
  operational_readiness: Low | Medium | High
  risk_identification: Low | Medium | High
  future_impact: Low | Medium | High
  overall: Low | Medium | High   # = min(all dimensions)
---
```

**Status lifecycle**: `draft` → `approved` → `executing` → `completed`

**File naming**: `.agent/plans/YYYY-MM-DD-<slug>.md` — date-prefixed, lowercase hyphenated slug derived from the title.

**Confidence scoring**: `overall` equals the minimum of all individual dimensions. All dimensions must be Medium or High before a plan can be approved.

## Scope

One sentence stating what this plan accomplishes and the detected change tier (Small / Medium / Large).

## Affected Areas

Bulleted list of files, modules, or architectural layers that will change.

- `path/to/file` — what changes and why

## Acceptance Criteria *(Medium+ tiers)*

Behavioral expectations in BDD format. Each criterion is independently testable.

```
Given <precondition>
When <action>
Then <expected outcome>
```

**Non-functional requirements** — quantified where possible (e.g., "response time < 200ms at p95").

**Out of scope** — explicit list of what this plan does NOT cover.

## Approach

Description of the chosen strategy.

### Alternatives Considered *(optional, Medium+ tiers)*

| Alternative | Reason Rejected |
|-------------|-----------------|
| ... | ... |

### Decision Records *(Large tier)*

ADR-style records for key architectural choices made during planning.

**DR-N: Decision Title**

- **Context**: What problem or question prompted this decision.
- **Decision**: What was decided and why.
- **Consequences**: Trade-offs accepted, risks introduced, future constraints.

## Environment & Setup *(Medium+ tiers, when applicable)*

Include when the change introduces new dependencies, env vars, config files, or directory structures.

**Dependencies**

| Dependency | Version | Purpose |
|------------|---------|---------|
| ... | pinned version | ... |

**Environment Variables**

| Name | Description | Default | Required |
|------|-------------|---------|----------|
| ... | ... | ... | Yes / No |

**Config Files** — list any config files to create or modify with expected content.

**Setup Commands** — ordered list of commands to run before implementation begins.

**Directory Structure** — new directories to create with their purpose.

## Test Strategy *(Medium+ tiers)*

**Test Types Required**

| Type | Framework | Coverage Target |
|------|-----------|-----------------|
| Unit | ... | ... |
| Integration | ... | ... |
| E2E | ... | ... |

**Requirement-to-Test Mapping**

| Acceptance Criterion | Test Name | Test Type |
|---------------------|-----------|-----------|
| AC-1: ... | `test_...` | Unit |
| AC-2: ... | `test_...` | Integration |

**Edge Case Catalog** — enumerate edge cases and their expected behavior.

**Error Path Tests** — enumerate error scenarios and expected handling.

**Coverage Expectations**

- **Small**: Manual verification sufficient.
- **Medium**: Key paths tested; >80% coverage on new code.
- **Large**: Comprehensive coverage; >90% on new code, regression suite passes.

## Phases

Each phase is independently verifiable. Small-tier plans may have a single phase.

### Phase N: Title

- **Changes**: What will be created, modified, or removed.
- **Verification**: How to confirm this phase succeeded (command, test, manual check).

**File Manifest**

| File | Action | Description |
|------|--------|-------------|
| `path/to/file` | Create / Modify / Delete | What changes |

## CI/CD Pipeline *(Large tier, or when pipeline changes needed)*

**Pipeline Stages**

| Stage | Gate Criteria | Order |
|-------|--------------|-------|
| ... | ... | ... |

**Pipeline Files** — files to create or modify for CI/CD.

**Deployment Strategy** — how the change rolls out (e.g., blue-green, canary, rolling).

**Rollback Procedure** — how to revert if deployment fails.

## Production Readiness *(Large tier, or when runtime-affecting)*

**Run Scripts**

| Script | Command | Purpose |
|--------|---------|---------|
| Start | `...` | ... |
| Stop | `...` | ... |
| Build | `...` | ... |
| Dev | `...` | ... |
| Test | `...` | ... |

**Infrastructure Requirements** — compute, storage, network, third-party services.

**Secrets**

| Name | Storage | Purpose |
|------|---------|---------|
| ... | ... | ... |

**Monitoring Signals** — key metrics, logs, alerts to set up.

## Risks *(optional, Medium+ tiers)*

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| ... | Low / Medium / High | ... |

## Future Work *(Medium+ tiers)*

- **Anticipated next steps** — work that naturally follows this plan.
- **Extension points** — where the system is designed to grow.
- **Known limitations** — constraints accepted in this iteration.
- **Deferred requirements** — requirements identified but explicitly deferred, with reasoning.

## File Manifest *(all tiers)*

Comprehensive cross-phase summary. Single source of truth for the executing agent.

| File | Action | Phase | Description |
|------|--------|-------|-------------|
| `path/to/file` | Create / Modify / Delete | Phase N | What changes |
