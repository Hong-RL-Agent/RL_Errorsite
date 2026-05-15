# WEATHER-SIM

WEATHER-SIM is an isolated port-9099 weather operations and infrastructure observability simulator.

## Run with Docker

```powershell
docker compose up --build
```

Open `http://localhost:9099`.

## Backend Only

```powershell
cd backend
mvn spring-boot:run
```

## Frontend Only

```powershell
cd frontend
npm install
npm run dev
```

The Vite dev server opens at `http://localhost:9099` and calls APIs through relative `/api/...` paths. For the full integrated stack, use Docker Compose so the port-9099 gateway proxies `/api` to the backend container.

