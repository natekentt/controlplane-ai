import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { mkdtemp, readFile, writeFile, mkdir, access, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { initCommand } from "../../src/commands/init.js";
import { uninstallCommand } from "../../src/commands/uninstall.js";
import { FRAMEWORK_FILES, MANIFEST_FILENAME } from "../../src/constants.js";

let tmpDir: string;
let frameworkDir: string;
let targetDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), "cp-uninstall-test-"));
  frameworkDir = path.join(tmpDir, "framework");
  targetDir = path.join(tmpDir, "target");
  await mkdir(targetDir, { recursive: true });

  // Create mock framework files
  for (const file of FRAMEWORK_FILES) {
    const filePath = path.join(frameworkDir, file.path);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, `# Mock content for ${file.path}\n`, "utf8");
  }

  // Init the target
  await initCommand(targetDir, { frameworkDir });
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe("uninstallCommand", () => {
  it("removes all framework files", async () => {
    await uninstallCommand(targetDir, { confirm: async () => true });

    for (const file of FRAMEWORK_FILES) {
      const filePath = path.join(targetDir, file.path);
      await expect(access(filePath)).rejects.toThrow();
    }
  });

  it("removes the manifest", async () => {
    await uninstallCommand(targetDir, { confirm: async () => true });

    const manifestPath = path.join(targetDir, ".agent", MANIFEST_FILENAME);
    await expect(access(manifestPath)).rejects.toThrow();
  });

  it("cleans gitignore section", async () => {
    // Add user content to .gitignore first
    const gitignorePath = path.join(targetDir, ".gitignore");
    const existing = await readFile(gitignorePath, "utf8");
    await writeFile(gitignorePath, "node_modules/\n" + existing, "utf8");

    await uninstallCommand(targetDir, { confirm: async () => true });

    const content = await readFile(gitignorePath, "utf8");
    expect(content).toContain("node_modules/");
    expect(content).not.toContain("ControlPlane AI");
  });

  it("does nothing when user declines", async () => {
    await uninstallCommand(targetDir, { confirm: async () => false });

    // Files should still exist
    const manifestPath = path.join(targetDir, ".agent", MANIFEST_FILENAME);
    await expect(access(manifestPath)).resolves.toBeUndefined();
  });

  it("errors when no installation found", async () => {
    const emptyDir = path.join(tmpDir, "empty");
    await mkdir(emptyDir, { recursive: true });

    process.exitCode = undefined;
    await uninstallCommand(emptyDir, { confirm: async () => true });
    expect(process.exitCode).toBe(1);
    process.exitCode = undefined;
  });
});
