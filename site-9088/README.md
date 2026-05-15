# AUTO-TRUCK Control Center - Port 9088

Autonomous logistics control dashboard for data-integrity and client-fault regression training.

## Ports

- Frontend and public gateway: `http://localhost:9088`
- API calls from the browser use relative paths: `/api/...`
- Spring Boot container listens internally on `8080`

## Local Development

Backend:

```powershell
cd backend
./mvnw spring-boot:run
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

