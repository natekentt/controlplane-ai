# Skill: Bootstrap

## Purpose

Applies automatically on session start when `.agent/repo-map.md` does not exist. Scans the repo, detects tech stacks, generates stack-specific skills, creates `repo-specific-index.md`, and generates the repo-map. Ensures every repo using ControlPlane AI gets instant, stack-aware agent behavior on first session.

## Rules

1. **Bootstrap triggers when repo-map is absent on session start.** After reading `AGENTS.md` and `.agent/control-plane-index.md`, check for `.agent/repo-map.md`. If missing, run bootstrap before proceeding with the user's request.
2. **Delegate codebase scanning to subagents.** The bootstrap scan can produce large volumes of output. Delegate file discovery, dependency analysis, and directory traversal to subagents. Keep the main context focused on generating artifacts.
3. **Use the Detection Signal Table to map file markers to stack-specific skills.** Scan for the signal files/patterns listed below. Each match triggers generation of the corresponding skill.
4. **Generate skills following the skill meta-template.** Every auto-generated skill must follow the structure in `.agent/templates/skill.md`: Purpose, Rules, Examples, Exceptions (optional), References (optional).
5. **Register generated skills in `.agent/repo-specific-index.md`.** Create the file following `.agent/templates/repo-specific-index.md`. List each generated skill with its name, description, path, and scope.
6. **Generate repo-map using `/map` command logic after scanning.** Once scanning and skill generation are complete, generate the repo-map following `.agent/templates/repo-map.md`.
7. **Auto-generated skill names use stack-prefixed format.** Use names like `js-conventions.md`, `python-conventions.md`, `typescript-conventions.md` — never names that shadow framework skills (e.g., never `testing.md`, `security.md`).
8. **If no tech stack is detected, create minimal artifacts.** For empty or docs-only repos, create `repo-specific-index.md` with no skills and a minimal repo-map noting the empty state. Do not error.
9. **If repo-map exists but repo-specific-index.md doesn't, complete the missing pieces.** This handles partial setup — generate the index without re-scanning if the repo-map already provides orientation.
10. **For monorepos, detect stacks in subdirectories.** Note the directory scope in each generated skill's Purpose section (e.g., "Applies to code under `/backend`."). Generate separate skills for each detected stack, even if the same language appears in multiple locations.

## Detection Signal Table

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

## Scanning Procedure

When bootstrap triggers, the agent follows these steps:

1. **Delegate discovery.** Send a subagent to scan the repo for signal files from the Detection Signal Table. The subagent returns a summary: which signals were found, at what paths, and any monorepo structure detected.
2. **Analyze scan results.** Determine which stacks are present and their directory scope (root-level vs. subdirectory).
3. **Generate skills.** For each detected stack, generate a skill file in `.agent/skills/` following the skill meta-template. Populate rules by analyzing:
   - The project's dependency manifest (package.json, pyproject.toml, etc.) for framework/library conventions.
   - Existing code patterns (delegate pattern discovery to a subagent for each stack).
   - Config files (linter configs, formatter configs, tsconfig options) for style conventions.
4. **Create repo-specific-index.md.** Register all generated skills following the template.
5. **Generate repo-map.** Run the `/map` command logic to produce `.agent/repo-map.md`.
6. **Report.** Briefly inform the user what was detected and generated, then proceed with their original request.

## Examples

### Good

```
Agent starts a session in a repo with package.json and tsconfig.json but no repo-map.
→ Detects missing repo-map — triggers bootstrap.
→ Delegates scan to subagent: "Scan for signal files from the Detection Signal Table."
→ Subagent returns: "Found package.json (root), tsconfig.json (root), Dockerfile (root), .github/workflows/ (root)."
→ Generates js-conventions.md, typescript-conventions.md, docker-conventions.md, ci-conventions.md.
→ Creates repo-specific-index.md registering all four skills.
→ Generates repo-map.md.
→ Reports: "Bootstrap complete — detected JavaScript, TypeScript, Docker, GitHub Actions. Generated 4 stack-specific skills."
→ Proceeds with the user's request.
```

```
Agent starts a session in a monorepo with Python in /backend and TypeScript in /frontend.
→ Detects missing repo-map — triggers bootstrap.
→ Subagent reports: "package.json at /frontend, tsconfig.json at /frontend, pyproject.toml at /backend."
→ Generates typescript-conventions.md (scope: /frontend), python-conventions.md (scope: /backend).
→ Each skill's Purpose notes its directory scope.
→ Creates repo-specific-index.md with scope column populated.
```

### Bad

```
Agent generates a skill named "testing.md" for a Python project.
— Violates Rule 7: shadows the framework's testing.md skill.
— Should be named "python-conventions.md" instead.
```

```
Agent scans 200 files in the main context to detect the tech stack.
— Violates Rule 2: delegate codebase scanning to subagents.
```

```
Agent sees repo-map exists but no repo-specific-index.md. Re-scans the entire repo.
— Violates Rule 9: complete the missing pieces without re-scanning.
```

## Exceptions

- **Exception to Rule 1**: If the user explicitly creates an empty `repo-map.md` to skip bootstrap, respect it. The presence of the file is the signal.
- **Exception to Rule 2**: For very small repos (fewer than 10 files), direct scanning in the main context is acceptable — the overhead of subagent delegation exceeds the benefit.
- **Exception to Rule 10**: If a monorepo has the same stack at root and in subdirectories, generate one skill at root scope rather than duplicating.

## References

- [Context Engineering](./context-engineering.md) — subagent delegation patterns
- [Skill Meta-Template](../templates/skill.md) — structure for generated skills
- [Repo-Specific Index Template](../templates/repo-specific-index.md) — structure for the generated index
- [Repo Map Template](../templates/repo-map.md) — structure for the generated repo-map
- [Map Command](../commands/map.md) — repo-map generation logic
