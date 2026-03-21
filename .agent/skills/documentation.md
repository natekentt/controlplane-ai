# Skill: Documentation

## Purpose

Applies when an agent creates or modifies public APIs, makes architectural decisions, or writes complex logic. Ensures documentation is useful, minimal, and kept in sync with code — not ceremonial.

## Rules

1. **Document public APIs.** Every public function, endpoint, or interface that other developers will call should have a brief description of its purpose, parameters, and return value.
2. **Don't document the obvious.** `getUser(id)` doesn't need a doc comment saying "gets a user by ID." Only document when the behavior isn't self-evident from the name and signature.
3. **Inline comments explain WHY, not WHAT.** Code shows *what* happens. Comments explain *why* — business rules, non-obvious constraints, workarounds, and tradeoffs.
4. **Use ADR format for architecture decisions.** Significant design choices (database selection, API style, auth approach) should be recorded as Architecture Decision Records: Context, Decision, Consequences.
5. **Keep docs next to code.** API docs live in the code (docstrings, JSDoc, etc.). Architecture docs live in the repo (`docs/` or `adr/`). Don't maintain a separate wiki that drifts from reality.
6. **README covers setup and orientation.** A project README should answer: what is this, how do I run it, how do I contribute. Not more.
7. **Update docs with code.** When you change behavior, update the corresponding documentation in the same commit. Stale docs are worse than no docs.
8. **Document error conditions.** For public APIs, document what errors can be returned and under what conditions. Callers need to know what to handle.
9. **Prefer examples over prose.** A single code example communicates more effectively than three paragraphs of explanation. Show the happy path and one error case.
10. **Don't add boilerplate comments.** No file-header comments, no changelog comments, no `// end of function` markers. These add noise without value.

## Examples

### Good

```
/// Transfers funds between accounts.
/// Returns InsufficientFunds if source balance is below amount + fee.
/// Fee is calculated as 1% of amount, minimum $0.50.
function transfer(sourceId, targetId, amount): Result<Receipt, TransferError>
```

### Bad

```
/// This function transfers money
/// @param sourceId the source id
/// @param targetId the target id
/// @param amount the amount
/// Created by: jdoe
/// Last modified: 2024-01-15
function transfer(sourceId, targetId, amount)
// — Restates the obvious, no error documentation, boilerplate metadata
```

## Exceptions

- **Exception to Rule 2**: Library code consumed by external teams should be thoroughly documented even when names seem self-evident — external consumers lack the context that internal developers have.
- **Exception to Rule 5**: Some organizations require centralized API documentation (e.g., OpenAPI specs served from a docs portal). In those cases, generate from code to avoid drift.

## References

- [Error Handling](error-handling.md) — Rule 8 here complements error handling Rule 4 (actionable errors)
- [Skill Meta-Template](../templates/skill.md)
