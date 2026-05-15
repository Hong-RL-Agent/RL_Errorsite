# SKY-LOGISTICS Regression Catalog

이 문서는 SKY-LOGISTICS 웹사이트와 백엔드 시뮬레이터에 포함된 오류 및 회귀 시나리오를 정리합니다.

## Runtime Ports

- Frontend dashboard: `http://localhost:9050`
- Backend API: `http://localhost:9051`
- Regression list: `GET /api/regressions`
- Fleet telemetry: `GET /api/fleet`
- Trigger regression: `POST /api/regressions/{id}/trigger`
- Reset lab: `POST /api/regressions/reset`

## Included Error Scenarios

| No. | Trigger ID | Error / Regression | Severity | Simulated Symptom |
| --- | --- | --- | --- | --- |
| 1 | `interrupt-storm` | Virtualization Driver Interrupt Storm | Critical | Sensor data overflow generates a virtual interrupt storm, raises CPU steal, increases context switching, and makes UI telemetry lag. |
| 2 | `kernel-lockup` | Kernel High Lockup | Critical | Route calculation holds a simulated spinlock for about 1 second, causing command latency to spike. |
| 3 | `cache-bloat` | cgroup Memory Limit & Cache Bloat | Critical | Map tile cache aggressively allocates dirty cache pages, increasing memory pressure and direct reclaim risk. |
| 4 | `numa-paradox` | NUMA Auto-balancing Paradox | Warning | Regional data access gets an artificial 100ms latency penalty to mimic bad page migration between NUMA nodes. |
| 5 | `pid-limit` | Container PID Limit Fork Failure | Critical | Fleet scaling exhausts a simulated PID/thread budget and emits a `Resource temporarily unavailable` style failure. |
| 6 | `journal-delay` | File System Journaling Delay | Warning | Flight log writer simulates a 2 second journal commit stall, increasing I/O wait and backend latency. |
| 7 | `gpu-launch-delay` | GPU Kernel Launch Delay | Warning | Obstacle avoidance simulation waits 150ms between CPU dispatch and GPU execution start. |
| 8 | `bandwidth-saturation` | Memory Bandwidth Saturation | Critical | Multiple streaming workers perform heavy memory copies, slowing command-and-control latency by roughly 3x. |
| 9 | `pcie-p2p` | GPU PCIe P2P Topology Mismatch | Warning | Drone map render path reports `Non-optimal P2P topology detected` and simulates slow host-staged GPU transfer. |
| 10 | `compaction-storm` | Memory Compaction Storm | Critical | High-order video buffer allocations create jitter similar to a page compaction storm. |
| 11 | `thundering-herd` | Thundering Herd Problem | Critical | A new delivery event wakes 50 workers at once, creating mutex contention and a context-switch spike. |

## UI Representation

The frontend dashboard shows these errors through:

- Real-time Alerts panel
- Regression Control Matrix
- System Resource Monitors
- KPI strip for fleet health, P99 latency, CPU steal, and active alerts
- SVG/CSS real-time map simulation with drone beacons and regression zones

When a regression is triggered, the UI updates:

- Alert status changes from `standby` to `active`
- Impact latency is displayed in milliseconds
- `systemLog` message appears in the alert feed
- Telemetry values such as CPU load, CPU steal, memory pressure, I/O wait, GPU queue, and context switch rate increase

## Container-Level Failure Settings

Docker Compose includes limits intended to support container-level regression testing:

```yaml
mem_limit: 384m
memswap_limit: 384m
pids_limit: 64
```

Backend environment settings:

```yaml
SKY_STRESS_TILE_CACHE_MB: "220"
SKY_STRESS_PID_LIMIT: "28"
JAVA_TOOL_OPTIONS: "-XX:MaxRAMPercentage=75 -XX:+UseContainerSupport"
```

These settings are used by the simulated cache bloat and PID-limit scenarios.

## Implementation Location

Main backend implementation:

```text
backend/src/main/java/lab/skylogistics/service/SystemStressService.java
```

API controller:

```text
backend/src/main/java/lab/skylogistics/api/StressController.java
```

Frontend dashboard:

```text
frontend/src/main.jsx
frontend/src/styles.css
```

Docker configuration:

```text
docker-compose.yml
```

## Safety Note

The scenarios are controlled lab simulations. They do not install kernel modules or intentionally damage the host system. The implementation creates observable symptoms through bounded delays, memory allocation, lock contention, synthetic telemetry, and Docker resource limits.
