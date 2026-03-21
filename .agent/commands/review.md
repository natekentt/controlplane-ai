# Command: /review

**Intent**: Review staged changes or a pull request against all domain skills and produce structured feedback.

## Execution Steps

1. **Identify the target.** Determine what to review:
   - If changes are staged: run `git diff --cached` to get the diff.
   - If a PR number or URL is provided: fetch the PR diff.
   - If neither: run `git diff` to review unstaged changes.
2. **Load domain skills.** Read the following skills to evaluate against:
   - [Code Quality](../skills/code-quality.md)
   - [Testing](../skills/testing.md)
   - [Security](../skills/security.md)
   - [Error Handling](../skills/error-handling.md)
   - [Documentation](../skills/documentation.md)
3. **Apply Code Review skill.** Use the review output format defined in the [Code Review](../skills/code-review.md) skill to produce structured feedback.
4. **Evaluate against each domain skill.** For each domain skill, check whether the changes adhere to its rules. Reference specific rule numbers in feedback.
5. **Produce verdict.** End with a clear Approve, Request Changes, or Comment verdict.

## Constraints

- Always use the structured review output format — no freeform reviews.
- Reference specific skill rules when flagging issues (e.g., "Security Rule 3").
- Security issues are always blockers, regardless of severity assessment.
- Missing tests for new features or bug fixes are always blockers.

## Dependencies

- **Skill**: [Code Review](../skills/code-review.md) — review format and process
- **Skill**: [Code Quality](../skills/code-quality.md) — quality standards
- **Skill**: [Testing](../skills/testing.md) — test coverage
- **Skill**: [Security](../skills/security.md) — security posture
- **Skill**: [Error Handling](../skills/error-handling.md) — error handling
- **Skill**: [Documentation](../skills/documentation.md) — documentation completeness
