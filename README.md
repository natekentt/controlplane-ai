# ControlPlane AI

A framework for building structured, supervised AI workflows for engineering teams using Claude, Copilot, Cursor, and any other powerful agent. This control layer standardizes prompting, enforces output contracts, and orchestrates AI behavior — making AI usage more efficient, reliable, scalable, and production-ready.

## Architecture

```
controlplane-ai/
├── AGENTS.md                    # Universal source of truth (read by all tools)
├── CLAUDE.md                    # Claude Code adapter (thin)
├── .cursor/rules/controlplane.mdc  # Cursor adapter (thin)
├── .github/copilot-instructions.md # Copilot adapter (thin)
├── .agent/
│   ├── index.md                 # Resource registry (lazy-load index)
│   ├── commands/                # Executable workflows
│   ├── skills/                  # Domain knowledge and best practices
│   └── templates/               # Standardized output formats
└── .gitignore
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `AGENTS.md` as primary source | Universal standard read by 20+ AI tools |
| Index replaces directory scanning | Deterministic lookup vs probabilistic discovery |
| Thin tool adapters | Each tool config points to `AGENTS.md`, no duplication |

## Adding Resources

1. Create the resource file in the appropriate `.agent/` subdirectory:
   - `commands/` — Executable workflows (e.g., `/commit`)
   - `skills/` — Domain knowledge applied automatically
   - `templates/` — Output format contracts

2. Register it in `.agent/index.md` by adding a row to the table:
   ```
   | Name | Type | Description | Path |
   ```

3. That's it. Agents discover resources through the index — no other config needed.

## License

MIT — see [LICENSE](LICENSE).
