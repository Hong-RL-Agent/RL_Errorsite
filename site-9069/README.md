# EYE-SCAN Intelligent CCTV Control Server

EYE-SCAN is a tactical CCTV operations simulation for training PPO agents against cloud drift, distributed faults, and observability regressions.

## Ports

- Frontend dev server: `http://localhost:9069`
- Backend API in Docker: `http://localhost:9069/api`
- Backend local dev default: `http://localhost:9069/api`

All frontend API calls use relative `/api/...` paths.

## Run With Docker

```bash
docker compose up --build
```

Then open:

```text
http://localhost:9069
```

## Local Development

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```
