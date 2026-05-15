# AI-TRANS Regression Report

Scope: browser API and security policy defect simulation for `http://localhost:9087`.

## Network Isolation

- Public entrypoint: `http://localhost:9087`
- Frontend API calls use relative paths such as `/api/translate`, `/api/policy/logs`, and `/api/session/third-party`.
- Vite development proxy forwards `/api` and `/ws` to the Spring Boot backend.
- Docker Compose publishes only frontend port `9087`; backend is isolated on the internal Docker network.

## Simulated Defect Patterns

1. **WebAudio autoplay blocked**
   - Frontend attempts to start `AudioContext` on initial render without user activation.
   - Expected signal: `AudioContext` remains `suspended` and policy log records autoplay blocking.

2. **Clipboard permission denial mishandled**
   - The copy action calls `navigator.clipboard.writeText` asynchronously with incomplete permission fallback.
   - Expected signal: denied permission is logged but UI continues with a stale success-like state risk.

3. **Geolocation freeze from missing timeout**
   - `getCurrentPosition` is invoked without a `timeout` option.
   - Expected signal: pending geolocation state can remain unresolved indefinitely.

4. **IntersectionObserver target loss**
   - Observer continues watching a node after the simulated target is removed.
   - Expected signal: orphan target warning is logged after DOM removal.

5. **FOUT/FOIT multilingual font delay**
   - Large multilingual text area uses web font loading with `font-display: block`.
   - Expected signal: late font readiness log and visible text rendering delay risk.

6. **Dark-mode white flash**
   - Initial theme state is applied after React mount rather than before first paint.
   - Expected signal: flash-risk log during boot.

7. **Strict CSP inline script blocked**
   - Backend emits a strict `Content-Security-Policy` header without `unsafe-inline`.
   - Expected signal: inline script simulation is blocked and reported to the terminal.

8. **ITP third-party cookie session loss**
   - Session simulation endpoint issues `SameSite=None` cookie metadata for a cross-site scenario.
   - Expected signal: dashboard reports cookie eviction/session loss risk.

9. **Frequent CORS preflight latency**
   - Client sends repeated custom-header POST requests to `/api/policy/preflight`.
   - Expected signal: OPTIONS/preflight count grows in policy terminal.

10. **Browser extension script variable collision**
   - Frontend intentionally probes a global variable that may be overwritten by extensions.
   - Expected signal: collision warning when global namespace is polluted.

11. **WebSocket reconnect storm**
   - Client reconnects immediately on close without exponential backoff.
   - Expected signal: rapid reconnect attempts and backend WebSocket failure logs.

## Regression Acceptance Signals

- `rg "906[2-6]|907[0-9]|908[0-6]"` returns no legacy project port references.
- All browser-facing URLs resolve through `http://localhost:9087`.
- API calls in frontend source use relative `/api/...` paths.
- CSP/CORS/WebAudio/Clipboard/Geo/WebSocket events appear in the AI-TRANS network policy terminal.

