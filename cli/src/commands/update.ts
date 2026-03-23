// ControlPlane AI — Update command

import { readFile } from "node:fs/promises";
import path from "node:path";
import { FRAMEWORK_FILES, BANNER, VERSION } from "../constants.js";
import { copyFrameworkFile, getFrameworkDir } from "../lib/files.js";
import { computeHash, readManifest, writeManifest, type ManifestEntry } from "../lib/hash.js";
import { ensureGitignore } from "../lib/gitignore.js";

export interface UpdateOptions {
  frameworkDir?: string;
}

export async function updateCommand(targetDir: string, options?: UpdateOptions): Promise<void> {
  const resolvedTarget = path.resolve(targetDir);
  const frameworkDir = options?.frameworkDir ?? getFrameworkDir();

  console.log(`${BANNER}\n`);

  // Verify manifest exists (init must have been run)
  try {
    await readManifest(resolvedTarget);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.error("Error: No manifest found. Run `controlplane-ai init` first.");
      process.exitCode = 1;
      return;
    }
    console.error(`Error: ${(err as Error).message}`);
    process.exitCode = 1;
    return;
  }

  console.log("\nUpdating framework files...\n");
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

  // Regenerate manifest
  await writeManifest(resolvedTarget, manifestFiles, VERSION);
  console.log("  ✓ .agent/.controlplane-manifest.json");

  // Ensure .gitignore
  await ensureGitignore(resolvedTarget);
  console.log("  ✓ .gitignore");

  console.log("\nFramework files updated successfully.");
}
