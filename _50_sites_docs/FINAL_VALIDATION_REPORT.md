# Final Validation Report

- Sites: **50** (`error-site-v02..error-site-v51`)
- Intentional bug instances: **390**
- Unique source IDs: **390 / 390**
- Duplicate source IDs: **0**
- Per-site bug counts: **10 sites × 7 bugs, 40 sites × 8 bugs**

## Vulnerability-family distribution

Each of the 13 vulnerability families is assigned **30 times** across the 50 sites:

- `IDOR`
- `vertical-privilege-escalation`
- `permission-drift`
- `reflected-xss`
- `stored-xss`
- `sql-injection`
- `system-info-disclosure`
- `session-fixation`
- `logout-reuse`
- `security-headers`
- `price-tampering`
- `idempotency`
- `async-no-feedback`

## Category distribution

- `access-control`: 90
- `input-data`: 120
- `session-config`: 90
- `business-logic`: 60
- `availability`: 30

## Structural/documentation verification

`verify_sites.py` result: **PASS — 50 sites, no structural/documentation errors found.**

Checks include:

- required frontend/backend structure
- `README.md`, `BUGS.md`, `bug_catalog.json`, `site_meta.json`
- test-account / run / reset documentation
- JSON validity and source-ID consistency
- required reproduction/oracle/evidence fields
- backend JavaScript syntax (`node --check`)

## Runtime verification

### Manual full-stack smoke test

`error-site-v02` was executed by the user on Windows with **Node.js 24.21.0**:

- backend started successfully
- Vite frontend started successfully
- login succeeded with the provided test account
- main item UI rendered
- cart action succeeded and the cart count changed from `0 → 1`

### Automated representative backend/bug-fixture test

Five representatives were executed across the five archetypes:

- `error-site-v02` — Commerce
- `error-site-v12` — Booking
- `error-site-v22` — Community
- `error-site-v32` — Dashboard
- `error-site-v42` — Learning

Result: **PASS — 5 representative sites / 40 assigned bug-family runtime checks.**

Collectively these five sites cover **all 13 vulnerability families**. Each assigned family was exercised through its local test endpoint/fixture and matched the intended buggy behavior.

Note: the automated representative run in the packaging environment validated backend runtime and bug fixtures. Frontend build was not re-run there because the cached npm dependencies were Windows-platform artifacts; frontend runtime was instead confirmed on the user's actual Windows/Node 24 environment for `error-site-v02`. The final package excludes `node_modules`, so a clean `npm install` on the target machine is expected before running each site.

## Diversity check

- `frontend/src/App.jsx`: **50 unique file hashes / 50 sites**
- `backend/server.js`: **50 unique file hashes / 50 sites**
- UI styling is intentionally template-based: **5 archetype-level CSS variants**, with manifest-driven theme/layout/DOM/content/error combinations across sites.

This follows the team instruction that all 50 sites do **not** need to be completely different, while theme, UI/DOM, function flow, error placement, and error combinations should vary to a practical degree.

## Packaging hygiene

- `node_modules` excluded
- frontend `dist` excluded
- generated SQLite/DB files excluded
- `.gitignore` retained in every site
- site code is intended for local/isolated QA-training fixtures
