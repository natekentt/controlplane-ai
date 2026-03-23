// ControlPlane AI — Validate command

import { readFile } from "node:fs/promises";
import path from "node:path";
import { FRAMEWORK_FILES } from "../constants.js";
import { computeHash, readManifest, stripHeader } from "../lib/hash.js";

export async function validateCommand(targetDir: string): Promise<void> {
  const resolvedTarget = path.resolve(targetDir);

  console.log("ControlPlane AI\n");

  let manifest;
  try {
    manifest = await readManifest(resolvedTarget);
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

  console.log("\nValidating framework files...\n");

  const modified: string[] = [];
  const missing: string[] = [];
  let checked = 0;

  for (const [filePath, entry] of Object.entries(manifest.files)) {
    const fullPath = path.join(resolvedTarget, filePath);

    let content: string;
    try {
      content = await readFile(fullPath, "utf8");
    } catch {
      missing.push(filePath);
      continue;
    }

    const stripped = stripHeader(content, entry.headerType);
    const currentHash = computeHash(stripped);

    if (currentHash !== entry.hash) {
      modified.push(filePath);
    }
    checked++;
  }

  // Check for framework files not in manifest
  const manifestPaths = new Set(Object.keys(manifest.files));
  const untracked = FRAMEWORK_FILES
    .filter((f) => !manifestPaths.has(f.path))
    .map((f) => f.path);

  if (modified.length === 0 && missing.length === 0 && untracked.length === 0) {
    console.log(`All ${checked} framework files are intact.\n`);
    return;
  }

  if (modified.length > 0) {
    console.log("Modified files (local changes detected):\n");
    for (const f of modified) {
      console.log(`  ✗ ${f}`);
    }
    console.log();
  }

  if (missing.length > 0) {
    console.log("Missing files:\n");
    for (const f of missing) {
      console.log(`  ✗ ${f}`);
    }
    console.log();
  }

  if (untracked.length > 0) {
    console.log("Untracked framework files (not in manifest — run update to add):\n");
    for (const f of untracked) {
      console.log(`  ? ${f}`);
    }
    console.log();
  }

  const total = modified.length + missing.length;
  if (total > 0) {
    console.log(`${total} file(s) have drifted from the framework. Run \`controlplane-ai update\` to restore.\n`);
    process.exitCode = 1;
  }
}
