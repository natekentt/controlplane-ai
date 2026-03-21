# Skill: Security

## Purpose

Applies whenever an agent writes code that handles user input, authentication, data storage, or external communication. Ensures code is secure by default without requiring specialized security expertise.

## Rules

1. **Validate all input at system boundaries.** Every value entering the system — HTTP requests, CLI args, file uploads, message queues — must be validated before use. Trust nothing from the outside.
2. **No secrets in code.** API keys, passwords, tokens, and connection strings belong in environment variables or secret managers, never in source files or commit history.
3. **Parameterized queries only.** Never concatenate user input into SQL, NoSQL, LDAP, or OS commands. Use parameterized queries or prepared statements without exception.
4. **Least privilege by default.** Grant the minimum permissions required. Database users should only access the tables they need. API tokens should have the narrowest scopes possible.
5. **Encode output for its context.** HTML output gets HTML-encoded. URLs get URL-encoded. JSON gets JSON-encoded. Context-appropriate encoding prevents injection.
6. **Authenticate then authorize.** Every request to a protected resource must first verify identity (authn), then verify permission (authz). Never skip authorization because authentication passed.
7. **Hash passwords with modern algorithms.** Use bcrypt, scrypt, or argon2. Never MD5, SHA-1, or plain SHA-256 for passwords. Use the library's default cost factor unless you've benchmarked.
8. **Fail closed.** When a security check fails or throws, deny access. Never default to permissive behavior on error.
9. **Log security events, not secrets.** Log failed auth attempts, permission denials, and validation failures. Never log passwords, tokens, session IDs, or PII.
10. **Keep dependencies updated.** Known vulnerabilities in dependencies are a common attack vector. Use automated tools to flag outdated packages.

## Examples

### Good

```
// Parameterized query, input validated at boundary
function getUser(request):
    userId = validate(request.params.id, isPositiveInt)
    return db.query("SELECT * FROM users WHERE id = ?", [userId])
```

### Bad

```
// SQL injection, no validation, secret in code
API_KEY = "sk-live-abc123"

function getUser(request):
    return db.query("SELECT * FROM users WHERE id = " + request.params.id)
// — Concatenated input into SQL, hardcoded secret, no input validation
```

## Exceptions

- **Exception to Rule 1**: Internal service-to-service calls within a trusted network boundary may skip input validation if both services are under your control and the data has already been validated upstream. Document this trust assumption.
- **Exception to Rule 3**: Full-text search engines with their own query DSL (e.g., Elasticsearch) may require constructed queries, but input should still be escaped using the engine's built-in sanitization.

## References

- [Error Handling](error-handling.md) — Rule 8 here relates to fail-fast error handling
- [Skill Meta-Template](../templates/skill.md)
