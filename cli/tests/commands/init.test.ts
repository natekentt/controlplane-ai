import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { mkdtemp, readFile, writeFile, mkdir, access, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { initCommand } from "../../src/commands/init.js";
import { FRAMEWORK_FILES, MANIFEST_FILENAME, MARKDOWN_HEADER, GITKEEP_DIRS } from "../../src/constants.js";

let tmpDir: string;
let frameworkDir: string;
let targetDir: string;

const TEST_FILES = FRAMEWORK_FILES.slice(0, 3);

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), "cp-init-test-"));
  frameworkDir = path.join(tmpDir, "framework");
  targetDir = path.join(tmpDir, "target");
  await mkdir(targetDir, { recursive: true });

  // Create mock framework files
  for (const file of FRAMEWORK_FILES) {
    const filePath = path.join(frameworkDir, file.path);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, `# Mock content for ${file.path}\n\nSample body.\n`, "utf8");
  }
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe("initCommand", () => {
  it("copies all framework files to empty directory", async () => {
    await initCommand(targetDir, { frameworkDir });

    for (const file of TEST_FILES) {
      const destPath = path.join(targetDir, file.path);
      const content = await readFile(destPath, "utf8");
      if (file.headerType === "markdown") {
        expect(content.startsWith(MARKDOWN_HEADER)).toBe(true);
      }
      expect(content).toContain("Mock content");
    }
  });

  it("creates manifest file", async () => {
    await initCommand(targetDir, { frameworkDir });

    const manifestPath = path.join(targetDir, ".agent", MANIFEST_FILENAME);
    const content = await readFile(manifestPath, "utf8");
    const manifest = JSON.parse(content);

    expect(manifest.version).toBe(1);
    expect(Object.keys(manifest.files).length).toBe(FRAMEWORK_FILES.length);
  });

  it("creates .gitkeep files in plans and briefs dirs", async () => {
    await initCommand(targetDir, { frameworkDir });

    for (const dir of GITKEEP_DIRS) {
      const gitkeepPath = path.join(targetDir, dir, ".gitkeep");
      await expect(access(gitkeepPath)).resolves.toBeUndefined();
    }
  });

  it("creates or updates .gitignore", async () => {
    await initCommand(targetDir, { frameworkDir });

    const gitignorePath = path.join(targetDir, ".gitignore");
    const content = await readFile(gitignorePath, "utf8");
    expect(content).toContain("ControlPlane AI");
    expect(content).toContain(".agent/.controlplane-manifest.json");
  });

  it("warns when framework files already exist and proceeds on confirm", async () => {
    // Pre-create a framework file
    const existingPath = path.join(targetDir, FRAMEWORK_FILES[0].path);
    await mkdir(path.dirname(existingPath), { recursive: true });
    await writeFile(existingPath, "existing content", "utf8");

    await initCommand(targetDir, {
      frameworkDir,
      confirm: async () => true,
    });

    // File should be overwritten with framework content
    const content = await readFile(existingPath, "utf8");
    expect(content).toContain("Mock content");
  });

  it("exits gracefully when user declines overwrite", async () => {
    // Pre-create a framework file
    const existingPath = path.join(targetDir, FRAMEWORK_FILES[0].path);
    await mkdir(path.dirname(existingPath), { recursive: true });
    await writeFile(existingPath, "existing content", "utf8");

    await initCommand(targetDir, {
      frameworkDir,
      confirm: async () => false,
    });

    // File should NOT be overwritten
    const content = await readFile(existingPath, "utf8");
    expect(content).toBe("existing content");
  });
});
