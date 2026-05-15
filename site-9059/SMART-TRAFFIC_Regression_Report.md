# SMART-TRAFFIC Regression Report

This document details the 11 intentional defects embedded within the SMART-TRAFFIC urban traffic control system, designed to train and evaluate PPO agents in edge-case and failure scenarios.

## 1. Resource Allocation Limit Exceeded (HTTP 429)
**Description:** The system has an artificial API rate limit. Once an IP address makes more than 50 requests within a short window, the backend completely blocks access.
**Trigger:** Continuously refresh the dashboard or spam API calls (e.g., `GET /api/traffic/data`).
**Symptom:** The API returns `429 Too Many Requests` and the UI shows a service blocked message.

## 2. Data Center Region Isolation Error
**Description:** Simulates a scenario where the main region experiences an outage, and the backup region fails to synchronize data, resulting in a blank map and empty data state.
**Trigger:** Send a request to the backend with the header `X-Region-Failover: true`.
**Symptom:** The API returns an empty dataset (`[]`), causing the UI to render an empty screen or blank map without traffic data.

## 3. Response Timeout Delay
**Description:** The backend intentionally delays responses for critical endpoints, or the client is configured with an aggressive timeout, causing the connection to drop.
**Trigger:** Access the `GET /api/traffic/data` endpoint with the query parameter `?simulate_timeout=true`.
**Symptom:** The backend sleeps for 10 seconds. The frontend, which expects a quick response, times out and shows a connection error.

## 4. Excessive Static Loading Spinners
**Description:** Loading states are intentionally broken. Even after data has finished loading, the spinners remain on screen for an additional 3 seconds. Furthermore, every single component uses a different, uncoordinated spinner animation.
**Trigger:** Load any dashboard view.
**Symptom:** Disjointed UX with lingering spinners blocking interaction even when data is visible in the background.

## 5. Missing Data Export
**Description:** The data export feature is broken at the server level.
**Trigger:** Click the "Export CSV" button in the Data Table component.
**Symptom:** The frontend calls `GET /api/export`, which consistently returns a `500 Internal Server Error`. No file is downloaded.

## 6. Hardware Acceleration Layer Compositing Error
**Description:** A CSS rendering defect caused by conflicting compositing layers (`z-index` combined with `transform: translateZ(0)`).
**Trigger:** Open a marker popup on the interactive map.
**Symptom:** The popup flickers rapidly and disappears unpredictably as the browser struggles to composite the 3D transformed layers.

## 7. Canvas Error Without Hardware Acceleration
**Description:** The map canvas refuses to render if hardware acceleration is deemed unavailable or disabled.
**Trigger:** Toggle the "Hardware Acceleration" switch in the UI settings (simulated) or load the app in a browser with hardware acceleration disabled.
**Symptom:** The entire map area becomes a blank black or white void.

## 8. WebAssembly Memory Limit Crash
**Description:** Simulates a Wasm memory allocation failure during an intensive pathfinding operation.
**Trigger:** Click the "Calculate Optimal Routes (Heavy)" button.
**Symptom:** A massive `Uint8Array` allocation is triggered in JS, causing the browser tab to freeze, crash, or throw an `Out of Memory` error, bringing down the application.

## 9. WebGL Context Loss and No Recovery
**Description:** The map's WebGL context is intentionally lost, and the application lacks the logic to recover it.
**Trigger:** Click the "Simulate GPU Reset" button in the dev tools panel.
**Symptom:** The WebGL extension `WEBGL_lose_context` is invoked. The map freezes and becomes permanently unresponsive until a full page reload.

## 10. WebGPU Initialization Failure & Shader Compile Error
**Description:** The application attempts to initialize WebGPU with a deliberately malformed WGSL shader string.
**Trigger:** Load the advanced 3D vehicle tracking view.
**Symptom:** WebGPU throws a validation error (`Syntax error in WGSL shader`), crashing the initialization sequence and leaving the 3D view broken.

## 11. Storage Bucket Data Evaporation
**Description:** Simulates missing files in the cloud storage bucket for older log data.
**Trigger:** Attempt to fetch logs older than 7 days from the "System Logs" tab.
**Symptom:** The API requests `GET /api/logs?date=old_date` and returns `404 Not Found` with a "File Not Found" error from the simulated bucket.
