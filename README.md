# ControlPlane AI

**One set of rules. Every AI agent. Consistent engineering behavior.**

ControlPlane AI is a behavioral framework that gives engineering teams a single, declarative control layer over every AI coding agent — Claude Code, GitHub Copilot, Cursor, and any tool that reads project-level instructions. Instead of ad-hoc prompting and inconsistent AI output, you get structured workflows, enforced standards, and a plan-then-execute discipline that scales from a one-line fix to a multi-phase architectural change.

---

## The Problem

AI coding agents are powerful but chaotic. Every team member prompts differently. Every tool behaves differently. The result:

- **Inconsistent code quality** — the same agent produces different styles across sessions
- **No proportional process** — a typo fix gets the same treatment as a database migration
- **No planning discipline** — agents jump straight to writing code before understanding the problem
- **Tool lock-in** — conventions defined for one AI tool don't transfer to another
- **Silent drift** — agents deviate from architectural decisions with no accountability

ControlPlane AI eliminates these problems with a single source of truth that every agent reads, understands, and follows.

---

## How It Works

```
                    ┌──────────────────────────────┐
                    │          AGENTS.md            │
                    │   (Universal Source of Truth)  │
                    └──────────┬───────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼──────┐  ┌─────▼──────┐  ┌──────▼────────┐
     │  CLAUDE.md    │  │  .cursor/  │  │   .github/    │
     │  (adapter)    │  │  (adapter) │  │   (adapter)   │
     └────────┬──────┘  └─────┬──────┘  └──────┬────────┘
              │                │                │
     ┌────────▼──────┐  ┌─────▼──────┐  ┌──────▼────────┐
     │  Claude Code  │  │   Cursor   │  │ GitHub Copilot│
     └───────────────┘  └────────────┘  └───────────────┘
```

Every AI tool gets a **thin adapter** (2–3 lines) that points to `AGENTS.md`. The actual rules, workflows, skills, and templates live in `.agent/` and are loaded on demand. One change propagates to every tool instantly — no duplication, no drift.

---

## Core Concepts

### Tiered Change Management

Not every change deserves a planning phase. ControlPlane auto-classifies every request and applies proportional process:

| Tier | Signals | What Happens |
|------|---------|--------------|
| **Small** | 1 file, <50 lines | Execute directly. No ceremony. |
| **Medium** | 2–5 files, 50–300 lines | Question → Plan → Approve → Execute → Verify |
| **Large** | 6+ files, 300+ lines | Deep questioning → Plan → Approve → Execute phase-by-phase → Verify each |

Agents detect the tier automatically. When in doubt, they tier **up**, not down. You can override.

### Plan / Execute Separation

For Medium and Large changes, planning and execution are **fully decoupled** with human approval as a hard gate between them.

```
/plan                                    /execute
  │                                        │
  ├─ Tier detection                        ├─ Load approved plan
  ├─ Questioning phase (3–12+ questions)   ├─ Phase 0: Environment setup
  ├─ Gap analysis (15-item checklist)      ├─ Phase 1: Implement → Verify → Checkpoint
  ├─ Confidence scoring (7 dimensions)     ├─ Phase 2: Implement → Verify → Checkpoint
  ├─ Plan generation                       ├─ ...
  ├─ Persist to .agent/plans/              ├─ Full test suite
  └─ Present for approval                  └─ Mark completed
           │
      [Human reviews]
      [Human approves]
```

Plans are **living documents** with lifecycle states (`draft → approved → executing → completed`) and a **File Manifest** that acts as the authoritative contract for which files get touched. If a file isn't in the manifest, the agent can't modify it without updating the plan first.

### Confidence Scoring as a Gate

Before a plan can be approved, the agent scores confidence across 7 dimensions:

| Dimension | What It Measures |
|-----------|-----------------|
| Requirements Completeness | Are all requirements captured? |
| Design Clarity | Is the technical approach well-defined? |
| Edge Case Coverage | Are edge cases and error paths addressed? |
| Test Strategy | Is the testing approach sufficient? |
| Operational Readiness | Are deployment and infrastructure concerns covered? |
| Risk Identification | Are risks identified with mitigations? |
| Future Impact | Are downstream effects understood? |

**Any dimension scoring `Low` blocks plan generation.** The agent must ask more questions or gather more context before proceeding. This prevents the most common failure mode of AI agents: confidently executing a half-understood plan.

### Skills System

Skills are passive domain knowledge that agents apply automatically when relevant:

| Skill | What It Enforces |
|-------|-----------------|
| **Git Standards** | Conventional Commits, branch naming, historical awareness |
| **Change Management** | Tiered workflows, scope detection, re-tiering |
| **Code Quality** | Single responsibility, 40-line max, no magic numbers, DRY-at-three |
| **Testing** | AAA structure, one assertion per behavior, mock externals not internals |
| **Security** | Boundary validation, parameterized queries, no secrets in code |
| **Error Handling** | Fail fast, typed errors, actionable messages, cleanup on failure |
| **Documentation** | WHY not WHAT, ADR format, examples over prose |
| **Code Review** | Structured output, severity categories, always a verdict |

Skills are loaded lazily — only when their domain is relevant to the current task. The `.agent/control-plane-index.md` registry enables deterministic lookup instead of probabilistic directory scanning.

### Commands

Commands are executable workflows triggered by user intent:

| Command | Purpose |
|---------|---------|
| `/plan` | Question, plan, persist. Produces a structured plan with gap analysis and confidence scoring. |
| `/execute` | Load an approved plan and run it phase by phase with verification checkpoints. |
| `/commit` | Analyze staged changes, match existing commit style, generate a Conventional Commits message. |
| `/review` | Review changes against all domain skills with structured, severity-categorized feedback. |

---

## Project Structure

```
controlplane-ai/
├── AGENTS.md                              # Universal behavioral source of truth
├── CLAUDE.md                              # Claude Code adapter
├── .cursor/rules/controlplane.mdc         # Cursor adapter
├── .github/copilot-instructions.md        # GitHub Copilot adapter
├── .agent/
│   ├── control-plane-index.md              # Resource registry (deterministic lookup)
│   ├── commands/
│   │   ├── commit.md                      # /commit workflow
│   │   ├── plan.md                        # /plan workflow
│   │   ├── execute.md                     # /execute workflow
│   │   └── review.md                      # /review workflow
│   ├── skills/
│   │   ├── change-management.md           # Tiered workflow engine
│   │   ├── code-quality.md                # Structural standards
│   │   ├── code-review.md                 # Review output format
│   │   ├── documentation.md               # Documentation standards
│   │   ├── error-handling.md              # Error propagation rules
│   │   ├── git.md                         # Git conventions
│   │   ├── security.md                    # Security defaults
│   │   └── testing.md                     # Test standards
│   ├── templates/
│   │   ├── commit-msg.md                  # Conventional Commits format
│   │   ├── plan.md                        # Plan output contract (with frontmatter schema)
│   │   └── skill.md                       # Skill meta-template
│   └── plans/                             # Persisted plans (runtime working directory)
└── LICENSE
```

---

## Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Single source of truth** | `AGENTS.md` drives all tools. Adapters are 2–3 lines that point to it. |
| **Deterministic discovery** | `.agent/control-plane-index.md` replaces directory scanning. Agents look up resources by name. |
| **Lazy loading** | Skills load on demand, not all at once. The index enables this. |
| **Proportional process** | Tier detection applies the right amount of ceremony to every change. |
| **Self-describing** | The skill meta-template means new skills follow the same contract. Add a file, register it in the index, done. |
| **Plans as living documents** | Plans track their own lifecycle state and update through execution, not just at creation. |

---

## Quick Start

### Drop into any existing project

1. Copy the `.agent/` directory, `AGENTS.md`, and the adapter files into your repo
2. Customize skills for your team's conventions
3. Register any new resources in `.agent/control-plane-index.md`
4. Your AI agents now follow your rules

### Add a new skill

1. Create a markdown file in `.agent/skills/` following the skill template
2. Add a row to `.agent/control-plane-index.md`
3. That's it — agents discover and apply it automatically

### Add a new command

1. Create a markdown file in `.agent/commands/` defining the workflow
2. Register it in `.agent/control-plane-index.md`
3. Agents can now execute it when triggered

---

## Why This Matters

AI agents are becoming core infrastructure for engineering teams. But without a control layer, each agent is a black box with its own interpretation of "good code." ControlPlane AI turns that black box into a transparent, auditable, extensible system where:

- **Standards are encoded, not hoped for** — Every skill is a numbered ruleset, not a suggestion
- **Planning is enforced, not optional** — Confidence gates prevent half-baked execution
- **Process scales with scope** — A typo fix flows through instantly; a migration gets a full planning pipeline
- **Tools are interchangeable** — Switch from Cursor to Claude Code tomorrow; your standards come with you
- **Knowledge compounds** — Every skill you add makes every future AI interaction better

The goal isn't to constrain AI agents. It's to give them the same engineering discipline you'd expect from a senior developer on your team.

---

## License

MIT — see [LICENSE](LICENSE).
