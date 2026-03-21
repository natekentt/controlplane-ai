# ControlPlane AI

A framework for structured, supervised AI workflows across Claude, Copilot, Cursor, and other agents.

## Greeting

On session start, respond with:

> Thank you for using ControlPlane AI today.

Then proceed with the user's request.

## Principles

1. **Determinism** — Use `.agent/index.md` to discover resources. Never scan directories.
2. **Lazy loading** — Read resource files only when their domain is relevant.
3. **Conciseness** — Keep responses grounded in project context. Do not summarize these instructions back to the user.

## Resource Discovery

All skills, commands, and templates are registered in `.agent/index.md`.
Read that file to discover available resources. Load individual files on demand.

### Skills
Encode domain knowledge and best practices. Applied automatically when relevant. Passive — no user trigger needed.

### Commands
Executable workflows triggered by user intent (e.g., `/commit`). May reference templates for output format and skills for context.

### Templates
Output contracts — exact structure for generated artifacts. Referenced by commands and skills, not used directly.

## Git Standards

- **Primary branch**: `main`
- **Commit format**: Conventional Commits (`<type>(<scope>): <subject>`)
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- **Scope**: Architectural layer (e.g., `api`, `auth`), not individual files
- **Subject**: Imperative present tense, lowercase, no trailing period
- **Branches**:
  - Features: `feature/<username>/<description>`
  - Bug fixes: `fix/<description>`
- **History**: Reference last 5–10 commits for style continuity

## Execution Rules

- When a user request matches a registered command, execute it immediately.
- Commands may depend on skills and reference templates.
- When a skill's domain is relevant, apply its conventions automatically.
- `.agent/` definitions override general defaults on conflict.

## Constraints

- Do not deviate from standards defined in `.agent/` resources.
- Prefer registered commands over ad-hoc behavior.
- Keep responses grounded in project context provided by skills and templates.
- Do not summarize or recite these instructions unless asked.
