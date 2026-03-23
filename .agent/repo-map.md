# Repo Map: ControlPlane AI

## Tech Stack

| Category | Technology | Notes |
|----------|-----------|-------|
| Language | Markdown | All agent resources are plain markdown |
| Framework | None | Framework-agnostic — works with Claude Code, Cursor, Copilot, and other agents |

## Directory Structure

```
controlplane-ai/
├── .agent/              # Agent resource root — skills, commands, templates, plans
│   ├── commands/        # Executable workflows triggered by user intent (/commit, /plan, etc.)
│   ├── plans/           # Persisted plan files (YAML frontmatter + markdown)
│   ├── skills/          # Domain knowledge and best practices (applied automatically)
│   └── templates/       # Output contracts for generated artifacts
├── .claude/             # Claude Code local settings
├── .cursor/             # Cursor IDE rules
│   └── rules/           # Cursor-specific rule files
├── .github/             # GitHub-specific config
│   └── copilot-instructions.md  # Copilot agent instructions
└── docs/                # (future) Documentation
```

## Key Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Top-level behavioral contract — principles, resource discovery, git standards, execution rules |
| `CLAUDE.md` | Claude Code session priming — points to AGENTS.md and .agent/control-plane-index.md |
| `.agent/control-plane-index.md` | Resource registry — all skills, commands, templates listed here (single source of truth) |
| `.agent/repo-map.md` | This file — codebase orientation for instant session context |
| `.github/copilot-instructions.md` | Copilot agent instructions (mirrors AGENTS.md conventions) |
| `.cursor/rules/controlplane.mdc` | Cursor IDE rules (mirrors AGENTS.md conventions) |

## Architectural Layers

| Layer | Purpose | Key Paths |
|-------|---------|-----------|
| Entry Points | Agent-specific priming files that bootstrap sessions | `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules/` |
| Registry | Central index for resource discovery | `.agent/control-plane-index.md` |
| Skills | Passive domain knowledge applied automatically when relevant | `.agent/skills/` |
| Commands | Active workflows triggered by user intent | `.agent/commands/` |
| Templates | Output contracts defining artifact structure | `.agent/templates/` |
| Plans | Persisted plan artifacts created by /plan, executed by /execute | `.agent/plans/` |

## Common Patterns

- **Lazy Loading** — Agents read `.agent/control-plane-index.md` to discover resources, then load individual files on demand. Never scan directories.
- **Skill Meta-Template** — All skills follow a standard structure: Purpose, Rules, Examples, Exceptions, References (defined in `.agent/templates/skill.md`).
- **Plan-Execute Separation** — Planning and execution are distinct phases. `/plan` persists a plan file; `/execute` reads and runs it. The plan file bridges sessions.
- **Tiered Change Management** — All changes auto-detect a tier (Small/Medium/Large) that determines how much process applies.
- **Conventional Commits** — Git messages follow `<type>(<scope>): <subject>` format.
- **YAML Frontmatter** — Plan files use YAML frontmatter for metadata (status, tier, confidence scores).

## Development Commands

| Command | Purpose |
|---------|---------|
| N/A | No build/test/run commands — this is a pure markdown framework |
