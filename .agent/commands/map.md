# Command: /map

**Intent**: Generate or update the Repo Map (`.agent/repo-map.md`) — a concise codebase index for instant agent orientation on session start.

## Execution Steps

1. **Explore the codebase.** Delegate deep research to subagents where appropriate:
   - Identify the tech stack (languages, frameworks, key dependencies).
   - Map the directory structure and purpose of each directory.
   - Identify key files (entry points, configs, critical modules).
   - Understand architectural layers and how components interact.
   - Catalog common patterns used in the codebase.
   - Collect development commands (build, test, run, lint).
2. **Generate or update.** Write `.agent/repo-map.md` using the Repo Map Template (`.agent/templates/repo-map.md`).
   - If `.agent/repo-map.md` already exists, update it in place rather than regenerating from scratch.
   - Keep it concise — target under 150 lines. This is a quick-reference index, not exhaustive documentation.
3. **Announce.** Confirm the map was written and report the file path.

## Constraints

- The Repo Map must follow the Repo Map Template structure.
- Keep it under 150 lines — if the codebase is large, prioritize the most important paths and patterns.
- Do not include generated files, build artifacts, or vendored dependencies in the map.
- The map is descriptive, not prescriptive — it documents what exists, not what should exist.

## Dependencies

- **Template**: [Repo Map](../templates/repo-map.md)
- **Skill**: [Context Engineering](../skills/context-engineering.md) — the Repo Map is a key context management artifact
