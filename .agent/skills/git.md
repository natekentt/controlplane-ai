# Skill: Git & Version Control Standards

## Repository Context
- **Primary Branch**: `main`
- **Commit Style**: Conventional Commits (see `.agent/templates/commit-msg.md`).
- **Scope Definition**: Scopes should represent architectural layers, not individual files.

## Historical Awareness
- Always reference the last 5-10 commits to ensure continuity in messaging.
- If the project uses a specific tagging system (e.g., `[BUMP]`, `[FIX]`), adhere to that pattern over generic defaults.

## Branching Logic
- Feature branches should follow: `feature/username/description-of-change`.
- Bug fixes should follow: `fix/description-of-change`.
