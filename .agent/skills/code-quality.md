# Skill: Code Quality

## Purpose

Applies whenever an agent writes or modifies code. Ensures output is readable, maintainable, and consistent regardless of language or framework.

## Rules

1. **Functions do one thing.** If you need the word "and" to describe what a function does, split it.
2. **Max 40 lines per function.** Extract helpers when a function grows beyond this. The threshold is a guideline — clarity matters more than the exact count.
3. **Max 3 levels of nesting.** Use early returns, guard clauses, or extraction to flatten deeply nested logic.
4. **No magic numbers or strings.** Extract literals into named constants. `MAX_RETRIES = 3` communicates intent; `3` does not.
5. **Composition over inheritance.** Prefer composing small, focused units over deep class hierarchies. Inherit only when there is a genuine "is-a" relationship.
6. **Name things for what they represent, not how they're implemented.** `usersByRegion` over `hashMap`, `isEligible` over `checkFlag`.
7. **DRY applies at three.** Two similar blocks are fine. Three means extract. Premature abstraction is worse than mild duplication.
8. **Functions should operate at one level of abstraction.** A function that mixes high-level orchestration with low-level string parsing is hard to follow. Separate the layers.
9. **Minimize mutable state.** Prefer pure transformations. When mutation is necessary, keep its scope as narrow as possible.
10. **Delete dead code.** Don't comment it out "for reference." That's what version control is for.

## Examples

### Good

```
// Named constant, single responsibility, flat structure
MAX_RETRIES = 3

function fetchWithRetry(url, attempts = MAX_RETRIES):
    if attempts <= 0:
        throw RetryExhausted(url)
    response = fetch(url)
    if response.ok:
        return response.data
    return fetchWithRetry(url, attempts - 1)
```

### Bad

```
// Magic number, nested conditionals, mixed abstraction levels
function getData(url):
    for i in range(3):
        response = fetch(url)
        if response.status == 200:
            data = response.body
            if data.type == "json":
                parsed = parse(data)
                if parsed.valid:
                    return parsed
    return null
// — Magic 3, deep nesting, mixed parsing with retry logic, silent null return
```

## Exceptions

- **Exception to Rule 2**: Generated code (e.g., protocol buffers, serialization) may exceed 40 lines when splitting would obscure the mapping.
- **Exception to Rule 7**: Performance-critical paths may warrant inlining even repeated logic if profiling shows measurable benefit.

## References

- [Error Handling](error-handling.md) — complements Rule 3 (early returns) and Rule 9 (state management)
- [Skill Meta-Template](../templates/skill.md)
