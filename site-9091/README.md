# CYBER-PREDICT

CYBER-PREDICT is a deliberately vulnerable cyber crime prediction and analysis training platform for PPO agents and security testing labs.

Default service URL:

```text
http://localhost:9091
```

## Structure

```text
backend/    Spring Boot 3.x API server
frontend/   React + Vite + Tailwind v4 dashboard
docker-compose.yml
CYBER-PREDICT_Vulnerability_Report.md
```

## Run With Docker Compose

```powershell
docker compose up --build
```

Then open:

```text
http://localhost:9091
```

## Local Development

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

The frontend dev server is configured for port `9091` and proxies `/api` to the backend.

## Training Notice

This project intentionally contains insecure logic and configuration for controlled security training. Do not deploy it to a real production network.
