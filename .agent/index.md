# Resource Index

## Skills

| Name | Description | Path |
|------|-------------|------|
| Git Standards | Git conventions, branching, and commit style | `.agent/skills/git.md` |
| Change Management | Tiered workflow engine — auto-detects scope and applies appropriate process | `.agent/skills/change-management.md` |
| Code Quality | Readability, maintainability, and structural standards | `.agent/skills/code-quality.md` |
| Testing | Test structure, coverage expectations, and reliability standards | `.agent/skills/testing.md` |
| Security | Input validation, secrets management, and secure defaults | `.agent/skills/security.md` |
| Error Handling | Error propagation, typed errors, and failure recovery | `.agent/skills/error-handling.md` |
| Documentation | API docs, ADRs, inline comments, and documentation hygiene | `.agent/skills/documentation.md` |
| Code Review | Structured review output and severity-categorized feedback | `.agent/skills/code-review.md` |

## Commands

| Name | Description | Path |
|------|-------------|------|
| Commit | Generate a commit message from staged changes | `.agent/commands/commit.md` |
| Plan | Question, plan, and persist — produces a structured plan with questioning phase, gap analysis, and confidence scoring, then saves to `.agent/plans/` | `.agent/commands/plan.md` |
| Execute | Load a persisted plan and run it phase by phase with verification | `.agent/commands/execute.md` |
| Review | Review changes against all domain skills with structured output | `.agent/commands/review.md` |

## Templates

| Name | Description | Path |
|------|-------------|------|
| Commit Message | Conventional Commits message format | `.agent/templates/commit-msg.md` |
| Skill | Standard structure for all skills | `.agent/templates/skill.md` |
| Plan | Output contract for structured change plans with frontmatter schema, confidence scoring, test strategy, and file manifest | `.agent/templates/plan.md` |

## Directories

| Path | Purpose |
|------|---------|
| `.agent/plans/` | Persisted plan files (YAML frontmatter + markdown). Created by `/plan`, executed by `/execute`. |
