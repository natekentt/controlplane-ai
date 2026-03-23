import { mkdtemp, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { computeHash, stripHeader, writeManifest, readManifest } from "../../src/lib/hash.js";
import { MARKDOWN_HEADER, SHELL_HEADER, MANIFEST_FILENAME } from "../../src/constants.js";

describe("computeHash", () => {
  it("returns sha256-prefixed hash", () => {
    const hash = computeHash("hello");
    expect(hash).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("produces consistent hashes for same content", () => {
    expect(computeHash("test content")).toBe(computeHash("test content"));
  });

  it("produces different hashes for different content", () => {
    expect(computeHash("a")).not.toBe(computeHash("b"));
  });
});

describe("stripHeader", () => {
  it("strips markdown header", () => {
    const content = MARKDOWN_HEADER + "# Title\n\nBody\n";
    expect(stripHeader(content, "markdown")).toBe("# Title\n\nBody\n");
  });

  it("returns content unchanged if no markdown header present", () => {
    const content = "# Title\n\nBody\n";
    expect(stripHeader(content, "markdown")).toBe(content);
  });

  it("strips mdc header after frontmatter", () => {
    const frontmatter = "---\ndescription: test\n---\n";
    const body = "# Rule\n\nContent\n";
    const content = frontmatter + MARKDOWN_HEADER + body;
    expect(stripHeader(content, "mdc")).toBe(frontmatter + body);
  });

  it("strips mdc header when no frontmatter", () => {
    const content = MARKDOWN_HEADER + "# Rule\n\nContent\n";
    expect(stripHeader(content, "mdc")).toBe("# Rule\n\nContent\n");
  });

  it("returns mdc content unchanged if no header present", () => {
    const content = "---\ndescription: test\n---\n# Rule\n";
    expect(stripHeader(content, "mdc")).toBe(content);
  });

  it("strips shell header after shebang", () => {
    const content = "#!/usr/bin/env bash\n" + SHELL_HEADER + "echo hello\n";
    expect(stripHeader(content, "shell")).toBe("#!/usr/bin/env bash\necho hello\n");
  });

  it("strips shell header when no shebang", () => {
    const content = SHELL_HEADER + "echo hello\n";
    expect(stripHeader(content, "shell")).toBe("echo hello\n");
  });

  it("returns shell content unchanged if no header present", () => {
    const content = "#!/usr/bin/env bash\necho hello\n";
    expect(stripHeader(content, "shell")).toBe(content);
  });

  it("returns content unchanged for none type", () => {
    const content = "MIT License\n\nCopyright...\n";
    expect(stripHeader(content, "none")).toBe(content);
  });
});

describe("writeManifest / readManifest", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "cp-hash-test-"));
  });

  it("writes and reads a manifest round-trip", async () => {
    const files = {
      "AGENTS.md": { hash: "sha256:abc123", headerType: "markdown" as const },
      "LICENSE": { hash: "sha256:def456", headerType: "none" as const },
    };
    await writeManifest(tmpDir, files, "1.0.0");
    const manifest = await readManifest(tmpDir);

    expect(manifest.generator).toBe("controlplane-ai");
    expect(manifest.version).toBe(1);
    expect(manifest.cliVersion).toBe("1.0.0");
    expect(manifest.files).toEqual(files);
    expect(manifest.generatedAt).toBeDefined();
  });

  it("manifest includes all provided files", async () => {
    const files = {
      "a.md": { hash: "sha256:aaa", headerType: "markdown" as const },
      "b.md": { hash: "sha256:bbb", headerType: "markdown" as const },
      "c.sh": { hash: "sha256:ccc", headerType: "shell" as const },
    };
    await writeManifest(tmpDir, files, "1.0.0");
    const manifest = await readManifest(tmpDir);

    expect(Object.keys(manifest.files)).toHaveLength(3);
    expect(manifest.files["a.md"]).toBeDefined();
    expect(manifest.files["b.md"]).toBeDefined();
    expect(manifest.files["c.sh"]).toBeDefined();
  });

  it("throws on corrupted manifest", async () => {
    const manifestPath = path.join(tmpDir, ".agent", MANIFEST_FILENAME);
    await mkdir(path.join(tmpDir, ".agent"), { recursive: true });
    await writeFile(manifestPath, "not json", "utf8");

    await expect(readManifest(tmpDir)).rejects.toThrow();
  });

  it("throws on missing manifest", async () => {
    await expect(readManifest(tmpDir)).rejects.toThrow();
  });
});
