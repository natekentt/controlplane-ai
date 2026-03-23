import { mkdtemp, readFile, writeFile, chmod, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";
import { injectHeader, copyFrameworkFile } from "../../src/lib/files.js";
import { MARKDOWN_HEADER, SHELL_HEADER } from "../../src/constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("injectHeader", () => {
  it("prepends markdown header to .md content", () => {
    const content = "# Title\n\nBody\n";
    expect(injectHeader(content, "markdown")).toBe(MARKDOWN_HEADER + content);
  });

  it("inserts header after YAML frontmatter for .mdc files", () => {
    const frontmatter = "---\ndescription: test\nglobs: \"*.ts\"\n---\n";
    const body = "# Rule\n\nContent\n";
    const result = injectHeader(frontmatter + body, "mdc");
    expect(result).toBe(frontmatter + MARKDOWN_HEADER + body);
  });

  it("treats .mdc without frontmatter as regular markdown", () => {
    const content = "# Rule\n\nContent\n";
    expect(injectHeader(content, "mdc")).toBe(MARKDOWN_HEADER + content);
  });

  it("inserts shell header after shebang", () => {
    const content = "#!/usr/bin/env bash\nset -euo pipefail\necho hello\n";
    const result = injectHeader(content, "shell");
    expect(result).toBe("#!/usr/bin/env bash\n" + SHELL_HEADER + "set -euo pipefail\necho hello\n");
  });

  it("prepends shell header when no shebang", () => {
    const content = "echo hello\n";
    expect(injectHeader(content, "shell")).toBe(SHELL_HEADER + content);
  });

  it("does not modify content for none type (LICENSE)", () => {
    const content = "MIT License\n\nCopyright...\n";
    expect(injectHeader(content, "none")).toBe(content);
  });
});

describe("copyFrameworkFile", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "cp-files-test-"));
  });

  it("copies a .md file with header injected", async () => {
    const srcPath = path.resolve(__dirname, "../fixtures/sample.md");
    const destPath = path.join(tmpDir, "sample.md");

    await copyFrameworkFile(srcPath, destPath, "markdown");

    const result = await readFile(destPath, "utf8");
    expect(result.startsWith(MARKDOWN_HEADER)).toBe(true);
    expect(result).toContain("# Sample Markdown");
  });

  it("copies a .mdc file with header after frontmatter", async () => {
    const srcPath = path.resolve(__dirname, "../fixtures/sample.mdc");
    const destPath = path.join(tmpDir, "sample.mdc");

    await copyFrameworkFile(srcPath, destPath, "mdc");

    const result = await readFile(destPath, "utf8");
    // Frontmatter should come first
    expect(result.startsWith("---")).toBe(true);
    // Header should appear after frontmatter
    const afterFrontmatter = result.indexOf("---\n", 3);
    const headerPos = result.indexOf(MARKDOWN_HEADER);
    expect(headerPos).toBeGreaterThan(afterFrontmatter);
  });

  it("copies LICENSE without header", async () => {
    const srcPath = path.resolve(__dirname, "../fixtures/LICENSE");
    const destPath = path.join(tmpDir, "LICENSE");

    await copyFrameworkFile(srcPath, destPath, "none");

    const original = await readFile(srcPath, "utf8");
    const result = await readFile(destPath, "utf8");
    expect(result).toBe(original);
  });

  it("copies .sh file with header after shebang", async () => {
    const srcPath = path.resolve(__dirname, "../fixtures/sample.sh");
    const destPath = path.join(tmpDir, "sample.sh");

    await copyFrameworkFile(srcPath, destPath, "shell");

    const result = await readFile(destPath, "utf8");
    const lines = result.split("\n");
    expect(lines[0]).toBe("#!/usr/bin/env bash");
    expect(lines[1]).toBe(SHELL_HEADER.trimEnd());
  });

  it("preserves executable permission", async () => {
    const srcPath = path.resolve(__dirname, "../fixtures/sample.sh");
    // Ensure source is executable
    await chmod(srcPath, 0o755);

    const destPath = path.join(tmpDir, "sample.sh");
    await copyFrameworkFile(srcPath, destPath, "shell");

    const destStat = await stat(destPath);
    expect(destStat.mode & 0o111).not.toBe(0);
  });

  it("creates intermediate directories", async () => {
    const srcPath = path.resolve(__dirname, "../fixtures/sample.md");
    const destPath = path.join(tmpDir, "deep", "nested", "sample.md");

    await copyFrameworkFile(srcPath, destPath, "markdown");

    const result = await readFile(destPath, "utf8");
    expect(result).toContain("# Sample Markdown");
  });
});
