# Command: /execute

**Intent**: Load a persisted plan from `.agent/plans/` and run it phase by phase with verification after each phase.

## Execution Steps

0. **Announce and fresh session gate.** Before anything else, respond with:

   > ControlPlane AI execution mode is now active.

   Then evaluate the fresh session gate. Execution should happen in a fresh session with minimal prior context. The persisted plan file is the bridge — the executing agent reads the plan, not the planning conversation.
   - If the current session has significant prior conversation (i.e., this is not a fresh start), **strongly recommend** starting a new session before proceeding.
   - Explain: execution quality degrades when the context window is filled with planning conversation, exploration artifacts, or unrelated work.
   - Provide the exact guidance: *"For best results, start a new session and run `/execute <plan-path>` as your first message."*
   - The user can override this recommendation and proceed in the current session — do not hard-block.
1. **Identify plan.** Accept an optional plan name or path as argument. If none given, list recent `approved` plans and suggest the most recent one.
2. **Load and present.** Read the plan file and present a brief summary (title, tier, phase count, confidence scores) for confirmation before starting. If any confidence dimension is Low, warn the user and recommend returning to `/plan` to resolve gaps.
3. **Handle status.**
   - `draft` — Inform the user the plan hasn't been approved. Ask if they want to approve it now or return to `/plan` to refine.
   - `approved` — Proceed to execution.
   - `executing` — The plan was previously started. Identify which phases are complete and offer to resume from the next incomplete phase or restart.
   - `completed` — Inform the user the plan was already completed. Ask if they want to re-execute.
4. **Environment setup.** If the plan has an Environment & Setup section, execute it as "Phase 0" before beginning Phase 1:
   - Install dependencies at pinned versions.
   - Verify required environment variables are set (warn on missing).
   - Create or modify config files as specified.
   - Run setup commands in order.
   - Create new directories as specified.
   - Verify environment is ready before proceeding to Phase 1.
5. **Begin execution.** Update frontmatter status to `executing` and `updated` date. Execute each phase sequentially:
   - Announce the phase before starting (e.g., "Starting Phase 1: Foundation").
   - Use the phase's File Manifest as the authoritative file list when present — create, modify, or delete exactly the files listed.
   - Implement all changes described in the phase.
   - Write tests mapped to each phase as part of that phase — do not defer test writing to later phases.
   - Track File Manifest progress internally during the phase. At the end of each phase, report manifest status in conversation: which files were completed, which were skipped, and which diverged from the plan. Do not edit the plan file per-file — report once per phase.
   - Run the phase's verification step. Apply the [Verification Requirements](#verification-requirements) minimum for the plan's tier.
   - **Stop on verification failure.** Do not proceed to the next phase. Report the failure and ask the user how to proceed (fix and retry, skip, or abort).
6. **Inter-phase checkpoint.** After each successful phase, briefly confirm with the user before moving to the next phase.
   - For **Large tier** plans: note how many phases remain. If 3+ phases remain and the context has accumulated significant implementation artifacts, recommend starting a fresh session for the next phase.
   - Provide the resume command: `/execute <plan-path>` — the plan tracks which phases are complete via `executing` status, so the next session picks up where this one left off.
7. **Post-execution validation.** After all phases pass verification:
   - Run the full test suite.
   - Verify pipeline files exist and are valid (if CI/CD Pipeline section exists).
   - Verify run scripts work (if Production Readiness section exists).
   - Cross-reference the comprehensive File Manifest — confirm every listed file was addressed with the correct action.
   - Report any discrepancies.
8. **Complete.** After validation passes, update frontmatter status to `completed` and `updated` date. Summarize what was accomplished. Suggest the user run `/commit` to commit the changes.

## Verification Requirements

Minimum verification standards per tier. Each phase's verification step must meet or exceed the minimum for the plan's tier.

| Tier | Minimum Verification |
|------|---------------------|
| **Small** | Manual confirmation that the change works (agent or user). No automated check required. |
| **Medium** | At least one automated verification step — test, lint, type check, or build. The plan phase must specify which. |
| **Large** | Automated test suite covering the phase's scope + integration check if the phase touches system boundaries. The plan phase must specify the suite command. |

If a phase's verification step does not meet the tier minimum, the executing agent must add an appropriate check before marking the phase as verified. For example, if a Medium plan phase lists only "read the file and confirm" as verification, the agent must also run at least one automated check (e.g., lint or type check).

## Plan Updates During Execution

If reality diverges from the plan during execution (unexpected files, new dependencies, scope changes):

- Update the persisted plan file to reflect the actual state.
- If scope grows enough to change the tier, stop and inform the user.
- The plan file should always reflect what actually happened, not just what was originally planned.

## Research Delegation

Before implementing each phase, the agent often needs to discover files, understand existing patterns, or check dependencies. This research should be delegated to subagents to keep the main context focused on implementation.

- **Delegate**: file discovery, pattern research ("What does the existing test setup look like?"), dependency analysis ("What imports does this module need?"), and any exploration that may return large volumes of output.
- **Keep in main context**: reading the plan, implementing changes, running verification, and user communication.
- **Subagent output contract**: subagents return brief, actionable summaries — not raw file contents or grep output.
- **When to delegate vs. read directly**: reading a specific file by known path is fine in the main context. Open-ended exploration ("What patterns does `src/api/` use?") should be delegated.

See [Context Engineering](../skills/context-engineering.md) for the full rationale.

## Constraints

- Never execute without a persisted plan file. If the user wants to execute an ad-hoc change, direct them to `/plan` first.
- Always verify after each phase before proceeding.
- Always update the plan file's frontmatter to reflect current status.
- Commit at tier-appropriate granularity: Small = 1 commit, Medium = 1–2 commits, Large = 1 commit per phase.
- The File Manifest is authoritative — if a phase's manifest lists a file, it must be addressed. If a file is not in the manifest, do not modify it without updating the plan.
- Tests are written alongside the code they verify, not deferred to later phases.

## Dependencies

- **Skill**: [Change Management](../skills/change-management.md)
- **Skill**: [Context Engineering](../skills/context-engineering.md) — fresh session gate, research delegation
- **Template**: [Plan](../templates/plan.md)
- **Command**: [Plan](./plan.md) — creates persisted plans
