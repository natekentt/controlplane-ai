import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { mkdtemp, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { FRAMEWORK_FILES, MARKDOWN_HEADER } from "../../src/constants.js";
import { computeHash, writeManifest, type ManifestEntry } from "../../src/lib/hash.js";
import { validateCommand } from "../../src/commands/validate.js";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), "cp-validate-test-"));
  process.exitCode = undefined;
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
  process.exitCode = undefined;
});

async function setupAllFrameworkFiles(): Promise<void> {
  const manifestFiles: Record<string, ManifestEntry> = {};

  for (const file of FRAMEWORK_FILES) {
    const content = `# Content for ${file.path}\n`;
    const fullPath = path.join(tmpDir, file.path);
    await mkdir(path.dirname(fullPath), { recursive: true });

    const headerContent =
      file.headerType === "markdown" ? MARKDOWN_HEADER + content : content;
    await writeFile(fullPath, headerContent, "utf8");

    manifestFiles[file.path] = {
      hash: computeHash(content),
      headerType: file.headerType,
    };
  }

  await writeManifest(tmpDir, manifestFiles, "1.0.0");
}

describe("validateCommand", () => {
  it("reports no changes when files are untouched", async () => {
    await setupAllFrameworkFiles();

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    await validateCommand(tmpDir);

    const output = consoleSpy.mock.calls.flat().join("\n");
    expect(output).toContain("intact");
    expect(process.exitCode).toBeUndefined();

    consoleSpy.mockRestore();
  });

  it("detects and reports modified files", async () => {
    await setupAllFrameworkFiles();

    // Modify one file
    const filePath = path.join(tmpDir, "AGENTS.md");
    await writeFile(filePath, MARKDOWN_HEADER + "# Modified!\n", "utf8");

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    await validateCommand(tmpDir);

    const output = consoleSpy.mock.calls.flat().join("\n");
    expect(output).toContain("AGENTS.md");
    expect(output).toContain("Modified");
    expect(process.exitCode).toBe(1);

    consoleSpy.mockRestore();
  });

  it("reports missing files", async () => {
    // Create manifest with all files but only write some to disk
    const manifestFiles: Record<string, ManifestEntry> = {};
    for (const file of FRAMEWORK_FILES) {
      manifestFiles[file.path] = {
        hash: computeHash(`# Content for ${file.path}\n`),
        headerType: file.headerType,
      };
    }
    await writeManifest(tmpDir, manifestFiles, "1.0.0");

    // Only create the first file on disk
    const firstFile = FRAMEWORK_FILES[0];
    const firstPath = path.join(tmpDir, firstFile.path);
    await mkdir(path.dirname(firstPath), { recursive: true });
    await writeFile(firstPath, MARKDOWN_HEADER + `# Content for ${firstFile.path}\n`, "utf8");

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    await validateCommand(tmpDir);

    const output = consoleSpy.mock.calls.flat().join("\n");
    expect(output).toContain("Missing");

    consoleSpy.mockRestore();
  });

  it("errors when no manifest exists", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    await validateCommand(tmpDir);

    const output = consoleSpy.mock.calls.flat().join("\n");
    expect(output).toContain("Run `controlplane-ai init` first");
    expect(process.exitCode).toBe(1);

    consoleSpy.mockRestore();
  });
});
