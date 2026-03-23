// ControlPlane AI — File copy with header injection

import { readFile, writeFile, mkdir, chmod, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MARKDOWN_HEADER, SHELL_HEADER, type HeaderType } from "../constants.js";

export function getFrameworkDir(): string {
  const thisFile = fileURLToPath(import.meta.url);
  // In dist: dist/lib/files.js → go up to cli/, then into framework/
  // At runtime from ts-node: src/lib/files.ts → go up to cli/, then into framework/
  return path.resolve(path.dirname(thisFile), "..", "..", "framework");
}

export function injectHeader(content: string, headerType: HeaderType): string {
  switch (headerType) {
    case "markdown":
      return MARKDOWN_HEADER + content;

    case "mdc": {
      // Insert after YAML frontmatter if present
      if (!content.startsWith("---")) {
        return MARKDOWN_HEADER + content;
      }
      const closingIndex = content.indexOf("\n---", 3);
      if (closingIndex === -1) {
        return MARKDOWN_HEADER + content;
      }
      let insertPos = closingIndex + 4; // "\n---".length
      if (content[insertPos] === "\n") {
        insertPos += 1;
      }
      return content.slice(0, insertPos) + MARKDOWN_HEADER + content.slice(insertPos);
    }

    case "shell": {
      // Insert after shebang if present
      const lines = content.split("\n");
      if (lines[0]?.startsWith("#!")) {
        return lines[0] + "\n" + SHELL_HEADER + lines.slice(1).join("\n");
      }
      return SHELL_HEADER + content;
    }

    case "none":
      return content;
  }
}

export async function copyFrameworkFile(
  srcPath: string,
  destPath: string,
  headerType: HeaderType,
): Promise<void> {
  const content = await readFile(srcPath, "utf8");
  const injected = injectHeader(content, headerType);

  await mkdir(path.dirname(destPath), { recursive: true });
  await writeFile(destPath, injected, "utf8");

  // Preserve executable permission
  const srcStat = await stat(srcPath);
  const isExecutable = (srcStat.mode & 0o111) !== 0;
  if (isExecutable) {
    await chmod(destPath, srcStat.mode);
  }
}
