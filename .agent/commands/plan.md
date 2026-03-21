# Command: /plan

**Intent**: Analyze a proposed change, question to align on scope and requirements, auto-detect its tier, produce a structured plan, and persist it for later execution.

## Execution Steps

1. **Understand the request.** Parse the user's description of what they want to change.
2. **Preliminary tier estimate.** Apply the Change Management skill (`.agent/skills/change-management.md`) to make an initial classification. Announce the estimate and why.
3. **Questioning phase.** Ask probing questions scaled to the estimated tier before generating the plan. See [Questioning Phase](#questioning-phase) below.
4. **Finalize tier.** Re-evaluate the tier with full context from the questioning phase. If the tier changed, announce the update.
5. **Generate plan.** Use the Plan Template (`.agent/templates/plan.md`) to produce a structured plan at the appropriate depth:
   - **Small**: Scope + single-phase approach. No alternatives or risks needed.
   - **Medium**: Full plan with alternatives considered. 1–3 phases.
   - **Large**: Full plan with alternatives, risks, and multiple independently-verifiable phases.
6. **Persist to file.** Write the plan to `.agent/plans/YYYY-MM-DD-<slug>.md` with YAML frontmatter (status: `draft`). Announce the file path.
7. **Present for approval.** Show the plan and wait for user approval. On approval, update frontmatter status to `approved`.
8. **Do not execute.** Direct the user to run `/execute` to begin implementation.

## Questioning Phase

Questions ensure 95% of effort goes into planning so execution is mechanical. Six categories, applied progressively based on tier:

| Category | Purpose |
|----------|---------|
| Scope Clarification | Confirm what is and isn't included |
| Requirements | Pin down functional expectations |
| Constraints & Preferences | Surface non-functional requirements |
| Edge Cases & Failure Modes | Anticipate what could go wrong |
| Integration & Dependencies | Understand connections to other systems |
| Architectural Tradeoffs | Surface design decisions worth discussing |

### Depth by Tier

- **Small**: 0–2 quick clarifications. Skip if the request is unambiguous.
- **Medium**: 3–6 questions covering scope, requirements, and constraints.
- **Large**: 6–12+ questions across all six categories.

### Questioning Guidelines

- Batch questions logically, 3–4 at a time. Do not interrogate.
- Offer to proceed proactively when enough context exists (e.g., "I think I have enough to draft the plan — should I proceed, or are there other considerations?").
- Stop when: scope is bounded, acceptance criteria exist, ambiguities are resolved, or the user signals readiness.

## Constraints

- Always apply the Change Management skill — never skip tier detection.
- Always run the questioning phase for Medium and Large tiers.
- Plans must follow the Plan Template structure exactly, including frontmatter.
- Plans must be persisted to `.agent/plans/` — never leave a plan only in conversation.
- Do not begin execution after planning. The `/execute` command handles execution.
- If the user provides additional context that changes the tier, re-tier and regenerate.

## Dependencies

- **Skill**: [Change Management](../skills/change-management.md)
- **Template**: [Plan](../templates/plan.md)
- **Command**: [Execute](./execute.md) — runs persisted plans
