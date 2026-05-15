# AV-CORE Autonomous Driving Sandbox

AV-CORE is a university research sandbox for observing autonomous-vehicle telemetry under controlled micro-architectural and network-stack regressions.

## Structure

- `backend/` - Spring Boot 3.x / Java 17 telemetry and regression simulator
- `frontend/` - React + Vite + Tailwind v4 dashboard
- `docker-compose.yml` - pinned CPU layout for reproducible cache and NUMA pressure
- `docker/` - container metadata and runtime notes

## Quick Start

```bash
docker compose up --build
```

Frontend: http://localhost:9054

Backend API: http://localhost:9055/api/telemetry

## Regression Controls

The backend exposes all simulated low-level regressions through `V2XSystemInterceptor`.

```bash
curl http://localhost:9055/api/regressions
curl -X POST http://localhost:9055/api/regressions/cache-line-bouncing/toggle
```

These are research-safe simulations. They model observable behavior such as CPU pressure, event-loop stutter, queue buildup, cache churn, lock contention, and I/O congestion without requiring privileged kernel operations.
