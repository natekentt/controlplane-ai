---
title: "CLI Package for ControlPlane AI Framework Distribution"
status: completed
tier: Large
created: 2026-03-22
updated: 2026-03-22
tags: [cli, packaging, npm, typescript]
confidence_score:
  requirements_completeness: High
  design_clarity: High
  edge_case_coverage: High
  test_strategy: High
  operational_readiness: Medium
  risk_identification: Medium
  future_impact: Medium
  overall: Medium
confidence_overrides: []
---

# CLI Package for ControlPlane AI Framework Distribution

## Scope

Create a Node.js/TypeScript CLI package (`controlplane-ai`) in `cli/` that distributes the ControlPlane AI framework into any project via `npx controlplane-ai init`. Includes file integrity hashing, "DO NOT EDIT - HUMAN OR AGENT" header injection, .gitignore management, and three commands: `init`, `validate`, `update`. **Large tier** — new package with 20+ new files across multiple subsystems.

## Affected Areas

- `cli/` — New directory containing the entire CLI package
- `cli/src/` — TypeScript source (commands, lib, constants)
- `cli/tests/` — Jest unit tests
- `cli/framework/` — Bundled framework files (copied from repo root at build time)
- `cli/package.json` — npm package configuration
- Root `.gitignore` — Add `cli/framework/` (generated at build time, not committed)

## Acceptance Criteria

```
AC-1: First-time setup
Given a project directory with no ControlPlane AI files
When the user runs `npx controlplane-ai init`
Then all framework files are copied with "DO NOT EDIT - HUMAN OR AGENT" headers injected,
  .gitignore is created/appended with framework entries,
  empty .agent/plans/ and .agent/briefs/ dirs are created with .gitkeep files,
  and a hash manifest is written to .agent/.controlplane-manifest.json

AC-2: Existing files warning on init
Given a project directory that already contains some framework files
When the user runs `npx controlplane-ai init`
Then the CLI lists existing files that will be overwritten
  and prompts for confirmation before proceeding

AC-3: Hash validation
Given a project with ControlPlane AI initialized
When the user runs `npx controlplane-ai validate`
Then the CLI computes SHA-256 hashes of all framework files (stripped of header),
  compares against the manifest,
  and reports any files that have been modified

AC-4: Framework update
Given a project with ControlPlane AI initialized
When the user runs `npx controlplane-ai update`
Then framework files are overwritten with latest versions + headers,
  the hash manifest is regenerated,
  and no confirmation prompt is shown (header warns about overwrites)

AC-5: Header injection by file type
Given framework files of different types (.md, .mdc, .sh)
When files are copied to the target
Then .md files get a markdown blockquote header prepended,
  .mdc files get the blockquote after YAML frontmatter,
  .sh files get a bash comment after the shebang line,
  and LICENSE gets no header (legal document)

AC-6: .gitignore management
Given a target project
When init runs
Then if .gitignore doesn't exist, create it with framework entries in a marked section,
  if .gitignore exists, append framework entries in a marked section,
  and the section is bounded by "# ControlPlane AI — DO NOT EDIT" / "# End ControlPlane AI" markers

AC-7: Hash manifest tracks all framework files
Given a completed init or update
When the manifest is written
Then it contains SHA-256 hashes of source content (without headers) for every framework file,
  plus a manifest version field for future compatibility
```

**Non-functional requirements:**
- CLI executes init in < 2 seconds for a typical project
- Zero runtime dependencies beyond Node.js 18+ (use built-in `crypto`, `fs`, `path`)

**Out of scope:**
- Homebrew tap or binary distribution (future work)
- Automatic version checking / self-update
- Interactive TUI or config wizard
- Publishing to npm (separate step after implementation)

## Assumptions

- Node.js 18+ is the minimum supported runtime — *validated* (user confirmed TypeScript/Node choice)
- Framework files are bundled into the npm package via a `prepack` script that copies from repo root — *validated* (standard npm pattern)
- The hash manifest (`.agent/.controlplane-manifest.json`) should be gitignored - we dont want users commiting this
since every user has their own copy
- `LICENSE` should not receive a "DO NOT EDIT" header since it's a legal document — *unvalidated* (reasonable default, minor impact)
- `.gitkeep` files in `plans/` and `briefs/` are not framework files — they are structural scaffolding created by init — *validated*
- The `scripts/validate.sh` file is included as a framework file — *validated* should be git ignored

## Approach

**TypeScript CLI with Commander.js**, published to npm as `controlplane-ai`. Zero runtime dependencies — uses only Node.js built-in modules (`crypto`, `fs`, `path`, `readline`). Commander.js is the sole runtime dependency.

The CLI bundles framework files from the repo root at build time (via `prepack` script → `cli/framework/`). At runtime, commands read from the bundled `framework/` directory.

**Header injection** is done at copy time, not in source files. Headers are format-aware:
- `.md` files: `> **DO NOT EDIT** — Managed by ControlPlane AI. Changes will be overwritten on update.` + blank line
- `.mdc` files: same blockquote, inserted after YAML frontmatter `---` block
- `.sh` files: `# DO NOT EDIT — Managed by ControlPlane AI. Changes will be overwritten on update.` after shebang
- `LICENSE`: no header

**Hash integrity** uses SHA-256 on source content (without header). The manifest (`.agent/.controlplane-manifest.json`) stores file paths → hashes. `validate` strips headers before hashing to compare. This means: source hash = hash of file without header, so we can detect user modifications.

**Manifest schema:**
```json
{
  "version": 1,
  "generatedAt": "2026-03-22T...",
  "cliVersion": "1.0.0",
  "files": {
    "AGENTS.md": { "hash": "sha256:abc123...", "headerType": "markdown" },
    ".agent/skills/testing.md": { "hash": "sha256:def456...", "headerType": "markdown" }
  }
}
```

**.gitignore management** uses section markers:
```
# ControlPlane AI — DO NOT EDIT this section
.claude/settings.local.json
.DS_Store
.idea/
.vscode/
*.swp
*.swo
*~
# End ControlPlane AI
```
If `.gitignore` exists: append section (if markers not already present). If not: create with section.

### Alternatives Considered

| Alternative | Reason Rejected |
|-------------|-----------------|
| Python (pip) | Less reproducible builds, slower install, no advantage for file operations |
| Rust (cargo) | Requires compilation on user machines, overkill for file copy operations |
| Go (binary) | No ecosystem advantage, Go not universally installed in target audience |
| Shell script | Hard to unit test, limited cross-platform support, no package manager |
| Store hashes in file headers | Complicates header parsing, JSON manifest is cleaner and extensible |
| Store framework files in cli/ as source of truth | Creates confusing duplication with repo root files |

### Decision Records

**DR-1: Zero runtime dependencies (beyond Commander.js)**

- **Context**: CLI tools with many dependencies are slower to install and harder to audit.
- **Decision**: Use only Node.js built-in modules (`crypto`, `fs`, `path`, `readline`) plus Commander.js for CLI parsing.
- **Consequences**: Slightly more code for file operations, but faster install and smaller package.

**DR-2: Hash source content without headers**

- **Context**: Need to detect user modifications to framework files while allowing header format to change between versions.
- **Decision**: Hash the original source content (no header). At validation time, strip the header from the target file before hashing.
- **Consequences**: Header format can evolve without invalidating hashes. Requires reliable header stripping logic.

**DR-3: Bundle framework files at build time**

- **Context**: Framework source files live at repo root. The npm package needs to include them.
- **Decision**: `prepack` script copies framework files from `../` into `cli/framework/`. The `framework/` dir is gitignored but included in the npm package via `files` field.
- **Consequences**: Single source of truth (repo root). Build step required before publish. `cli/framework/` must be gitignored.

## Environment & Setup

**Dependencies**

| Dependency | Version | Purpose |
|------------|---------|---------|
| typescript | ^5.x | TypeScript compiler |
| commander | ^12.x | CLI argument parsing |
| @types/node | ^20.x | Node.js type definitions |
| jest | ^29.x | Test framework |
| ts-jest | ^29.x | Jest TypeScript transformer |

**Config Files**

- `cli/package.json` — npm package config with `bin`, `files`, `scripts`
- `cli/tsconfig.json` — TypeScript config targeting ES2022, Node module resolution
- `cli/jest.config.ts` — Jest config with ts-jest

**Setup Commands**

```bash
cd cli && npm install
```

**Directory Structure**

```
cli/
├── src/
│   ├── index.ts              # CLI entry point (Commander.js setup)
│   ├── commands/
│   │   ├── init.ts           # Init command implementation
│   │   ├── validate.ts       # Validate command implementation
│   │   └── update.ts         # Update command implementation
│   ├── lib/
│   │   ├── files.ts          # File copy with header injection
│   │   ├── hash.ts           # SHA-256 hashing and manifest I/O
│   │   └── gitignore.ts      # .gitignore creation/appending
│   └── constants.ts          # Framework file list, header templates, gitignore entries
├── tests/
│   ├── lib/
│   │   ├── files.test.ts     # File operations tests
│   │   ├── hash.test.ts      # Hashing tests
│   │   └── gitignore.test.ts # Gitignore tests
│   ├── commands/
│   │   ├── init.test.ts      # Init command tests
│   │   ├── validate.test.ts  # Validate command tests
│   │   └── update.test.ts    # Update command tests
│   └── fixtures/             # Test framework files
├── framework/                # Built at prepack time (gitignored)
├── scripts/
│   └── bundle-framework.sh   # Copies framework files from repo root
├── package.json
├── tsconfig.json
├── jest.config.ts
└── .gitignore
```

## Test Strategy

**Test Types Required**

| Type | Framework | Coverage Target |
|------|-----------|-----------------|
| Unit | Jest + ts-jest | >90% on new code |

**Requirement-to-Test Mapping**

| Acceptance Criterion | Test Name | Test Type |
|---------------------|-----------|-----------|
| AC-1: First-time setup | `init.test.ts: copies all framework files to empty directory` | Unit |
| AC-1: Header injection | `files.test.ts: injects markdown header into .md files` | Unit |
| AC-1: Manifest creation | `hash.test.ts: writes manifest with correct hashes` | Unit |
| AC-2: Existing files warning | `init.test.ts: warns when framework files already exist` | Unit |
| AC-3: Hash validation (clean) | `validate.test.ts: reports no changes when files untouched` | Unit |
| AC-3: Hash validation (drift) | `validate.test.ts: detects and reports modified files` | Unit |
| AC-4: Update overwrites | `update.test.ts: overwrites files without prompting` | Unit |
| AC-5: Header by file type | `files.test.ts: handles .md, .mdc, .sh, LICENSE correctly` | Unit |
| AC-6: New .gitignore | `gitignore.test.ts: creates .gitignore with section markers` | Unit |
| AC-6: Existing .gitignore | `gitignore.test.ts: appends section to existing .gitignore` | Unit |
| AC-6: Idempotent .gitignore | `gitignore.test.ts: does not duplicate section on re-run` | Unit |
| AC-7: Manifest completeness | `hash.test.ts: manifest includes all framework files` | Unit |

**Edge Case Catalog**

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Target dir has partial .agent/ (some files exist) | Init warns about existing files, lists them, prompts |
| .gitignore has existing ControlPlane section markers | Replace section content, don't duplicate |
| Framework file has been modified (hash mismatch) | Validate warns with file path |
| Target dir is not a git repo | Init proceeds normally (git is not required) |
| .mdc file with no YAML frontmatter | Treat as regular markdown, prepend header |
| File permissions (validate.sh must be executable) | Preserve +x permission on copy |
| Manifest file doesn't exist when running validate | Error: "Run `controlplane-ai init` first" |
| Manifest file doesn't exist when running update | Error: "Run `controlplane-ai init` first" |

**Error Path Tests**

| Scenario | Expected Handling |
|----------|-------------------|
| Target directory doesn't exist | Exit with error message |
| No write permissions on target | Exit with error message |
| User declines overwrite prompt on init | Exit gracefully, no files changed |
| Corrupted manifest JSON | Exit with error, suggest re-running init |

## Phases

### Phase 1: Project Scaffolding

- **Changes**: Initialize the npm package in `cli/`, configure TypeScript, Jest, Commander.js. Create directory structure. Add `cli/framework/` to root `.gitignore`.
- **Verification**: `cd cli && npm install && npx tsc --noEmit` succeeds.

**File Manifest**

| File | Action | Description |
|------|--------|-------------|
| `cli/package.json` | Create | npm package config — name: controlplane-ai, bin, files, scripts |
| `cli/tsconfig.json` | Create | TypeScript config — ES2022, NodeNext modules |
| `cli/jest.config.ts` | Create | Jest config with ts-jest transformer |
| `cli/.gitignore` | Create | Ignore node_modules/, dist/, framework/ |
| `cli/scripts/bundle-framework.sh` | Create | Copies framework files from repo root into cli/framework/ |
| `cli/src/index.ts` | Create | Stub CLI entry point |
| `.gitignore` (root) | Modify | Add `cli/framework/` entry |

### Phase 2: Core Library

- **Changes**: Implement `constants.ts` (framework file manifest, header templates), `lib/hash.ts` (SHA-256 + manifest I/O), `lib/files.ts` (copy with header injection), `lib/gitignore.ts` (.gitignore management). Unit tests for all.
- **Verification**: `cd cli && npm test` passes all lib tests.

**File Manifest**

| File | Action | Description |
|------|--------|-------------|
| `cli/src/constants.ts` | Create | Framework file list, header templates per file type, gitignore entries |
| `cli/src/lib/hash.ts` | Create | `computeHash(content)`, `writeManifest(dir, files)`, `readManifest(dir)`, `stripHeader(content, type)` |
| `cli/src/lib/files.ts` | Create | `copyFrameworkFile(src, dest, headerType)`, `injectHeader(content, type)`, `getFrameworkDir()` |
| `cli/src/lib/gitignore.ts` | Create | `ensureGitignore(targetDir)` — create or append with section markers |
| `cli/tests/lib/hash.test.ts` | Create | Tests for hashing, manifest read/write, header stripping |
| `cli/tests/lib/files.test.ts` | Create | Tests for file copy, header injection per type |
| `cli/tests/lib/gitignore.test.ts` | Create | Tests for create, append, idempotency |
| `cli/tests/fixtures/` | Create | Small test .md, .mdc, .sh files for testing |

### Phase 3: Commands

- **Changes**: Implement `init`, `validate`, `update` commands. Wire into Commander.js entry point. Unit tests for commands.
- **Verification**: `cd cli && npm test` passes all tests. `npx ts-node src/index.ts init --help` shows usage.

**File Manifest**

| File | Action | Description |
|------|--------|-------------|
| `cli/src/commands/init.ts` | Create | Scan for existing files → warn → prompt → copy all → inject headers → write manifest → ensure .gitignore → create .gitkeep dirs |
| `cli/src/commands/validate.ts` | Create | Read manifest → hash each file (strip header) → compare → report drift |
| `cli/src/commands/update.ts` | Create | Check manifest exists → copy all files → inject headers → regenerate manifest |
| `cli/src/index.ts` | Modify | Wire up all three commands with Commander.js |
| `cli/tests/commands/init.test.ts` | Create | Tests for full init flow, existing files warning, skip on decline |
| `cli/tests/commands/validate.test.ts` | Create | Tests for clean validation, drift detection, missing manifest |
| `cli/tests/commands/update.test.ts` | Create | Tests for update flow, manifest regeneration |

### Phase 4: Framework Bundling & Integration

- **Changes**: Implement the `bundle-framework.sh` script. Add `prepack` npm script. Configure `files` field in package.json. Build and verify the full pipeline.
- **Verification**: `cd cli && npm run build && npm pack` creates a tarball. Extract tarball, verify `framework/` contains all expected files without headers (headers are injected at runtime). Run `node dist/index.js init /tmp/test-project` end-to-end.

**File Manifest**

| File | Action | Description |
|------|--------|-------------|
| `cli/scripts/bundle-framework.sh` | Modify | Full implementation — copies framework files, excludes plans/briefs/repo-map/repo-specific-index/thoughts |
| `cli/package.json` | Modify | Add prepack script, files field, bin field |
| `cli/src/index.ts` | Modify | Add version from package.json, finalize CLI help text |

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Header stripping regex fails on edge case file content | Low | Comprehensive test fixtures, anchor patterns to file start |
| Cross-platform path issues (Windows backslashes) | Medium | Use `path.join()` and `path.posix` consistently, test on CI |
| .mdc YAML frontmatter detection fails | Low | Simple `---` boundary detection, test with actual .mdc file |
| File permissions lost on copy (validate.sh not executable) | Medium | Explicitly copy file mode with `fs.copyFile` + `fs.chmod` |
| npm `prepack` runs in wrong directory | Low | Use `__dirname` relative paths in bundle script |

## Future Work

- **Anticipated next steps**: Publish to npm, add CI pipeline for automated testing and publishing
- **Extension points**: New commands can be added to `src/commands/` and registered in `index.ts`; framework file list in `constants.ts` is the single place to update when new framework files are added
- **Known limitations**: No self-update mechanism, no version compatibility checking between CLI and existing installations, Windows not explicitly tested
- **Deferred requirements**: Homebrew tap distribution, `--dry-run` flag for init/update, `diff` output on validate (showing what changed)

## File Manifest

| File | Action | Phase | Description |
|------|--------|-------|-------------|
| `cli/package.json` | Create | 1 | npm package configuration |
| `cli/tsconfig.json` | Create | 1 | TypeScript compiler config |
| `cli/jest.config.ts` | Create | 1 | Jest test config |
| `cli/.gitignore` | Create | 1 | CLI-specific gitignore |
| `cli/scripts/bundle-framework.sh` | Create | 1, 4 | Framework file bundler |
| `cli/src/index.ts` | Create | 1, 3 | CLI entry point |
| `cli/src/constants.ts` | Create | 2 | Framework file list, headers, gitignore entries |
| `cli/src/lib/hash.ts` | Create | 2 | SHA-256 hashing and manifest |
| `cli/src/lib/files.ts` | Create | 2 | File copy with header injection |
| `cli/src/lib/gitignore.ts` | Create | 2 | .gitignore management |
| `cli/tests/lib/hash.test.ts` | Create | 2 | Hash utility tests |
| `cli/tests/lib/files.test.ts` | Create | 2 | File operations tests |
| `cli/tests/lib/gitignore.test.ts` | Create | 2 | Gitignore tests |
| `cli/tests/fixtures/` | Create | 2 | Test fixture files |
| `cli/src/commands/init.ts` | Create | 3 | Init command |
| `cli/src/commands/validate.ts` | Create | 3 | Validate command |
| `cli/src/commands/update.ts` | Create | 3 | Update command |
| `cli/tests/commands/init.test.ts` | Create | 3 | Init command tests |
| `cli/tests/commands/validate.test.ts` | Create | 3 | Validate command tests |
| `cli/tests/commands/update.test.ts` | Create | 3 | Update command tests |
| `.gitignore` (root) | Modify | 1 | Add cli/framework/ |