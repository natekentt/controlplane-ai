# Command: /plan

**Intent**: Analyze a proposed change, auto-detect its tier, and produce an appropriately-scoped plan.

## Execution Steps

1. **Understand the request.** Parse the user's description of what they want to change.
2. **Detect tier.** Apply the Change Management skill (`.agent/skills/change-management.md`) to classify the change as Small, Medium, or Large based on estimated file count, line delta, and nature of the change.
3. **Announce tier.** Tell the user the detected tier and why. The user can override.
4. **Generate plan.** Use the Plan Template (`.agent/templates/plan.md`) to produce a structured plan at the appropriate depth:
   - **Small**: Scope + single-phase approach. No alternatives or risks needed.
   - **Medium**: Full plan with alternatives considered. 1–3 phases.
   - **Large**: Full plan with alternatives, risks, and multiple independently-verifiable phases.
5. **Present for confirmation.** Show the plan and wait for user approval before executing.

## Constraints

- Always apply the Change Management skill — never skip tier detection.
- Plans must follow the Plan Template structure exactly.
- Do not begin execution until the user confirms the plan.
- If the user provides additional context that changes the tier, re-tier and regenerate.

## Dependencies

- **Skill**: [Change Management](../skills/change-management.md)
- **Template**: [Plan](../templates/plan.md)
