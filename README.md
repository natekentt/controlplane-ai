# ControlPlane AI

**One set of rules. Every AI agent. Consistent engineering behavior.**

ControlPlane AI is a behavioral framework that gives engineering teams a single, declarative control layer over every AI coding agent — Claude Code, GitHub Copilot, Cursor, and any tool that reads project-level instructions. Instead of ad-hoc prompting and inconsistent AI output, you get structured workflows, enforced standards, and a plan-then-execute discipline that scales from a one-line fix to a multi-phase architectural change.

## Installation

Requires [Node.js](https://nodejs.org/) 18 or later.

**macOS**
```bash
# Install Node.js (if not already installed)
brew install node

# Initialize ControlPlane AI in your project
npx controlplane-ai init
```

**Windows**
```powershell
# Install Node.js (if not already installed)
# Download from https://nodejs.org/ or use winget:
winget install OpenJS.NodeJS.LTS

# Initialize ControlPlane AI in your project
npx controlplane-ai init
```

**Linux**
```bash
# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Initialize ControlPlane AI in your project
npx controlplane-ai init
```

After init, start a session with any AI agent (Claude Code, Cursor, Copilot) — the framework handles the rest.

**Other commands**
```bash
npx controlplane-ai validate    # Check for local modifications to framework files
npx controlplane-ai update      # Update framework files to latest version
npx controlplane-ai uninstall   # Remove all framework files from your project
```

**Updating to the latest version**
```bash
npx controlplane-ai@latest update
```

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

### Auto-Bootstrap

When an agent starts its first session in a repo, ControlPlane AI automatically detects the tech stack and generates stack-specific conventions — no manual setup required.

```
First session in a new repo:
  → Agent reads AGENTS.md and control-plane-index.md
  → Detects no repo-map exists — triggers bootstrap
  → Scans for stack signals (package.json, pyproject.toml, go.mod, Cargo.toml, etc.)
  → Generates stack-specific skills (e.g., typescript-conventions.md, python-conventions.md)
  → Creates repo-specific-index.md and repo-map.md
  → Proceeds with the user's request
```

The Detection Signal Table covers 10+ common stacks including JavaScript/TypeScript, Python, Go, Rust, Ruby, Java/Kotlin, Docker, GitHub Actions, and Infrastructure as Code. Monorepos get separate skills per subdirectory stack.

Subsequent sessions skip bootstrap entirely — the repo-map's existence signals that setup is complete.

### Skills System

Skills are passive domain knowledge that agents apply automatically when relevant. The framework ships with universal engineering skills, and auto-bootstrap generates stack-specific skills for each repo.

**Framework Skills** (ship with ControlPlane AI):

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
| **Context Engineering** | Protect the context window — subagent delegation, fresh sessions, repo map priming |
| **Bootstrap** | Auto-detect tech stacks and generate repo-specific skills on first session |

**Repo-Specific Skills** (auto-generated per repo):

Generated by bootstrap based on detected tech stacks. Examples: `typescript-conventions.md`, `python-conventions.md`, `docker-conventions.md`. These supplement — never shadow — framework skills.

Skills are loaded lazily — only when their domain is relevant to the current task. The `.agent/control-plane-index.md` registry enables deterministic lookup instead of probabilistic directory scanning.

### Commands

Commands are executable workflows triggered by user intent:

| Command | Purpose |
|---------|---------|
| `/plan` | Question, plan, persist. Produces a structured plan with gap analysis, confidence scoring, and project brief integration. |
| `/execute` | Load an approved plan and run it phase by phase with verification checkpoints. |
| `/commit` | Analyze staged changes, match existing commit style, generate a Conventional Commits message. |
| `/review` | Review changes against all domain skills with structured, severity-categorized feedback. |
| `/map` | Generate or update the repo map for instant codebase orientation. |

### Project Briefs

For projects that span multiple plans, ControlPlane AI supports **project briefs** — persistent requirement documents that track outstanding work across planning sessions.

- Created automatically during `/plan` when scope exceeds a single plan
- Track requirements with statuses: `outstanding` → `planned` → `completed`
- Include global patterns (architectural decisions, conventions) that apply across all derived plans
- Staleness detection flags briefs that haven't been re-validated across 3+ completed plans
- Each `/plan` session checks for active briefs and presents outstanding requirements for confirmation

---

## Project Structure

```
controlplane-ai/
├── AGENTS.md                              # Universal behavioral source of truth
├── CLAUDE.md                              # Claude Code adapter
├── .cursor/rules/controlplane.mdc         # Cursor adapter
├── .github/copilot-instructions.md        # GitHub Copilot adapter
├── .agent/
│   ├── control-plane-index.md             # Framework resource registry (deterministic lookup)
│   ├── repo-specific-index.md             # Repo-specific resources (auto-generated by bootstrap)
│   ├── repo-map.md                        # Codebase orientation map (auto-generated by bootstrap)
│   ├── commands/
│   │   ├── commit.md                      # /commit workflow
│   │   ├── plan.md                        # /plan workflow (with brief integration)
│   │   ├── execute.md                     # /execute workflow
│   │   ├── review.md                      # /review workflow
│   │   └── map.md                         # /map workflow
│   ├── skills/
│   │   ├── bootstrap.md                   # Auto-bootstrap: stack detection + skill generation
│   │   ├── change-management.md           # Tiered workflow engine
│   │   ├── code-quality.md                # Structural standards
│   │   ├── code-review.md                 # Review output format
│   │   ├── context-engineering.md         # Context window protection + subagent delegation
│   │   ├── documentation.md               # Documentation standards
│   │   ├── error-handling.md              # Error propagation rules
│   │   ├── git.md                         # Git conventions
│   │   ├── security.md                    # Security defaults
│   │   └── testing.md                     # Test standards
│   ├── templates/
│   │   ├── brief.md                       # Project brief template (multi-plan tracking)
│   │   ├── commit-msg.md                  # Conventional Commits format
│   │   ├── plan.md                        # Plan output contract (with frontmatter schema)
│   │   ├── repo-map.md                    # Repo map output contract
│   │   ├── repo-specific-index.md         # Repo-specific index template
│   │   └── skill.md                       # Skill meta-template
│   ├── plans/                             # Persisted plans (created by /plan, executed by /execute)
│   └── briefs/                            # Project briefs (multi-plan requirement tracking)
└── LICENSE
```

---

## Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Single source of truth** | `AGENTS.md` drives all tools. Adapters are 2–3 lines that point to it. |
| **Deterministic discovery** | Two-index architecture — `control-plane-index.md` (framework) + `repo-specific-index.md` (repo). Agents look up resources by name, never scan directories. |
| **Lazy loading** | Skills load on demand, not all at once. The index enables this. |
| **Zero-config onboarding** | Auto-bootstrap detects the tech stack and generates repo-specific skills on first session. No manual setup. |
| **Proportional process** | Tier detection applies the right amount of ceremony to every change. |
| **Self-describing** | The skill meta-template means new skills follow the same contract. Add a file, register it in the index, done. |
| **Plans as living documents** | Plans track their own lifecycle state and update through execution, not just at creation. |
| **Context as a resource** | The context window is finite and precious. Subagent delegation, fresh session gates, and repo map priming keep it focused on high-value work. |
| **Multi-session memory** | Project briefs persist requirements across planning sessions. Staleness detection prevents drift. |

---

## Quick Start

### Drop into any existing project

1. Copy the `.agent/` directory, `AGENTS.md`, and the adapter files into your repo
2. Start a session with any supported AI agent
3. Auto-bootstrap detects your tech stack, generates stack-specific skills, and creates a repo map
4. Your AI agents now follow your rules — no manual configuration needed

### Customize after bootstrap

- Edit auto-generated skills in `.agent/skills/` to match your team's conventions
- Add custom skills or commands and register them in `.agent/control-plane-index.md`
- Framework skills (testing, security, code quality, etc.) work out of the box

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
- **Zero-config onboarding** — Auto-bootstrap means your first session is productive, not spent configuring
- **Requirements persist across sessions** — Project briefs track outstanding work so nothing falls through the cracks

The goal isn't to constrain AI agents. It's to give them the same engineering discipline you'd expect from a senior developer on your team.

---

## License

MIT — see [LICENSE](LICENSE).
