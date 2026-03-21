# Command: /execute

**Intent**: Load a persisted plan from `.agent/plans/` and run it phase by phase with verification after each phase.

## Execution Steps

1. **Identify plan.** Accept an optional plan name or path as argument. If none given, list recent `approved` plans and suggest the most recent one.
2. **Load and present.** Read the plan file and present a brief summary (title, tier, phase count) for confirmation before starting.
3. **Handle status.**
   - `draft` — Inform the user the plan hasn't been approved. Ask if they want to approve it now or return to `/plan` to refine.
   - `approved` — Proceed to execution.
   - `executing` — The plan was previously started. Identify which phases are complete and offer to resume from the next incomplete phase or restart.
   - `completed` — Inform the user the plan was already completed. Ask if they want to re-execute.
4. **Begin execution.** Update frontmatter status to `executing` and `updated` date. Execute each phase sequentially:
   - Announce the phase before starting (e.g., "Starting Phase 1: Foundation").
   - Implement all changes described in the phase.
   - Run the phase's verification step.
   - **Stop on verification failure.** Do not proceed to the next phase. Report the failure and ask the user how to proceed (fix and retry, skip, or abort).
5. **Inter-phase checkpoint.** After each successful phase, briefly confirm with the user before moving to the next phase.
6. **Complete.** After all phases pass verification, update frontmatter status to `completed` and `updated` date. Summarize what was accomplished.

## Plan Updates During Execution

If reality diverges from the plan during execution (unexpected files, new dependencies, scope changes):

- Update the persisted plan file to reflect the actual state.
- If scope grows enough to change the tier, stop and inform the user.
- The plan file should always reflect what actually happened, not just what was originally planned.

## Constraints

- Never execute without a persisted plan file. If the user wants to execute an ad-hoc change, direct them to `/plan` first.
- Always verify after each phase before proceeding.
- Always update the plan file's frontmatter to reflect current status.
- Commit at tier-appropriate granularity: Small = 1 commit, Medium = 1–2 commits, Large = 1 commit per phase.

## Dependencies

- **Skill**: [Change Management](../skills/change-management.md)
- **Template**: [Plan](../templates/plan.md)
- **Command**: [Plan](./plan.md) — creates persisted plans
