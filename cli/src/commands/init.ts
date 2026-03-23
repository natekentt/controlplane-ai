// ControlPlane AI — Init command

import { readFile, mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";
import { FRAMEWORK_FILES, GITKEEP_DIRS, BANNER, VERSION } from "../constants.js";
import { copyFrameworkFile, getFrameworkDir } from "../lib/files.js";
import { computeHash, writeManifest, type ManifestEntry } from "../lib/hash.js";
import { ensureGitignore } from "../lib/gitignore.js";

export interface InitOptions {
  frameworkDir?: string;
  confirm?: () => Promise<boolean>;
}

export async function initCommand(targetDir: string, options?: InitOptions): Promise<void> {
  const resolvedTarget = path.resolve(targetDir);
  const frameworkDir = options?.frameworkDir ?? getFrameworkDir();
  const confirm = options?.confirm ?? (() => promptConfirm("Proceed with overwriting these files?"));

  console.log(`${BANNER}\n`);

  // Check for existing framework files
  const existingFiles: string[] = [];
  for (const file of FRAMEWORK_FILES) {
    const destPath = path.join(resolvedTarget, file.path);
    try {
      await access(destPath);
      existingFiles.push(file.path);
    } catch {
      // File doesn't exist — good
    }
  }

  if (existingFiles.length > 0) {
    console.log("\nThe following framework files already exist and will be overwritten:\n");
    for (const f of existingFiles) {
      console.log(`  - ${f}`);
    }
    console.log();

    const confirmed = await confirm();
    if (!confirmed) {
      console.log("Init cancelled. No files were changed.");
      return;
    }
  }

  // Copy all framework files with header injection
  console.log("\nCopying framework files...\n");
  const manifestFiles: Record<string, ManifestEntry> = {};

  for (const file of FRAMEWORK_FILES) {
    const srcPath = path.join(frameworkDir, file.path);
    const destPath = path.join(resolvedTarget, file.path);

    const sourceContent = await readFile(srcPath, "utf8");
    const hash = computeHash(sourceContent);

    await copyFrameworkFile(srcPath, destPath, file.headerType);
    manifestFiles[file.path] = { hash, headerType: file.headerType };

    console.log(`  ✓ ${file.path}`);
  }

  // Create .gitkeep dirs
  for (const dir of GITKEEP_DIRS) {
    const dirPath = path.join(resolvedTarget, dir);
    await mkdir(dirPath, { recursive: true });
    const gitkeepPath = path.join(dirPath, ".gitkeep");
    try {
      await access(gitkeepPath);
    } catch {
      await writeFile(gitkeepPath, "", "utf8");
    }
    console.log(`  ✓ ${dir}/.gitkeep`);
  }

  // Write manifest
  await writeManifest(resolvedTarget, manifestFiles, VERSION);
  console.log("  ✓ .agent/.controlplane-manifest.json");

  // Ensure .gitignore
  await ensureGitignore(resolvedTarget);
  console.log("  ✓ .gitignore");

  console.log("\nControlPlane AI initialized successfully.");
  console.log("Start a session with any AI agent (Claude Code, Cursor, Copilot) — the framework handles the rest.\n");
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
