# CYBER-LAB Regression Report

## Scope

This project implements a local-only tactical command center for defensive operations training. Each anomaly is bounded by duration, memory size, or request scope so trainees can observe degraded telemetry without turning the service into an uncontrolled stress tool.

## Scenario Matrix

| # | Scenario | Implementation | Expected Signal | Safety Bound |
|---|---|---|---|---|
| 1 | Container quota throttling | `docker-compose.yml` limits backend to `cpus: "0.35"` and exposes a bounded heavy compute trigger. | API latency rises and CPU chart saturates under compute load. | Container-only CPU quota. |
| 2 | VM memory jitter | `memory-jitter` alternates bounded byte-array allocation and release. | Available memory and jitter line oscillate. | Allocation capped in service constants. |
| 3 | Ghost file handle | `ghost-file` opens a runtime log stream and marks it logically deleted while keeping the stream open. | Disk pressure persists after "delete" log. | Runtime volume only; stream can be closed by restart. |
| 4 | Steal time | `steal-time` starts short-lived CPU workers. | Main request latency slips while background workers run. | Worker duration and pool size are capped. |
| 5 | C-State wake delay | `c-state-delay` toggles a 10-20 ms pre-response delay in API filter logic. | Small baseline latency appears before responses. | Auto-expires after a short window. |
| 6 | Dirty page writeback | `dirty-page-writeback` performs chunked writes with intermittent pauses. | I/O wait and API pauses appear in logs. | Writes are bounded to the runtime volume. |
| 7 | Bad process termination | `bad-process-manager` simulates killing the core sampler before auxiliary tasks. | Monitoring freshness drops while support tasks remain. | No OS process is killed; only an internal sampler is disabled temporarily. |
| 8 | Hard lockup | `hard-lockup` holds the service lock for 1.5 seconds. | Dashboard refresh appears frozen. | Single synchronized critical section with fixed duration. |
| 9 | Journaling wait | `journal-wait` adds synthetic I/O integrity wait. | I/O wait metric spikes and log stream notes fsync pressure. | Sleep-based simulation only. |
| 10 | Fragmentation cleanup stall | `fragmentation-stall` creates and releases large objects, then requests GC. | CPU and memory pressure briefly spike. | Object count and size are capped. |
| 11 | Silent circuit breaker failure | `silent-circuit-breaker` returns HTTP 200 with `{}` from a dependency probe. | Logs show masked failure while HTTP status remains OK. | Isolated endpoint behavior; no external dependency calls. |

## Regression Checks

- Dashboard calls `GET /api/status` every 1.5 seconds and degrades visibly when latency increases.
- Scenario trigger buttons call `POST /api/scenarios/{id}/trigger`.
- Defense posture panel calls `POST /api/defense` and is reflected in backend state.
- Docker deployment exposes only the frontend on host port `9061`; the backend remains internal to the Compose network.

## Operational Notes

Run only in a local training sandbox. The anomaly logic is intentionally unrealistic in scale and should not be reused for production fault injection without stronger guardrails, authorization, and observability.
