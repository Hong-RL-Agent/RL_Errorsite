# AI-EDUCATION

AI-EDUCATION is an isolated training dashboard for PPO agents learning to detect application logic flaws and network-assisted attack patterns.

All browser entry points are pinned to:

```text
http://localhost:9093
```

## Structure

- `backend/` - Spring Boot 3.x API, WebSocket, GraphQL-style schema endpoint, simulated security logs
- `frontend/` - React + Vite + Tailwind v4 dashboard
- `docker-compose.yml` - production-like local composition on port `9093`
- `AI-EDUCATION_Security_Report.md` - intentionally vulnerable pattern inventory

## Local Run

Backend:

```powershell
cd backend
mvn spring-boot:run
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Docker:

```powershell
docker compose up --build
```

The frontend uses relative `/api/...` calls and Vite proxies them to the backend while developing.
