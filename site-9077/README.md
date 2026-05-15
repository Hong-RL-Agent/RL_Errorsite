# OCEAN-GUARD

국가 해양 오염 감시 센터용 클라우드 네이티브 보안 훈련 관제 플랫폼입니다.

## Port Isolation

- Public URL: `http://localhost:9077`
- Frontend API calls use relative paths under `/api`
- Vite proxies `/api`, `/graphql`, and `/ws` to the Spring Boot backend during development
- Docker Compose exposes only `9077` for the web entrypoint

## Local Development

```powershell
cd backend
mvn spring-boot:run
```

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:9077`.

## Docker

```powershell
docker compose up --build
```

The Compose stack includes the dashboard, Spring Boot API, a mocked Kubernetes API endpoint, and intentionally vulnerable lab-only infrastructure settings documented in `OCEAN-GUARD_Security_Report.md`.
