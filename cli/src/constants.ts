// ControlPlane AI — Framework constants and file registry

export type HeaderType = "markdown" | "mdc" | "shell" | "none";

export interface FrameworkFile {
  path: string;
  headerType: HeaderType;
}

export const FRAMEWORK_FILES: FrameworkFile[] = [
  // Root
  { path: "AGENTS.md", headerType: "markdown" },
  { path: "CLAUDE.md", headerType: "markdown" },
  { path: "LICENSE", headerType: "none" },
  { path: "README.md", headerType: "markdown" },

  // .agent/
  { path: ".agent/control-plane-index.md", headerType: "markdown" },

  // .agent/commands/
  { path: ".agent/commands/commit.md", headerType: "markdown" },
  { path: ".agent/commands/execute.md", headerType: "markdown" },
  { path: ".agent/commands/map.md", headerType: "markdown" },
  { path: ".agent/commands/plan.md", headerType: "markdown" },
  { path: ".agent/commands/review.md", headerType: "markdown" },

  // .agent/skills/
  { path: ".agent/skills/bootstrap.md", headerType: "markdown" },
  { path: ".agent/skills/change-management.md", headerType: "markdown" },
  { path: ".agent/skills/code-quality.md", headerType: "markdown" },
  { path: ".agent/skills/code-review.md", headerType: "markdown" },
  { path: ".agent/skills/context-engineering.md", headerType: "markdown" },
  { path: ".agent/skills/documentation.md", headerType: "markdown" },
  { path: ".agent/skills/error-handling.md", headerType: "markdown" },
  { path: ".agent/skills/git.md", headerType: "markdown" },
  { path: ".agent/skills/security.md", headerType: "markdown" },
  { path: ".agent/skills/testing.md", headerType: "markdown" },

  // .agent/templates/
  { path: ".agent/templates/brief.md", headerType: "markdown" },
  { path: ".agent/templates/commit-msg.md", headerType: "markdown" },
  { path: ".agent/templates/plan.md", headerType: "markdown" },
  { path: ".agent/templates/repo-map.md", headerType: "markdown" },
  { path: ".agent/templates/repo-specific-index.md", headerType: "markdown" },
  { path: ".agent/templates/skill.md", headerType: "markdown" },

  // .github/
  { path: ".github/copilot-instructions.md", headerType: "markdown" },

  // .cursor/rules/
  { path: ".cursor/rules/controlplane.mdc", headerType: "mdc" },

  // scripts/
  { path: "scripts/validate.sh", headerType: "shell" },
];

export const MARKDOWN_HEADER =
  "> **DO NOT EDIT** — Managed by ControlPlane AI. Changes will be overwritten on update.\n\n";

export const SHELL_HEADER =
  "# DO NOT EDIT — Managed by ControlPlane AI. Changes will be overwritten on update.\n";

export const MANIFEST_FILENAME = ".controlplane-manifest.json";

export const GITIGNORE_START_MARKER = "# ControlPlane AI — DO NOT EDIT this section";
export const GITIGNORE_END_MARKER = "# End ControlPlane AI";

export const GITIGNORE_ENTRIES = [
  ".agent/.controlplane-manifest.json",
  ".agent/repo-map.md",
  ".agent/repo-specific-index.md",
  ".agent/plans/",
  ".agent/briefs/",
];

export const GITKEEP_DIRS = [".agent/plans", ".agent/briefs"];
