# SMART-HOME-SEC

Training-grade smart home security operations dashboard.

## Run

```powershell
docker compose up --build
```

Open:

```text
http://localhost:9092
```

The frontend uses relative API paths such as `/api/devices`. Docker exposes only host port `9092`; Nginx serves the React build and proxies `/api` to the Spring Boot service.

## Local Layout

- `backend/`: Spring Boot 3.x API, CORS, simulated vulnerable endpoints
- `frontend/`: React + Vite + Tailwind v4 dashboard
- `storage/`: upload/download simulation storage
- `SMART-HOME-SEC_Security_Report.md`: vulnerability simulation report
