# SMART-ESCROW

Browser-native UX defect simulation platform for PPO agent training.

## Run with Docker

```powershell
docker compose up --build
```

Open:

```text
http://localhost:9089
```

## Architecture

- `backend/`: Spring Boot 3.x API with global CORS and simulated escrow/browser-state endpoints.
- `frontend/`: React + Vite + Tailwind v4 dashboard. All API calls use `/api/...`.
- `docker-compose.yml`: exposes only `localhost:9089`; Nginx serves the frontend and proxies `/api` to Spring Boot.

## Training Notes

The application intentionally includes browser-native and UX defect patterns. See `SMART-ESCROW_Regression_Report.md`.
