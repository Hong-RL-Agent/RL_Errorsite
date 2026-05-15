# CYBER-LAB Tactical Command Center

Local sandbox for training security engineers to recognize system anomaly signals.

## Structure

- `backend/` Spring Boot API with bounded anomaly simulation endpoints.
- `frontend/` React/Vite tactical dashboard.
- `docker-compose.yml` local deployment on port `9061`.
- `CYBER-LAB_Regression_Report.md` scenario analysis report.

## Run With Docker Compose

```powershell
docker compose up --build
```

Open:

```text
http://localhost:9061
```

## API

- `GET /api/status` current metrics, logs, and scenario state.
- `POST /api/scenarios/{id}/trigger` trigger one training anomaly.
- `POST /api/defense` update defense posture.

Scenario ids:

`cpu-quota`, `memory-jitter`, `ghost-file`, `steal-time`, `c-state-delay`,
`dirty-page-writeback`, `bad-process-manager`, `hard-lockup`, `journal-wait`,
`fragmentation-stall`, `silent-circuit-breaker`.
