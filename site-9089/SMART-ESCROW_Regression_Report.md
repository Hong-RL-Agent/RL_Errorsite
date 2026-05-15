# SMART-ESCROW Regression Report

Project port: `http://localhost:9089`

This report documents intentionally vulnerable browser-native and UX defect patterns embedded for PPO agent training. These are not production-safe behaviors.

| ID | Defect Pattern | Implementation Location | Expected Agent Signal |
| --- | --- | --- | --- |
| 1 | BFCache restore pollution | `frontend/src/App.tsx` `pageshow` handler merges stale `localStorage.session` into current state | Back navigation shows stale escrow values mixed with live API values |
| 2 | MIME detection failure crash risk | `frontend/src/App.tsx` upload handler and `backend/EscrowService.inspectUpload` trust declared MIME | PDF extension with non-PDF MIME emits mismatch verdict |
| 3 | Virtual keyboard resize omission | `frontend/src/App.tsx` approval memo input has no `visualViewport` handling | Mobile keyboard can cover the focused input |
| 4 | Invalid ARIA transition | ARIA button sets `aria-busy=true` with `aria-live=off` | Screen reader announcements can stall or go silent |
| 5 | SPA focus unmanaged | `changeRoute` mutates history without focusing route heading/main | Keyboard navigation remains on previous trigger |
| 6 | Touch and pointer duplicate handling | Approval button uses both `onTouchStart` and `onPointerUp` | One tap can increment approval twice |
| 7 | Visibility API sync omission | `visibilitychange` records signal but does not refresh snapshot on visible | Tab return keeps stale data |
| 8 | Split view layout collapse | Dense dashboard panels depend on viewport width without container queries for all controls | Narrow multi-window mode can compress panels and terminal |
| 9 | Local storage collision | Generic `session` and `notify` keys are used | Same-domain sub apps can overwrite SMART-ESCROW state |
| 10 | Service worker stale cache | `frontend/public/sw.js` uses immutable stale shell cache with no cleanup | Old app shell or script can persist indefinitely |
| 11 | Web Push permission mismatch | App stores `notify=true` regardless of actual `Notification.permission` | UI reports enabled while browser permission can be denied/default |

## Port And Isolation Checks

- External browser entrypoint is fixed at `http://localhost:9089`.
- Docker Compose exposes only `9089:80` for the frontend gateway.
- Nginx proxies `/api/` to the internal Spring Boot service.
- React API calls use relative `/api/...` paths only.
- Spring Boot CORS allows `http://localhost:9089`.
- Vite dev server uses port `9089` with a `/api` proxy entry.

## Regression Goal

The PPO agent should learn to identify hidden browser-state inconsistencies, accessibility state failures, duplicated input events, stale cache behavior, permission divergence, and viewport-driven layout instability in a realistic fintech escrow interface.
