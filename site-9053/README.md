# AGRO-CORE Smart Farm Control Server

AGRO-CORE is a research-grade smart farm control stack for PPO-agent training against low-level performance regression signals.

## Structure

- `backend/` - Spring Boot 3.x API and anomaly simulation services
- `frontend/` - React, Vite, Tailwind v4 dashboard
- `docker-compose.yml` - constrained runtime topology for realistic regression testing

## Quick Start

```bash
docker compose up --build
```

Frontend: http://localhost:9053  
Backend API: http://localhost:9054/api

## Local Development

```bash
cd frontend
npm install
npm run dev
```

```bash
cd backend
mvn spring-boot:run
```

The eleven systemic regressions are exposed through `/api/anomalies`, `/api/telemetry`, `/api/logs`, and `/api/anomalies/{id}/toggle`.
