# ASTEROID-GUARD

Planetary defense command platform for security research simulations.

## Ports

All browser access is fixed to:

```text
http://localhost:9081
```

The frontend uses relative API paths such as `/api/telemetry`, and Vite proxies `/api` to the Spring Boot backend during local development.

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
npm run dev -- --host 0.0.0.0 --port 9081
```

Docker:

```powershell
docker compose up --build
```

