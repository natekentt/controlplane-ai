# Skill: Context Engineering

## Purpose

Applies whenever an agent manages a multi-step workflow, delegates research, or begins execution of a persisted plan. Ensures the main context window — a scarce, finite resource — stays focused on high-value work rather than filling with exploration artifacts, stale conversation, or raw research output.

## Rules

1. **The main context window is a scarce resource.** Every token of research, exploration, or stale conversation reduces capacity for actual work. Protect it.
2. **Start execution in a fresh session.** Before running `/execute`, the agent should recommend a clean session. The persisted plan file is the bridge between planning and execution — the executing agent reads it, not the planning conversation.
3. **Delegate deep research to subagents.** Codebase exploration, pattern analysis, and file discovery should happen in isolated subagent contexts. Only concise conclusions return to the main context.
4. **Read the Repo Map first.** On session start, read `.agent/repo-map.md` (if it exists) before deep exploration. This gives instant orientation — tech stack, directory structure, key files, architectural layers — without burning context on discovery.
5. **Front-load structured artifacts, not conversation.** The most valuable tokens in a context window are structured artifacts (plans, repo maps, skill files), not conversational back-and-forth. Load artifacts early, keep conversation concise.
6. **Recommend fresh context between phases for Large plans.** For Large-tier multi-phase plans, recommend (not require) a fresh session between phases when context is heavy. The plan file tracks phase completion state, so the next session picks up where the last left off.
7. **Never let research artifacts dominate the main context.** If an exploration returns hundreds of lines of results, that belongs in a subagent. The main context gets the summary.
8. **Prime subagents with structured context.** When delegating to a subagent, include: (a) the repo map (`.agent/repo-map.md`) or a relevant excerpt, (b) the specific section of the plan being worked on (if executing) or the user's request description and current question context (if planning), and (c) a focused question — not an open-ended "explore this." Subagents with context produce better summaries than subagents sent to discover everything from scratch.

## Examples

### Good

```
Agent receives /execute for a Large plan.
→ Reads the persisted plan file for context.
→ Delegates "What patterns does src/api/ use?" to a subagent.
→ Subagent returns: "REST controllers with Express, middleware chain for auth, Zod for validation."
→ Agent implements using the 1-line summary, not 200 lines of source code.
```

```
Agent delegates codebase research to a subagent during /execute.
→ Includes the repo map excerpt for src/api/.
→ Includes the Phase 2 section from the persisted plan.
→ Asks: "What validation pattern do the existing route handlers in src/api/routes/ use?"
→ Subagent returns a focused answer: "Zod schemas defined inline, validated in middleware before handler."
→ Agent implements the new route following the discovered pattern.
```

```
Agent starts a new session.
→ Reads AGENTS.md, .agent/control-plane-index.md, and .agent/repo-map.md.
→ Has instant orientation on the codebase without any exploration.
→ Proceeds directly to the user's request.
```

### Bad

```
Agent explores 15 files to understand the codebase structure in the main context.
— Violates Rule 3: delegate deep research to subagents.
— Violates Rule 4: the Repo Map provides this orientation instantly.
```

```
Agent plans and executes in the same session, with 40 messages of planning conversation still in context.
— Violates Rule 2: start execution in a fresh session.
— The planning conversation wastes context that execution needs for code changes.
```

```
Subagent returns 500 lines of grep results to the main context.
— Violates Rule 7: only concise conclusions should return to the main context.
```

## Exceptions

- **Exception to Rule 2**: If the plan is Small tier or the context is genuinely light, a fresh session is unnecessary. The recommendation applies when prior conversation would meaningfully degrade execution quality.
- **Exception to Rule 3**: For targeted, single-file lookups (reading one specific file by path), direct reads are more efficient than subagent delegation.
- **Exception to Rule 6**: If phases are small and context remains manageable, continuing in the same session is fine. The recommendation targets sessions where accumulated context visibly degrades agent performance.

## References

- [Change Management](./change-management.md) — tier detection and workflow rules
- [Plan Command](../commands/plan.md) — questioning phase with research delegation
- [Execute Command](../commands/execute.md) — fresh session gate and phased execution
- [Repo Map Template](../templates/repo-map.md) — structure for codebase orientation maps
