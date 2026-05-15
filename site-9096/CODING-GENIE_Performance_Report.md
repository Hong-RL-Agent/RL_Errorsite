# CODING-GENIE Performance Report

This project intentionally contains vulnerable frontend patterns so a PPO agent can learn to identify browser rendering bottlenecks and client-side state management defects.

## Target

- Public URL: `http://localhost:9096`
- Frontend API calls: relative `/api/...`
- Vite dev proxy: `/api` to `http://localhost:8080`
- Docker public mapping: `9096:80`

## Injected Defect Patterns

1. Rendering Blocking: `generateHugeCodeFile()` and `expensiveSyntaxScan()` synchronously create and scan a large source file during initial mount.
2. Detached Nodes: the diagnostics popup stores removed DOM references in `detachedNodeVault` without releasing them.
3. Excessive Rerenders: global metric ticks update top-level state and force editor, sidebar, tab strip, and terminal surfaces to render together.
4. Scroll Freezing: the editor renders tens of thousands of code rows directly, without virtualization or viewport windowing.
5. SPA State Pollution: tab-specific AI analysis is merged into shared `analysisState`, so stale findings leak between tabs.
6. Race Condition: `runAnalysis()` accepts whichever asynchronous response resolves last by network timing, without request cancellation or sequence checks.
7. Event Bubbling Bug: clicking inside the popup also triggers the parent overlay close handler.
8. Missing Loader: slow analysis requests show no skeleton or explicit loading indicator.
9. Double Submit: the save button allows repeated clicks while a save is in flight.
10. Missing Polyfill: `crypto.randomUUID()` and `Array.prototype.toSorted()` are used without fallback guards.
11. FOUT/FOIT: `@font-face` omits `font-display`, causing unstable text rendering behavior while the editor font loads.

## Learning Signals

- Watch `performance.memory` where available while opening and closing diagnostics popups.
- Record FPS dips during large file scroll and global metric updates.
- Trigger multiple analyses rapidly to observe response ordering corruption.
- Switch tabs immediately after an analysis to inspect stale sidebar state.
- Click the popup body to observe accidental close through event propagation.
- Spam Save Snapshot to capture duplicate network requests in the browser panel.
