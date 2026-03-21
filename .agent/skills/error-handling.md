# Skill: Error Handling

## Purpose

Applies whenever an agent writes code that can fail — which is nearly all code. Ensures errors are explicit, informative, and handled consistently rather than silently swallowed or cryptically propagated.

## Rules

1. **Fail fast.** Detect invalid state as early as possible and stop. Don't let bad data propagate through multiple layers before surfacing an error.
2. **Use typed errors, not strings.** Errors should be distinguishable by type or code, not by parsing messages. `NotFoundError` over `throw "not found"`.
3. **Never swallow errors silently.** An empty catch block is a bug. At minimum, log the error. Prefer re-throwing or returning a typed failure.
4. **Errors should be actionable.** Include what went wrong, what the system expected, and what the caller can do about it. `"User 42 not found in region us-east"` over `"Error"`.
5. **Consistent API error shapes.** All API endpoints should return errors in the same structure. Pick one shape (e.g., `{ error: { code, message, details } }`) and use it everywhere.
6. **Distinguish recoverable from fatal.** Recoverable errors (invalid input, missing record) should be handled and communicated. Fatal errors (out of memory, corrupt state) should crash the process.
7. **Don't use exceptions for control flow.** Exceptions are for exceptional conditions. Expected cases (user not found, validation failed) should use return values or result types.
8. **Propagate context, don't destroy it.** When wrapping errors, preserve the original cause. `throw new ServiceError("payment failed", { cause: originalError })`.
9. **Clean up on failure.** If a function acquires resources (connections, file handles, locks), ensure they're released on both success and failure paths. Use try/finally or equivalent.
10. **Log at the boundary, handle at the source.** The layer that detects the error should handle or wrap it. The outermost layer (API handler, main loop) should log it. Avoid logging the same error at every layer.

## Examples

### Good

```
function processPayment(order):
    if not order.hasItems:
        return Err(ValidationError("order has no items"))

    result = paymentGateway.charge(order.total)
    if result.isErr:
        return Err(PaymentError("charge failed", cause: result.error))

    return Ok(receipt)
```

### Bad

```
function processPayment(order):
    try:
        paymentGateway.charge(order.total)
    catch e:
        pass  // silently swallowed
    return null  // caller has no idea what happened
// — Silent catch, null return, no context, original error discarded
```

## Exceptions

- **Exception to Rule 7**: Some languages (Python, Java) use exceptions as the idiomatic error mechanism. In those contexts, use exceptions but keep them typed and specific — avoid bare `except` or `catch Exception`.
- **Exception to Rule 3**: In top-level event handlers or fire-and-forget jobs, catching and logging without re-throwing is acceptable since there's no caller to propagate to.

## References

- [Code Quality](code-quality.md) — Rule 3 (nesting limits) encourages early returns that align with fail-fast
- [Security](security.md) — Rule 8 (fail closed) depends on robust error handling
- [Skill Meta-Template](../templates/skill.md)
