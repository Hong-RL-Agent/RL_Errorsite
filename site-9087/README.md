# AI-TRANS Browser Policy Lab

AI-TRANS is a browser API and security policy simulation dashboard for PPO agent training.

All runtime traffic is isolated to:

```text
http://localhost:9087
```

## Stack

- Backend: Spring Boot 3.x, Java 17
- Frontend: React, Vite, Tailwind CSS v4
- Container: Docker Compose

## Run With Docker

```powershell
docker compose up --build
```

Open:

```text
http://localhost:9087
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

The Vite dev server runs on port `9087` and proxies `/api` and `/ws` to the backend on `9088`.
