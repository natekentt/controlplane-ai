---
title: "Fix framework determinism gaps"
status: completed
tier: Medium
created: 2026-03-22
updated: 2026-03-22
tags: [framework, determinism, ux]
confidence_score:
  requirements_completeness: High
  design_clarity: High
  edge_case_coverage: Medium
  test_strategy: Medium
  operational_readiness: High
  risk_identification: Medium
  future_impact: Medium
  overall: Medium
---

## Scope

Fix 6 framework gaps that cause non-deterministic agent behavior and poor UX. Medium tier — 4 files modified, ~150–200 lines added.

## Affected Areas

- `.agent/skills/change-management.md` — tier detection decision tree and scoring rubric
- `.agent/commands/plan.md` — confidence gate override, questioning bailout, edge case prompting
- `.agent/commands/execute.md` — verification minimums per tier
- `.agent/templates/plan.md` — Assumptions section, confidence override frontmatter fields

## Acceptance Criteria

```
Given a change with clear physical metrics (e.g., 3 files, 120 lines)
When the agent runs tier detection
Then the decision tree produces a single deterministic tier before complexity overrides are evaluated
```

```
Given a change with complexity signals (e.g., 1 file but dense auth logic)
When the agent evaluates complexity overrides
Then each signal adds a defined point value, and the total determines whether to tier up
```

```
Given a Medium+ plan where one confidence dimension is Low
When the user explicitly accepts the Low dimension
Then the plan records the override in frontmatter and rationale in the Assumptions section, and planning proceeds
```

```
Given a Medium plan in its 3rd round of questioning
When the agent reaches the round limit
Then it proactively offers to draft with current context (user can continue if they choose)
```

```
Given any Medium+ plan in the questioning phase
When the agent reaches edge case / failure mode questions
Then it explicitly asks the user to identify edge cases the plan should handle
```

```
Given a plan phase with a verification step
When the agent executes verification
Then it follows the tier-appropriate minimum (Small: manual confirmation, Medium: at least one automated check, Large: automated suite + integration)
```

**Out of scope**: Bootstrap/cold-start handling, plan refinement workflow, rollback procedures, subagent output enforcement, concurrent plans.

## Approach

Additive changes to 4 existing framework files. No new files. Each gap is addressed with minimal, targeted additions that follow existing patterns.

### Alternatives Considered

| Alternative | Reason Rejected |
|-------------|-----------------|
| Create a dedicated `tier-detection.md` skill | Over-engineers a single concern; better to keep it in change-management where tier logic already lives |
| Hard-block questioning bailout (no user override) | Conflicts with user-override principle (Change Management Rule 7) |
| Prescriptive verification checklists per tier | Framework is project-agnostic; can't assume specific test runners or tools |

## Assumptions

- The framework is currently used primarily with Claude Code, so instructions can assume a conversational agent context.
- Existing skill/command structure is stable — no restructuring needed.
- Users are comfortable with the existing questioning flow; the bailout is additive, not a replacement.
- The scoring rubric for complexity overrides doesn't need to be perfectly calibrated on first pass — it can be tuned based on usage.

## Phases

### Phase 1: Tier Detection — Decision Tree + Scoring Rubric

Add a deterministic decision tree for physical metrics and a point-based scoring rubric for complexity overrides to `.agent/skills/change-management.md`.

**Decision tree** (physical metrics):
1. File count ≤ 1 AND line delta < 50 → baseline Small
2. File count 2–5 AND line delta 50–300 → baseline Medium
3. File count 6+ OR line delta 300+ → baseline Large
4. Ambiguous (e.g., 1 file, 200 lines) → take the higher tier from either dimension

**Scoring rubric** (complexity overrides):
Each signal present adds +1. Total ≥ 2 signals → tier up by one. Signals:
- Dense business logic / domain rules
- Multiple data sources with inconsistent schemas
- Complex state transformations or pipeline orchestration
- Security-sensitive logic (auth, crypto, permissions)
- No existing codebase precedent (novel pattern)

- **Changes**: Add decision tree subsection and scoring rubric subsection under Tier Signals in change-management.md. Add tie-breaking rule for ambiguous physical metrics.
- **Verification**: Read the updated file and confirm the decision tree produces a single answer for all input combinations. Verify the scoring rubric has clear thresholds.

**File Manifest**

| File | Action | Description |
|------|--------|-------------|
| `.agent/skills/change-management.md` | Modify | Add decision tree, scoring rubric, and tie-breaking rule under Tier Signals |

### Phase 2: Confidence Gate Override + Assumptions Section

Add override mechanism to `.agent/commands/plan.md` and add Assumptions section + override frontmatter fields to `.agent/templates/plan.md`.

- **Changes**:
  - `plan.md`: Add "Confidence Override" subsection under Gate Logic. When a user explicitly accepts a Low dimension, the agent records it and proceeds. Max 2 overrides allowed — if 3+ dimensions are Low, the plan genuinely isn't ready.
  - `plan.md`: Update assumption surfacing step to reference the new template section.
  - `plan.md` template: Add `confidence_overrides` list to frontmatter schema (dimension, accepted_level, rationale). Add `## Assumptions` section between Acceptance Criteria and Approach.
- **Verification**: Read both updated files and confirm the override path is clearly defined with limits. Confirm the Assumptions section is positioned correctly in the template.

**File Manifest**

| File | Action | Description |
|------|--------|-------------|
| `.agent/commands/plan.md` | Modify | Add confidence override subsection and update assumption surfacing step |
| `.agent/templates/plan.md` | Modify | Add confidence_overrides to frontmatter, add Assumptions section |

### Phase 3: Questioning Bailout + Edge Case Prompting

Add tier-based round limits and edge case solicitation to `.agent/commands/plan.md`.

- **Changes**:
  - Add "Round Limits" subsection under Questioning Phase. Define: Small: 1 round, Medium: 2 rounds, Large: 3 rounds. After the limit, agent proactively offers to draft. User can continue — this is a soft limit.
  - Update the "Edge Cases & Failure Modes" questioning category to require the agent to explicitly ask users to identify edge cases the plan should handle, rather than relying solely on agent-generated edge cases. Add example prompt.
  - Update the testing skill to add a rule requiring edge case solicitation during test strategy planning.
- **Verification**: Read the updated file and confirm round limits are defined per tier. Confirm edge case prompting language is explicit and includes an example.

**File Manifest**

| File | Action | Description |
|------|--------|-------------|
| `.agent/commands/plan.md` | Modify | Add round limits subsection, update edge case category with explicit user prompting |
| `.agent/skills/testing.md` | Modify | Add rule for edge case solicitation during test planning |

### Phase 4: Verification Minimums

Add tier-based verification minimum requirements to `.agent/commands/execute.md`.

- **Changes**:
  - Add "Verification Requirements" subsection after step 5. Define minimums per tier:
    - **Small**: Manual confirmation that the change works (agent or user). No automated check required.
    - **Medium**: At least one automated verification step (test, lint, type check, or build). Plan phase must specify which.
    - **Large**: Automated test suite for the phase's scope + integration check if the phase touches boundaries. Plan phase must specify the suite command.
  - Update the existing verification failure guidance (step 5, bullet 7) to reference these minimums.
- **Verification**: Read the updated file and confirm minimums are defined per tier. Confirm the existing verification failure step references the new subsection.

**File Manifest**

| File | Action | Description |
|------|--------|-------------|
| `.agent/commands/execute.md` | Modify | Add verification requirements subsection with tier-based minimums |

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Scoring rubric thresholds feel arbitrary | Medium | Document that thresholds are tunable; start conservative (≥2 signals) |
| Confidence override weakens planning rigor | Low | Cap at 2 overrides max; require explicit rationale for each |
| Round limits frustrate users who need deep exploration | Low | Soft limit only — user can always continue |

## Future Work

- **Anticipated next steps**: Address remaining gaps (bootstrap, plan refinement, rollback, subagent enforcement) in a follow-up plan.
- **Known limitations**: Scoring rubric thresholds may need calibration based on real usage.
- **Deferred requirements**: Hard enforcement of subagent output contracts; plan dependency/inheritance tracking.

## File Manifest

| File | Action | Phase | Description |
|------|--------|-------|-------------|
| `.agent/skills/change-management.md` | Modify | Phase 1 | Add decision tree, scoring rubric, tie-breaking rule |
| `.agent/commands/plan.md` | Modify | Phase 2, 3 | Add confidence override, update assumption surfacing, add round limits, add edge case prompting, add phased review presentation |
| `.agent/templates/plan.md` | Modify | Phase 2 | Add confidence_overrides to frontmatter, add Assumptions section |
| `.agent/commands/execute.md` | Modify | Phase 4 | Add verification requirements with tier-based minimums |
| `.agent/skills/testing.md` | Modify | Phase 3 | Add edge case solicitation rule |
