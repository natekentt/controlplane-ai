---
title: "Auto-bootstrap system with index architecture and project briefs"
status: completed
tier: Large
created: 2026-03-22
updated: 2026-03-22
tags: [bootstrap, architecture, briefs, ux]
confidence_score:
  requirements_completeness: Medium
  design_clarity: High
  edge_case_coverage: Medium
  test_strategy: Medium
  operational_readiness: Medium
  risk_identification: Medium
  future_impact: High
  overall: Medium
---

## Scope

Add an auto-bootstrap system that detects uninitialized repos on session start, scans the codebase, generates stack-specific skills, and creates a repo-specific resource index. Split the resource index into framework and repo-specific halves. Add project briefs for multi-plan requirement persistence. Large tier — 12+ files across 3 phases.

## Affected Areas

- `.agent/index.md` — renamed to `.agent/control-plane-index.md`, gains pointer to repo-specific index
- `AGENTS.md` — updated references + new bootstrap trigger in session start flow
- `CLAUDE.md`, `.cursor/rules/`, `.github/copilot-instructions.md` — updated index references
- `README.md` — updated index references
- `.agent/skills/` — new bootstrap skill with scanning logic and skill generation
- `.agent/templates/` — new repo-specific-index template, new brief template
- `.agent/commands/plan.md` — brief integration for multi-plan scope detection
- `.agent/repo-map.md` — updated index references
- `.agent/skills/context-engineering.md` — updated index references

## Acceptance Criteria

```
Given a repo with ControlPlane AI installed but no repo-map
When an agent starts a new session
Then it detects the missing repo-map, scans the codebase, generates stack-specific skills, creates repo-specific-index.md and repo-map, and proceeds with the user's request
```

```
Given a repo with an existing repo-map and repo-specific-index.md
When an agent starts a new session
Then it reads both indexes and the repo-map without re-running bootstrap, and session start completes in under 3 file reads
```

```
Given a repo containing package.json and tsconfig.json
When the bootstrap scan runs
Then it generates a JavaScript/TypeScript conventions skill following the skill meta-template and registers it in repo-specific-index.md
```

```
Given a truly empty greenfield repo (no code files)
When the bootstrap scan runs
Then it creates the repo-map (noting empty state), creates repo-specific-index.md with no generated skills, and does not error
```

```
Given a monorepo with Python in /backend and TypeScript in /frontend
When the bootstrap scan runs
Then it detects both stacks and generates separate skills for each
```

```
Given a /plan session where requirements exceed a single plan's scope
When the agent detects multi-plan scope during questioning
Then it creates a project brief in .agent/briefs/, captures all requirements (including deferred ones), and the first plan references the brief
```

```
Given an existing project brief with outstanding requirements
When the user runs /plan in a subsequent session
Then the agent shows outstanding requirements from the brief, asks "Are these still valid?", and the new plan addresses a subset from the brief
```

```
Given a project brief that has not been validated across 3+ completed plans
When the agent references the brief during /plan
Then it flags the brief as potentially stale and prompts for full re-validation
```

**Out of scope**: Installable package distribution/packaging, skill quality scoring or automated skill testing, brief merging or splitting, concurrent bootstrap across multiple agents, custom skill authoring CLI.

## Assumptions

- The framework has not been widely distributed yet — renaming index.md will not break external consumers. *validated*
- The `.agent/` directory is the framework's home for both framework and repo-specific resources — no separate location needed. *validated*
- Auto-generated skills follow the existing skill meta-template exactly. *validated*
- Bootstrap scan delegates codebase exploration to subagents to keep session start lightweight. *validated*
- Project briefs are created on-demand during planning, not during bootstrap. *validated*
- All agent platforms (Claude Code, Cursor, Copilot) can perform the bootstrap check since they all read AGENTS.md. *validated*
- The repo-specific-index.md lives in `.agent/` alongside control-plane-index.md. *validated*
- Existing framework skills (testing, security, code quality) remain universal — auto-generated skills supplement them with stack-specific conventions. *validated*

## Approach

Three-phase approach: first restructure the index architecture (rename + split), then build the auto-bootstrap system (detection, scanning, skill generation), then add project briefs for multi-plan persistence. Each phase is independently verifiable and builds on the previous.

### Alternatives Considered

| Alternative | Reason Rejected |
|-------------|-----------------|
| Keep single index.md with framework + repo sections | Muddies the line between framework-owned and repo-specific resources; harder to reason about what's portable vs. local |
| Make bootstrap a `/setup` command (user-triggered) | User requested automated behavior; manual setup adds friction and is easy to forget |
| Store repo-specific skills outside `.agent/` | Fragments the resource model; agents already know to look in `.agent/` |
| Create briefs as a standalone `/brief` command | Over-engineers a feature that integrates naturally into `/plan`; add a command later if needed |

### Decision Records

**DR-1: Two-Index Architecture**

- **Context**: The framework needs to distinguish between its own portable resources (skills, commands, templates) and repo-specific resources (auto-generated skills, repo-map).
- **Decision**: Split into `control-plane-index.md` (framework) and `repo-specific-index.md` (repo). The framework index references the repo-specific index. Agents read both.
- **Consequences**: Clearer ownership model. Repo-specific index can be `.gitignore`d if desired. Adds one file read to session start.

**DR-2: Repo-Map as Bootstrap Signal**

- **Context**: Need a reliable, unambiguous signal for "this repo has been bootstrapped."
- **Decision**: Use repo-map existence as the bootstrap signal. If `.agent/repo-map.md` doesn't exist, run bootstrap.
- **Consequences**: Simple boolean check. Leverages an artifact that already provides value (codebase orientation). Risk: user could manually create a repo-map without running full bootstrap — mitigated by also checking for repo-specific-index.md.

**DR-3: Briefs Integrated into /plan**

- **Context**: Users working on large greenfield projects lose requirements across planning sessions.
- **Decision**: Integrate brief creation into `/plan` rather than a separate command. When scope exceeds one plan, `/plan` creates a brief and the first plan references it.
- **Consequences**: No new command to learn. Brief creation is contextual. Trade-off: no way to create a brief without starting a plan — acceptable for now.

## Test Strategy

**Test Types Required**

| Type | Framework | Coverage Target |
|------|-----------|-----------------|
| Manual conformance | Agent session testing | All acceptance criteria |
| Reference integrity | grep verification | All index.md references updated |

**Requirement-to-Test Mapping**

| Acceptance Criterion | Test Method | Test Type |
|---------------------|-------------|-----------|
| AC-1: Bootstrap on missing repo-map | Start session in repo without repo-map, verify bootstrap runs | Manual conformance |
| AC-2: Skip bootstrap when initialized | Start session in bootstrapped repo, verify no re-scan | Manual conformance |
| AC-3: Stack detection generates skills | Bootstrap in repo with package.json + tsconfig.json | Manual conformance |
| AC-4: Empty greenfield handling | Bootstrap in empty repo | Manual conformance |
| AC-5: Monorepo detection | Bootstrap in repo with multiple stack markers | Manual conformance |
| AC-6: Brief creation on multi-plan scope | Run /plan with scope exceeding one plan | Manual conformance |
| AC-7: Brief re-validation on subsequent /plan | Run /plan with existing brief | Manual conformance |
| AC-8: Brief staleness detection | Simulate 3+ plans without brief validation | Manual conformance |

**Edge Case Catalog**

- Repo with existing `.agent/` from partial manual setup (repo-map exists, no repo-specific-index) — bootstrap should detect and complete setup
- Repo with no recognizable tech stack (e.g., pure documentation) — skip skill generation, create minimal repo-map
- Repo where auto-generated skill conflicts with existing framework skill name — use stack-prefixed naming (e.g., `python-conventions.md` not `testing.md`)

## Phases

### Phase 1: Index Architecture

Rename `.agent/index.md` to `.agent/control-plane-index.md`, create the repo-specific index template, and update all 17 references across 7 files.

- **Changes**:
  - Rename `.agent/index.md` → `.agent/control-plane-index.md`. Add a new section at the top pointing to `repo-specific-index.md`:
    ```
    ## Repo-Specific Resources
    If this repo has been bootstrapped, see `repo-specific-index.md` for auto-detected
    skills and repo-specific resources. Read that file after this one during session start.
    ```
  - Add `repo-specific-index.md` to the Files table in the index.
  - Add `.agent/briefs/` to the Directories table (prep for Phase 3).
  - Create `.agent/templates/repo-specific-index.md` — template with sections: Skills (auto-generated), Files (repo-map pointer), and a header noting this file is auto-generated by the bootstrap process.
  - Update all 17 references to `.agent/index.md` across: `AGENTS.md` (3), `CLAUDE.md` (1), `.cursor/rules/controlplane.mdc` (1), `.github/copilot-instructions.md` (1), `README.md` (5), `.agent/skills/context-engineering.md` (1), `.agent/repo-map.md` (4).
- **Verification**: Grep the entire repo for any remaining references to `index.md` that don't include `control-plane-index.md` or `repo-specific-index.md`. Zero results = pass.

**File Manifest**

| File | Action | Description |
|------|--------|-------------|
| `.agent/index.md` | Delete | Replaced by control-plane-index.md |
| `.agent/control-plane-index.md` | Create | Renamed from index.md with repo-specific pointer and briefs directory added |
| `.agent/templates/repo-specific-index.md` | Create | Template for auto-generated repo-specific index |
| `AGENTS.md` | Modify | Update 3 references from index.md to control-plane-index.md |
| `CLAUDE.md` | Modify | Update 1 reference |
| `.cursor/rules/controlplane.mdc` | Modify | Update 1 reference |
| `.github/copilot-instructions.md` | Modify | Update 1 reference |
| `README.md` | Modify | Update 5 references |
| `.agent/skills/context-engineering.md` | Modify | Update 1 reference |
| `.agent/repo-map.md` | Modify | Update 4 references |

### Phase 2: Auto-Bootstrap System

Create a bootstrap skill with repo scanning, stack detection, and skill generation logic. Add the bootstrap trigger to the session start flow in AGENTS.md.

- **Changes**:
  - Create `.agent/skills/bootstrap.md` with:
    - **Purpose**: Applies automatically on session start when `.agent/repo-map.md` does not exist. Scans the repo, detects tech stacks, generates stack-specific skills, creates `repo-specific-index.md`, and generates the repo-map.
    - **Rules**:
      1. Bootstrap triggers when repo-map is absent on session start.
      2. Delegate codebase scanning to subagents — keep main context clean.
      3. Use the Detection Signal Table to map file markers to stack-specific skills.
      4. Generate skills following the skill meta-template (`.agent/templates/skill.md`).
      5. Register generated skills in `.agent/repo-specific-index.md`.
      6. Generate repo-map using `/map` command logic after scanning.
      7. Auto-generated skill names use stack-prefixed format (e.g., `python-conventions.md`, `typescript-conventions.md`) to avoid conflicts with framework skills.
      8. If no tech stack is detected (empty or docs-only repo), create repo-specific-index.md with no skills and a minimal repo-map.
      9. If repo-map exists but repo-specific-index.md doesn't (partial setup), complete the missing pieces without re-scanning.
      10. For monorepos, detect stacks in subdirectories and note the directory scope in each generated skill's Purpose section.
    - **Detection Signal Table**:

      | Signal File/Pattern | Detected Stack | Generated Skill |
      |---------------------|---------------|-----------------|
      | `package.json` | JavaScript/Node.js | `js-conventions.md` |
      | `tsconfig.json` | TypeScript | `typescript-conventions.md` |
      | `pyproject.toml` / `setup.py` / `requirements.txt` | Python | `python-conventions.md` |
      | `go.mod` | Go | `go-conventions.md` |
      | `Cargo.toml` | Rust | `rust-conventions.md` |
      | `Gemfile` | Ruby | `ruby-conventions.md` |
      | `pom.xml` / `build.gradle` | Java/Kotlin | `jvm-conventions.md` |
      | `Dockerfile` / `docker-compose.yml` | Containerization | `docker-conventions.md` |
      | `.github/workflows/` | GitHub Actions | `ci-conventions.md` |
      | `*.tf` / `terraform/` | Infrastructure as Code | `iac-conventions.md` |

    - **Examples**: Good (bootstrap detects Python + Docker, generates two skills, registers both), Bad (bootstrap generates a "testing" skill that shadows the framework's testing skill).
    - **Exceptions**: User can skip bootstrap by creating an empty repo-map manually.
  - Modify `AGENTS.md` session start flow — after reading the framework index and before proceeding with the user's request, add:
    - Check if `.agent/repo-map.md` exists.
    - If missing: apply the Bootstrap skill — scan, generate, register, create repo-map.
    - If present: read `.agent/repo-specific-index.md` (if it exists) for repo-specific resources.
  - Register the bootstrap skill in `.agent/control-plane-index.md`.
- **Verification**: Read `AGENTS.md` and trace the session start flow end-to-end — confirm bootstrap trigger is present and correctly positioned. Read the bootstrap skill and confirm the detection signal table covers at least 10 common stacks. Confirm the skill follows the meta-template structure.

**File Manifest**

| File | Action | Description |
|------|--------|-------------|
| `.agent/skills/bootstrap.md` | Create | Bootstrap skill with scanning logic, detection signals, skill generation rules |
| `AGENTS.md` | Modify | Add bootstrap trigger to session start flow |
| `.agent/control-plane-index.md` | Modify | Register bootstrap skill |

### Phase 3: Project Briefs

Create a brief template and integrate brief creation/referencing into the `/plan` command for multi-plan requirement persistence.

- **Changes**:
  - Create `.agent/templates/brief.md` with:
    - YAML frontmatter: `title`, `status` (active / completed / archived), `created`, `last_validated`, `tags`.
    - **Vision**: 1–2 sentence description of the overall project goal.
    - **Requirements**: Numbered list, each with status: `outstanding` / `planned` / `completed`. When a requirement is addressed by a plan, it's marked `planned` with a reference to the plan file. When the plan completes execution, it's marked `completed`.
    - **Global Patterns**: Conventions, architectural decisions, or preferences that apply across all plans derived from this brief (e.g., "use Tailwind for styling", "all APIs are REST").
    - **Plans**: Table linking to plans derived from this brief with their status.
    - **Staleness Rules**: Brief includes `last_validated` date. Updated each time `/plan` references the brief. If 3+ plans complete without the brief being validated, the agent flags it.
  - Modify `.agent/commands/plan.md`:
    - After step 1 (Understand the request), add a new step: **Brief check.** Check if `.agent/briefs/` contains any active briefs. If so, load the most recent one and present outstanding requirements — ask *"Are these still valid?"* Update `last_validated` if user confirms.
    - During the questioning phase, if the agent determines the scope exceeds a single plan: suggest creating a brief. Capture all stated requirements (including ones deferred to future plans) into the brief. Create the brief file in `.agent/briefs/YYYY-MM-DD-<slug>.md`. The current plan references the brief and addresses a subset.
    - When persisting the plan (step 9), if a brief exists, update the brief's Requirements list to mark newly-planned items as `planned` and add the plan to the brief's Plans table.
  - Register brief template in `.agent/control-plane-index.md` under Templates.
  - Add `.agent/briefs/` to Directories in `.agent/control-plane-index.md` (already prepped in Phase 1).
- **Verification**: Read the brief template and confirm it has frontmatter with `last_validated`, requirements with status tracking, and staleness rules. Read `plan.md` and confirm the brief check step is positioned correctly and the multi-plan detection logic is present. Confirm the brief template is registered in the framework index.

**File Manifest**

| File | Action | Description |
|------|--------|-------------|
| `.agent/templates/brief.md` | Create | Brief template with requirements tracking, staleness rules |
| `.agent/commands/plan.md` | Modify | Add brief check step, multi-plan detection, brief creation/update logic |
| `.agent/control-plane-index.md` | Modify | Register brief template |

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Auto-generated skills are low quality or generic | Medium | Skills follow the meta-template; user can review and edit; stack-prefixed names prevent framework conflicts |
| Bootstrap adds noticeable latency to first session | Low | Scanning is delegated to subagents; subsequent sessions skip bootstrap entirely |
| Detection signal table misses a tech stack | Medium | Table is extensible; user can manually create skills and register them in repo-specific-index.md |
| Briefs go stale despite staleness checks | Low | Staleness is flagged, not auto-resolved; user retains control over brief lifecycle |
| Monorepo detection generates conflicting or redundant skills | Medium | Skills note their directory scope in Purpose section; stack-prefixed naming avoids conflicts |
| Renaming index.md breaks existing setups | Low | Framework hasn't been widely distributed; Phase 1 verification greps for missed references |

## Future Work

- **Anticipated next steps**: Installable package with CLI scaffolding (`npx controlplane-ai init`), skill quality scoring, brief CLI management.
- **Extension points**: Detection signal table is designed to grow. Repo-specific-index.md can hold custom commands and templates, not just skills. Briefs could support sub-briefs for large program management.
- **Known limitations**: Auto-generated skills are convention-level only — they don't encode deep framework knowledge (e.g., Next.js App Router patterns). Detection is file-marker-based, not code-analysis-based.
- **Deferred requirements**: Skill quality validation, brief merging/splitting, concurrent bootstrap safety, custom skill authoring workflow.

## File Manifest

| File | Action | Phase | Description |
|------|--------|-------|-------------|
| `.agent/index.md` | Delete | Phase 1 | Replaced by control-plane-index.md |
| `.agent/control-plane-index.md` | Create | Phase 1 | Renamed from index.md with repo-specific pointer, bootstrap skill, brief template, briefs directory |
| `.agent/templates/repo-specific-index.md` | Create | Phase 1 | Template for auto-generated repo-specific index |
| `AGENTS.md` | Modify | Phase 1, 2 | Update index references (P1), add bootstrap trigger (P2) |
| `CLAUDE.md` | Modify | Phase 1 | Update 1 index reference |
| `.cursor/rules/controlplane.mdc` | Modify | Phase 1 | Update 1 index reference |
| `.github/copilot-instructions.md` | Modify | Phase 1 | Update 1 index reference |
| `README.md` | Modify | Phase 1 | Update 5 index references |
| `.agent/skills/context-engineering.md` | Modify | Phase 1 | Update 1 index reference |
| `.agent/repo-map.md` | Modify | Phase 1 | Update 4 index references |
| `.agent/skills/bootstrap.md` | Create | Phase 2 | Bootstrap skill with scanning, detection signals, skill generation |
| `.agent/templates/brief.md` | Create | Phase 3 | Brief template with requirements tracking and staleness rules |
| `.agent/commands/plan.md` | Modify | Phase 3 | Add brief check, multi-plan detection, brief creation/update |
