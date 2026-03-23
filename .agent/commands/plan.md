# Command: /plan

**Intent**: Analyze a proposed change, question to align on scope and requirements, run gap analysis and confidence scoring, auto-detect its tier, produce a structured plan, and persist it for later execution.

## Execution Steps

0. **Announce.** Before anything else, respond with:

   > ControlPlane AI planning mode is now active.

1. **Understand the request.** Parse the user's description of what they want to change.
2. **Brief check.** Check if `.agent/briefs/` contains any active briefs. If so:
   - Load the most recent active brief.
   - Present outstanding requirements to the user: *"There's an active project brief with these outstanding requirements: [list]. Are these still valid?"*
   - If the user confirms, update the brief's `last_validated` date.
   - If the user flags items as invalid or changed, update the brief accordingly.
   - Check staleness: if 3+ plans derived from this brief have reached `completed` status since `last_validated`, flag the brief as potentially stale and prompt for full re-validation before proceeding.
3. **Preliminary tier estimate.** Apply the Change Management skill (`.agent/skills/change-management.md`) to make an initial classification. Announce the estimate and why.
4. **Questioning phase.** Ask probing questions scaled to the estimated tier before generating the plan. See [Questioning Phase](#questioning-phase) below.
5. **Multi-plan scope detection.** During or after questioning, if the agent determines the scope exceeds a single plan (e.g., the user describes a project that would require 3+ phases spanning multiple concerns, or explicitly mentions future work that should be tracked):
   - Suggest creating a project brief: *"This scope spans multiple plans. I recommend creating a project brief to track all requirements across plans. Should I create one?"*
   - If the user agrees, create a brief in `.agent/briefs/YYYY-MM-DD-<slug>.md` following the Brief Template (`.agent/templates/brief.md`). Capture all stated requirements, including ones deferred to future plans.
   - The current plan references the brief and addresses a subset of its requirements.
   - If a brief already exists (from step 2), add any newly discovered requirements to it instead of creating a new one.
6. **Gap analysis.** Run the [Gap Analysis Checklist](#gap-analysis-checklist) internally after questioning. Discovered gaps trigger targeted follow-up questions before proceeding.
7. **Assumption surfacing.** Before scoring confidence, explicitly list all assumptions the plan relies on — things the agent believes to be true but has not confirmed with the user or verified in code. Present assumptions to the user for validation. Assumptions the user explicitly confirms or does not contest when presented are considered validated. Only assumptions the user flags as incorrect or uncertain remain unvalidated. Unvalidated assumptions lower the corresponding confidence dimension by one level (High → Medium, Medium → Low). Validated assumptions are recorded in the plan's **Assumptions** section (see Plan Template).
8. **Confidence scoring.** Score each [confidence dimension](#confidence-scoring) based on information gathered. Apply [gate logic](#gate-logic) — any Low dimension blocks plan generation until resolved.
9. **Finalize tier.** Re-evaluate the tier with full context from the questioning phase. If the tier changed, announce the update.
10. **Generate plan.** Use the Plan Template (`.agent/templates/plan.md`) to produce a structured plan at the appropriate depth:
    - **Small**: Scope + single-phase approach + File Manifest. No alternatives, risks, or new sections needed.
    - **Medium**: Full plan with alternatives, acceptance criteria, test strategy, environment setup (if applicable), file manifest. 1–3 phases.
    - **Large**: Full plan with all sections — acceptance criteria, decision records, environment setup, test strategy, CI/CD pipeline, production readiness, risks, future work, and comprehensive file manifest. Multiple independently-verifiable phases.
11. **Persist to file.** Write the plan to `.agent/plans/YYYY-MM-DD-<slug>.md` with YAML frontmatter including confidence scores (status: `draft`). Announce the file path. If a brief exists, update the brief's Requirements list to mark newly-planned items as `planned` and add the plan to the brief's Plans table.
12. **Present for approval.** For Medium+ plans with multiple phases, present the plan incrementally:
    - Show the Scope, Affected Areas, Acceptance Criteria, Assumptions, and Approach sections first.
    - Then present each phase one at a time, waiting for user acknowledgment before showing the next (e.g., "Ready for Phase 2?").
    - After the final phase, show the remaining sections (Risks, Future Work, File Manifest) and the confidence report.
    - Wait for user approval. On approval, update frontmatter status to `approved`.
    - **Small tier or single-phase plans**: Present the full plan at once — phased review is unnecessary.
13. **Do not execute.** Direct the user to run `/execute` to begin implementation. Suggest the user run `/commit` to commit the plan artifact.

## Questioning Phase

Questions ensure 95% of effort goes into planning so execution is mechanical. Eight categories, applied progressively based on tier:

| Category | Purpose |
|----------|---------|
| Scope Clarification | Confirm what is and isn't included |
| Requirements | Pin down functional expectations |
| Constraints & Preferences | Surface non-functional requirements |
| Edge Cases & Failure Modes | Anticipate what could go wrong — explicitly ask the user to identify edge cases (see below) |
| Integration & Dependencies | Understand connections to other systems |
| Architectural Tradeoffs | Surface design decisions worth discussing |
| Deployment & Pipeline | CI/CD requirements, deployment strategy, rollback needs *(Medium+ tiers)* |
| Production Environment | Infrastructure, secrets, config, monitoring requirements *(Medium+ tiers)* |

### Depth by Tier

- **Small**: 0–2 quick clarifications. Skip if the request is unambiguous.
- **Medium**: 3–6 questions covering scope, requirements, constraints, and deployment/production when relevant.
- **Large**: 6–12+ questions across all eight categories.

### Round Limits

Questioning proceeds in rounds (one round = one batch of questions + user response). After the limit, the agent proactively offers to draft the plan with current context. The user can always continue — this is a soft limit, not a hard cutoff.

- **Small**: 1 round (skip if unambiguous)
- **Medium**: 2 rounds
- **Large**: 3 rounds

After the limit: *"I have enough context to draft the plan. Should I proceed, or are there areas you'd like to explore further?"*

### Questioning Guidelines

- Batch questions logically, 3–4 at a time. Do not interrogate.
- Offer to proceed proactively when enough context exists (e.g., "I think I have enough to draft the plan — should I proceed, or are there other considerations?").
- Stop when: scope is bounded, acceptance criteria exist, ambiguities are resolved, or the user signals readiness.
- **Readiness check**: Before transitioning to plan generation, confirm that scope is bounded, acceptance criteria can be written, and no critical ambiguities remain.
- **Edge case solicitation**: When covering the Edge Cases & Failure Modes category, do not rely solely on agent-generated edge cases. Explicitly ask the user to identify edge cases the plan should handle. Example prompt: *"What edge cases or failure scenarios do you think this change should handle? I've identified [X, Y, Z] — are there others from your domain knowledge?"*

## Research Delegation

During the questioning phase, the agent often needs to understand existing code patterns, explore the codebase, or analyze dependencies. This research should be delegated to subagents to protect the main context window.

- **Delegate**: codebase exploration, pattern analysis, dependency mapping, file discovery, and any research that may return large amounts of raw output.
- **Keep in main context**: the conversation with the user (questions, answers, decisions) and concise conclusions from research.
- **Subagent output contract**: subagents return brief, actionable summaries — e.g., "The auth module uses JWT tokens stored in httpOnly cookies, implemented in `src/auth/jwt.ts`" — not hundreds of lines of source code.
- **When to delegate vs. read directly**: targeted single-file reads (by known path) are fine in the main context. Multi-file exploration, pattern discovery, and open-ended searches should be delegated.

See [Context Engineering](../skills/context-engineering.md) for the full rationale.

## Gap Analysis Checklist

Run internally after the questioning phase. Discovered gaps trigger targeted follow-up questions before confidence scoring.

### Functional Gaps

- [ ] Acceptance criteria cover all described behaviors
- [ ] Happy path is fully defined
- [ ] Error paths are identified with expected handling
- [ ] Input validation rules are specified
- [ ] Output shape / return values are defined

### Non-Functional Gaps

- [ ] Performance requirements are stated (or explicitly N/A)
- [ ] Security implications are considered
- [ ] Scalability constraints are identified
- [ ] Accessibility requirements are addressed (if UI-affecting)

### Operational Gaps

- [ ] Deployment approach is defined
- [ ] Environment variables and secrets are inventoried
- [ ] Monitoring / observability needs are stated
- [ ] Rollback procedure exists
- [ ] Dependency versions are pinned

For each unchecked item, ask a targeted follow-up question. Skip items that are clearly not applicable to the change.

## Confidence Scoring

Seven dimensions, each scored Low / Medium / High based on information gathered during questioning and gap analysis:

| Dimension | Low | Medium | High |
|-----------|-----|--------|------|
| Requirements Completeness | Key behaviors undefined | Most defined, some assumptions | All have acceptance criteria |
| Design Clarity | Approach unclear | Selected, some details TBD | Fully specified with rationale |
| Edge Case Coverage | Not discussed | Major cases identified | Comprehensive catalog |
| Test Strategy | No approach discussed | Types identified | Per-requirement mapping |
| Operational Readiness | Not considered | Basic approach | Full pipeline/rollback/monitoring |
| Risk Identification | Not assessed | Major risks identified | Cataloged with mitigations |
| Future Impact | Not considered | Extensions noted | Points, limitations, deferred work documented |

### Gate Logic

- **Any dimension is Low** → STOP. Ask targeted questions to raise every dimension to Medium or above. Do not generate the plan.
- **All dimensions Medium or High** → Proceed. Present a confidence report to the user alongside the plan.
- **Small tier**: Confidence scoring is optional. If applied, only Requirements Completeness and Design Clarity are evaluated.

### Confidence Override

When the agent cannot raise a Low dimension through further questioning (e.g., edge cases are inherently unknowable until implementation, or operational readiness is deliberately deferred), the user may explicitly accept the Low dimension:

1. The agent explains which dimension is Low and why it couldn't be resolved.
2. The user explicitly acknowledges the risk and accepts the Low dimension.
3. The agent records the override in the plan frontmatter (`confidence_overrides` list) with the dimension, accepted level, and the user's rationale.
4. The agent adds the override rationale to the plan's **Assumptions** section.
5. Planning proceeds.

**Limits**: Maximum 2 confidence overrides per plan. If 3+ dimensions are Low, the plan genuinely isn't ready — return to questioning or reduce scope.

## Constraints

- Always apply the Change Management skill — never skip tier detection.
- Always run the questioning phase for Medium and Large tiers.
- Always run gap analysis and confidence scoring for Medium and Large tiers.
- Plans must follow the Plan Template structure exactly, including frontmatter with confidence scores.
- Plans must be persisted to `.agent/plans/` — never leave a plan only in conversation.
- Do not begin execution after planning. The `/execute` command handles execution.
- If the user provides additional context that changes the tier, re-tier and regenerate.

## Dependencies

- **Skill**: [Change Management](../skills/change-management.md)
- **Skill**: [Context Engineering](../skills/context-engineering.md) — research delegation during questioning
- **Template**: [Plan](../templates/plan.md)
- **Command**: [Execute](./execute.md) — runs persisted plans
