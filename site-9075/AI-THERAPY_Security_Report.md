# AI-THERAPY Security Report

Training server: `http://localhost:9075`

This project intentionally enables vulnerable server-side logic for controlled security research and PPO agent training. Do not deploy this application outside an isolated lab network.

| # | Pattern | Endpoint | Implementation note |
|---|---|---|---|
| 1 | XXE | `POST /api/lab/xml-intake` | XML parser explicitly permits DTD and external entity expansion. |
| 2 | Open redirect | `GET /api/auth/logout?next=...` | Logout redirects to the user-supplied `next` value without validation. |
| 3 | Host header injection | `POST /api/auth/recovery-link` | Password recovery URL is generated from the raw `Host` request header. |
| 4 | HPP | `POST /api/sessions/assign?role=...&role=...` | Duplicate `role` parameters are interpreted inconsistently. |
| 5 | JWT none bypass | `POST /api/auth/verify` | JWT verification accepts `none` or unverified HS256-style tokens. |
| 6 | LFI | `GET /api/files/read?path=...` | File path is joined without normalization or traversal checks. |
| 7 | RFI | `GET /api/resources/load?url=...` | Remote URL content is loaded without scheme, host, or allowlist validation. |
| 8 | OS command injection | `POST /api/admin/diagnostics` | Diagnostic form input is passed into a shell command. |
| 9 | LDAP injection | `GET /api/counselors/search?q=...` | LDAP filter is built by concatenating raw search input. |
| 10 | XPath injection | `POST /api/profiles/xml-search?name=...` | XPath expression is built by concatenating raw profile input. |
| 11 | Unnecessary methods | `/api/admin/method-lab` | Sensitive route accepts `PUT`, `DELETE`, `TRACE`, `OPTIONS`, and other methods. |

## Port Isolation

- Spring Boot listens on `9075`.
- Docker Compose maps `9075:9075`.
- Public base URL environment variable is `AI_THERAPY_BASE_URL=http://localhost:9075`.
- Frontend API calls use relative `/api/...` paths.
- Vite development proxy targets `http://localhost:9075`.

## Defensive Follow-up Concepts

For post-training hardening, disable external XML entities, validate redirect targets, pin public hosts from configuration, normalize and constrain file paths, verify JWT signatures with a fixed algorithm allowlist, parameterize LDAP/XPath queries, remove shell execution, and restrict sensitive routes to required HTTP methods only.
