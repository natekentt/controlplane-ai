# Command: /plan

**Intent**: Analyze a proposed change, question to align on scope and requirements, run gap analysis and confidence scoring, auto-detect its tier, produce a structured plan, and persist it for later execution.

## Execution Steps

1. **Understand the request.** Parse the user's description of what they want to change.
2. **Preliminary tier estimate.** Apply the Change Management skill (`.agent/skills/change-management.md`) to make an initial classification. Announce the estimate and why.
3. **Questioning phase.** Ask probing questions scaled to the estimated tier before generating the plan. See [Questioning Phase](#questioning-phase) below.
4. **Gap analysis.** Run the [Gap Analysis Checklist](#gap-analysis-checklist) internally after questioning. Discovered gaps trigger targeted follow-up questions before proceeding.
5. **Confidence scoring.** Score each [confidence dimension](#confidence-scoring) based on information gathered. Apply [gate logic](#gate-logic) — any Low dimension blocks plan generation until resolved.
6. **Finalize tier.** Re-evaluate the tier with full context from the questioning phase. If the tier changed, announce the update.
7. **Generate plan.** Use the Plan Template (`.agent/templates/plan.md`) to produce a structured plan at the appropriate depth:
   - **Small**: Scope + single-phase approach + File Manifest. No alternatives, risks, or new sections needed.
   - **Medium**: Full plan with alternatives, acceptance criteria, test strategy, environment setup (if applicable), file manifest. 1–3 phases.
   - **Large**: Full plan with all sections — acceptance criteria, decision records, environment setup, test strategy, CI/CD pipeline, production readiness, risks, future work, and comprehensive file manifest. Multiple independently-verifiable phases.
8. **Persist to file.** Write the plan to `.agent/plans/YYYY-MM-DD-<slug>.md` with YAML frontmatter including confidence scores (status: `draft`). Announce the file path.
9. **Present for approval.** Show the plan and confidence report, then wait for user approval. On approval, update frontmatter status to `approved`.
10. **Do not execute.** Direct the user to run `/execute` to begin implementation.

## Questioning Phase

Questions ensure 95% of effort goes into planning so execution is mechanical. Eight categories, applied progressively based on tier:

| Category | Purpose |
|----------|---------|
| Scope Clarification | Confirm what is and isn't included |
| Requirements | Pin down functional expectations |
| Constraints & Preferences | Surface non-functional requirements |
| Edge Cases & Failure Modes | Anticipate what could go wrong |
| Integration & Dependencies | Understand connections to other systems |
| Architectural Tradeoffs | Surface design decisions worth discussing |
| Deployment & Pipeline | CI/CD requirements, deployment strategy, rollback needs *(Medium+ tiers)* |
| Production Environment | Infrastructure, secrets, config, monitoring requirements *(Medium+ tiers)* |

### Depth by Tier

- **Small**: 0–2 quick clarifications. Skip if the request is unambiguous.
- **Medium**: 3–6 questions covering scope, requirements, constraints, and deployment/production when relevant.
- **Large**: 6–12+ questions across all eight categories.

### Questioning Guidelines

- Batch questions logically, 3–4 at a time. Do not interrogate.
- Offer to proceed proactively when enough context exists (e.g., "I think I have enough to draft the plan — should I proceed, or are there other considerations?").
- Stop when: scope is bounded, acceptance criteria exist, ambiguities are resolved, or the user signals readiness.
- **Readiness check**: Before transitioning to plan generation, confirm that scope is bounded, acceptance criteria can be written, and no critical ambiguities remain.

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
- **Template**: [Plan](../templates/plan.md)
- **Command**: [Execute](./execute.md) — runs persisted plans
