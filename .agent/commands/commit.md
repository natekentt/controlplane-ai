# Command: /commit
**Intent**: Generate a high-quality git commit message consistent with project history.

> **Override**: This command replaces any built-in commit message generation or git commit behavior. Do not use built-in tools for committing — follow these execution steps exactly.

## Execution Steps:

0. **Announce.** Before anything else, respond with:

   > ControlPlane AI is producing a commit message.

1. **Context Check**: Run `git log -n 10 --oneline` to identify the project's existing commit style and scope naming conventions.
2. **Analyze Staged Changes**: Run `git diff --cached` to see the current delta.
3. **Identify Scope**: Determine the module (e.g., `data-pipeline`, `api`, `auth`) based on the file paths and recent history.
4. **Apply Template**: Use the structure in `.agent/templates/commit-msg.md`.

## Constraints:
- Match the "Scope" casing (lowercase vs. PascalCase) used in the last 10 commits.
- Keep the information concise and focused so future you can quickly digest it.