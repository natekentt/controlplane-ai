# Skill: Code Review

## Purpose

Applies when reviewing code changes — staged diffs, pull requests, or code presented for feedback. Produces structured, actionable review output that evaluates changes against all domain skills.

## Rules

1. **Use structured output.** Every review follows the format: Summary, Blockers, Suggestions, Nits, Verdict. No freeform prose reviews.
2. **Missing tests are a blocker.** If a feature or bug fix has no corresponding test, flag it as a blocker, not a suggestion.
3. **Categorize feedback by severity.** Blocker = must fix before merge. Suggestion = should fix, improves quality. Nit = optional, stylistic preference.
4. **Review against domain skills.** Check changes against Code Quality, Testing, Security, Error Handling, and Documentation standards. Reference specific rules (e.g., "violates Code Quality Rule 3").
5. **Comment on behavior, not style.** Unless style causes ambiguity or violates project conventions, don't flag it. Formatters handle style.
6. **Flag security issues as blockers.** SQL injection, hardcoded secrets, missing auth checks — these are always blockers regardless of context.
7. **Verify error paths.** Check that error cases are handled, not just the happy path. Missing error handling is a common blind spot.
8. **Check for scope creep.** Changes should do what the PR description says, nothing more. Unrelated refactors or feature additions should be split out.
9. **Acknowledge good patterns.** When the code does something well — clean abstractions, thorough tests, good error handling — note it briefly. Reviews shouldn't be exclusively negative.
10. **Provide a clear verdict.** End every review with one of: Approve, Request Changes, or Comment. Don't leave the author guessing.

## Review Output Format

```
## Summary
One or two sentences describing what the changes do.

## Blockers
- [B1] Description. (Reference: Skill Rule N)

## Suggestions
- [S1] Description. (Reference: Skill Rule N)

## Nits
- [N1] Description.

## Positives
- Brief note on what's done well.

## Verdict
Approve | Request Changes | Comment
```

## Examples

### Good

```
## Summary
Adds rate limiting middleware to the API gateway.

## Blockers
- [B1] No tests for rate limit exceeded scenario. (Testing Rule 1)
- [B2] Rate limit config uses hardcoded IP, leaks to source. (Security Rule 2)

## Suggestions
- [S1] Extract rate limit config into environment variable. (Code Quality Rule 4)
- [S2] Add documentation for the new X-RateLimit headers. (Documentation Rule 1)

## Nits
- [N1] Consider renaming `rl` to `rateLimiter` for clarity.

## Positives
- Clean separation of middleware from route handlers.

## Verdict
Request Changes
```

### Bad

```
"Looks good to me! Just a few minor things... maybe add some tests?"
// — No structure, vague feedback, no severity, no verdict, no skill references
```

## Exceptions

- **Exception to Rule 2**: Prototype or spike PRs explicitly labeled as such may defer tests. The reviewer should note that tests are expected before the code moves to production.
- **Exception to Rule 1**: Informal code walkthroughs or pair programming sessions don't require the full structured format.

## References

- [Code Quality](code-quality.md) — primary quality standard
- [Testing](testing.md) — test coverage evaluation
- [Security](security.md) — security posture review
- [Error Handling](error-handling.md) — error path verification
- [Documentation](documentation.md) — documentation completeness
- [Skill Meta-Template](../templates/skill.md)
