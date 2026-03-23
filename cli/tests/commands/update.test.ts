import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { mkdtemp, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { FRAMEWORK_FILES, MANIFEST_FILENAME } from "../../src/constants.js";
import { computeHash, writeManifest, type ManifestEntry } from "../../src/lib/hash.js";
import { updateCommand } from "../../src/commands/update.js";

let tmpDir: string;
let frameworkDir: string;
let targetDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), "cp-update-test-"));
  frameworkDir = path.join(tmpDir, "framework");
  targetDir = path.join(tmpDir, "target");
  await mkdir(targetDir, { recursive: true });

  // Create mock framework files with "updated" content
  for (const file of FRAMEWORK_FILES) {
    const filePath = path.join(frameworkDir, file.path);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, `# Updated content for ${file.path}\n\nNew body.\n`, "utf8");
  }

  process.exitCode = undefined;
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
  process.exitCode = undefined;
});

async function createInitialManifest(): Promise<void> {
  const manifestFiles: Record<string, ManifestEntry> = {};
  for (const file of FRAMEWORK_FILES) {
    manifestFiles[file.path] = {
      hash: computeHash(`# Old content for ${file.path}\n`),
      headerType: file.headerType,
    };
    const filePath = path.join(targetDir, file.path);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, `# Old content for ${file.path}\n`, "utf8");
  }
  await writeManifest(targetDir, manifestFiles, "1.0.0");
}

describe("updateCommand", () => {
  it("overwrites files without prompting", async () => {
    await createInitialManifest();

    await updateCommand(targetDir, { frameworkDir });

    const content = await readFile(path.join(targetDir, FRAMEWORK_FILES[0].path), "utf8");
    expect(content).toContain("Updated content");
  });

  it("regenerates manifest after update", async () => {
    await createInitialManifest();

    await updateCommand(targetDir, { frameworkDir });

    const manifestPath = path.join(targetDir, ".agent", MANIFEST_FILENAME);
    const content = await readFile(manifestPath, "utf8");
    const manifest = JSON.parse(content);

    expect(Object.keys(manifest.files).length).toBe(FRAMEWORK_FILES.length);
    const firstFile = FRAMEWORK_FILES[0];
    const newSourceContent = await readFile(path.join(frameworkDir, firstFile.path), "utf8");
    const expectedHash = computeHash(newSourceContent);
    expect(manifest.files[firstFile.path].hash).toBe(expectedHash);
  });

  it("errors when no manifest exists (init not run)", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await updateCommand(targetDir, { frameworkDir });

    const output = consoleSpy.mock.calls.flat().join("\n");
    expect(output).toContain("Run `controlplane-ai init` first");
    expect(process.exitCode).toBe(1);

    consoleSpy.mockRestore();
  });

  it("updates .gitignore", async () => {
    await createInitialManifest();

    await updateCommand(targetDir, { frameworkDir });

    const gitignorePath = path.join(targetDir, ".gitignore");
    const content = await readFile(gitignorePath, "utf8");
    expect(content).toContain("ControlPlane AI");
  });
});
