# Skill: Change Management

## Purpose

Applies whenever an agent is about to modify code. Ensures changes are scoped, planned, and verified proportionally to their complexity. This is the workflow engine — other skills provide domain rules, this skill decides *how much process* to apply.

## Rules

1. **Auto-detect tier** before making changes. Use the signals table below to classify scope.
2. **Tier UP when in doubt.** A Medium change mis-classified as Small risks unbounded scope creep. The reverse only costs a brief plan.
3. **Small changes execute directly.** No plan required. Commit when done.
4. **Medium changes require a persisted plan with questioning and confidence scoring.** Run the questioning phase (scope, requirements, constraints), gap analysis, and confidence scoring — any Low dimension triggers additional questions. Persist the plan to `.agent/plans/`, confirm with the user, then execute via `/execute` and verify.
5. **Large changes require a persisted plan with deep questioning, gap analysis, and confidence scoring.** Run the full questioning phase across all eight categories, gap analysis, and confidence scoring — all dimensions must be Medium or High before plan generation. Persist the plan to `.agent/plans/`, and execute via `/execute` with phased verification. Each phase is independently verifiable. Do not start the next phase until the current one is confirmed.
6. **STOP and re-tier if scope grows.** If a Small change touches a third file, it's now Medium. If a Medium change requires new architecture, it's now Large. Inform the user and re-plan.
7. **User can override tier.** If the user says "just do it," treat as Small. If they say "plan this out," treat as Large. User intent overrides auto-detection.
8. **Every tier ends with verification.** Small: confirm the change works. Medium: run relevant tests. Large: verify each phase before proceeding.
9. **Plans are living documents.** If reality diverges from the plan during execution, update the persisted plan file in `.agent/plans/` before continuing — don't silently drift.
10. **Commit at tier-appropriate granularity.** Small: one commit. Medium: one or two commits. Large: one commit per phase.
11. **Plans must include a File Manifest.** Every Medium+ plan lists every file to create, modify, or delete with exact paths. The comprehensive File Manifest is the single source of truth for the executing agent.

## Tier Signals

| Tier | File Count | Line Delta | Typical Signals | Process |
|------|-----------|------------|-----------------|---------|
| **Small** | 1 | < 50 | Bug fix, typo, config tweak, adding a log line | Execute directly, verify, commit |
| **Medium** | 2–5 | 50–300 | New feature within existing patterns, refactor of one module | Question → gap analysis → confidence gate → plan → approve → `/execute` → verify |
| **Large** | 6+ | 300+ | New architecture, cross-cutting concern, multi-module refactor | Deep question → gap analysis → confidence gate → plan → approve → `/execute` phase-by-phase → verify each |

## Examples

### Good

```
User: "Fix the typo in the README"
Agent: (detects Small — 1 file, <5 lines) → fixes typo, commits.

User: "Add input validation to the API"
Agent: (detects Medium — 2-4 files, new validation layer) → asks 3-5 clarifying questions → persists plan to .agent/plans/ → gets approval → user runs /execute.

User: "Migrate from REST to GraphQL"
Agent: (detects Large — 10+ files, new architecture) → deep questioning across all 6 categories → persists full phased plan to .agent/plans/ → reviews with user → user runs /execute for phase-by-phase execution.
```

### Bad

```
Agent jumps into a 15-file refactor without producing a plan.
— Violates Rule 1: always detect tier first.

Agent produces a Large plan for fixing a typo.
— Violates proportionality. Small changes should execute directly (Rule 3).

Scope grows from 2 files to 8, agent keeps going without re-tiering.
— Violates Rule 6: STOP and re-tier when scope grows.

Agent generates a Medium plan inline in conversation without persisting it.
— Violates Rule 4: Medium plans must be persisted to .agent/plans/.
```

## Exceptions

- **Exception to Rule 4**: If the user has already provided a detailed plan or specification, skip plan generation and proceed to execution — but still verify at the end.
- **Exception to Rule 5**: In time-sensitive situations where the user explicitly requests speed over process, Medium-tier workflow may be used for Large changes. The agent should note the risk.

## References

- [Plan Template](../templates/plan.md) — output format for Medium and Large plans
- [Plan Command](../commands/plan.md) — questioning phase and plan persistence
- [Execute Command](../commands/execute.md) — phase-by-phase execution of persisted plans
