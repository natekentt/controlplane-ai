# Skill: Testing

## Purpose

Applies when writing new features, fixing bugs, or refactoring code. Ensures changes are verified by automated tests that are reliable, readable, and maintainable.

## Rules

1. **Every feature gets tests.** No feature is complete without at least one test that exercises its primary path.
2. **Every bug fix gets a regression test.** Write a test that reproduces the bug *before* fixing it. The test should fail on the old code and pass on the fix.
3. **Arrange / Act / Assert structure.** Each test has three clear sections: set up state, perform the action, check the result. Separate them visually.
4. **One assertion per behavior.** A test can have multiple `assert` statements, but they should all verify the same logical behavior. If you're testing two behaviors, write two tests.
5. **Mock externals, not internals.** Mock network calls, databases, file systems, clocks. Do not mock internal functions — that couples tests to implementation details.
6. **Tests must be deterministic.** No flaky tests. No reliance on timing, network, or shared mutable state. If a test fails, it should fail every time on that code.
7. **Test names describe the scenario, not the method.** `rejectsExpiredTokens` over `testValidate`. The name should read like a specification.
8. **Keep test data minimal.** Use only the fields relevant to the behavior under test. Large fixture objects obscure what matters.
9. **Don't test framework behavior.** Don't verify that your ORM saves to the database or that your HTTP library sends headers. Test *your* logic.
10. **Treat test code as production code.** Apply the same quality standards — no duplication, clear naming, no dead tests. Refactor test helpers when patterns emerge.
11. **Solicit edge cases from the user.** During test strategy planning (Medium+ tiers), explicitly ask the user to identify edge cases and failure scenarios from their domain knowledge. Agent-generated edge cases supplement but do not replace user-identified ones.

## Examples

### Good

```
test "rejects expired tokens":
    // Arrange
    token = createToken(expiresAt: pastDate)

    // Act
    result = validateToken(token)

    // Assert
    assert result.isErr
    assert result.error.type == "TOKEN_EXPIRED"
```

### Bad

```
test "test1":
    user = createFullUser(allFields)  // 30 fields when only "role" matters
    mock(internalHelper).returns(true)  // mocking internal implementation
    result = process(user)
    assert result != null  // vague assertion
    assert db.callCount == 1  // testing implementation, not behavior
// — Unclear name, excessive fixture, mocked internals, vague assertions
```

## Exceptions

- **Exception to Rule 5**: When testing integration between internal components (integration tests), mocking internals may be appropriate to isolate the boundary under test.
- **Exception to Rule 6**: Performance benchmarks and load tests are inherently non-deterministic. Mark them explicitly and run them separately from the main suite.

## References

- [Code Quality](code-quality.md) — Rule 10 here mirrors code quality principles
- [Skill Meta-Template](../templates/skill.md)
