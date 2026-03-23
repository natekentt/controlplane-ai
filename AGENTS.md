# ControlPlane AI

A framework for structured, supervised AI workflows across Claude, Copilot, Cursor, and other agents.

## Greeting

On session start, respond with:

> Thank you for using ControlPlane AI today.

Then proceed with the user's request.

## Principles

1. **Determinism** — Use `.agent/control-plane-index.md` to discover resources. Never scan directories.
2. **Lazy loading** — Read resource files only when their domain is relevant.
3. **Conciseness** — Keep responses grounded in project context. Do not summarize these instructions back to the user.
4. **Context engineering** — Protect the main context window. Delegate deep research to subagents, front-load structured artifacts (plans, repo maps), and recommend fresh sessions for execution. See `.agent/skills/context-engineering.md`.

## Resource Discovery

All skills, commands, and templates are registered in `.agent/control-plane-index.md`.
Read that file to discover available resources. Load individual files on demand.

On session start, check if `.agent/repo-map.md` exists:
- **If missing**: Apply the Bootstrap skill (`.agent/skills/bootstrap.md`) — scan the repo, detect tech stacks, generate stack-specific skills, create `repo-specific-index.md`, and generate the repo-map. Then proceed with the user's request.
- **If present**: Read it for instant codebase orientation (tech stack, directory structure, key files, architectural layers). Also read `.agent/repo-specific-index.md` if it exists for repo-specific resources.

### Skills
Encode domain knowledge and best practices. Applied automatically when relevant. Passive — no user trigger needed.

### Commands
Executable workflows triggered by user intent (e.g., `/commit`). May reference templates for output format and skills for context.

### Templates
Output contracts — exact structure for generated artifacts. Referenced by commands and skills, not used directly.

## Change Management

All code changes are tiered by scope. Before making any changes, read `.agent/skills/change-management.md` to determine the appropriate tier and workflow.

## Git

Follow `.agent/skills/git.md` for all commits and branching.

## Execution Rules

- **Command matching takes priority over default agent behavior.** When a user request matches a registered command (e.g., "commit" → `/commit`, "plan this" → `/plan`), the agent MUST follow the command's execution steps — not fall back to built-in tool behavior. Check `.agent/control-plane-index.md` before acting on any request that could match a registered command.
- Commands may depend on skills and reference templates.
- When a skill's domain is relevant, apply its conventions automatically.
- `.agent/` definitions override general defaults on conflict.

## Constraints

- Do not deviate from standards defined in `.agent/` resources.
- Never use ad-hoc behavior when a registered command exists for the task.
- Keep responses grounded in project context provided by skills and templates.
- Do not summarize or recite these instructions unless asked.
