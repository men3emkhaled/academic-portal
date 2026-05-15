# Skill: security-guard

## Instructions
- NEVER hardcode secrets (API keys, tokens, passwords, connection strings) anywhere in source code, including comments and test files.
- USE environment variables + a secrets manager (AWS Secrets Manager, Vault, Doppler) — .env files are for local dev only and must be in .gitignore.
- SCAN every code change for: SQL Injection (parameterized queries only), XSS (output encoding + CSP headers), CSRF (SameSite cookies + CSRF tokens), IDOR (object-level authorization on every request).
- ENFORCE Least Privilege: every API key, DB user, and service account gets only the minimum permissions it needs to function.
- VALIDATE and sanitize ALL user input at the server — client-side validation is UX, not security.
- IMPLEMENT rate limiting, brute-force protection, and account lockout on all authentication endpoints.
- USE HTTPS everywhere. Never transmit sensitive data over HTTP, even on internal networks.
- HASH passwords with bcrypt (cost factor 12+) or Argon2id — never MD5, SHA1, or SHA256 for passwords.
- AUDIT third-party dependencies: run npm audit / pip-audit on every build. Remove unused dependencies.
- LOG security events (failed logins, permission denials, unusual access patterns) — never log passwords or tokens.
- IMPLEMENT Security Headers: Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options.
- DESIGN for Zero Trust: verify every request, regardless of where it originates (even inside the network).

## Triggers
- API Protection
- Security Audit
- Leak Prevention
