# Skill: Change Management

## Purpose

Applies whenever an agent is about to modify code. Ensures changes are scoped, planned, and verified proportionally to their complexity. This is the workflow engine — other skills provide domain rules, this skill decides *how much process* to apply.

## Rules

1. **Auto-detect tier** before making changes. Use the signals table below to classify scope.
2. **Tier UP when in doubt.** A Medium change mis-classified as Small risks unbounded scope creep. The reverse only costs a brief plan.
3. **Small changes execute directly.** No plan required. Commit when done.
4. **Medium changes require a brief plan.** Produce a plan (see `.agent/templates/plan.md`), confirm with the user, then execute and verify.
5. **Large changes require a full plan with phased execution.** Each phase is independently verifiable. Do not start the next phase until the current one is confirmed.
6. **STOP and re-tier if scope grows.** If a Small change touches a third file, it's now Medium. If a Medium change requires new architecture, it's now Large. Inform the user and re-plan.
7. **User can override tier.** If the user says "just do it," treat as Small. If they say "plan this out," treat as Large. User intent overrides auto-detection.
8. **Every tier ends with verification.** Small: confirm the change works. Medium: run relevant tests. Large: verify each phase before proceeding.
9. **Plans are living documents.** If reality diverges from the plan during execution, update the plan before continuing — don't silently drift.
10. **Commit at tier-appropriate granularity.** Small: one commit. Medium: one or two commits. Large: one commit per phase.

## Tier Signals

| Tier | File Count | Line Delta | Typical Signals |
|------|-----------|------------|-----------------|
| **Small** | 1 | < 50 | Bug fix, typo, config tweak, adding a log line |
| **Medium** | 2–5 | 50–300 | New feature within existing patterns, refactor of one module |
| **Large** | 6+ | 300+ | New architecture, cross-cutting concern, multi-module refactor |

## Examples

### Good

```
User: "Fix the typo in the README"
Agent: (detects Small — 1 file, <5 lines) → fixes typo, commits.

User: "Add input validation to the API"
Agent: (detects Medium — 2-4 files, new validation layer) → produces brief plan, gets confirmation, implements, runs tests.

User: "Migrate from REST to GraphQL"
Agent: (detects Large — 10+ files, new architecture) → produces full phased plan, reviews with user, executes phase-by-phase with verification.
```

### Bad

```
Agent jumps into a 15-file refactor without producing a plan.
— Violates Rule 1: always detect tier first.

Agent produces a Large plan for fixing a typo.
— Violates proportionality. Small changes should execute directly (Rule 3).

Scope grows from 2 files to 8, agent keeps going without re-tiering.
— Violates Rule 6: STOP and re-tier when scope grows.
```

## Exceptions

- **Exception to Rule 4**: If the user has already provided a detailed plan or specification, skip plan generation and proceed to execution — but still verify at the end.
- **Exception to Rule 5**: In time-sensitive situations where the user explicitly requests speed over process, Medium-tier workflow may be used for Large changes. The agent should note the risk.

## References

- [Plan Template](../templates/plan.md) — output format for Medium and Large plans
