// ControlPlane AI — SHA-256 hashing and manifest I/O

import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  MANIFEST_FILENAME,
  MARKDOWN_HEADER,
  SHELL_HEADER,
  type HeaderType,
} from "../constants.js";

export interface ManifestEntry {
  hash: string;
  headerType: HeaderType;
}

export interface Manifest {
  generator: string;
  version: number;
  generatedAt: string;
  cliVersion: string;
  files: Record<string, ManifestEntry>;
}

export function computeHash(content: string): string {
  return "sha256:" + createHash("sha256").update(content, "utf8").digest("hex");
}

export function stripHeader(content: string, headerType: HeaderType): string {
  switch (headerType) {
    case "markdown":
      if (content.startsWith(MARKDOWN_HEADER)) {
        return content.slice(MARKDOWN_HEADER.length);
      }
      return content;

    case "mdc": {
      // Header is inserted after YAML frontmatter
      const frontmatterEnd = findFrontmatterEnd(content);
      if (frontmatterEnd === -1) {
        // No frontmatter — treat like markdown
        if (content.startsWith(MARKDOWN_HEADER)) {
          return content.slice(MARKDOWN_HEADER.length);
        }
        return content;
      }
      const afterFrontmatter = content.slice(frontmatterEnd);
      if (afterFrontmatter.startsWith(MARKDOWN_HEADER)) {
        return content.slice(0, frontmatterEnd) + afterFrontmatter.slice(MARKDOWN_HEADER.length);
      }
      return content;
    }

    case "shell": {
      // Header is after the shebang line
      const lines = content.split("\n");
      if (lines.length >= 2 && lines[0].startsWith("#!")) {
        if (lines[1] === SHELL_HEADER.trimEnd()) {
          return [lines[0], ...lines.slice(2)].join("\n");
        }
      }
      // No shebang — header at start
      if (content.startsWith(SHELL_HEADER)) {
        return content.slice(SHELL_HEADER.length);
      }
      return content;
    }

    case "none":
      return content;
  }
}

export async function writeManifest(
  targetDir: string,
  files: Record<string, ManifestEntry>,
  cliVersion: string,
): Promise<void> {
  const manifest: Manifest = {
    generator: "controlplane-ai",
    version: 1,
    generatedAt: new Date().toISOString(),
    cliVersion,
    files,
  };
  const manifestPath = path.join(targetDir, ".agent", MANIFEST_FILENAME);
  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

export async function readManifest(targetDir: string): Promise<Manifest> {
  const manifestPath = path.join(targetDir, ".agent", MANIFEST_FILENAME);
  const content = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(content) as Manifest;
  if (typeof manifest.version !== "number" || !manifest.files || manifest.generator !== "controlplane-ai") {
    throw new Error("Corrupted manifest. Run `controlplane-ai init` to regenerate.");
  }
  return manifest;
}

function findFrontmatterEnd(content: string): number {
  if (!content.startsWith("---")) {
    return -1;
  }
  const closingIndex = content.indexOf("\n---", 3);
  if (closingIndex === -1) {
    return -1;
  }
  // Return position after the closing --- and its newline
  const afterClosing = closingIndex + 4; // "\n---".length
  if (content[afterClosing] === "\n") {
    return afterClosing + 1;
  }
  return afterClosing;
}
