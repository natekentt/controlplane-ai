import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { ensureGitignore } from "../../src/lib/gitignore.js";
import {
  GITIGNORE_START_MARKER,
  GITIGNORE_END_MARKER,
  GITIGNORE_ENTRIES,
} from "../../src/constants.js";

describe("ensureGitignore", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "cp-gitignore-test-"));
  });

  it("creates .gitignore with section markers when none exists", async () => {
    await ensureGitignore(tmpDir);

    const content = await readFile(path.join(tmpDir, ".gitignore"), "utf8");
    expect(content).toContain(GITIGNORE_START_MARKER);
    expect(content).toContain(GITIGNORE_END_MARKER);
    for (const entry of GITIGNORE_ENTRIES) {
      expect(content).toContain(entry);
    }
  });

  it("appends section to existing .gitignore", async () => {
    const existing = "node_modules/\ndist/\n";
    await writeFile(path.join(tmpDir, ".gitignore"), existing, "utf8");

    await ensureGitignore(tmpDir);

    const content = await readFile(path.join(tmpDir, ".gitignore"), "utf8");
    expect(content).toContain("node_modules/");
    expect(content).toContain("dist/");
    expect(content).toContain(GITIGNORE_START_MARKER);
    expect(content).toContain(GITIGNORE_END_MARKER);
  });

  it("does not duplicate section on re-run (idempotent)", async () => {
    await ensureGitignore(tmpDir);
    await ensureGitignore(tmpDir);

    const content = await readFile(path.join(tmpDir, ".gitignore"), "utf8");
    const startCount = content.split(GITIGNORE_START_MARKER).length - 1;
    expect(startCount).toBe(1);
  });

  it("replaces existing section content on re-run", async () => {
    // Write an initial section with different entries
    const initial = [
      GITIGNORE_START_MARKER,
      "old-entry",
      GITIGNORE_END_MARKER,
    ].join("\n");
    await writeFile(path.join(tmpDir, ".gitignore"), initial + "\n", "utf8");

    await ensureGitignore(tmpDir);

    const content = await readFile(path.join(tmpDir, ".gitignore"), "utf8");
    expect(content).not.toContain("old-entry");
    for (const entry of GITIGNORE_ENTRIES) {
      expect(content).toContain(entry);
    }
  });

  it("preserves content outside section markers", async () => {
    const before = "# My project\nnode_modules/\n";
    const section = [GITIGNORE_START_MARKER, "old", GITIGNORE_END_MARKER].join("\n");
    const after = "\n# Other stuff\ndist/\n";
    await writeFile(path.join(tmpDir, ".gitignore"), before + section + after, "utf8");

    await ensureGitignore(tmpDir);

    const content = await readFile(path.join(tmpDir, ".gitignore"), "utf8");
    expect(content).toContain("node_modules/");
    expect(content).toContain("dist/");
    expect(content).toContain("# Other stuff");
  });
});
