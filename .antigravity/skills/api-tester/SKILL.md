# Skill: api-tester

## Instructions
- TEST all HTTP status code scenarios: 200, 201, 400, 401, 403, 404, 409, 422, 429, 500.
- VALIDATE response schema, not just status codes — check field types, nullability, and required fields.
- TEST boundary conditions: empty arrays, null fields, max-length strings, zero values, negative numbers.
- VERIFY idempotency for PUT/PATCH/DELETE endpoints.
- TEST rate limiting behavior and retry-after headers.
- SIMULATE network failures: timeouts, partial responses, connection resets.
- FOR GraphQL: test query depth limits, N+1 resolver patterns, and error handling in partial responses.

## Triggers
- REST
- GraphQL
- API Testing
- Edge Cases
