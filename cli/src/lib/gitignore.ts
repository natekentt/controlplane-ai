// ControlPlane AI — .gitignore section management

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  GITIGNORE_START_MARKER,
  GITIGNORE_END_MARKER,
  GITIGNORE_ENTRIES,
} from "../constants.js";

export async function ensureGitignore(targetDir: string): Promise<void> {
  const gitignorePath = path.join(targetDir, ".gitignore");
  const section = buildSection();

  let content: string;
  try {
    content = await readFile(gitignorePath, "utf8");
  } catch {
    // No .gitignore — create one
    await writeFile(gitignorePath, section + "\n", "utf8");
    return;
  }

  // Check if section markers already exist
  if (content.includes(GITIGNORE_START_MARKER)) {
    // Replace existing section
    const startIdx = content.indexOf(GITIGNORE_START_MARKER);
    const endIdx = content.indexOf(GITIGNORE_END_MARKER);
    if (endIdx === -1) {
      // Malformed — append end marker
      content =
        content.slice(0, startIdx) +
        section +
        "\n" +
        content.slice(startIdx + GITIGNORE_START_MARKER.length);
    } else {
      const afterEnd = endIdx + GITIGNORE_END_MARKER.length;
      content = content.slice(0, startIdx) + section + content.slice(afterEnd);
    }
  } else {
    // Append section
    const separator = content.endsWith("\n") ? "\n" : "\n\n";
    content = content + separator + section + "\n";
  }

  await writeFile(gitignorePath, content, "utf8");
}

function buildSection(): string {
  const lines = [GITIGNORE_START_MARKER, ...GITIGNORE_ENTRIES, GITIGNORE_END_MARKER];
  return lines.join("\n");
}
