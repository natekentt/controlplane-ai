// ControlPlane AI — Uninstall command

import { rm, rmdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";
import { FRAMEWORK_FILES, GITKEEP_DIRS, MANIFEST_FILENAME, GITIGNORE_START_MARKER, GITIGNORE_END_MARKER, BANNER } from "../constants.js";

export interface UninstallOptions {
  confirm?: () => Promise<boolean>;
}

export async function uninstallCommand(targetDir: string, options?: UninstallOptions): Promise<void> {
  const resolvedTarget = path.resolve(targetDir);
  const confirm = options?.confirm ?? (() => promptConfirm("Remove all ControlPlane AI framework files?"));

  console.log(`${BANNER}\n`);

  // Check manifest exists
  const manifestPath = path.join(resolvedTarget, ".agent", MANIFEST_FILENAME);
  try {
    await access(manifestPath);
  } catch {
    console.error("Error: No ControlPlane AI installation found. Nothing to remove.");
    process.exitCode = 1;
    return;
  }

  const confirmed = await confirm();
  if (!confirmed) {
    console.log("Uninstall cancelled. No files were changed.");
    return;
  }

  console.log("\nRemoving framework files...\n");

  let removed = 0;

  // Remove framework files
  for (const file of FRAMEWORK_FILES) {
    const filePath = path.join(resolvedTarget, file.path);
    try {
      await rm(filePath);
      console.log(`  ✗ ${file.path}`);
      removed++;
    } catch {
      // File doesn't exist — skip
    }
  }

  // Remove .gitkeep files and dirs
  for (const dir of GITKEEP_DIRS) {
    const gitkeepPath = path.join(resolvedTarget, dir, ".gitkeep");
    try {
      await rm(gitkeepPath);
    } catch {
      // skip
    }
    // Remove dir if empty
    try {
      await rmdir(path.join(resolvedTarget, dir));
    } catch {
      // Dir not empty or doesn't exist — leave it
    }
  }

  // Remove manifest
  try {
    await rm(manifestPath);
    console.log("  ✗ .agent/.controlplane-manifest.json");
  } catch {
    // skip
  }

  // Clean up empty directories (deepest first)
  const dirsToClean = [
    ".agent/commands",
    ".agent/skills",
    ".agent/templates",
    ".agent",
    ".github",
    ".cursor/rules",
    ".cursor",
    "scripts",
  ];
  for (const dir of dirsToClean) {
    try {
      await rmdir(path.join(resolvedTarget, dir));
    } catch {
      // Not empty or doesn't exist — leave it
    }
  }

  // Clean .gitignore section
  await removeGitignoreSection(resolvedTarget);

  console.log(`\nRemoved ${removed} framework files. ControlPlane AI has been uninstalled.`);
}

async function removeGitignoreSection(targetDir: string): Promise<void> {
  const gitignorePath = path.join(targetDir, ".gitignore");

  let content: string;
  try {
    content = await readFile(gitignorePath, "utf8");
  } catch {
    return;
  }

  const startIdx = content.indexOf(GITIGNORE_START_MARKER);
  const endIdx = content.indexOf(GITIGNORE_END_MARKER);
  if (startIdx === -1 || endIdx === -1) return;

  const before = content.slice(0, startIdx).replace(/\n+$/, "");
  const after = content.slice(endIdx + GITIGNORE_END_MARKER.length).replace(/^\n+/, "");

  const cleaned = before + (before && after ? "\n\n" : "") + after;

  if (cleaned.trim() === "") {
    // .gitignore is now empty — remove it only if we created it
    await rm(gitignorePath);
    console.log("  ✗ .gitignore (empty, removed)");
  } else {
    await writeFile(gitignorePath, cleaned.endsWith("\n") ? cleaned : cleaned + "\n", "utf8");
    console.log("  ✓ .gitignore (cleaned ControlPlane AI section)");
  }
}

async function promptConfirm(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${question} [y/N] `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}
